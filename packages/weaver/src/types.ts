export type CSSProperty = {
  property: string;
  value: string;
};

export type DocumentHost = {
  name: string;
  target: DocumentLike;
};

export type DocumentLike = Document | ShadowRoot;

export type HostStyles = Map<string, Array<CSSProperty>>;

export type SDKPayload = {
  requestId: string;
  service: string;
  payload: SDKPayloadPayload;
};

export type SDKPayloadPayload = Record<string, unknown>;

export type SDKResponse = {
  requestId: string;
  service: string;
  payload: Record<string, unknown>;
};
