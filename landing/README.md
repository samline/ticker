# Ticker landing: implementation and reuse guide

This is the Astro 7 and Tailwind 4 landing for `@samline/ticker`. It is also a reference for building package websites with reusable Astro components, scoped behavior, translation catalogs, executable examples and a shared landing/documentation deployment.

Use this README as the implementation playbook and [AGENTS.md](AGENTS.md) as the maintenance contract. Exact dependency versions belong to `package.json` and `package-lock.json`; the current Node.js requirement is 22.12 or newer. This project started with `npm create astro@latest -- --template minimal`. It does not need a client framework or an Astro Tailwind integration: Tailwind runs through `@tailwindcss/vite`.

## Run and verify

From the repository root:

```sh
npm ci --prefix landing
npm run landing:dev
```

Open `http://localhost:4321/ticker/`. The local package API is imported from repository source, so library changes reach the demo without copying a built JavaScript bundle.

```sh
npm run landing:check
npm --prefix landing run format:check
npm run landing:build
npm run landing:preview
```

`landing:check` runs the interface-copy audit, Astro diagnostics and Node regression tests. `landing:build` creates `landing/dist/`, includes an existing documentation build when available and verifies production metadata, image dimensions, base paths and legacy redirects. An existing `example/dist/` may be stale; build both sites for a release:

```sh
npm ci --prefix example
npm run site:build
```

For browser checks, build first:

```sh
npm exec --prefix landing -- playwright install chromium
npm --prefix landing run test:browser
```

The Playwright suite uses an isolated preview on port 4324 with `--ignore-lock`, avoiding Astro's agent-detected background mode and existing preview locks. Its base URL is currently `/ticker/`. Browser tests cover both themes, viewport changes from 320 to 1440 and back, breakpoint boundaries, enlarged root text, every demo tab, keyboard navigation, modal focus, repeated menu instances, disconnect/reconnect cleanup, reduced motion and navigation without JavaScript. Axe checks supplement these tests; they do not establish complete accessibility conformance.

CI runs the maintained landing's formatting, source checks, build and browser suite. Format authored files with `npm --prefix landing run format`. Generated output, npm lockfiles, licensed brand assets and installed third-party skills are excluded from formatting.

## Architecture and ownership

| Location                  | Responsibility                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/`         | Individual reusable primitives, controls and integrations: Box, Section, Button, Heading, Tabs, CodeBlock, RichText, RecipeCard, TickerDemo, MobileMenu and related UI |
| `src/sections/`           | Complete content blocks: Hero, LiveDemo, Features, Runtimes, GettingStarted, Recipes, Faq and CallToAction                                                             |
| `src/layouts/`            | Main document, header and footer                                                                                                                                       |
| `src/pages/`              | Section composition and generated robots/social-image endpoints                                                                                                        |
| `src/styles/tailwind.css` | Tailwind entry, breakpoints, typography tokens and theme palettes                                                                                                      |
| `src/i18n/`               | Locale resolution, typed interpolation and all editable interface copy                                                                                                 |
| `src/lib/site.ts`         | Public URL validation, XML escaping and safe JSON-LD serialization                                                                                                     |
| `scripts/`                | Copy audit, production-output checks and documentation packaging                                                                                                       |
| `tests/`, `e2e/`          | Source/metadata regression tests and compiled-site browser checks                                                                                                      |
| `public/assets/`          | Licensed example brand marks and their attribution                                                                                                                     |

A component owns its plain scoped `<style>` and processed `<script>`. Shared Tailwind configuration is not a place for component selectors. The layout owns document styling; Theme owns the shared document color preference. Dinkbit informed the CSS-first tokens, breakpoints and Box/Section foundations, while easytrip informed navigation integration. Their CMS, backend and application setup were not imported.

### Layout foundations

Box owns horizontal gutters and content widths. Section owns semantic section boundaries, vertical spacing and optional local themes. Use different Boxes inside one section when its heading, demonstration and supporting content need different widths; do not add local maximum widths or duplicate section gutters to recreate Box.

| Box size  | Maximum width                     |
| --------- | --------------------------------- |
| `default` | 90rem                             |
| `wide`    | 85.375rem, the `2xl` screen token |
| `medium`  | 64rem                             |
| `narrow`  | 50rem                             |

These values preserve the project's chosen sizes; size names do not imply a sorted order. `liquid` removes the maximum width, `x2` uses 120rem, and `padding="none"` removes gutters. Default gutters are `px-6 lg:px-10`. Native attributes, classes and Astro scope attributes are forwarded to the root element.

Section supports `spacing="none"`, `theme="inherit" | "light" | "dark"`, `main`, `disabled` and native attributes. Its default vertical spacing is `py-10 md:py-16 lg:py-20`. Assign meaningful section IDs and connect each section to its heading with `aria-labelledby`.

Hero uses narrow Boxes for its introduction and compatibility block and a medium Box for LiveDemo. LiveDemo fills the container it receives. A reusable section pattern keeps copy in the catalog:

```astro
---
import { getI18n } from '../i18n/utils'
import Box from '../components/Box.astro'
import Section from '../components/Section.astro'
const t = getI18n(Astro).sections.recipes
const headingId = `section-heading-${crypto.randomUUID()}`
---

