---
title: Lifecycle and updates
description: Understand controller ownership, normalized options, refresh behavior, declarative mounting, and cleanup.
template: doc
---

## Controller lifecycle

```ts
const instance = ticker('#partners', { duration: 18 })

instance?.element
instance?.source
instance?.options

instance?.update({ duration: 28 })
instance?.refresh()
instance?.destroy()
```

The controller is element-scoped:

| Operation   | Wrapper                | Observers    | Original source                                        |
| ----------- | ---------------------- | ------------ | ------------------------------------------------------ |
| `ticker()`  | created or adopted     | connected    | moved inside generated content when wrapping is needed |
| `update()`  | preserved              | preserved    | unchanged                                              |
| `refresh()` | preserved              | preserved    | remeasured                                             |
| `destroy()` | removed when generated | disconnected | restored at the wrapper position                       |

`destroy()` is idempotent. After destruction, `element` is `null`; `update()` and `refresh()` become safe no-ops that return the same controller.

## Update versus refresh

Use `update()` when options change:

```ts
instance?.update({
  direction: 'right',
  duration: 40,
  class: 'partners partners--muted',
})
```

Use `refresh()` when your application changes content or layout without changing options:

```ts
instance?.source.append(newPartnerLogo())
instance?.refresh()
```

ResizeObserver normally handles geometry changes. Explicit refresh is useful immediately after batched DOM work, visibility changes, or custom font transitions.

## Declarative manager

`mount()` scans the document for `[data-ticker]` and `.ticker-wrapper`, observes inserted/removed markup, and listens for relevant page changes. `refresh()` remeasures all managed instances. `unmount()` removes manager listeners and destroys all tracked ticker state.

```ts
import { mount, refresh, unmount } from '@samline/ticker/vanilla'

mount()
refresh()
unmount()
```

The manager is browser-safe to import during server rendering: calls become no-ops when `window` or `document` is unavailable.

The page manager and controller factory share runtime tracking. Do not give both lifecycles ownership of the same wrapper. `unmount()` removes clones and observers but does not call a controller's restoration closure, so retain and explicitly `destroy()` application-created controllers when their generated wrapper must be replaced by the original source.
