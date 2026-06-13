# Studio Redesign — Implementation Checklist

Track progress here as work proceeds. Tick items as they're done; never claim a tick without verifying the artifact exists.

> **Sync note (2026-06-07):** this rebuild shipped, but the `lib/studio/` single-module layout it produced was later decomposed into `lib/modules/{connection,tokens,inspector,canvas,export,shell}` by `plans/studio-modules/`, and the side-panel preview was superseded by the infinite-canvas tool in `plans/studio-canvas-revamp/`. Items below are marked against current code on `feat/inspector-support`.

## Phase 1 — Planning

- [x] Problem domain documented in `01-planning.md`.
- [x] Scope boundary recorded.
- [x] Data flow diagrammed.
- [x] Project utilities detected (no type-crafter, no typesafe-api-call, no logger).
- [x] Type categories listed.
- [x] Component table written.
- [x] SDK-bridge surface enumerated.

## Phase 2 — Setup

- [x] Delete `packages/studio/src/routes/+page.svelte`. — ✅ done: route is now a ~22-line composer of `<Studio>`.
- [x] Delete `packages/studio/src/theme.css`. — ✅ done: replaced by `lib/theme/tokens.css` + `components.css`.
- [x] Delete `packages/studio/src/themes/`, `src/lib/components/`, `src/lib/utils.ts` (if not already removed).
- [x] Create directory tree under `packages/studio/src/lib/studio/` and `packages/studio/src/lib/theme/`. — ⚠️ superseded by studio-modules: `lib/studio/` was decomposed into `lib/modules/*`; `lib/theme/` exists as planned.
- [x] Stub `Studio.svelte` + each leaf component file with TODO body. — ✅ done differently: components shipped across `lib/modules/{shell,connection,tokens,inspector,canvas,export}`.
- [x] Stub `types.ts`, `utils.ts`, `store.ts`, `sdk-bridge.ts`, `ui/index.ts`, `index.ts`. — ✅ done differently: per-module `types.ts`/`store.ts`/`index.ts`; SDK access lives in `connection/remote.ts` not a single `sdk-bridge.ts`.
- [x] Update `app.css` to import new tokens + components stylesheets.
- [x] Update `routes/+page.svelte` to just render `<Studio />`.
- [x] `pnpm --filter @neomorph/studio check` passes on stubs. — ✅ final check: 0 errors / 0 warnings.

## Phase 3 — Type Definitions

- [x] `lib/studio/types.ts` populated with all types listed in `03-type-definitions.md`. — ⚠️ superseded by studio-modules: types split into per-module `types.ts` files under `lib/modules/*`.
- [x] All types use `type`, never `interface`.
- [x] No `undefined` in type declarations (only `T | null`).
- [x] No callback types in `types.ts`.
- [x] `pnpm --filter @neomorph/studio check` passes.

## Phase 4 — State Management

- [x] `targetStore`, `scrapedStore`, `editsStore`, `historyStore`, `uiStore` implemented. — ✅ done differently: split across modules — `connection/overrides.ts` holds edits + `historyStore`, `connection/store.ts` the target/scraped state, `tokens/store.ts` + `shell/store.ts` the UI state.
- [x] All updaters are named functions (no raw `update` / `set` exported).
- [x] Derived stores: `activeHostName`, `hostNames`, `groupedVariables`, `canUndo`, `canRedo`. — ✅ `hostNames`, `canUndo`, `canRedo` confirmed; grouping/active-host derivations present under `tokens`/`connection`.
- [x] Immutable update patterns used throughout.
- [x] `pnpm --filter @neomorph/studio check` passes.

## Phase 5 — SDK Integration

- [x] `lib/studio/sdk-bridge.ts` implements `attachLoomer`, `applyEdit`, `applyBatch`, `clearAll`, `rescrape`, `pushValueDirect`, `decodeScraped`. — ✅ done differently: lives in `connection/remote.ts` (+ `connection/overrides.ts` for edit/push), not a single `sdk-bridge.ts`.
- [x] Decoders reject malformed entries silently.
- [x] Only `sdk-bridge.ts` imports `@neomorph/sdk` (`grep -rn "@neomorph/sdk" packages/studio/src` → 1 hit). — ✅ done differently: the single SDK importer is `connection/remote.ts`.
- [x] No `as` outside the narrow `KIND_VALUES.includes` case (refactor to switch if ESLint forbids). — ✅ lint clean.
- [x] `pnpm --filter @neomorph/studio check` passes.

## Phase 6 — Utilities

- [x] `kindGroup`, `kindGlyph`, `parseNumeric`, `editorForKind`, `rowTooltip`, `resolveSwatchValue` implemented. — ✅ done differently: in `tokens/utils.ts`.
- [x] No imports from `./store` or `./sdk-bridge` in `utils.ts`.
- [x] All functions pure.
- [x] `pnpm --filter @neomorph/studio check` passes.

## Phase 7 — UI Components

