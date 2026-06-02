# 📊 Neomorph — Progress

> Last updated: 2026-05-24

A snapshot of where the project actually stands. Numbers are derived from the current code (file count, type-check / lint / build state, completed actions), not from a roadmap.

## Overall: ~92%

The end-to-end loop **works today**: drop the Weaver script into a target app, point Neomorph Studio (or your own SDK consumer) at it, scrape its CSS variables, apply a theme, persist it, restore on reload. CI publishes the SDK, builds Weaver, and deploys Studio.

What's missing isn't core plumbing — it's a real *editor* in Studio, a test suite, and a handful of API conveniences.

```
Weaver   ██████████████████████████████████████░░  95%
SDK      ████████████████████████████████████░░░░  90%
Studio   ██████████████████████████████████████░░  95%
Tests    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   0%
```

---

## Packages

### `@neomorph/weaver` — 95%

The script that lives inside the target app. **~8.5 KB raw / ~2.7 KB gzipped.**

- ✅ PostMessage listener + handler dispatch
- ✅ CSS variable scraping (document + shadow DOM)
- ✅ Mutation observer with debounce, guarded by an `isApplying` flag
- ✅ Apply / clear overrides (document root + shadow root `:host` injection)
- ✅ Persist to `localStorage`, restore on init
- ✅ Configurable at runtime via `window.__NEOMORPH_CONFIG__` or `configure` action
- ✅ Cleanly tears down listeners and observers
- ✅ TS strict, ESLint clean, no circular deps
- ❌ No tests

### `@neomorph/sdk` — 90%

Headless designer-side API. **~2.5 KB raw / ~1.0 KB gzipped (CDN build).**

- ✅ `Loomer` class: `loadApplication`, `listenCssVariables`, `applyCssVariables`, `clearTheme`, `configure`, `teardown`
- ✅ Iframe load queueing — messages sent before iframe is ready are flushed after `load`
- ✅ Response filtering — scraping callback only fires on scraped-variable responses, not on apply/clear/configure echoes
- ✅ `Weaver.inject()` static helper for adding the in-app script
- ✅ Full `.d.ts` published; CDN build exposes `window.Neomorph`
- ❌ No event emitter (`onReady`, `onError`, `onThemeChange`)
- ❌ No batched-apply helper
- ❌ No tests

### `@neomorph/studio` — 95%

SvelteKit visual designer, built on the SDK. Rebuilt from first principles — modular `src/lib/studio/` with types · utils · stores · SDK bridge · 16 Svelte 5 components.

- ✅ URL onboarding via `?appUrl=` query-param
- ✅ Editor view: iframe preview + scraped-variables sidebar
- ✅ **Inline variable editing** — color swatch, hex input, opacity / font-weight sliders, text editors per kind
- ✅ **Undo / redo** with `⌘Z` / `⌘⇧Z` (full history, per-variable)
- ✅ Light / dark theme for Studio chrome (`⌘⇧L`, toggle in status bar)
- ✅ Token search + grouped sticky-header lists (Colors / Typography / Sizing / Shadow / Motion / Numeric / Aliases / Other)
- ✅ Scope switcher (shown only when target has > 1 host)
- ✅ Status bar — scope · token count · last action · undo/redo indicator
- ✅ Builds via `@sveltejs/adapter-vercel` for prebuilt deploys
- ✅ `svelte-check` clean, ESLint + Prettier clean
- ✅ Module boundary: only `sdk-bridge.ts` imports `@neomorph/sdk` (single SDK seam)
- ❌ No save/load named themes, no theme export/import
- ❌ No tests

### `examples/` — done

One HTML target app with realistic CSS variables. Sufficient for full E2E testing.

---

## Recently shipped (since last review)

- **Studio rebuild from first principles** — wiped the 881-line monolithic `+page.svelte` and re-architected under `src/lib/studio/`: types · utils · 5 small stores · single SDK bridge · 16 Svelte 5 components (each < 150 lines). New light-first design language (Inter + JetBrains Mono, 11/12/13/15 type scale, deep-indigo accent), dark mode, keyboard-driven undo/redo, status bar. Planned via `skulls-mcp` (`./plans/studio-redesign/`).
- **Weaver reorganization** — flattened from 15 files / nested folders to 7 cohesive flat files (`messaging.ts`, `scraper.ts`, `applier.ts`, `storage.ts`, `state.ts`, `types.ts`, `index.ts`). No circular dependencies.
- **`loomer` → `studio` rename** — the package, scripts, workflow filters, READMEs, and CLAUDE.md. The SDK's `Loomer` *class* kept its name; only the package was renamed.
- **End-to-end loop** — Studio now drives the SDK against the example target app and shows scraped variables.
- **Two real bug fixes uncovered while building the example:**
  - Map-of-maps serialization across `postMessage` (only the outer Map was being converted via `Object.fromEntries`).
  - Terser's `mangle` produced subtly broken scope nesting in the minified scraper; disabled with `mangle: false`.
- **CI hardening** — Node 18 → **24 LTS**, pnpm 10.18 → **11.2.2** (with `allowBuilds` migrated to `pnpm-workspace.yaml`), every `npm` call swapped for `pnpm`, Vercel deploys switched to **prebuilt** (so `workspace:*` doesn't break Vercel's `npm install`), fixed wrong build-artifact paths in the commit step.
- **ESLint config** with house style rules: no `as`, no `undefined`, no `interface`, no falsy null checks, curly braces required, unused imports flagged.
- **READMEs rewritten** — root README pivoted from architecture explainer to sales pitch; SDK/Studio/Weaver READMEs written against the real API with Mermaid sequence diagrams where useful.

---

## Up next, in priority order

1. **Test suite.** Even a small Vitest suite around `messaging.ts` (mock parent window, send each action, assert response) would catch the kind of regressions we hit by hand (Map serialization, Terser mangle). Studio gets Playwright when there's time.
2. **Studio: save / load named themes.** Persist multiple themes to localStorage, list them, switch between them, export as JSON.
3. **SDK event emitter.** `onReady`, `onError`, `onThemeApplied`. Today everything funnels through the one `listenCssVariables` callback.
4. **Command menu (`⌘K`)** in Studio — fuzzy search across tokens, jump-to-edit.
5. **A11y validators** in Studio — flag contrast failures when editing color tokens.

---

## Known issues / housekeeping

- **Vercel project is still named `loomer`** in the dashboard — last deploy URL was `loomer-….vercel.app`. Cosmetic; needs a manual rename in Vercel (we can't fix from the repo).
- **GitHub Actions YAML linter** warns about `${{ env.SDK_PUBLISHED }}` etc. — false positives, those vars are set via `>> $GITHUB_ENV` in earlier steps. Safe to ignore.
- **Workflow's `--no-git-checks` on `pnpm publish`** is intentional (the version-bump step leaves `package.json` dirty); just noting it.
