---
title: TypeScript reference
description: Every exported public type, controller shape, runtime state, and browser API contract.
template: doc
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
type TickerDirection = 'left' | 'right'
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
  direction?: TickerDirection
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}
```

See [Configuration](/ticker/reference/configuration/) for normalization and effects.

## `NormalizedTickerOptions`

```ts
type NormalizedTickerOptions = Required<TickerOptions>
```

Every controller snapshot includes all five fields, including `class: ''` when omitted.

## `TickerInstance`

```ts
interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  update: (options?: TickerOptions) => TickerInstance
  refresh: () => TickerInstance
  destroy: () => void
}
```

`element` becomes `null` after destruction; `source` remains stable; `options` returns a fresh snapshot. See [API](/ticker/reference/api/#tickerinstance).

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

| Subpath                   | Types                                                                         |
| ------------------------- | ----------------------------------------------------------------------------- |
| `@samline/ticker`         | Every type on this page.                                                      |
| `@samline/ticker/vanilla` | `TickerInstance`, `TickerOptions`, `TickerTarget`, `NormalizedTickerOptions`. |
| `@samline/ticker/core`    | Core option/controller/target/direction and runtime-state types.              |
| `@samline/ticker/browser` | Registry types plus `TickerInstance`, `TickerOptions`, and `TickerTarget`.    |

## Narrow a missing target

```ts
const instance = ticker('#partners')

if (!instance) throw new Error('Expected #partners to exist')

instance.update({ duration: 24 })
```
