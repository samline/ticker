# `TickerInstance`

`ticker()` and `newTicker()` return an element-scoped `TickerInstance` controller.

```ts
interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  update(options?: TickerOptions): TickerInstance
  refresh(): TickerInstance
  destroy(): void
}
```

## Properties

### `element`

The active ticker wrapper. For ordinary source content this is the generated `.ticker-wrapper`; for adopted `[data-ticker]` or `.ticker-wrapper` markup it is the supplied element. It becomes `null` after `destroy()`.

### `source`

The element resolved when `ticker()` was called. The reference stays stable after destruction. When ordinary content is enhanced, that same node is moved inside the generated `.ticker-content` and restored when destroyed.

### `options`

A fresh, read-only snapshot of the normalized options:

```ts
{
  duration: 20,
  direction: 'left',
  pauseOnHover: false,
  interactiveClones: false,
  class: '',
}
```

Mutating a returned snapshot does not affect the controller. Use [`update()`](update.md).

## Ownership

One controller owns one active wrapper, its generated clones, scheduled frame, resize debounce timer, `ResizeObserver`, and `IntersectionObserver`. Do not create multiple controllers for the same wrapper. Use [`destroy()`](destroy.md) before transferring ownership.

## Related

- [`ticker()`](ticker.md)
- [`update()`](update.md)
- [`refresh()`](refresh.md)
- [`destroy()`](destroy.md)
