# Entrypoints and Module Formats

Choose one primary JavaScript surface per integration and load the stylesheet explicitly.

## Decision table

| Use case                    | Import                           | Global side effect            | Main surface                                    |
| --------------------------- | -------------------------------- | ----------------------------- | ----------------------------------------------- |
| ESM/TypeScript app          | `@samline/ticker`                | None                          | Factory, manager, core, and registry singleton. |
| Focused Vanilla integration | `@samline/ticker/vanilla`        | None                          | Factory and declarative manager.                |
| Advanced adapters/tests     | `@samline/ticker/core`           | None                          | Types, defaults, state factories, validators.   |
| Registry module             | `@samline/ticker/browser`        | None                          | Default/named id-based registry helpers.        |
| No bundler/CDN              | `@samline/ticker/browser/global` | Installs `globalThis.Ticker`. | Self-contained IIFE registry.                   |
| Runtime styles              | `@samline/ticker/style.css`      | CSS only.                     | Layout, motion, state, reduced motion.          |

## Root

```ts
import { browser, mount, refresh, ticker, Ticker, unmount, validateDuration } from '@samline/ticker'
```

The root re-exports all public core and Vanilla symbols plus `browser`, `Ticker`, and browser registry types. It does not export individual `newTicker` / `getTicker` helpers; use `browser.newTicker()` or the browser subpath.

```js
const { ticker } = require('@samline/ticker')
```

## Vanilla

```ts
import { mount, refresh, ticker, unmount } from '@samline/ticker/vanilla'
```

Also exports `TickerInstance`, `TickerOptions`, `TickerTarget`, and `NormalizedTickerOptions` types.

## Core

```ts
import {
  DEFAULT_DURATION,
  DEFAULT_OPTIONS,
  createEmptyTickerState,
  validateDuration,
} from '@samline/ticker/core'
```

See [Core](core.md) for every export.

## Browser module

```ts
import BrowserTicker, { newTicker, destroyTicker } from '@samline/ticker/browser'
```

Default and named registry exports share one registry and do not assign a global.

## Global IIFE

```html
<script src="https://unpkg.com/@samline/ticker@2.0.2/dist/browser/global.global.js"></script>
<script>
  const news = window.Ticker.newTicker({ id: 'news' })
</script>
```

## CSS

```ts
import '@samline/ticker/style.css'
```

JavaScript entrypoints never import CSS automatically. Bundler entrypoints ship ESM, CommonJS, source maps, and `.d.ts` / `.d.cts` declarations. The IIFE is self-contained. The package has no runtime or peer dependencies.
