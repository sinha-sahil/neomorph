import {
  CSSProperty,
  CleanupFn,
  DocumentHost,
  DocumentLike,
  HostStyles,
  HostStyleMap,
  MutationObserverConfig,
  MutationResponder,
  ScrapedResult,
  TimerId,
  VoidCallback
} from './types';
import { getConfig, isApplying } from './state';

const hostStyleMap: HostStyleMap = new Map();

export function getHostStyleMap(): HostStyleMap {
  return hostStyleMap;
}

function debounce(fn: VoidCallback, delay: number): VoidCallback & { cancel: CleanupFn } {
  let timer: TimerId = null;
  return Object.assign(
    (...args: unknown[]) => {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay);
    },
    {
      cancel: () => {
        if (timer !== null) {
          clearTimeout(timer);
          timer = null;
        }
      }
    }
  );
}

function containsCssVariable(value: string): boolean {
  return value.startsWith('--') || value.includes('var(--');
}

function scrapeDocumentHosts(): Array<DocumentHost> {
  const hosts: Array<DocumentHost> = [
    {
      name: 'document',
      target: document
    }
  ];

  const elements = document.querySelectorAll('*');

  for (const elem of elements) {
    if (elem.shadowRoot instanceof ShadowRoot) {
      hosts.push({
        name: elem.tagName,
        target: elem.shadowRoot
      });
    }
  }

  const filter = getConfig().hostFilter;
  if (filter !== null) {
    return hosts.filter((h) => filter.includes(h.name));
  }
  return hosts;
}

function scrapeHostStyles(rootElement: DocumentLike): HostStyles {
  const map: HostStyles = new Map();

  try {
    const styleSheets: StyleSheetList = rootElement.styleSheets;
    for (const sheet of styleSheets) {
      const cssRules: CSSRuleList = sheet.cssRules;
      for (const rule of cssRules) {
        if (!(rule instanceof CSSStyleRule)) {
          continue;
        }
        const style: CSSStyleDeclaration = rule.style;
        if (typeof style === 'object') {
          const styleRecord = JSON.parse(JSON.stringify(style));
          const variables: Array<CSSProperty> = [];
          for (const prop in styleRecord) {
            const value: string = styleRecord[prop];
            if (value !== '' && containsCssVariable(value)) {
              variables.push({
                property: prop,
                value: value
              });
            }
          }
          if (variables.length > 0) {
            map.set(rule.selectorText, variables);
          }
        }
      }
    }
  } catch (error) {
    console.error('🕸️ Weaver: Error scraping CSS variables:', error);
  }

  return map;
}

export function scrapeCssVariables(): ScrapedResult {
  const hosts = scrapeDocumentHosts();
  const result: ScrapedResult = new Map();
  hosts.forEach((host) => {
    const styles = scrapeHostStyles(host.target);
    result.set(host.name, styles);
    hostStyleMap.set(host.name, {
      name: host.name,
      target: host.target,
      styles: styles
    });
  });

  return result;
}

export function scrapeOnMutation(responder: MutationResponder): CleanupFn {
  const hosts = scrapeDocumentHosts();
  const config: MutationObserverConfig = { attributes: false, childList: true, subtree: false };
  const observers: Array<MutationObserver> = [];

  const callback = debounce(() => {
    if (isApplying()) {
      return;
    }
    responder(scrapeCssVariables());
  }, getConfig().debounceMs);

  hosts.forEach((host) => {
    if (host.name === 'document') {
      return;
    }
    const observer = new MutationObserver(callback);
    observer.observe(host.target, config);
    observers.push(observer);
  });

  return () => {
    observers.forEach((obs) => obs.disconnect());
    callback.cancel();
  };
}
