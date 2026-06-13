import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import type { ScrapedResult, SelectedElement } from '$generated/types';
import type { ScrapedState, TargetState } from './types';
import { clearEdits, clearElementEdits, clearHistory } from './overrides';

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

const DEFAULT_APP_URL = 'http://localhost:3000';

const targetStore: Writable<TargetState> = writable({
  appUrl: DEFAULT_APP_URL,
  urlDraft: DEFAULT_APP_URL,
  reloadNonce: 0
});

export const target: Readable<TargetState> = { subscribe: targetStore.subscribe };

export function setUrlDraft(value: string): void {
  targetStore.update((s) => ({ ...s, urlDraft: value }));
}

export function applyUrl(): boolean {
  const current = get(targetStore);
  const normalised = normaliseUrl(current.urlDraft);
  if (normalised.length === 0 || normalised === current.appUrl) {
    return false;
  }
  targetStore.set({ appUrl: normalised, urlDraft: normalised, reloadNonce: 0 });
  resetScraped();
  clearEdits();
  clearElementEdits();
  clearHistory();
  return true;
}

/** Force the target iframe to reload (re-fetch the app) without changing the URL. */
export function reloadTarget(): void {
  targetStore.update((s) => ({ ...s, reloadNonce: s.reloadNonce + 1 }));
}

export const dirty: Readable<boolean> = derived(targetStore, (s) => s.urlDraft.trim() !== s.appUrl);

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

export const activeHostName: Readable<string | null> = derived(scrapedStore, (s) => {
  if (s.scraped === null) {
    return null;
  }
  const names = Object.keys(s.scraped);
  return names.at(s.activeHostIndex) ?? null;
});

export const hostNames: Readable<string[]> = derived(scrapedStore, (s) =>
  s.scraped === null ? [] : Object.keys(s.scraped)
);

export const totalTokenCount: Readable<number> = derived(
  [scrapedStore, activeHostName],
  ([$scraped, $activeHost]) => {
    if ($scraped.scraped === null || typeof $activeHost !== 'string') {
      return 0;
    }
    const host = $scraped.scraped[$activeHost];
    if (typeof host !== 'object') {
      return 0;
    }
    return host.variables.length;
  }
);

const selectedStore: Writable<SelectedElement | null> = writable(null);

export const selected: Readable<SelectedElement | null> = { subscribe: selectedStore.subscribe };

export function setSelected(element: SelectedElement | null): void {
  selectedStore.set(element);
}

export function updateSelectedRect(rect: SelectedElement['rect']): void {
  selectedStore.update((current) => (current === null ? current : { ...current, rect }));
}
