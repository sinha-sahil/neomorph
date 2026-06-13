import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import type { Edits, ElementEdits, HistoryEntry, HistoryState } from './types';

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

const elementEditsStore: Writable<ElementEdits> = writable({});

export const elementEdits: Readable<ElementEdits> = { subscribe: elementEditsStore.subscribe };

/** Track a per-element style override against a best-effort CSS selector. */
export function recordElementEdit(selector: string, property: string, value: string): void {
  elementEditsStore.update((current) => {
    const forSelector = current[selector];
    if (typeof forSelector === 'object') {
      return { ...current, [selector]: { ...forSelector, [property]: value } };
    }
    return { ...current, [selector]: { [property]: value } };
  });
}

export function clearElementEdits(): void {
  elementEditsStore.set({});
}

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
  const current = get(historyStore);
  if (current.cursor < 0) {
    return null;
  }
  const popped = current.entries.at(current.cursor) ?? null;
  historyStore.set({ entries: current.entries, cursor: current.cursor - 1 });
  return popped;
}

export function stepRedo(): HistoryEntry | null {
  const current = get(historyStore);
  if (current.cursor >= current.entries.length - 1) {
    return null;
  }
  const nextCursor = current.cursor + 1;
  const entry = current.entries.at(nextCursor) ?? null;
  historyStore.set({ entries: current.entries, cursor: nextCursor });
  return entry;
}

export function clearHistory(): void {
  historyStore.set({ entries: [], cursor: -1 });
}

export const canUndo: Readable<boolean> = derived(historyStore, (s) => s.cursor >= 0);
export const canRedo: Readable<boolean> = derived(
  historyStore,
  (s) => s.cursor < s.entries.length - 1
);

const lastActionStore: Writable<string | null> = writable(null);

export const lastAction: Readable<string | null> = { subscribe: lastActionStore.subscribe };

export function setLastAction(message: string): void {
  lastActionStore.set(message);
}
