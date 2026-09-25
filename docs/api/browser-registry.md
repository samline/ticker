# Browser Registry

The browser registry offers id-based creation and cleanup. It is exposed as `browser` and `Ticker` from the package root, as default and named exports from `@samline/ticker/browser`, and as `window.Ticker` from the global IIFE.

## Shape

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

## `newTicker({ id, options? })`

Resolves a source with `document.getElementById(id)`, enhances it, and registers the resulting wrapper.

```ts
const instance = browser.newTicker({
  id: 'news',
  options: { duration: 24 },
})
```

- An empty id logs `Ticker ID is required` and returns `null`.
- A missing or non-HTML source logs a warning and returns `null`.
- Reusing an id destroys the previous controller, restores its source, and creates a replacement with the new options.
- The returned value is the controller; `available[id]` stores its wrapper element.

## Reads

```ts
browser.getTicker('news')
browser.getTickers()
browser.available.news
```

- `getTicker(id)` returns the live registered wrapper or `null`.
- `getTickers()` returns a shallow snapshot; deleting keys from it cannot change the live registry.
- `available` is the live mutable id-to-wrapper object. Treat it as read-only consumer state.

## Destruction

```ts
browser.destroyTicker('news')
browser.destroyTicker(wrapper)
browser.destroyTickers()
```

`destroyTicker()` accepts a registered id or its current wrapper. It destroys the controller and removes both internal and public registry entries. Unknown ids/elements are no-ops. `destroyTickers()` applies that cleanup to every registration.

Prefer registry destruction over calling a registered controller's `destroy()` directly so registry bookkeeping is also removed.

## Imports

```ts
import { browser, Ticker } from '@samline/ticker'
import BrowserTicker, {
  available,
  destroyTicker,
  destroyTickers,
  getTicker,
  getTickers,
  newTicker,
  ticker,
} from '@samline/ticker/browser'
```

`BrowserTicker`, `browser`, and `Ticker` refer to the shared singleton. The module import has no global side effect. Only `@samline/ticker/browser/global` installs `globalThis.Ticker`.

## Related

- [Browser setup](../browser.md)
- [`ticker()`](ticker.md)
- [TypeScript reference](../typescript.md#browser-registry-types)
