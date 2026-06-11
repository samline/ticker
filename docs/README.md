# @samline/ticker

A universal ticker (marquee) package with one shared interaction runtime across React, Vue, Svelte, vanilla JS, and browser/CDN usage.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Options

All framework integrations share the same options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `20` | Animation duration in seconds |
| `direction` | `'left' \| 'right'` | `'left'` | Animation direction |
| `pauseOnHover` | `boolean` | `false` | Pause animation on hover |
| `interactiveClones` | `boolean` | `false` | Keeps cloned buttons, links, and other interactive elements clickable and focusable |
| `class` | `string` | `''` | Additional CSS class |

## Framework Quick Links

- [vanilla.md](vanilla.md) - Vanilla JS
- [browser.md](browser.md) - Browser/CDN
- [react.md](react.md) - React
- [vue.md](vue.md) - Vue
- [svelte.md](svelte.md) - Svelte
- [api.md](api.md) - Full API Reference

## Shared Behavior

All entrypoints provide the same ticker functionality:

- **Infinite scroll**: Content is automatically cloned to fill the container
- **Smooth animation**: CSS-based infinite marquee animation
- **Resize handling**: Automatically recalculates on content changes
- **Intersection observer**: Pauses when not visible for performance
- **Interactive clones (opt-in)**: Cloned controls stay non-interactive by default unless `interactiveClones` is enabled
- **Reduced motion**: Respects `prefers-reduced-motion` for accessibility

## DOM Structure

The ticker creates this structure:

```html
<div class="ticker-wrapper" data-ticker data-ready="true" data-active="true">
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>
      <!-- Original content -->
    </div>
    <!-- Cloned content for seamless loop -->
  </div>
</div>
```

## CSS Variables

Customize the ticker with CSS variables:

```css
.ticker-wrapper {
  --ticker-duration: 20s;  /* Override animation duration */
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

Requires ResizeObserver and IntersectionObserver (widely supported).