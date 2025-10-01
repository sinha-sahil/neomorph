import { SDKPayload } from './types';

export function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

export function decodeSDKPayload(payload: unknown): SDKPayload | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'requestId' in payload &&
    'service' in payload &&
    'payload' in payload &&
    typeof (payload as any).requestId === 'string' &&
    typeof (payload as any).service === 'string' &&
    typeof (payload as any).payload === 'object'
  ) {
    return payload as SDKPayload;
  }
  return null;
}
