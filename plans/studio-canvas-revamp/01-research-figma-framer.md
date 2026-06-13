# Research — How Figma / Framer / DevTools Do This

Distilled from primary sources (Figma eng blog, tldraw docs/source, Chrome DevTools docs, MDN, panzoom, Plasmic/Builder/Onlook write-ups). Citations at the end.

## 1. Infinite-canvas viewport model

**Two coordinate spaces.** Every canvas tool separates **screen space** (browser/DOM event pixels) from **world space** (the infinite content coordinate system, tldraw calls it "page space"). tldraw's camera is exactly three numbers: `x`, `y` (page-space position of the viewport's top-left) and `z` (zoom; `1` = 100%).

**The transform.** Uniform affine (translate + uniform scale, no rotation/shear). With a CSS `transform: translate(tx,ty) scale(s)` on the scene:

```
screen = world * s + t          // place content
world  = (screen - t) / s       // hit-test a pointer
```

Pick one convention and never mix it with the "camera top-left" convention — that mismatch is the #1 pan bug.

**Pointer → world.** Pointer events are viewport-relative; subtract the canvas container's `getBoundingClientRect()` offset first, then apply the inverse transform.

**Zoom-to-cursor (the one piece you must get right).** Invariant: the world point under the cursor stays under the cursor after zoom. Transform-agnostic recipe:

1. read cursor screen pos
2. convert to world **at old zoom**
3. set `newZoom = clamp(oldZoom * 2^(-deltaY*k), min, max)`
4. convert the same screen pos to world **at new zoom**
5. shift camera by `(worldOld - worldNew)`

This "convert before / convert after / shift by delta" form is more robust than the closed-form algebra.

**Rendering strategy — DOM, but translate to pan and `zoom` to scale (crisp).**
- **(A) DOM** — content stays *real DOM* (real iframe, real JS, real events, a11y intact). The only viable choice when hosting a live document. Two sub-flavours for the scale operation, and the choice is the whole ballgame:
  - **(A1) `transform: scale()`** — what tldraw/Framer/panzoom use. It rasterizes the layer once, then stretches the bitmap → **an iframe blurs above 100%**. **Rejected** — for a styling tool blur is unacceptable (see "Crisp zoom" below).
  - **(A2) `zoom: z`** — a *layout-time* scale (Blink/WebKit "effective zoom"; Firefox ≥126). The browser re-lays-out and **re-rasterizes at scale z → crisp at any zoom**. **This is what we use.**
- **(B) Canvas2D** — re-uploads geometry every frame; loses real DOM. Wrong for hosting a live site.
- **(C) WebGL/WASM tiling** — Figma's approach, justified only when *you* draw huge numbers of vector nodes. Massive complexity.

