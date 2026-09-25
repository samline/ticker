# Options

`ticker(target, options?)` accepts `TickerOptions`. All fields are optional and every controller stores a fully normalized snapshot.

```ts
interface TickerOptions {
  duration?: number
  direction?: 'left' | 'right'
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}
```

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

## Options reference

| Option              | Type                | Default  | Normalization                                                                                                | Runtime effect                                                                      |
| ------------------- | ------------------- | -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `duration`          | `number`            | `20`     | Finite and greater than zero; otherwise `20`. Runtime validators also parse non-number input used by markup. | Writes `data-duration` and `--ticker-duration`.                                     |
| `direction`         | `'left' \| 'right'` | `'left'` | Only exact `'right'` stays right; every other runtime value becomes left.                                    | Writes `data-direction` and selects animation keyframes.                            |
| `pauseOnHover`      | `boolean`           | `false`  | Only literal `true` enables it.                                                                              | Writes `data-pause-on-hover` and toggles `.ticker-pause-on-hover` on the track.     |
| `interactiveClones` | `boolean`           | `false`  | Only literal `true` enables it.                                                                              | Writes `data-interactive-clones` and controls clone semantics and pointer behavior. |
| `class`             | `string`            | `''`     | Split on whitespace, empty tokens removed, and reserved `ticker-wrapper` removed.                            | Adds controller-owned classes to the wrapper.                                       |

## `duration`

Duration is the number of seconds required for one content-width animation cycle. Larger numbers move more slowly.

```ts
ticker('#headlines', { duration: 30 })
```

Values `<= 0`, `NaN`, and infinities normalize to `20`. Declarative numeric strings are parsed; the typed controller option accepts a number.

## `direction`

```ts
ticker('#headlines', { direction: 'right' })
```

`left` animates from the initial position toward negative `--ticker-distance`. `right` starts at negative distance and returns to the initial position.

## `pauseOnHover`

```ts
ticker('#offers', { pauseOnHover: true })
```

Pauses the track while the wrapper is hovered. This is a pointer convenience; provide application-level controls when users must be able to stop essential moving content.

## `interactiveClones`

```ts
ticker('#products', { interactiveClones: true })
```

The default hides clones from assistive technology, removes them from keyboard interaction, and disables clone pointer events. `true` deliberately disables those protections. Review [Accessibility](accessibility.md) before enabling it.

## `class`

```ts
const partners = ticker('#partners', { class: 'partner-strip theme-light' })
partners?.update({ class: 'partner-strip theme-dark' })
```

When updated, the controller removes tokens from its previous `class` option and applies the new normalized tokens. Classes added independently by application code remain. The required `ticker-wrapper` class is runtime-owned and cannot be supplied through this option.

---

## Partial updates

`update()` shallow-merges into current normalized options. Omitted fields keep their previous values:

```ts
const partners = ticker('#partners', { duration: 18, pauseOnHover: true })
partners?.update({ direction: 'right' })
```

`instance.options` returns a new read-only snapshot. Mutating it does not change runtime behavior.

---

## Declarative attributes

Complete markup initialized through `mount()` or adopted through `ticker()` uses these attributes:

| Attribute                 | Accepted value                           | Normalized fallback |
| ------------------------- | ---------------------------------------- | ------------------- |
| `data-duration`           | Positive numeric text.                   | `20`                |
| `data-direction`          | `right`; all other values become `left`. | `left`              |
| `data-pause-on-hover`     | Exact string `true` enables it.          | `false`             |
| `data-interactive-clones` | Exact string `true` enables it.          | `false`             |

The runtime also owns these outputs:

| Output              | Meaning                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `data-ready`        | `false` while geometry is pending; `true` after a successful build. |
| `data-active`       | Intersection state. `false` pauses animation.                       |
| `--ticker-duration` | Normalized duration with an `s` unit.                               |
| `--ticker-distance` | Measured content width plus computed track gap.                     |

## Defaults export

`DEFAULT_OPTIONS` contains `duration`, `direction`, `pauseOnHover`, and `interactiveClones`. It does not contain `class`; controller normalization adds `class: ''`. See [Core](core.md).
