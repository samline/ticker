# React

Use the React entrypoint for React applications.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Basic Usage

```tsx
import { Ticker } from '@samline/ticker/react'
import '@samline/ticker/style.css'

function App() {
  return (
    <Ticker.Root duration={20} direction="left">
      <span>First item</span>
      <span>Second item</span>
      <span>Third item</span>
    </Ticker.Root>
  )
}
```

## Components

### `Ticker.Root`

The main ticker component. Wraps your content with the ticker structure.

```tsx
interface TickerRootProps {
  duration?: number        // Animation duration in seconds (default: 20)
  direction?: 'left' | 'right'  // Animation direction (default: 'left')
  pauseOnHover?: boolean   // Pause on hover (default: false)
  className?: string     // Additional CSS class
  as?: keyof JSX.IntrinsicElements  // Wrapper element type (default: 'div')
  children: React.ReactNode
}
```

### `Ticker.Content` (optional)

Optional content wrapper for semantic Structure:

```tsx
interface TickerContentProps {
  children: React.ReactNode
  className?: string
}
```

## Examples

### Basic Ticker

```tsx
import { Ticker } from '@samline/ticker/react'

function Marquee() {
  return (
    <Ticker.Root duration={20} direction="left">
      <span>Item 1</span>
      <span>Item 2</span>
      <span>Item 3</span>
    </Ticker.Root>
  )
}
```

### With Pause on Hover

```tsx
function MarqueePaused() {
  return (
    <Ticker.Root duration={25} direction="left" pauseOnHover>
      <span>Item 1</span>
      <span>Item 2</span>
      <span>Item 3</span>
    </Ticker.Root>
  )
}
```

### Right Direction

```tsx
function MarqueeRight() {
  return (
    <Ticker.Root duration={30} direction="right">
      <span>Item 1</span>
      <span>Item 2</span>
    </Ticker.Root>
  )
}
```

### Custom Class

```tsx
function StyledTicker() {
  return (
    <Ticker.Root 
      duration={20} 
      className="my-custom-ticker"
      pauseOnHover
    >
      <span>Custom styled content</span>
    </Ticker.Root>
  )
}
```

### Different Wrapper Element

```tsx
function TickerAsSection() {
  return (
    <Ticker.Root as="section" duration={20}>
      <span>Content in a section</span>
    </Ticker.Root>
  )
}
```

## Combined Exports

The package exports both named and default:

```tsx
import { Ticker } from '@samline/ticker/react'
// or
import Ticker from '@samline/ticker/react'

Ticker.Root  // Main component
Ticker.Content  // Optional content wrapper
```

## SSR

Works with React SSR frameworks:

```tsx
// Next.js
import '@samline/ticker/style.css'
// The component is client-side rendered by default
```

The component handles hydration automatically.