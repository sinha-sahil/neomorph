// Studio-internal state types. These never cross the postMessage bridge and have
// no runtime decoders, so they stay hand-written here. The wire types received
// from the target app (ScrapedResult, SelectedElement, …) are generated from
// types/index.yaml into src/generated/types — run `pnpm generate:types` after editing the spec.

import type { ScrapedResult } from '$generated/types';

export type HostEdits = Record<string, string>;
export type Edits = Record<string, HostEdits>;

/** Per-element style overrides, keyed by a best-effort CSS selector. */
export type ElementEdits = Record<string, Record<string, string>>;

export type HistoryEntry = {
  host: string;
  name: string;
  previousValue: string;
  nextValue: string;
  at: number;
};

export type TargetState = {
  appUrl: string;
  urlDraft: string;
  reloadNonce: number;
};

export type ScrapedState = {
  scraped: ScrapedResult | null;
  activeHostIndex: number;
};

export type HistoryState = {
  entries: HistoryEntry[];
  cursor: number;
};
