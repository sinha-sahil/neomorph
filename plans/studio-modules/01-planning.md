# Phase 1 — Planning (module boundaries & file mapping)

## Objective

Fix each module's purpose, public API, and which of today's files move into it.

## File → module mapping

| Module | State | UI | Source today |
|---|---|---|---|
| `connection` | target URL, scraped vars, active host, applied overrides (token + element edits), history | `URLBar` | `sdk-bridge.ts` → `remote.ts` + `decoders.ts`; `types.ts`; edits/scrape/history/target slices of `store.ts` |
| `tokens` | search + derived grouped/filtered (from connection) | `TokenSidebar, PanelHeader, ScopeSwitcher, TokenList, TokenGroup, TokenRow, TokenEditor, NumericEditor, TextEditor, EmptyState` | token slices of `store.ts`, `utils.ts` |
| `inspector` | selection, optimistic local overrides | `Inspector` + `inspector/sections/*` + rows (`ValueRow, SelectRow, ColorRow, PropRow`) | `selection.ts`, `Inspector.svelte` (decomposed) |
| `canvas` | camera, tools, device | `CanvasViewport, Scene, IframeHost, ToolRail, DeviceBar, ZoomControl` | `canvas/*` |
| `export` | generated CSS | `ExportPanel` | `export.ts` |
| `shell` | theme mode, last-action | `Studio` (layout), `TopBar, StatusBar, ThemeSwitch` | shell slices of `store.ts` |
| `shared` | — | — | `ui/icons.ts`, `assets/icons/`, `theme/` |

## Public API per module (`index.ts`)

- `connection`: `attachLoomer`, `rescrape`, `clearAll`, `applyTokenValue`, `applyElementStyle`,
  `enable/disableInspector`; stores `target`, `scraped`, `activeHostName`, `overrides`, `canUndo/Redo`;
  public types.
- `tokens`: `TokenSidebar`; `groupedVariables`, `filteredCount`, `setSearch`.
- `inspector`: `Inspector`; `selected`.
- `canvas`: `CanvasViewport`; camera/tools/device controls.
- `export`: `ExportPanel`; `generatedCss`, `hasOutput`.
- `shell`: `Studio`.

## Standalone test

Each feature module must compile and render given only `connection` + `shared` — no sibling imports.
