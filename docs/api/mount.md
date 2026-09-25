# `mount()`

Start the page-level manager for declarative ticker markup.

```ts
import { mount } from '@samline/ticker/vanilla'

mount(): void
```

The manager initializes existing `[data-ticker]` and `.ticker-wrapper` elements, observes added and removed markup, refreshes after fonts and page load, and responds to reduced-motion changes. In non-DOM environments it returns without side effects.

Pair it with [`unmount()`](unmount.md) when a page integration owns a finite lifecycle.
