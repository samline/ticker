---
title: Browser reference
description: Browser registry imports, complete helper behavior, standalone global setup, replacement semantics, and cleanup.
template: doc
---

Use the registry when ids are a convenient ownership boundary or when integrating through a script tag. Use `ticker()` directly when application code already owns controller references.

## Registry shape

```ts
interface TickerApi {
  ticker: typeof ticker
  newTicker(input: NewTickerInput): TickerInstance | null
  getTicker(id: string): HTMLElement | null
  getTickers(): Readonly<Record<string, HTMLElement>>
  destroyTicker(target: string | HTMLElement): void
  destroyTickers(): void
  available: TickerAvailable
}
```

## Module singleton

```ts
import BrowserTicker, {
  available,
  browser,
  destroyTicker,
  destroyTickers,
  getTicker,
  getTickers,
  newTicker,
  ticker,
  Ticker,
} from '@samline/ticker/browser'
```

`BrowserTicker`, `browser`, and `Ticker` refer to the shared singleton. Importing the module does not assign `globalThis.Ticker`.

The package root exports `browser` and `Ticker`, plus registry types, but not the individual named helper functions:

```ts
import { browser, Ticker } from '@samline/ticker'
```

## Standalone global

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.2/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.2/dist/browser/global.global.js"></script>
```

The IIFE installs the same singleton as `window.Ticker` / `globalThis.Ticker`. CSS is a separate explicit asset. Pin versions and self-host both files when Content Security Policy does not permit the CDN.

## `newTicker()`

```ts
const instance = browser.newTicker({
  id: 'headlines',
  options: { duration: 25 },
})
```

It resolves the source with `document.getElementById`, passes it to `ticker()`, stores the controller internally, exposes the wrapper at `available[id]`, and returns the controller.

| Condition                                | Result                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| Empty id                                 | Logs `Ticker ID is required`; returns `null`.                                    |
| Missing/non-HTML source                  | Logs a warning; returns `null`.                                                  |
| Factory cannot produce an active wrapper | Returns `null`; nothing registered.                                              |
| Id already registered                    | Destroys previous controller, restores its source, then registers a replacement. |

## Reads

```ts
browser.getTicker('headlines')
browser.getTickers()
browser.available.headlines
```

`getTicker()` returns one wrapper or `null`. `getTickers()` returns a shallow snapshot; mutating it cannot change the live registry. `available` is live and mutable at the type level, but consumers should treat it as read-only state.

## Cleanup

```ts
browser.destroyTicker('headlines')
browser.destroyTicker(wrapper)
browser.destroyTickers()
```

Destroy by id when possible. Passing a registered wrapper is supported. Unknown ids/elements are no-ops. Cleanup destroys the controller and removes internal and public registry entries.

Prefer registry cleanup over direct `instance.destroy()` for registered instances; direct destruction releases runtime resources but leaves registry bookkeeping until a registry helper replaces or removes it.

## Unregistered factory

`browser.ticker(target, options)` is the same factory as the package root and does not create a registry entry. Its controller must be destroyed directly.

## Related

- [API reference](/ticker/reference/api/#browser-registry)
- [HTML and browser guide](/ticker/guides/html-and-browser/)
- [TypeScript registry types](/ticker/reference/typescript/#browser-registry-types)
