# Phase 4 — State Management (store split)

## Objective

Split the 272-line `store.ts` (six stores in one) across modules; each module owns its state.

- `connection/store.ts`: target (`appUrl`/`urlDraft`/`reloadNonce` + `applyUrl`/`reloadTarget`),
  scraped (`scraped`/`activeHostName`/`hostNames`/`totalTokenCount`), overrides (`edits` +
  `elementEdits` + `recordEdit`/`recordElementEdit`/`clearEdits`/`clearElementEdits`), history
  (`pushHistory`/`stepUndo`/`stepRedo`/`canUndo`/`canRedo`).
- `tokens/store.ts`: `search`/`setSearch`, derived `groupedVariables`/`filteredCount`
  (subscribe to `connection.scraped`).
- `inspector/store.ts`: `selected` + `setSelected`/`updateSelectedRect` (from `selection.ts`).
- `canvas/`: `camera.ts`, `tools.ts`, `device.ts` unchanged.
- `shell/store.ts`: `themeMode`/`setThemeMode`/`toggleThemeMode`, `lastAction`/`setLastAction`.

## Note

`setLastAction` is called by `connection` command fns today. Keep `lastAction` in `shell` and have
connection emit via a small callback, OR keep `lastAction` in `connection` (status is arguably a
connection concern). Decision: keep `lastAction` in `connection` (status of the bridge); `shell`'s
`StatusBar` reads it. Avoids a back-dependency.

## Validation

State moves compile; stores still reactive in the running app.
