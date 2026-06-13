# Phase 8 — Integration

> Wire everything together. Verify the end-to-end loop. Update docs.

## Objectives

- Finalise public exports from `lib/studio/index.ts` and `lib/studio/ui/index.ts`.
- Compose the route at `routes/+page.svelte`.
- Verify the full loop in `pnpm dev` against `examples/index.html`.
- Update `docs/PROGRESS.md` so the percentages reflect reality.
- Update `CLAUDE.md` if any architectural facts changed (filenames, conventions).

## Critical rules

- The route file (`+page.svelte`) is **as small as possible** — ideally just `<Studio />` and a `<svelte:head>` for title.
- All public exports go through `lib/studio/index.ts`. Nothing else under `lib/studio/` is imported externally.

## Final `lib/studio/index.ts`

```ts
export { default as Studio } from './ui/Studio.svelte';

export type {
  CssVariableKind,
  DefinedVariable,
  GroupName,
  ScrapedHost,
  ScrapedResult,
  StudioThemeMode,
  TokenGroup
} from './types';
```

That's it. Components are reachable through `Studio` only — there's no use case for importing `TopBar` or `TokenList` standalone from outside Studio.

## Final `lib/studio/ui/index.ts`

```ts
export { default as Studio } from './Studio.svelte';

// Internal exports — only used inside the studio module.
export { default as TopBar } from './TopBar.svelte';
export { default as URLBar } from './URLBar.svelte';
export { default as SidePanel } from './SidePanel.svelte';
export { default as PanelHeader } from './PanelHeader.svelte';
export { default as ScopeSwitcher } from './ScopeSwitcher.svelte';
export { default as TokenList } from './TokenList.svelte';
export { default as TokenGroup } from './TokenGroup.svelte';
export { default as TokenRow } from './TokenRow.svelte';
export { default as TokenEditor } from './TokenEditor.svelte';
export { default as ColorSwatchEditor } from './ColorSwatchEditor.svelte';
export { default as NumericEditor } from './NumericEditor.svelte';
export { default as TextEditor } from './TextEditor.svelte';
export { default as EmptyState } from './EmptyState.svelte';
export { default as Preview } from './Preview.svelte';
export { default as StatusBar } from './StatusBar.svelte';
export { default as ThemeToggle } from './ThemeToggle.svelte';
```

## Final `routes/+page.svelte`

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { Studio } from '$lib/studio';
  import { setUrlDraft, applyUrl } from '$lib/studio/store';
  import '../app.css';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get('appUrl');
    if (typeof fromQuery === 'string' && fromQuery.length > 0) {
      setUrlDraft(fromQuery);
      applyUrl();
    }
  });
</script>

<svelte:head>
  <title>Neomorph Studio</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
</svelte:head>

<Studio />
```

Note the slight reach across the module boundary into `$lib/studio/store` — that's intentional: the route owns the `?appUrl=` query-param contract, not Studio itself. Studio only sees the resulting `appUrl`.

## End-to-end verification flow

In two terminals from the repo root:

```bash
# terminal A — serve the example target app on :3000
cd examples && pnpm dev    # vite serves examples/index.html

# terminal B — boot Studio on :5173
pnpm --filter @neomorph/studio dev
```

Open `http://localhost:5173/?appUrl=http://localhost:3000` and verify:

- [ ] Studio loads, no console errors.
- [ ] Sidebar shows tokens grouped under "Colors", "Typography", "Sizing", etc.
- [ ] Editing a colour swatch updates the iframe in real-time.
- [ ] Editing the hex input updates the iframe + the swatch.
- [ ] Search filters the visible tokens.
- [ ] Scope switcher appears if `examples/index.html` defines vars in shadow roots; otherwise stays hidden.
- [ ] Rescrape button refreshes the variable list.
- [ ] Reset button clears all overrides and the iframe restores its default theme.
- [ ] `Cmd-Z` undoes the last edit; `Cmd-Shift-Z` redoes it.
- [ ] Toggling the theme button flips Studio's chrome between light + dark.
- [ ] Loading a fresh URL via the URL bar remounts the iframe and re-scrapes.

## Independence check (skulls-mcp standard)

- [ ] `pnpm --filter @neomorph/studio check` — no svelte-check errors.
- [ ] `pnpm --filter @neomorph/studio lint` — ESLint + Prettier clean.
- [ ] `pnpm --filter @neomorph/studio build` — builds successfully.
- [ ] Module has zero circular dependencies (`madge --circular packages/studio/src` if installed; otherwise visual inspection).
- [ ] Only `sdk-bridge.ts` imports from `@neomorph/sdk` (`grep -rn "@neomorph/sdk" packages/studio/src` → 1 hit).

## Documentation updates

### `docs/PROGRESS.md`

Bump `@neomorph/studio` from 85% → 95% (still ⚠️ on test suite and save/load themes). Move "Real variable editing in Studio" from "Up next" to "Recently shipped". Move "Color picker component for Studio's editor" to "Recently shipped".

### `CLAUDE.md`

Update the "Studio" architecture bullet to mention `lib/studio/` as the module layout. Add a brief note that all SDK interaction goes through `sdk-bridge.ts`. Otherwise unchanged.

## Rollout

- Commit on a branch (`feat/studio-redesign`) — DO NOT push without explicit user OK.
- PR title: `feat(studio): rebuild visual editor from first principles`.
- PR description: link this plan directory; list verification checks performed.

## Final verification

- [ ] All success criteria from `00-overview.md` met.
- [ ] All checklist items in `checklist.md` ticked.
- [ ] `pnpm dev` shows the redesigned Studio working against `examples/index.html`.
- [ ] No console errors / warnings during normal use.
- [ ] Changes committed (locally) ; push deferred until user approves.
