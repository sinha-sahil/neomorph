# Phase 7 — UI Components

## Objective

Move components to their module's `ui/`, each with a `ui/index.ts`. Decompose the oversized
`Inspector.svelte` (381) while moving it.

- `connection/ui/`: `URLBar`.
- `tokens/ui/`: `TokenSidebar, PanelHeader, ScopeSwitcher, TokenList, TokenGroup, TokenRow,
  TokenEditor, NumericEditor, TextEditor, EmptyState`.
- `inspector/ui/`: `Inspector` (slim shell) + `sections/{LayoutSection, SpacingSection,
  TypographySection, FillSection, BorderSection, TokensSection}.svelte` + `rows/{ValueRow, SelectRow,
  ColorRow, PropRow}.svelte` + `InspectorSection.svelte`. The `editProperty`/`valueOf`/`quad`/option
  arrays move into `inspector/edit.ts` so the shell stays < 200 lines.
- `canvas/ui/`: `CanvasViewport, Scene, IframeHost, ToolRail, DeviceBar, ZoomControl`.
- `export/ui/`: `ExportPanel`.
- `shell/ui/`: `Studio, TopBar, StatusBar, ThemeSwitch`.

## Cross-cutting

Icons (`icons.ts` + svg assets) → `shared/`; every `<Img src={icons.x}>` import path updates to
`shared`. Component theming classes stay in `theme/components.css`.

## Validation

In-browser smoke test: sidebar, canvas select+restyle, export modal, theme switch all work.
