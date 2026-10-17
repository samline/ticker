---
locale: en
sidebar:
  group: reference
  order: 2
title: 'Configuration'
description: 'Every TickerOptions field, default, normalization rule, data attribute, and runtime effect.'
---

```ts
interface TickerOptions {
  duration?: number
  speed?: number
  direction?: 'left' | 'right' | 'up' | 'down' | 'auto'
  autoplay?: boolean
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  navigation?: boolean
  responsive?: readonly TickerResponsiveRule[]
  interactiveClones?: boolean
  class?: string
}
```

## Options table

| Option              | Default  | Normalization and behavior                                                                                     |
| ------------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `duration`          | `20`     | Positive finite seconds per cycle; invalid values fall back to 20.                                             |
| `speed`             | `0`      | Positive finite CSS pixels per second overrides duration. Invalid, zero or negative values disable speed mode. |
| `direction`         | `'left'` | Exact `left`, `right`, `up`, `down`, `auto`; invalid values become `left`.                                     |
| `autoplay`          | `true`   | Only `false` starts paused. `play()` and `pause()` change intent independently of automatic pause causes.      |
| `pauseOnHover`      | `false`  | Only `true` enables pointer hover pause.                                                                       |
| `pauseOnFocus`      | `true`   | Only `false` disables focus pause. Focus moving between descendants never resumes playback.                    |
| `navigation`        | `false`  | Only `true` enables pointer dragging and manual navigation in reduced motion.                                  |
| `responsive`        | `[]`     | Ordered viewport media-query rules; see below.                                                                 |
| `interactiveClones` | `false`  | Only `true` enables interactive repeated copies.                                                               |
| `class`             | `''`     | Whitespace-separated wrapper classes; excludes reserved `ticker-wrapper`.                                      |

## `duration`

Duration is seconds per one-content-and-gap cycle. Larger values move more slowly.

```ts
ticker('#headlines', { duration: 30 })
```

Zero, negative, `NaN`, and infinite values fall back to `20`. Declarative strings are parsed with `parseFloat`.

## `direction`

```ts
ticker('#headlines', { direction: 'right' })
```

`left` and `right` remain physical directions regardless of `dir`. `up` and `down` select the vertical axis. `auto` moves left in LTR and right in RTL, using the wrapper's inherited writing direction at measurement time. Call `refresh()` after changing an ancestor's `dir` without resizing.

## Vertical and writing direction

Give vertical wrappers a definite visible height. The runtime measures the full original height plus computed `row-gap`; different item heights and fractional pixels are supported. Horizontal motion uses width plus `column-gap`. Match gaps inside the original sequence and between its copies.

```css
.news-column .ticker-wrapper {
  height: 12rem;
}
.news-column .ticker-track,
.news-column .ticker-content {
  gap: 0.75rem;
}
```

```ts
ticker('#vertical-news', { direction: 'up', speed: 30 })
```

