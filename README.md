# @samline/ticker

<a id="ticker"></a>

An accessible, dependency-free ticker for JavaScript, TypeScript and plain HTML. Enhance existing markup with an owned controller or initialize declarative tickers at page level.

[Demo](https://samline.github.io/ticker/) · [Examples](https://samline.github.io/ticker/examples/) · [Documentation](https://samline.github.io/ticker/docs/) · [Changelog](CHANGELOG.md)

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [HTML / CDN](#html--cdn)
- [Capabilities](#capabilities)
- [API at a glance](#api-at-a-glance)
- [Documentation](#documentation)
- [Changelog](#changelog)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

## Installation

```bash
npm install @samline/ticker
```

```bash
pnpm add @samline/ticker
```

```bash
bun add @samline/ticker
```

Requires Node 20+ when bundling. Runtime target is ES2020.

Import the stylesheet once in your application entrypoint:

```ts
import '@samline/ticker/style.css'
```

## Quick start

```html
<div id="news-ticker">
  <a href="/one">First story</a>
  <a href="/two">Second story</a>
</div>
```

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'

const news = ticker('#news-ticker', {
  duration: 20,
  direction: 'left',
  pauseOnHover: true,
})

news?.update({ duration: 30 })
news?.refresh()
news?.destroy()
```

What this does:

- Enhances the existing element and returns an element-scoped controller.
- Measures its content and creates enough visual clones to fill the viewport.
- Preserves fractional widths and horizontal gaps so repeated content aligns at each loop reset.
- Hides repeated content from assistive technology and keyboard navigation by default.
- Reuses visual clones when responsive measurements are unchanged and pauses animation outside the viewport or while the document is hidden.
- Restores the original source element when `destroy()` runs.

### Seamless loops

The runtime preserves fractional measurements in both directions. Match item spacing to the horizontal track gap and include any decorative separator at the end of the sequence. See [Styling: seamless loops](https://samline.github.io/ticker/docs/reference/styling/#seamless-loops) for the CSS pattern.

## HTML / CDN

<a id="cdn--browser"></a>

Choose **Package / ESM** when installing with npm, pnpm or bun and importing Ticker in your application. Choose **HTML / CDN** when loading the standalone script in plain HTML, WordPress or Shopify without a bundler. Both use the same controller API. A CDN only delivers the files; you can self-host the same script and stylesheet.

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.2.0/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.2.0/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.2.0` with the version you ship.

The standalone script (an IIFE) exposes `window.Ticker`. “Global” describes this object, not another loading mode. The optional `@samline/ticker/browser` registry module is an ESM/CJS import and does not install that object. See [loading terms](https://samline.github.io/ticker/docs/guides/html-and-browser/#loading-terms).

```html
<div id="news"><a href="/news">Latest story</a></div>

<script>
  const news = window.Ticker.ticker('#news', {
    duration: 24,
    pauseOnHover: true,
  })

  news?.update({ duration: 30 })
</script>
```

For optional ID-based ownership, `window.Ticker.newTicker({ id, options })` creates a registry entry; `destroyTicker(id)` removes it. A direct `ticker()` controller is unregistered and uses its own `destroy()`. See [Registry reference](https://samline.github.io/ticker/docs/reference/browser/) for the complete browser API.

## Capabilities

<a id="what-you-can-build"></a>

- News, announcement, logo, sponsor, and promotion tickers.
- Progressive enhancement for server-rendered or CMS-owned markup.
- Responsive marquees that remeasure after fonts, layout, or content change.
- Browser-global integrations for WordPress, Shopify, and plain HTML.
- Declarative tickers that are discovered as the DOM changes.

## API at a glance

| Group                 | API                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller factory    | [`ticker()`](https://samline.github.io/ticker/docs/reference/api/ticker/)                                                                                                                                                                                    |
| Controller lifecycle  | [`update()`](https://samline.github.io/ticker/docs/reference/api/update/) · [`refresh()`](https://samline.github.io/ticker/docs/reference/api/refresh/) · [`destroy()`](https://samline.github.io/ticker/docs/reference/api/destroy/)                        |
| Declarative lifecycle | [`mount()`](https://samline.github.io/ticker/docs/reference/api/mount/) · [`refresh()`](https://samline.github.io/ticker/docs/reference/api/refresh/#declarative-page-refresh) · [`unmount()`](https://samline.github.io/ticker/docs/reference/api/unmount/) |
| Browser registry      | [`newTicker()` and registry helpers](https://samline.github.io/ticker/docs/reference/api/browser-registry/)                                                                                                                                                  |
| Configuration         | [`TickerOptions`](https://samline.github.io/ticker/docs/reference/configuration/)                                                                                                                                                                            |
| Core utilities        | [Defaults, state factories, and validators](https://samline.github.io/ticker/docs/reference/core/)                                                                                                                                                           |
| Types                 | [TypeScript reference](https://samline.github.io/ticker/docs/reference/typescript/)                                                                                                                                                                          |

The controller exposes `element`, `source`, `state`, and an immutable options snapshot. Playback, navigation, events and viewport rules are documented in the [controller reference](https://samline.github.io/ticker/docs/reference/api/controller/). `update()` and instance `refresh()` are chainable; `destroy()` owns teardown and restoration.

See the complete [API reference](https://samline.github.io/ticker/docs/reference/api/).

### Entrypoints

| Entrypoint                       | When to use                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `@samline/ticker`                | Main API, browser singleton, types, defaults, and validators. |
| `@samline/ticker/vanilla`        | `ticker()` plus declarative page lifecycle helpers.           |
| `@samline/ticker/browser`        | ESM/CJS browser registry without a global side effect.        |
| `@samline/ticker/browser/global` | Pre-bundled IIFE that installs `window.Ticker`.               |
| `@samline/ticker/core`           | Types, defaults, state factories, and validation helpers.     |
| `@samline/ticker/style.css`      | Required layout, animation, and reduced-motion styles.        |

The main entrypoint also exports `browser`, the same registry singleton used by the browser module, without installing `window.Ticker`. See [Browser integration](https://samline.github.io/ticker/docs/reference/browser/#module-singleton).

### Playback, navigation and responsive motion

```ts
const news = ticker('#news', {
  speed: 40, // CSS pixels per second; takes precedence over duration.
  direction: 'auto', // Inherited LTR moves left; inherited RTL moves right.
  autoplay: false,
  navigation: true,
  responsive: [{ query: '(width < 48rem)', options: { speed: 24 } }],
})
news?.play()
news?.pause()
news?.scrollBy(120) // Instant logical distance; wraps and leaves playback paused.
const unsubscribe = news?.on('playback', state => console.log(state.playing, state.reasons))
```

`direction` also accepts physical `left`/`right` and vertical `up`/`down`. Give vertical wrappers an explicit height. `pauseOnFocus` defaults to true; manual pause survives environmental and breakpoint changes. `play()` respects reduced motion, document visibility and viewport intersection. Attach application-owned native buttons and a labelled range using `connectControls({ previous, next, rail })`; `navigation: true` enables touch/mouse dragging without blocking perpendicular page scroll. Set `resumeAfterDrag: true` to restore prior playback intent on release; a manual pause remains paused and hover/focus pauses still apply. Responsive rules use viewport media queries in array order over the current base configuration. The same typed controller is returned by Package / ESM and HTML / CDN factories, with equivalent declarative data attributes. Compare enabled/disabled resumption in the [drag example](https://samline.github.io/ticker/examples/#drag-playback); its control calls `update({ resumeAfterDrag })` without changing playback intent.

Content stays application-owned: add or remove original nodes through `source`, then call `refresh()`. Use `speed` to keep a dynamic feed steady as it grows or shrinks; an empty feed can be repopulated and refreshed.

See [configuration](https://samline.github.io/ticker/docs/reference/configuration/) for normalization, RTL and rule precedence, and [controller contracts](https://samline.github.io/ticker/docs/reference/api/controller/) for events, keyboard controls and cleanup.

### Smooth arrow steps

Create native `#previous` and `#next` buttons beside the Quick start source.
This is an alternative setup; do not initialize that source twice.

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'

const strip = ticker('#news-ticker', { navigation: true, autoplay: true })
const disconnect = strip?.connectControls({
  previous: document.querySelector<HTMLButtonElement>('#previous')!,
  next: document.querySelector<HTMLButtonElement>('#next')!,
  itemsPerStep: 1,
  behavior: 'smooth',
  duration: 300,
  preservePlayback: true,
})
```

Arrows reveal one incoming item by default, including a partially hidden item. Set
`itemsPerStep: 2` to request two; movement stops before the first incoming item
would leave the opposite edge. Set CSS `scroll-padding` on the wrapper to reserve
space for edge fades or overlays. A positive pixel `step` overrides item stepping.
Rapid clicks in the same direction add steps to the pending destination. Changing
direction discards that destination and steps from the currently visible position.
Each click retargets the smooth movement without jumping; `duration` runs from the
latest click. Rail arrow keys follow the same policy.

Use your existing controller instead of resuming on every `navigate` event.
`preservePlayback` retains manual pause as well as autoplay. Item arrows default
to smooth movement on both axes; pixel seeks and explicit pixel steps remain instant
by default. Navigation pauses playback unless preservation is enabled. Reduced motion always seeks instantly.
See the controller documentation for cancellation and `navigationSource` events.

## Documentation

Read the full guides and API reference in the **[documentation](https://samline.github.io/ticker/docs/)**. Explore **[working examples](https://samline.github.io/ticker/examples/)** with complete HTML / CDN and npm code to copy and adapt.

| Doc                                                                             | Purpose                                                        |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [Installation](https://samline.github.io/ticker/docs/getting-started/)          | Installation, first ticker, ownership, and lifecycle.          |
| [Configuration](https://samline.github.io/ticker/docs/reference/configuration/) | Every option, default, normalization rule, and data attribute. |
| [Browser integration](https://samline.github.io/ticker/docs/reference/browser/) | Optional ID-based ownership for either loading setup.          |
| [Entrypoints](https://samline.github.io/ticker/docs/reference/entrypoints/)     | Root, Vanilla, core, browser, global, and CSS exports.         |
| [Styling](https://samline.github.io/ticker/docs/reference/styling/)             | Required stylesheet, DOM contract, classes, and CSS variables. |
| [Accessibility](https://samline.github.io/ticker/docs/guides/accessibility/)    | Clone behavior, reduced motion, and interactive content.       |
| [Core utilities](https://samline.github.io/ticker/docs/reference/core/)         | Defaults, state factories, validators, and advanced contracts. |
| [TypeScript](https://samline.github.io/ticker/docs/reference/typescript/)       | Exported TypeScript types and their roles.                     |
| [API reference](https://samline.github.io/ticker/docs/reference/api/)           | Public functions and controller methods.                       |
| [Recipes](https://samline.github.io/ticker/docs/reference/examples/)            | Task-oriented integration and lifecycle recipes.               |

## Changelog

Read [CHANGELOG.md](CHANGELOG.md) or the [published changelog](https://samline.github.io/ticker/docs/changelog/) for release history and explicitly marked breaking changes. Review the notes before upgrading.

## AI agent skill

The public [Ticker skill](https://samline.github.io/ticker/skills/ticker/SKILL.md) teaches an agent how to choose a Ticker integration, load CSS, manage controllers, preserve accessible motion and avoid nonexistent APIs. It is self-contained and describes v2.2.0; agents must verify their installed version.

Download [SKILL.md](https://samline.github.io/ticker/skills/ticker/SKILL.md) into a `ticker/` folder in your agent's supported skill directory. For agents that discover project skills from `.agents/skills/`:

```sh
mkdir -p .agents/skills/ticker
curl --fail --location https://samline.github.io/ticker/skills/ticker/SKILL.md \
  --output .agents/skills/ticker/SKILL.md
```

When working from this repository, copy `skills/ticker/SKILL.md` instead. Keep the filename `SKILL.md`; ask the agent to use the Ticker skill to implement a marquee, announcement strip, logo row or another supported pattern. Discovery paths and explicit invocation syntax depend on the agent.

## License

MIT — [LICENSE.md](LICENSE.md).
