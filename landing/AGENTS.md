# Astro landing conventions

- Keep component/section CSS and client behavior inside their owning `.astro` file, using plain scoped `<style>` and processed `<script>` tags. Do not reintroduce a global component stylesheet or a page-wide behavior script.
- `src/styles/tailwind.css` is the shared Tailwind configuration and theme-token entry only. The layout owns document styles; Theme owns the shared document color preference.
- Use instance-local custom elements for interactive UI. Query within `this`, keep state per instance, and clean listeners, observers and controllers on disconnect. Astro deduplicates component scripts; scripts must support every rendered instance.
- Generate unique DOM/ARIA IDs per instance. Logical tab names may repeat. Prefer scoped events for communication between a section and its child controls.
- Keep styles for slots/dynamic DOM anchored to a component-owned selector when `:global()` is necessary. Avoid unanchored global selectors and styling a reusable child through an unrelated parent's class. Use component props, CSS custom properties, or Tailwind utilities instead.
- Verify reusable interactive components with multiple instances, unrelated matching class names, and disconnect/reconnect behavior. Run `npm run landing:check`, `npm run landing:build` and the landing formatting check after changes.

- Author CSS lengths in `rem`, including borders, shadows, radii and media queries. Keep SVG viewBox/stroke coordinates unitless. Tailwind `px-*` utility names mean horizontal padding; use rem-based utilities/arbitrary values.
- Use `class:list={[...]}` for Astro template classes, including single-class elements. Code examples are dictionary tokens rendered with escaped Astro expressions.
- Format the entire landing with its Prettier script, including Astro frontmatter, styles, scripts, configuration and documentation.

- Keep all authored interface copy in `src/i18n/translations/<locale>/`, organized into common, navigation, SEO, controls and per-section modules. Use `getI18n(Astro)` and descriptive semantic keys. This includes titles, accessible labels, sample/demo content, code examples and client-side feedback.
- Keep messages as complete translated templates with named placeholders; use the typed `format` helper for server-side interpolation. Pass the resolved messages through the owning custom element's `data-*` attributes so client behavior stays scoped and does not bundle whole dictionaries.
- Rich translations and highlighted code use typed parts/tokens rendered as escaped text. Do not put HTML strings in catalogs or use `set:html` to display translated content.
- Every added locale must satisfy `TranslationDictionary` and be registered in `dictionaries`. The current landing keeps English; add locale routing/UI only when requested. Preserve structural IDs, routes, code syntax and named placeholders when translating.
- `npm run landing:check` includes the source-copy audit, Astro diagnostics and translation regression tests. Do not silence the audit by disabling it or broadly excluding interface code. Structural identifiers, SVG paths, decorative symbols, comments and developer diagnostics are not interface copy.

- Keep production metadata in SEO.astro and translated SEO copy in the locale catalog. Derive canonical, sitemap and sharing URLs from configured SITE_URL, never request/preview hosts. Keep development noindex. JSON-LD may use set:html only with serializeJsonLd escaping; it must never render translated HTML.
- Verify deployment at its configured base path, including assets, documentation links and legacy documentation redirects. Run npm run site:build for the combined Pages artifact.
