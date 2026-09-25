---
title: API
description: Every public factory, controller member, page-manager function, and browser-registry operation.
template: doc
---

The public runtime has three layers: element-scoped controllers, a declarative page manager, and an optional id-based browser registry.

## `ticker(target, options?)`

```ts
function ticker(target: string | HTMLElement, options?: TickerOptions): TickerInstance | null
```

### Parameters

| Name      | Type                    | Required | Description                                                                          |
| --------- | ----------------------- | -------- | ------------------------------------------------------------------------------------ |
| `target`  | `string \| HTMLElement` | yes      | CSS selector resolved with `document.querySelector`, or an element to enhance/adopt. |
| `options` | `TickerOptions`         | no       | Partial configuration; see [Configuration](/ticker/reference/configuration/).        |

### Return and binding behavior

Returns `TickerInstance`, or `null` when a selector has no match. A missing selector is side-effect free.

Selector strings are passed directly to `document.querySelector`; invalid CSS selector syntax throws the browser's `DOMException`.

Ordinary content is moved into generated `.ticker-wrapper > .ticker-track > .ticker-content` markup. Existing `[data-ticker]` or `.ticker-wrapper` markup is adopted, its data attributes are read, and explicit options win. Adopted roots need a recognized `[data-ticker-track]` / `.ticker-track` and `[data-ticker-content]` / `.ticker-content` to initialize runtime state.

```ts
const news = ticker('#news', { duration: 24, pauseOnHover: true })

if (!news) throw new Error('Expected #news')
```

Selector calls return `null` during server rendering because `document` is unavailable; importing the module is server-safe.

## `TickerInstance`

```ts
interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  update(options?: TickerOptions): TickerInstance
  refresh(): TickerInstance
  destroy(): void
}
```

### Properties

| Property  | Contract                                                                               |
| --------- | -------------------------------------------------------------------------------------- |
| `element` | Active wrapper, generated or adopted. Becomes `null` after destruction.                |
| `source`  | Stable reference to the original target. Generated wrappers restore it on destruction. |
| `options` | Fresh read-only normalized snapshot. Mutating it does not update runtime behavior.     |

### `update(options?)`

Shallow-merges fields with current normalized options, normalizes them again, updates controller-owned classes and data attributes, schedules a frame rebuild, and returns the same controller.

Omitted fields stay unchanged. A new `class` removes only tokens owned by the previous option; unrelated application classes remain. After destruction, `update()` is a chainable no-op.

### `refresh()`

Schedules measurement and clone regeneration for this controller, then returns it. The rebuild synchronizes config, clears prior clones, measures content width plus computed track gap, creates enough clones to cover the wrapper, and writes `--ticker-distance`. Reduced-motion mode creates no clones.

Multiple calls before the frame runs collapse to the latest scheduled rebuild. After destruction, it is a chainable no-op.

### `destroy()`

Cancels the frame and resize timer, disconnects observers, removes generated clones, removes the wrapper from runtime tracking, and sets `element` to `null`.

- Generated wrappers are replaced by the original source.
- Adopted wrappers stay in the DOM.
- Repeated calls are safe.
- If an instance came from `newTicker()`, use registry `destroyTicker(id)` so public registry bookkeeping is also cleared.

## Declarative manager

Import these from the package root or `@samline/ticker/vanilla`:

```ts
mount(): void
refresh(): void
unmount(): void
```

### `mount()`

When a DOM exists, it scans for `[data-ticker]` / `.ticker-wrapper`, initializes valid roots, observes inserted and removed roots, refreshes after fonts and window load, installs a resize fallback when necessary, and responds to reduced-motion changes. Calls are no-ops without `window` or `document`.

### page-level `refresh()`

Schedules a rebuild for every wrapper in shared runtime state, including declarative and controller-created instances.

### `unmount()`

Removes manager listeners, disconnects the mutation observer, unregisters reduced-motion handling, and destroys all tracked ticker state. Declarative wrappers remain. Retain and explicitly destroy application-created controllers if their generated wrapper must be restored.

## Browser registry

```ts
newTicker(input: { id: string; options?: TickerOptions }): TickerInstance | null
getTicker(id: string): HTMLElement | null
getTickers(): Readonly<Record<string, HTMLElement>>
destroyTicker(target: string | HTMLElement): void
destroyTickers(): void
```

### Creation and identity

`newTicker()` resolves with `document.getElementById`. An empty id logs an error and returns `null`; a missing/non-HTML source logs a warning and returns `null`. Reusing an id destroys the old controller, restores its source, and creates a replacement.

The returned value is a controller. `available[id]` and `getTicker(id)` expose its live wrapper.

### Reads and cleanup

- `getTickers()` returns a shallow snapshot; changing it does not mutate the registry.
- `available` is the live id-to-wrapper object and should be treated as read-only consumer state.
- `destroyTicker()` accepts a registered id or wrapper; unknown values are no-ops.
- `destroyTickers()` destroys every registration.

See [Browser reference](/ticker/reference/browser/) for imports and CDN setup, and [Core utilities](/ticker/reference/core/) for every public default, validator, and state factory.
