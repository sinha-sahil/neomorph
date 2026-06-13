# Studio Redesign — Overview

> Plan owner: Sahil • Date opened: 2026-05-23 • Status: shipped 2026-05/06 — superseded; see [Sync note](#sync-note-2026-06-07)
> Template: skulls-mcp `sveltekit / client-module` (adapted — Studio is a PostMessage client, not an HTTP API client)

## Sync note (2026-06-07)

This rebuild **shipped**. The 881-line `+page.svelte` monolith is gone; the route (`packages/studio/src/routes/+page.svelte`) is now a ~22-line composer rendering `<Studio>` and honouring `?appUrl=`. Studio's own chrome tokens live under `packages/studio/src/lib/theme/` (`tokens.css`, `components.css`), distinct from the user-app tokens, exactly as intended. Success criteria **1, 2, 3, 6, 7** are met — `check` reports 0 errors / 0 warnings, `lint` and `build` pass, and every hand-written `src` file is < 200 lines (only the generated `src/generated/types/types.ts` exceeds it). The shipped token-editor surfaces (color swatch/hex, numeric slider + text editors, grouped/searchable token list, scope switcher, empty/loading states), the top bar (brand + URL bar + actions), the status bar (token count / scope / last action), and the light+dark Studio theme with toggle all exist.

**But the plan has since been superseded on two axes:**

- **(a) Module layout decomposed.** This plan created a single `lib/studio/` module. That was an intermediate step — `plans/studio-modules/` later decomposed it into `lib/modules/{connection,tokens,inspector,canvas,export,shell}`. The components this plan named (`TopBar`, `URLBar`, `TokenList`, `TokenRow`, `StatusBar`, etc.) shipped, but they now live across those modules (e.g. `TopBar`/`StatusBar`/`Studio` in `shell`, `URLBar` in `connection`, the token editors in `tokens`, plus a new `inspector` module). State stores are split per-module (`connection/overrides.ts` holds the edits + undo/redo history) rather than the single `lib/studio/store.ts` this plan proposed.
- **(b) Visual direction superseded.** The side-panel preview UI this plan described was superseded by `plans/studio-canvas-revamp/` — the preview is now an infinite-**canvas** tool (`lib/modules/canvas`, `CanvasViewport.svelte`) with a tool rail, device bar and zoom controls, plus an element `Inspector`. The `Preview.svelte` / `use:initLoomer` shape in this plan no longer matches code.

**Shipped from the plan's in-scope list:** undo (cmd-z) / redo (cmd-shift-z) and theme toggle (cmd-shift-L) shortcuts (all in `shell/ui/Studio.svelte`).

**Genuinely outstanding (deferred / never built):**

- `/` (slash) to focus search — **not** implemented (only cmd-z / cmd-shift-z / cmd-shift-L shipped).
- cmd-k command menu — **not** implemented, not even stubbed.
- Save / load / export **named** themes — not built. (An Export-CSS *copy/download* feature ships in `lib/modules/export`, but it generates ad-hoc CSS from current edits; there is no named-theme save/load.)
- SDK event emitter (`onReady` / `onError` / `onThemeApplied`) — not present in `packages/sdk/src`.
- Onboarding / first-run wizard — not built (`?appUrl=` still works).
- Test suite — not built.
- Color contrast / a11y validators — not built.
- Token diffing across hosts — not built.

## Goal

Rebuild `@neomorph/studio` from first principles into a **production-grade visual theme editor** that feels like a real design tool (Figma / Linear / Vercel territory) — not a debug panel with a sidebar.

The current Studio (`packages/studio/src/routes/+page.svelte`) is an 881-line monolith that grew organically while we proved the SDK ↔ Weaver loop worked. It now needs to be **torn down to studs** and rebuilt with:

- A real module boundary (`lib/studio/`) — not a single page
- Composable Svelte components, each <150 lines
- Pure state stores instead of route-local `$state` soup
- A coherent visual system (typography scale, spacing, color, motion)
- Better information density without losing legibility
- Keyboard-first workflow

## Scope

### In scope

- **All of `packages/studio/src/`** — `+page.svelte`, `app.css`, `theme.css` are wiped. The `lib/` folder is rebuilt around a `studio/` module.
- New module structure under `src/lib/studio/` (types, store, sdk bridge, utils, ui components).
- New design-token layer under `src/lib/theme/` for Studio's own chrome (distinct from the user-app tokens the SDK is editing).
- Token editor surfaces: color (swatch + hex input), numeric (slider for opacity / font-weight, stepper for others), text (text input), shadow (text input for v1).
- Grouped token list with sticky group headers, search, scope switcher.
- Empty / loading / error states.
- Top bar: brand + URL bar + actions (rescrape, reset).
- Status bar at the bottom — token count, active scope, last action.
- Light + dark theme for Studio itself (cmd-shift-L toggle).
- Keyboard shortcuts: `/` focuses search, `cmd-k` opens command menu (stub for v1), `cmd-z` undoes last edit, `cmd-shift-z` redoes.
- Keep `@juspay/svelte-ui-components` as the primitive library — themed via `classes` prop + CSS variables, per the house style.

### Out of scope (deferred)

- Save / load / export named themes (next iteration; PROGRESS.md item #3).
- SDK event emitter (`onReady`, `onError`, `onThemeApplied`).
- Onboarding flow (`?appUrl=…` query param still works, but no first-run wizard).
- Test suite (separate effort).
- Color contrast / a11y validators.
- Token diffing across hosts.

## Success criteria

The rebuild is **done** when:

1. `pnpm --filter @neomorph/studio check` passes (no `svelte-check` errors / warnings).
2. `pnpm --filter @neomorph/studio lint` passes (ESLint + Prettier clean).
3. `pnpm --filter @neomorph/studio build` produces a working static build.
4. `pnpm --filter @neomorph/studio dev` boots, loads `examples/index.html`, scrapes its CSS variables, and applies a color change end-to-end without console errors.
5. The visual result matches the [`Design intent`](#design-intent) section below — a sober, dense, designer-targeted UI rather than the current half-bright/half-dark mishmash.
6. **No file in `src/` exceeds 200 lines** (route file may be smaller than 30 lines — it should just compose `<Studio />`).
7. Every rule in `docs/CODE_GUIDELINES.md` passes — particularly: no `as`, no `undefined`, no falsy/truthy checks, no bracket-index access on arrays, no raw `<button>`, curly braces on every control statement.

## Design intent

- **Light-first** (Linear-style), with a dark-mode counterpart, both available at runtime.
- **Single accent color** (deep indigo, `#5b5bd6` or similar) for focus, active and selected states.
- **Inter** for UI; **JetBrains Mono** for token names and values.
- **Type scale**: 11 / 12 / 13 / 15 px. Nothing larger in the chrome.
- **Spacing scale**: 4 / 8 / 12 / 16 / 24 (multiples of 4).
- **Subtle borders** (`#e4e4e7` light, `#27272a` dark), no drop shadows except on floating elements (popovers, tooltips).
- **Compact rows**: 28 px tall — leader (16px swatch / kind glyph) · monospace name (truncates) · editor (right-aligned, fills remaining).
- **Sticky group headers** in the token list (Colors / Typography / Sizing / Shadows / Motion / Numeric / Aliases / Other).
- **Status bar** along the bottom: scope · token count · last-edit hint · theme toggle button.

## Dependencies / prerequisites

- `@neomorph/sdk` — already provides `Loomer`. No SDK-side changes expected.
- `@neomorph/weaver` — already broadcasts scraped variables. No weaver-side changes expected.
- `@juspay/svelte-ui-components` (^2.19.2) — primitive components: `Toolbar`, `Browser`, `Button`, `Input`, `Slider`, `ColorPicker`, `Pill`, `Select`. New components may be needed (e.g. `Tooltip`, `Tabs`); confirm coverage during Phase 1.
- Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`) — the codebase is already on this.

## Risks / unknowns

- Some primitive components in `@juspay/svelte-ui-components` may not theme deep enough via CSS variables to match the design intent (e.g., `ColorPicker` popover, `Select` dropdown). Mitigation: if a component can't be themed adequately, wrap it in a thin custom Svelte component that bridges the CSS variables, per `CODE_GUIDELINES.md §6`.
- Existing query-param onboarding (`?appUrl=`) must keep working — Vercel deploys link to specific apps with this.
- Demoing on `examples/index.html` requires the Weaver build at `packages/weaver/build/index.js` to be present; document that in Phase 8.

## Reference files

- Existing monolith: `packages/studio/src/routes/+page.svelte`
- Existing tokens: `packages/studio/src/theme.css`, `packages/studio/src/app.css`
- House style: `docs/CODE_GUIDELINES.md`
- Project snapshot: `docs/PROGRESS.md`
- SDK entry: `packages/sdk/src/loomer.ts`
- Weaver entry: `packages/weaver/src/index.ts`
