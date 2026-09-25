# Options

`ticker(target, options?)` accepts `TickerOptions`. Every option has a default, so pass only what you need.

```ts
const news = ticker('#news', {
  duration: 24,
  direction: 'right',
  pauseOnHover: true,
  interactiveClones: false,
  class: 'news-ticker theme-dark',
})
```

---

## Signature

```ts
interface TickerOptions {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}
```

## Options reference

| Option              | Type                | Default  | Behavior                                                                                                                                      |
| ------------------- | ------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `duration`          | `number`            | `20`     | Seconds per animation cycle. Non-finite and non-positive values normalize to `20`.                                                            |
| `direction`         | `'left' \| 'right'` | `'left'` | Horizontal travel direction. Every value except `'right'` normalizes to `'left'`.                                                             |
| `pauseOnHover`      | `boolean`           | `false`  | Adds hover pause behavior to the track when strictly `true`.                                                                                  |
| `interactiveClones` | `boolean`           | `false`  | Keeps repeated content exposed and interactive when strictly `true`. Read the [accessibility trade-off](accessibility.md#interactive-clones). |
| `class`             | `string`            | `''`     | Space-separated classes added to the wrapper. `ticker-wrapper` is reserved and removed from this value.                                       |

`instance.options` returns a new read-only snapshot of the normalized options. Mutating the returned object does not update the ticker; call [`update()`](api/update.md).

---

## Declarative data attributes

Server-rendered wrappers use the same behavior through attributes:

| Attribute                        | Equivalent option         |
| -------------------------------- | ------------------------- |
| `data-duration="24"`             | `duration: 24`            |
| `data-direction="right"`         | `direction: 'right'`      |
| `data-pause-on-hover="true"`     | `pauseOnHover: true`      |
| `data-interactive-clones="true"` | `interactiveClones: true` |

The class option only applies through the controller API. Declarative markup can use ordinary `class` attributes directly.
