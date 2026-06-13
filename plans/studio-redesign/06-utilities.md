# Phase 6 — Utilities

> Pure helpers in `lib/studio/utils.ts`. No DOM, no Loomer, no store. Easy to test in isolation later.

## Objectives

- Classify a `CssVariableKind` into one of the eight UI groups.
- Pick a glyph for non-color tokens (one-character indicator).
- Provide tiny helpers shared across components.
- Keep the file under ~150 lines.

## Critical rules

- Pure functions only. No side effects.
- No imports from `./store`, `./sdk-bridge`, or any `.svelte` files. (Utils never depends on UI.)
- Always closed unions; exhaustive `switch` over `CssVariableKind` where applicable.
- Curly braces on every `if` / `for` (CODE_GUIDELINES §the unwritten one — but ESLint enforces).

## `lib/studio/utils.ts`

```ts
import type { CssVariableKind, GroupName } from './types';

// ────────────────────────────────────────────────────────────────────────────
// Kind → UI group
// ────────────────────────────────────────────────────────────────────────────

export function kindGroup(kind: CssVariableKind): GroupName {
  if (kind === 'color') {
    return 'color';
  }
  if (
    kind === 'font-size' ||
    kind === 'font-family' ||
    kind === 'font-weight' ||
    kind === 'line-height'
  ) {
    return 'typography';
  }
  if (kind === 'spacing' || kind === 'dimension' || kind === 'length' || kind === 'radius') {
    return 'sizing';
  }
  if (kind === 'shadow') {
    return 'shadow';
  }
  if (kind === 'duration') {
    return 'motion';
  }
  if (kind === 'opacity' || kind === 'z-index' || kind === 'number') {
    return 'numeric';
  }
  if (kind === 'alias') {
    return 'alias';
  }
  return 'default';
}

// ────────────────────────────────────────────────────────────────────────────
// Kind → 1-character glyph (shown in the leader column for non-color rows)
// ────────────────────────────────────────────────────────────────────────────

export function kindGlyph(kind: CssVariableKind): string {
  if (kind === 'spacing' || kind === 'dimension' || kind === 'length') {
    return '⇿';
  }
  if (kind === 'radius') {
    return '◜';
  }
  if (kind === 'shadow') {
    return '◐';
  }
  if (kind === 'duration') {
    return '◷';
  }
  if (kind === 'opacity') {
    return '◑';
  }
  if (kind === 'font-size' || kind === 'font-family' || kind === 'line-height') {
    return 'T';
  }
  if (kind === 'font-weight') {
    return 'W';
  }
  if (kind === 'border-width') {
    return '─';
  }
  if (kind === 'alias') {
    return '∗';
  }
  return '•';
}

// ────────────────────────────────────────────────────────────────────────────
// Numeric parsing — robust against trailing units / NaN.
// ────────────────────────────────────────────────────────────────────────────

export function parseNumeric(value: string): number {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

// ────────────────────────────────────────────────────────────────────────────
// Editor selection — given a kind, what editor should we render?
// (UI dispatch table.)
// ────────────────────────────────────────────────────────────────────────────

export type EditorVariant = 'color' | 'opacity-slider' | 'font-weight-slider' | 'text';

export function editorForKind(kind: CssVariableKind): EditorVariant {
  if (kind === 'color') {
    return 'color';
  }
  if (kind === 'opacity') {
    return 'opacity-slider';
  }
  if (kind === 'font-weight') {
    return 'font-weight-slider';
  }
  return 'text';
}

// ────────────────────────────────────────────────────────────────────────────
// Display helper — short hint for the row tooltip ("opacity · used in .btn")
// ────────────────────────────────────────────────────────────────────────────

export function rowTooltip(name: string, kind: CssVariableKind, consumedBy: string[]): string {
  const usage = consumedBy.length > 0 ? ' · used in ' + consumedBy.join(', ') : '';
  return name + ' · ' + kind + usage;
}

// ────────────────────────────────────────────────────────────────────────────
// Color resolution — strip a `var(--x)` wrapper so the swatch shows the
// computed value, not the expression.
// ────────────────────────────────────────────────────────────────────────────

export function resolveSwatchValue(rawValue: string, resolvedValue: string): string {
  if (rawValue.startsWith('var(')) {
    return resolvedValue;
  }
  return rawValue;
}
```

## What's *not* here

- **No DOM helpers** — the Studio doesn't manipulate the document directly (the iframe is owned by `Browser` + `Loomer`).
- **No URL parsing** — kept in `store.ts` because it's tied to the target store.
- **No clipboard helpers** — defer until we add "copy hex" affordances.
- **No keyboard shortcut helpers** — those live in `Studio.svelte` (Phase 7) where the listener actually attaches.

## Verification

- [ ] All functions pure.
- [ ] Exhaustive over `CssVariableKind`.
- [ ] No imports from `./store` or `./sdk-bridge`.
- [ ] No falsy/truthy on non-booleans.
- [ ] `svelte-check` clean.
