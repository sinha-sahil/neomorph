export interface CSSProperty {
  property: string;
  value: string;
}

export interface DocumentHost {
  name: string;
  target: DocumentLike;
}

export type DocumentLike = Document | ShadowRoot;

export type HostStyles = Map<string, Array<CSSProperty>>;

export interface SDKPayload {
  requestId: string;
  service: string;
  payload: {
    action: string;
    [key: string]: unknown;
  };
}

export interface SDKResponse {
  requestId: string;
  service: string;
  payload: Record<string, unknown>;
}