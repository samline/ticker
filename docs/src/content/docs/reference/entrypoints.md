---
locale: en
sidebar:
  group: reference
  order: 5
title: 'Entrypoints and module formats'
description: 'Choose the root, Vanilla, core, browser registry, standalone IIFE, or stylesheet export.'
---

Choose one primary JavaScript surface per integration and always load the stylesheet explicitly.

## Decision table

| Use case                    | Import                           | Global side effect            | Main surface                                    |
| --------------------------- | -------------------------------- | ----------------------------- | ----------------------------------------------- |
| ESM/TypeScript app          | `@samline/ticker`                | None                          | Factory, manager, core, and registry singleton. |
| Focused Vanilla integration | `@samline/ticker/vanilla`        | None                          | Factory and declarative manager.                |
| Advanced adapters/tests     | `@samline/ticker/core`           | None                          | Types, defaults, state factories, validators.   |
| Registry module             | `@samline/ticker/browser`        | None                          | Default/named id-based registry helpers.        |
| No bundler/CDN              | `@samline/ticker/browser/global` | Installs `globalThis.Ticker`. | Self-contained IIFE registry.                   |
| Runtime styles              | `@samline/ticker/style.css`      | CSS only.                     | Layout, motion, state, reduced motion.          |

## Root entrypoint

```ts
import { browser, mount, refresh, ticker, Ticker, unmount, validateDuration } from '@samline/ticker'
```

The root re-exports all public core and Vanilla symbols plus `browser`, `Ticker`, and registry types. It does not export the individual `newTicker`/`getTicker` helper functions; access them through `browser` or import the browser subpath.

CommonJS consumers receive matching exports:

```js
const { ticker } = require('@samline/ticker')
```

## Vanilla entrypoint

```ts
import { mount, refresh, ticker, unmount } from '@samline/ticker/vanilla'
```

It also exports `TickerInstance`, `TickerOptions`, `TickerTarget`, and `NormalizedTickerOptions` types.

## Core entrypoint

```ts
import {
  DEFAULT_DURATION,
  DEFAULT_OPTIONS,
  createEmptyTickerState,
  validateDuration,
} from '@samline/ticker/core'
```

See [Core utilities](/ticker/docs/reference/core/) for the full surface.

## Browser registry module

```ts
import BrowserTicker, { newTicker, destroyTicker } from '@samline/ticker/browser'
```

Default and named registry exports share one module-level registry and do not assign a global.

## Standalone IIFE

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.4/dist/browser/global.global.js"></script>
<script>
  const news = window.Ticker.newTicker({ id: 'news' })
</script>
```

The IIFE cannot be tree-shaken and must run before consumer code.

## CSS is explicit

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'
```

JavaScript entrypoints never import CSS automatically. This keeps server imports and non-CSS build pipelines predictable.

## Published formats

Bundler entrypoints ship ESM, CommonJS, source maps, and `.d.ts` / `.d.cts` declarations. The global entrypoint ships a single IIFE. The package has no runtime or peer dependencies.
