# Ticker documentation

Custom Astro 7 + Tailwind 4 documentation at `https://samline.github.io/ticker/docs/`. The former Starlight `example/` project has been removed. The sibling landing remains at `/ticker/`; GitHub Pages receives one combined artifact.

## Local development and validation

Use Node >=22.12.0 and npm. From the repository root:

```sh
npm ci --prefix shared
npm ci --prefix docs
npm run docs:dev
npm run docs:check
npm --prefix docs run format:check
npm run docs:build
npm run docs:test:browser
npm run site:build
npm run site:test:browser
```

The browser suite uses Chromium; install it with `npm exec --prefix docs -- playwright install chromium` when necessary. Search is generated after `astro build`; use the built preview (`npm --prefix docs run preview`) to test it. An unbuilt dev server has no generated search index and displays a recoverable search message.

## Architecture

`src/content/docs/` is the only maintained documentation source. Astro content collections validate frontmatter and render Markdown, headings and syntax highlighting. The official `@astrojs/markdown-remark` processor is configured through `markdown.processor`, so the accessible-overflow rehype plugin runs without deprecated configuration keys. The catch-all route preserves every published page path and relevant fragment. The shell has grouped navigation, an article, a responsive table of contents and previous/next navigation. Mobile navigation delegates modal behavior to `@samline/drawer`.

Reusable controls live in `../shared/components/`, docs integrations in `src/components/`, the document shell in `src/layouts/`, and UI strings in `src/i18n/translations/en/`. Article prose and example strings belong to Markdown. There is no runtime UI framework. Component styles and scripts stay inside their Astro components, using scoped selectors and instance-owned custom elements.

The docs import the shared `shared/styles/theme.css` tokens, Box, Theme, ThemeToggle and CopyButton intentionally. This keeps colors, breakpoints, container conventions, theme persistence and clipboard feedback consistent. `Article` wraps each rendered Markdown/MDX fence with a template of the shared CodeFrame, which owns the toolbar and CopyButton; code remains readable and highlighted without JavaScript. Syntax highlighting uses the same `shared/lib/code-theme.mjs` configuration as CodeFrame in Home/Examples; Article preserves its generated token spans. The build-time rehype plugin makes overflowing code and tables keyboard reachable even without JavaScript.

## Search

Pagefind indexes only `data-pagefind-body` article content after the static build. Navigation, table of contents, and pagination are excluded. Search loads its module and index on first opening, uses the `/ticker/docs/` base URL, returns page/heading links and provides empty/error feedback. Queries stay in the browser: there is no search server, external search service or API key. Search opens a top Drawer using the installed `@samline/drawer` package. Its native trigger, animation, focus, scroll lock, Escape/backdrop dismissal and cleanup are delegated to the package. Ctrl/Command K only toggles the controller. There is no separate dialog implementation or copied animation. Without JavaScript, the complete navigation and articles remain available.

## Content coverage and changes

`migration-coverage.json` accounts for 18 original repository documents and 15 Starlight pages, consolidated into 23 maintained pages. It records original hashes as migration evidence, not as hashes of current content. Overlapping material has a canonical guide; detailed API pages preserve controller, manager and registry contracts.

`check-coverage.mjs` traverses the current public TypeScript export surfaces and checks their names appear in content, validates named package imports in JavaScript/TypeScript fences, and rejects outdated pinned CDN versions and leftover Starlight markup. This catches omissions but cannot prove prose is semantically correct. Review behavior against package source and execute relevant examples whenever contracts change. Signature reference blocks are illustrative API notation, not standalone programs.

`check-site.mjs` validates every built local documentation link, fragment, asset, canonical URL, search bundle and sitemap. Landing links and metadata are validated in the combined release build. The `site:test:browser` command runs the same docs checks against the combined landing artifact. Browser checks cover exact copying/reset, lazy search and navigation, both themes, narrow/enlarged layouts, keyboard accessibility, Drawer focus/scroll restoration, anchors and no-JavaScript content.

