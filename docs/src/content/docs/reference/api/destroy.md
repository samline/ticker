---
locale: en
sidebar:
  group: api
  order: 5
title: 'destroy()'
description: 'Detailed Ticker API contract: destroy()'
---

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
- Marks retained wrapper markup not ready and pauses playback.
- Removes shared document-visibility and reduced-motion listeners when the last tracked ticker is destroyed.
- Removes generated clones.
- Removes the wrapper from the shared runtime registry.
- Replaces a controller-generated wrapper with the original source element.
- Preserves an adopted `[data-ticker]` / `.ticker-wrapper` in the DOM.
- Sets `instance.element` to `null`.

The stable `instance.source` reference and last normalized `instance.options` snapshot remain readable. `update()` and `refresh()` become safe chainable no-ops.

## Example

```ts
const news = ticker('#news')

window.addEventListener('pagehide', event => {
  if (!event.persisted) news?.destroy()
})
```

A persisted `pagehide` means the browser is keeping the page for back/forward restoration. Preserve its controller and controls; destroy only on a non-persisted departure or when your application removes the integration.

## Registry cleanup

If the controller came from `newTicker()`, prefer `destroyTicker(id)`. Calling the controller's `destroy()` directly tears down the runtime but does not remove the registry's bookkeeping entry; the registry helper performs both operations.

## Related

- [`ticker()`](/ticker/docs/reference/api/ticker/)
- [`unmount()`](/ticker/docs/reference/api/unmount/)
- [Browser registry](/ticker/docs/reference/api/browser-registry/)
