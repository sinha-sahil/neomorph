# Phase 1 — Infinite Canvas & Tools

**Goal:** Replace the static `Browser`-framed preview with a pannable/zoomable infinite canvas holding the target iframe, plus the cursor/hand tool model and the new app shell. No selection yet.

*Sync note (2026-06-07): shipped in `lib/modules/canvas/` as plain `.ts` stores (`camera.ts`/`tools.ts`/`device.ts`), not `.svelte.ts`. Also shipped a `DeviceBar` (desktop/mobile artboards) that this plan deferred. Shift+2 zoom-to-selection is not bound and crisp-zoom per-engine validation was not done.*

**Ship criterion:** load `examples/index.html`, pan and zoom smoothly, zoom-to-cursor is stable, **text stays crisp at every zoom level (no bitmap blur)**, the hosted app is interactive at 100%, all `check/lint/build` green.

## New files

| File | Role |
| --- | --- |
| `lib/studio/canvas/camera.svelte.ts` | `camera = $state({x,y,z})` + pure transform helpers (`screenToWorld`, `worldToScreen`, `zoomToPoint`, `fitTo`, `zoomToRect`, `reset`). |
| `lib/studio/canvas/tools.svelte.ts` | `activeTool`, `spacePanning`; transient hand-push on spacebar. |
| `lib/studio/ui/CanvasViewport.svelte` | Owns the viewport element, wires wheel/pointer events, renders `<Scene>`. |
| `lib/studio/ui/Scene.svelte` | The single transformed wrapper; renders `<IframeHost>` (+ overlay slot for Phase 2). |
| `lib/studio/ui/IframeHost.svelte` | `use:initLoomer` host (moved out of `Preview.svelte`). |
| `lib/studio/ui/ToolRail.svelte` | Left rail: cursor/hand/zoom buttons (library `Button` + `Tooltip` + `Icon`). |
| `lib/studio/ui/ZoomControl.svelte` | Zoom % readout + menu (Fit / 100% / Zoom to selection); library `Menu`/`Select`. |

## Camera math (reference sketch — house style: no `as`/`undefined`, curly braces)

```ts
// camera.svelte.ts
export const camera = $state({ x: 0, y: 0, z: 1 });
const MIN_Z = 0.1;
const MAX_Z = 8;

export function screenToWorld(cx: number, cy: number): { x: number; y: number } {
  return { x: (cx - camera.x) / camera.z, y: (cy - camera.y) / camera.z };
}

export function panBy(dx: number, dy: number): void {
  camera.x += dx;
  camera.y += dy;
}

// zoom keeping the world point under (cx,cy) fixed — convert-before / convert-after / shift
export function zoomToPoint(cx: number, cy: number, factor: number): void {
  const before = screenToWorld(cx, cy);
  const next = Math.min(MAX_Z, Math.max(MIN_Z, camera.z * factor));
  camera.z = next;
  const after = screenToWorld(cx, cy);
  camera.x += (after.x - before.x) * camera.z;
  camera.y += (after.y - before.y) * camera.z;
}
```

`cx/cy` are container-local (already offset by `CanvasViewport.getBoundingClientRect()`).

## Scene transform — pan via `translate`, zoom via `zoom` (CRISP)

Do **not** use `transform: scale()` for zoom — it stretches the iframe's cached bitmap and blurs above 100%, which is rejected. Pan with `translate` (crisp), zoom with CSS `zoom` (a layout-time re-render → crisp at any zoom). The camera math above is unchanged; only the CSS differs.

```svelte
<!-- Scene.svelte -->
<div
  class="scene"
  style="transform: translate({camera.x}px, {camera.y}px); transform-origin: 0 0;"
>
  <!-- CSS `zoom` re-rasterizes content crisply (Blink/WebKit "effective zoom"; Firefox ≥126) -->
  <div class="zoomed" style="zoom: {camera.z};">
    <IframeHost />
    <!-- Phase 2: <SelectionOverlay /> — shares this wrapper, scales crisply with raw iframe-local rects -->
  </div>
</div>

<style>
  .scene { position: absolute; top: 0; left: 0; will-change: transform; }
</style>
```

**Crisp-zoom validation (do this first in Phase 1):** confirm `zoom` on the wrapper renders the iframe crisply on each target engine. If any engine rasterizes the replaced iframe under parent `zoom`, switch that engine to the Weaver-internal path — Weaver sets `document.documentElement.style.zoom = camera.z` inside the iframe (guaranteed crisp, media-query-stable), and the iframe element is sized to the base viewport. Either way, pan stays `translate`.

## Input handling (CanvasViewport)

- **Wheel**: `ctrlKey || metaKey` → `zoomToPoint(localX, localY, Math.pow(2, -e.deltaY * 0.01))`; else `panBy(-e.deltaX, -e.deltaY)`. `e.preventDefault()` to stop page scroll.
- **Pointer pan**: active when `activeTool === 'hand'` OR `spacePanning`. `pointerdown` captures, `pointermove` → `panBy(e.movementX, e.movementY)`, cursor `grabbing`.
- **Keyboard** (`svelte:window`, ignore when typing): `v`→select, `h`→hand, hold `Space`→spacePanning on, keyup→off; `⌘=`/`⌘-`→`zoomToPoint(center, …)`; `Shift+1`→`fitTo(iframeRect)`; `⌘0`→100%.
- **pointer-events on iframe**: set `none` during an active pan/space-hold so the hosted page doesn't eat the gesture; restore after.

## Shell changes

- Rewrite `Studio.svelte` to the [`02`](02-architecture.md) layout. Keep `TopBar` (add `<ZoomControl>`), keep `StatusBar` (add zoom %).
- `TokenSidebar.svelte` = today's `SidePanel` made collapsible (a chevron toggle; library `Button`/`Icon`).
- Delete `Preview.svelte` (its iframe host logic moves to `IframeHost.svelte`; the `Browser` chrome is dropped — the canvas replaces it). The `{#key appUrl}` remount pattern stays in `IframeHost`.

## Gotchas to honor

`transform-origin: 0 0`; `will-change` on `.scene` only; integer-snap translate if blur is bad; clamp zoom; cursor states per tool; don't lose the `?appUrl=` param.

## Phase 1 risks

- Iframe swallows wheel/pointer at >0 zoom → mitigated by `pointer-events:none` during gestures and a transparent capture surface if needed.
- Momentum/inertia is nice-to-have; ship without it first.
