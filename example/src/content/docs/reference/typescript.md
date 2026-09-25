---
title: TypeScript reference
description: Exported public types, controller shapes, runtime state, defaults, and browser API contracts.
template: doc
---

## Primary types

```ts
import type {
  NormalizedTickerOptions,
  TickerDirection,
  TickerInstance,
  TickerOptions,
  TickerTarget,
} from '@samline/ticker'
```

```ts
type TickerDirection = 'left' | 'right'
type TickerTarget = string | HTMLElement

interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  update(options?: TickerOptions): TickerInstance
  refresh(): TickerInstance
  destroy(): void
}
```

`NormalizedTickerOptions` is `Required<TickerOptions>` and reflects the validated values returned by a controller.

See [Configuration](/ticker/reference/configuration/) for `TickerOptions` fields and normalization.

## Browser types

```ts
import type { NewTickerInput, TickerApi, TickerAvailable } from '@samline/ticker/browser'
```

`TickerAvailable` maps registration ids to live wrapper elements. `TickerApi` describes the module singleton and `window.Ticker`.

## Core state exports

`@samline/ticker/core` also exports `TickerState`, `TickerManagerState`, `DEFAULT_OPTIONS`, `DEFAULT_DURATION`, `DEFAULT_TICKER_DIRECTION`, state factories, and value validators. These are intended for advanced DOM integrations and runtime testing; most consumers only need `TickerOptions` and `TickerInstance`.

## Narrowing a missing target

```ts
const instance = ticker('#partners')

if (!instance) {
  throw new Error('Expected #partners to exist')
}

instance.update({ duration: 24 })
```
