# Ticker landing

Astro 7 marketing site for `@samline/ticker`, scaffolded with `npm create astro@latest -- --template minimal`. Tailwind 4 runs through `@tailwindcss/vite`. Requires Node.js 22.12 or newer.

## Development

From the repository root:

```sh
npm ci --prefix landing
npm run landing:dev
```

Open `http://localhost:4321/ticker/`. TickerDemo imports the local library API directly from the repository source. Library changes appear in development without rebuilding or copying a browser bundle.

```sh
npm run landing:check
npm run landing:build
npm run landing:preview
```

The build command bundles the component scripts and scoped styles through Astro, then generates the static site in `landing/dist/`. Deploy that output directory. Run `npm run site:build` to build both sites: the landing occupies `/ticker/` and the documentation is copied to `/ticker/docs/`. The GitHub Pages workflow publishes this combined output, with a shared sitemap index and redirects for previous documentation URLs.

## Structure

- `src/components/`: independent, reusable UI primitives (`Box`, `Section`, `Button`, `Eyebrow`, `SectionHeading`, `Heading`, `Logo`, `Tabs`, `CodeBlock`, `FeatureCard`, `RuntimeItem`, `StepCard`, `FaqItem`, `BrandLogo`, `TickerDemo`, `SpeedControl`, `InstallCommand`, `ThemeToggle`, `Theme`, `Reveal`, `MobileMenu`, `RecipeCard`).
- `src/sections/`: complete content blocks (`Hero`, `LiveDemo`, `Features`, `Runtimes`, `GettingStarted`, `Recipes`, `Faq`, `CallToAction`).
- `src/layouts/`: document shell, header and footer.
- `src/pages/index.astro`: composes the sections.
- `src/styles/tailwind.css`: Tailwind entry, breakpoints, fonts and theme tokens.
- `public/assets/`: licensed illustrative brand marks. Component CSS and client behavior live inside their owning `.astro` files.

Hero uses narrow Boxes for its introduction and compatibility block, and a medium Box for the live demo. Box owns the gutters and maximum widths; the section owns vertical spacing. LiveDemo fills its parent container.

The separation follows the supplied component/section screenshots. Dinkbit informed the CSS-first Tailwind configuration, `data-theme` variants and the Box/Section foundations. Its application, CMS and server configuration were not imported.

## Box and Section

`Box` centralizes gutters and content widths. It accepts native div attributes, classes and a default slot. `size` is `default` (90rem), `wide` (85.375rem), `medium` (64rem) or `narrow` (50rem). `liquid` removes the maximum width and `x2` expands it to 120rem. `padding="none"` removes gutters through an explicit prop.

`Section` creates the semantic section wrapper with native attributes and a slot. Its default vertical padding is `py-10 md:py-16 lg:py-20`; `spacing="none"` allows each complete landing block to keep its original rhythm. `theme="inherit"` follows the page, or use `light`/`dark` for a scoped theme. `main` adds top spacing and `disabled` omits the block. IDs are explicit; it never generates an undefined CMS identifier.

```astro
---
import Box from '../components/Box.astro'
import Section from '../components/Section.astro'
---

<Section id="example" aria-labelledby="example-title">
  <Box>
    <h2 id="example-title">A reusable foundation</h2>
  </Box>
</Section>
```

## Tailwind conventions and themes

Breakpoints use rem units: `xs` 23.4375rem, `sm` 37.5rem, `md` 48rem, `lg` 64rem, `xl` 75rem, `2xl` 85.375rem and `3xl` 90rem. Use `max-*` variants for upper bounds rather than duplicating near-identical breakpoint definitions.

Semantic utilities such as `bg-bg`, `text-text`, `text-text-muted`, `border-border` and `text-accent` resolve through `@theme inline`. Both theme palettes live in `tailwind.css`, including surface and syntax tokens; interface colors should be changed there. `dark:` and `light:` variants follow `data-theme`.

The first visit follows the system color scheme. The header toggle persists an explicit choice in `localStorage`; an inline head script applies it before rendering. System changes are followed until a manual choice is made. Storage restrictions do not break the toggle. Sections can override the theme locally.

## Demos and accessibility

The original English content, dark/lavender identity, sample brands and illustrative prices are preserved. Tabs support arrow keys, Home and End. Each ticker has a pause toggle, pauses on hover/focus, respects reduced motion and refreshes after font loading. The duration slider updates the selected ticker. All content remains available without JavaScript, with horizontal scrolling for static ticker content. FAQ items use native details/summary; the page includes a skip link and visible focus indicators.

Brand marks come from Simple Icons v16.0.0. Their sources, license and disclaimer are retained in `public/assets/brands/`. They are examples, not endorsements. The FAQ bundle size refers to the v2.0.4 browser build (about 4.3 KiB gzip plus 0.5 KiB CSS) and should be remeasured after library changes.

## Encapsulation

Each component owns its CSS in a plain `<style>` block, which Astro scopes automatically, and its client behavior in a processed `<script>`. Tailwind's shared entry file contains only framework configuration, fonts, breakpoints and theme tokens. The document shell styles its own HTML, body, texture and skip link.

Interactive components use custom elements with instance-local queries (`this.querySelector`), AbortController cleanup in `disconnectedCallback`, and their own state. TickerDemo destroys its local controller on disconnect; Reveal disconnects its own observer. Theme owns the shared document preference, while each ThemeToggle binds its own button and observes theme changes.

