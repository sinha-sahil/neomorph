# Phase 1 — Planning

> Define the module's surface area, state, components, and integration before any code is written.

## Objectives

- Decompose Studio into one cohesive client module under `src/lib/studio/`.
- Decide the data flow between **Loomer (SDK)** → **store** → **UI components**.
- Audit which primitives from `@juspay/svelte-ui-components` we'll use and which (if any) need custom shims.
- Detect available project utilities (decoders, validation, logger).

## 1. Problem domain

Studio is a **designer-side controller** for a remote web application. Its job:

- Load a target URL into an iframe.
- Listen for the target app's scraped CSS variables (delivered by Weaver via PostMessage, surfaced through Loomer).
- Show those variables grouped by kind (colors / sizing / typography / …) and by scope (document, shadow roots).
- Let the user edit values inline; every edit is pushed back to Weaver immediately so the iframe re-renders live.
- Persist nothing across page loads (Weaver handles localStorage on the *target* side; Studio is stateless across reloads).

**Studio is not** an HTTP-API client. It does not call `/api/*`. The skulls-mcp template's "API integration" phase is reinterpreted as **"SDK integration"** — wiring `Loomer` into a typed bridge layer.

## 2. Scope and boundaries

### In scope (this module owns)

- Lifecycle of a single `Loomer` instance per iframe load (mount / teardown).
- Local store of: target URL, scraped variables tree, current edits, search query, active scope, undo/redo history, theme mode (light/dark).
- All UI for the editor: top bar, side panel, token list, preview pane, status bar.
- Token classification helpers (`kindGroup`, `kindGlyph`) and color decoding helpers.

### Out of scope (other modules own)

- PostMessage wire format → owned by `@neomorph/sdk` (`Loomer`) and `@neomorph/weaver`.
- CSS variable scraping → owned by Weaver.
- Theme persistence in the target app → owned by Weaver (localStorage).
- The Browser chrome / iframe component → owned by `@juspay/svelte-ui-components` (`Browser`).

## 3. Project utility detection

Run from `packages/studio/`:

```bash
grep -q "type-crafter" package.json && echo "type-crafter available"
grep -q "typesafe-api-call" package.json && echo "typesafe-api-call available"
grep -r "appLogger\\|logger" src/ 2>/dev/null
```

Expected results (from a quick scan of `packages/studio/package.json` and `packages/sdk/package.json`):

- **type-crafter:** *Not available.* `@neomorph/sdk` uses `type-decoder` for runtime validation but that's a different lib and not wired into Studio. → We write manual `type` declarations and small decode functions inline (Studio does not need a full decoder framework; the scraped payloads come from Loomer which we control).
- **typesafe-api-call:** *Not available.* Doesn't apply — Studio has no HTTP API calls. The "API surface" is the `Loomer` class, which is already typed.
- **Logger:** *Not available.* Use `console.error` / `console.warn` directly — sparingly.

## 4. Data flow

```
[Target iframe app]
       ↓ (Weaver scrapes + posts)
[postMessage]
       ↓ (Loomer receives)
[sdk-bridge.ts] ← studio module's adapter
       ↓ (decoded)
[store.ts]
       ↓ (reactive)
[ui/*.svelte]
       ↓ (user edits a value)
[store.ts] (record edit, push to history)
       ↓ (call sdk-bridge)
[sdk-bridge.ts] → loomer.applyCssVariables({...})
       ↓ (postMessage)
[Weaver applies CSS override]
       ↓ (mutation observer fires; Weaver rescrapes)
[round-trip back to store]
```

Two important properties of this loop:

1. **Edits are optimistic.** The store records the new value and re-renders before Weaver confirms via the rescrape.
2. **The rescrape is the source of truth for the "current" value.** If a token expression doesn't resolve (typo in hex), the swatch falls back to whatever the resolved value comes back as.

## 5. Store shape (provisional — finalised in Phase 4)

```ts
type StudioStore = {
  appUrl: string;
  urlDraft: string;

  scraped: ScrapedResult | null;
  activeHostIndex: number;

  edits: Edits;                   // Record<host, Record<name, value>>
  history: HistoryEntry[];        // for undo/redo
  historyCursor: number;

  search: string;
  themeMode: 'light' | 'dark';

  lastAction: string | null;      // for status bar
};
```

