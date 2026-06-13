# Studio Canvas Revamp — Overview

> Plan owner: Sahil • Date opened: 2026-06-03 • Status: largely shipped 2026-06-07 — see [Sync note](#sync-note-2026-06-07)
> Supersedes the visual direction of [`../studio-redesign/`](../studio-redesign/00-overview.md) (that rebuild produced today's panel-based Studio). This plan takes Studio from a "debug panel beside a preview" to a **Framer/Figma-style infinite-canvas design tool**.

## Sync note (2026-06-07)

This section was added when syncing the plan to the actual shipped code. The revamp largely landed across the three phases, but it was implemented on top of the *separate* `plans/studio-modules/` decomposition, so the file layout and a few design choices diverge from what this plan originally proposed.

**Shipped (verified in code):**
- **Canvas & tools** — `lib/modules/canvas/` with `camera.ts`, `tools.ts`, `device.ts` and `ui/{CanvasViewport,Scene,IframeHost,ToolRail,DeviceBar,ZoomControl}.svelte`. Pan (hand/space/scroll), ⌘-scroll zoom-to-cursor, fit (Shift+1), ⌘0 reset, ⌘± centred zoom, V/H tool switch all work. `Scene` uses CSS `zoom` for zoom + `transform: translate` for pan, exactly as planned.
- **Weaver inspect-select** — `packages/weaver/src/inspector.ts` (hover highlight, click-to-select, `data-neomorph-id` assignment, descriptor build with curated computed styles, `findRelevantVariables` incl. shadow DOM, resize/mutation observers, teardown). New postMessage actions wired through `messaging.ts`.
- **SDK Loomer** — action-routing (`on(action,cb)` + `actionHandlers` map) replaced the old action-drop filter; `enableInspector`/`disableInspector`/`queryElementRect`/`onElementSelected`/`onElementRect`/`applyElementOverride`/`clearElementOverride`/`getFrame` added.
- **Hybrid token/element edits** — `connection/remote.ts` `applyTokenValue` (global var) vs `applyElementStyle` (per-element override via a generated `[data-neomorph-id]` rule layer in `applier.ts`); Inspector routes by whether the property is token-driven.
- **Figma-style inspector** — decomposed into `inspector/ui/sections/{Layout,Spacing,Typography,Fill,Border,Tokens}Section.svelte` over `rows/{Value,Select,Color,Prop}Row.svelte`, fed by an `InspectorCtx`.
- **Device frames** — DeviceBar desktop/mobile (the overview listed these as out-of-scope Phase 4+, but they shipped).
- **Collapsible left token sidebar** — `tokens/ui/TokenSidebar.svelte` collapses.
- Quality gate: studio `check` passes 0/0; every hand-written studio `src` file is < 200 lines.

**Diverged from the plan:**
- Code lives under `lib/modules/{connection,tokens,inspector,canvas,export,shell}`, NOT the `lib/studio/` monolith this plan references throughout (that monolith is gone). `+page.svelte` / `shell/ui/Studio.svelte` is a thin composer.
- `camera.ts` / `tools.ts` / `device.ts` are plain `.ts` `svelte/store` modules, NOT the `.svelte.ts` runes files the plan proposed.
- Tokens stayed in the **left** `TokenSidebar`; the inspector is element-only. There is **no** `Selection | Tokens` tab switcher — the right panel just shows the selection (with a Tokens *section* listing the relevant variables).
- Section set is `Layout / Spacing / Typography / Fill / Border & effects / Tokens` — not the plan's `Fill/Typography/Spacing/Layout/Effects/Overrides`. There is no standalone Effects section (box-shadow folded into Border) and no Overrides section (overrides are inline per row).
- Wire types/decoders are **type-crafter generated** (`types/index.yaml` → `src/generated/types`, `$generated` alias) rather than hand-written Weaver/Studio types.
- The scope marker is a static inline `.scope-chip` "token" badge in `ValueRow` (tooltip: "edits change this token everywhere"), NOT a `ScopeChip.svelte` component and NOT an "affects N places" count.
- Inspector controls use the library `Input`/`Select` directly — no `NumericScrubber`, `SegmentedControl`, `Popover`, `Splitter`, or `ColorSwatch` local controls were built.

**Still OUTSTANDING:**
- **Resizable right inspector** — fixed 320px width, not drag-resizable/collapsible.
- **Undo/redo for per-element overrides** — history store exists (`overrides.ts`) but is wired to *token* edits only (`applyEdit` pushes; `applyElementStyle`/`recordElementEdit` do not), and `stepUndo`/`stepRedo`/`canUndo`/`canRedo` are not bound to any UI or keyboard.
- **Element-override persistence** — `weaver/storage.ts` persists only token vars; per-element overrides are lost on reload.
- **Zoom-to-selection (Shift+2)** — `zoomToRect` exists in `camera.ts` but is not bound to a key or used.
- **Figma-style local controls** — `NumericScrubber`, `SegmentedControl`, `Popover`, `Splitter`/`PanelGroup`, `ColorSwatch` (06) not built.
- **Upstream library proposals** — the 6 component asks in 06 are not filed (external).
- **Crisp-zoom per-engine validation** — not evidenced.
- **Docs** — `docs/PROGRESS.md` has no canvas/inspector entry and root `CLAUDE.md` still describes the old `lib/studio/` structure; neither was updated.

## Goal

Turn `@neomorph/studio` into an infinite-canvas visual editor:

- An **infinite canvas** in the middle that holds the target application's `<iframe>`, with pan + zoom.
- A **left tool rail** (cursor tool, hand/pan tool, zoom) — chrome only, no shape drawing.
- A **wide, resizable right inspector** for styling the selected element, inspired by Figma/Framer (collapsible sections, dense controls, drag-to-scrub numbers).
- **Inspect-element selection**: hover highlights elements like browser devtools; click selects; the inspector then shows what styles/tokens drive that element. Powered by **Weaver** running inside the target iframe.
- Maximize use of `@juspay/svelte-ui-components`; replace bespoke UI; identify components to add upstream.

**Hard constraint (by design):** users never draw free shapes. Everything is *customizing what already exists* in the hosted application.

## Decisions locked (2026-06-03)

| Fork | Decision | Consequence |
| --- | --- | --- |
| **Edit model** | **Hybrid** — global token edits *and* per-element overrides | Weaver gains element-scoped override injection + stable element ids, in addition to today's document/shadow-host variable overrides. UI must clearly distinguish "edit the token (global)" vs "override just this element". |
| **Sequencing** | **Phased** — P1 canvas shell → P2 inspect-select → P3 inspector + cleanup | Each phase ships independently; Studio stays usable between phases. |
| **Token browsing** | **Keep both** — global token browser *and* selection inspector | Left side retains a searchable all-tokens list (today's model); right side is the element inspector. |

## Phases (see per-phase files)

- **Phase 1 — Canvas & Tools** ([`03`](03-phase1-canvas-and-tools.md)): camera store, `<Scene>` CSS-transform viewport, pan/zoom, zoom-to-cursor, cursor/hand tool state machine, spacebar-pan, zoom controls, new app shell (tool rail + canvas + right panel placeholder + top bar + status bar). The iframe moves from a static `Browser` frame into the canvas.
- **Phase 2 — Inspect & Select** ([`04`](04-phase2-weaver-inspect.md)): Weaver `inspector.ts` (hover highlight, click-to-select, element descriptor + element→token mapping), new postMessage actions, Loomer action-routing fix, Studio selection chrome + overlay sync.
- **Phase 3 — Inspector Panel & Component Cleanup** ([`05`](05-phase3-inspector-and-cleanup.md), [`06`](06-component-library-gaps.md)): the wide resizable right inspector with Figma-style sections, the hybrid edit UI (token vs per-element override), migration of bespoke Studio UI onto `@juspay/svelte-ui-components`, and the list of components to add to that library.

## Architecture summary (full detail in [`02`](02-architecture.md))

- **Rendering**: DOM + CSS `transform: translate() scale()` on a single `<Scene>` wrapper. NOT WebGL/Canvas — we host one live iframe, not thousands of vector nodes. Hand-rolled camera (`{x, y, z}`), ~50 lines.
- **Cross-iframe**: all DOM measurement/selection happens *inside Weaver* (it runs in the target page) and travels over `postMessage`. The parent never reads the iframe DOM (must work cross-origin).
- **Overlays**: hover highlight drawn by Weaver *inside* the iframe (scales for free under the canvas transform, no per-frame round-trip). Selection chrome (label chip, panel anchor) drawn by Studio using rects relayed from Weaver.

## Success criteria

1. `pnpm --filter @neomorph/studio check | lint | build` all pass; no `src/` file exceeds 200 lines; every `docs/CODE_GUIDELINES.md` rule holds (no `as`, no `undefined`, no `!!`, no truthy checks, no array bracket-index, no raw `<button>`, curly braces everywhere).
2. Canvas: pan (hand tool / space-drag / scroll), zoom (⌘-scroll, buttons, ⌘±), zoom-to-cursor stable, fit (Shift+1) and zoom-to-selection (Shift+2) work; the hosted app stays interactive at 100%.
3. Inspect: hovering the canvas highlights elements; clicking selects one and the right panel reflects its styles; works against `examples/index.html` end-to-end with no console errors.
4. Hybrid edits: editing a token updates everywhere; a per-element override changes only the selected element; both round-trip through Weaver and persist.
5. Component audit: every item in [`06`](06-component-library-gaps.md)'s "replace with library" table is migrated or has a written reason it can't be.

## Out of scope (this revamp)

- Saving/loading named themes, export formats (tracked separately).
- Multi-artboard / multiple simultaneous iframes.
- Responsive breakpoints / device frames inside the canvas (Phase 4+).
- Collaborative/multiplayer cursors.
- Free-form drawing, vector tools — permanently out of scope by product definition.

## Reference

- Current shell: `packages/studio/src/lib/studio/ui/Studio.svelte` (TopBar / SidePanel / Preview / StatusBar).
- Current iframe host: `packages/studio/src/lib/studio/ui/Preview.svelte` (`Browser` + `use:initLoomer`).
- Weaver protocol + scraping: `packages/weaver/src/{messaging,scraper,applier}.ts`.
- SDK bridge: `packages/sdk/src/loomer.ts`, `packages/studio/src/lib/studio/sdk-bridge.ts`.
- House style: `docs/CODE_GUIDELINES.md`.
