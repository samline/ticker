# Landing implementation and maintenance contract

These instructions apply to the maintained Astro landing. Read README.md for rationale, commands, project-specific integration details and the replication checklist. Preserve the user's choices and edits; adapt the architecture to another package rather than copying Ticker claims or application internals.

## Architecture and layout

- Keep cross-site reusable UI in `../shared/components/` and app-specific integrations in `src/components/`, complete blocks in `src/sections/`, document structure in `src/layouts/`, and page composition/endpoints in `src/pages/`.
- Box owns horizontal gutters and maximum widths. Section owns section semantics, vertical spacing and optional themes. Compose several Boxes for different widths within a section; do not recreate Box with local max-width values or duplicate gutters on the section.
- Preserve the chosen Box sizes: default 90rem, wide 85.375rem, medium 64rem and narrow 50rem. A new size must solve a reusable layout need. LiveDemo fills its parent's Box; Hero uses narrow/medium/narrow containers.
- Forward native attributes and Astro scope attributes through reusable roots. Associate sections with their headings and generate unique IDs where instances may repeat.
- Use `class:list={[...]}` for every Astro template class, even one class. Author fixed CSS lengths in rem, including borders, radii, shadows, outlines and media thresholds. Keep SVG drawing coordinates unitless; preserve proportional units for fluid expressions. Tailwind `px-*` names mean horizontal padding.
- Keep Tailwind's shared entry limited to framework configuration, fonts, breakpoints and semantic theme tokens. Use the current CSS-first Tailwind 4/Vite integration; do not transplant older config conventions blindly.

## Encapsulation and behavior

- Put component design CSS in its own plain scoped `<style>` and client behavior in its own processed `<script>`. Do not create a global component stylesheet or page-wide initialization script.
- Astro deduplicates processed scripts. Use instance-local custom elements, local queries/state/events and explicit disconnect cleanup. Release listeners, observers, timers and package controllers. Test multiple instances and removal/reinsertion.
- Anchor required `:global()` selectors beneath an owned root for slots or library-generated DOM. Never style unrelated matching classes throughout the page. Prefer props, tokens and utilities to a parent styling another component's internals.
- Delegate behavior already provided by a dependency. Do not reimplement Drawer animations, focus trapping, Escape/backdrop handling, its trigger or close button. MobileMenu uses `browser.newDrawer`; only link dismissal, desktop transitions, accessible state and teardown belong to the integration.
- MobileMenu imports the original vendor CSS with `?inline`, normalizes fixed pixel lengths to rem and emits it inside native `@scope (ticker-mobile-menu)`. Keep scope explicit and verify target-browser support. Its regular style owns panel appearance and accessibility overrides. Do not add a parser or hand-maintained animation copies for this boundary.
- TickerDemo uses local package source and a scoped adaptation of `src/style.css`. When package CSS/markup changes, synchronize that adaptation and review rule order: animation shorthand may reset pause state. Preserve its measured-distance rem conversion and observer cleanup. Use the real dependency API instead of patching library internals.
- Theme owns the intentional shared document preference and inline head initialization. Keep storage failure safe, system/manual behavior consistent and theme-color literals synchronized with palette changes. Namespace storage keys, custom elements and events appropriately when reusing the landing.

## Copy, examples and information design

- Put all editable UI text in `src/i18n/translations/<locale>/`: headings, navigation, descriptions, accessible names, metadata, sample/demo content, code tokens and client feedback. Use `getI18n(Astro)` and descriptive keys.
- Use complete messages with named placeholders through `format`. Rich translations and code tokens render as escaped text; catalogs contain no executable HTML. Pass resolved client messages through instance-owned data attributes, not entire dictionaries.
- Keep every locale compatible with `TranslationDictionary` and register it in `dictionaries`. English is the current language. Adding a catalog does not create locale routes or a language selector; add those only with a corresponding requirement and metadata plan.
- Preserve structural identifiers, code syntax and placeholder names when translating. Do not move copy into arbitrary TypeScript objects to evade the AST source-copy audit; the audit is not exhaustive.
- Audit the existing landing before adding content. Each section must answer a distinct question. Prefer concrete verified recipes over another list of benefits. The Recipes section adds partial updates, original-source edits/clone synchronization and registry cleanup; the former responsibility table belongs in docs.
- Keep the demo's integration note visible with reduced motion: the library manages movement, while integrations must supply pause controls and meaningful readable originals.
- Verify public API claims against package source and reference docs. Execute displayed snippets after relevant changes. Distinguish direct controller destruction from registry destruction; do not copy another package's method names or lifecycle contract.
- Read package name/version/author from the manifest where implemented. Still search for hardcoded versions, CDN imports, repository/npm/license URLs and measured claims when metadata changes. A derived version label does not update every prose reference.
- Keep illustrative prices, brand samples, asset attribution and license records clear. Rebuild/remeasure bundle-size claims when the package or selected entrypoint changes; do not preserve obsolete numbers as permanent marketing copy.

