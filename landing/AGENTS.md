# Astro landing conventions

- Keep component/section CSS and client behavior inside their owning `.astro` file, using plain scoped `<style>` and processed `<script>` tags. Do not reintroduce a global component stylesheet or a page-wide behavior script.
- `src/styles/tailwind.css` is the shared Tailwind configuration and theme-token entry only. The layout owns document styles; Theme owns the shared document color preference.
- Use instance-local custom elements for interactive UI. Query within `this`, keep state per instance, and clean listeners, observers and controllers on disconnect. Astro deduplicates component scripts; scripts must support every rendered instance.
- Generate unique DOM/ARIA IDs per instance. Logical tab names may repeat. Prefer scoped events for communication between a section and its child controls.
- Keep styles for slots/dynamic DOM anchored to a component-owned selector when `:global()` is necessary. Avoid unanchored global selectors and styling a reusable child through an unrelated parent's class. Use component props, CSS custom properties, or Tailwind utilities instead.
- Verify reusable interactive components with multiple instances, unrelated matching class names, and disconnect/reconnect behavior. Run `npm run landing:check`, `npm run landing:build` and the landing formatting check after changes.

- Author CSS lengths in `rem`, including borders, shadows, radii and media queries. Keep SVG viewBox/stroke coordinates unitless. Tailwind `px-*` utility names mean horizontal padding; use rem-based utilities/arbitrary values.
- Use `class:list={[...]}` for Astro template classes, including single-class elements. Literal HTML inside `is:raw` code examples is exempt because Astro directives are not processed there.
- Format the entire landing with its Prettier script, including Astro frontmatter, styles, scripts, configuration and documentation.
