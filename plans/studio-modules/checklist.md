# Implementation Checklist

### connection (core) — do first
- [x] Create `modules/connection/{index,remote,types,store}.ts` + `overrides.ts` + `ui/`
- [x] Extract decoders from `sdk-bridge.ts` → `decoders.ts` — ✅ done differently: replaced by type-crafter codegen (`types/index.yaml` → `src/generated/types`, via `$generated`)
- [x] Move target/scrape/overrides/history stores from `store.ts` → `connection/store.ts`
- [x] Move bridge wire types (`selection.ts` + `types.ts` bridge types) → `connection/types.ts`
- [x] Move `URLBar` → `connection/ui/`
- [x] `connection/index.ts` minimal API; `check` green

### shared
- [x] Move `icons.ts` + `assets/icons/` → `shared/`; update all `Img src={icons.x}` imports — ✅ done differently: no shared module; per-file svg imports via Img + theme CSS in lib/theme/

### canvas
- [x] Move `camera/tools/device.ts` + viewport UI → `modules/canvas/`; `index.ts`; `check` green

### tokens
- [x] Move token UI + search/grouped stores + `utils.ts` (kindGroup) → `modules/tokens/`
- [x] Derive groups from `connection.scraped`; `index.ts`; `check` green

### inspector
- [x] Move `selection` + inspector UI → `modules/inspector/`
- [x] Decompose `Inspector.svelte` into `sections/*` + `edit.ts` (< 200 lines each)
- [x] `index.ts`; `check` green

### export
- [x] Move `export.ts` + `ExportPanel` → `modules/export/`; read overrides from `connection`
- [x] `index.ts`; `check` green

### shell + barrel
- [x] Move `Studio/TopBar/StatusBar/ThemeSwitch` + theme-mode/lastAction → `shell/`
- [x] `shell/ui/Studio.svelte` imports module barrels only
- [x] Update `src/lib/index.ts` package barrel + route import

### Verification
- [x] `pnpm --filter @neomorph/studio check` (0/0)
- [x] `pnpm --filter @neomorph/studio lint`
- [x] `pnpm --filter @neomorph/studio build`
- [x] In-browser smoke test (tokens, inspect+restyle, export, theme)
- [x] Every src file < 200 lines
- [x] No feature↔feature imports (only connection — `shared` was dropped)
