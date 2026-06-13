import type { Snippet } from 'svelte';
import type { SelectedElement } from '$lib/modules/connection';

/** Helpers passed from the Inspector shell down to each section. */
export type InspectorCtx = {
  valueOf: (property: string) => string;
  spacingValue: (prefix: string) => string;
  tokenFor: (property: string) => string | null;
  edit: (property: string, value: string) => void;
};

export type InspectorSectionProps = {
  title: string;
  children: Snippet;
};

export type ColorRowProps = {
  label: string;
  value: string;
  token?: string | null;
  onChange: (next: string) => void;
};

export type PropRowProps = {
  label: string;
  value: string;
  swatch?: boolean;
};

export type SelectRowProps = {
  label: string;
  value: string;
  options: string[];
  token?: string | null;
  onChange: (next: string) => void;
};

export type ValueRowProps = {
  label: string;
  value: string;
  token?: string | null;
  onChange: (next: string) => void;
};

export type LayoutSectionProps = {
  ctx: InspectorCtx;
};

export type SpacingSectionProps = {
  ctx: InspectorCtx;
};

export type TypographySectionProps = {
  ctx: InspectorCtx;
};

export type FillSectionProps = {
  ctx: InspectorCtx;
};

export type BorderSectionProps = {
  ctx: InspectorCtx;
  selected: SelectedElement;
};

export type TokensSectionProps = {
  selected: SelectedElement;
};
