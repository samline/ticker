---
title: Configuration
description: Every TickerOptions field, default, normalization rule, data attribute, and runtime effect.
template: doc
---

```ts
interface TickerOptions {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}
```

## Fields

| Option              | Default  | Normalization                                                 | Runtime effect                                                                     |
| ------------------- | -------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `duration`          | `20`     | Finite numbers greater than zero; otherwise `20`.             | Writes `data-duration` and `--ticker-duration`.                                    |
| `direction`         | `'left'` | Only `'right'` remains right; every other value becomes left. | Writes `data-direction` and selects the animation keyframes.                       |
| `pauseOnHover`      | `false`  | Only literal `true` enables it.                               | Writes `data-pause-on-hover` and toggles the track pause class.                    |
| `interactiveClones` | `false`  | Only literal `true` enables it.                               | Writes `data-interactive-clones` and changes clone semantics and pointer behavior. |
| `class`             | `''`     | Trimmed, then split on whitespace.                            | Adds wrapper classes owned by the controller.                                      |

`instance.options` returns a new read-only snapshot. Mutating that snapshot does not change runtime behavior; use `update()`.

## Partial updates

`update()` shallow-merges fields with the current normalized options:

```ts
const partners = ticker('#partners', {
  duration: 18,
  class: 'partners muted',
})

partners?.update({ direction: 'right' })
```

Omitted fields keep their current value. Passing a new `class` removes classes previously owned by the controller and adds the new tokens. It does not remove unrelated application classes.

## Declarative attributes

Complete markup initialized through `mount()` uses these attributes:

| Attribute                 | Accepted values                             |
| ------------------------- | ------------------------------------------- |
| `data-duration`           | Positive numeric text.                      |
| `data-direction`          | `left` or `right`.                          |
| `data-pause-on-hover`     | `true` enables; every other value disables. |
| `data-interactive-clones` | `true` enables; every other value disables. |

The runtime owns `data-ready`, `data-active`, `--ticker-duration`, and `--ticker-distance`.
