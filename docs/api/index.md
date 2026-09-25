# API Reference

The public API has three layers: an element-scoped controller, a declarative page manager, and an optional browser registry.

## Controller

| API                       | Purpose                                                         |
| ------------------------- | --------------------------------------------------------------- |
| [`ticker()`](ticker.md)   | Enhance a selector or element and return its controller.        |
| [`update()`](update.md)   | Merge normalized options and rebuild the instance.              |
| [`refresh()`](refresh.md) | Remeasure application-owned content.                            |
| [`destroy()`](destroy.md) | Disconnect observers, remove clones, and restore source markup. |

## Declarative page manager

| API                                                | Purpose                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| [`mount()`](mount.md)                              | Discover declarative ticker markup and watch DOM additions/removals. |
| [`refresh()`](refresh.md#declarative-page-refresh) | Schedule a rebuild for every managed ticker.                         |
| [`unmount()`](unmount.md)                          | Stop discovery, remove listeners, and destroy managed ticker state.  |

## Browser registry

[`newTicker()`, `getTicker()`, `getTickers()`, `destroyTicker()`, `destroyTickers()`, and `available`](browser-registry.md) provide id-based registration for global-script and bundler integrations.
