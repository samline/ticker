# Browser Registry

The registry is exposed as `browser` and `Ticker` from the package root, as named exports from `@samline/ticker/browser`, and as `window.Ticker` in the global IIFE.

```ts
const instance = browser.newTicker({ id: 'news', options: { duration: 24 } })
const wrapper = browser.getTicker('news')
const all = browser.getTickers()
browser.destroyTicker('news')
browser.destroyTickers()
```

| API                           | Return                                  | Behavior                                                                                                          |
| ----------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `newTicker({ id, options? })` | `TickerInstance \| null`                | Enhances the element with that id and registers its wrapper. Logs and returns `null` for missing input or source. |
| `getTicker(id)`               | `HTMLElement \| null`                   | Reads one live wrapper from `available`.                                                                          |
| `getTickers()`                | `Readonly<Record<string, HTMLElement>>` | Returns a snapshot object.                                                                                        |
| `destroyTicker(idOrElement)`  | `void`                                  | Destroys the matching registered controller.                                                                      |
| `destroyTickers()`            | `void`                                  | Destroys all registered controllers.                                                                              |
| `available`                   | `TickerAvailable`                       | Live id-to-wrapper registry.                                                                                      |

See [Browser](../browser.md) for CDN setup and bundler imports.
