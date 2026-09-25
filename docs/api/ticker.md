# `ticker(target, options?)`

Enhances an existing element or adopts complete ticker markup and returns an element-scoped controller. This is the primary factory for `@samline/ticker`.

## Signature

```ts
function ticker(target: string | HTMLElement, options?: TickerOptions): TickerInstance | null
```

## Parameters

| Name      | Type                    | Required | Description                                                                            |
| --------- | ----------------------- | -------- | -------------------------------------------------------------------------------------- |
| `target`  | `string \| HTMLElement` | yes      | A CSS selector resolved with `document.querySelector`, or an element to enhance/adopt. |
| `options` | `TickerOptions`         | no       | Partial configuration. See [Options](../options.md).                                   |

## Returns

A [`TickerInstance`](controller.md), or `null` when a string target cannot be resolved. An `HTMLElement` target always proceeds to enhancement or adoption.

## Binding modes

### CSS selector

```ts
const news = ticker('#news', { duration: 24 })
```

Only the first matching element is used. A missing match returns `null` without changing the DOM.

The selector is passed directly to `document.querySelector`; invalid CSS selector syntax throws the browser's `DOMException`.

### Element

```ts
const source = document.querySelector<HTMLElement>('#news')
const news = source ? ticker(source) : null
```

### Existing ticker wrapper

```ts
const existing = ticker(document.querySelector<HTMLElement>('[data-ticker]')!, {
  direction: 'right',
})
```

An element matching `[data-ticker]` or `.ticker-wrapper` is adopted. The runtime reads its behavior data attributes, then explicit options override those values.

## Behavior

For ordinary source content, the factory:

1. Normalizes all options.
2. Creates `.ticker-wrapper` and `.ticker-track` elements.
3. Uses an existing `[data-ticker-content]` / `.ticker-content` descendant when present; otherwise creates `.ticker-content` and moves the source into it.
4. Inserts the wrapper at the source's previous position.
5. Initializes runtime state, observers, measurement, and accessible clones.
6. Returns the controller.

For adopted markup it applies normalized attributes to the existing wrapper and initializes its existing track/content pair. If the required track or content is missing, the controller is still returned but no runtime state is initialized.

## Server behavior

Passing a selector when `document` is unavailable returns `null`. Importing the function itself is server-safe. Passing a real `HTMLElement` inherently requires a DOM implementation.

## Related

- [`TickerInstance`](controller.md)
- [Options](../options.md)
- [DOM and styling](../styling.md)
- [`destroy()`](destroy.md)
