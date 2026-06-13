# Phase 6 — Utilities

## Objective

Split today's `utils.ts` to the modules that use each helper; no shared grab-bag.

- `tokens/utils.ts`: `kindGroup`, value/swatch formatting (`resolveSwatchValue`), token-name helpers.
- `connection`: `normaliseUrl` (target URL handling) → `connection` (or a tiny `connection/utils.ts`).
- Anything used by 2+ modules and truly generic → `shared/` (keep this minimal; prefer duplication
  of a 3-line helper over a premature shared util).

## Validation

No orphaned exports; `check`/`lint` clean.
