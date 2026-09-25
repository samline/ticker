# Browser

Use the browser build when a page does not have a bundler and needs to integrate `@samline/ticker` directly into HTML, Shopify, WordPress, or a traditional template.

---

## Script tag

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.0.1/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.0.1/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.0.1` with the version you ship.

The IIFE registers `window.Ticker` (also reachable through `globalThis.Ticker`).

---

## Minimal example

```html
<div id="news"><a href="/news">Latest story</a></div>

<script>
  const news = window.Ticker.newTicker({
    id: 'news',
    options: { duration: 24, pauseOnHover: true },
  })

  console.log(window.Ticker.available.news)
  window.Ticker.destroyTicker('news')
</script>
```

The returned controller is the registered instance controller. `Ticker.available[id]` stores its current wrapper element, not the controller.

## Registry helpers

| Helper                        | Purpose                                                         |
| ----------------------------- | --------------------------------------------------------------- |
| `ticker(target, options?)`    | Use the controller factory without registering the result.      |
| `newTicker({ id, options? })` | Create and register a ticker by source element id.              |
| `getTicker(id)`               | Return the registered wrapper or `null`.                        |
| `getTickers()`                | Return a read-only snapshot of registered wrappers.             |
| `destroyTicker(idOrElement)`  | Destroy one registered instance and remove it from `available`. |
| `destroyTickers()`            | Destroy every registered instance.                              |
| `available`                   | Live id-to-wrapper object.                                      |

Calling `newTicker()` again with the same id destroys the previous registration and enhances its original source again.

---

## Using the registry from a bundler

The main entrypoint exports `browser`, the same singleton shape without installing a global:

```ts
import { browser } from '@samline/ticker'
import '@samline/ticker/style.css'

const news = browser.newTicker({ id: 'news' })
browser.destroyTicker('news')
```

You can also import named helpers from `@samline/ticker/browser`. Both imports share the same module-level registry.
