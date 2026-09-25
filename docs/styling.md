# Styling

Import `@samline/ticker/style.css` once. The package stylesheet owns the layout, animation, direction, hover pause, visibility during measurement, and reduced-motion behavior.

```ts
import '@samline/ticker/style.css'
```

---

## Generated DOM

Enhancing ordinary content produces this contract:

```html
<div class="ticker-wrapper" data-ticker data-ready="true" data-active="true">
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
| `--ticker-distance` | Runtime | Measured travel distance for one content copy.    |

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

.partner-strip .ticker-content {
  gap: 2rem;
}
```

When `update()` changes `class`, the controller removes classes from the previous option and applies the new normalized list.
