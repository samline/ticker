# `refresh()`

Remeasures content and regenerates clones without changing options. The package exports both an instance method and a page-manager function with this name.

## Controller refresh

```ts
instance.refresh(): TickerInstance
```

Schedules a rebuild for one controller and returns the same instance. Use it after application-owned content or visibility changes that may not trigger `ResizeObserver` at the desired time.

The scheduled rebuild:

1. synchronizes data attributes and duration CSS;
2. marks the wrapper not ready;
3. removes old clones;
4. measures content width, wrapper width, and computed track gap;
5. creates enough clones to cover the wrapper, unless reduced motion is active;
6. writes `--ticker-distance` and marks the wrapper ready.

Multiple refreshes before the frame runs cancel the prior frame and keep the latest scheduled rebuild. After destruction, instance `refresh()` is a chainable no-op.

## Declarative page refresh

```ts
import { refresh } from '@samline/ticker/vanilla'

refresh(): void
```

Schedules a rebuild for every ticker currently tracked by the shared runtime, including controller-created and declaratively initialized wrappers.

## Related

- [`update()`](update.md)
- [`mount()`](mount.md)
- [Lifecycle guide](../getting-started.md#controller-lifecycle)
