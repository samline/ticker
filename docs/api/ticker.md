# `ticker()`

Enhance an existing element or adopt declarative ticker markup and return an element-scoped controller.

```ts
function ticker(target: TickerTarget, options?: TickerOptions): TickerInstance | null
```

```ts
const instance = ticker('#news', { duration: 24, pauseOnHover: true })
```

- A missing selector returns `null` without mutating the DOM.
- Ordinary content is wrapped in the required ticker structure.
- An existing `[data-ticker]` or `.ticker-wrapper` is adopted rather than wrapped again.
- Explicit options override data attributes on adopted markup.
- The controller owns observers and generated clones until [`destroy()`](destroy.md).

See [Options](../options.md) and [Getting Started](../getting-started.md).
