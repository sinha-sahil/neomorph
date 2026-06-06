# @neomorph/weaver

The script that lives **inside the app being themed**. Weaver is the only thing a target app has to add to become themeable by Neomorph.

It's tiny (~3 KB gzipped), framework-agnostic, and does nothing visible on its own — it just listens for instructions from a designer surface ([Neomorph Studio](../studio) or any app built with [`@neomorph/sdk`](../sdk)) over `postMessage`.

## What it does

Once loaded, Weaver:

- **Scrapes CSS variables** from the page's stylesheets — including inside shadow DOM
- **Applies theme overrides** sent from the designer side, as live inline styles
- **Persists themes** to `localStorage` and restores them on the next load
- **Watches the DOM** with a debounced `MutationObserver` and re-scrapes when stylesheets change
- **Tears down** cleanly on request — disconnects observers and listeners

## Adding it to an app

One script tag, type `module`:

```html
<script
  type="module"
  src="https://cdn.jsdelivr.net/gh/sinha-sahil/neomorph/build/weaver/1.0.0/index.js"
></script>
```

Weaver initializes itself on DOM ready. There's no API to call — the designer side drives everything.

## Configuration (optional)

Set `window.__NEOMORPH_CONFIG__` before the script loads to tune behavior:

```html
<script>
  window.__NEOMORPH_CONFIG__ = {
    debounceMs: 250, // mutation-observer debounce
    persistenceKey: '__neomorph_theme',
    persistByDefault: false, // persist applied themes without an explicit flag
    hostFilter: null // limit scraping to specific host names
  };
</script>
<script type="module" src=".../weaver/1.0.0/index.js"></script>
```

Config can also be updated at runtime — the designer side sends a `configure` message (see the SDK's `loomer.configure()`).

## The protocol

Weaver communicates with the designer side over `postMessage`. It understands these actions:

| Action               | Effect                                                            |
| -------------------- | ----------------------------------------------------------------- |
| `listenCssVariables` | Scrape variables, reply, then keep replying on every DOM mutation |
| `applyCssVariables`  | Apply CSS variable overrides (optionally persist them)            |
| `clearTheme`         | Remove all overrides and clear the persisted theme                |
| `configure`          | Update runtime config                                             |
| `teardown`           | Disconnect observers and listeners                                |

You don't call these directly — the [`Loomer`](../sdk) class in the SDK sends them for you.

## Building

```bash
pnpm build:weaver     # outputs build/weaver/1.0.0/index.js
```

## License

ISC — see [LICENSE](../../LICENSE).
