# Phase 4 — State Management

_Sync note (2026-06-07): the multiple-small-writables design shipped, but state was later split across modules — edits + undo/redo `historyStore` now live in `lib/modules/connection/overrides.ts`, not a single `lib/studio/store.ts`. See `00-overview.md` Sync note._

> Studio's state, in `lib/studio/store.ts`. Multiple small writables instead of one mega-store.

## Objectives

- Avoid the "single big store" trap (every keystroke notifies every subscriber).
- Group state by **co-change frequency**: things that change together live in one writable; things that change at different cadences live separately.
- Expose **only update functions** — never the raw `update` / `set` to consumers.
- Provide derived stores for: filtered variables, grouped variables, undo/redo availability.

## Critical rules

1. `type`, never `interface`.
2. Immutable updates — never mutate the previous state.
3. Components subscribe via `$store` syntax in Svelte 5 — but we'll be using Svelte 5 runes mostly; the Svelte writable stores still work and integrate via the legacy `$` prefix.
4. No exporting `update` / `set` — only purposeful named functions.

## Store decomposition

| Store | Holds | Changes on |
|---|---|---|
| `targetStore` | `appUrl`, `urlDraft` | URL edits / loads |
| `scrapedStore` | `scraped: ScrapedResult \| null`, `activeHostIndex` | Each rescrape |
| `editsStore` | `edits: Edits` | Each token edit |
| `historyStore` | `entries: HistoryEntry[]`, `cursor: number` | Each edit / undo / redo |
| `uiStore` | `search`, `themeMode`, `lastAction` | Search keystrokes, theme toggle |

Five stores, each owning one orthogonal concern. Components subscribe to only the slice they actually depend on.

## `lib/studio/store.ts`

