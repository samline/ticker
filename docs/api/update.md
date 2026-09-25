# `update(options?)`

Merges options into the controller's current normalized configuration, updates wrapper metadata, and schedules a rebuild.

## Signature

```ts
update(options?: TickerOptions): TickerInstance
```

## Parameters

| Name      | Type            | Required | Description                                                  |
| --------- | --------------- | -------- | ------------------------------------------------------------ |
| `options` | `TickerOptions` | no       | Fields to shallow-merge into the current normalized options. |

## Returns

The same `TickerInstance`, so calls can be chained.

## Behavior

```ts
instance.update({ duration: 32, direction: 'right' }).refresh()
```

- Omitted fields keep their current values.
- Supplied fields are normalized again.
- Previous controller-owned `class` tokens are removed and the new tokens are added.
- Unrelated classes added by application code remain.
- `data-duration`, `data-direction`, `data-pause-on-hover`, and `data-interactive-clones` are synchronized.
- Rebuilding is scheduled through `requestAnimationFrame`; it is not a synchronous geometry read.

Calling `update()` with no argument still normalizes the current snapshot and schedules a refresh. After destruction it is a chainable no-op.

## Related

- [Options](../options.md)
- [`refresh()`](refresh.md)
- [`TickerInstance`](controller.md)
