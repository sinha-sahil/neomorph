import type { DefinedVariable } from '$lib/modules/connection';

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

export type EditorVariant = 'color' | 'opacity-slider' | 'font-weight-slider' | 'text';

export type EmptyStateProps = {
  title: string;
  body: string;
  hint?: string;
};

export type NumericEditorVariant = 'opacity' | 'font-weight';

export type NumericEditorProps = {
  value: string;
  variant: NumericEditorVariant;
  onChange: (next: string) => void;
};

export type TextEditorProps = {
  value: string;
  onChange: (next: string) => void;
};

export type TokenEditorProps = {
  variable: DefinedVariable;
  value: string;
  onChange: (next: string) => void;
};

export type TokenGroupProps = {
  group: TokenGroup;
  host: string;
};

export type TokenRowProps = {
  variable: DefinedVariable;
  host: string;
};

export type ScopeSwitcherItem = {
  id: string;
  label: string;
};
