# Phase 8 — Integration

## Objective

Wire modules together and prove independence.

- Each module exposes a minimal `index.ts` (see 01-planning public APIs).
- `shell/ui/Studio.svelte` imports module barrels only (`$lib/modules/<name>`), not deep paths.
- Package barrel `src/lib/index.ts` re-exports `Studio` (from `shell`) + public types (from
  `connection`/`tokens`).
- Update `src/routes/+page.svelte` import if needed.
- Enforce the dependency rule: grep that no `modules/<feature>` imports another `modules/<feature>`
  (only `connection`/`shared`).

## Verification

- `pnpm --filter @neomorph/studio check` → 0 errors/warnings
- `pnpm --filter @neomorph/studio lint`
- `pnpm --filter @neomorph/studio build`
- In-browser: load `?appUrl=http://localhost:3000`, scrape tokens, select+restyle an element,
  open export, toggle theme — all behave as before.
- `wc -l` on every src file → all < 200.
