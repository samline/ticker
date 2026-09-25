---
title: Styling and DOM contract
description: Generated markup, package-owned attributes, classes, CSS variables, animation behavior, and safe customization.
---

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
>
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>...</div>
    <div class="ticker-content ticker-clone" aria-hidden="true">...</div>
  </div>
</div>
```

## Package-owned CSS

| Name                     | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `--ticker-duration`      | Normalized animation duration.                         |
| `--ticker-distance`      | Measured width of one content sequence plus track gap. |
| `.ticker-wrapper`        | Clipping container.                                    |
| `.ticker-track`          | Animated flex row.                                     |
| `.ticker-content`        | Original content sequence.                             |
| `.ticker-clone`          | Generated repeated sequence.                           |
| `.ticker-pause-on-hover` | Track state used by `pauseOnHover`.                    |

`data-active="false"` pauses an offscreen ticker. `data-ready="false"` suppresses animation during measurement.

## Safe customization

```css
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

The runtime measures the track's computed `gap`. Avoid overriding track transforms or animation names unless you are replacing the motion model. Preserve the package reduced-motion rules.

Classes passed through `options.class` are controller-owned. Other wrapper classes are preserved across `update()` calls.
