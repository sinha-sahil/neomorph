// Scraping pipeline:
//
// 1. List hosts (document + shadow roots).
// 2. Walk each host's stylesheets.
// 3. Parse rule.style.cssText into declarations.
// 4. `--name: value` → definition.
// 5. `var(--x)` in any value → consumer of x.
// 6. Resolve final values via getComputedStyle.
// 7. Classify by consumer; fall back to value.
// 8. Sort by name, return per host.

import {
  CleanupFn,
  CssVariableKind,
  DefinedVariable,
  DocumentHost,
  DocumentLike,
  HostEntry,
  HostMap,
  MutationObserverConfig,
  MutationResponder,
  ScrapedHost,
  ScrapedResult,
  TimerId,
  VoidCallback
} from './types';
import { getConfig, isApplying } from './state';

const hostMap: HostMap = new Map();

// Cached host-name → DOM target lookup for the applier.
export function getHostMap(): HostMap {
  return hostMap;
}

// Trailing-edge debounce with a cancel hook.
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

// Lists the main document plus every shadow-root host.
function scrapeDocumentHosts(): DocumentHost[] {
  const hosts: DocumentHost[] = [{ name: 'document', target: document }];

  const elements = document.querySelectorAll('*');
  for (const elem of elements) {
    if (elem.shadowRoot instanceof ShadowRoot) {
      hosts.push({ name: elem.tagName, target: elem.shadowRoot });
    }
  }

  const filter = getConfig().hostFilter;
  if (filter !== null) {
    return hosts.filter((h) => filter.includes(h.name));
  }
  return hosts;
}

