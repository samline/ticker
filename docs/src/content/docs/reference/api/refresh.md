---
locale: en
sidebar:
  group: api
  order: 4
title: 'refresh()'
description: 'Detailed Ticker API contract: refresh()'
---

Remeasures content and regenerates clones without changing options. The package exports both an instance method and a page-manager function with this name.

## Controller refresh

```ts
instance.refresh(): TickerInstance
```

Schedules a rebuild for one controller and returns the same instance. Use it after application-owned content or visibility changes that may not trigger `ResizeObserver` at the desired time.

The scheduled rebuild:

1. synchronizes data attributes and duration CSS;
2. measures content width, wrapper width, and computed horizontal track gap;
3. marks the wrapper not ready;
4. removes old clones;
5. creates enough clones to cover the wrapper, unless reduced motion is active;
6. writes the exact content width plus horizontal gap to `--ticker-distance`, preserving fractional pixels, and marks the wrapper ready.

Explicit refresh always regenerates clones, even when content changes without changing width. Automatic resize and intersection checks reuse clones when measurements and clone settings are unchanged, preserving animation progress.

Multiple refreshes before the frame runs cancel the prior frame and keep the latest scheduled rebuild. An automatic check cannot cancel a pending explicit rebuild. After destruction, instance `refresh()` is a chainable no-op.

## Declarative page refresh

```ts
import { refresh } from '@samline/ticker/vanilla'

refresh(): void
```

Schedules a rebuild for every ticker currently tracked by the shared runtime, including controller-created and declaratively initialized wrappers.

## Related

- [`update()`](/ticker/docs/reference/api/update/)
- [`mount()`](/ticker/docs/reference/api/mount/)
- [Lifecycle guide](/ticker/docs/getting-started/#controller-lifecycle)
