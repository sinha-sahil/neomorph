# Phase 2 — Setup

> Create the new directory layout. Wipe the existing monolith and theme files; scaffold the empty module.

## Objectives

- Delete dead / soon-to-be-replaced files from the current Studio (`+page.svelte`, `theme.css`, anything left in `lib/components/`).
- Create the new module structure under `src/lib/studio/`.
- Create the new theme layer under `src/lib/theme/`.
- Stub each file so Phase 3+ can fill them in without touching paths again.

## Critical rules

1. Always use `type`, never `interface` (CODE_GUIDELINES §1).
2. No `interface` — ESLint will reject the build otherwise.
3. Imports use `$lib/...` (SvelteKit's alias) — never relative `../../lib`.
4. Component file names are `PascalCase.svelte`; module / utility files are `kebab-case.ts`.

## Target directory layout

```text
packages/studio/src/
├── app.css                       # ← rewritten: minimal global resets + font imports
├── app.d.ts                      # ← unchanged
├── app.html                      # ← unchanged (verify font preconnect)
├── routes/
│   └── +page.svelte              # ← thin: imports + renders <Studio />
└── lib/
    ├── index.ts                  # re-exports for $lib root (unchanged)
    ├── theme/
    │   ├── tokens.css            # Studio's own design tokens (chrome)
    │   └── components.css        # @juspay/svelte-ui-components classed variants
    └── studio/
        ├── index.ts              # public re-exports
        ├── types.ts              # all studio-wide types
        ├── utils.ts              # pure helpers: kind classification, normalisers
        ├── store.ts              # writable stores (broken up by concern)
        ├── sdk-bridge.ts         # Loomer attachment + decoder
        └── ui/
            ├── index.ts          # component re-exports
            ├── Studio.svelte
            ├── TopBar.svelte
            ├── URLBar.svelte
            ├── SidePanel.svelte
            ├── PanelHeader.svelte
            ├── ScopeSwitcher.svelte
            ├── TokenList.svelte
            ├── TokenGroup.svelte
            ├── TokenRow.svelte
            ├── TokenEditor.svelte
            ├── ColorSwatchEditor.svelte
            ├── NumericEditor.svelte
            ├── TextEditor.svelte
            ├── EmptyState.svelte
            ├── Preview.svelte
            ├── StatusBar.svelte
            └── ThemeToggle.svelte
```

## File scaffolds

### `routes/+page.svelte`

```svelte
<script lang="ts">
  import { Studio } from '$lib/studio';
  import '../app.css';
</script>

<Studio />
```

### `app.css`

```css
@import url('https://rsms.me/inter/inter.css');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
@import '$lib/theme/tokens.css';
@import '$lib/theme/components.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-feature-settings: 'cv11', 'ss01';
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  background: var(--bg-app);
  color: var(--text);
}

button {
  font: inherit;
}
```

### `lib/theme/tokens.css` (shape — values defined in Phase 7)

```css
:root,
[data-studio-theme='light'] {
  --bg-app: ...;
  --bg-panel: ...;
  /* …light values… */
}

[data-studio-theme='dark'] {
  --bg-app: ...;
  /* …dark values… */
}
```

### `lib/theme/components.css`

Placeholder — gets populated in Phase 7 with `classes`-prop variants for every `@juspay/svelte-ui-components` primitive we use (`.input-url`, `.btn-icon`, `.slider-compact`, etc.). Mirror the variants from the current `theme.css` but cleaner.

### `lib/studio/index.ts`

```ts
export { default as Studio } from './ui/Studio.svelte';
export * from './types';
```

### `lib/studio/types.ts`

```ts
export {};  // stub — Phase 3 fills this
```

### `lib/studio/store.ts`

```ts
export {};  // stub — Phase 4 fills this
```

### `lib/studio/sdk-bridge.ts`

```ts
export {};  // stub — Phase 5 fills this
```

### `lib/studio/utils.ts`

```ts
export {};  // stub — Phase 6 fills this
```

### `lib/studio/ui/index.ts`

```ts
export { default as Studio } from './Studio.svelte';
// rest added in Phase 7
```

### Every `.svelte` stub

```svelte
<script lang="ts">
  // Phase 7: implement
</script>

<div>TODO</div>
```

## Deletions (before scaffolding)

```bash
# from packages/studio/
rm -f src/routes/+page.svelte
rm -f src/theme.css
rm -rf src/themes/                 # already gone but make sure
rm -rf src/lib/components/         # empty already
rm -f src/lib/utils.ts             # already deleted in git
```

## Setup commands

```bash
cd packages/studio/src
mkdir -p lib/theme lib/studio/ui
touch lib/theme/tokens.css lib/theme/components.css
touch lib/studio/{index.ts,types.ts,utils.ts,store.ts,sdk-bridge.ts}
touch lib/studio/ui/index.ts
# then `touch` each .svelte stub listed in the layout
```

## Verification

- [ ] All paths above exist.
- [ ] `pnpm --filter @neomorph/studio check` — passes on the stubs (no orphan imports).
- [ ] `pnpm --filter @neomorph/studio build` — succeeds (renders empty TODO).
- [ ] No `interface` keyword in any new file.
- [ ] No relative `../../lib/...` imports.
