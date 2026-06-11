# Vue

Use the Vue entrypoint for Vue 3 applications.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Basic Usage

```vue
<script setup>
import { Ticker } from '@samline/ticker/vue'
import '@samline/ticker/style.css'
</script>

<template>
  <Ticker :duration="20" direction="left">
    <span>First item</span>
    <span>Second item</span>
    <span>Third item</span>
  </Ticker>
</template>
```

## Component

### `Ticker`

The main ticker component.

```typescript
interface TickerProps {
  duration?: number           // Animation duration in seconds (default: 20)
  direction?: 'left' | 'right'  // Animation direction (default: 'left')
  pauseOnHover?: boolean      // Pause on hover (default: false)
  interactiveClones?: boolean // Keep cloned controls interactive (default: false)
  class?: string             // Additional CSS class
  as?: string               // Wrapper element tag (default: 'div')
}
```

Cloned content is non-interactive by default. Set `:interactive-clones="true"` when cloned buttons, links, or form controls should stay interactive.

### Slots

The default slot receives the ticker content:

```vue
<template>
  <Ticker :duration="25">
    <span>Slot content</span>
  </Ticker>
</template>
```

### Events

- `ready` - Fired when ticker is initialized

```vue
<template>
  <Ticker @ready="onReady">
    <span>Content</span>
  </Ticker>
</template>

<script setup>
const onReady = () => {
  console.log('Ticker ready')
}
</script>
```

## Examples

### Basic Ticker

```vue
<template>
  <Ticker :duration="20" direction="left">
    <span>Item 1</span>
    <span>Item 2</span>
    <span>Item 3</span>
  </Ticker>
</template>
```

### Pause on Hover

```vue
<template>
  <Ticker :duration="25" direction="left" :pause-on-hover="true">
    <span>Item 1</span>
    <span>Item 2</span>
  </Ticker>
</template>
```

### Right Direction

```vue
<template>
  <Ticker :duration="30" direction="right">
    <span>Item 1</span>
    <span>Item 2</span>
  </Ticker>
</template>
```

### Custom Class

```vue
<template>
  <Ticker :duration="20" class="my-ticker">
    <span>Custom content</span>
  </Ticker>
</template>

<style>
.my-ticker {
  background: #f0f0f0;
}
</style>
```

### As Different Element

```vue
<template>
  <Ticker :duration="20" as="section">
    <span>Content in section</span>
  </Ticker>
</template>
```

### With Event Handler

```vue
<template>
  <Ticker :duration="20" @ready="handleReady">
    <span>Content</span>
  </Ticker>
</template>

<script setup>
const handleReady = () => {
  console.log('Ticker initialized')
}
</script>
```

## TypeScript

The package includes TypeScript definitions:

```typescript
import { Ticker } from '@samline/ticker/vue'

// Full type support
```