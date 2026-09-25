---
title: Getting started
description: Install @samline/ticker, enhance existing HTML, and manage one ticker through its controller.
---

## Install

```bash
npm install @samline/ticker
```

You can also use `pnpm add @samline/ticker`, `yarn add @samline/ticker`, or `bun add @samline/ticker`.

Import the stylesheet once in your application entrypoint.

```ts
import '@samline/ticker/style.css'
```

## Enhance existing HTML

```html
<div id="news-ticker">
  <a href="/story/one">First story</a>
  <a href="/story/two">Second story</a>
</div>
```

```ts
import { ticker } from '@samline/ticker'

const news = ticker('#news-ticker', {
  duration: 24,
  direction: 'left',
  pauseOnHover: true,
})

if (!news) throw new Error('Ticker target not found')
```

`ticker()` accepts a selector or `HTMLElement`. It wraps ordinary content, measures it, creates enough visual clones to fill the viewport, and returns a controller. A missing selector returns `null` without changing the DOM.

## Control the instance

```ts
news.update({ duration: 32, direction: 'right' })
news.refresh()
news.destroy()
```

- `update()` shallow-merges options, normalizes them, and rebuilds the instance.
- `refresh()` remeasures after application-owned content changes.
- `destroy()` disconnects observers, removes clones, restores the original element, and sets `element` to `null`.

Controllers own one ticker. Destroy the controller when the page, widget, or view that created it is removed.

## Declarative markup

When your server or template already renders the complete ticker structure, initialize it at page level:

```html
<div data-ticker data-duration="24" data-direction="left" data-pause-on-hover="true">
  <div data-ticker-track>
    <div data-ticker-content>...</div>
  </div>
</div>
```

```ts
import { mount, unmount } from '@samline/ticker/vanilla'
import '@samline/ticker/style.css'

mount()
window.addEventListener('pagehide', unmount, { once: true })
```

The page manager initializes existing and newly inserted ticker markup. Use the controller API for application-owned instances and the manager API for declarative page-level ownership; do not mix both lifecycles for the same element.
