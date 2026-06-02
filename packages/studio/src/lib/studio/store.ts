import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import type {
	Edits,
	GroupDescriptor,
	HistoryEntry,
	ScrapedResult,
	StudioThemeMode,
	TokenGroup
} from './types';
import { kindGroup, normaliseUrl } from './utils';

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

export function applyUrl(): boolean {
	const current = get(targetStore);
	const normalised = normaliseUrl(current.urlDraft);
	if (normalised.length === 0 || normalised === current.appUrl) {
		return false;
	}
	targetStore.set({ appUrl: normalised, urlDraft: normalised });
	resetScraped();
	clearEdits();
	clearHistory();
	return true;
}

export const dirty: Readable<boolean> = derived(targetStore, (s) => s.urlDraft.trim() !== s.appUrl);

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

type HistoryState = {
	entries: HistoryEntry[];
	cursor: number;
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

export function toggleThemeMode(): void {
	uiStore.update((s) => ({
		...s,
		themeMode: s.themeMode === 'light' ? 'dark' : 'light'
	}));
}

export function setLastAction(message: string): void {
	uiStore.update((s) => ({ ...s, lastAction: message }));
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

export const filteredCount: Readable<number> = derived(groupedVariables, (groups) =>
	groups.reduce((sum, g) => sum + g.variables.length, 0)
);
