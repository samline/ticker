# `destroy()`

Release everything owned by one controller.

```ts
instance.destroy(): void
```

For enhanced ordinary content, destruction:

- Cancels scheduled animation work and resize debounce timers.
- Disconnects resize and intersection observers.
- Removes generated clones.
- Replaces the generated wrapper with the original source element.
- Sets `instance.element` to `null`.

For adopted declarative markup, the existing wrapper remains in the DOM while its runtime state and clones are removed. Repeated calls are safe no-ops.
