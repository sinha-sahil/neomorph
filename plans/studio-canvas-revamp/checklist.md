# Checklist

## Phase 1 — Canvas & Tools
- [x] `canvas/camera.ts` — state + `screenToWorld`/`worldToScreen`/`zoomToPoint`/`fitTo`/`zoomToRect`/`resetZoom` — ⚠️ diverged: plain `.ts` `svelte/store`, not `.svelte.ts` runes; reset is `resetZoom`/`resetView`
- [x] `canvas/tools.ts` — activeTool (`select`/`hand`) + spacebar-pan flag — ⚠️ diverged: `.ts` store, single `spacePanning` flag (not push/pop stack)
- [x] `Scene.svelte` — pan via `transform: translate` (`transform-origin:0 0`, `will-change`) + inner `.zoomed` wrapper using CSS `zoom: z` (NOT `transform: scale`)
- [ ] **Crisp-zoom validation** — ⏳ outstanding: no evidence of per-engine validation or Weaver-internal `documentElement.style.zoom` fallback
- [x] `IframeHost.svelte` — Loomer attach moved here (via `connection/remote.ts` `attachLoomer`), out of any `Preview.svelte`
- [x] `CanvasViewport.svelte` — wheel (pan / ⌘-zoom-to-cursor), pointer pan, iframe `pointer-events` toggle in pan-mode
- [x] `ToolRail.svelte` + `ZoomControl.svelte` — ✅ done differently: also added `DeviceBar.svelte` (desktop/mobile frames)
- [x] Keyboard: V/H, Space-pan, ⌘±, Shift+1 fit, ⌘0 reset — ⏳ outstanding: Shift+2 zoom-to-selection not bound (`zoomToRect` unused)
- [x] Thin shell composer + `TokenSidebar` collapsible — ✅ done differently: shell is `shell/ui/Studio.svelte` + `+page.svelte`; the old `Preview.svelte`/`lib/studio/` monolith is gone
- [x] Preserve `?appUrl=`; `check` green (0/0); no hand-written `src/` file > 200 lines (only the type-crafter generated `types.ts` exceeds)

## Phase 2 — Inspect & Select
- [x] Loomer: action-drop filter replaced with action routing; added `on(action,cb)` + `actionHandlers` map
- [x] Loomer: `enableInspector`/`disableInspector`/`onElementSelected`/`onElementRect`/`queryElementRect` + `getFrame()`
- [x] Bridge mirrors the new Loomer surface — ✅ done differently: lives in `connection/remote.ts` (no `sdk-bridge.ts`)
- [x] Wire types: `ElementRect`, `RelevantVariable`, `SelectedElementDescriptor`, payloads — ⚠️ diverged: type-crafter generated (`types/index.yaml` → `$generated`), not hand-written `weaver/types.ts` alone
- [x] Weaver `inspector.ts`: hover highlight, click-to-select, descriptor build, sync observers (resize+mutation), teardown
- [x] Export `parseDeclarations` + `VAR_REF_REGEX` from `scraper.ts`; `findRelevantVariables` incl. shadow DOM
- [x] `messaging.ts`: decode + dispatch the new actions
- [x] Studio selection store + overlay — ✅ done differently: selection lives in `connection/store.ts`; the hover/select overlay is drawn by Weaver *inside* the iframe (no Studio-side `SelectionOverlay.svelte`)
- [x] Cursor tool ↔ inspector — ⚠️ diverged: inspector is enabled on attach (`startListening` calls `enableInspector`); not gated on the active tool / disabled by hand tool (pan-mode only toggles iframe `pointer-events`)
- [ ] Verify on `examples/index.html` end-to-end; Weaver bundle < 10KB gzip — ⏳ outstanding: not re-verified during this sync (inspector.ts is 378 lines, scraper.ts 437 — well over the studio-only 200-line cap, which did not apply to weaver)

## Phase 3 — Inspector & Cleanup
- [ ] Local controls: `NumericScrubber`, `Splitter`/`PanelGroup`, `Popover`, `SegmentedControl`, `ColorSwatch` — ⏳ outstanding: none built; rows use the library `Input`/`Select` directly
- [x] `Inspector.svelte` + section components — ⚠️ diverged: no `Selection | Tokens` Tabs (tokens stayed in the left sidebar); sections are `Layout/Spacing/Typography/Fill/Border & effects/Tokens` (no standalone Effects/Overrides)
- [ ] `ScopeChip.svelte` — token vs element per row; "affects N places" — ⚠️ diverged: a static inline `.scope-chip` "token" badge exists in `ValueRow` (tooltip only); no component, no element-override chip, no "affects N places" count
- [x] Weaver: `applyElementOverride`/`clearElementOverride` (generated `[data-neomorph-id]` rule layer in `applier.ts`) — ⏳ outstanding: `storage.ts` persists token vars only; element overrides are NOT persisted
- [ ] Resizable + collapsible right panel — ⏳ outstanding: inspector is fixed 320px (left token sidebar is collapsible, right is not)
- [x] Token browser reused — ✅ done differently: refactored token browser lives in the left `TokenSidebar` only (no Tokens tab); inspector has its own relevant-variables `TokensSection`
- [ ] Component migration table (06) — ⏳ outstanding: partial; `Img`/`Input`/`Select`/`ColorPicker` used, but the full table is not verified migrated
- [x] `check` green (0/0); studio CODE_GUIDELINES clean (no `as`/`undefined`/bracket-index in reviewed files)

## Cross-cutting
- [x] All DOM/iframe access stays inside Weaver (parent reads only relayed rects/descriptors; cross-origin safe)
- [ ] Undo/redo extended to per-element overrides — ⏳ outstanding: history store exists but only token `applyEdit` pushes; element edits don't, and `stepUndo`/`stepRedo`/`canUndo`/`canRedo` aren't bound to any UI/keyboard
- [ ] Update `docs/PROGRESS.md` + `CLAUDE.md` — ⏳ outstanding: PROGRESS.md has no canvas/inspector entry; root CLAUDE.md still describes the old `lib/studio/` structure
- [ ] Upstream proposals filed for the 6 missing library components (06) — ⏳ outstanding (external; no evidence filed)
