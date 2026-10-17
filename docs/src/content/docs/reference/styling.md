---
locale: en
sidebar:
  group: reference
  order: 6
title: 'Styling and DOM contract'
description: 'Generated markup, package-owned attributes, classes, CSS variables, animation behavior, and safe customization.'
---

## Load the stylesheet

Import the package CSS once alongside the JavaScript entrypoint. It owns layout, animation, direction, effective playback pause, measurement visibility, and reduced-motion behavior.

```ts
import '@samline/ticker/style.css'
```

Application styles should use stable classes or data attributes. Clone count and inline measurement variables belong to the runtime.

## Generated structure

```html
<div
  class="ticker-wrapper"
  data-ticker
  data-duration="20"
  data-direction="left"
  data-pause-on-hover="false"
  data-interactive-clones="false"
  data-ready="true"
  data-active="true"
  data-playing="true"
>
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>...</div>
    <div class="ticker-content ticker-clone" aria-hidden="true">...</div>
  </div>
</div>
```

## Package-owned CSS

| Name                     | Purpose                                              |
| ------------------------ | ---------------------------------------------------- |
| `--ticker-duration`      | Normalized animation duration.                       |
| `--ticker-distance`      | Exact content extent plus axis track gap.            |
| `.ticker-wrapper`        | Clipping container.                                  |
| `.ticker-track`          | Inline flex row, or full-width vertical column.      |
| `.ticker-track > *`      | Non-shrinking content sequences.                     |
| `.ticker-content`        | Original content sequence.                           |
| `.ticker-clone`          | Non-selectable generated visual copy.                |
| `.ticker-pause-on-hover` | Compatibility class; runtime state owns hover pause. |

`data-active` reports viewport intersection with no extra margin. With `IntersectionObserver`, tickers start paused until the first intersection result; without it, they are treated as active. `data-ready="false"` suppresses animation during measurement.

`data-playing="true"` allows animation only when the ticker is active, the document is visible, and reduced motion is disabled. `pauseOnHover` can still pause it. Automatic checks preserve clones and animation progress when measurements are unchanged.

## Safe customization

```css
.ticker-track,
.ticker-content {
  gap: 2rem;
  align-items: center;
}

.ticker-wrapper.partner-strip {
  padding-block: 1rem;
  color: white;
  background: #071c24;
}
```

The runtime measures the track's computed horizontal `column-gap` (falling back to `gap` when needed). Avoid overriding track transforms or animation names unless you are replacing the motion model. Preserve the package reduced-motion rules.

Classes passed through `options.class` are controller-owned. Other wrapper classes are preserved across `update()` calls.

## Seamless loops

The runtime keeps fractional content widths when calculating `--ticker-distance`. The animation travels exactly one sequence width plus the horizontal track gap, so the first clone aligns with the original when a horizontal direction restarts. Vertical directions use the content height plus `row-gap` instead. Leave this runtime-owned variable unchanged.

For an evenly spaced logo strip, use the same gap between items and between repeated sequences:

```css
.partner-strip {
  --partner-gap: 1.125rem;
}

.partner-strip .ticker-track,
.partner-strip .ticker-content {
  gap: var(--partner-gap);
}
```

If your sequence alternates text and decorative separators, include a separator after the final item as well. The last-to-first join should follow the same pattern as every interior pair. Mismatched gaps or a missing final separator can look like a jump even when the animation distance is correct.

Call the controller's `refresh()` after changing content or loading fonts when no automatic resize measurement occurs. Keep content copies free of transforms or unequal margins that change the repeat spacing independently of the track's gap.

## Vertical, logical direction and manual position

`data-axis` selects a row or column, `data-motion-direction` holds the resolved physical direction and `data-writing-direction` preserves LTR/RTL content ordering. Give vertical wrappers a definite height. `--ticker-position` holds the instantaneous physical offset for manual navigation with reduced motion. Regular playback and seeking share the CSS animation timeline, preserving position across duration/speed updates and same-axis rebuilds. Use the controller rather than overriding transforms or animation time. See [configuration](/ticker/docs/reference/configuration/) and [manual navigation](/ticker/docs/reference/api/controller/#manual-navigation).
