---
title: 'Lifecycle and updates'
description: 'Understand controller ownership, normalized options, refresh behavior, declarative mounting, and cleanup.'
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

ResizeObserver normally handles geometry changes. Automatic resize and intersection checks reuse clones when measurements and clone settings are unchanged. Explicit refresh always regenerates clones, even after content changes that preserve width, and cannot be superseded by an automatic check. It is useful immediately after batched DOM work, visibility changes, or custom font transitions.

Both standalone controllers and declaratively mounted tickers pause outside the viewport and while the document is hidden. Shared visibility and motion-preference listeners are removed when the last ticker is destroyed.

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

## Library and application responsibilities

Ticker provides the runtime; the application owns the content, controls and integration lifecycle.

| Concern            | Ticker handles                                            | Your application handles                                               |
| ------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| Frameworks         | A DOM-based API with no framework dependencies            | Initialize after mounting and clean up on unmount                      |
| Visual copies      | Hides clones from assistive technology and keyboard focus | Keep the original content meaningful and accessible                    |
| Playback           | Pauses off-screen and in hidden documents                 | Provide a pause control for continuous motion                          |
| Reduced motion     | Respects the system preference                            | Keep static content readable and reachable                             |
| Layout and content | Remeasures on resize                                      | Refresh after application-owned edits, even when width stays unchanged |
| Distribution       | ESM, CommonJS and a browser global                        | Load the stylesheet alongside the selected API                         |
| Licensing          | MIT-licensed runtime                                      | Retain the license when redistributing                                 |