When changing a public API, update its guide, granular API page, types/configuration/styling references and recipes together. When releasing a version, update pinned CDN examples as well as derived labels. When adding/removing a page, update the translation catalog navigation, relevant content links, landing `docsRoutes`, redirects and coverage records. Preserve useful public fragments or provide an explicit compatibility destination. Never ship an obsolete second set of Markdown files for convenience.

## Publication and replication

`docs/astro.config.mjs` owns the public origin and `/ticker/docs/` base. The root `site:build` builds docs first, then the landing. `landing/scripts/include-docs.mjs` copies `docs/dist/` into `landing/dist/docs/` and merges sitemap entries. The Pages workflow builds the same artifact. The npm package allowlist includes maintained Markdown, not the Astro project, dependencies, search index or generated pages.

To replicate for another package, replace package metadata, public API imports and examples, content, UI catalog, namespace/storage keys, origin/base, social image, landing links, shared component/theme imports and validation paths. Keep static search and deployment together. If the sites become separate repositories, extract the intentionally shared theme/controls into a small shared package rather than copying diverging implementations.

Re-run the full checks after changes to Astro, Tailwind, Pagefind or Drawer. Review their native APIs before adding integration code. Keep this file and AGENTS.md current whenever commands, ownership, routes, deployment or testing requirements change.

## Landing conventions, collections and translations

Docs are a companion to the landing. Header uses its Logo, Box, Button and ThemeToggle, and aligns its search/resource controls with that visual language. Header behavior/styles live in `layouts/Header.astro`; article heading, sidebar and article footer are complete owned blocks in `sections/`. `DocsLayout` composes the document, SEO and those blocks. Component CSS and scripts remain scoped and local; authored feedback uses the shared duration/easing tokens, with reduced-motion overrides. Drawer owns functional movement.

The content collection is validated at build time. Every article declares non-empty title/description, `locale`, and `sidebar.group`/`sidebar.order`. Explicit `generateId` preserves `index` source IDs so route, catalog and current-page lookup agree. `getNavigation()` queries the collection, filters the locale, validates unique order positions and resolves translated labels; it does not maintain a second page list. `getStaticPaths()` and `render()` consume these same entries. Add metadata and the catalog page label when adding an article; missing labels or duplicate positions fail the build.

English is the only published locale. Astro config declares it explicitly. UI copy is split into common, navigation, controls and SEO catalogs, resolved through typed `getI18n(Astro)` with regional-tag normalization and a safe default, through shared `createI18n`/`TranslationShape`, following the landing. Structural route IDs are catalog keys, never translated values. Markdown contains the article prose, while the schema declares its language. Adding another catalog alone does not publish translated documentation: add translated collection entries, supported locale/schema and prefixed routes/links/search/metadata together before exposing another language.

[The dated content audit](CONTENT-AUDIT.md) records the review of all original sources and the recovered CSS-contract details. Keep the migration inventory and this review context when reorganizing content.

## Installed skills

`npx autoskills -y` was executed inside `docs/` using autoskills 0.4.1. Nine upstream skills are versioned under `.agents/skills/`; `skills-lock.json` records sources and hashes. Applied Astro (official collection/i18n APIs), Tailwind (shared tokens and responsive layout), frontend-design (continuity with the existing landing), accessibility (native controls/focus/overflow), and Playwright (role-based, retrying browser assertions). SEO and TypeScript guidance informed component metadata and typed catalogs. The two Node backend skills are installed discovery results; this static site needs no backend.

Do not reformat or rewrite upstream skill content or computed hashes. Review installer/lock diffs when refreshing skills. The user's requirements and actual Astro 7/package contracts override generic framework/version/font examples in a skill.

Reusable primitives live in `../shared/components/`: Icon, IconButton (composing the shared Button), TextField and LinkCard own their markup and scoped styles. SearchResultCard composes LinkCard and provides the inert result template that Search clones; the client script only fills its escaped text/URL fields. Pagination uses the same LinkCard. DrawerStyles centralizes the vendor stylesheet adaptation for both menus without copying animations. Close buttons rendered by Drawer remain package-owned.

