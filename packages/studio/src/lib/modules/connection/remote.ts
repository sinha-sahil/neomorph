import { Loomer } from '@neomorph/sdk';
import { decodeElementRect, decodeScrapedResult, decodeSelectedElement } from '$generated/types';
import { resetScraped, setScraped, setSelected, updateSelectedRect } from './store';
import {
  clearEdits,
  clearElementEdits,
  clearHistory,
  pushHistory,
  recordEdit,
  setLastAction
} from './overrides';

let currentLoomer: Loomer | null = null;

export function attachLoomer(container: HTMLElement, appUrl: string): { destroy: () => void } {
  const loomer = new Loomer();
  currentLoomer = loomer;
  loomer.loadApplication(appUrl, container);
  startListening(loomer);
  return {
    destroy() {
      loomer.teardown();
      setSelected(null);
      if (currentLoomer === loomer) {
        currentLoomer = null;
      }
    }
  };
}

function startListening(loomer: Loomer): void {
  loomer.listenCssVariables((payload) => {
    const scraped = decodeScrapedResult(payload);
    if (scraped !== null) {
      setScraped(scraped);
    }
  });
  loomer.onElementSelected((payload) => {
    setSelected(decodeSelectedElement(payload['element']));
  });
  loomer.onElementRect((payload) => {
    const rect = decodeElementRect(payload['rect']);
    if (rect !== null) {
      updateSelectedRect(rect);
    }
  });
  loomer.enableInspector();
}

export function enableInspector(): void {
  if (currentLoomer !== null) {
    currentLoomer.enableInspector();
  }
}

export function disableInspector(): void {
  if (currentLoomer !== null) {
    currentLoomer.disableInspector();
  }
}

export function applyElementStyle(elementId: string, property: string, value: string): void {
  if (currentLoomer !== null) {
    currentLoomer.applyElementOverride(elementId, { [property]: value });
  }
  setLastAction(property + ' = ' + value + ' (element)');
}

export function applyTokenValue(host: string, varName: string, value: string): void {
  if (currentLoomer !== null) {
    currentLoomer.applyCssVariables({ [host]: { [varName]: value } });
  }
  recordEdit(host, varName, value);
  setLastAction(varName + ' = ' + value + ' (token)');
}

export function applyEdit(
  host: string,
  name: string,
  previousValue: string,
  nextValue: string
): void {
  if (previousValue === nextValue) {
    return;
  }
  recordEdit(host, name, nextValue);
  pushHistory({ host, name, previousValue, nextValue, at: Date.now() });
  setLastAction(name + ' = ' + nextValue);
  if (currentLoomer === null) {
    return;
  }
  currentLoomer.applyCssVariables({ [host]: { [name]: nextValue } });
}

export function pushValueDirect(host: string, name: string, value: string): void {
  recordEdit(host, name, value);
  setLastAction(name + ' = ' + value);
  if (currentLoomer === null) {
    return;
  }
  currentLoomer.applyCssVariables({ [host]: { [name]: value } });
}

export function clearAll(): void {
  if (currentLoomer !== null) {
    currentLoomer.clearTheme();
  }
  clearEdits();
  clearElementEdits();
  clearHistory();
  setLastAction('cleared all overrides');
}

export function rescrape(): void {
  if (currentLoomer === null) {
    return;
  }
  startListening(currentLoomer);
  resetScraped();
  setLastAction('rescraping…');
}
