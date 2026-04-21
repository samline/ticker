# Svelte

Use the Svelte entrypoint for Svelte 4/5 applications.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Basic Usage

```svelte
<script>
import { Ticker } from '@samline/ticker/svelte'
import '@samline/ticker/style.css'
</script>

<Ticker duration={20} direction="left">
  <span>First item</span>
  <span>Second item</span>
  <span>Third item</span>
</Ticker>
```

## Component Props

### `Ticker`

The main ticker component.

```typescript
interface TickerProps {
  duration?: number           // Animation duration in seconds (default: 20)
  direction?: 'left' | 'right'  // Animation direction (default: 'left')
  pauseOnHover?: boolean      // Pause on hover (default: false)
  className?: string         // Additional CSS class
}
```

### Slot Content

The default slot receives the ticker content:

```svelte
<Ticker duration={25}>
  <span>Slot content</span>
</Ticker>
```

## Examples

### Basic Ticker

```svelte
<Ticker duration={20} direction="left">
  <span>Item 1</span>
  <span>Item 2</span>
  <span>Item 3</span>
</Ticker>
```

### Pause on Hover

```svelte
<Ticker duration={25} direction="left" pauseOnHover>
  <span>Item 1</span>
  <span>Item 2</span>
</Ticker>
```

### Right Direction

```svelte
<Ticker duration={30} direction="right">
  <span>Item 1</span>
  <span>Item 2</span>
</Ticker>
```

### Custom Class

```svelte
<Ticker duration={20} className="my-ticker">
  <span>Custom content</span>
</Ticker>

<style>
  :global(.my-ticker) {
    background: #f0f0f0;
  }
</style>
```

### Dynamic Props

```svelte
<script>
let duration = 20
</script>

<Ticker {duration} direction="left">
  <span>Dynamic: {duration}s</span>
</Ticker>

<button on:click={() => duration = duration === 20 ? 30 : 20}>
  Toggle duration
</button>
```

## TypeScript

The package includes TypeScript definitions:

```svelte
<script lang="ts">
import { Ticker } from '@samline/ticker/svelte'
// Full type support
</script>
```

Works with Svelte 4 and Svelte 5.