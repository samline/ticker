---
title: HTML and browser usage
description: Use @samline/ticker directly from HTML through its dependency-free browser bundle.
template: doc
---

Load the stylesheet and version-pinned IIFE, then use `window.Ticker`.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.2/dist/style.css" />

<div id="news">
  <a href="/one">First story</a>
  <a href="/two">Second story</a>
</div>

<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.2/dist/browser/global.global.js"></script>
<script>
  const news = window.Ticker.newTicker({
    id: 'news',
    options: { duration: 24, pauseOnHover: true },
  })

  news.update({ duration: 30 })
  window.addEventListener('pagehide', () => window.Ticker.destroyTicker('news'), {
    once: true,
  })
</script>
```

## Namespace

| Member                        | Result                                                 |
| ----------------------------- | ------------------------------------------------------ |
| `ticker(target, options?)`    | Create an unregistered element-scoped controller.      |
| `newTicker({ id, options? })` | Create and register a controller by source element id. |
| `getTicker(id)`               | Read a registered wrapper or `null`.                   |
| `getTickers()`                | Read a snapshot of all registered wrappers.            |
| `destroyTicker(id)`           | Destroy a registration and restore its source.         |
| `destroyTickers()`            | Destroy every registration.                            |
| `available`                   | Live object of wrappers keyed by id.                   |

`newTicker()` returns the same controller shape as `ticker()`. Reusing an id destroys the previous controller before creating its replacement, so generated wrappers never nest.

## Browser module

Bundlers can import the same registry without installing a global:

```ts
import { browser } from '@samline/ticker/browser'

const news = browser.newTicker({ id: 'news' })
news?.update({ direction: 'right' })
```

The ESM/CJS module has no `globalThis` side effect. Only `@samline/ticker/browser/global` installs `window.Ticker`.
