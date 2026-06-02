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
	value: string;
	resolvedValue: string;
	definedIn: string[];
	consumedBy: string[];
	kind: CssVariableKind;
};

export type ScrapedHost = {
	variables: DefinedVariable[];
};

export type ScrapedResult = Record<string, ScrapedHost>;

export type HostEdits = Record<string, string>;
export type Edits = Record<string, HostEdits>;

export type HistoryEntry = {
	host: string;
	name: string;
	previousValue: string;
	nextValue: string;
	at: number;
};

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

export type StudioThemeMode = 'light' | 'dark';
