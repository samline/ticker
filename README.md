# Ticker

A universal ticker (marquee) package with one shared interaction runtime across React, Vue, Svelte, vanilla JS, and browser/CDN usage.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Quick Start

### Vanilla

```ts
import '@samline/ticker/style.css'
import { createTicker } from '@samline/ticker'

const ticker = createTicker({
  duration: 20,
  direction: 'left',
  content: 'Your ticker content here'
})

ticker.mount()
```

### React

```tsx
import '@samline/ticker/style.css'
import { Ticker } from '@samline/ticker/react'

function App() {
  return (
    <Ticker.Root duration={20} direction="left">
      <span>Your ticker content</span>
      <span>More content</span>
    </Ticker.Root>
  )
}
```

### Vue

```vue
<script setup>
import { Ticker } from '@samline/ticker/vue'
import '@samline/ticker/style.css'
</script>

<template>
  <Ticker :duration="20" direction="left">
    <span>Your ticker content</span>
    <span>More content</span>
  </Ticker>
</template>
```

### Svelte

```svelte
<script>
import { Ticker } from '@samline/ticker/svelte'
import '@samline/ticker/style.css'
</script>

<Ticker duration={20} direction="left">
  <span>Your ticker content</span>
  <span>More content</span>
</Ticker>
```

## Entrypoints

- `@samline/ticker`: vanilla API and shared runtime helpers
- `@samline/ticker/react`: React component API
- `@samline/ticker/vue`: Vue component API
- `@samline/ticker/svelte`: Svelte component API
- `@samline/ticker/browser`: browser global for CDN or plain HTML
- `@samline/ticker/core`: controller and state contracts only
- `@samline/ticker/style.css`: shared styles

## Full Docs

- [docs/README.md](docs/README.md) - Overview and options
- [docs/api.md](docs/api.md) - Complete API reference
- [docs/vanilla.md](docs/vanilla.md) - Vanilla JS guide
- [docs/browser.md](docs/browser.md) - Browser/CDN guide
- [docs/react.md](docs/react.md) - React guide
- [docs/vue.md](docs/vue.md) - Vue guide
- [docs/svelte.md](docs/svelte.md) - Svelte guide

## Options

All entrypoints share the same options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `duration` | `number` | `20` | Animation duration in seconds |
| `direction` | `'left' \| 'right'` | `'left'` | Animation direction |
| `pauseOnHover` | `boolean` | `false` | Pause animation on hover |
| `class` | `string` | `''` | Additional CSS class |

## Notes

- All entrypoints target the same ticker behavior with shared options.
- The ticker clones content automatically to create seamless infinite scroll.
- Respects `prefers-reduced-motion` for accessibility.
- Automatically handles content resizing via ResizeObserver.

## License

MIT