# `destroy()`

Releases everything owned by one controller.

## Signature

```ts
instance.destroy(): void
```

## Returns

`void`. The operation is idempotent; repeated calls are no-ops.

## Behavior

Destruction:

- Cancels a pending animation frame and resize debounce timer.
- Disconnects `ResizeObserver` and `IntersectionObserver`.
- Removes generated clones.
- Removes the wrapper from the shared runtime registry.
- Replaces a controller-generated wrapper with the original source element.
- Preserves an adopted `[data-ticker]` / `.ticker-wrapper` in the DOM.
- Sets `instance.element` to `null`.

The stable `instance.source` reference and last normalized `instance.options` snapshot remain readable. `update()` and `refresh()` become safe chainable no-ops.

## Example

```ts
const news = ticker('#news')

window.addEventListener('pagehide', () => news?.destroy(), { once: true })
```

## Registry cleanup

If the controller came from `newTicker()`, prefer `destroyTicker(id)`. Calling the controller's `destroy()` directly tears down the runtime but does not remove the registry's bookkeeping entry; the registry helper performs both operations.

## Related

- [`ticker()`](ticker.md)
- [`unmount()`](unmount.md)
- [Browser registry](browser-registry.md)
