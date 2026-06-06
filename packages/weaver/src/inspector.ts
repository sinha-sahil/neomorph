// In-iframe element inspector: hover highlight + click-to-select, drawn as
// overlay layers inside the target document (so they scale with the host
// canvas zoom for free). On select, builds a descriptor — tag/classes/rect,
// a curated set of computed styles, and the CSS custom properties that drive
// the element — and emits it to the parent (Studio) over postMessage.

import { parseDeclarations, VAR_REF_REGEX } from './scraper';
import { ElementRect, InspectorEmit, RelevantVariable, SelectedElementDescriptor } from './types';

const ACCENT = '#5b5bd6';
const ACCENT_TINT = 'rgba(91, 91, 214, 0.08)';
const OVERLAY_Z = '2147483646';
const HOVER_ID = '__neomorph-hover-overlay';
const SELECT_ID = '__neomorph-select-overlay';
const ID_ATTR = 'data-neomorph-id';

// Computed properties surfaced to the Studio inspector, grouped by section.
const RELEVANT_PROPS = [
  'color',
  'background-color',
  'background-image',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'border-top-width',
  'border-style',
  'border-color',
  'border-radius',
  'box-shadow',
  'display',
  'flex-direction',
  'justify-content',
  'align-items',
  'gap',
  'width',
  'height'
];

let enabled = false;
let emit: InspectorEmit | null = null;
let hoverEl: Element | null = null;
let selectedEl: Element | null = null;
let idCounter = 0;
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null;
let frameHandle: number | null = null;

function overlay(id: string): HTMLElement {
  let el = document.getElementById(id);
  if (el === null) {
    el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.pointerEvents = 'none';
    el.style.zIndex = OVERLAY_Z;
    el.style.boxSizing = 'border-box';
    el.style.display = 'none';
    document.body.appendChild(el);
  }
  return el;
}

function place(box: HTMLElement, el: Element): void {
  const rect = el.getBoundingClientRect();
  box.style.display = 'block';
  box.style.left = `${rect.left}px`;
  box.style.top = `${rect.top}px`;
  box.style.width = `${rect.width}px`;
  box.style.height = `${rect.height}px`;
}

function styleHover(box: HTMLElement): void {
  box.style.border = `1px solid ${ACCENT}`;
  box.style.background = ACCENT_TINT;
  box.style.borderRadius = '1px';
}

function styleSelect(box: HTMLElement): void {
  box.style.border = `2px solid ${ACCENT}`;
  box.style.background = 'transparent';
  box.style.borderRadius = '1px';
}

function labelText(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const first = el.classList.item(0);
  const cls = typeof first === 'string' ? `.${first}` : '';
  const rect = el.getBoundingClientRect();
  return `${tag}${cls}  ${Math.round(rect.width)} × ${Math.round(rect.height)}`;
}

function updateLabel(box: HTMLElement, el: Element): void {
  const existing = box.firstElementChild;
  let label: HTMLElement;
  if (existing instanceof HTMLElement) {
    label = existing;
  } else {
    label = document.createElement('div');
    box.appendChild(label);
  }
  label.style.position = 'absolute';
  label.style.left = '-2px';
  label.style.top = '-21px';
  label.style.padding = '1px 6px';
  label.style.font = '500 11px/16px ui-sans-serif, system-ui, sans-serif';
  label.style.color = '#ffffff';
  label.style.background = ACCENT;
  label.style.borderRadius = '4px';
  label.style.whiteSpace = 'nowrap';
  label.textContent = labelText(el);
}

function updateHoverOverlay(): void {
  const box = overlay(HOVER_ID);
  if (hoverEl === null || hoverEl === selectedEl) {
    box.style.display = 'none';
    return;
  }
  styleHover(box);
  place(box, hoverEl);
}

function updateSelectOverlay(): void {
  const box = overlay(SELECT_ID);
  if (selectedEl === null) {
    box.style.display = 'none';
    return;
  }
  styleSelect(box);
  place(box, selectedEl);
  updateLabel(box, selectedEl);
}

function assignId(el: Element): string {
  const existing = el.getAttribute(ID_ATTR);
  if (typeof existing === 'string' && existing.length > 0) {
    return existing;
  }
  idCounter += 1;
  const id = `nm-${idCounter}`;
  el.setAttribute(ID_ATTR, id);
  return id;
}

function hostNameFor(el: Element): string {
  const root = el.getRootNode();
  if (root instanceof ShadowRoot && root.host instanceof Element) {
    return root.host.tagName;
  }
  return 'document';
}

function extractComputed(cs: CSSStyleDeclaration): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of RELEVANT_PROPS) {
    out[prop] = cs.getPropertyValue(prop).trim();
  }
  return out;
}