<Section aria-labelledby={headingId} spacing="none">
  <Box size="narrow">
    <h2 id={headingId} class:list={['text-text']}>
      {t.title}
    </h2>
  </Box>
</Section>
```

### Styles, units and themes

Use `class:list={[...]}` for every Astro class attribute, including single-class elements. Fixed authored lengths use rem: gutters, widths, borders, radii, outlines, shadows and media thresholds. Fluid percentages/viewport expressions and unitless SVG drawing coordinates retain their proportional meaning. A Tailwind `px-*` class means horizontal padding, not pixel units. Browser measurement APIs and third-party internals can report pixels; normalize the integration boundary where required rather than rewriting the library API.

Breakpoints are `xs` 23.4375rem, `sm` 37.5rem, `md` 48rem, `lg` 64rem, `xl` 75rem, `2xl` 85.375rem and `3xl` 90rem. Prefer `max-*` variants to duplicated upper-bound definitions. Tokens such as `bg-bg`, `text-text-muted`, `border-border` and `text-accent` resolve through `@theme inline`; syntax, surfaces and controls have semantic palette tokens for both themes.

The first visit follows system preference. The inline head script prevents a theme flash, and an explicit choice is stored under `ticker-theme`. System changes are followed until that choice is made. Storage restrictions must not break the UI. Local Section themes use `data-theme`; changing the brand palette also requires reviewing the theme-color values in Theme and SEO.

### Behavior and library integration

Astro deduplicates processed scripts, so initialize every rendered instance. Interactive components use custom elements, local queries and state, AbortController listener cleanup and `disconnectedCallback`. Generate unique DOM/ARIA IDs for repeated tab groups and controls. Route custom events within the owning section; an unrelated instance must not receive its tab, speed or pause changes.

For slots and library-generated DOM, anchor necessary `:global()` selectors beneath a component-owned root. Never target arbitrary `.btn`, `.tab` or `.card` elements throughout the document. Verify CSS isolation and removal/reinsertion as well as the first render.

Use library APIs before adding integration code. MobileMenu delegates creation, trigger handling, close-button rendering, Escape/backdrop dismissal and modal focus to `@samline/drawer/browser`. Its own script only adds link dismissal, desktop-breakpoint cleanup, `aria-expanded` synchronization and instance teardown. A native details menu remains available without JavaScript. It imports the original Drawer stylesheet with `?inline`, normalizes vendor pixel lengths to rem and wraps it in native CSS `@scope`; its regular Astro style block owns panel design and reduced-motion overrides. Do not duplicate Drawer animations or add a CSS parser for this boundary. Native `@scope` needs a compatible target browser; test that contract when changing supported browsers or porting the component.

TickerDemo imports the local vanilla API and owns its controller, pause behavior and measurement observer. It contains a scoped adaptation of the package stylesheet, followed by component design overrides. The order matters: animation shorthands can reset pause state. Synchronize this adaptation when `src/style.css` changes. The library measures `--ticker-distance` in pixels; the component normalizes it to rem using the computed root font size and cleans its observer on disconnect. For another package, prefer its original stylesheet with an explicit scope when possible; do not turn this package-specific adaptation into a universal runtime.

## Copy and content strategy

All UI copy lives in `src/i18n/translations/en/`, including navigation, headings, accessible names, meta descriptions, demo data, example code and client-side feedback. The active language remains English; catalogs do not by themselves add translated routes or a language selector.

| Catalog         | Content                                                                          |
| --------------- | -------------------------------------------------------------------------------- |
| `common.ts`     | Shared links/actions and package name, version and author from the root manifest |
| `navigation.ts` | Desktop/mobile navigation, skip link and footer credit                           |
| `seo.ts`        | Metadata, keywords and sharing-image copy                                        |
| `controls.ts`   | Copy feedback, theme, pause, duration and code-region labels                     |
| `sections/`     | Each section's descriptions, items, samples and code tokens                      |

Use `getI18n(Astro)` with typed keys. `getLocale` normalizes supported regional tags and falls back safely. Additional dictionaries must satisfy `TranslationDictionary`; actual localized routes need matching canonical, sitemap and sharing metadata. Use complete messages with named placeholders through `format`, rather than concatenating fragments that a translator cannot reorder.

RichText renders escaped text/code/emphasis/strong parts. CodeBlock renders escaped syntax tokens. Catalogs contain no executable HTML. Pass selected messages to custom elements through their own `data-*` attributes instead of shipping all dictionaries into client bundles. `set:html` is reserved here for safely serialized JSON-LD and the trusted scoped vendor stylesheet, not translated UI content.

The source-copy audit detects literal UI text, human-facing attributes and direct client feedback. It is a guardrail, not a complete semantic audit of all possible JavaScript. Review newly added props and data objects as well; do not hide copy outside the catalogs to bypass it.

Each section should answer a different question: Hero introduces the package, LiveDemo lets people try it, Features explains benefits, Runtimes explains entrypoints, GettingStarted provides setup, Recipes addresses specific post-setup decisions, FAQ handles remaining questions and CallToAction offers the next step. Audit existing copy before adding a section. The former comparison table repeated benefits and confused responsibilities; it was moved to the documentation lifecycle guide. Recipes now demonstrates partial option updates, editing the stable source and synchronizing copies, and browser-registry cleanup. The old `#compare` fragment remains an alias for `#recipes`. A short demo note keeps integration responsibilities visible without another feature list.

