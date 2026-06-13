# Phase 7 — UI Components

_Sync note (2026-06-07): components shipped but now live across `lib/modules/{shell,connection,tokens}` rather than one `lib/studio/ui/` tree. The `Preview.svelte` / `use:initLoomer` side-panel preview was superseded by the infinite-canvas `CanvasViewport` (`plans/studio-canvas-revamp/`). See `00-overview.md` Sync note._

> Each component is small, self-contained, props-driven, and reads from the stores it needs (no prop-drilling).

## Objectives

- Build 17 components, each <150 lines.
- Use `@juspay/svelte-ui-components` for primitives; theme via `classes` + CSS variables.
- Follow Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`).
- Make every component keyboard-accessible.
- No raw `<button>` for generic actions — use the lib's `Button` (CODE_GUIDELINES §6).
- Style is **light-first** with a `[data-studio-theme='dark']` override layer.

## Critical rules

1. Prop types use `type`; declared inline above each `<script>` block.
2. `$bindable` only when the component mutates the prop itself (CODE_GUIDELINES §7).
3. Use `classes` prop on every primitive — never inline overrides.
4. Use `typeof` for narrowing, `??` for fallbacks, `.at(...)` for array access.
5. Curly braces on every `if` / `else if` / `for` / `while`.

## Visual system (recap from 00-overview)

- Font: Inter (UI), JetBrains Mono (token names + values).
- Type scale: 11 / 12 / 13 / 15.
- Spacing: 4 / 8 / 12 / 16 / 24.
- Accent: deep indigo `#5b5bd6` (light) / `#7c7cff` (dark).
- Borders: 1px, low-contrast (`#e4e4e7` / `#27272a`).
- Rows: 28 px tall.
- No drop shadows except on popovers.

## Component catalogue

### `Studio.svelte` — root composition

```svelte
<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import TopBar from './TopBar.svelte';
  import SidePanel from './SidePanel.svelte';
  import Preview from './Preview.svelte';
  import StatusBar from './StatusBar.svelte';
  import { target, ui } from '../store';
  import { stepRedo, stepUndo } from '../store';
  import { pushValueDirect } from '../sdk-bridge';

  $effect(() => {
    document.documentElement.dataset.studioTheme = $ui.themeMode;
  });

  function onKeyDown(e: KeyboardEvent): void {
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.key === 'z' && !e.shiftKey) {
      const popped = stepUndo();
      if (popped !== null) { pushValueDirect(popped.host, popped.name, popped.previousValue); }
      e.preventDefault();
    } else if (cmd && (e.key === 'Z' || (e.key === 'z' && e.shiftKey))) {
      const next = stepRedo();
      if (next !== null) { pushValueDirect(next.host, next.name, next.nextValue); }
      e.preventDefault();
    }
  }
</script>

<svelte:window onkeydown={onKeyDown} />

<div class="studio">
  <TopBar />
  <main class="workspace">
    <SidePanel />
    <Preview url={$target.appUrl} />
  </main>
  <StatusBar />
</div>

<style>
  .studio { display: flex; flex-direction: column; height: 100vh; }
  .workspace { flex: 1; display: grid; grid-template-columns: 320px 1fr; min-height: 0; }
</style>
```

### `TopBar.svelte`

- Brand mark + name on left (140px column).
- `URLBar` centered (max-width 520px).
- Rescrape + Reset icon `Button`s on right (140px column).
- 40 px tall, `var(--bg-topbar)` background, 1 px bottom border.

### `URLBar.svelte`

- Input bound to `urlDraft`; submits on Enter or button click.
- Load button only visible when draft differs from current `appUrl` (CODE_GUIDELINES §5: explicit equality).
- Wired via `setUrlDraft` + `applyUrl` from the store.

### `SidePanel.svelte`

- 320px column, `var(--bg-panel)`, right border.
- Sections: `PanelHeader`, `ScopeSwitcher`, `TokenList`.
- `EmptyState` when `scraped === null`.

### `PanelHeader.svelte`

- Title ("Tokens"), token count pill, search input.
- Search input wraps the lib `Input` with `classes="input-search"`; leading SVG glyph inside.

### `ScopeSwitcher.svelte`

- Shown only when `hostNames.length > 1`.
- Uses lib `Select` with `classes="select-scope"`.
- Reads active host from `$activeHostName`, writes via `setActiveHost`.

### `TokenList.svelte`

- Reads `$groupedVariables`.
- If empty + `scraped` exists: "No tokens match your search."
- Otherwise: renders one `TokenGroup` per group.
- Scrollable container. Hidden scrollbar until hover.

### `TokenGroup.svelte`

- Props: `label: string`, `count: number`, `variables: DefinedVariable[]`, `host: string`.
- Sticky `<header class="group-header">` showing label and count.
- `{#each variables as v (v.name)}` → `<TokenRow ... />`

### `TokenRow.svelte`

- 28 px tall grid: leader (20 px) | name (`minmax(110px, 1fr)`) | editor (120 px).
- Hover row background: `var(--bg-row-hover)`.
- Title attribute = `rowTooltip(...)` for context on hover.
- For color rows the leader is a small swatch; for others, a kind-glyph `Pill`.

### `TokenEditor.svelte`

