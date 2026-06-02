import type { CssVariableKind, GroupName } from './types';

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

export function parseNumeric(value: string): number {
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

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

export function rowTooltip(name: string, kind: CssVariableKind, consumedBy: string[]): string {
	const usage = consumedBy.length > 0 ? ' · used in ' + consumedBy.join(', ') : '';
	return name + ' · ' + kind + usage;
}

export function resolveSwatchValue(rawValue: string, resolvedValue: string): string {
	if (rawValue.startsWith('var(')) {
		return resolvedValue;
	}
	return rawValue;
}

export function normaliseUrl(input: string): string {
	const trimmed = input.trim();
	if (trimmed.length === 0) {
		return '';
	}
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}
	return 'http://' + trimmed;
}