The collection/i18n design follows the official [Content Collections guide](https://docs.astro.build/en/guides/content-collections/) and [i18n recipe](https://docs.astro.build/en/recipes/i18n/): validated build-time entries supply typed data and Markdown rendering, while interface catalogs and content language remain separate responsibilities.

## Shared site foundations

Read [shared/README.md](../shared/README.md) for component ownership, tokens, catalog location, setup and cross-site validation. Install shared tooling before either app. Both format commands include shared source and use the root Prettier configuration. The source-copy audit scans landing, docs and shared components. Never recreate a shared primitive here or import its implementation from the sibling app.

Search remains specific to docs: use a content-sized square top Drawer capped at 44rem/viewport minus 1rem, keep intro/input/close fixed and scroll results independently. Query after 300ms, retain previous results while typing/loading and discard stale responses. Clear immediately on empty input. Use the native upward handle with handleOnly, plus close/Escape/backdrop alternatives; do not add height measurement or gesture/focus-trap code. Test focus and unchanged background scroll after close.

The ToC tracks the last heading at the header plus 2.5rem boundary, nested headings and the document end. Both instances use aria-current="location" and the same NavLink. Lists inset current backgrounds from the rail; scroll tracking must not rewrite the URL or move focus.

## Component-rich articles

The collection accepts `.md` and `.mdx`. The official `@astrojs/mdx` integration inherits the unified processor, syntax theme and accessible-overflow plugin. Getting started uses shared Tabs/TabPanel for npm, pnpm, yarn, bun, CDN and module/global initialization; entrypoints uses the same tabs for ESM/CommonJS. Overview and next steps compose shared CardGrid/LinkCard; the lifecycle note uses Callout/Surface. These are actual Astro components, with no React runtime or duplicated tab script.

Keep alternative examples in tabs and consecutive instructions visible. No-JavaScript renders every option with its own label; keyboard selection, exact copying and original installation fragments must work. The migration inventory and coverage scanner include both extensions, while routes remain stable. Update imports, inventory destinations and package checks when changing an article's extension. All 33 original-source records remain intact.

## Link integrity

Both builds use `shared/scripts/check-links.mjs`. It checks live anchors, assets, relative and absolute same-origin destinations, fragments, deployment bases, duplicate IDs and static redirects; inert search templates are excluded. The combined build checks landing and docs together. HTTP checks are a separate online review: authentication redirects and anti-bot responses are not evidence that an action works. Reader footers intentionally provide pagination without an unverified GitHub editing action. Keep link labels and destinations aligned; prefer detailed API pages for contextual references.

Source cleanup retains all 23 maintained articles and all 33 migration records. There is no parallel legacy documentation tree. Metadata uses shared/lib/serialize.ts rather than importing landing internals; app catalogs remain independent while their locale resolution is shared. Keep native fallback menus, search result templates and vendor-driven state/clone selectors: these are live behavior even when static import tools cannot see their consumers. Follow shared/AGENTS.md before deleting source or generated hooks.

The companion `/ticker/examples/` gallery provides six working, complete recipes with CDN and npm/ESM files. `ExamplesLink` composes the shared LinkCard in desktop/mobile navigation; overview and recipe content link to the same gallery. The existing reference/examples article retains advanced integration patterns and published fragments. A standalone docs build defers its two sibling landing paths to the combined artifact audit; deployment must build both sites.

## Article discovery and accessibility

Every collection article receives its own canonical, title, description, social image metadata and safe WebPage/TechArticle/BreadcrumbList JSON-LD. Do not invent publication dates, ratings or accessibility certification. Breadcrumbs identify the current page semantically; main is named by its h1, and table-of-contents navigation is labelled. Keep locale/social copy in translations and URLs derived from site/base configuration.

The browser suite audits all 23 articles' metadata and runs axe WCAG A/AA plus best-practice checks in both themes, in addition to the existing keyboard, search, no-JavaScript, reduced-motion and responsive tests. Preserve those checks when adding or moving content; automated success is not a complete accessibility audit.
