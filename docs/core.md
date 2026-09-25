# Core Reference

`@samline/ticker/core` exposes the option types, normalized defaults, runtime state shapes, state factories, and value validators used by the ticker runtime. The package root re-exports the same symbols.

Most applications only need `ticker()`, `TickerOptions`, and `TickerInstance`. Use the core surface for adapters, diagnostics, or code that needs exactly the same normalization rules as the runtime.

---

## Defaults

```ts
import { DEFAULT_DURATION, DEFAULT_OPTIONS, DEFAULT_TICKER_DIRECTION } from '@samline/ticker/core'
```

| Export                     | Value                                                                                | Purpose                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `DEFAULT_DURATION`         | `20`                                                                                 | Fallback duration in seconds.                                                                                                         |
| `DEFAULT_TICKER_DIRECTION` | `'left'`                                                                             | Canonical fallback direction.                                                                                                         |
| `DEFAULT_OPTIONS`          | `{ duration: 20, direction: 'left', pauseOnHover: false, interactiveClones: false }` | Public defaults for the behavioral options. It intentionally does not include `class`; normalized controller options add `class: ''`. |

Treat `DEFAULT_OPTIONS` as read-only application data. Mutating an imported object is not a supported way to configure ticker instances.

---

## Validators

### `validateDuration(value)`

```ts
validateDuration(duration: unknown): number
```

Numbers are used directly; every other value is parsed with `parseFloat(String(value))`. A finite result greater than zero is returned. Invalid, zero, negative, `NaN`, and infinite values return `20`.

### `validateDirection(value)`

```ts
validateDirection(direction: unknown): 'left' | 'right'
```

Only the exact string `'right'` returns `'right'`; every other value returns `'left'`.

### Boolean validators

```ts
validatePauseOnHover(value: unknown): boolean
validateInteractiveClones(value: unknown): boolean
```

Both return `true` only for the literal boolean `true`. Strings such as `'true'` return `false`; declarative markup converts its data-attribute strings before calling these validators.

---

## State factories

### `createEmptyTickerState()`

```ts
createEmptyTickerState(): Omit<TickerState, 'wrapper' | 'track' | 'content'>
```

Returns fresh mutable bookkeeping for one ticker:

```ts
{
  clones: [],
  frameId: 0,
  resizeTimeout: null,
  resizeObserver: null,
  intersectionObserver: null,
}
```

### `createEmptyManagerState()`

```ts
createEmptyManagerState(): TickerManagerState
```

Returns `{ isMounted: false, mutationObserver: null }`.

Each call returns a new object. These factories do not create DOM nodes or attach observers.

---

## Runtime state types

`TickerState` describes the DOM nodes, generated clones, scheduled frame, debounce timer, and observers for one initialized ticker. `TickerManagerState` describes whether the declarative page manager is mounted and holds its mutation observer.

They are exported for advanced integrations and testing, but the runtime does not accept externally constructed state. Prefer the controller and page-manager APIs for normal application code.

## Related

- [Options](options.md)
- [TypeScript reference](typescript.md)
- [`ticker()`](api/ticker.md)
