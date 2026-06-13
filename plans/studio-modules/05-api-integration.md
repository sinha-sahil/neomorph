# Phase 5 — API Integration (connection/remote.ts)

## Objective

`connection/remote.ts` is the bridge boundary: Loomer lifecycle + commands. Decoders extracted out.

- Lifecycle: `attachLoomer(container, appUrl)`, teardown, `startListening`.
- Listeners: `listenCssVariables`, `onElementSelected`, `onElementRect`.
- Commands: `applyTokenValue`, `applyElementStyle`, `applyEdit`, `pushValueDirect`, `clearAll`,
  `rescrape`, `enableInspector`, `disableInspector`.
- Decoders → `connection/decoders.ts` (`decodeScraped`, `decodeSelected`, `decodeRect`,
  `decodeRelevant`, `decodeVariable`, helpers).

## Notes

- This is a cross-origin **postMessage** bridge (Loomer ↔ Weaver), not HTTP — `typesafe-api-call`
  is N/A; runtime validation is the hand-written decoders (uses `type-decoder`). Intentional.
- remote.ts writes overrides into `connection/store.ts` on each apply (the canonical applied-theme
  state that `export` reads).

## Validation

`check` clean; inspector enable/apply still works in-browser.