Tabs owns both its triggers and panel slot. Its logical group name can repeat safely: trigger/panel IDs use a unique prefix per rendered instance. Ticker IDs and speed input/output associations are also unique. LiveDemo routes events only to the demos and controls inside that instance. Visual variants use explicit context props rather than selectors coupled to parent section classes.

Scoped `:global()` descendants are used only under a component-owned selector where Astro slots or library clones require it. These selectors never target the whole document. Arbitrary `.btn`, `.tab` and `.card` classes outside the component receive no component styles.

Validation covered two simultaneous instances of demos, tabs, copy controls and theme toggles: independent tab selection, loop duration, pause state and copy feedback; unique DOM/ARIA IDs; synchronized document theme; CSS isolation from unrelated markup; and disconnect/reconnect cleanup. The full landing also passed dark/light responsive checks from 20rem to 90rem at the default root font size, keyboard tabs, reduced motion and JavaScript-disabled fallbacks.

All authored layout lengths use rem, including outlines, borders, shadows, icon viewports and responsive thresholds. SVG viewBox and stroke values are unitless drawing coordinates. Astro template classes use `class:list={[...]}`, including single-class elements; code examples render escaped tokens from their section catalog. Run `npm --prefix landing run format` to format all maintained landing files and `npm --prefix landing run format:check` to verify them. Generated output, the npm lockfile and third-party assets are excluded.

## Translation catalogs

All editable interface text lives in `src/i18n/translations/en/`. English remains the landing's current language. The organization follows dinkbit's domain dictionaries, with typed keys, named interpolation and a source-copy check:

- `common.ts`: shared actions, link labels and package metadata. Name/version come from the root package manifest.
- `navigation.ts`: navigation, skip link and footer credit.
- `seo.ts`: document title, description, keywords, sharing metadata and image copy.
- `controls.ts`: copy feedback, theme labels, ticker pause and loop-duration messages.
- `sections/`: one catalog per complete section, including feature/FAQ items, demo content and code examples.
- `index.ts`: composes the locale dictionary.

Find a sentence directly with `rg 'Thoughtful by default' landing/src/i18n/translations`, then edit its catalog without changing the component. Components read `getI18n(Astro)` with typed property access. `getLocale` normalizes regional language tags and falls back to the default locale for unknown values. Future dictionaries must satisfy `TranslationDictionary`; adding translations does not by itself add routes or a language selector.

Rich copy stores text, code, strong and emphasis parts, allowing a translator to reorder the complete sentence while keeping presentation in `RichText.astro`. Code examples use escaped syntax tokens in `CodeBlock.astro`. Catalogs contain no executable HTML. Complete messages such as `Pause animation: {label}` use the typed `format` helper. Custom elements receive already selected messages through their own `data-*` attributes, retaining independent instance behavior and keeping server dictionaries out of client bundles.

`npm run landing:check` runs an AST-based check for literal UI copy in Astro markup/accessibility attributes and direct client-side feedback, Astro type diagnostics, and regression tests for locale resolution, interpolation and the copy check. Run only the tests with `npm --prefix landing run test`. Structural values (IDs, roles, routes, SVG coordinates), decorative symbols and developer diagnostics remain in code.

## SEO and deployment

The default public URL is `https://samline.github.io/ticker/`. Override `SITE_URL` using `.env` (see `.env.example`) for another deployment; its pathname also configures Astro’s base path. Canonical, Open Graph, Twitter cards, JSON-LD, robots.txt and the sitemap share this URL. Development uses noindex. The 1200×630 sharing image is generated from translated copy during the build. JSON-LD is serialized with escaped HTML-sensitive characters.

Metadata identifies the actual source package, repository, license and version. Sections have associated headings; controls have translated accessible names, keyboard focus indicators and instance-specific ARIA IDs. Horizontally scrolling code examples are keyboard focusable. Automated accessibility checks cover both themes, desktop/mobile and all demo tabs; manual checks also cover keyboard navigation, reduced motion and no-JavaScript fallback.

## Mobile navigation and browser checks

MobileMenu uses `@samline/drawer` 4.2.1 for its right-side modal panel below 64rem. It owns its controller and mount container, scopes runtime CSS beneath its own root, and destroys the controller on disconnect. Translated labels, Escape/backdrop/close-button dismissal, focus trapping and restoration, link dismissal and cleanup when switching to desktop are covered by browser tests. A native details menu keeps navigation available without JavaScript. The component imports the package stylesheet as a string, normalizes vendor lengths to rem and wraps it in native CSS @scope. This uses the original library animations without a parser or copied definitions. The normal Astro style block contains only panel design and reduced-motion overrides.

At widths below 30rem, hero actions stack with readable labels and full-width targets. Desktop navigation and tab groups wrap when enlarged text needs more room. Browser tests inspect visible buttons and text from 320 to 1440 and back, including both sides of breakpoints, both themes and every demo tab. Intentionally scrollable code and ticker viewports retain their scrolling behavior.

```sh
npm exec --prefix landing -- playwright install chromium
npm run landing:build
npm --prefix landing run test:browser
```

The browser suite serves the compiled site at its deployment base path. It also checks repeated menu instances, disconnect/reconnect cleanup, reduced motion, no-JavaScript navigation and automated accessibility checks while the menu is open.

The Recipes section complements setup and features with three specific integration decisions: live option updates, editing the stable source and explicitly synchronizing copies, and registry-aware browser cleanup. Examples and explanatory text live in its locale catalog; API behavior is documented in the existing reference and lifecycle guide. The old #compare fragment remains an alias for #recipes.
