# Phase 3 — Type Definitions

## Objective

Place types with the module that owns them. `type` only (no `interface`), no `any` — already true.

- `connection/types.ts`: `CssVariableKind`, `DefinedVariable`, `ScrapedHost`, `ScrapedResult`,
  `HostEdits`, `Edits`, `ElementEdits`, `HistoryEntry`, and the inspector wire types currently in
  `selection.ts` (`ElementRect`, `RelevantVariable`, `SelectedElement`) — these come off the bridge,
  so they belong to the connection contract.
- `connection/decoders.ts`: all `decode*` functions extracted from `sdk-bridge.ts`.
- `tokens/types.ts`: `TokenGroup`, `GroupName`, `GroupDescriptor`, `StudioThemeMode` → actually
  theme mode belongs to `shell`.
- `inspector` re-exports the selection types from `connection` (no duplication).

## Validation

`pnpm --filter @neomorph/studio check` clean after types move.