Content keeps its writing direction, Unicode characters and bidi ordering. The repeating groups are laid out on a physical axis while the contents of RTL groups retain RTL layout. Do not reverse strings or Arabic/Hebrew characters. Explicit `left`/`right` retain their existing meanings. `scrollBy(positive)` and Next follow reading order: leftward travel for LTR, rightward for RTL; vertical Next travels upward. Previous reverses that logical movement. The position rail uses the same logical distance, with left/right keyboard arrows following writing direction and up/down following the vertical axis. See [navigation](/ticker/docs/reference/api/controller/#manual-navigation).

## `speed`

A positive finite speed in CSS pixels per second takes precedence over duration. The runtime derives seconds per cycle as `(content extent + axis gap) / speed`. Resize, fonts, loaded images and `refresh()` remeasure this exact fractional distance. Changing speed or duration preserves pixel position; CSS linear animation uses elapsed time rather than frame count.

```ts
const news = ticker('#news', { speed: 40, duration: 20 })
news?.update({ speed: 0 }) // Return to 20 seconds per cycle.
```

## `autoplay`, `pauseOnFocus` and playback

Playback starts requested by default. Use `autoplay: false` to start paused and `pause()` / `play()` for persistent intent. Focus pause is enabled by default in 2.1; disabling it requires `pauseOnFocus: false`. Hover, focus, hidden document, viewport intersection and reduced motion compose; clearing one cause never clears another. `play()` respects all environmental causes. See [controller state](/ticker/docs/reference/api/controller/#playback-and-state).

## `responsive`

`TickerResponsiveRule` contains `query: string` and `options: Omit<TickerOptions, 'responsive' | 'class'>`. Rules use **viewport** media queries via `matchMedia`, rather than container width. All matching rules merge in array order after base options. The last matching field wins. `update()` changes the base, then rules are reapplied; leaving a rule restores the current base. Replacing `responsive` replaces the complete rule list and removes old listeners. `options` reports the base snapshot; `state` reports actual playback and measured duration.

```ts
const news = ticker('#news', {
  speed: 45,
  responsive: [
    { query: '(width < 48rem)', options: { speed: 24 } },
    { query: '(width < 30rem)', options: { autoplay: false } },
  ],
})
news?.update({ speed: 50 }) // Matching rules still override this base.
```

A rule's `autoplay` changes requested playback until an explicit `play()` or `pause()` takes ownership. An explicit pause survives every rule transition. Explicit `update({ autoplay })` releases that manual override. Reduced motion always prevents automatic playback. Changes on the same axis preserve pixel position modulo the new cycle; changing axis resets to its beginning. Original nodes remain intact; clones are rebuilt only for changed geometry/configuration or explicit refresh. Destroy removes all media listeners.

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

Read [Accessibility and motion](/ticker/docs/guides/accessibility/) before enabling it.

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

| Attribute                 | Accepted value                                                          | Default |
| ------------------------- | ----------------------------------------------------------------------- | ------- |
| `data-duration`           | Positive numeric text, parsed with `parseFloat`.                        | `20`    |
| `data-speed`              | Positive finite numeric text, parsed with `Number`.                     | `0`     |
| `data-direction`          | `left`, `right`, `up`, `down`, `auto`.                                  | `left`  |
| `data-autoplay`           | Exact string `false` starts paused.                                     | `true`  |
| `data-pause-on-focus`     | Exact string `false` disables focus pause.                              | `true`  |
| `data-pause-on-hover`     | Exact string `true`.                                                    | `false` |
| `data-navigation`         | Exact string `true`.                                                    | `false` |
| `data-interactive-clones` | Exact string `true`.                                                    | `false` |
| `data-responsive`         | JSON array of `{ query, options }` rules; malformed input becomes `[]`. | `[]`    |

```html
<div
  class="ticker-wrapper"
  data-ticker
  data-autoplay="false"
  data-navigation="true"
  data-speed="40"
  data-direction="auto"
  data-responsive='[{"query":"(width < 48rem)","options":{"speed":24}}]'
>
  <div class="ticker-track"><div class="ticker-content">Latest news</div></div>
</div>
```

Use `mount()` for declarative discovery or adopt the wrapper with `ticker(wrapper)` to obtain controls/events. Browser/CDN controllers provide the same API. Do not create competing controllers for a wrapper.

## Runtime outputs

The runtime owns `data-ready` (measured), `data-active` (viewport), `data-playing` (effective playback including focus/hover/manual pause), `data-axis`, `data-motion-direction`, `data-writing-direction`, `--ticker-duration`, `--ticker-distance` and `--ticker-position`. Applications query `state` and subscribe to events instead of editing these outputs. The CSS variables use seconds and CSS pixels. See [styling](/ticker/docs/reference/styling/).

## Defaults export

`DEFAULT_OPTIONS` retains the original four fields (`duration`, `direction`, `pauseOnHover`, `interactiveClones`) for compatibility. Controller normalization also supplies speed 0, autoplay true, pauseOnFocus true, navigation false, responsive [] and class ''. See [Core utilities](/ticker/docs/reference/core/).
