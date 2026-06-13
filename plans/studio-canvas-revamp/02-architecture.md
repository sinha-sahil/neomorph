# Target Architecture

*Sync note (2026-06-07): shipped under `lib/modules/{connection,tokens,inspector,canvas,export,shell}`, not `lib/studio/`. Camera/tools/device are plain `.ts` `svelte/store` modules (not `.svelte.ts` runes); wire types are type-crafter generated under `$generated`; selection lives in `connection/store.ts` and the hover/select overlay is drawn by Weaver inside the iframe (no Studio-side overlay).*

## App shell (replaces today's `Studio.svelte` grid)

Today: `TopBar` / (`SidePanel` 320px | `Preview`) / `StatusBar`.

Target:

```
.studio (flex column, 100vh)
 ├─ <TopBar>            URL/connect • zoom % control • global actions (rescrape/reset/theme)
 ├─ .workspace (flex row, flex:1)
 │   ├─ <ToolRail>      thin (48px) left rail: cursor(V) • hand(H) • zoom-in/out • fit
 │   ├─ <TokenSidebar>  collapsible left panel: global token browser (today's TokenList, refactored)
 │   ├─ <CanvasViewport> flex:1 — the infinite canvas (owns the camera)
 │   │     └─ <Scene>   transform: translate(x,y); transform-origin:0 0; will-change:transform   ← PAN (crisp)
 │   │           └─ .zoomed   zoom: z   ← ZOOM via CSS `zoom` (re-rasterizes crisp; NOT transform:scale)
 │   │                 ├─ <IframeHost>      Loomer-injected <iframe> (the target app)
 │   │                 └─ <SelectionOverlay> pointer-events:none; selection box + label chip (Studio-drawn)
 │   └─ <Inspector>     wide (default 320–360px, resizable) right panel: Selection | Tokens tabs
 └─ <StatusBar>         host • zoom% • selected element • last action
```

- `ToolRail` + `TokenSidebar` are distinct: the rail is tool chrome; the sidebar is the global token browser (kept per the "both" decision; collapsible to maximize canvas).
- `Inspector` is the new wide right panel — the styling surface (Phase 3).
- The **hover** highlight is NOT in this tree — Weaver draws it inside the iframe.

## Coordinate spaces (single source of truth)

- **screen**: DOM event pixels (`clientX/Y`).
- **container**: screen minus `CanvasViewport.getBoundingClientRect()` top-left.
- **world**: infinite canvas space; `world = (container - {x,y}) / z`.
- **iframe-local**: pixels inside the target document (what Weaver's `getBoundingClientRect()` returns). Because `<IframeHost>` and `<SelectionOverlay>` share the `.zoomed` wrapper, an iframe-local rect places an overlay box with **no scale math** — the wrapper's `zoom` scales both together, crisply.

> **Rendering note (resolves the blur concern):** pan is `transform: translate` on `<Scene>`; zoom is CSS **`zoom: z`** on the inner `.zoomed` wrapper — **never `transform: scale`**, which stretches a cached bitmap and blurs the iframe. `zoom` is a layout-time re-render → crisp at any zoom. The camera math (below) is unchanged by this; only the CSS application differs. If a target engine rasterizes the replaced iframe under parent `zoom`, fall back to Weaver applying `document.documentElement.style.zoom = z` inside the iframe (guaranteed crisp, media-query-stable). See doc 01 → "Crisp zoom".

Helpers live in one module (`lib/studio/canvas/camera.ts`): `screenToWorld`, `worldToScreen`, `zoomToPoint`, `fit`, `zoomToRect`.

## State stores (Svelte 5 runes, `lib/studio/`)

- `canvas/camera.svelte.ts` — `camera = $state({ x, y, z })`, derived `zoomPercent`, mutators (`panBy`, `zoomToPoint`, `fitTo`, `reset`). Pure; no DOM.
- `canvas/tools.svelte.ts` — `activeTool = $state<'select'|'hand'>('select')`, `spacePanning`, transient push/pop.
- `selection.svelte.ts` — `hovered`/`selected` element descriptors (from Weaver), the selected element's `relevantVariables`, computed styles, and active overrides.
- existing `store.ts` (tokens, hosts, undo/redo, ui theme) — kept, lightly extended for per-element overrides + selection.

## Cross-iframe contract (the rule)

**Studio never touches the iframe DOM.** Every measurement, hover-test, computed-style read, and style application crosses via Weaver's postMessage envelope. Write all of Phase 2/3 as if the target is cross-origin, even though dev (`examples/index.html`) is same-origin — same-origin tempts you to read `contentDocument` directly, and that code breaks on the first real target.

## Overlay responsibility split

| Concern | Who draws it | Why |
| --- | --- | --- |
| Hover highlight (follows cursor 60fps) | **Weaver**, inside iframe | No postMessage round-trip per frame; scales for free under the canvas transform |
| Selection box + label chip | **Studio** `<SelectionOverlay>` inside `<Scene>` | Needs to anchor Studio chrome / the inspector; only updates on click + sync events |
| Element→token resolution | **Weaver** | Only the in-iframe agent can read matching CSS rules + computed styles |
| Style application (token + per-element override) | **Weaver** `applier.ts` | Same-context DOM write |

## Loomer routing fix (prerequisite for Phase 2)

`loomer.ts:47-49` drops any response whose payload has an `action` field, so only mutation-driven scrape broadcasts reach callbacks. Replace with **action-based routing**: a `Map<action, Set<callback>>` (or a small event emitter) so `elementSelected` / `elementRect` reach Studio while `applyCssVariables`/`clearTheme` acks can be awaited by requestId. Also expose the injected `<iframe>` element (or its current `getBoundingClientRect()`) for Studio-side rect translation.

## Build / deploy notes

- Studio stays a SvelteKit static app (adapter-vercel). No SSR concerns — canvas + postMessage are client-only; gate DOM access on `onMount`/actions.
- Weaver stays vanilla TS/Rollup; `inspector.ts` is tree-shaken in but must keep the bundle within the **<10KB gzipped** target — keep the inspector lean (no heavy deps).
- The `?appUrl=` onboarding query param must keep working.