## Accessibility and evidence

Use semantic headings and section associations, an effective skip link, visible focus, stable accessible names and native controls where appropriate. Tabs support arrows, Home and End. Each ticker exposes pause, respects reduced motion, pauses on hover/focus and refreshes after fonts load. The library handles movement, but the integration owns meaningful source content, pause controls and readable static output. Keep this responsibility note visible even when reduced motion hides the duration footer.

Do not let overflow clipping conceal broken layouts. Stack narrow hero actions, allow navigation/tab groups to wrap with enlarged text, and test the 320 viewport explicitly. Code examples and static tickers can intentionally scroll; those regions must remain keyboard reachable. Test menu focus, close-button hover, focus restoration, desktop transitions and no-JavaScript navigation in both themes.

Execute published examples against the package, not just the renderer. The Recipes examples were verified for preserved options/wrapper identity, updated source/clones and complete registry cleanup. Recheck them when API contracts change. Brand marks are illustrative Simple Icons v16.0.0 assets with attribution; prices are sample data, not a market feed or endorsements. Bundle-size statements are measurements, not permanent promises: the FAQ currently cites the v2.0.4 browser build at roughly 4.3 KiB gzip plus 0.5 KiB CSS and must be remeasured after relevant changes.

## SEO and deployment

`SITE_URL` defaults to `https://samline.github.io/ticker/`; `.env.example` documents the override. Its pathname becomes Astro's base path. Canonical, Open Graph, Twitter cards, WebSite/WebPage/SoftwareSourceCode JSON-LD, robots.txt, sitemap and the generated 1200×630 PNG share this public URL. Development is noindex. JSON-LD escapes HTML-sensitive characters; sharing-image text is XML-escaped. Only publish metadata and claims supported by the actual package.

