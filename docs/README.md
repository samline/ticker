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

Reusable controls live in `src/components/`, the document shell in `src/layouts/`, and UI strings in `src/i18n/en.ts`. Article prose and example strings belong to Markdown. There is no runtime UI framework. Component styles and scripts stay inside their Astro components, using scoped selectors and instance-owned custom elements.

The docs import the shared `shared/styles/theme.css` tokens, Box, Theme, ThemeToggle and CopyButton intentionally. This keeps colors, breakpoints, container conventions, theme persistence and clipboard feedback consistent. `Article` attaches a template of the shared CopyButton to each fenced block; code remains readable without JavaScript. The build-time rehype plugin makes overflowing code and tables keyboard reachable even without JavaScript.

## Search

Pagefind indexes only `data-pagefind-body` article content after the static build. Navigation, table of contents, pagination and edit controls are excluded. Search loads its module and index on first opening, uses the `/ticker/docs/` base URL, returns page/heading links and provides empty/error feedback. Queries stay in the browser: there is no search server, external search service or API key. The search dialog supports native Escape and keyboard focus, Ctrl/Command K and visible close controls. Without JavaScript, the complete navigation and articles remain available.

## Content coverage and changes

`migration-coverage.json` accounts for 18 original repository documents and 15 Starlight pages, consolidated into 23 maintained pages. It records original hashes as migration evidence, not as hashes of current content. Overlapping material has a canonical guide; detailed API pages preserve controller, manager and registry contracts.

`check-coverage.mjs` traverses the current public TypeScript export surfaces and checks their names appear in content, validates named package imports in JavaScript/TypeScript fences, and rejects outdated pinned CDN versions and leftover Starlight markup. This catches omissions but cannot prove prose is semantically correct. Review behavior against package source and execute relevant examples whenever contracts change. Signature reference blocks are illustrative API notation, not standalone programs.

`check-site.mjs` validates every built local documentation link, fragment, asset, canonical URL, search bundle and sitemap. Landing links and metadata are validated in the combined release build. The `site:test:browser` command runs the same docs checks against the combined landing artifact. Browser checks cover exact copying/reset, lazy search and navigation, both themes, narrow/enlarged layouts, keyboard accessibility, Drawer focus/scroll restoration, anchors and no-JavaScript content.

When changing a public API, update its guide, granular API page, types/configuration/styling references and recipes together. When releasing a version, update pinned CDN examples as well as derived labels. When adding/removing a page, update the translation catalog navigation, relevant content links, landing `docsRoutes`, redirects and coverage records. Preserve useful public fragments or provide an explicit compatibility destination. Never ship an obsolete second set of Markdown files for convenience.

## Publication and replication

`docs/astro.config.mjs` owns the public origin and `/ticker/docs/` base. The root `site:build` builds docs first, then the landing. `landing/scripts/include-docs.mjs` copies `docs/dist/` into `landing/dist/docs/` and merges sitemap entries. The Pages workflow builds the same artifact. The npm package allowlist includes maintained Markdown, not the Astro project, dependencies, search index or generated pages.

To replicate for another package, replace package metadata, public API imports and examples, content, UI catalog, namespace/storage keys, origin/base, edit URLs, social image, landing links, shared component/theme imports and validation paths. Keep static search and deployment together. If the sites become separate repositories, extract the intentionally shared theme/controls into a small shared package rather than copying diverging implementations.

Re-run the full checks after changes to Astro, Tailwind, Pagefind or Drawer. Review their native APIs before adding integration code. Keep this file and AGENTS.md current whenever commands, ownership, routes, deployment or testing requirements change.
