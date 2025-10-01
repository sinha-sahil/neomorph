import { CSSProperty, DocumentHost, DocumentLike, HostStyles } from './types';

const HostStyleMap: Map<string, { name: string; target: DocumentLike; styles: HostStyles }> =
  new Map();

export function scrapeOnMutation(responder: (result: Map<string, HostStyles>) => void) {
  const hosts = scrapeDocumentHosts();
  const config = { attributes: false, childList: true, subtree: false };

  const callback = () => {
    const result = scrapeCssVariables();
    responder(result);
  };
  hosts.forEach((host) => {
    if (host.name === 'document') {
      return;
    }

    const observer = new MutationObserver(callback);
    observer.observe(host.target, config);
  });
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

  return hosts;
}

function scrapeCSSVariables(rootElement: DocumentLike): HostStyles {
  const styleSheets: StyleSheetList = rootElement.styleSheets;
  const map = new Map<string, Array<CSSProperty>>();

  try {
    for (const sheet of styleSheets) {
      const cssRules: CSSRuleList = sheet.cssRules;
      for (const rule of cssRules) {
        const styleRule = rule as CSSStyleRule;
        const style: CSSStyleDeclaration = styleRule.style;
        if (typeof style === 'object') {
          const styleRecord = JSON.parse(JSON.stringify(style));
          const variables = [];
          for (const prop in styleRecord) {
            const value = styleRecord[prop];
            if (value !== '' && containsCssVariable(value)) {
              variables.push({
                property: prop,
                value: value
              });
            }
          }
          if (variables.length > 0) {
            map.set(styleRule.selectorText, variables);
          }
        }
      }
    }
  } catch (error) {
    console.error('🕸️ Weaver: Error scraping CSS variables:', error);
  }

  return map;
}

export function scrapeCssVariables(): Map<string, HostStyles> {
  const hosts = scrapeDocumentHosts();
  const result = new Map<string, HostStyles>();
  hosts.forEach((host) => {
    const styles = scrapeCSSVariables(host.target);
    result.set(host.name, styles);
    HostStyleMap.set(host.name, {
      name: host.name,
      target: host.target,
      styles: styles
    });
  });

  console.log('🕸️ Weaver: Scraped CSS variables:', result);

  return result;
}
