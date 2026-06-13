# `@juspay/svelte-ui-components` — Gaps to Add Upstream

This is the answer to "tell me whatever is missing in it." The library (52+ components) already covers most chrome — but a Figma/Framer styling tool needs a handful of controls it lacks. Each below: what, why, proposed API, and the Studio workaround until it lands.

> Note: the library **does** ship `ColorPicker` (today's `TokenRow` imports it). The MCP `list_components` index omitted it — don't treat ColorPicker as missing.

## 1. NumericScrubber (highest value)

- **Why:** the Figma-signature numeric field — drag the label left/right to change the value, type to set exactly, arrow keys nudge (Shift ×10). Used everywhere in the inspector (spacing, radius, font-size, border-width, line-height). `Slider` is too wide/imprecise for a dense inline cell.
- **Proposed API:** `value` (bindable number), `min`, `max`, `step`, `precision`, `suffix` (e.g. `px`/`%`), `dragSensitivity`, `onchange`. Pointer-capture drag on the label; `Input`-like typing in the field.
- **Workaround:** thin local `NumericScrubber.svelte` in `lib/studio/ui/controls/`; swap import when upstream.

## 2. Splitter / PanelGroup (resizable panels)

- **Why:** the wide right inspector and the left token sidebar must be drag-resizable + collapsible. Nothing in the library does panel resizing.
- **Proposed API:** `PanelGroup` (direction row/col) + `Panel` (`min`, `max`, `default`, `collapsible`) + `Splitter` gutter; emits sizes; keyboard-accessible.
- **Workaround:** local pointer-drag gutter writing a CSS width var.

## 3. Popover (generic anchored floating layer)

- **Why:** color poppers, the scope-chip menu, token detail flyouts. Today only `Tooltip` (hover), `Menu`, `ContextMenu` exist — no general-purpose anchored popover with flip/shift.
- **Proposed API:** `anchor`, `open` (bindable), `placement`, `offset`, `flip`, `dismissable`, `children` snippet. (Floating UI under the hood.)
- **Workaround:** local popover; adopt Floating UI if positioning gets hairy.

## 4. SegmentedControl

- **Why:** text-align, display mode, alignment — compact mutually-exclusive icon/label groups. `ThemeSwitcher` is a hardcoded special case; `Tabs` is for panels, not inline property controls.
- **Proposed API:** `options:[{value,label?,icon?}]`, `value` (bindable), `size`, `onchange`; animated active indicator (reuse `ThemeSwitcher`'s slider).
- **Workaround:** local segmented control; or factor `ThemeSwitcher`'s internals into a generic base upstream.

## 5. ColorSwatch (standalone)

- **Why:** a 16px read-only/clickable color dot for token rows and inspector summaries. Today faked by shrinking `ColorPicker` to 16px via CSS-var hacks (fragile).
- **Proposed API:** `value`, `size`, `onclick?`; checkerboard behind alpha; opens a `Popover`+`ColorPicker` when clickable.
- **Workaround:** keep the shrunk-`ColorPicker` hack; replace when available.

## 6. Tree / Layers (Phase 4, lower priority)

- **Why:** an element/token hierarchy ("Layers"-style) for navigation when selection-by-click isn't enough. Not needed for P1–P3 but on the roadmap.
- **Proposed API:** `nodes` (recursive), `expanded` set, `selected`, `onselect`, row snippet; keyboard nav.
- **Workaround:** defer; `Accordion` + `ListItem` compose a flat version meanwhile.

## 7. Smaller asks

- **PropertyRow** layout primitive (label + control + scope chip, grid-aligned) — composable, would standardize the inspector. Could be a Studio-local primitive rather than upstream.
- **StatusBar / bottom Toolbar variant** — `Toolbar` is top-anchored (adds bottom shadow); a bottom variant would remove a bespoke footer.
- **Prefixed-icon `Input`** — `PanelHeader` absolutely-positions a search icon over `Input`; a built-in `leadingIcon` snippet on `Input` would remove the hack.

## Sequencing

Build local versions in `lib/studio/ui/controls/` during Phase 3 (NumericScrubber, Splitter, Popover, SegmentedControl, ColorSwatch are blockers for the inspector). Once stable, propose them upstream to `@juspay/svelte-ui-components` with the APIs above, then swap Studio's imports — keeping the house rule of "use the library, wrap thin only when it can't theme/cover" intact.
