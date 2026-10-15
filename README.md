# Ticker

> An accessible, dependency-free ticker for Vanilla JavaScript, TypeScript, and plain HTML.

> Enhance existing markup, control each ticker through a small lifecycle API, or initialize declarative ticker markup at page level.

---

## Table of Contents

- [Installation](#installation)
- [CDN / Browser](#cdn--browser)
- [Entrypoints](#entrypoints)
- [Quick Start](#quick-start)
- [What You Can Build](#what-you-can-build)
- [API at a Glance](#api-at-a-glance)
- [Documentation](#documentation)
- [AI agent skill](#ai-agent-skill)
- [Website development](#website-development)
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
<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.0.4/dist/style.css" />
<script src="https://unpkg.com/@samline/ticker@2.0.4/dist/browser/global.global.js"></script>
```

> Pin the version in production. Replace `2.0.4` with the version you ship.

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

The controller exposes `element`, `source`, and an immutable options snapshot. `update()` and instance `refresh()` are chainable; `destroy()` owns teardown and restoration.

See the complete reference in [the complete API](docs/src/content/docs/reference/api.md).

---

## Documentation

Full guides and the same reference are available at **[samline.github.io/ticker/docs](https://samline.github.io/ticker/docs/)**.

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

## License

MIT

## Website development

Home, Examples and Docs are one website, built as two Astro 7 applications with shared components and Tailwind 4 tokens:

| Destination      | Source                             | Public URL                                                                   |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Home             | `landing/src/pages/index.astro`    | [Landing](https://samline.github.io/ticker/)                                 |
| Working examples | `landing/src/pages/examples.astro` | [Examples](https://samline.github.io/ticker/examples/)                       |
| Documentation    | `docs/src/content/docs/`           | [Docs](https://samline.github.io/ticker/docs/)                               |
| Agent skill      | `skills/ticker/SKILL.md`           | [Download SKILL.md](https://samline.github.io/ticker/skills/ticker/SKILL.md) |

The website requires Node 22.12+; the runtime package's bundling requirement remains Node 20+. Install shared tooling before both applications:

```sh
npm ci --prefix shared
npm ci --prefix landing
npm ci --prefix docs
npm run landing:dev
# In a second terminal:
npm run docs:dev
```

Home's demo keeps announcements, logos and prices in separate tabs, with independent speed settings. Examples reuses that same TickerDemo, BrandLogo, SpeedControl and demo presentation, alongside shared buttons, headings, tabs and code-copy controls. Previews are native components, not iframes. Six recipes provide complete CDN and npm/ESM HTML files; preview changes do not rewrite the copied initial settings. See [integration recipes](https://samline.github.io/ticker/docs/reference/examples/) for deeper lifecycle patterns.

Reusable Astro primitives, UI catalogs, helpers and theme tokens live in [`shared/`](shared/README.md). App folders own content and composition. Preserve scoped component styles/scripts, rem lengths, class:list, translated interface text and the existing Box widths. [AGENTS.md](AGENTS.md) records accepted project decisions and mistakes to avoid; read the app-specific contracts before editing.

```sh
npm run landing:check
npm run docs:check
npm --prefix landing run format:check
npm --prefix docs run format:check
npm run site:build
npm --prefix landing run test:browser
npm run site:test:browser
```

`site:build` builds docs, includes their output under the landing artifact, merges sitemaps and audits local links, anchors, assets and redirects. GitHub Pages deploys that artifact with `/ticker/` as its base. Do not deploy docs over the landing root. Search is local Pagefind generated from the maintained Content Collection; Starlight is retired. The docs preserve all 23 articles and the inventory of 33 former sources.

Docs use per-article canonical/share metadata, WebPage/TechArticle/BreadcrumbList structured data, semantic navigation, named main content, keyboard-accessible code copying and search, and light/dark themes. Browser checks cover all articles' metadata and automated accessibility in both themes; they complement keyboard, responsive and reduced-motion checks, not a complete accessibility certification.

See [landing maintenance](landing/README.md), [docs maintenance](docs/README.md), and [shared ownership](shared/README.md). When package options, lifecycle, version or exports change, review the skill, copied examples, documentation, landing claims and tests together. Route/theme/component changes require checking all affected destinations. The npm package includes runtime distribution and maintained documentation prose, excluding website dependencies, generated assets and the website-only skill download endpoint.

## AI agent skill

The public [Ticker skill](skills/ticker/SKILL.md) teaches an agent how to choose a Ticker integration, load CSS, manage controllers, preserve accessible motion and avoid nonexistent APIs. It is self-contained and describes v2.0.4; agents must verify their installed version.

Download [SKILL.md](https://samline.github.io/ticker/skills/ticker/SKILL.md) into a `ticker/` folder in your agent's supported skill directory. For agents that discover project skills from `.agents/skills/`:

```sh
mkdir -p .agents/skills/ticker
curl --fail --location https://samline.github.io/ticker/skills/ticker/SKILL.md \
  --output .agents/skills/ticker/SKILL.md
```

When working from this repository, copy `skills/ticker/SKILL.md` instead. Keep the filename `SKILL.md`; ask the agent to use the Ticker skill to implement a marquee, announcement strip, logo row or another supported pattern. Discovery paths and explicit invocation syntax depend on the agent.

The download is generated directly from that source file. Update its version, contracts, links and examples with package changes, validate the skill, and rebuild the website. Do not maintain a second public copy by hand.
