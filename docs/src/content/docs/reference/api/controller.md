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
  scrollTo(position: number, options?: TickerNavigationOptions): TickerInstance
  scrollBy(distance: number, options?: TickerNavigationOptions): TickerInstance
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
  pauseOnHover: false, pauseOnFocus: true, navigation: false, resumeAfterDrag: false,
  responsive: [], interactiveClones: false, class: '',
}
```

Mutating a returned snapshot does not affect the controller. Use [`update()`](/ticker/docs/reference/api/update/).

## Playback and state

`play()` and `pause()` are chainable, idempotent and preserve visual position. Explicit pause persists through refresh, resize, hover, focus, visibility, intersection and responsive rules. `play()` records intent but still respects automatic causes.

`TickerSnapshot` is a frozen snapshot containing `ready`, `destroyed`, `requested`, `playing`, `reasons`, `position`, `distance`, `duration` and resolved physical `direction`. Position and distance are CSS pixels; duration is measured seconds per cycle. Read `state` whenever the current position is needed. `TickerPauseReason` is `manual`, `hover`, `focus`, `hidden`, `offscreen`, `reduced-motion` or transient `navigation`. The reasons array is also frozen.

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

`scrollTo(position)` seeks to a logical CSS-pixel distance; `scrollBy(distance)` adds to the current logical position. Both wrap around at the sequence boundaries, including the gap between repetitions. By default they act instantly and leave playback explicitly paused. Negative values wrap backward. Nonfinite values are ignored.

Buttons and rail arrow keys default to revealing one item per step. `itemsPerStep` accepts a positive safe integer (default `1`; invalid values fall back to `1`). Items are the measurable direct element children of the original sequence; decorative children with `aria-hidden="true"` are skipped. A partially hidden incoming item counts as the first item: movement reveals its trailing edge. Larger counts stop before that first incoming item would be clipped at the opposite edge, so fewer items may be revealed. Gaps, variable sizes, cyclic copies, vertical layouts and logical RTL order are measured at each command. The readable area excludes wrapper borders and honors CSS `scroll-padding` on the active axis; reserve space there for edge fades or overlays. An oversized item cannot fit: the step reveals its trailing edge without advancing additional items. A positive CSS-pixel `step` overrides `itemsPerStep` for existing fixed-distance integrations. Dragging, range input and `scrollTo`/`scrollBy` remain pixel-based.

```ts
const news = ticker('#news', { autoplay: false, navigation: true })
const disconnect = news?.connectControls({
  previous: document.querySelector<HTMLButtonElement>('#previous')!,
  next: document.querySelector<HTMLButtonElement>('#next')!,
  rail: document.querySelector<HTMLInputElement>('#position')!,
  itemsPerStep: 2,
})
```

`TickerControls` accepts optional native previous/next buttons and an `input type="range"` rail supplied by the application. Give buttons accessible names (Previous items / Next items), a labelled range and visible focus styles. Ticker owns only their bindings; it does not create UI or replace application styling. `connectControls()` returns an idempotent disconnect function. Destruction disconnects automatically and restores rail attributes. Use one set per ticker.

The range spans one repeating sequence, not an infinite scrollbar. Its end wraps to zero; keyboard End selects just before the seam. Home selects zero. Arrow keys follow logical writing order/axis; other inputs in content retain native behavior. The connected rail samples the position every 100ms while playing without public frame events. It updates immediately after seeking and measuring.

With `navigation: true`, Pointer Events support touch and mouse dragging after a six-pixel axis threshold. Perpendicular scrolling remains native (`pan-y` for horizontal and `pan-x` for vertical); input, select, textarea and editable content do not initiate a drag. A tap retains its link action; an actual drag suppresses the resulting click. No inertia or forced smooth animation is applied. Reduced motion disables autoplay but still permits instantaneous navigation with repeated inert copies. Calling `scrollTo`/`scrollBy` also enables those copies when needed under reduced motion.

Set `resumeAfterDrag: true` (or `data-resume-after-drag="true"`) to restore playback intent when a drag ends, including pointer cancellation or capture loss. It defaults to false. The ticker resumes only if playback was requested when dragging began and no explicit playback or navigation command intervened. A ticker paused beforehand stays paused. Hover, focus, reduced motion, visibility and viewport pauses still apply: with hover pause enabled, movement resumes when the pointer leaves. Opt-in mouse gestures preserve the existing focus rather than focusing the dragged region or link; keyboard focus already inside the ticker still pauses playback. Buttons, the rail and `scrollTo`/`scrollBy` continue to pause explicitly.

```ts
const feed = ticker('#feed', {
  navigation: true,
  resumeAfterDrag: true,
  pauseOnHover: true,
})
```

Try both modes in the [interactive drag example](/ticker/examples/#drag-playback). The Resume after drag control changes the option without starting playback.

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

## Smooth steps and playback intent

`scrollTo`, `scrollBy` and `connectControls` accept `TickerNavigationOptions`:

```ts
const disconnect = news?.connectControls({
  previous: document.querySelector<HTMLButtonElement>('#previous')!,
  next: document.querySelector<HTMLButtonElement>('#next')!,
  behavior: 'smooth',
  duration: 300,
  preservePlayback: true,
})
```

`behavior` defaults to `smooth` for item arrows and rail arrow keys on either axis,
and to `instant` for pixel seeks or positive pixel `step` controls. An explicit
`behavior` overrides either default. `duration` defaults to 300 milliseconds, and
`preservePlayback` defaults to false. Smooth steps use a cubic ease-out and pause
continuous CSS playback while seeking. `reasons` contains `navigation` during the
step. `requested` retains the existing intent when preservation is enabled,
including an explicit manual pause. Focus, hover and all automatic pause causes
still govern continuous playback after completion. Range input seeks remain
instant to follow the pointer. Home/End use the connected navigation behavior.

Repeated arrow clicks and rail arrow keys in the same direction add each step to
the pending destination, including across sequence boundaries. Item geometry is
projected at that destination, so `itemsPerStep` and its first-item retention cap
apply to each command. Reversing direction discards pending steps and calculates
the opposite step from the currently visible position. Smooth movement always
starts at the visible position without jumping; `duration` runs from the latest
command. Positive pixel `step` controls also accumulate when explicitly smoothed.
There is one active transition and one completion event for its final destination,
not a queue of delayed animations or events. API pixel seeks, range input and
Home/End replace the destination rather than accumulating item steps.

Drag starts, explicit
play/pause, refresh/resize, option updates, reduced-motion changes and destroy
cancel an unfinished step. No canceled completion can restore obsolete playback
intent. Reduced motion always seeks instantly. Invalid/nonpositive durations
also seek instantly. Loop arithmetic keeps the requested direction across a
sequence boundary.

Only `navigate` event snapshots include `navigationSource`: `api`, `control`,
`rail`, `keyboard` or `drag`. Smooth commands emit it on completion; pointer drag
emits during movement. Do not call `play()` on every `navigate` event: that can
interrupt a gesture or override a manual pause. Use `preservePlayback` for arrows
and `resumeAfterDrag` for the separate drag policy.