Note: the store is **not** a single `writable<StudioStore>`. It is broken into a handful of smaller stores (one per orthogonal concern), to avoid the "subscribe to the whole thing on every keystroke" problem. See Phase 4.

## 6. Type categories (manual; no type-crafter)

| Type | Why | Where |
|---|---|---|
| `CssVariableKind` (union) | Closed enum, shared across UI + decoder | `types.ts` |
| `DefinedVariable` | Single scraped variable | `types.ts` |
| `ScrapedHost`, `ScrapedResult` | The Loomer payload shape | `types.ts` |
| `Edits`, `HostEdits` | Local edit map | `types.ts` |
| `HistoryEntry` | One undo-able edit | `types.ts` |
| `TokenGroup`, `GroupName` | UI grouping | `types.ts` |
| `ComponentProps` (per .svelte) | Contains callbacks — must be hand-typed | inline at top of each component |

All types use `type`, never `interface` (CODE_GUIDELINES §1; ESLint enforces).

## 7. Component API design

| Component | Purpose | Props (concept) | Events |
|---|---|---|---|
| `Studio` | Root composition | `initialAppUrl?: string` | — |
| `TopBar` | Brand + URL + actions | — (reads store) | — |
| `URLBar` | URL input + load button | `value`, `onApply` | — |
| `SidePanel` | Left column container | `children` snippet | — |
| `PanelHeader` | Title + count + search | `title`, `count`, `searchValue`, `onSearch` | — |
| `ScopeSwitcher` | Host scope picker | `scopes`, `active`, `onChange` | — |
| `TokenList` | Grouped, sticky-header list | `groups` | — |
| `TokenGroup` | One section | `label`, `count`, `variables`, `host` | — |
| `TokenRow` | Single token | `variable`, `host`, `value`, `onChange` | — |
| `TokenEditor` | Dispatch by kind to color / number / text editor | `variable`, `value`, `onChange` | — |
| `ColorSwatchEditor` | Swatch + hex input | `value`, `onChange` | — |
| `NumericEditor` | Slider (opacity / font-weight) or stepper | `kind`, `value`, `onChange` | — |
| `TextEditor` | Plain text input | `value`, `onChange` | — |
| `EmptyState` | "waiting for variables…" | `title`, `body` | — |
| `Preview` | Browser chrome + iframe | `url` | — |
| `StatusBar` | Bottom bar | — (reads store) | — |
| `ThemeToggle` | Light/dark switch | — (reads + writes store) | — |

## 8. "API" surface — i.e. the SDK bridge

| Function | Purpose |
|---|---|
| `attachLoomer(container, url)` | Boot a Loomer, wire its `listenCssVariables` into the store, return teardown. |
| `applyEdit(host, name, value)` | Push one edit to Loomer + record locally + push to history. |
| `applyBatch(edits)` | Push many edits at once (used by undo/redo). |
| `clearAll()` | Tell Weaver to drop all overrides; clear local edits. |
| `rescrape()` | Re-request the variable map. |
| `decodeScraped(payload)` | Convert the loose `Record<string, unknown>` from Loomer into our typed `ScrapedResult`. |

`sdk-bridge.ts` is the only file that imports from `@neomorph/sdk`. Every component, store and util goes through it.

## 9. Dependency summary

- **Generated types / decoders:** None — manual `type` declarations + tiny inline decoders in `sdk-bridge.ts`.
- **API library:** None applicable — we use `Loomer` directly.
- **Network utility:** N/A.
- **Logger:** `console.error` / `console.warn`. No structured logger needed for a one-page tool.
- **External primitives:** `@juspay/svelte-ui-components` — `Toolbar`, `Browser`, `Button`, `Input`, `Slider`, `ColorPicker`, `Pill`, `Select`. Cross-check during Phase 2 that all of these support the CSS-variable surface we need; if not, shim per `CODE_GUIDELINES.md §6`.

## Verification

- [ ] Problem domain documented.
- [ ] Scope boundary listed.
- [ ] Data flow diagrammed.
- [ ] Type categories listed.
- [ ] Component table written.
- [ ] SDK-bridge surface enumerated.
- [ ] No type-crafter / typesafe-api-call assumed.