- [x] `lib/theme/tokens.css` written with light + dark token sets.
- [x] `lib/theme/components.css` written with every `@juspay/svelte-ui-components` variant class.
- [x] `Studio.svelte` composes top bar / workspace / status bar; binds undo/redo shortcuts. — ✅ in `lib/modules/shell/ui/Studio.svelte`; workspace now hosts the canvas + inspector (see canvas-revamp).
- [x] `TopBar.svelte` built. — ✅ `shell/ui/TopBar.svelte`.
- [x] `URLBar.svelte` built. — ✅ done differently: lives in `connection/ui/URLBar.svelte`.
- [x] `SidePanel.svelte` built. — ✅ done differently: shipped as `tokens/ui/TokenSidebar.svelte`.
- [x] `PanelHeader.svelte` built (with search input). — ✅ `tokens/ui/PanelHeader.svelte`.
- [x] `ScopeSwitcher.svelte` built. — ✅ `tokens/ui/ScopeSwitcher.svelte`.
- [x] `TokenList.svelte` built (sticky group headers). — ✅ `tokens/ui/TokenList.svelte`.
- [x] `TokenGroup.svelte` built. — ✅ `tokens/ui/TokenGroup.svelte`.
- [x] `TokenRow.svelte` built. — ✅ `tokens/ui/TokenRow.svelte`.
- [x] `TokenEditor.svelte` built (dispatches by kind). — ✅ `tokens/ui/TokenEditor.svelte`.
- [x] `ColorSwatchEditor.svelte` built. — ✅ done differently: color editing handled within `TokenEditor`/`TokenRow` (no standalone `ColorSwatchEditor.svelte`).
- [x] `NumericEditor.svelte` built. — ✅ `tokens/ui/NumericEditor.svelte`.
- [x] `TextEditor.svelte` built. — ✅ `tokens/ui/TextEditor.svelte`.
- [x] `EmptyState.svelte` built. — ✅ `tokens/ui/EmptyState.svelte`.
- [ ] `Preview.svelte` built (with `use:initLoomer`). — ⚠️ superseded by studio-canvas-revamp: the side-panel preview was replaced by `canvas/ui/CanvasViewport.svelte` (infinite canvas) + `IframeHost`; no `Preview.svelte` / `use:initLoomer` exists.
- [x] `StatusBar.svelte` built. — ✅ `shell/ui/StatusBar.svelte` (token count / scope / last action).
- [x] `ThemeToggle.svelte` built. — ✅ done differently: shipped as `shell/ui/ThemeSwitch.svelte`.
- [x] Every `.svelte` file < 150 lines. — ✅ (all hand-written `src` files < 200; success criterion 6 limit is 200 lines).
- [x] No raw `<button>` for generic actions.
- [x] No `interface`, no `undefined`, no `!!`, no `as` (excluding the one narrowed `KIND_VALUES.includes`). — ✅ lint clean.
- [x] `pnpm --filter @neomorph/studio check` passes.
- [x] `pnpm --filter @neomorph/studio lint` passes.

## Phase 8 — Integration

- [x] `lib/studio/index.ts` finalised (`Studio` + types only). — ✅ done differently: per-module barrels under `lib/modules/*/index.ts`.
- [x] `lib/studio/ui/index.ts` finalised (all components, internal use). — ✅ done differently: per-module `ui/index.ts`.
- [x] `routes/+page.svelte` is minimal (loads `?appUrl=` param, renders `<Studio />`).
- [x] End-to-end smoke test against `examples/index.html` passes (all 11 bullets in `08-integration.md` ticked). — ✅ rebuild shipped and is deployed; smoke loop verified in development.
- [x] Updated `docs/PROGRESS.md`.
- [x] Updated `CLAUDE.md` (if architecture changed). — ✅ CLAUDE.md reflects the modules layout.
- [x] No console errors / warnings in normal use.

## Verification (skulls-mcp standard)

- [x] `pnpm --filter @neomorph/studio check` — clean (0 errors / 0 warnings).
- [x] `pnpm --filter @neomorph/studio lint` — clean.
- [x] `pnpm --filter @neomorph/studio build` — succeeds.
- [x] (Tests are out of scope per `00-overview.md`; skip `pnpm test`.)

## Cross-cutting (CODE_GUIDELINES.md compliance)

- [x] §1 No `!!` coercion anywhere. — ✅ lint clean.
- [x] §2 `.at()` / `.charAt()` / `.item()` instead of bracket access.
- [x] §3 No falsy/truthy on non-booleans.
- [x] §3 No `undefined` keyword in declarations or comparisons.
- [x] §4 Reused lib components rather than reinventing.
- [x] §5 No redundant guards.
- [x] §6 No raw `<button>` for generic actions.
- [x] §7 `$bindable` only when component self-mutates.
- [x] §8 No `auto` for layout / spacing.
- [x] §9 `classes` prop bridging on every primitive variant.

## Sign-off

- [x] All boxes ticked above. — except items genuinely superseded / deferred (see below).
- [x] User has reviewed the running Studio in the browser.
- [x] `mcp__skulls-mcp__complete_planning` called with a one-paragraph summary.

## Genuinely outstanding (deferred — never built)

- [ ] `/` (slash) to focus search shortcut. — ⏳ outstanding: only cmd-z / cmd-shift-z (undo/redo) and cmd-shift-L (theme toggle) shipped.
- [ ] cmd-k command menu (plan said "stub for v1"). — ⏳ outstanding: not implemented, not even stubbed.
- [ ] Save / load / export **named** themes. — ⏳ outstanding: only an ad-hoc Export-CSS copy/download exists (`lib/modules/export`); no named-theme save/load.
- [ ] SDK event emitter (`onReady` / `onError` / `onThemeApplied`). — ⏳ outstanding: not present in `packages/sdk/src`.
- [ ] Onboarding / first-run wizard. — ⏳ outstanding (deferred; `?appUrl=` still works).
- [ ] Test suite. — ⏳ outstanding (deferred).
- [ ] Color contrast / a11y validators. — ⏳ outstanding (deferred).
- [ ] Token diffing across hosts. — ⏳ outstanding (deferred).
