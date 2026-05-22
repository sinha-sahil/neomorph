export type CSSProperty = {
  property: string;
  value: string;
};

export type DocumentLike = Document | ShadowRoot;

export type DocumentHost = {
  name: string;
  target: DocumentLike;
};

export type HostStyles = Map<string, Array<CSSProperty>>;

export type HostStyleEntry = {
  name: string;
  target: DocumentLike;
  styles: HostStyles;
};

export type HostStyleMap = Map<string, HostStyleEntry>;

export type ScrapedResult = Map<string, HostStyles>;

export type SerializedHostStyles = Record<string, Record<string, unknown>>;

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
