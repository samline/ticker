# API Reference

This section documents every public runtime function and controller member exported by `@samline/ticker`.

## Controller

| API                               | Signature / result                                         | Purpose                                                         |
| --------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------- |
| [`ticker()`](ticker.md)           | `(TickerTarget, TickerOptions?) => TickerInstance \| null` | Enhance a selector or element.                                  |
| [`TickerInstance`](controller.md) | `{ element, source, options, update, refresh, destroy }`   | Element-scoped controller and ownership contract.               |
| [`update()`](update.md)           | `(TickerOptions?) => TickerInstance`                       | Merge normalized options and rebuild.                           |
| [`refresh()`](refresh.md)         | `() => TickerInstance`                                     | Remeasure application-owned content.                            |
| [`destroy()`](destroy.md)         | `() => void`                                               | Disconnect observers, remove clones, and restore source markup. |

## Declarative page manager

| API                                                | Signature    | Purpose                                                              |
| -------------------------------------------------- | ------------ | -------------------------------------------------------------------- |
| [`mount()`](mount.md)                              | `() => void` | Discover declarative ticker markup and watch DOM changes.            |
| [`refresh()`](refresh.md#declarative-page-refresh) | `() => void` | Schedule a rebuild for every tracked ticker.                         |
| [`unmount()`](unmount.md)                          | `() => void` | Stop discovery, remove listeners, and destroy tracked runtime state. |

## Browser registry

[`newTicker()`, `getTicker()`, `getTickers()`, `destroyTicker()`, `destroyTickers()`, `available`, `browser`, and `Ticker`](browser-registry.md) form the browser registry API.

## Core utilities

Defaults, state factories, and normalization helpers are public from the root and `@samline/ticker/core`. See the [Core reference](../core.md).
