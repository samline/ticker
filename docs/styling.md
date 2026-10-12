# Styling

Import `@samline/ticker/style.css` once. The package stylesheet owns the layout, animation, direction, hover pause, visibility during measurement, and reduced-motion behavior.

```ts
import '@samline/ticker/style.css'
```

---

## Generated DOM

Enhancing ordinary content produces this contract:

```html
<div class="ticker-wrapper" data-ticker data-ready="true" data-active="true" data-playing="true">
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>...</div>
    <div class="ticker-content ticker-clone" data-ticker-content>...</div>
  </div>
</div>
```

Application styles should target the stable classes or data attributes. Treat clone count and inline measurement variables as runtime-owned details.

## CSS variables

| Variable            | Owner   | Purpose                                           |
| ------------------- | ------- | ------------------------------------------------- |
| `--ticker-duration` | Runtime | Normalized animation duration, for example `24s`. |
| `--ticker-distance` | Runtime | Exact content width plus horizontal track gap.    |

## Package-owned selectors

| Selector                 | Purpose                                 |
| ------------------------ | --------------------------------------- |
| `.ticker-wrapper`        | Full-width clipping container.          |
| `.ticker-track`          | Animated `width: max-content` flex row. |
| `.ticker-track > *`      | Non-shrinking content sequences.        |
| `.ticker-content`        | Original content sequence.              |
| `.ticker-clone`          | Generated visual copy; non-selectable.  |
| `.ticker-pause-on-hover` | Track marker used by `pauseOnHover`.    |

`data-ready="false"` suppresses animation while geometry is unresolved. `data-active` reports viewport intersection with no extra margin. With `IntersectionObserver`, tickers start paused until the first intersection result. Without it, they are treated as active.

`data-playing="true"` allows animation only when the ticker is active, the document is visible, and reduced motion is disabled. `pauseOnHover` can still pause it. Playback changes preserve existing clones and animation progress when measurements are unchanged. In reduced-motion mode animation and transforms are disabled and clones are hidden.

## Custom classes

Use the `class` option to add theme or placement classes to the wrapper:

```ts
ticker('#partners', { class: 'partner-strip theme-muted' })
```

```css
.partner-strip {
  background: #0b1720;
  color: white;
}

.partner-strip .ticker-track,
.partner-strip .ticker-content {
  gap: 2rem;
}
```

When `update()` changes `class`, the controller removes classes from the previous option and applies the new normalized list.

The runtime measures the track's computed horizontal `column-gap` (falling back to `gap` when needed), so gap can be themed safely. Avoid overriding track transforms, animation names, or runtime-owned data attributes unless you are intentionally replacing the motion model.

## Seamless loops

The runtime keeps fractional content widths when calculating `--ticker-distance`. The animation travels exactly one sequence width plus the horizontal track gap, so the first clone aligns with the original when either direction restarts. Vertical `row-gap` does not affect the travel distance. Leave this runtime-owned variable unchanged.

For an evenly spaced logo strip, use the same gap between items and between repeated sequences:

```css
.partner-strip {
  --partner-gap: 18px;
}

.partner-strip .ticker-track,
.partner-strip .ticker-content {
  gap: var(--partner-gap);
}
```

If your sequence alternates text and decorative separators, include a separator after the final item as well. The last-to-first join should follow the same pattern as every interior pair. Mismatched gaps or a missing final separator can look like a jump even when the animation distance is correct.

Call the controller's `refresh()` after changing content or loading fonts when no automatic resize measurement occurs. Keep content copies free of transforms or unequal margins that change the repeat spacing independently of the track's gap.
