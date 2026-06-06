import { decodeString, isJSON } from 'type-decoder';
import {
  ApplyCssVariablesPayload,
  CleanupFn,
  CssVariableMap,
  CssVariableOverrides,
  MessageListener,
  SDKPayload,
  SDKPayloadPayload,
  SDKResponse
} from './types';
import { getConfig, updateConfig } from './state';
import { scrapeCssVariables, scrapeOnMutation, getHostMap } from './scraper';
import {
  applyCssVariables,
  applyElementOverride,
  clearAppliedVariables,
  clearElementOverride
} from './applier';
import { disableInspector, enableInspector, queryElementRect } from './inspector';
import { saveTheme, clearTheme } from './storage';

function decodeStringMap(rawInput: unknown): CssVariableMap | null {
  if (!isJSON(rawInput)) {
    return null;
  }
  const out: CssVariableMap = {};
  for (const key in rawInput) {
    const value = decodeString(rawInput[key]);
    if (value === null) {
      return null;
    }
    out[key] = value;
  }
  return out;
}

let messageListener: MessageListener | null = null;
let mutationCleanup: CleanupFn | null = null;

function safeParseJson(jsonString: string): unknown {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

function decodeSDKPayloadPayload(rawInput: unknown): SDKPayloadPayload | null {
  if (isJSON(rawInput)) {
    return { ...rawInput };
  }
  return null;
}

function decodeSDKPayload(rawInput: unknown): SDKPayload | null {
  if (isJSON(rawInput)) {
    const requestId = decodeString(rawInput['requestId']);
    const service = decodeString(rawInput['service']);
    const payload = decodeSDKPayloadPayload(rawInput['payload']);
    if (requestId !== null && service !== null && payload !== null) {
      return { requestId, service, payload };
    }
  }
  return null;
}

function decodeCssVariableOverrides(rawInput: unknown): CssVariableOverrides | null {
  if (!isJSON(rawInput)) {
    return null;
  }
  const result: CssVariableOverrides = {};
  for (const key in rawInput) {
    const inner = rawInput[key];
    if (!isJSON(inner)) {
      return null;
    }
    const vars: CssVariableMap = {};
    for (const varName in inner) {
      const val = decodeString(inner[varName]);
      if (val === null) {
        return null;
      }
      vars[varName] = val;
    }
    result[key] = vars;
  }
  return result;
}

function decodeApplyCssVariablesPayload(rawInput: unknown): ApplyCssVariablesPayload | null {
  if (!isJSON(rawInput) || rawInput['action'] !== 'applyCssVariables') {
    return null;
  }
  const variables = decodeCssVariableOverrides(rawInput['variables']);
  if (variables === null) {
    return null;
  }
  return {
    action: 'applyCssVariables',
    variables,
    persist: typeof rawInput['persist'] === 'boolean' ? rawInput['persist'] : false
  };
}

export function setupListener(): void {
  messageListener = (event: MessageEvent) => {
    parseAndHandle(event);
  };
  window.addEventListener('message', messageListener);
}

function parseAndHandle(event: unknown): void {
  if (!isJSON(event) || typeof event.data !== 'string') {
    return;
  }
  const eventData = safeParseJson(event.data);
  if (
    !isJSON(eventData) ||
    eventData.source !== 'skinweaver' ||
    typeof eventData.payload !== 'string'
  ) {
    return;
  }
  const sdkPayload = decodeSDKPayload(safeParseJson(eventData.payload));
  if (sdkPayload !== null && sdkPayload.service === 'skinweaver') {
    handleSdkPayload(sdkPayload);
  }
}

function respond(response: SDKResponse): void {
  try {
    window.parent.postMessage(JSON.stringify(response), '*');
  } catch (e) {
    console.error('🕸️ Weaver: Error sending response:', e);
  }
}

function handleSdkPayload(sdkPayload: SDKPayload): void {
  const action = sdkPayload.payload.action;

  if (action === 'listenCssVariables') {
    respond({
      requestId: sdkPayload.requestId,
      service: sdkPayload.service,
      payload: scrapeCssVariables()
    });

    if (mutationCleanup !== null) {
      mutationCleanup();
    }
    mutationCleanup = scrapeOnMutation((mutationResult) => {
      respond({
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload: mutationResult
      });
    });
  } else if (action === 'applyCssVariables') {
    const decoded = decodeApplyCssVariablesPayload(sdkPayload.payload);
    if (decoded !== null) {
      const applied = applyCssVariables(decoded.variables, getHostMap());
      if (decoded.persist || getConfig().persistByDefault) {
        saveTheme(decoded.variables);
      }
      respond({
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload: { action: 'applyCssVariables', applied }
      });
    }
  } else if (action === 'clearTheme') {
    clearAppliedVariables(getHostMap());
    clearTheme();
    respond({
      requestId: sdkPayload.requestId,
      service: sdkPayload.service,
      payload: { action: 'clearTheme', status: 'ok' }
    });
  } else if (action === 'configure') {
    const newConfig = sdkPayload.payload.config;
    if (newConfig !== null && typeof newConfig === 'object') {
      updateConfig(newConfig);
      respond({
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload: { action: 'configure', config: getConfig() }
      });
    }
  } else if (action === 'enableInspector') {
    enableInspector((payload) => {
      respond({
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload
      });
    });
  } else if (action === 'disableInspector') {
    disableInspector();
  } else if (action === 'queryElementRect') {
    const rect = queryElementRect();
    if (rect !== null) {
      respond({
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload: { action: 'elementRect', rect }
      });
    }
  } else if (action === 'applyElementOverride') {
    const elementId = decodeString(sdkPayload.payload['elementId']);
    const declarations = decodeStringMap(sdkPayload.payload['declarations']);
    if (elementId !== null && declarations !== null) {
      applyElementOverride(elementId, declarations);
    }
  } else if (action === 'clearElementOverride') {
    const elementId = decodeString(sdkPayload.payload['elementId']);
    if (elementId !== null) {
      clearElementOverride(elementId);
    }
  } else if (action === 'teardown') {
    teardown();
    respond({
      requestId: sdkPayload.requestId,
      service: sdkPayload.service,
      payload: { action: 'teardown', status: 'ok' }
    });
  }
}

export function teardown(): void {
  if (messageListener !== null) {
    window.removeEventListener('message', messageListener);
    messageListener = null;
  }
  if (mutationCleanup !== null) {
    mutationCleanup();
    mutationCleanup = null;
  }
  disableInspector();
}
