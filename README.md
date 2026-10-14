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
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.0.4/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.0.4/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.0.4` with the version you ship.

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

The browser surface keeps a registry under `Ticker.available`, keyed by the id passed to `newTicker()`. See [Browser integration](docs/src/content/docs/reference/browser.md) for the complete browser API.

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

The main entrypoint also exports `browser`, the same registry singleton used by the browser module, without installing `window.Ticker`. See [Browser integration](docs/src/content/docs/reference/browser.md#module-singleton).

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
- Preserves fractional widths and horizontal gaps so repeated content aligns at each loop reset.
- Hides repeated content from assistive technology and keyboard navigation by default.
- Reuses visual clones when responsive measurements are unchanged and pauses animation outside the viewport or while the document is hidden.
- Restores the original source element when `destroy()` runs.

---

## Seamless Loops

The runtime preserves fractional measurements in both directions. Match item spacing to the horizontal track gap and include any decorative separator at the end of the sequence. See [Styling: seamless loops](docs/src/content/docs/reference/styling.md#seamless-loops) for the CSS pattern.

---

## What You Can Build

- News, announcement, logo, sponsor, and promotion tickers.
- Progressive enhancement for server-rendered or CMS-owned markup.
- Responsive marquees that remeasure after fonts, layout, or content change.
- Browser-global integrations for WordPress, Shopify, and plain HTML.
- Declarative tickers that are discovered as the DOM changes.

---

## API at a Glance

| Group                 | API                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller factory    | [`ticker()`](docs/src/content/docs/reference/api/ticker.md)                                                                                                                                                        |
| Controller lifecycle  | [`update()`](docs/src/content/docs/reference/api/update.md) · [`refresh()`](docs/src/content/docs/reference/api/refresh.md) · [`destroy()`](docs/src/content/docs/reference/api/destroy.md)                        |
| Declarative lifecycle | [`mount()`](docs/src/content/docs/reference/api/mount.md) · [`refresh()`](docs/src/content/docs/reference/api/refresh.md#declarative-page-refresh) · [`unmount()`](docs/src/content/docs/reference/api/unmount.md) |
| Browser registry      | [`newTicker()` and registry helpers](docs/src/content/docs/reference/api/browser-registry.md)                                                                                                                      |
| Configuration         | [`TickerOptions`](docs/src/content/docs/reference/configuration.md)                                                                                                                                                |
| Core utilities        | [Defaults, state factories, and validators](docs/src/content/docs/reference/core.md)                                                                                                                               |
| Types                 | [TypeScript reference](docs/src/content/docs/reference/typescript.md)                                                                                                                                              |

The controller exposes `element`, `source`, and an immutable options snapshot. `update()` and instance `refresh()` are chainable; `destroy()` owns teardown and restoration.

See the complete reference in [the complete API](docs/src/content/docs/reference/api.md).

---

## Documentation

Full guides and the same reference are available at **[samline.github.io/ticker/docs](https://samline.github.io/ticker/docs/)**.

| Doc                                                               | Purpose                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [Installation](docs/src/content/docs/getting-started.md)          | Installation, first ticker, ownership, and lifecycle.          |
| [Configuration](docs/src/content/docs/reference/configuration.md) | Every option, default, normalization rule, and data attribute. |
| [Browser integration](docs/src/content/docs/reference/browser.md) | Browser global and bundler-friendly registry usage.            |
| [Entrypoints](docs/src/content/docs/reference/entrypoints.md)     | Root, Vanilla, core, browser, global, and CSS exports.         |
| [Styling](docs/src/content/docs/reference/styling.md)             | Required stylesheet, DOM contract, classes, and CSS variables. |
| [Accessibility](docs/src/content/docs/guides/accessibility.md)    | Clone behavior, reduced motion, and interactive content.       |
| [Core utilities](docs/src/content/docs/reference/core.md)         | Defaults, state factories, validators, and advanced contracts. |
| [TypeScript](docs/src/content/docs/reference/typescript.md)       | Exported TypeScript types and their roles.                     |
| [API reference](docs/src/content/docs/reference/api.md)           | Public functions and controller methods.                       |
| [Recipes](docs/src/content/docs/reference/examples.md)            | Task-oriented integration and lifecycle recipes.               |

---

## License

MIT

## Documentation site

The custom Astro 7 documentation lives in `docs/`; the landing lives in `landing/`. They share theme tokens and reusable controls, and deploy together at `/ticker/` and `/ticker/docs/` as one GitHub Pages artifact. Starlight has been replaced.

```sh
npm ci --prefix docs
npm run docs:dev
npm run docs:check
npm run site:build
npm run docs:test:browser
npm run site:test:browser
```

See [the docs maintenance guide](docs/README.md) and [implementation contract](docs/AGENTS.md). Update public API references, examples, navigation, search, source links and coverage checks together whenever the package changes. Only maintained Markdown content is included in the npm package; site dependencies and generated assets are excluded.
