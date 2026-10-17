---
locale: en
sidebar:
  group: guides
  order: 5
title: 'Migrate to 2.0'
description: 'Move from framework adapters and the previous enhance API to the element-scoped Vanilla controller.'
---

Version 2.0 makes the package a focused Vanilla JavaScript, CSS, and HTML runtime.

## Replace `enhance()`

```ts
// Before
const wrapper = enhance('#news', { duration: 20 })
destroyTicker(wrapper)

// 2.0
const instance = ticker('#news', { duration: 20 })
instance?.destroy()
```

The controller keeps the original source reference, owns cleanup, supports option updates, and restores source markup on destruction.

## Replace `createTicker()`

The previous factory mixed page-manager methods with element enhancement. Choose one explicit lifecycle:

```ts
// Element-scoped
const instance = ticker('#news')

// Declarative page-level markup
mount()
```

## Browser registry return value

`newTicker()` now returns `TickerInstance | null` instead of an `HTMLElement | null`.

```js
const instance = window.Ticker.newTicker({ id: 'news' })
if (instance) {
  instance.update({ duration: 30 })
  window.Ticker.destroyTicker('news')
}
```

`available`, `getTicker()`, and `getTickers()` continue to expose wrapper elements.

## External integrations

UI-library adapters are no longer shipped. Integrations should call `ticker()` when their owner mounts and `instance.destroy()` when it unmounts. This keeps host-specific lifecycles outside the package while preserving one shared DOM runtime.

## Browser entrypoint

`@samline/ticker/browser` is now a side-effect-free ESM/CJS registry module. Direct HTML usage loads `dist/browser/global.global.js`, which installs `window.Ticker`.

## Upgrade from 2.0 to 2.1

Existing physical left/right directions, duration mode, selectors, entrypoints and registry ownership remain supported. Focus pause is now enabled by default; set `pauseOnFocus: false` only when the integration has an equivalent policy. Replace application CSS pause state with controller `pause()` / `play()` and read `state` or subscribe with `on('playback', listener)`. `data-playing` now includes manual, focus and hover causes. See [configuration](/ticker/docs/reference/configuration/) for vertical motion, speed, responsive rules and RTL, and [controller](/ticker/docs/reference/api/controller/) for manual navigation and event ordering.
