export type DocumentLike = Document | ShadowRoot;

export type DocumentHost = {
  name: string;
  target: DocumentLike;
};

export type HostEntry = {
  name: string;
  target: DocumentLike;
};
export type HostMap = Map<string, HostEntry>;

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

export type MutationResponder = (result: ScrapedResult) => void;

export type MutationObserverConfig = {
  attributes: boolean;
  childList: boolean;
  subtree: boolean;
};

export type CleanupFn = () => void;

export type VoidCallback = (...args: unknown[]) => void;

export type MessageListener = (event: MessageEvent) => void;

export type TimerId = ReturnType<typeof setTimeout> | null;

export type CssVariableMap = Record<string, string>;

export type CssVariableOverrides = Record<string, CssVariableMap>;

export type ApplyResult = Record<string, string[]>;

export type SDKPayloadPayload = Record<string, unknown>;

export type SDKPayload = {
  requestId: string;
  service: string;
  payload: SDKPayloadPayload;
};

export type SDKResponse = {
  requestId: string;
  service: string;
  payload: SDKPayloadPayload;
};

export type ApplyCssVariablesPayload = {
  action: 'applyCssVariables';
  variables: CssVariableOverrides;
  persist: boolean;
};

export type WeaverConfig = {
  debounceMs: number;
  persistenceKey: string;
  persistByDefault: boolean;
  hostFilter: string[] | null;
};

export type ElementRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type RelevantVariable = {
  varName: string;
  property: string;
  resolvedValue: string;
};

export type SelectedElementDescriptor = {
  elementId: string;
  tagName: string;
  id: string;
  classNames: string[];
  rect: ElementRect;
  hostName: string;
  computedStyles: Record<string, string>;
  relevantVariables: RelevantVariable[];
};

export type InspectorEmit = (payload: SDKPayloadPayload) => void;
