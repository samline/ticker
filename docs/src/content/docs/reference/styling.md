---
locale: en
sidebar:
  group: reference
  order: 6
title: 'Styling and DOM contract'
description: 'Generated markup, package-owned attributes, classes, CSS variables, animation behavior, and safe customization.'
---

## Load the stylesheet

Import the package CSS once alongside the JavaScript entrypoint. It owns layout, animation, direction, hover pause, measurement visibility, and reduced-motion behavior.

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

| Name                     | Purpose                                        |
| ------------------------ | ---------------------------------------------- |
| `--ticker-duration`      | Normalized animation duration.                 |
| `--ticker-distance`      | Exact content width plus horizontal track gap. |
| `.ticker-wrapper`        | Clipping container.                            |
| `.ticker-track`          | Animated `width: max-content` flex row.        |
| `.ticker-track > *`      | Non-shrinking content sequences.               |
| `.ticker-content`        | Original content sequence.                     |
| `.ticker-clone`          | Non-selectable generated visual copy.          |
| `.ticker-pause-on-hover` | Track state used by `pauseOnHover`.            |

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

The runtime keeps fractional content widths when calculating `--ticker-distance`. The animation travels exactly one sequence width plus the horizontal track gap, so the first clone aligns with the original when either direction restarts. Vertical `row-gap` does not affect the travel distance. Leave this runtime-owned variable unchanged.

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
