# Phase 2 — Inspect & Select (Weaver + Loomer + Studio)

**Goal:** Browser-devtools-style hover highlight + click-to-select inside the hosted iframe, with the selected element's identity, rect, computed styles, and **the CSS variables that drive it** surfaced to Studio.

*Sync note (2026-06-07): shipped as described in `weaver/src/inspector.ts` + Loomer action routing. Differences: wire types/decoders are type-crafter generated (`$generated`), not hand-written; the Studio bridge is `connection/remote.ts` (no `sdk-bridge.ts`) with selection in `connection/store.ts`; and the inspector is enabled on attach rather than gated by the cursor/hand tool.*

**Ship criterion:** with the inspector tool active, hovering the canvas highlights elements; clicking selects one; Studio shows a selection box + label chip and logs the element's `relevantVariables`; works on `examples/index.html` with no console errors.

## Wire protocol (today, for reference)

- Studio→Weaver: double-JSON envelope `{source:'skinweaver', payload: JSON({requestId, service:'skinweaver', payload:{action, …}})}` (`loomer.ts:72-85`).
- Weaver→Studio: single JSON `{requestId, service, payload:{action?, …}}` (`messaging.ts:110-116`).
- Existing actions: `listenCssVariables`, `applyCssVariables`, `clearTheme`, `configure`, `teardown`.
- **Blocker:** `loomer.ts:47-49` drops any response payload containing `action` — only scrape broadcasts get through. Fix first (see below).

## New actions

| Action | Direction | Payload |
| --- | --- | --- |
| `enableInspector` | Studio→Weaver | `{action:'enableInspector'}` — start hover/click listeners + overlay |
| `disableInspector` | Studio→Weaver | `{action:'disableInspector'}` — remove listeners + overlay |
| `elementSelected` | Weaver→Studio (push) | `{action:'elementSelected', element: SelectedElementDescriptor}` |
| `queryElementRect` | Studio→Weaver | `{action:'queryElementRect'}` — re-measure current selection |
| `elementRect` | Weaver→Studio | `{action:'elementRect', rect}` — response to above + on sync events |

```ts
// weaver/src/types.ts additions
export type ElementRect = { top: number; left: number; width: number; height: number };

export type RelevantVariable = {
  varName: string;        // '--color-primary'
  property: string;       // 'background-color'
  resolvedValue: string;  // 'rgb(91, 91, 214)'
};

export type SelectedElementDescriptor = {
  elementId: string;            // stable id Weaver assigns (data attribute) — Onlook-style
  tagName: string;
  id: string;
  classNames: string[];
  rect: ElementRect;            // iframe-local (getBoundingClientRect)
  hostName: string;            // 'document' or shadow host tag
  computedStyles: Record<string, string>;  // ~20 visually relevant props
  relevantVariables: RelevantVariable[];
};
```

## Loomer routing fix (prerequisite)

Replace the `if ('action' in payload) return` filter with action routing:

```ts
// loomer.ts — sketch
private handlers = new Map<string, Set<(p: SDKResponsePayload) => void>>();

on(action: string, cb: (p: SDKResponsePayload) => void): () => void { /* register, return off */ }

// in the message listener: read payload.action; if present, dispatch to handlers.get(action);
// scrape broadcasts (no action) keep their existing callback path.
```

Add `Loomer` methods: `enableInspector()`, `disableInspector()`, `onElementSelected(cb)`, `queryElementRect()`, and a getter for the injected `<iframe>` element (for Studio rect translation). Mirror in `sdk-bridge.ts`.

## Weaver `inspector.ts` (new file)

Single module, lean (mind the <10KB gzip budget). Responsibilities:

1. **Hover highlight (in-iframe).** Capturing `mousemove` on `document` → `document.elementFromPoint(x,y)`; if target changed, move a single persistent `<div id="__neomorph-hover">` (`position:fixed; pointer-events:none; z-index:2147483647; outline:2px solid <accent>; background:rgba(accent,.08)`) to the element's `getBoundingClientRect()`. No postMessage per move.
2. **Click-to-select.** Capturing `click` → `preventDefault()`+`stopPropagation()` (suppress hosted page handlers while active) → build descriptor → push `elementSelected`. Swap hover style for a persistent "selected" style; render a label chip `<tag>#id.class · W×H`.
3. **Descriptor build.** `buildDescriptor(el)`: tag/id/classList, `getBoundingClientRect()`, `extractRelevantComputedStyles(getComputedStyle(el))` (~20 props: color, background-color, border*, font-*, padding, margin, gap, border-radius, box-shadow, etc.), `findRelevantVariables(el)`, `resolveHostName(el)` (walk to shadow host or 'document'), and assign/read a stable `elementId` (a `data-neomorph-id` attribute set on first selection).
4. **Sync.** `ResizeObserver` (selected element + body), `scroll` (capture), `MutationObserver` (subtree attrs/childList) → coalesce into one `requestAnimationFrame` → re-measure → push `elementRect` only when changed.
5. **Teardown on `disableInspector`/`teardown`.** Remove listeners, observers, overlay, label.

## Element → token mapping (`findRelevantVariables`)

Computed style gives resolved values (`rgb(...)`), not `var()` names — must re-parse the matching rules:

```ts
function getMatchingRules(el: Element): CSSStyleRule[] {
  const out: CSSStyleRule[] = [];
  const root = el.getRootNode();                 // document or ShadowRoot
  const sheets = root instanceof ShadowRoot ? root.styleSheets : document.styleSheets;
  for (const sheet of sheets) {
    for (const rule of sheet.cssRules) {
      if (rule instanceof CSSStyleRule && el.matches(rule.selectorText)) { out.push(rule); }
    }
  }
  return out;
}
```

For each matching rule, reuse `parseDeclarations` + `VAR_REF_REGEX` (export them from `scraper.ts`) to collect `property → var(--x)` usages; resolve each via the already-scraped variable map; also check document inline overrides + the shadow `__neomorph-weaver-overrides` style. Dedupe by `varName+property`. This yields "this element's background is driven by `--color-primary`."

Caveat: shadow-DOM elements need `root.styleSheets` (not `document.styleSheets`) and `el.matches()` in that context — handled above.

## Studio side

- New `lib/studio/ui/SelectionOverlay.svelte` rendered **inside `<Scene>`**: an absolutely-positioned box from the iframe-local rect (no scale math; the scene transform scales it) + a label chip. Subscribe to `onElementSelected`/`elementRect`.
- `selection.svelte.ts` store: `hovered`/`selected` descriptors, `relevantVariables`, computed styles.
- Tool integration: the cursor tool drives inspector enable/disable; the hand tool disables it (so panning over the iframe doesn't highlight).

## Risks

- **Hover overlay clipped to iframe viewport** — acceptable; selection chrome (drawn by Studio) is what extends into panel space.
- **Cross-origin in dev vs prod** — keep all reads in Weaver; never reach into `contentDocument` from Studio.
- **Bundle budget** — inspector must stay lean; no new deps.
- **Stable id collisions / SPA re-renders** — assign `data-neomorph-id` lazily and prefer it over CSS-path selectors when re-resolving a selection.