The Pages artifact places the landing at `/ticker/` and documentation at `/ticker/docs/`. `include-docs.mjs` copies `example/dist/` and merges its sitemap entries. Config redirects preserve previous documentation paths. Asset and link construction must use `import.meta.env.BASE_URL` or configured URLs; hardcoded root-relative paths break repository deployments.

A URL/base-path change also requires updating `example/site.config.mjs`, documentation packaging/links/redirects, production assertions, Playwright config and the explicit URL in the no-JavaScript test. SITE_URL alone does not rewrite the documentation project's base. `.github/workflows/deploy.yml` builds both sites and publishes the combined landing artifact. A commit/merge is not a push or deployment.

## Replicate this in another package

1. Inspect the target package's manifest, exports, public API, stylesheet and docs. Establish verified claims and runnable examples before reusing this copy. Choose the public URL and whether documentation shares the artifact.
2. Scaffold Astro with the minimal template and install a compatible Astro/Tailwind/Vite toolchain. Use the lockfile and current Node engine requirement rather than assuming `latest` reproduces these versions. Configure Tailwind 4 through its Vite plugin.
3. Bring over the architectural pattern: components, sections, layouts, typed catalogs, Box/Section, theme handling and verification scripts. Choose that project's container widths, breakpoints and palettes; do not copy an entire reference application's stack.
4. Replace package-specific imports, manifest-relative paths, controller options/events, scoped vendor CSS, storage keys, custom-element/event namespaces, samples, assets and licenses. Remove Ticker-specific integration code when the new API does not need it.
5. Rewrite catalogs around the new package's distinct value, entrypoints, setup and useful recipes. Replace repository/npm/license links, versioned CDN examples, measured bundle claims and source-code schema fields. Keep sample data clearly labeled.
6. Configure URL/base paths, metadata, sharing image and optional docs. If there is no sibling `example/` site, adapt/remove `include-docs.mjs`, docs links and legacy redirects rather than leaving a broken inherited deployment.
7. Adapt browser selectors and expected names/routes to the new UI. Verify both themes, repeated components, keyboard navigation, reduced motion, JavaScript-disabled content, narrow layouts and the compiled base path. Execute code examples and resolve documentation links.
8. Update this README and AGENTS.md with the target's real contracts. Commit only reviewed source and intended tooling artifacts; preserve unrelated user changes.

## Maintenance: update references with the change

Treat the package, catalogs, docs, generated metadata and examples as one release surface. Update affected references in the same change; search both the old identifier/value and the new one.

| Change                                               | Review and update                                                                                                                                                           |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Package name, author, version, license or repository | Root manifest; manifest-relative imports; common/SEO catalogs; hardcoded GitHub/npm/license URLs; footer; CDN URLs; FAQ version/bundle measurements; docs and sharing image |
| API, options, entrypoints or lifecycle               | TickerDemo and its adapters; setup/recipes/FAQ/features catalogs; source snippets; package docs/reference; browser selectors and assertions; run the displayed examples     |
| Package CSS, clone markup or measurement semantics   | Scoped TickerDemo adaptation, dynamic selectors, pause/animation order, rem conversion and cleanup; inspect repeated instances and both themes                              |
| Drawer or other UI dependency                        | Use its native API and original CSS; review scope/browser support, close semantics and teardown; avoid copying new library internals into components                        |
| Content, section name/order, heading or CTA          | Section/catalog exports, page composition, desktop/mobile navigation, fragment aliases, documentation references and tests; remove repetition                               |
| Container widths, breakpoints, themes or typography  | Box/Section, Tailwind tokens, mobile media conditions, theme-color literals, controls, image design and responsive/contrast evidence                                        |
| Domain/base path or docs layout                      | SITE_URL/default, Astro config, example site config, BASE_URL links/assets, redirects, packaging, sitemap/robots, output checks, workflows and browser URLs                 |
| Dependencies/tooling or skills                       | Relevant lockfiles, Node/browser baseline, CI commands, formatting exclusions, installed skill provenance and the instructions below                                        |

Use targeted checks first, then the required build and relevant browser checks for the affected behavior. For an actual release, rebuild the package if measurements/examples depend on built output, remeasure size claims and run `npm run site:build`. Keep attribution and source records intact. Document real remaining limitations instead of claiming that automated checks prove everything.

