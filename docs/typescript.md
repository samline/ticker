# TypeScript Reference

This page lists every public type exported by `@samline/ticker` and the subpath that exposes it.

## Root exports

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

---

## `TickerDirection`

```ts
type TickerDirection = 'left' | 'right'
```

## `TickerTarget`

```ts
type TickerTarget = string | HTMLElement
```

A string is treated as a CSS selector and resolved once with `document.querySelector`.

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

See [Options](options.md) for defaults and runtime normalization.

## `NormalizedTickerOptions`

```ts
type NormalizedTickerOptions = Required<TickerOptions>
```

The controller always exposes every field, including `class: ''` when no class was supplied.

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

See the [controller reference](api/controller.md) for ownership and post-destruction behavior.

---

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

These types are exported from both the root and `@samline/ticker/browser`. See [Browser registry](api/browser-registry.md).

---

## Runtime state types

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

They describe internal runtime bookkeeping and are exported from the root and `@samline/ticker/core` for advanced adapters and testing. They are not inputs to `ticker()` or `mount()`.

---

## Export map by subpath

| Subpath                   | Type exports                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| `@samline/ticker`         | Every type on this page.                                                                             |
| `@samline/ticker/vanilla` | `TickerInstance`, `TickerOptions`, `TickerTarget`, `NormalizedTickerOptions`.                        |
| `@samline/ticker/core`    | Core option, controller, target, normalized, direction, and runtime-state types.                     |
| `@samline/ticker/browser` | `NewTickerInput`, `TickerApi`, `TickerAvailable`, `TickerInstance`, `TickerOptions`, `TickerTarget`. |

## Narrowing a missing target

```ts
const instance = ticker('#partners')

if (!instance) {
  throw new Error('Expected #partners to exist')
}

instance.update({ duration: 24 })
```
