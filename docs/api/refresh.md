# `refresh()`

Remeasure content and regenerate clones without changing options.

## Controller refresh

```ts
instance.refresh(): TickerInstance
```

Use it after application code changes ticker content in a way that is not accompanied by a resize. The method is chainable and becomes a no-op after destruction.

## Declarative page refresh

```ts
import { refresh } from '@samline/ticker/vanilla'

refresh(): void
```

The page-level function schedules a rebuild for every ticker currently owned by the declarative manager.
