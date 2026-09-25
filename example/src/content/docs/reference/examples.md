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
