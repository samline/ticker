# Ticker

> An accessible, dependency-free ticker for Vanilla JavaScript, TypeScript, and plain HTML.

> Enhance existing markup, control each ticker through a small lifecycle API, or initialize declarative ticker markup at page level.

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

## Quick start

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
news?.destroy()
```

## HTML / CDN

Pin the version in production:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.0/dist/style.css" />
<div id="news"><span>Your ticker content</span></div>
<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.0/dist/browser/global.global.js"></script>
<script>
  const news = window.Ticker.newTicker({ id: 'news' })
  news.update({ duration: 30 })
</script>
```

## Entrypoints

| Entrypoint                       | Purpose                                                              |
| -------------------------------- | -------------------------------------------------------------------- |
| `@samline/ticker`                | Main Vanilla API, types, validators, and browser registry singleton. |
| `@samline/ticker/vanilla`        | `ticker()` plus page-level declarative lifecycle functions.          |
| `@samline/ticker/browser`        | ESM/CJS browser registry without global side effects.                |
| `@samline/ticker/browser/global` | Standalone IIFE that installs `window.Ticker`.                       |
| `@samline/ticker/core`           | Types, defaults, state factories, and validation helpers.            |
| `@samline/ticker/style.css`      | Required layout, animation, and reduced-motion styles.               |

## API at a glance

`ticker(target, options)` returns an element-scoped controller:

| Member            | Purpose                                                |
| ----------------- | ------------------------------------------------------ |
| `element`         | Generated wrapper, or `null` after destruction.        |
| `source`          | Original element passed to `ticker()`.                 |
| `options`         | Read-only snapshot of normalized options.              |
| `update(options)` | Merge options and rebuild the ticker.                  |
| `refresh()`       | Remeasure content and regenerate clones.               |
| `destroy()`       | Disconnect observers and restore the original element. |

For server-rendered ticker markup, use `mount()`, `refresh()`, and `unmount()` from `@samline/ticker/vanilla`.

## Options

| Option              | Type                | Default  | Purpose                                         |
| ------------------- | ------------------- | -------- | ----------------------------------------------- |
| `duration`          | `number`            | `20`     | Seconds per animation cycle.                    |
| `direction`         | `'left' \| 'right'` | `'left'` | Horizontal travel direction.                    |
| `pauseOnHover`      | `boolean`           | `false`  | Pause while the pointer hovers the wrapper.     |
| `interactiveClones` | `boolean`           | `false`  | Keep repeated controls exposed and interactive. |
| `class`             | `string`            | `''`     | Space-separated classes added to the wrapper.   |

## Documentation

Full guides, browser setup, recipes, TypeScript reference, styling contracts, and API details are available at **[samline.github.io/ticker](https://samline.github.io/ticker/)**.

## License

MIT
