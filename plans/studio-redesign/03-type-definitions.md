# Phase 3 — Type Definitions

> All types Studio needs, in one file (`lib/studio/types.ts`). Manual — no type-crafter in this project.

## Objectives

- Codify the **payload shape** Loomer hands us (scraped variables).
- Codify the **edit state** (local user edits per host, per variable).
- Codify the **UI grouping** (which kinds collapse into which group label).
- Codify the **history entry** for undo / redo.

## Critical rules

1. Always `type`, never `interface` (CODE_GUIDELINES §1).
2. No `undefined` keyword in declarations — use `T | null` (CODE_GUIDELINES §3).
3. Closed unions over open strings wherever possible.
4. No types containing functions in this file — those belong inline in their `.svelte` component (Phase 7).

## `lib/studio/types.ts`

```ts
// ────────────────────────────────────────────────────────────────────────────
// Scraped variable model — mirrors what Loomer hands us from Weaver.
// ────────────────────────────────────────────────────────────────────────────

export type CssVariableKind =
  | 'color'
  | 'spacing'
  | 'dimension'
  | 'font-size'
  | 'font-family'
  | 'font-weight'
  | 'line-height'
  | 'radius'
  | 'border-width'
  | 'shadow'
  | 'duration'
  | 'z-index'
  | 'opacity'
  | 'number'
  | 'length'
  | 'alias'
  | 'unknown';

export type DefinedVariable = {
  name: string;
  value: string;            // the source expression, possibly `var(--other)`
  resolvedValue: string;    // computed value after `var()` resolution
  definedIn: string[];      // selector(s) where this var is declared
  consumedBy: string[];     // selector(s) using `var(--name)`
  kind: CssVariableKind;
};

export type ScrapedHost = {
  variables: DefinedVariable[];
};

export type ScrapedResult = Record<string, ScrapedHost>;

// ────────────────────────────────────────────────────────────────────────────
// Local edits — one map per host.
// ────────────────────────────────────────────────────────────────────────────

export type HostEdits = Record<string, string>;       // varName → new value
export type Edits = Record<string, HostEdits>;        // host → HostEdits

// ────────────────────────────────────────────────────────────────────────────
// Undo / redo history.
// ────────────────────────────────────────────────────────────────────────────

export type HistoryEntry = {
  host: string;
  name: string;
  previousValue: string;
  nextValue: string;
  // timestamp keeps entries identity-stable across re-render
  at: number;
};

// ────────────────────────────────────────────────────────────────────────────
// UI grouping.
// ────────────────────────────────────────────────────────────────────────────

export type GroupName =
  | 'color'
  | 'typography'
  | 'sizing'
  | 'shadow'
  | 'motion'
  | 'numeric'
  | 'alias'
  | 'default';

export type GroupDescriptor = {
  name: GroupName;
  label: string;
};

export type TokenGroup = {
  name: GroupName;
  label: string;
  variables: DefinedVariable[];
};

// ────────────────────────────────────────────────────────────────────────────
// Theme mode (Studio's own chrome).
// ────────────────────────────────────────────────────────────────────────────

export type StudioThemeMode = 'light' | 'dark';
```

## What's *intentionally* not in this file

- **`StudioStore` shape** — lives in `store.ts` as a private detail because the store is broken into several smaller writables (Phase 4), not one big object.
- **Component prop types** — written inline in each `.svelte` (Phase 7), because they contain callbacks (`onChange`, `onApply`) and `CODE_GUIDELINES.md` puts function-bearing types at the call site.

## Decoding (where it lives)

Decoding `unknown` Loomer payloads → `ScrapedResult` lives in **`sdk-bridge.ts`** (Phase 5), not in `types.ts`. Rationale: decoders depend only on the types, not vice versa; and there's only one boundary that needs decoding (the SDK), so a single co-located helper keeps the surface tight.

## Verification

- [ ] `lib/studio/types.ts` compiles cleanly under `svelte-check`.
- [ ] No `interface` keyword anywhere.
- [ ] No `undefined` keyword (only `null` for optional values).
- [ ] Every union is closed.
- [ ] No callback types — those are inline in `.svelte` files.
