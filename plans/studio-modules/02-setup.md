# Phase 2 — Setup (target directory structure)

## Objective

Create the module directories under `packages/studio/src/lib/`.

```text
src/lib/
├── modules/
│   ├── connection/
│   │   ├── index.ts
│   │   ├── remote.ts
│   │   ├── decoders.ts
│   │   ├── types.ts
│   │   ├── store.ts
│   │   └── ui/{index.ts, URLBar.svelte}
│   ├── tokens/
│   │   ├── index.ts, store.ts, types.ts, utils.ts
│   │   └── ui/{index.ts, ...}
│   ├── inspector/
│   │   ├── index.ts, store.ts
│   │   └── ui/{index.ts, Inspector.svelte, sections/*, rows/*}
│   ├── canvas/
│   │   ├── index.ts, camera.ts, tools.ts, device.ts
│   │   └── ui/{index.ts, ...}
│   └── export/
│       ├── index.ts, export.ts
│       └── ui/{index.ts, ExportPanel.svelte}
├── shell/
│   ├── index.ts, store.ts
│   └── ui/{index.ts, Studio.svelte, TopBar.svelte, StatusBar.svelte, ThemeSwitch.svelte}
├── shared/
│   ├── icons.ts
│   └── assets/icons/*.svg
├── theme/{tokens.css, components.css}
└── index.ts   (package barrel → re-exports shell Studio + public types)
```

## Approach

Use `git mv` to preserve history. Move incrementally, module by module, fixing imports and running
`check` after each. Order: **connection → shared → canvas → tokens → inspector → export → shell**
(dependencies first).
