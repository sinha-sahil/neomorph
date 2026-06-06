import { decodeString, isJSON } from "type-decoder";

export type DocumentHost = { name: string; target: DocumentLike };
export type DocumentLike = Document | ShadowRoot;

export type CSSProperty = {
  property: string;
  value: string;
};

export type HostStyles = Map<string, Array<CSSProperty>>;

export type SDKPayload = {
  requestId: string;
  service: string;
  payload: SDKPayloadPayload;
};

export type SDKPayloadPayload = Record<string, unknown>;

export type SDKResponse = SDKPayload;

export type StylesCallback = (val: SDKPayloadPayload) => void;

export function decodeCssProperty(rawInput: unknown): CSSProperty | null {
  if (isJSON(rawInput)) {
    const decodedProperty = decodeString(rawInput["property"]);
    const decodedValue = decodeString(rawInput["value"]);
    if (decodedProperty !== null && decodedValue !== null) {
      return {
        property: decodedProperty,
        value: decodedValue,
      };
    }
  }
  return null;
}

export function decodeSDKPayload(rawInput: unknown): SDKPayload | null {
  if (isJSON(rawInput)) {
    const decodedRequestId = decodeString(rawInput["requestId"]);
    const decodedService = decodeString(rawInput["service"]);
    const decodedPayload = decodeSDKPayloadPayload(rawInput["payload"]);
    if (
      decodedRequestId !== null &&
      decodedService !== null &&
      decodedPayload !== null
    ) {
      return {
        requestId: decodedRequestId,
        service: decodedService,
        payload: decodedPayload,
      };
    }
  }
  return null;
}

export function decodeSDKPayloadPayload(
  rawInput: unknown,
): SDKPayloadPayload | null {
  if (isJSON(rawInput)) {
    return {
      ...rawInput,
    };
  }
  return null;
}

export const decodeSDKResponse: (rawInput: unknown) => SDKResponse | null =
  decodeSDKPayload;
