# Browser / CDN

Use the browser entrypoint for plain HTML pages without build tools.

## CDN Usage

### Quick Start

```html
<script src="https://unpkg.com/@samline/ticker@1.0.4/dist/browser/index.global.js"></script>
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@1.0.4/dist/style.css">

<div class="ticker-content">
  <span>Your ticker content</span>
  <span>More content</span>
  <span>Even more</span>
</div>

<script>
  Ticker.enhance('.ticker-content', {
    duration: 20,
    direction: 'left',
    pauseOnHover: true
  })
</script>
```

## Global API

When using the CDN build, `Ticker` is available globally:

```javascript
Ticker.mount()
Ticker.unmount()
Ticker.refresh()
Ticker.createTicker({ duration: 20 })
Ticker.enhance('.selector', { direction: 'left' })
```

## Using Existing Markup

If you already have the full markup:

```html
<div class="ticker-wrapper" data-ticker data-duration="20" data-direction="left">
  <div class="ticker-track" data-ticker-track>
    <div class="ticker-content" data-ticker-content>
      Your content here
    </div>
  </div>
</div>

<script src="https://unpkg.com/@samline/ticker@1.0.4/dist/browser/index.global.js"></script>
<script>
  Ticker.mount()
</script>
```

## CDN Options

### Unpkg

```html
<script src="https://unpkg.com/@samline/ticker@1.0.4/dist/browser/index.global.js"></script>
```

### JSDelivr

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@1.0.4/dist/browser/index.global.js"></script>
```

## Full Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ticker CDN Example</title>
  <link rel="stylesheet" href="https://unpkg.com/@samline/ticker@1.0.4/dist/style.css">
  <style>
    body { margin: 0; font-family: system-ui; }
    .ticker-content span {
      padding: 0 2rem;
      font-size: 2rem;
    }
  </style>
</head>
<body>
  <div style="padding: 2rem 0;">
    <div class="ticker-content">
      <span>First Item</span>
      <span>Second Item</span>
      <span>Third Item</span>
      <span>Fourth Item</span>
    </div>
  </div>

  <script src="https://unpkg.com/@samline/ticker@1.0.4/dist/browser/index.global.js"></script>
  <script>
    Ticker.enhance('.ticker-content', {
      duration: 25,
      direction: 'left',
      pauseOnHover: true
    })
  </script>
</body>
</html>
```

## Module Usage

You can also use ES modules:

```html
<script type="module">
  import { enhance } from 'https://unpkg.com/@samline/ticker@1.0.4/dist/browser/index.global.js'

  enhance('.ticker-content', { duration: 20 })
</script>
```