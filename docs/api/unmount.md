# `unmount()`

Stops the shared page manager and destroys all tracked ticker runtime state.

## Signature

```ts
import { unmount } from '@samline/ticker/vanilla'

unmount(): void
```

## Behavior

`unmount()`:

- marks the manager unmounted;
- removes pending document and window listeners;
- disconnects the shared `MutationObserver`;
- unregisters the reduced-motion listener;
- destroys every tracked ticker, disconnecting instance observers and removing clones.

Declarative wrapper markup stays in the DOM. Controller-created wrappers are not restored by the page-level teardown because restoration belongs to their controller's `destroy()` method; retain and destroy application-created controllers explicitly.

Calls are safe no-ops in non-DOM environments and when no manager work is active.

## Related

- [`mount()`](mount.md)
- [`destroy()`](destroy.md)
- [Lifecycle guide](../getting-started.md#controller-lifecycle)
