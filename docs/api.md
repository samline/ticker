# API Reference

Complete API documentation for all entrypoints.

## Types

### `TickerDirection`

```typescript
type TickerDirection = 'left' | 'right'
```

### `TickerOptions`

```typescript
interface TickerOptions {
  duration?: number        // Animation duration in seconds (default: 20)
  direction?: TickerDirection  // Animation direction (default: 'left')
  pauseOnHover?: boolean  // Pause on hover (default: false)
  class?: string         // Additional CSS class
}
```

### `TickerController`

```typescript
interface TickerController {
  mount: () => void
  unmount: () => void
  refresh: () => void
  enhance?: (element: HTMLElement) => HTMLElement
}
```

## Vanilla API

### `mount()`

Initializes all tickers on the page. Call after DOM is ready.

```typescript
mount(): void
```

### `unmount()`

Removes all tickers and cleans up observers.

```typescript
unmount(): void
```

### `refresh()`

Recalculates all ticker positions. Call after dynamic content changes.

```typescript
refresh(): void
```

### `createTicker(options)`

Creates an isolated ticker instance with its own state.

```typescript
createTicker(options?: TickerOptions): TickerController
```

### `enhance(selector, options)`

Wraps existing DOM elements with ticker markup.

```typescript
enhance(selector: string | HTMLElement, options?: TickerOptions): HTMLElement | null
```

### `initTicker(wrapper)`

Initializes a specific ticker wrapper element.

```typescript
initTicker(wrapper: HTMLElement): void
```

### `destroyTicker(wrapper)`

Destroys a specific ticker.

```typescript
destroyTicker(wrapper: HTMLElement): void
```

### `rebuildTicker(state)`

Forces rebuild of a ticker's clones.

```typescript
rebuildTicker(state: TickerState): void
```

## Browser Global

When using CDN/bundle build, these are available on `window.Ticker`:

```javascript
Ticker.mount()
Ticker.unmount()
Ticker.refresh()
Ticker.createTicker({ duration: 20 })
Ticker.enhance('.selector', { direction: 'right' })
Ticker.initTicker(element)
Ticker.destroyTicker(element)
```

## React API

### Components

#### `Ticker.Root`

Main ticker component.

```tsx
interface TickerRootProps {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
  as?: keyof JSX.IntrinsicElements
  children: React.ReactNode
}
```

#### `Ticker.Content`

Optional content wrapper.

```tsx
interface TickerContentProps {
  children: React.ReactNode
  className?: string
}
```

## Vue API

### Component

#### `Ticker`

Main ticker component.

```typescript
interface TickerProps {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  class?: string
  as?: string
}
```

#### Events

- `ready` - Fired when ticker initializes

## Svelte API

### Component

#### `Ticker`

Main ticker component.

```typescript
interface TickerProps {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  className?: string
}
```

## CSS

### Style Sheet

Import the shared stylesheet:

```javascript
import '@samline/ticker/style.css'
```

Or via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@1.0.7/dist/style.css">
```

### CSS Variables

Customize ticker appearance:

```css
.ticker-wrapper {
  --ticker-duration: 20s;
  --ticker-distance: 0px;
}
```

### Data Attributes

| Attribute | Description |
|-----------|-------------|
| `data-ticker` | Marks wrapper element |
| `data-ticker-track` | Marks track element |
| `data-ticker-content` | Marks content element |
| `data-duration` | Animation duration |
| `data-direction` | Animation direction |
| `data-pause-on-hover` | Pause on hover setting |
| `data-ready` | Initialization state |
| `data-active` | Visibility state |

### Classes

| Class | Description |
|-------|-------------|
| `.ticker-wrapper` | Main wrapper element |
| `.ticker-track` | Track that animates |
| `.ticker-content` | Content container |
| `.ticker-clone` | Cloned content (internal) |
| `.ticker-pause-on-hover` | Enables pause on hover |

## Accessibility

- Cloned content has `aria-hidden="true"`
- Cloned content has `role="presentation"`
- Focusable elements in clones have `tabindex="-1"`
- Respects `prefers-reduced-motion` media query