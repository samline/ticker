# Getting Started

This page explains how `@samline/ticker` enhances markup, who owns each lifecycle, and which cleanup guarantees the controller provides.

---

## Prerequisites

- Node.js 20+ when bundling.
- A browser target with ES2020 support.
- The package stylesheet loaded once on the page.

## Install

```bash
npm install @samline/ticker
```

You can also use `pnpm add @samline/ticker`, `yarn add @samline/ticker`, or `bun add @samline/ticker`.

```ts
import '@samline/ticker/style.css'
```

---

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

---

## Controller lifecycle

```ts
news.update({ duration: 32, direction: 'right' })
news.refresh()
news.destroy()
```

1. **Create** — `ticker()` resolves the source and creates or adopts a ticker wrapper.
2. **Update** — `update()` merges and normalizes new options, then schedules a rebuild.
3. **Refresh** — `refresh()` remeasures after application-owned content changes.
4. **Destroy** — `destroy()` disconnects observers, removes clones, restores enhanced source markup, and sets `element` to `null`.

A controller owns one ticker. Destroy it when the view, widget, or page fragment that created it is removed.

---

## Declarative markup

When a server or template renders the complete structure, use the page manager:

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

The manager initializes existing and newly inserted ticker markup. Use controllers for application-owned instances and the manager for page-level declarative ownership; do not give both lifecycles ownership of the same element.

## Next steps

- Configure behavior with [TickerOptions](options.md).
- Learn the [browser registry](browser.md).
- Review the [DOM and styling contract](styling.md).
- Read the [API reference](api/index.md).
