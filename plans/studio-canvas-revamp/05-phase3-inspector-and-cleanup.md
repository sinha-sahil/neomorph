# Phase 3 — Right Inspector Panel, Hybrid Editing & Component Cleanup

**Goal:** The wide, resizable, Figma/Framer-style right panel; the **hybrid edit model** (global token edit vs per-element override); and the migration of bespoke Studio UI onto `@juspay/svelte-ui-components`.

*Sync note (2026-06-07): the hybrid edit model and section/row decomposition shipped, but the panel is fixed 320px (not resizable), there is no `Selection | Tokens` tab (tokens stayed in the left sidebar), sections are `Layout/Spacing/Typography/Fill/Border & effects/Tokens` (no Effects/Overrides), the scope marker is a static inline `.scope-chip` (not a `ScopeChip` component or "affects N places"), no Figma-style local controls (NumericScrubber/SegmentedControl/Popover/Splitter/ColorSwatch) were built, element overrides aren't persisted, and undo/redo isn't extended to per-element overrides.*

**Ship criterion:** select an element → the inspector shows its styling sections populated from computed values + relevant tokens; editing a token updates everywhere; a per-element override changes only the selected element; both persist; the [`06`](06-component-library-gaps.md) replacement table is done.

## The hybrid edit model (the key UX)

For each editable property in the selected element's inspector, show its **source** and offer two actions:

- **Driven by a token** (`--color-primary`) → the control edits the **token** by default (global). A small scope toggle on the row switches to **"override just this element"**.
- **Not driven by a token** (literal value in a rule, or inline) → the control creates a **per-element override** directly.

Visual language: a **chip** marks the row's current scope — `token` (globe icon, "affects N places") vs `element` (target icon, "this element only"). This is how we keep the CSS-variable model honest while giving Figma-style per-element control. Per-element overrides are listed in a "Overrides on this element" section with per-row reset.

### Per-element override mechanism (Weaver)

Today `applier.ts` writes document-level (`documentElement.style.setProperty`) and shadow-host (`:host{}`) variable overrides. Add **element-scoped** overrides:

- New action `applyElementOverride` `{action, elementId, declarations: Record<prop,value>}` and `clearElementOverride {action, elementId}`.
- Weaver resolves `elementId` → element (via `data-neomorph-id`), writes to a managed inline-style layer or a generated rule `[data-neomorph-id="…"]{ … }` in a single `<style id="__neomorph-element-overrides">`. Prefer the generated-rule approach so overrides are inspectable, clearable as a group, and don't fight the app's own inline styles unpredictably.
- Reuse the `isApplying` guard so the scraper/inspector observers don't loop.
- Persistence: extend `storage.ts` to store element overrides keyed by `elementId` alongside variable overrides.

## Inspector panel structure

`lib/studio/ui/inspector/` (each file < 200 lines):

| File | Role | Library components |
| --- | --- | --- |
| `Inspector.svelte` | Tabs: **Selection** \| **Tokens**; empty state when nothing selected | `Tabs`, `Banner` |
| `SelectionHeader.svelte` | `<tag>#id.class`, dimensions, "affects N" | `Pill`, `Badge`, `Tooltip` |
| `sections/FillSection.svelte` | background/color swatches + picker | `ColorPicker`, `Accordion` |
| `sections/TypographySection.svelte` | font family/size/weight/line-height/letter-spacing/align | `Select`, `Slider`, scrubber*, segmented* |
| `sections/SpacingSection.svelte` | 4-side padding/margin box + link toggle | scrubber*, `Toggle` |
| `sections/LayoutSection.svelte` | display/flex/grid/gap/align | `Select`, segmented* |
| `sections/EffectsSection.svelte` | radius, border, shadow | scrubber*, `Input` |
| `OverridesSection.svelte` | per-element overrides w/ reset | `ListItem`, `Button` |
| `ScopeChip.svelte` | token vs element scope toggle per row | `Pill`, `Menu` |

`*` = controls the library lacks today — see [`06`](06-component-library-gaps.md). Until added, wrap thin local components (per `CODE_GUIDELINES.md §6`) and swap later.

- Sections render **only when relevant** to the element (no typography on an empty `<div>`).
- Defaults reflect the element's **computed** values; token-driven rows also show the token name + "affects N places" (count from the scrape's `consumedBy`).
- The panel is **resizable** (drag gutter, default 320–360px, min 280, max 520) and collapsible — needs the splitter the library lacks.

## Token tab + global browser

- The **Tokens tab** in the inspector = the kept global browser (today's `TokenList`/`TokenGroup`/`TokenRow`), refactored onto library components and reused. The left `TokenSidebar` (Phase 1) and this tab share the same components/store.

## Component-library cleanup (audit results)

Replace bespoke Studio UI with `@juspay/svelte-ui-components`:

| Bespoke today | File(s) | Replace with |
| --- | --- | --- |
| Count chips (`.panel-count`, `.group-count`) | `PanelHeader`, `TokenGroup` | `Badge` |
| Scrollable token list + custom scrollbar | `TokenList` | `Scroller` |
| Token row hover/layout | `TokenRow` | `ListItem` |
| Raw `title=` tooltips | `TopBar`, `ThemeToggle`, `TokenRow` | `Tooltip` |
| URL input + load button | `URLBar` | `InputButton` |
| `⌘Z`/`⌘⇧Z` hint spans | `StatusBar` | `KeyboardInput` |
| Theme toggle (icon button + SVG) | `ThemeToggle` | `ThemeSwitcher` |
| Empty-state cards | `EmptyState` | `Banner` (full-panel zero-state still partly bespoke) |
| Last-action feedback | `StatusBar` | `Toast` (transient) |
| Inline SVG icons | several | `Icon` |

Keep bespoke (no library equivalent — candidates to add upstream): app-shell layout, status-bar footer, sticky group headers, the numeric scrubber, the resizable splitter, the per-element scope chip.

## Risks

- **Per-element overrides vs CSS-variable model** can confuse users — the scope chip + "affects N places" copy is essential; usability-test the toggle.
- **Generated-rule specificity** may lose to the app's `!important`/inline styles — document the limitation; consider an opt-in `!important` for overrides.
- **Library theming depth** — some components may not theme to spec via CSS vars; wrap thin where needed (known risk from the prior redesign plan).
