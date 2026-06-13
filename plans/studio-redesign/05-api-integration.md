# Phase 5 — SDK Integration ("API integration", reinterpreted)

_Sync note (2026-06-07): this shipped, but the single SDK-importing file is `lib/modules/connection/remote.ts` (not `lib/studio/sdk-bridge.ts`); `attachLoomer` / `applyEdit` / `pushValueDirect` / `clearAll` / `rescrape` all live there. See `00-overview.md` Sync note._

> Studio has no HTTP backend. The "API" we integrate with is `Loomer` from `@neomorph/sdk`. This phase implements `lib/studio/sdk-bridge.ts` — the only file that imports from the SDK.

## Objectives

- Own the `Loomer` lifecycle (attach on iframe mount, teardown on remount or unmount).
- Decode the loose `Record<string, unknown>` payload Loomer hands us into typed `ScrapedResult`.
- Push edits through `loomer.applyCssVariables(...)` while recording undo history.
- Provide `clearAll()` and `rescrape()` actions.

## Critical rules

- This is the **only** file that imports `@neomorph/sdk`. Everything else uses these functions.
- Manual decoders here (no type-crafter). Reject malformed payloads (return empty rather than throw).
- No `as` type assertions (CODE_GUIDELINES). Use field-by-field validation.
- Use `typeof` for type narrowing — never falsy checks.

## `lib/studio/sdk-bridge.ts`

