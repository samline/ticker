# Ticker

> An accessible, dependency-free ticker for Vanilla JavaScript, TypeScript, and plain HTML.

> Enhance existing markup, control each ticker through a small lifecycle API, or initialize declarative ticker markup at page level.

[Demo](https://samline.github.io/ticker/)

---

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [Seamless Loops](#seamless-loops)
- [What You Can Build](#what-you-can-build)
- [API at a Glance](#api-at-a-glance)
- [Documentation](#documentation)
- [AI agent skill](#ai-agent-skill)
- [License](#license)

---

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

---

## CDN / Browser

Use the browser build when you do not have a bundler and need to run the package directly in HTML, WordPress, Shopify, or a traditional server-rendered template.

```html
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.1.0/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.1.0/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.1.0` with the version you ship.

The browser bundle exposes a single global: `window.Ticker`.

```html
<div id="news"><a href="/news">Latest story</a></div>

<script>
  const news = window.Ticker.newTicker({
    id: 'news',
    options: { duration: 24, pauseOnHover: true },
  })

  news?.update({ duration: 30 })
</script>
```

The browser surface keeps a registry under `Ticker.available`, keyed by the id passed to `newTicker()`. See [Browser integration](docs/src/content/docs/reference/browser.md) for the complete browser API.

---

## Entrypoints

| Entrypoint                       | When to use                                                   |
| -------------------------------- | ------------------------------------------------------------- |
| `@samline/ticker`                | Main API, browser singleton, types, defaults, and validators. |
| `@samline/ticker/vanilla`        | `ticker()` plus declarative page lifecycle helpers.           |
| `@samline/ticker/browser`        | ESM/CJS browser registry without a global side effect.        |
| `@samline/ticker/browser/global` | Pre-bundled IIFE that installs `window.Ticker`.               |
| `@samline/ticker/core`           | Types, defaults, state factories, and validation helpers.     |
| `@samline/ticker/style.css`      | Required layout, animation, and reduced-motion styles.        |

The main entrypoint also exports `browser`, the same registry singleton used by the browser module, without installing `window.Ticker`. See [Browser integration](docs/src/content/docs/reference/browser.md#module-singleton).

---

## Quick Start

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

---

## Seamless Loops

The runtime preserves fractional measurements in both directions. Match item spacing to the horizontal track gap and include any decorative separator at the end of the sequence. See [Styling: seamless loops](docs/src/content/docs/reference/styling.md#seamless-loops) for the CSS pattern.

---

## What You Can Build

- News, announcement, logo, sponsor, and promotion tickers.
- Progressive enhancement for server-rendered or CMS-owned markup.
- Responsive marquees that remeasure after fonts, layout, or content change.
- Browser-global integrations for WordPress, Shopify, and plain HTML.
- Declarative tickers that are discovered as the DOM changes.

---

## API at a Glance

| Group                 | API                                                                                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Controller factory    | [`ticker()`](docs/src/content/docs/reference/api/ticker.md)                                                                                                                                                        |
| Controller lifecycle  | [`update()`](docs/src/content/docs/reference/api/update.md) · [`refresh()`](docs/src/content/docs/reference/api/refresh.md) · [`destroy()`](docs/src/content/docs/reference/api/destroy.md)                        |
| Declarative lifecycle | [`mount()`](docs/src/content/docs/reference/api/mount.md) · [`refresh()`](docs/src/content/docs/reference/api/refresh.md#declarative-page-refresh) · [`unmount()`](docs/src/content/docs/reference/api/unmount.md) |
| Browser registry      | [`newTicker()` and registry helpers](docs/src/content/docs/reference/api/browser-registry.md)                                                                                                                      |
| Configuration         | [`TickerOptions`](docs/src/content/docs/reference/configuration.md)                                                                                                                                                |
| Core utilities        | [Defaults, state factories, and validators](docs/src/content/docs/reference/core.md)                                                                                                                               |
| Types                 | [TypeScript reference](docs/src/content/docs/reference/typescript.md)                                                                                                                                              |

The controller exposes `element`, `source`, `state`, and an immutable options snapshot. Playback, navigation, events and viewport rules are documented in the [controller reference](docs/src/content/docs/reference/api/controller.md). `update()` and instance `refresh()` are chainable; `destroy()` owns teardown and restoration.

See the complete [API reference](docs/src/content/docs/reference/api.md).

---

## Playback, navigation and responsive motion

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

`direction` also accepts physical `left`/`right` and vertical `up`/`down`. Give vertical wrappers an explicit height. `pauseOnFocus` defaults to true; manual pause survives environmental and breakpoint changes. `play()` respects reduced motion, document visibility and viewport intersection. Attach application-owned native buttons and a labelled range using `connectControls({ previous, next, rail })`; `navigation: true` enables touch/mouse dragging without blocking perpendicular page scroll. Set `resumeAfterDrag: true` to restore prior playback intent on release; a manual pause remains paused and hover/focus pauses still apply. Responsive rules use viewport media queries in array order over the current base configuration. The same typed controller is returned by Vanilla and browser/CDN factories, with equivalent declarative data attributes. Compare enabled/disabled resumption in the [drag example](https://samline.github.io/ticker/examples/#drag-playback); its control calls `update({ resumeAfterDrag })` without changing playback intent.

Content stays application-owned: add or remove original nodes through `source`, then call `refresh()`. Use `speed` to keep a dynamic feed steady as it grows or shrinks; an empty feed can be repopulated and refreshed.

See [configuration](docs/src/content/docs/reference/configuration.md) for normalization, RTL and rule precedence, and [controller contracts](docs/src/content/docs/reference/api/controller.md) for events, keyboard controls and cleanup.

---

## Documentation

Read the full guides and API reference in the **[documentation](https://samline.github.io/ticker/docs/)**. Explore **[working examples](https://samline.github.io/ticker/examples/)** with complete HTML / CDN and npm code to copy and adapt.

| Doc                                                               | Purpose                                                        |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| [Installation](docs/src/content/docs/getting-started.mdx)         | Installation, first ticker, ownership, and lifecycle.          |
| [Configuration](docs/src/content/docs/reference/configuration.md) | Every option, default, normalization rule, and data attribute. |
| [Browser integration](docs/src/content/docs/reference/browser.md) | Browser global and bundler-friendly registry usage.            |
| [Entrypoints](docs/src/content/docs/reference/entrypoints.mdx)    | Root, Vanilla, core, browser, global, and CSS exports.         |
| [Styling](docs/src/content/docs/reference/styling.md)             | Required stylesheet, DOM contract, classes, and CSS variables. |
| [Accessibility](docs/src/content/docs/guides/accessibility.md)    | Clone behavior, reduced motion, and interactive content.       |
| [Core utilities](docs/src/content/docs/reference/core.md)         | Defaults, state factories, validators, and advanced contracts. |
| [TypeScript](docs/src/content/docs/reference/typescript.md)       | Exported TypeScript types and their roles.                     |
| [API reference](docs/src/content/docs/reference/api.md)           | Public functions and controller methods.                       |
| [Recipes](docs/src/content/docs/reference/examples.md)            | Task-oriented integration and lifecycle recipes.               |

---

## AI agent skill

The public [Ticker skill](skills/ticker/SKILL.md) teaches an agent how to choose a Ticker integration, load CSS, manage controllers, preserve accessible motion and avoid nonexistent APIs. It is self-contained and describes v2.1.0; agents must verify their installed version.

Download [SKILL.md](https://samline.github.io/ticker/skills/ticker/SKILL.md) into a `ticker/` folder in your agent's supported skill directory. For agents that discover project skills from `.agents/skills/`:

```sh
mkdir -p .agents/skills/ticker
curl --fail --location https://samline.github.io/ticker/skills/ticker/SKILL.md \
  --output .agents/skills/ticker/SKILL.md
```

When working from this repository, copy `skills/ticker/SKILL.md` instead. Keep the filename `SKILL.md`; ask the agent to use the Ticker skill to implement a marquee, announcement strip, logo row or another supported pattern. Discovery paths and explicit invocation syntax depend on the agent.

---

## License

MIT
