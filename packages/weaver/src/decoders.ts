import { decodeString, isJSON } from 'type-decoder';
import { SDKPayload, SDKPayloadPayload } from './types';

export function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export function decodeSDKPayload(rawInput: unknown): SDKPayload | null {
  if (isJSON(rawInput)) {
    const decodedRequestId = decodeString(rawInput['requestId']);
    const decodedService = decodeString(rawInput['service']);
    const decodedPayload = decodeSDKPayloadPayload(rawInput['payload']);
    if (decodedRequestId !== null && decodedService !== null && decodedPayload !== null) {
      return {
        requestId: decodedRequestId,
        service: decodedService,
        payload: decodedPayload
      };
    }
  }
  return null;
}

export function decodeSDKPayloadPayload(rawInput: unknown): SDKPayloadPayload | null {
  if (isJSON(rawInput)) {
    return {
      ...rawInput
    };
  }
  return null;
}
