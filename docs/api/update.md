# `update()`

Merge options into the controller's current normalized options and schedule a rebuild.

```ts
update(options?: TickerOptions): TickerInstance
```

```ts
instance.update({ duration: 32, direction: 'right' })
```

The method is chainable. It updates wrapper classes and data attributes before remeasurement. Calling it after destruction is a chainable no-op.

Use [`refresh()`](refresh.md) when content or layout changed but options did not.