- Receives `variable`, `value`, `onChange`.
- Computes `editorForKind(variable.kind)`; dispatches to `ColorSwatchEditor`, `NumericEditor` (`opacity-slider`, `font-weight-slider`), or `TextEditor`.
- Keeps a single source of truth for "which editor variant for which kind".

### `ColorSwatchEditor.svelte`

- Wraps the lib `ColorPicker` with `classes="colorpicker-swatch"` for the swatch.
- Sits next to a lib `Input` (`classes="input-token"`) for the hex value.
- Both update via the same `onChange` callback.

### `NumericEditor.svelte`

- Wraps the lib `Slider` with `classes="slider-compact"`.
- Props decide range: opacity (0–1, step 0.01), font-weight (100–900, step 100).

### `TextEditor.svelte`

- Wraps the lib `Input` with `classes="input-token"`.
- Right-aligned monospace.

### `EmptyState.svelte`

- Props: `title: string`, `body: string`, optional `hint?: string`.
- Friendly tone: "Waiting for variables… Make sure your target app has the Weaver script loaded."

### `Preview.svelte`

- Wraps the lib `Browser` with `classes="browser-flat"`.
- Has a `use:initLoomer` action — calls `attachLoomer(node, url)` from `sdk-bridge`.
- Wrapped in `{#key url}` so the iframe remounts when URL changes (Loomer destroys + recreates).

### `StatusBar.svelte`

- 24 px tall bottom bar.
- Left: scope name + total token count.
- Center: `$ui.lastAction` (truncates with ellipsis).
- Right: `ThemeToggle`.
- `var(--bg-statusbar)` background, 1 px top border.

### `ThemeToggle.svelte`

- Lib `Button` with `classes="btn-icon"` + a sun/moon SVG.
- `onclick` toggles between `'light'` and `'dark'` via `setThemeMode`.

## CSS variable variants in `theme/components.css`

For every primitive we re-skin, define a class that sets the `--<component>-*` CSS variables. The lookup is:

- `.input-url` — top-bar URL input. Dark on dark.
- `.input-search` — panel search input. Light.
- `.input-token` — token editors. Right-aligned, monospace, transparent border until focus.
- `.btn-icon` — top-bar / status-bar icon buttons.
- `.btn-primary` — the URL "Load" button. Accent.
- `.colorpicker-swatch` — swatch only (no inline hex).
- `.slider-compact` — small slider for opacity / font-weight.
- `.select-scope` — scope picker.
- `.browser-flat` — flat-but-classy iframe chrome.
- `.pill-kind`, `.pill-kind-typography`, `.pill-kind-sizing`, etc. — kind glyph background colors.

Keep all variants in `theme/components.css`. The current variant block in `theme.css` is a good starting point — port it over, simplify, and ensure every variant has both **light** and **dark** values via CSS variable references.

## CSS tokens in `theme/tokens.css`

```css
:root,
[data-studio-theme='light'] {
  /* Surfaces */
  --bg-app: #fafafa;
  --bg-panel: #ffffff;
  --bg-topbar: #ffffff;
  --bg-statusbar: #ffffff;
  --bg-row-hover: #f4f4f5;
  --bg-mute: #f4f4f5;

  /* Borders */
  --border: #e4e4e7;
  --border-strong: #d4d4d8;
  --border-topbar: #e4e4e7;

  /* Text */
  --text: #18181b;
  --text-muted: #71717a;
  --text-faint: #a1a1aa;
  --text-inverse: #fafafa;

  /* Accent */
  --accent: #5b5bd6;
  --accent-soft: rgba(91, 91, 214, 0.12);
  --accent-strong: #4747ac;

  /* Type */
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
}

[data-studio-theme='dark'] {
  --bg-app: #0a0a0a;
  --bg-panel: #131316;
  --bg-topbar: #131316;
  --bg-statusbar: #131316;
  --bg-row-hover: #1c1c20;
  --bg-mute: #1c1c20;

  --border: #27272a;
  --border-strong: #3f3f46;
  --border-topbar: #27272a;

  --text: #fafafa;
  --text-muted: #a1a1aa;
  --text-faint: #71717a;
  --text-inverse: #18181b;

  --accent: #7c7cff;
  --accent-soft: rgba(124, 124, 255, 0.18);
  --accent-strong: #9b9bff;
}
```

## Accessibility checklist

- All interactive elements reachable by tab.
- `aria-label` on every icon button (lib `Button` exposes `ariaLabel`).
- `<svelte:window onkeydown>` in `Studio.svelte` handles undo/redo; other components don't trap keys.
- Focus rings: use `--accent-soft` for visible focus on inputs.
- Color contrast: every text colour against its background passes WCAG AA (verify via DevTools).

## Verification

- [ ] All 17 components exist.
- [ ] Each `.svelte` < 150 lines.
- [ ] No raw `<button>` for generic actions.
- [ ] No `interface`, no `undefined`, no `!!`, no `as` (per CODE_GUIDELINES).
- [ ] No `width: auto` or `margin: auto`-for-spacing (CODE_GUIDELINES §8).
- [ ] All primitives use `classes` prop.
- [ ] `pnpm --filter @neomorph/studio check` clean.
- [ ] Visual smoke test in `pnpm dev` against `examples/index.html` — colors update live, scopes switch, undo works.