```ts
import { Loomer } from '@neomorph/sdk';
import type {
  CssVariableKind,
  DefinedVariable,
  ScrapedHost,
  ScrapedResult
} from './types';
import {
  pushHistory,
  recordEdit,
  resetScraped,
  setLastAction,
  setScraped,
  clearEdits,
  clearHistory
} from './store';

// ────────────────────────────────────────────────────────────────────────────
// Decoding — convert untyped Loomer payload → typed model.
// ────────────────────────────────────────────────────────────────────────────

const KIND_VALUES: CssVariableKind[] = [
  'color', 'spacing', 'dimension',
  'font-size', 'font-family', 'font-weight', 'line-height',
  'radius', 'border-width', 'shadow', 'duration',
  'z-index', 'opacity', 'number', 'length', 'alias'
];

function decodeKind(v: unknown): CssVariableKind {
  if (typeof v !== 'string') {
    return 'unknown';
  }
  return KIND_VALUES.includes(v as CssVariableKind) ? (v as CssVariableKind) : 'unknown';
  // (cast above is *only* a narrowed-already check — equivalent to `v` after
  // includes() — kept because TS can't narrow array.includes today; if the
  // ESLint config prohibits this, refactor to a switch over KIND_VALUES.)
}

function decodeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return [];
  }
  const out: string[] = [];
  for (const s of v) {
    if (typeof s === 'string') {
      out.push(s);
    }
  }
  return out;
}

function decodeVariable(item: unknown): DefinedVariable | null {
  if (typeof item !== 'object' || item === null) {
    return null;
  }
  let name: string | null = null;
  let value: string | null = null;
  let resolvedValue: string | null = null;
  let definedIn: string[] = [];
  let consumedBy: string[] = [];
  let kind: CssVariableKind = 'unknown';

  for (const [k, val] of Object.entries(item)) {
    if (k === 'name' && typeof val === 'string') { name = val; }
    else if (k === 'value' && typeof val === 'string') { value = val; }
    else if (k === 'resolvedValue' && typeof val === 'string') { resolvedValue = val; }
    else if (k === 'definedIn') { definedIn = decodeStringArray(val); }
    else if (k === 'consumedBy') { consumedBy = decodeStringArray(val); }
    else if (k === 'kind') { kind = decodeKind(val); }
  }

  if (name === null || value === null || resolvedValue === null) {
    return null;
  }
  return { name, value, resolvedValue, definedIn, consumedBy, kind };
}

function decodeHost(item: unknown): ScrapedHost {
  if (typeof item !== 'object' || item === null) {
    return { variables: [] };
  }
  const variables: DefinedVariable[] = [];
  for (const [, v] of Object.entries(item)) {
    if (!Array.isArray(v)) { continue; }
    for (const raw of v) {
      const decoded = decodeVariable(raw);
      if (decoded !== null) {
        variables.push(decoded);
      }
    }
  }
  return { variables };
}

export function decodeScraped(payload: Record<string, unknown>): ScrapedResult {
  const out: ScrapedResult = {};
  for (const [host, raw] of Object.entries(payload)) {
    if (typeof raw !== 'object' || raw === null) { continue; }
    out[host] = decodeHost(raw);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Loomer attachment — Svelte action shape: returns { destroy() }.
// ────────────────────────────────────────────────────────────────────────────

let currentLoomer: Loomer | null = null;

export function attachLoomer(container: HTMLElement, appUrl: string): { destroy: () => void } {
  const loomer = new Loomer();
  currentLoomer = loomer;
  loomer.loadApplication(appUrl, container);
  startListening(loomer);
  return {
    destroy() {
      loomer.teardown();
      if (currentLoomer === loomer) {
        currentLoomer = null;
      }
    }
  };
}

function startListening(loomer: Loomer): void {
  loomer.listenCssVariables((payload) => {
    const decoded = decodeScraped(payload);
    setScraped(decoded);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Actions: apply one edit, clear all, rescrape.
// ────────────────────────────────────────────────────────────────────────────

export function applyEdit(
  host: string,
  name: string,
  previousValue: string,
  nextValue: string
): void {
  recordEdit(host, name, nextValue);
  pushHistory({ host, name, previousValue, nextValue, at: Date.now() });
  setLastAction(name + ' = ' + nextValue);
  if (currentLoomer === null) { return; }
  currentLoomer.applyCssVariables({ [host]: { [name]: nextValue } });
}

export function applyBatch(updates: Array<{ host: string; name: string; value: string }>): void {
  if (currentLoomer === null) { return; }
  const grouped: Record<string, Record<string, string>> = {};
  for (const { host, name, value } of updates) {
    const hostMap = grouped[host];
    if (typeof hostMap === 'object') {
      hostMap[name] = value;
    } else {
      grouped[host] = { [name]: value };
    }
    recordEdit(host, name, value);
  }
  currentLoomer.applyCssVariables(grouped);
}

export function clearAll(): void {
  if (currentLoomer === null) { return; }
  currentLoomer.clearTheme();
  clearEdits();
  clearHistory();
  setLastAction('cleared all overrides');
}

export function rescrape(): void {
  if (currentLoomer === null) { return; }
  startListening(currentLoomer);
  setLastAction('rescraped variables');
}

// Used by undo/redo to push values back through Loomer without
// double-pushing to history (callers handle history separately).
export function pushValueDirect(host: string, name: string, value: string): void {
  recordEdit(host, name, value);
  if (currentLoomer === null) { return; }
  currentLoomer.applyCssVariables({ [host]: { [name]: value } });
}
```

## Notes

- A single module-level `currentLoomer` is fine because Studio only ever holds one iframe at a time (the route key remounts on URL change).
- All public side-effects funnel through `applyEdit` → store + history + Loomer. UI components don't touch Loomer directly.
- `applyBatch` exists for a future "apply preset theme" feature; not used in v1 of the rebuild but cheap to include.
- `pushValueDirect` is the undo/redo's escape hatch: it updates the edit map + pushes to Loomer without adding a new history entry.

## Verification

- [ ] Only `sdk-bridge.ts` imports `@neomorph/sdk`. (`grep -r "@neomorph/sdk" packages/studio/src` should show this file only.)
- [ ] Decoder rejects malformed entries silently (returns `null` / empty).
- [ ] No `as` outside the one narrowed `KIND_VALUES.includes` case — and if ESLint forbids it, refactor to a `switch` instead.
- [ ] No `undefined`.
- [ ] `svelte-check` clean.
