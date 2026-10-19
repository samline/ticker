---
locale: en
sidebar:
  group: guides
  order: 4
title: 'Recipes'
description: 'Practical patterns for dynamic content, multiple tickers, declarative markup, updates, browser globals, and teardown.'
---

Looking for a complete starting point? [Open the working examples](/ticker/examples/) to try announcements, logos, sample prices, opposite rows, dynamic content and playback controls. Each recipe includes a complete HTML/CDN file and an npm/ESM alternative. The patterns below explain integrations in more detail.

## Dynamic content

```ts
const offers = ticker('#offers', { speed: 40 })

offers?.source.append(buildOffer())
offers?.refresh()
```

Use `speed` when content can grow or shrink: a fixed `duration` completes a longer sequence in the same time and therefore moves faster. Pixel speed preserves the reading pace after each refresh. [Try adding and removing items in the live feed](/ticker/examples/#dynamic-content).

### Remove original items

The application owns its content; no package-specific add/remove methods are needed. For an ordinary source element enhanced with `ticker('#offers')`, remove nodes from `source` and call `refresh()` to rebuild the visual copies. Keep separators inside the item, or remove an item's companion separator too.

```ts
const removeOffer = (item?: Element | null) => {
  if (!item || !offers?.source.contains(item)) return
  item.remove()
  offers.refresh()
}

const items = [...(offers?.source.querySelectorAll('[data-offer]') ?? [])]
removeOffer(items[0]) // First original item.
removeOffer(items.at(-1)) // Last original item.
removeOffer(offers?.source.querySelector('[data-offer="sale"]'))
```

`removeOffer` is an application helper, not a Ticker method. Target original nodes rather than `.ticker-clone` copies; the package still owns measurement, playback and clone cleanup. Removing every item leaves the runtime waiting for measurable content; appending a new item and refreshing makes the feed ready again.

## Multiple controllers

```ts
const headlines = ticker('#headlines', { duration: 20 })
const partners = ticker('#partners', { duration: 45, direction: 'right' })

window.addEventListener('pagehide', event => {
  if (event.persisted) return
  headlines?.destroy()
  partners?.destroy()
})
```

## Update a theme class

```ts
const news = ticker('#news', { class: 'news news--light' })
news?.update({ class: 'news news--dark' })
```

The controller replaces only its previous option classes. Application classes added independently remain intact.

## Existing ticker markup

```ts
const existing = ticker('[data-ticker]')
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

```js
const sponsors = window.Ticker.newTicker({
  id: 'sponsors',
  options: { duration: 40 },
})

sponsors?.update({ pauseOnHover: true })
window.Ticker.destroyTicker('sponsors')
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

export const mountClientTicker = () => ticker('#client-only')
```

Module import is server-safe. Calling `ticker()` with a selector before a DOM exists returns `null`, so invoke it in your framework's client mount hook.

## Drag with optional playback resumption

The [drag and resume example](/ticker/examples/#drag-playback) starts moving and exposes a Resume after drag toggle. It calls `update({ resumeAfterDrag: true })` or `update({ resumeAfterDrag: false })`. With the option enabled, a running ticker restores playback intent after release; hover and focus pauses still apply. With it disabled, a drag leaves playback paused. Changing the option never starts a paused ticker: use `play()` for that. A ticker manually paused before dragging remains paused in either mode.
