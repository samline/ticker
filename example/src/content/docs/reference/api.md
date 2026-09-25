---
title: API
description: Complete function, controller, manager, and registry API for @samline/ticker.
---

## `ticker(target, options?)`

```ts
function ticker(target: string | HTMLElement, options?: TickerOptions): TickerInstance | null
```

Resolves a selector or uses the supplied element. Ordinary content is wrapped in the package DOM structure; an existing `[data-ticker]` or `.ticker-wrapper` is adopted. Returns `null` when a selector has no match.

## `TickerInstance`

### `element`

The active wrapper. It becomes `null` after `destroy()`.

### `source`

The original target element. The reference remains stable after destruction.

### `options`

A read-only copy of normalized options.

### `update(options?)`

Merges options, updates wrapper attributes and controller-owned classes, schedules a rebuild, and returns the same controller.

### `refresh()`

Schedules geometry measurement and clone regeneration for this instance, then returns the controller.

### `destroy()`

Cancels scheduled work, disconnects observers, removes clones, and restores the original source when the controller generated a wrapper. Repeated calls are safe.

## Declarative manager

Import these functions from the root or `@samline/ticker/vanilla`.

```ts
mount(): void
refresh(): void
unmount(): void
```

- `mount()` initializes current markup and observes inserted/removed ticker roots.
- `refresh()` schedules a rebuild for every tracked ticker.
- `unmount()` removes page listeners, disconnects the mutation observer, and destroys tracked runtime state.

Calls are safe in non-DOM environments.

## Browser registry

```ts
newTicker(input: { id: string; options?: TickerOptions }): TickerInstance | null
getTicker(id: string): HTMLElement | null
getTickers(): Readonly<Record<string, HTMLElement>>
destroyTicker(target: string | HTMLElement): void
destroyTickers(): void
```

`newTicker()` resolves the source with `document.getElementById()`. An empty id logs an error; a missing element logs a warning. Reusing an id destroys and replaces the previous controller.

`available` is the live wrapper registry. `getTickers()` returns a shallow snapshot so deleting keys from the result cannot mutate the registry.
