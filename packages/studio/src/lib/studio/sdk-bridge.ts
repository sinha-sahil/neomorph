import { Loomer } from '@neomorph/sdk';
import type { CssVariableKind, DefinedVariable, ScrapedHost, ScrapedResult } from './types';
import {
	clearEdits,
	clearHistory,
	pushHistory,
	recordEdit,
	resetScraped,
	setLastAction,
	setScraped
} from './store';

const KIND_VALUES: readonly CssVariableKind[] = [
	'color',
	'spacing',
	'dimension',
	'font-size',
	'font-family',
	'font-weight',
	'line-height',
	'radius',
	'border-width',
	'shadow',
	'duration',
	'z-index',
	'opacity',
	'number',
	'length',
	'alias'
];

function decodeKind(v: unknown): CssVariableKind {
	if (typeof v !== 'string') {
		return 'unknown';
	}
	for (const known of KIND_VALUES) {
		if (known === v) {
			return known;
		}
	}
	return 'unknown';
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
		if (k === 'name' && typeof val === 'string') {
			name = val;
		} else if (k === 'value' && typeof val === 'string') {
			value = val;
		} else if (k === 'resolvedValue' && typeof val === 'string') {
			resolvedValue = val;
		} else if (k === 'definedIn') {
			definedIn = decodeStringArray(val);
		} else if (k === 'consumedBy') {
			consumedBy = decodeStringArray(val);
		} else if (k === 'kind') {
			kind = decodeKind(val);
		}
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
		if (!Array.isArray(v)) {
			continue;
		}
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
		if (typeof raw !== 'object' || raw === null) {
			continue;
		}
		out[host] = decodeHost(raw);
	}
	return out;
}

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

export function applyEdit(
	host: string,
	name: string,
	previousValue: string,
	nextValue: string
): void {
	if (previousValue === nextValue) {
		return;
	}
	recordEdit(host, name, nextValue);
	pushHistory({ host, name, previousValue, nextValue, at: Date.now() });
	setLastAction(name + ' = ' + nextValue);
	if (currentLoomer === null) {
		return;
	}
	currentLoomer.applyCssVariables({ [host]: { [name]: nextValue } });
}

export function pushValueDirect(host: string, name: string, value: string): void {
	recordEdit(host, name, value);
	setLastAction(name + ' = ' + value);
	if (currentLoomer === null) {
		return;
	}
	currentLoomer.applyCssVariables({ [host]: { [name]: value } });
}

export function clearAll(): void {
	if (currentLoomer !== null) {
		currentLoomer.clearTheme();
	}
	clearEdits();
	clearHistory();
	setLastAction('cleared all overrides');
}

export function rescrape(): void {
	if (currentLoomer === null) {
		return;
	}
	startListening(currentLoomer);
	resetScraped();
	setLastAction('rescraping…');
}