export const VAR_REF_REGEX = /var\(\s*(--[\w-]+)/g;

// Maps a consumer CSS property to a kind.
function kindFromConsumer(prop: string): CssVariableKind | null {
  if (
    prop === 'color' ||
    prop === 'fill' ||
    prop === 'stroke' ||
    prop === 'caret-color' ||
    prop === 'accent-color' ||
    prop === 'background' ||
    prop.startsWith('background-color') ||
    prop.endsWith('-color') ||
    prop === 'outline-color' ||
    prop === 'text-decoration-color'
  ) {
    return 'color';
  }

  if (
    prop === 'border-width' ||
    prop === 'border-top-width' ||
    prop === 'border-right-width' ||
    prop === 'border-bottom-width' ||
    prop === 'border-left-width' ||
    prop === 'outline-width'
  ) {
    return 'border-width';
  }

  if (prop === 'border-radius' || prop.endsWith('-radius')) {
    return 'radius';
  }

  if (prop === 'box-shadow' || prop === 'text-shadow') {
    return 'shadow';
  }

  if (
    prop === 'padding' ||
    prop.startsWith('padding-') ||
    prop === 'margin' ||
    prop.startsWith('margin-') ||
    prop === 'gap' ||
    prop === 'row-gap' ||
    prop === 'column-gap' ||
    prop === 'inset' ||
    prop === 'top' ||
    prop === 'right' ||
    prop === 'bottom' ||
    prop === 'left'
  ) {
    return 'spacing';
  }

  if (
    prop === 'width' ||
    prop === 'height' ||
    prop === 'min-width' ||
    prop === 'min-height' ||
    prop === 'max-width' ||
    prop === 'max-height'
  ) {
    return 'dimension';
  }

  if (prop === 'font-size') {
    return 'font-size';
  }
  if (prop === 'font-family') {
    return 'font-family';
  }
  if (prop === 'font-weight') {
    return 'font-weight';
  }
  if (prop === 'line-height') {
    return 'line-height';
  }

  if (
    prop === 'transition-duration' ||
    prop === 'animation-duration' ||
    prop === 'transition-delay' ||
    prop === 'animation-delay'
  ) {
    return 'duration';
  }

  if (prop === 'z-index') {
    return 'z-index';
  }
  if (prop === 'opacity') {
    return 'opacity';
  }

  return null;
}

const COLOR_VALUE_REGEX =
  /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\(|hwb\(|lab\(|lch\(|oklab\(|oklch\(|color\(|red|blue|green|black|white|gray|grey|orange|purple|yellow|pink|cyan|magenta|transparent|currentcolor)\b/i;
const LENGTH_VALUE_REGEX = /^-?\d*\.?\d+(px|rem|em|%|vw|vh|vmin|vmax|ch|ex|pt|pc|cm|mm|in)$/i;
const DURATION_VALUE_REGEX = /^-?\d*\.?\d+(ms|s)$/i;
const NUMBER_VALUE_REGEX = /^-?\d*\.?\d+$/;
const ALIAS_REGEX = /^var\(\s*--/;

// Fallback kind, inferred from the value string alone.
function kindFromValue(value: string): CssVariableKind {
  const v = value.trim();
  if (ALIAS_REGEX.test(v)) {
    return 'alias';
  }
  if (COLOR_VALUE_REGEX.test(v)) {
    return 'color';
  }
  if (DURATION_VALUE_REGEX.test(v)) {
    return 'duration';
  }
  if (LENGTH_VALUE_REGEX.test(v)) {
    return 'length';
  }
  if (NUMBER_VALUE_REGEX.test(v)) {
    return 'number';
  }
  return 'unknown';
}

// Pick a kind from consumers, else from value.
function classify(value: string, consumers: Set<string>): CssVariableKind {
  for (const prop of consumers) {
    const kind = kindFromConsumer(prop);
    if (kind !== null) {
      return kind;
    }
  }
  return kindFromValue(value);
}

type DefRecord = { value: string; selectors: Set<string>; consumers: Set<string> };

// Get or create the def record for a name.
function ensureDef(defs: Map<string, DefRecord>, name: string): DefRecord {
  const existing = defs.get(name);
  if (typeof existing === 'object' && existing !== null) {
    return existing;
  }
  const fresh: DefRecord = { value: '', selectors: new Set(), consumers: new Set() };
  defs.set(name, fresh);
  return fresh;
}

type Decl = { prop: string; value: string };

// Splits cssText into prop/value pairs (paren-aware).
// style.item(i) drops shorthand+var() values, so we parse the source.
export function parseDeclarations(cssText: string): Decl[] {
  const out: Decl[] = [];
  let depth = 0;
  let buf = '';
  for (let i = 0; i < cssText.length; i++) {
    const ch = cssText.charAt(i);
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    }
    if (ch === ';' && depth === 0) {
      pushDecl(out, buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  pushDecl(out, buf);
  return out;
}

// Trims and appends one declaration string.
function pushDecl(out: Decl[], raw: string): void {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return;
  }
  const colon = trimmed.indexOf(':');
  if (colon <= 0) {
    return;
  }
  const prop = trimmed.slice(0, colon).trim();
  const value = trimmed.slice(colon + 1).trim();
  if (prop.length === 0 || value.length === 0) {
    return;
  }
  out.push({ prop, value });
}

// A host's regular stylesheets plus its adopted (constructable) ones, which
// are a separate collection from `.styleSheets` (used by Lit/web-component
// design systems and not visible otherwise).
function collectStyleSheets(rootElement: DocumentLike): CSSStyleSheet[] {
  const sheets: CSSStyleSheet[] = [];
  for (const sheet of rootElement.styleSheets) {
    sheets.push(sheet);
  }
  const adopted = rootElement.adoptedStyleSheets;
  if (Array.isArray(adopted)) {
    for (const sheet of adopted) {
      sheets.push(sheet);
    }
  }
  return sheets;
}

// Records definitions + consumers from a single style rule.
function collectFromStyleRule(rule: CSSStyleRule, defs: Map<string, DefRecord>): void {
  for (const decl of parseDeclarations(rule.style.cssText)) {
    if (decl.prop.startsWith('--')) {
      const rec = ensureDef(defs, decl.prop);
      // Last write wins — matches the browser's cascade.
      rec.value = decl.value;
      rec.selectors.add(rule.selectorText);
    }

    VAR_REF_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = VAR_REF_REGEX.exec(decl.value)) !== null) {
      const refName = match.at(1);
      if (typeof refName !== 'string') {
        continue;
      }
      if (!decl.prop.startsWith('--')) {
        ensureDef(defs, refName).consumers.add(decl.prop);
      }
    }
  }
}

// Walks a rule list, descending into grouping rules (@media/@supports/@layer/
// @container and CSS-nesting) and following @import, so variables nested inside
// them are not missed. Keyframes/@font-face fall through and are skipped.
function walkRules(rules: CSSRuleList, defs: Map<string, DefRecord>): void {
  for (const rule of rules) {
    if (rule instanceof CSSStyleRule) {
      collectFromStyleRule(rule, defs);
      if (rule instanceof CSSGroupingRule) {
        walkRules(rule.cssRules, defs);
      }
    } else if (rule instanceof CSSImportRule) {
      if (rule.styleSheet !== null) {
        collectFromSheet(rule.styleSheet, defs);
      }
    } else if (rule instanceof CSSGroupingRule) {
      walkRules(rule.cssRules, defs);
    }
  }
}

// Reads one stylesheet defensively: skips disabled sheets and isolates the
// cross-origin SecurityError / still-loading null, so a single unreadable
// sheet can't abort scraping of all the others.
function collectFromSheet(sheet: CSSStyleSheet, defs: Map<string, DefRecord>): void {
  if (sheet.disabled) {
    return;
  }
  let rules: CSSRuleList | null = null;
  try {
    rules = sheet.cssRules;
  } catch {
    // Cross-origin (fonts/CDN/widget) or otherwise unreadable — skip this one only.
    return;
  }
  if (rules === null) {
    return;
  }
  walkRules(rules, defs);
}

// Builds the variable list for one host.
function scrapeHost(rootElement: DocumentLike): ScrapedHost {
  const defs = new Map<string, DefRecord>();

  for (const sheet of collectStyleSheets(rootElement)) {
    collectFromSheet(sheet, defs);
  }

  const computedSource = resolveComputedSource(rootElement);

  const variables: DefinedVariable[] = [];
  for (const [name, rec] of defs) {
    if (rec.selectors.size === 0) {
      continue;
    }
    const resolved =
      computedSource === null ? rec.value : computedSource.getPropertyValue(name).trim();
    variables.push({
      name,
      value: rec.value,
      resolvedValue: resolved === '' ? rec.value : resolved,
      definedIn: Array.from(rec.selectors),
      consumedBy: Array.from(rec.consumers),
      kind: classify(rec.value, rec.consumers)
    });
  }

  variables.sort((a, b) => a.name.localeCompare(b.name));

  return { variables };
}

// ComputedStyle source for resolving var() aliases.
function resolveComputedSource(rootElement: DocumentLike): CSSStyleDeclaration | null {
  if (rootElement instanceof ShadowRoot) {
    const host = rootElement.host;
    if (host instanceof Element) {
      return getComputedStyle(host);
    }
    return null;
  }
  return getComputedStyle(rootElement.documentElement);
}

// Scrape every host, refresh the host map, return the result.
export function scrapeCssVariables(): ScrapedResult {
  const hosts = scrapeDocumentHosts();
  const result: ScrapedResult = {};

  hosts.forEach((host) => {
    result[host.name] = scrapeHost(host.target);
    const entry: HostEntry = { name: host.name, target: host.target };
    hostMap.set(host.name, entry);
  });

  return result;
}

// Re-scrape on DOM changes (debounced).
export function scrapeOnMutation(responder: MutationResponder): CleanupFn {
  const hosts = scrapeDocumentHosts();
  const config: MutationObserverConfig = { attributes: false, childList: true, subtree: false };
  const observers: MutationObserver[] = [];

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