// Re-parse the rules matching this element to recover which CSS custom
// properties drive it (computed style only exposes resolved values).
function findRelevantVariables(el: Element, cs: CSSStyleDeclaration): RelevantVariable[] {
  const out: RelevantVariable[] = [];
  const seen = new Set<string>();
  const root = el.getRootNode();
  const sheets = root instanceof ShadowRoot ? root.styleSheets : document.styleSheets;

  for (const sheet of sheets) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }
    for (const rule of rules) {
      if (!(rule instanceof CSSStyleRule)) {
        continue;
      }
      let matched = false;
      try {
        matched = el.matches(rule.selectorText);
      } catch {
        continue;
      }
      if (!matched) {
        continue;
      }
      for (const decl of parseDeclarations(rule.style.cssText)) {
        if (decl.prop.startsWith('--')) {
          continue;
        }
        VAR_REF_REGEX.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = VAR_REF_REGEX.exec(decl.value)) !== null) {
          const varName = match.at(1);
          if (typeof varName !== 'string') {
            continue;
          }
          const key = `${varName}|${decl.prop}`;
          if (seen.has(key)) {
            continue;
          }
          seen.add(key);
          out.push({
            varName,
            property: decl.prop,
            resolvedValue: cs.getPropertyValue(decl.prop).trim()
          });
        }
      }
    }
  }
  return out;
}

function rectOf(el: Element): ElementRect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function buildDescriptor(el: Element): SelectedElementDescriptor {
  const cs = getComputedStyle(el);
  return {
    elementId: assignId(el),
    tagName: el.tagName.toLowerCase(),
    id: el.id,
    classNames: Array.from(el.classList),
    rect: rectOf(el),
    hostName: hostNameFor(el),
    computedStyles: extractComputed(cs),
    relevantVariables: findRelevantVariables(el, cs)
  };
}

function isOverlay(el: Element | null): boolean {
  return el !== null && (el.id === HOVER_ID || el.id === SELECT_ID);
}

function onMove(event: MouseEvent): void {
  if (!enabled) {
    return;
  }
  const el = document.elementFromPoint(event.clientX, event.clientY);
  if (isOverlay(el) || el === hoverEl) {
    return;
  }
  hoverEl = el;
  updateHoverOverlay();
}

function onClick(event: MouseEvent): void {
  if (!enabled) {
    return;
  }
  const el = document.elementFromPoint(event.clientX, event.clientY);
  if (el === null || isOverlay(el)) {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  selectedEl = el;
  updateSelectOverlay();
  updateHoverOverlay();
  if (emit !== null) {
    emit({ action: 'elementSelected', element: buildDescriptor(el) });
  }
  observeSelected();
}

function onLeave(): void {
  if (hoverEl === null) {
    return;
  }
  hoverEl = null;
  updateHoverOverlay();
}

function scheduleSync(): void {
  if (frameHandle !== null) {
    return;
  }
  frameHandle = requestAnimationFrame(() => {
    frameHandle = null;
    updateHoverOverlay();
    updateSelectOverlay();
    if (emit !== null && selectedEl !== null) {
      emit({ action: 'elementRect', rect: rectOf(selectedEl) });
    }
  });
}

function observeSelected(): void {
  if (resizeObserver !== null) {
    resizeObserver.disconnect();
  }
  if (mutationObserver !== null) {
    mutationObserver.disconnect();
  }
  if (selectedEl === null) {
    return;
  }
  resizeObserver = new ResizeObserver(() => {
    scheduleSync();
  });
  resizeObserver.observe(selectedEl);
  mutationObserver = new MutationObserver(() => {
    scheduleSync();
  });
  mutationObserver.observe(selectedEl, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
}

export function enableInspector(emitFn: InspectorEmit): void {
  emit = emitFn;
  if (enabled) {
    return;
  }
  enabled = true;
  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('click', onClick, true);
  document.documentElement.addEventListener('mouseleave', onLeave);
  window.addEventListener('scroll', scheduleSync, true);
  window.addEventListener('resize', scheduleSync, true);
}

export function disableInspector(): void {
  enabled = false;
  document.removeEventListener('mousemove', onMove, true);
  document.removeEventListener('click', onClick, true);
  document.documentElement.removeEventListener('mouseleave', onLeave);
  window.removeEventListener('scroll', scheduleSync, true);
  window.removeEventListener('resize', scheduleSync, true);
  if (resizeObserver !== null) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (mutationObserver !== null) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  hoverEl = null;
  selectedEl = null;
  const hover = document.getElementById(HOVER_ID);
  if (hover !== null) {
    hover.style.display = 'none';
  }
  const select = document.getElementById(SELECT_ID);
  if (select !== null) {
    select.style.display = 'none';
  }
}

export function queryElementRect(): ElementRect | null {
  if (selectedEl === null) {
    return null;
  }
  return rectOf(selectedEl);
}