## Accessibility and validation

- Preserve semantic headings, section labels, skip-link behavior, visible focus and appropriate ARIA. Use native controls. Tabs support arrows/Home/End; modal menus retain focus, restore it on close and dismiss correctly on desktop transitions.
- Support both light and dark themes, reduced motion, blocked storage and JavaScript-disabled content. Respect hover capability and reduced motion for button feedback. Keep static ticker content and intentional code scrolling keyboard reachable.
- Check 320 through 1440 and back, both sides of breakpoints, all demo tabs and enlarged root text. Stack narrow actions and allow navigation/tabs to wrap. Do not use overflow clipping to conceal buttons or copy that do not fit.
- Test repeated controls/menus, unique DOM/ARIA IDs, unrelated matching classes and disconnect/reconnect cleanup when behavior changes. Review contrast in both themes. Automated axe results are evidence, not a claim of complete conformance.
- Run `npm run landing:check`, `npm --prefix landing run format:check` and `npm run landing:build` after maintained source changes. Build before `npm --prefix landing run test:browser`; run relevant browser checks for UI/behavior changes. The suite uses the compiled base path and an isolated foreground preview with `--ignore-lock`.
- Use `npm run site:build` for the combined release artifact. A standalone landing build may include stale existing documentation output. Check links/fragments and execute examples against current package behavior.
- Format authored landing files with its Prettier script. Leave `.agents/`, `skills-lock.json`, npm locks, generated output and third-party assets untouched by formatting. Keep root and landing ignore rules aligned.

## SEO and publication contracts

- Keep SEO metadata in SEO.astro and its copy in the catalog. Derive canonical, sharing, sitemap and robots URLs from validated SITE_URL, never request/preview hosts. Keep development noindex.
- Escape JSON-LD through `serializeJsonLd`; escape generated-image text as XML. `set:html` may render this safe structured data and the trusted scoped vendor stylesheet, not translated interface HTML.
- Preserve the generated social image, source-package schema, description, keywords, accessible image text and absolute sharing URLs. Only include factual supported claims; verify output after edits.
- Repository deployments have a base path. Use BASE_URL for local links/assets. A domain/base change must update Astro/default SITE_URL, docs Astro config, documentation paths, redirects, sitemap packaging, output assertions, browser config/test URLs and workflows together.
- Current deployment: landing `/ticker/`, documentation `/ticker/docs/`. `include-docs.mjs` copies sibling `docs/dist/` and merges sitemap entries. Adapt/remove this contract when replicating into a project without that docs site.
- Preserve useful existing fragments and redirects during renames. Navigation now uses `#recipes`; `#compare` remains a compatibility alias.
- A commit or local merge is not a push or publication. Preserve unrelated user work and follow the user's Git instruction. When working on a task branch, use the project's codex/ naming convention; merge/delete it when requested.

## Keep references synchronized in the same change

| Changed surface                       | Required review                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Package metadata/version/distribution | Root manifest, manifest imports, common/SEO catalogs, hardcoded URLs/CDN examples, FAQ measurements, docs and sharing image              |
| API/entrypoint/lifecycle              | Demo adapters, setup/recipe/FAQ/features copy, snippets, reference docs, browser expectations and runnable examples                      |
| Package CSS or generated DOM          | Scoped style adaptation, anchored selectors, animation/pause order, measurement conversion, theme and repeated-instance checks           |
| UI dependency                         | Native API/CSS integration, supported browser scope, close/focus/cleanup contracts and lockfile                                          |
| Section/content/route                 | Catalog exports, page composition, desktop/mobile navigation, fragment aliases, relevant docs and tests; check for repetition            |
| Widths/theme/breakpoints/fonts        | Box/Section, Tailwind tokens, menu media conditions, theme-color literals, controls, image and responsive/contrast evidence              |
| Public URL/docs layout                | SITE_URL, Astro/docs config, BASE_URL links, redirects, docs packaging, sitemap/robots, output assertions, Playwright URLs and workflows |
| Tooling/skills                        | Dependency/skill locks, Node/browser requirements, CI commands, formatting exclusions and this maintenance contract                      |

