# TypeScript Reference

All public types are exported from the package root. Controller-related types are also exported from `@samline/ticker/vanilla`; browser registry types are exported from `@samline/ticker/browser`.

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

## Public controller types

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

- `element` is the active wrapper and becomes `null` after destruction.
- `source` is the original target passed to `ticker()`.
- `options` is a fresh normalized snapshot.

See [Options](options.md) for `TickerOptions` and normalization behavior.

## Browser registry types

```ts
interface NewTickerInput {
  id: string
  options?: TickerOptions
}

interface TickerAvailable {
  [id: string]: HTMLElement
}
```

`TickerApi` describes the complete `browser` / `Ticker` / `window.Ticker` surface documented in [Browser](browser.md).

## Runtime state types

`TickerState` and `TickerManagerState` are exported for advanced integrations, but represent runtime bookkeeping rather than extension points. Prefer `TickerInstance` and the public lifecycle functions for application code.
