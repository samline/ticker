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

## Options table

| Option              | Type                | Default  | Normalization                                                                | Runtime effect                                                                  |
| ------------------- | ------------------- | -------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `duration`          | `number`            | `20`     | Finite and greater than zero; otherwise `20`. Markup values are parsed.      | Writes `data-duration` and `--ticker-duration`.                                 |
| `direction`         | `'left' \| 'right'` | `'left'` | Only exact `'right'` stays right.                                            | Writes `data-direction` and selects keyframes.                                  |
| `pauseOnHover`      | `boolean`           | `false`  | Only literal `true` enables it.                                              | Writes `data-pause-on-hover` and toggles `.ticker-pause-on-hover`.              |
| `interactiveClones` | `boolean`           | `false`  | Only literal `true` enables it.                                              | Writes `data-interactive-clones` and controls clone semantics/pointer behavior. |
| `class`             | `string`            | `''`     | Split on whitespace; empty and reserved `ticker-wrapper` tokens are removed. | Adds controller-owned wrapper classes.                                          |

## `duration`

Duration is seconds per one-content-width cycle. Larger values move more slowly.

```ts
ticker('#headlines', { duration: 30 })
```

Zero, negative, `NaN`, and infinite values fall back to `20`. Declarative strings are parsed with `parseFloat`.

## `direction`

```ts
ticker('#headlines', { direction: 'right' })
```

Left travels toward negative `--ticker-distance`. Right begins at negative distance and travels to the initial position.

## `pauseOnHover`

```ts
ticker('#offers', { pauseOnHover: true })
```

Pauses the track while the wrapper is hovered. This is a pointer convenience; provide explicit page controls when essential content must be stoppable.

## `interactiveClones`

The default `false` hides clones from assistive technology, removes keyboard interaction, and disables pointer events. `true` skips those protections:

```ts
ticker('#products', { interactiveClones: true })
```

Read [Accessibility and motion](/ticker/guides/accessibility/) before enabling it.

## `class`

```ts
const partners = ticker('#partners', { class: 'partners theme-light' })
partners?.update({ class: 'partners theme-dark' })
```

Updates replace only prior option-owned tokens. Independently added application classes remain. `ticker-wrapper` is runtime-owned and filtered from this option.

## Partial updates and snapshots

`update()` shallow-merges fields with current normalized options, so omitted values stay unchanged. `instance.options` returns a new read-only snapshot; mutating it cannot update the ticker.

```ts
const partners = ticker('#partners', { duration: 18, pauseOnHover: true })
partners?.update({ direction: 'right' })
```

## Declarative attributes

| Attribute                 | Accepted value                                 | Fallback |
| ------------------------- | ---------------------------------------------- | -------- |
| `data-duration`           | Positive numeric text.                         | `20`     |
| `data-direction`          | Exact `right`; everything else becomes `left`. | `left`   |
| `data-pause-on-hover`     | Exact string `true`.                           | `false`  |
| `data-interactive-clones` | Exact string `true`.                           | `false`  |

The runtime owns `data-ready`, `data-active`, `--ticker-duration`, and `--ticker-distance`. See the [styling contract](/ticker/reference/styling/).

## Defaults export

`DEFAULT_OPTIONS` contains the four behavioral fields but omits `class`; controller normalization adds `class: ''`. See [Core utilities](/ticker/reference/core/).
