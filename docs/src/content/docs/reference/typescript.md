---
locale: en
sidebar:
  group: reference
  order: 7
title: 'TypeScript reference'
description: 'Every exported public type, controller shape, runtime state, and browser API contract.'
---

## Root type exports

```ts
import type {
  NewTickerInput,
  NormalizedTickerOptions,
  TickerApi,
  TickerAvailable,
  TickerDirection,
  TickerInstance,
  TickerManagerState,
  TickerOptions,
  TickerState,
  TickerTarget,
} from '@samline/ticker'
```

## `TickerDirection`

```ts
type TickerDirection = 'left' | 'right' | 'up' | 'down' | 'auto'
```

## `TickerTarget`

```ts
type TickerTarget = string | HTMLElement
```

Strings are CSS selectors resolved once with `document.querySelector`.

## `TickerOptions`

```ts
interface TickerOptions {
  duration?: number
  speed?: number
  autoplay?: boolean
  pauseOnFocus?: boolean
  navigation?: boolean
  resumeAfterDrag?: boolean
  responsive?: readonly TickerResponsiveRule[]
  direction?: TickerDirection
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}
```

See [Configuration](/ticker/docs/reference/configuration/) for normalization and effects.

## `NormalizedTickerOptions`

```ts
type NormalizedTickerOptions = Required<TickerOptions>
```

Every controller options snapshot includes all normalized fields, including `class: ''` when omitted.

## `TickerInstance`

```ts
interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  readonly state: Readonly<TickerSnapshot>
  play: () => TickerInstance
  pause: () => TickerInstance
  scrollTo: (position: number) => TickerInstance
  scrollBy: (distance: number) => TickerInstance
  connectControls: (controls: TickerControls) => () => void
  on: <K extends keyof TickerEventMap>(
    event: K,
    listener: (state: TickerEventMap[K]) => void
  ) => () => void
  update: (options?: TickerOptions) => TickerInstance
  refresh: () => TickerInstance
  destroy: () => void
}
```

`element` becomes `null` after destruction; `source` remains stable; `options` returns a fresh snapshot. See [controller reference](/ticker/docs/reference/api/controller/).

## State, events, controls and viewport rules

`TickerSnapshot` describes frozen ready/destroyed/requested/playing state, pause `reasons`, logical `position`, measured `distance`, effective `duration` and resolved physical `direction`. `TickerPauseReason` is the union of manual, hover, focus, hidden, offscreen and reduced-motion causes. `TickerEventMap` maps ready/playback/update/measure/navigate/destroy to that snapshot. `TickerControls` accepts optional native previous/next buttons, a range `rail` and a CSS-pixel `step`. `TickerResponsiveRule` supplies a viewport `query` and partial `options` excluding class and recursive responsive rules. These types are exported from root, core, vanilla and browser. See the [controller contract](/ticker/docs/reference/api/controller/) for ordering, cancellation, navigation and cleanup, and [configuration](/ticker/docs/reference/configuration/#responsive) for rule precedence.

## Browser registry types

```ts
interface NewTickerInput {
  id: string
  options?: TickerOptions
}

interface TickerAvailable {
  [id: string]: HTMLElement
}

interface TickerApi {
  ticker: typeof ticker
  newTicker: (input: NewTickerInput) => TickerInstance | null
  getTicker: (id: string) => HTMLElement | null
  getTickers: () => Readonly<Record<string, HTMLElement>>
  destroyTicker: (target: string | HTMLElement) => void
  destroyTickers: () => void
  available: TickerAvailable
}
```

These are exported from both the root and `@samline/ticker/browser`. `TickerApi` describes `browser`, `Ticker`, the browser subpath default export, and `window.Ticker`.

## Runtime state

```ts
interface TickerState {
  wrapper: HTMLElement
  track: HTMLElement
  content: HTMLElement
  clones: HTMLElement[]
  frameId: number
  resizeTimeout: number | null
  resizeObserver: ResizeObserver | null
  intersectionObserver: IntersectionObserver | null
}

interface TickerManagerState {
  isMounted: boolean
  mutationObserver: MutationObserver | null
}
```

These types are exported for advanced adapters and tests. They describe runtime-owned bookkeeping and are not inputs to public lifecycle functions.

## Type exports by subpath

| Subpath                   | Types                                                                                          |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `@samline/ticker`         | Every type on this page.                                                                       |
| `@samline/ticker/vanilla` | Controller, options, direction, state, event, control and responsive types.                    |
| `@samline/ticker/core`    | Core option/controller/target/direction and runtime-state types.                               |
| `@samline/ticker/browser` | Registry types plus controller, option, direction, state, event, control and responsive types. |

## Narrow a missing target

```ts
const instance = ticker('#partners')

if (!instance) throw new Error('Expected #partners to exist')

instance.update({ duration: 24 })
```