We host **one iframe + a few overlay boxes**, and the iframe must stay a live document. → **DOM with a hand-rolled camera, panning via `translate` and zooming via `zoom`.** Do not adopt tldraw as a dependency (it's a full vector editor); use it as the reference.

**Crisp zoom (NON-NEGOTIABLE — blur is rejected).** `transform: scale()` blurs an iframe because it stretches a cached bitmap; `zoom` does not, because it is a re-render. So:
- **Pan** = `transform: translate(x,y)` (translation never blurs).
- **Zoom** = CSS **`zoom: z`** applied to a wrapper around the iframe + overlay. MDN confirms `zoom` is layout-affecting (`getBoundingClientRect()` includes it), so overlay coordinate math stays clean.
- **Guaranteed-crisp fallback:** if any target engine rasterizes the *replaced* iframe element under a parent's `zoom`, push the zoom **inside** the iframe via Weaver — `document.documentElement.style.zoom = z`. That is unambiguously a re-render (crisp) and, because `zoom` doesn't change the layout-viewport width, the hosted app's media queries stay stable. **Validate both paths on target browsers in Phase 1 and pick per-engine.**
- Vectors stay crisp under `scale` only because they re-render; we get the same crispness by making *our* zoom a re-render (`zoom`) instead of a bitmap stretch.

**Other gotchas:** `transform-origin: 0 0` on the translate layer (default `50% 50%` breaks the math); `will-change: transform` on the *one* pan wrapper; snap the translate to integer device px to avoid sub-pixel softness on pan; watch `zoom` interaction with the app's `position: fixed`/sticky and scrollbars; set `pointer-events: none` on the iframe during an active pan so the hosted page doesn't swallow the gesture. Pin a min browser (recent Chrome/Edge/Safari, Firefox ≥126).

## 2. Interaction / tools

Standard vocabulary (Figma is the reference):
- **Select/cursor (`V`)** vs **hand/pan (`H`)** top-level modes.
- **Spacebar-hold** = temporary hand tool; release restores the previous tool.
- **Scroll = pan**, **⌘/Ctrl-scroll or pinch = zoom**.
- Zoom shortcuts: ⌘± step, **Shift+1 fit**, **Shift+2 zoom-to-selection**, **Shift+0 / ⌘0 = 100%**; a zoom-% dropdown in the corner.
- Momentum on trackpad; animated programmatic camera moves.
- Cursor changes per tool (arrow / `grab` / `grabbing`).

**Tool state machine (tldraw model).** Tools are a tree of `StateNode`s with `onEnter/onExit`, `onPointerDown/Move/Up`, `onKeyDown`, `onTick`. Events flow down the active branch; transitions carry an info payload. For us a **minimal machine** suffices (no translate/resize/rotate):

```
root
 ├─ select   (idle → hovering → selected)   // hover-highlight + click-to-select
 └─ hand     (idle → panning)               // drag pans the camera
spacebar-held → push 'hand' transiently, pop on keyup
```

## 3. Inspect-element selection & highlighting (most important)

**How DevTools/Figma highlight.** A separate **overlay layer** draws the box-model highlight + a **label chip** (selector, `W×H`, colors, padding/margin). Geometry source is `getBoundingClientRect()`. Spacing badges = differencing two elements' rects. **Never mutate the inspected DOM** to highlight it — overlay is `position:absolute/fixed`, `pointer-events:none`, above the content.

**Across the iframe boundary — the hard constraint.**
- **Cross-origin:** the parent **cannot** read `contentDocument`, rects, computed styles, or DOM. Only `postMessage` crosses. → An agent script must run *inside* the iframe, measure, and post data out.
- **We already have that agent: Weaver.** It runs in the target page, speaks the `source:'skinweaver'` postMessage envelope, scrapes CSS vars, uses MutationObserver. Element selection is a natural extension.
- **Flow:** Weaver does `elementFromPoint` / `getBoundingClientRect` / `getComputedStyle` inside → posts rect + metadata → Studio draws chrome.

**Coordinate translation (iframe-content → parent canvas).** `getBoundingClientRect()` is **iframe-viewport-relative** and already includes the iframe's internal scroll (and CSS `zoom`, but not CSS `transform`). Recommended: **put Studio's overlay layer *inside* the same `.zoomed` wrapper as the iframe** (the wrapper that carries `zoom: z`), anchored at the iframe's top-left, and place boxes using the raw iframe-reported rect — the shared `zoom` scales the overlay crisply alongside the iframe, no manual scale math.

**Keeping overlays synced** (all inside Weaver, posted out): `scroll` listener + `ResizeObserver` (selected element + body) + `MutationObserver` (subtree) → coalesce into one `requestAnimationFrame` measure pass; only post when a rect actually changed. If overlays live in the transformed scene, pan/zoom needs no re-measure.

**Prior art:** Builder.io (iframe-as-canvas, artboard zoom), Plasmic (`PlasmicCanvasContext`), **Onlook** (stable `data-oid` attributes to map a clicked node back to source and survive re-renders). Takeaway: **tag selectable elements with a stable id** so selection survives the app's re-renders and so override instructions can address the right node.

## 4. Right inspector panel

- **Tabs** (Figma: Design / Prototype / Inspect) → for us: **Selection** + **Tokens** (+ later Layers).
- **Collapsible sections**: Fill/Color, Typography, Spacing (4-side box), Layout, Effects — shown only when relevant to the selected element.
- **Controls**: color swatch + picker popover; **numeric fields with drag-to-scrub** (Figma signature; label is the drag handle, arrow keys nudge, Shift ×10); dropdowns; segmented controls; the 4-side padding/margin box with a "link sides" toggle; a bundled typography group.
- **Density**: pack related fields per row (W/H side by side), compact icon controls, collapse rare sections, align field edges to a grid. Figma's panel is ~240–280px and fixed; **ours should be wider + resizable** (frequent Figma feature request), per the brief.
- Defaults reflect the element's **computed** values (read via Weaver `getComputedStyle`).

## 5. Libraries — adopt vs hand-roll

- **Pan/zoom:** hand-roll the camera (~50 lines; we need precise zoom-to-cursor, space-pan, fit/zoom-to-selection, and coordinate conversion for overlays anyway). `timmywil/panzoom` (~3.7kB, CSS-transform, supports iframes, "canvas mode") is a fine fast-prototype fallback. Do **not** adopt tldraw.
- **Overlay positioning:** hand-roll absolutely-positioned boxes. Add **Floating UI** only if/when popovers need flip/shift.
- **Iframe bridge:** extend Weaver's existing envelope; read `iframe-resizer` as a reference, don't depend on it.

## Sources

- tldraw Camera — https://tldraw.dev/sdk-features/camera • Tools — https://tldraw.dev/sdk-features/tools
- Figma — Building a professional design tool on the web — https://www.figma.com/blog/building-a-professional-design-tool-on-the-web/ • WebGPU rendering — https://www.figma.com/blog/figma-rendering-powered-by-webgpu/
- Zoom-to-cursor — https://webglfundamentals.org/webgl/lessons/webgl-qna-how-to-implement-zoom-from-mouse-in-2d-webgl.html • https://medium.com/@benjamin.botto/zooming-at-the-mouse-coordinates-with-affine-transformations-86e7312fd50b
- Chrome DevTools Inspect mode — https://developer.chrome.com/docs/devtools/inspect-mode • CDP Overlay — https://chromedevtools.github.io/devtools-protocol/tot/Overlay/
- MDN getBoundingClientRect — https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect • Cross-window comm — https://javascript.info/cross-window-communication
- Observers — https://dev.to/tkudlinski/mutationobserver-intersectionobserver-resizeobserver-what-why-how-235f • https://tigeroakes.com/posts/resize-observer-avoid-forced-sync-layout/
- Figma shortcuts — https://help.figma.com/hc/en-us/articles/360040328653 • Hand tool — https://help.figma.com/hc/en-us/articles/1500004414582 • Right sidebar — https://help.figma.com/hc/en-us/articles/360039832014
- panzoom — https://github.com/timmywil/panzoom • Builder.io — https://www.builder.io/c/docs/101-visual-editor • Plasmic — https://docs.plasmic.app/learn/artboards/ • Onlook — https://blog.logrocket.com/onlook-react-visual-editor/
- WebKit blurry-scaled-iframe bug — https://bugs.webkit.org/show_bug.cgi?id=133801