## Installed project skills

`npx autoskills` was run inside `landing/`. CLI v0.3.6 detected Astro, Tailwind CSS, TypeScript, Playwright, Vite and Node.js and installed ten skills under `.agents/skills/`. `skills-lock.json` records sources and computed hashes. Both are versioned so the learning aids can travel with this landing.

| Skill                                              | Source                                         |
| -------------------------------------------------- | ---------------------------------------------- |
| accessibility, seo                                 | `addyosmani/web-quality-skills`                |
| astro                                              | `astrolicious/agent-skills`                    |
| frontend-design                                    | `anthropics/skills`                            |
| tailwind-css-patterns                              | `giuseppe-trisciuoglio/developer-kit`          |
| typescript-advanced-types, nodejs-backend-patterns | `wshobson/agents`                              |
| nodejs-best-practices                              | `sickn33/antigravity-awesome-skills`           |
| playwright-best-practices                          | `currents-dev/playwright-best-practices-skill` |
| vite                                               | `antfu/skills`                                 |

Read the relevant installed SKILL.md when its workflow applies. They are third-party guidance, not a mandate to add a backend, client framework or unnecessary dependencies. Follow the user's request and this project's actual version/contracts when generic examples differ. Do not reformat vendored skills or edit their hashes by hand.

To rediscover skills for a copied project, run `npx autoskills` in that project's landing directory; `npx autoskills@0.3.6` selects the discovery-tool version used here. Review the resulting directory and lock diff. Tool-version pinning alone does not freeze upstream skill content. Keep local project instructions when refreshing installed guidance, and update these provenance notes if the selected skills or workflow change.

The codebase-memory exploration workflow is supplied separately by the development environment; it is not one of the ten autoskills selections. Configure the target project’s exploration tools and adapt that instruction when reusing this playbook.

## Copy controls, persistent navigation and documentation journeys

CodeBlock and InstallCommand share CopyButton. CodeBlock passes the exact joined token values, so syntax markup and filenames never reach the clipboard. CopyButton uses a native named button, instance-local state, an atomic live status and a captured abort signal for asynchronous cleanup. Its success label resets after two seconds; repeated clicks restart the instance timer, and disconnect clears it. If clipboard access fails, it selects the owning code source and announces manual-copy instructions. Without JavaScript the copy button stays hidden while code remains readable. Keep source ownership marked with data-copy-source, and verify success, permission denial and independent feedback after changes.

The document Header is sticky without a scroll-direction listener or hide/show animation. Its custom element measures the actual header height with ResizeObserver and sets the document’s header-offset token; Main uses it for scroll padding. The body uses overflow-x: clip so it does not create an unintended sticky scroll container. This is an intentional document-level layout contract, analogous to Theme’s document preference; a copied project needs one document header. Verify section targets and keyboard focus after adding navigation items or changing typography. The CSS fallback also accommodates navigation without JavaScript.

Docs appears in the shared desktop/mobile menu. The setup CTA leads to configuration options after the minimal example; the closing CTA offers the complete guide as an alternative next step. Recipe links point to the specific update(), content-refresh and registry-cleanup sections. Footer Docs uses same-tab navigation. Structural documentation destinations live in src/lib/docs.ts rather than being repeated across catalogs and templates; user-facing CTA descriptions/labels still belong to catalogs.

The build runs scripts/check-doc-links.mjs after packaging documentation. It checks every rendered same-site Docs link against the deployment base, a real HTML file and the target fragment. Without a documentation build it explicitly reports the skipped audit; run site:build for the complete check. When docs headings, pages or the base change, update docsRoutes and rerun the combined build. Presence checks prevent broken targets, while human review must still confirm that link labels and surrounding content describe the intended topic.

Applied local skill guidance: Astro’s deduplicated component scripts/custom elements, accessibility’s native buttons/live feedback and unobscured focus, Tailwind’s semantic tokens/mobile-first layout, frontend-design’s contextual CTA placement, and Playwright’s role-based locators and retrying assertions. Their generic font, breakpoint or framework examples do not replace the existing project choices.