Search for old identifiers/values as well as new ones. Update README.md and this file when conventions, paths, commands, supported behaviors or replication steps change. Record real limitations and required follow-ups instead of leaving inaccurate documentation.

## Project skills and exploration

- For structural codebase exploration, use the installed codebase-memory skill: graph first, check cited-path coverage, then read source for stale/partial/unusable coverage. Do not claim exhaustive coverage from a clean best-effort result.
- `npx autoskills` installed ten third-party skills in `.agents/skills/`; `skills-lock.json` records their provenance/hashes. Keep these files versioned and preserve upstream content. README.md lists sources and the discovery-tool version.
- Read a relevant SKILL.md when its workflow applies. Generic skill guidance does not override the user's requirements or the actual Astro 7/Tailwind 4/package contracts. Backend-oriented installed skills do not imply that this static landing needs a backend.
- When refreshing skills, review the installation and lock diff, keep project instructions, and update provenance notes. Do not manually rewrite skill hashes or reformat vendored references. Pinning the discovery tool alone does not freeze upstream skill content.
- For a new package, follow README.md's replication checklist and replace package-specific imports, examples, links, assets, namespaces, URLs, docs packaging and tests before considering the copy complete.

## Copy, sticky header and documentation links

- Every displayed code example must be copyable through the shared CopyButton; InstallCommand and CodeBlock must not maintain separate clipboard scripts. Copy joined token text, never rendered HTML or filenames. Preserve native accessible labels, per-instance feedback, denied-clipboard source selection, captured abort-signal cleanup and the no-JavaScript readable fallback. Reset the success label after two seconds, restart its timer on repeat clicks and clear it on disconnect.
- The document Header stays sticky. Keep height measurement in its component and the header-offset/content scroll-margin contract in Main. Do not introduce a global scroll handler for behavior CSS already provides. Check anchor destinations, keyboard focus and menus with enlarged text; body overflow must not break sticky positioning.
- Use src/lib/docs.ts for structural documentation routes. Docs belongs in the shared menu; contextual CTAs must explain why their target helps at that point in the page. Setup links to configuration, recipe links target the relevant reference fragments, and the closing CTA offers the full guide. Keep descriptions and labels in translations.
- When docs paths/headings change, update docsRoutes, verify semantic relevance and run site:build. check-links.mjs uses the shared validator for live anchors, assets, same-origin absolute/relative destinations, fragments and redirects across the artifact. Do not report a partial audit as complete. Review external actions online and keep labels meaningful; do not use placeholder hrefs or promise release notes when linking to installation.
- Apply relevant installed skills while preserving project contracts. Prefer native buttons/live feedback, unclipped focus below the header, token-based styling and semantic/retrying browser assertions. Maintain the new copy/header/docs browser tests when their UI or route contracts change.

## Visual interaction consistency

- Use the shared duration-ui (180ms) and ease-ui tokens for authored color, background and border feedback. Keep hover rules behind hover capability, preserve visible keyboard focus, and disable authored transitions for reduced motion. Buttons stay in place; do not add independent lift, glow or scale effects.
- Reveal owns its wrapper's opacity/translation with duration-reveal (600ms). Child controls/cards own their hover transitions independently; do not put reveal transitions on slotted elements where component CSS can override them. The wrapper preserves grid stretching. Ticker motion and Drawer motion belong to their libraries and have different functional purposes.
- Runtime rows retain horizontal padding in every state, with contiguous rows and equal vertical insets on the hover surface. Straight inset dividers belong to a separate pseudo-element; the rounded hover surface sits behind content, aligned horizontally with the divider endpoints and inset equally above and below. Keep row-gap zero so the next divider does not add asymmetric bottom spacing. Copy controls use the same rounded, inset hover surface in code headers and installation commands; do not combine a divider with a square hover block. Keep decorative feature surfaces within the established theme palette and use the shared hover-border token.
- When updating these tokens or component effects, review both themes, hovered/resting states, 320–1440 widths, enlarged text and reduced motion. Update these notes when the interaction contract changes.