```ts
import { writable, derived, type Writable, type Readable } from 'svelte/store';
import type {
  Edits,
  GroupDescriptor,
  HistoryEntry,
  ScrapedResult,
  StudioThemeMode,
  TokenGroup
} from './types';
import { kindGroup } from './utils';

// ────────────────────────────────────────────────────────────────────────────
// Target (URL + draft URL)
// ────────────────────────────────────────────────────────────────────────────

const DEFAULT_APP_URL = 'http://localhost:3000';

type TargetState = {
  appUrl: string;
  urlDraft: string;
};

const targetStore: Writable<TargetState> = writable({
  appUrl: DEFAULT_APP_URL,
  urlDraft: DEFAULT_APP_URL
});

export const target: Readable<TargetState> = { subscribe: targetStore.subscribe };

export function setUrlDraft(value: string): void {
  targetStore.update((s) => ({ ...s, urlDraft: value }));
}

export function applyUrl(): void {
  targetStore.update((s) => {
    const normalised = normaliseUrl(s.urlDraft);
    if (normalised.length === 0 || normalised === s.appUrl) {
      return s;
    }
    return { appUrl: normalised, urlDraft: normalised };
  });
}

function normaliseUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return '';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return 'http://' + trimmed;
}

// ────────────────────────────────────────────────────────────────────────────
// Scraped variables
// ────────────────────────────────────────────────────────────────────────────

type ScrapedState = {
  scraped: ScrapedResult | null;
  activeHostIndex: number;
};

const scrapedStore: Writable<ScrapedState> = writable({
  scraped: null,
  activeHostIndex: 0
});

export const scraped: Readable<ScrapedState> = { subscribe: scrapedStore.subscribe };

export function setScraped(next: ScrapedResult): void {
  scrapedStore.update((s) => {
    const hostCount = Object.keys(next).length;
    const safeIndex = s.activeHostIndex >= hostCount ? 0 : s.activeHostIndex;
    return { scraped: next, activeHostIndex: safeIndex };
  });
}

export function setActiveHost(hostName: string): void {
  scrapedStore.update((s) => {
    if (s.scraped === null) {
      return s;
    }
    const idx = Object.keys(s.scraped).indexOf(hostName);
    if (idx < 0) {
      return s;
    }
    return { ...s, activeHostIndex: idx };
  });
}

export function resetScraped(): void {
  scrapedStore.set({ scraped: null, activeHostIndex: 0 });
}

// ────────────────────────────────────────────────────────────────────────────
// Edits
// ────────────────────────────────────────────────────────────────────────────

const editsStore: Writable<Edits> = writable({});

export const edits: Readable<Edits> = { subscribe: editsStore.subscribe };

export function recordEdit(host: string, name: string, value: string): void {
  editsStore.update((current) => {
    const hostEdits = current[host];
    if (typeof hostEdits === 'object') {
      return { ...current, [host]: { ...hostEdits, [name]: value } };
    }
    return { ...current, [host]: { [name]: value } };
  });
}

export function clearEdits(): void {
  editsStore.set({});
}

// ────────────────────────────────────────────────────────────────────────────
// History (undo / redo)
// ────────────────────────────────────────────────────────────────────────────

type HistoryState = {
  entries: HistoryEntry[];
  cursor: number; // index into entries; -1 means "before first entry"
};

const historyStore: Writable<HistoryState> = writable({ entries: [], cursor: -1 });

export const history: Readable<HistoryState> = { subscribe: historyStore.subscribe };

export function pushHistory(entry: HistoryEntry): void {
  historyStore.update((s) => {
    const truncated = s.entries.slice(0, s.cursor + 1);
    const next = [...truncated, entry];
    return { entries: next, cursor: next.length - 1 };
  });
}

export function stepUndo(): HistoryEntry | null {
  let popped: HistoryEntry | null = null;
  historyStore.update((s) => {
    if (s.cursor < 0) {
      return s;
    }
    popped = s.entries.at(s.cursor) ?? null;
    return { entries: s.entries, cursor: s.cursor - 1 };
  });
  return popped;
}

export function stepRedo(): HistoryEntry | null {
  let next: HistoryEntry | null = null;
  historyStore.update((s) => {
    if (s.cursor >= s.entries.length - 1) {
      return s;
    }
    const newCursor = s.cursor + 1;
    next = s.entries.at(newCursor) ?? null;
    return { entries: s.entries, cursor: newCursor };
  });
  return next;
}

export function clearHistory(): void {
  historyStore.set({ entries: [], cursor: -1 });
}

export const canUndo: Readable<boolean> = derived(historyStore, (s) => s.cursor >= 0);
export const canRedo: Readable<boolean> = derived(
  historyStore,
  (s) => s.cursor < s.entries.length - 1
);

// ────────────────────────────────────────────────────────────────────────────
// UI state — search, theme, last action
// ────────────────────────────────────────────────────────────────────────────

type UiState = {
  search: string;
  themeMode: StudioThemeMode;
  lastAction: string | null;
};

const uiStore: Writable<UiState> = writable({
  search: '',
  themeMode: 'light',
  lastAction: null
});

export const ui: Readable<UiState> = { subscribe: uiStore.subscribe };

export function setSearch(value: string): void {
  uiStore.update((s) => ({ ...s, search: value }));
}

export function setThemeMode(mode: StudioThemeMode): void {
  uiStore.update((s) => ({ ...s, themeMode: mode }));
}

export function setLastAction(message: string): void {
  uiStore.update((s) => ({ ...s, lastAction: message }));
}

// ────────────────────────────────────────────────────────────────────────────
// Derived: active host name + variables for active host
// ────────────────────────────────────────────────────────────────────────────

export const activeHostName: Readable<string | null> = derived(
  scrapedStore,
  (s) => {
    if (s.scraped === null) {
      return null;
    }
    const names = Object.keys(s.scraped);
    return names.at(s.activeHostIndex) ?? null;
  }
);

export const hostNames: Readable<string[]> = derived(scrapedStore, (s) =>
  s.scraped === null ? [] : Object.keys(s.scraped)
);

// ────────────────────────────────────────────────────────────────────────────
// Derived: grouped + filtered variables for the active host
// ────────────────────────────────────────────────────────────────────────────

const GROUP_ORDER: GroupDescriptor[] = [
  { name: 'color', label: 'Colors' },
  { name: 'typography', label: 'Typography' },
  { name: 'sizing', label: 'Sizing' },
  { name: 'shadow', label: 'Shadows' },
  { name: 'motion', label: 'Motion' },
  { name: 'numeric', label: 'Numeric' },
  { name: 'alias', label: 'Aliases' },
  { name: 'default', label: 'Other' }
];

export const groupedVariables: Readable<TokenGroup[]> = derived(
  [scrapedStore, uiStore, activeHostName],
  ([$scraped, $ui, $activeHost]) => {
    if ($scraped.scraped === null || typeof $activeHost !== 'string') {
      return [];
    }
    const host = $scraped.scraped[$activeHost];
    if (typeof host !== 'object') {
      return [];
    }
    const term = $ui.search.trim().toLowerCase();
    const filtered =
      term.length === 0
        ? host.variables
        : host.variables.filter((v) => v.name.toLowerCase().includes(term));

    return GROUP_ORDER.map<TokenGroup>(({ name, label }) => ({
      name,
      label,
      variables: filtered.filter((v) => kindGroup(v.kind) === name)
    })).filter((g) => g.variables.length > 0);
  }
);
```

## Notes on patterns

- **Each updater is a named function.** No component calls `editsStore.update(...)` directly.
- **Immutability** — every update spreads the previous state.
- **Subscriptions are minimal.** `groupedVariables` recomputes whenever scraped, ui (search), or active host changes — *not* on every history push or edit. Edits are visualised by reading from `edits` in the row component, not by rebuilding the group list.

## Verification

- [ ] No `interface` keyword.
- [ ] No raw `update` / `set` exported (only named functions + `subscribe`-only readables).
- [ ] No falsy/truthy checks on non-booleans.
- [ ] `groupedVariables` and `activeHostName` are pure derivations.
- [ ] `svelte-check` clean.
