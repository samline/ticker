---
locale: en
sidebar:
  group: api
  order: 2
title: 'TickerInstance'
description: 'Detailed Ticker API contract: TickerInstance'
---

`ticker()` and `newTicker()` return an element-scoped `TickerInstance` controller.

```ts
interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  readonly state: Readonly<TickerSnapshot>
  play(): TickerInstance
  pause(): TickerInstance
  scrollTo(position: number): TickerInstance
  scrollBy(distance: number): TickerInstance
  connectControls(controls: TickerControls): () => void
  on<K extends keyof TickerEventMap>(
    event: K,
    listener: (state: TickerEventMap[K]) => void
  ): () => void
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
  duration: 20, speed: 0, direction: 'left', autoplay: true,
  pauseOnHover: false, pauseOnFocus: true, navigation: false,
  responsive: [], interactiveClones: false, class: '',
}
```

Mutating a returned snapshot does not affect the controller. Use [`update()`](/ticker/docs/reference/api/update/).

## Playback and state

`play()` and `pause()` are chainable, idempotent and preserve visual position. Explicit pause persists through refresh, resize, hover, focus, visibility, intersection and responsive rules. `play()` records intent but still respects automatic causes.

`TickerSnapshot` is a frozen snapshot containing `ready`, `destroyed`, `requested`, `playing`, `reasons`, `position`, `distance`, `duration` and resolved physical `direction`. Position and distance are CSS pixels; duration is measured seconds per cycle. Read `state` whenever the current position is needed. `TickerPauseReason` is `manual`, `hover`, `focus`, `hidden`, `offscreen` or `reduced-motion`. The reasons array is also frozen.

```ts
const news = ticker('#news', { autoplay: false })
const button = document.querySelector<HTMLButtonElement>('#playback')!
if (news) {
  const render = () => {
    button.textContent = news.state.requested ? 'Pause animation' : 'Play animation'
  }
  render()
  const unsubscribe = news.on('playback', render)
  button.addEventListener('click', () => (news.state.requested ? news.pause() : news.play()))
  // Remove application listeners and call unsubscribe() when their owner leaves.
}
```

Use changing action labels as above without `aria-pressed`. Environmental pauses do not change the requested action. Initial state is available immediately; measurements become ready asynchronously.

## Manual navigation

`scrollTo(position)` seeks to a logical CSS-pixel distance; `scrollBy(distance)` adds to the current logical position. Both wrap modulo one complete content-and-gap period, act instantly, and leave playback explicitly paused. Negative values wrap backward. Nonfinite values are ignored. Buttons default to one visible extent per click; provide a positive `step` to use a fixed distance. There is no item snapping.

```ts
const news = ticker('#news', { autoplay: false, navigation: true })
const disconnect = news?.connectControls({
  previous: document.querySelector<HTMLButtonElement>('#previous')!,
  next: document.querySelector<HTMLButtonElement>('#next')!,
  rail: document.querySelector<HTMLInputElement>('#position')!,
  step: 120,
})
```

`TickerControls` accepts optional native previous/next buttons and an `input type="range"` rail supplied by the application. Give buttons accessible names (Previous items / Next items), a labelled range and visible focus styles. Ticker owns only their bindings; it does not create UI or replace application styling. `connectControls()` returns an idempotent disconnect function. Destruction disconnects automatically and restores rail attributes. Use one set per ticker.

The range spans one repeating sequence, not an infinite scrollbar. Its end wraps to zero; keyboard End selects just before the seam. Home selects zero. Arrow keys follow logical writing order/axis; other inputs in content retain native behavior. The connected rail samples the position every 100ms while playing without public frame events. It updates immediately after seeking and measuring.

With `navigation: true`, Pointer Events support touch and mouse dragging after a six-pixel axis threshold. Perpendicular scrolling remains native (`pan-y` for horizontal and `pan-x` for vertical); input, select, textarea and editable content do not initiate a drag. A tap retains its link action; an actual drag suppresses the resulting click. No inertia or forced smooth animation is applied. Reduced motion disables autoplay but still permits instantaneous navigation with repeated inert copies. Calling `scrollTo`/`scrollBy` also enables those copies when needed under reduced motion.

## Events

`on(event, listener)` returns an idempotent unsubscribe function. The typed `TickerEventMap` maps every event below to `TickerSnapshot`; browser/CDN has the same contract. Events do not replay for late subscriptions: use `state` for initial status.

| Event      | Emission                                                                        |
| ---------- | ------------------------------------------------------------------------------- |
| `ready`    | Once, after the first successful nonzero measurement.                           |
| `measure`  | After geometry or copied content is rebuilt, including explicit refresh.        |
| `playback` | Only when requested playback, effective playback or pause reasons change.       |
| `update`   | When effective normalized configuration changes, including a breakpoint change. |
| `navigate` | After each explicit seek, button, rail or drag movement.                        |
| `destroy`  | Once, after runtime teardown, with destroyed true and playing false.            |

On first measurement, `ready` precedes `measure`; readiness-dependent playback synchronization follows. Configuration changes apply before `update`; scheduled measurement follows asynchronously. User navigation records pause first, then seeks and emits `navigate`. There are no automatic frame events. Callbacks run synchronously using a listener snapshot. New subscriptions wait for the next event; unsubscribed callbacks are skipped. Reentrant controller calls are allowed; destruction prevents further non-destroy callbacks. Callback exceptions are reported to the console and do not abort other listeners. Destruction removes every subscription, observer, control binding, media listener and timer.

After destruction, chainable methods do nothing, `on()`/`connectControls()` return empty cleanup functions, and `state.destroyed` remains true. `element` is null. Do not retain destroyed instances unnecessarily.

## Ownership

One controller owns one active wrapper, its generated clones, scheduled frame, resize debounce timer, `ResizeObserver`, and `IntersectionObserver`. Do not create multiple controllers for the same wrapper. Use [`destroy()`](/ticker/docs/reference/api/destroy/) before transferring ownership.

## Related

- [`ticker()`](/ticker/docs/reference/api/ticker/)
- [`update()`](/ticker/docs/reference/api/update/)
- [`refresh()`](/ticker/docs/reference/api/refresh/)
- [`destroy()`](/ticker/docs/reference/api/destroy/)
