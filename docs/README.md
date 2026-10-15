# Ticker documentation

Custom Astro 7 + Tailwind 4 documentation at `https://samline.github.io/ticker/docs/`. This replaces the Starlight site formerly in `example/`. The sibling landing remains at `/ticker/`; GitHub Pages receives one combined artifact.

## Local development and validation

Use Node >=22.12.0 and npm. From the repository root:

```sh
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

`src/content/docs/` is the only maintained documentation source. Astro content collections validate frontmatter and render Markdown, headings and syntax highlighting. The official `@astrojs/markdown-remark` processor is configured through `markdown.processor`, so the accessible-overflow rehype plugin runs without deprecated configuration keys. The catch-all route preserves every published page path and relevant fragment. The shell has grouped navigation, an article, a responsive table of contents, edit links and previous/next navigation. Mobile navigation delegates modal behavior to `@samline/drawer`.

Reusable controls live in `src/components/`, the document shell in `src/layouts/`, and UI strings in `src/i18n/translations/en/`. Article prose and example strings belong to Markdown. There is no runtime UI framework. Component styles and scripts stay inside their Astro components, using scoped selectors and instance-owned custom elements.

The docs import the shared `shared/styles/theme.css` tokens, Box, Theme, ThemeToggle and CopyButton intentionally. This keeps colors, breakpoints, container conventions, theme persistence and clipboard feedback consistent. `Article` wraps each rendered fence with a template of the shared CodeFrame, which owns the toolbar and CopyButton; code remains readable without JavaScript. The build-time rehype plugin makes overflowing code and tables keyboard reachable even without JavaScript.

## Search

Pagefind indexes only `data-pagefind-body` article content after the static build. Navigation, table of contents, pagination and edit controls are excluded. Search loads its module and index on first opening, uses the `/ticker/docs/` base URL, returns page/heading links and provides empty/error feedback. Queries stay in the browser: there is no search server, external search service or API key. Search opens a top Drawer using the installed `@samline/drawer` package. Its native trigger, animation, focus, scroll lock, Escape/backdrop dismissal and cleanup are delegated to the package. Ctrl/Command K only toggles the controller. There is no separate dialog implementation or copied animation. Without JavaScript, the complete navigation and articles remain available.

## Content coverage and changes

`migration-coverage.json` accounts for 18 original repository documents and 15 Starlight pages, consolidated into 23 maintained pages. It records original hashes as migration evidence, not as hashes of current content. Overlapping material has a canonical guide; detailed API pages preserve controller, manager and registry contracts.

`check-coverage.mjs` traverses the current public TypeScript export surfaces and checks their names appear in content, validates named package imports in JavaScript/TypeScript fences, and rejects outdated pinned CDN versions and leftover Starlight markup. This catches omissions but cannot prove prose is semantically correct. Review behavior against package source and execute relevant examples whenever contracts change. Signature reference blocks are illustrative API notation, not standalone programs.

`check-site.mjs` validates every built local documentation link, fragment, asset, canonical URL, search bundle and sitemap. Landing links and metadata are validated in the combined release build. The `site:test:browser` command runs the same docs checks against the combined landing artifact. Browser checks cover exact copying/reset, lazy search and navigation, both themes, narrow/enlarged layouts, keyboard accessibility, Drawer focus/scroll restoration, anchors and no-JavaScript content.

When changing a public API, update its guide, granular API page, types/configuration/styling references and recipes together. When releasing a version, update pinned CDN examples as well as derived labels. When adding/removing a page, update the translation catalog navigation, relevant content links, landing `docsRoutes`, redirects and coverage records. Preserve useful public fragments or provide an explicit compatibility destination. Never ship an obsolete second set of Markdown files for convenience.

## Publication and replication

`docs/astro.config.mjs` owns the public origin and `/ticker/docs/` base. The root `site:build` builds docs first, then the landing. `landing/scripts/include-docs.mjs` copies `docs/dist/` into `landing/dist/docs/` and merges sitemap entries. The Pages workflow builds the same artifact. The npm package allowlist includes maintained Markdown, not the Astro project, dependencies, search index or generated pages.

To replicate for another package, replace package metadata, public API imports and examples, content, UI catalog, namespace/storage keys, origin/base, edit URLs, social image, landing links, shared component/theme imports and validation paths. Keep static search and deployment together. If the sites become separate repositories, extract the intentionally shared theme/controls into a small shared package rather than copying diverging implementations.

Re-run the full checks after changes to Astro, Tailwind, Pagefind or Drawer. Review their native APIs before adding integration code. Keep this file and AGENTS.md current whenever commands, ownership, routes, deployment or testing requirements change.

## Landing conventions, collections and translations

Docs are a companion to the landing. Header uses its Logo, Box, Button and ThemeToggle, and aligns its search/resource controls with that visual language. Header behavior/styles live in `layouts/Header.astro`; article heading, sidebar and article footer are complete owned blocks in `sections/`. `DocsLayout` composes the document, SEO and those blocks. Component CSS and scripts remain scoped and local; authored feedback uses the shared duration/easing tokens, with reduced-motion overrides. Drawer owns functional movement.

The content collection is validated at build time. Every article declares non-empty title/description, `locale`, and `sidebar.group`/`sidebar.order`. Explicit `generateId` preserves `index` source IDs so route, catalog, edit URL and current-page lookup agree. `getNavigation()` queries the collection, filters the locale, validates unique order positions and resolves translated labels; it does not maintain a second page list. `getStaticPaths()` and `render()` consume these same entries. Add metadata and the catalog page label when adding an article; missing labels or duplicate positions fail the build.

English is the only published locale. Astro config declares it explicitly. UI copy is split into common, navigation, controls and SEO catalogs, resolved through typed `getI18n(Astro)` with regional-tag normalization and a safe default, following the landing. Structural route IDs are catalog keys, never translated values. Markdown contains the article prose, while the schema declares its language. Adding another catalog alone does not publish translated documentation: add translated collection entries, supported locale/schema and prefixed routes/links/search/metadata together before exposing another language.

[The dated content audit](CONTENT-AUDIT.md) records the review of all original sources and the recovered CSS-contract details. Keep the migration inventory and this review context when reorganizing content.

## Installed skills

`npx autoskills -y` was executed inside `docs/` using autoskills 0.4.1. Nine upstream skills are versioned under `.agents/skills/`; `skills-lock.json` records sources and hashes. Applied Astro (official collection/i18n APIs), Tailwind (shared tokens and responsive layout), frontend-design (continuity with the existing landing), accessibility (native controls/focus/overflow), and Playwright (role-based, retrying browser assertions). SEO and TypeScript guidance informed component metadata and typed catalogs. The two Node backend skills are installed discovery results; this static site needs no backend.

Do not reformat or rewrite upstream skill content or computed hashes. Review installer/lock diffs when refreshing skills. The user's requirements and actual Astro 7/package contracts override generic framework/version/font examples in a skill.

Reusable primitives live in `components/`: Icon, IconButton (composing the landing Button), TextField and LinkCard own their markup and scoped styles. SearchResultCard composes LinkCard and provides the inert result template that Search clones; the client script only fills its escaped text/URL fields. Pagination uses the same LinkCard. DrawerStyles centralizes the vendor stylesheet adaptation for both menus without copying animations. Close buttons rendered by Drawer remain package-owned.

The collection/i18n design follows the official [Content Collections guide](https://docs.astro.build/en/guides/content-collections/) and [i18n recipe](https://docs.astro.build/en/recipes/i18n/): validated build-time entries supply typed data and Markdown rendering, while interface catalogs and content language remain separate responsibilities.

## Shared code presentation and search continuity

The landing `CodeFrame` owns the filename/language toolbar, code surface, border, overflow and shared CopyButton. `CodeBlock` supplies the landing tokens; docs `Article` clones a frame template around rendered Markdown without changing code text. Preserve the landing `.code-block` hook. Do not fork clipboard feedback or frame styles. Shiki's Ticker theme maps syntax scopes directly to the shared semantic palette, so both color modes follow the same brand tokens. Check both sites after changing this shared component.

Docs reuse the landing eyebrow and font families, with serif article titles, Inter reading text and mono interface labels. Use existing feature/code surfaces for hierarchy rather than introducing another palette or animation system.

Search uses a content-sized square top Drawer, capped at 44rem or the viewport minus 1rem, with a fixed intro/input/close control and an independently scrolling results region. Keep the empty state compact and let CSS grow/shrink the panel with results; do not add JavaScript height measurement. Drawer 4.2.1 uses percentage transforms and reads current geometry at gesture start. Reduced-motion rules must only disable motion, not change sizing. The native handle closes upward (`showHandle` and `handleOnly`); input/results opt out of dragging. Drawer still owns gestures, animations, focus trapping and restoration. Search only assigns initial field focus after native mounting. Keep close, Escape and backdrop available as alternatives to dragging. Test deep result scrolling, upward dragging, focus restoration and unchanged background scroll together.

Search waits 300ms after the last input before querying. Keep previous results during typing and asynchronous loading, replacing the list only when the latest response is ready. Clearing the field resets immediately; stale requests must never overwrite newer input.
