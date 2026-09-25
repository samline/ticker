# Recipes

Task-oriented patterns for common `@samline/ticker` integrations.

## Dynamic content

Mutate the original source, then request an immediate measurement:

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

## Update a theme

```ts
const news = ticker('#news', { class: 'news news--light' })
news?.update({ class: 'news news--dark' })
```

Only classes previously supplied through `options.class` are replaced. Application classes added independently to the wrapper remain.

## Adopt existing ticker markup

```ts
const wrapper = document.querySelector<HTMLElement>('[data-ticker]')
const existing = wrapper ? ticker(wrapper) : null
```

The controller reads initial data attributes, applies explicit options over them, and keeps the adopted wrapper in the DOM when destroyed.

## Declarative server-rendered markup

```ts
import { mount, refresh, unmount } from '@samline/ticker/vanilla'

mount()

// After application-owned content changes:
refresh()

// During page or integration teardown:
unmount()
```

The manager discovers current and newly inserted ticker roots. Do not also create controllers for those same roots.

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

## Missing targets

```ts
const partners = ticker('#partners')

if (!partners) {
  console.warn('Ticker source is not present on this page')
}
```

A missing selector is a side-effect-free `null` result. Registry creation also returns `null`, but logs when the id is empty or the source is missing.
