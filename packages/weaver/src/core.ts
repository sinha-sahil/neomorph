import { scrapeCssVariables, scrapeOnMutation } from './scraper';
import { HostStyles, SDKPayload, SDKResponse } from './types';
import { safeParseJson, decodeSDKPayload } from './decoders';
import { isJSON } from 'type-decoder';

export function setupListener() {
  window.addEventListener('message', (event) => {
    console.warn('🕸️ Weaver: Received message event', event);
    parseAndHandle(event);
  });
}

function parseAndHandle(event: unknown) {
  if (isJSON(event) && typeof event.data === 'string') {
    const eventData = safeParseJson(event.data);
    console.warn('🕸️ Weaver: Parsed event data', eventData);
    if (
      isJSON(eventData) &&
      eventData.source === 'skinweaver' &&
      typeof eventData.payload === 'string'
    ) {
      const eventPayload = safeParseJson(eventData.payload);
      const sdkPaylod = decodeSDKPayload(eventPayload);
      console.log('🕸️ Weaver: Handling SDK payload', { eventPayload, sdkPaylod });
      if (sdkPaylod !== null && sdkPaylod.service === 'skinweaver') {
        handleSdkPayload(sdkPaylod);
      }
    }
  }
}

export function respond(response: SDKResponse) {
  try {
    window.parent.postMessage(JSON.stringify(response), '*');
  } catch (e) {
    console.error('🕸️ Weaver: Error sending response:', e);
  }
}

async function handleSdkPayload(sdkPayload: SDKPayload) {
  if (sdkPayload.payload.action === 'listenCssVariables') {
    console.log('🕸️ Weaver: Scraping CSS variables and setting up mutation observer...');
    const result = scrapeCssVariables();
    const response: SDKResponse = {
      requestId: sdkPayload.requestId,
      service: sdkPayload.service,
      payload: Object.fromEntries(result)
    };
    respond(response);

    scrapeOnMutation((mutationResult: Map<string, HostStyles>) => {
      const mutationResponse: SDKResponse = {
        requestId: sdkPayload.requestId,
        service: sdkPayload.service,
        payload: Object.fromEntries(mutationResult)
      };
      respond(mutationResponse);
    });
  }
}
