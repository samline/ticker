# Vanilla JS

Use the vanilla entrypoint when working with plain JavaScript or when integrating with other frameworks manually.

## Installation

```bash
npm install @samline/ticker
```

```bash
bun add @samline/ticker
```

## Basic Usage

```javascript
import { mount } from '@samline/ticker'
import '@samline/ticker/style.css'

mount()
```

## Using Existing Markup

If you already have the markup structure, it will be auto-initialized:

```html
<div class="ticker-wrapper" data-ticker data-duration="20" data-direction="left" data-ready="false">
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>
      Your content here
    </div>
  </div>
</div>

<script type="module">
import { mount } from '@samline/ticker'
import '@samline/ticker/style.css'

mount()
</script>
```

## Auto-Enhance Content

The `enhance` function wraps content automatically:

```javascript
import { enhance } from '@samline/ticker'
import '@samline/ticker/style.css'

// Wrap a CSS selector
enhance('.my-ticker-content', {
  duration: 20,
  direction: 'left',
  pauseOnHover: true
})

// Or pass an element directly
const content = document.querySelector('#ticker-content')
enhance(content, { duration: 30 })
```

## Create Ticker Instance

For isolated control, use `createTicker`:

```javascript
import { createTicker } from '@samline/ticker'
import '@samline/ticker/style.css'

const ticker = createTicker({
  duration: 25,
  direction: 'right',
  pauseOnHover: false,
  class: 'my-custom-ticker'
})

ticker.mount()

// Later, clean up
ticker.unmount()
```

## API Reference

### `mount()`

Initializes all tickers on the page. Call after DOM is ready.

```javascript
mount()
```

### `unmount()`

Removes all tickers and cleans up observers.

```javascript
unmount()
```

### `refresh()`

Recalculates all ticker positions. Call after dynamic content changes.

```javascript
refresh()
```

### `enhance(selector, options)`

Wraps content with ticker markup.

```javascript
enhance('.selector', { duration: 20, direction: 'left' })
// or
enhance(element, { duration: 20 })
```

Returns the wrapper element.

### `createTicker(options)`

Creates an isolated ticker instance.

```javascript
const ticker = createTicker({ duration: 20 })

ticker.mount()
ticker.unmount()
ticker.refresh()
```

## Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticker Example</title>
  <link rel="stylesheet" href="@samline/ticker/style.css">
</head>
<body>
  <div class="ticker-content">
    <span>First item</span>
    <span>Second item</span>
    <span>Third item</span>
  </div>

  <script type="module">
    import { enhance } from '@samline/ticker'

    enhance('.ticker-content', {
      duration: 20,
      direction: 'left',
      pauseOnHover: true
    })
  </script>
</body>
</html>
```