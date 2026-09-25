# Ticker

> An accessible, dependency-free ticker for Vanilla JavaScript, TypeScript, and plain HTML.

> Enhance existing markup, control each ticker through a small lifecycle API, or initialize declarative ticker markup at page level.

---

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [What You Can Build](#what-you-can-build)
- [API at a Glance](#api-at-a-glance)
- [Documentation](#documentation)
- [License](#license)

---

## Installation

```bash
npm install @samline/ticker
```

```bash
pnpm add @samline/ticker
```

```bash
bun add @samline/ticker
```

Requires Node 20+ when bundling. Runtime target is ES2020.

Import the stylesheet once in your application entrypoint:

```ts
import '@samline/ticker/style.css'
```

---

## CDN / Browser

Use the browser build when you do not have a bundler and need to run the package directly in HTML, WordPress, Shopify, or a traditional server-rendered template.

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.0.1/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.0.1/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.0.1` with the version you ship.

The browser bundle exposes a single global: `window.Ticker`.

```html
<div id="news"><a href="/news">Latest story</a></div>

<script>
  const news = window.Ticker.newTicker({
    id: 'news',
    options: { duration: 24, pauseOnHover: true },
  })

  news?.update({ duration: 30 })
</script>
```

The browser surface keeps a registry under `Ticker.available`, keyed by the id passed to `newTicker()`. See [docs/browser.md](docs/browser.md) for the complete browser API.

---

## Entrypoints

| Entrypoint                       | When to use                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `@samline/ticker`                | Main API, browser singleton, types, defaults, and validators. |
| `@samline/ticker/vanilla`        | `ticker()` plus declarative page lifecycle helpers.           |
| `@samline/ticker/browser`        | ESM/CJS browser registry without a global side effect.        |
| `@samline/ticker/browser/global` | Pre-bundled IIFE that installs `window.Ticker`.               |
| `@samline/ticker/core`           | Types, defaults, state factories, and validation helpers.     |
| `@samline/ticker/style.css`      | Required layout, animation, and reduced-motion styles.        |

The main entrypoint also exports `browser`, the same registry singleton used by the browser module, without installing `window.Ticker`. See [docs/browser.md](docs/browser.md#using-the-registry-from-a-bundler).

---

## Quick Start

```html
<div id="news-ticker">
  <a href="/one">First story</a>
  <a href="/two">Second story</a>
</div>
```

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'

const news = ticker('#news-ticker', {
  duration: 20,
  direction: 'left',
  pauseOnHover: true,
})

news?.update({ duration: 30 })
news?.refresh()
news?.destroy()
```

What this does:

- Enhances the existing element and returns an element-scoped controller.
- Measures its content and creates enough visual clones to fill the viewport.
- Hides repeated content from assistive technology and keyboard navigation by default.
- Rebuilds after responsive size changes and pauses work while off screen.
- Restores the original source element when `destroy()` runs.

---

## What You Can Build

- News, announcement, logo, sponsor, and promotion tickers.
- Progressive enhancement for server-rendered or CMS-owned markup.
- Responsive marquees that remeasure after fonts, layout, or content change.
- Browser-global integrations for WordPress, Shopify, and plain HTML.
- Declarative tickers that are discovered as the DOM changes.

---

## API at a Glance

| Group                 | API                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Controller factory    | [`ticker()`](docs/api/ticker.md)                                                                                                  |
| Controller lifecycle  | [`update()`](docs/api/update.md) · [`refresh()`](docs/api/refresh.md) · [`destroy()`](docs/api/destroy.md)                        |
| Declarative lifecycle | [`mount()`](docs/api/mount.md) · [`refresh()`](docs/api/refresh.md#declarative-page-refresh) · [`unmount()`](docs/api/unmount.md) |
| Browser registry      | [`newTicker()` and registry helpers](docs/api/browser-registry.md)                                                                |
| Configuration         | [`TickerOptions`](docs/options.md)                                                                                                |
| Types                 | [TypeScript reference](docs/typescript.md)                                                                                        |

The controller exposes `element`, `source`, and an immutable options snapshot. `update()` and instance `refresh()` are chainable; `destroy()` owns teardown and restoration.

See the complete reference in [`docs/api/`](docs/api/index.md).

---

## Documentation

Full guides and the same reference are available at **[samline.github.io/ticker](https://samline.github.io/ticker/)**.

| Doc                                                | Purpose                                                        |
| -------------------------------------------------- | -------------------------------------------------------------- |
| [docs/getting-started.md](docs/getting-started.md) | Installation, first ticker, ownership, and lifecycle.          |
| [docs/options.md](docs/options.md)                 | Every option, default, normalization rule, and data attribute. |
| [docs/browser.md](docs/browser.md)                 | Browser global and bundler-friendly registry usage.            |
| [docs/styling.md](docs/styling.md)                 | Required stylesheet, DOM contract, classes, and CSS variables. |
| [docs/accessibility.md](docs/accessibility.md)     | Clone behavior, reduced motion, and interactive content.       |
| [docs/typescript.md](docs/typescript.md)           | Exported TypeScript types and their roles.                     |
| [docs/api/index.md](docs/api/index.md)             | Public functions and controller methods.                       |

---

## License

MIT