The footer uses a compact brand description, manifest-derived version and shared license metadata, two named resource groups and a separated credit/back-to-top row. Keep its copy in navigation.footer and common catalogs, route documentation links through docsHref, and preserve external-link hints. Review the footer in both themes, narrow layouts and enlarged text when its resources or content change.

MobileMenu uses an editorial brand heading, numbered links with translated descriptions, a highlighted current-section link and compact project resources. Keep link accessible names concise and retain the shared navigation catalog. The no-JavaScript menu uses the same content in a bounded, scrollable disclosure. Update panel/fallback layouts together; use shared interaction tokens and leave Drawer animation/focus/dismissal behavior to the package. Check 320-wide and short viewports, enlarged text, both themes and keyboard dismissal after menu changes. Await observable native close/scroll cleanup with retrying assertions rather than reading transitional state once.

Mobile navigation highlights the section currently under the sticky header with aria-current="location". Measure the document on opening and synchronize after Drawer mounts its content; the modal locks background scrolling, so no scroll observer or persistent global listener is needed. Do not highlight an unrelated link in the hero, unlisted sections or footer. Docs comes last in the shared navigation catalog and is not a current location on the landing. Keep the section-selection test aligned with sticky-header offsets and repeated opening.

Keep the header offset on main/content destinations via scroll-margin-top, not global html scroll-padding-top. Global scroll padding excludes sticky-header controls from the focus viewport and can make native trigger focus and Drawer focus restoration jump the page. Preserve native Drawer focus restoration and scroll locking; test unchanged scroll on close/Escape/backdrop and successful section navigation separately. Do not compensate with manual scrollTo calls.

Section anchors compensate for the section's existing top padding in scroll-margin-top, using the same section-top-space token as the padding. This leaves the heading/eyebrow 2.5rem below the measured sticky header without changing spacing between sections. Main's default scroll margin still applies to destinations already inside section content (including the legacy compare alias). Keep this contract synchronized across mobile/desktop/FAQ spacing and verify heading bounds, not the padded section's outer edge.

HeroBackdrop owns the decorative lavender halo in a clipped, pointer-transparent layer behind Hero content. Hero creates its own stacking context so the negative backdrop layer stays inside its section. The background uses theme palette tokens and one 4.8-second entrance that settles; reduced motion shows the final static halo immediately. It adds no client script or layout height. To compare/revert the visual treatment, set `<Hero background="none" />` in page composition; default is `halo`. Keep glow clipping local to the decorative layer so focus and content remain visible. Check both themes, narrow layouts, reduced motion and pointer interaction when changing it.

The sibling docs use custom Astro components and Pagefind. Both apps consume the theme, primitives and pure helpers from shared/. Validate both sites after changing those shared surfaces. See `../docs/README.md` and `../docs/AGENTS.md` for content coverage and search maintenance.

## Shared site foundations

Read and follow [the shared UI contract](../shared/AGENTS.md) and [ownership/setup guide](../shared/README.md). Cross-site primitives, control catalogs, spacing/radius/focus/motion tokens and format helpers have a single source in `shared/`. App-specific composition stays here. Install `npm ci --prefix shared` before app dependencies; both app checks/formatters include shared source and use the root Prettier config.

Tabs and CardGrid are also used in docs. Preserve existing demo variants/events/data hooks, keyboard handling and no-JavaScript content when changing them. A shared change requires both sites' build/browser checks. Keep native/Astro scope attributes forwarded, the user-selected Box sizes intact, and setup/CI/packaging/catalog references synchronized. Do not fork shared controls or copy documentation-specific search code into the landing.

For cleanup, follow shared/AGENTS.md. Use TextLink for contextual docs CTAs, Icon for menu glyphs, shared createI18n/TranslationShape for locale behavior and shared/lib/serialize.ts for safe metadata. Preserve active runtime/data hooks and compatibility routes. Retired data-reveal, data-panel-group and data-slot markers have no consumers and should not return. Do not keep overridden colors, spacing, utilities or media blocks as a history of previous designs. Verify layout without page-wide overflow clipping. The retired example/ project and its generated dependencies are not part of this site.
