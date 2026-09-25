---
title: Recipes
description: Practical patterns for dynamic content, multiple tickers, declarative markup, updates, browser globals, and teardown.
template: doc
---

## Dynamic content

```ts
const offers = ticker('#offers')

offers?.source.append(buildOffer())
offers?.refresh()
```

## Multiple controllers

```ts
const headlines = ticker('#headlines', { duration: 20 })
const partners = ticker('#partners', { duration: 45, direction: 'right' })

window.addEventListener(
  'pagehide',
  () => {
    headlines?.destroy()
    partners?.destroy()
  },
  { once: true }
)
```

## Update a theme class

```ts
const news = ticker('#news', { class: 'news news--light' })
news?.update({ class: 'news news--dark' })
```

The controller replaces only its previous option classes. Application classes added independently remain intact.

## Existing ticker markup

```ts
const wrapper = document.querySelector<HTMLElement>('[data-ticker]')
const existing = wrapper ? ticker(wrapper) : null
```

When an existing wrapper is adopted, `destroy()` releases runtime state but keeps that wrapper in the DOM.

Explicit options override the adopted wrapper's data attributes:

```ts
const existing = ticker('[data-ticker]', { direction: 'right' })
```

## Declarative server-rendered markup

```html
<div data-ticker data-duration="28" data-pause-on-hover="true">
  <div data-ticker-track>
    <div data-ticker-content>...</div>
  </div>
</div>
```

```ts
import { mount, refresh, unmount } from '@samline/ticker/vanilla'

mount()

// Call after application-owned content changes.
refresh()

// Call when the page integration is removed.
unmount()
```

Do not also create a controller for a root owned by declarative discovery.

## Browser registry

```html
<script>
  const sponsors = window.Ticker.newTicker({
    id: 'sponsors',
    options: { duration: 40 },
  })

  sponsors?.update({ pauseOnHover: true })
  window.Ticker.destroyTicker('sponsors')
</script>
```

Prefer the registry destroy helper over `sponsors.destroy()` so the public `available` entry is also removed.

## Missing targets

```ts
const partners = ticker('#partners')

if (!partners) {
  console.warn('Ticker source is not present on this page')
}
```

A missing selector returns `null` without side effects. Registry creation also returns `null`, but logs for empty ids and missing sources.

## Server-safe module setup

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'

export function mountClientTicker() {
  return ticker('#client-only')
}
```

Module import is server-safe. Calling `ticker()` with a selector before a DOM exists returns `null`, so invoke it in your framework's client mount hook.
