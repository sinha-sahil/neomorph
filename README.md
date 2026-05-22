# 🔮 Neomorph

> Let anyone rebrand your web app in real time — without you rewriting a single component.

If your app styles itself with CSS variables, Neomorph turns it into a themeable canvas. Drop one `<script>` tag in, and from then on **anyone** — your designers, your customers, your white-label clients — can recolor, restyle, and preview the result live, all from a separate designer surface.

No SDK calls inside your app. No framework coupling. No re-deploys to ship a new look.

<!--
  Add a Studio screenshot or GIF here once available:
  ![Neomorph Studio in action](docs/screenshot.png)
-->

---

## Why teams use Neomorph

- 🎨 **Live theming** — colors, spacing, typography update in the iframe the moment they change.
- 🔌 **One-line integration** — a single `<script>` tag in the app being themed. That's the only contract.
- 🧰 **Drop-in app, or your own UI** — use **Neomorph Studio** out of the box, or build branded theming into your own product with the headless **SDK**.
- 💾 **Persists across reloads** — applied themes survive page refreshes via `localStorage`, and Neomorph watches the DOM to keep dynamic styles in sync.
- 🪶 **Tiny** — the in-app script is ~3 KB gzipped.

---

## Try it in 30 seconds

**1. Add one line to the app you want to theme:**

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/sinha-sahil/neomorph/build/weaver/1.0.0/index.js"
></script>
```

**2. Spin up Neomorph Studio and point it at your app:**

```bash
pnpm dev:studio
# then open http://localhost:9900/?appUrl=https://your-app.com
```

That's it. Edit themes visually; changes are previewed live in the iframe.

---

## Or build theming into your own product

```ts
import { Loomer } from "@neomorph/sdk";

const loomer = new Loomer();
loomer.loadApplication("https://your-app.com", document.getElementById("preview"));

loomer.applyCssVariables(
  { document: { "--color-primary": "#e11d48" } },
  /* persist */ true,
);
```

Headless. Framework-agnostic. Ship per-customer branding without touching the app you're branding.

---

## Use cases

- **SaaS** — let customers theme their own dashboards
- **E-commerce** — let merchants brand their storefronts
- **White-label** — ship per-client branding without per-client builds
- **Design systems** — author, preview, and hand off theme variants

---

## Get started

```bash
git clone https://github.com/sinha-sahil/neomorph.git
cd neomorph && pnpm install
```

| If you want to… | Look at |
|---|---|
| Use the visual designer | [`@neomorph/studio`](packages/studio) |
| Build theming into your own product | [`@neomorph/sdk`](packages/sdk) |
| Understand the in-app script | [`@neomorph/weaver`](packages/weaver) |
| Contribute | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## License

MIT — see [LICENSE](LICENSE).

Made with ❤️ by [Sahil Sinha](https://github.com/sinha-sahil)
