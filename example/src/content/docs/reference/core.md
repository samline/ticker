---
title: Core utilities
description: Public defaults, state factories, validators, and advanced runtime-state contracts.
template: doc
---

`@samline/ticker/core` exposes the same defaults, state factories, validators, and core types re-exported by the package root. Most applications only need `ticker()`, but adapters and tests can share the runtime's exact normalization rules.

## Defaults

```ts
import { DEFAULT_DURATION, DEFAULT_OPTIONS, DEFAULT_TICKER_DIRECTION } from '@samline/ticker/core'
```

| Export                     | Value                                                                                | Purpose                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `DEFAULT_DURATION`         | `20`                                                                                 | Fallback animation-cycle duration in seconds.                                           |
| `DEFAULT_TICKER_DIRECTION` | `'left'`                                                                             | Canonical direction fallback.                                                           |
| `DEFAULT_OPTIONS`          | `{ duration: 20, direction: 'left', pauseOnHover: false, interactiveClones: false }` | Behavioral defaults. `class` is omitted; normalized controller options add `class: ''`. |

Treat imported defaults as read-only data. Mutating them does not configure existing instances and is unsupported.

## Validators

```ts
validateDuration(value: unknown): number
validateDirection(value: unknown): 'left' | 'right'
validatePauseOnHover(value: unknown): boolean
validateInteractiveClones(value: unknown): boolean
```

- `validateDuration` uses a number directly or `parseFloat(String(value))`; only finite values greater than zero survive, otherwise it returns `20`.
- `validateDirection` returns `'right'` only for that exact string; everything else becomes `'left'`.
- Both boolean validators return `true` only for literal boolean `true`. Declarative markup converts exact `"true"` attribute strings before validation.

## State factories

```ts
createEmptyTickerState(): Omit<TickerState, 'wrapper' | 'track' | 'content'>
createEmptyManagerState(): TickerManagerState
```

`createEmptyTickerState()` returns fresh clone, frame, timer, and observer bookkeeping. `createEmptyManagerState()` returns `{ isMounted: false, mutationObserver: null }`. Neither function creates DOM nodes or attaches observers.

## Runtime state

`TickerState` describes one initialized wrapper, track, original content node, generated clones, scheduled frame, resize debounce timer, and observers. `TickerManagerState` describes the declarative manager's mounted flag and mutation observer.

These shapes are exported for advanced integrations and runtime testing. The runtime does not accept externally constructed state; use the [controller API](/ticker/reference/api/) and [declarative manager](/ticker/guides/lifecycle/#declarative-manager) in application code.

## Related

- [Configuration](/ticker/reference/configuration/)
- [TypeScript reference](/ticker/reference/typescript/)
- [Entrypoints](/ticker/reference/entrypoints/)
