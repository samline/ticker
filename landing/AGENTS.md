# Landing implementation and maintenance contract

Follow the root [PageSpeed performance contract](../AGENTS.md#pagespeed-performance-contract) for targets, loading conventions, measurement evidence and deployment verification. Keep route-specific implementation details here.

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
- Astro deduplicates processed scripts. Use arrow-function setup with local queries/state and explicit cleanup through shared mountElements. Do not use classes, this, custom-element lifecycle methods or chains of application command events. Release listeners, observers, timers and package controllers. Test multiple instances and removal/reinsertion.
- Anchor required `:global()` selectors beneath an owned root for slots or library-generated DOM. Never style unrelated matching classes throughout the page. Prefer props, tokens and utilities to a parent styling another component's internals.
- Delegate behavior already provided by a dependency. Do not reimplement Drawer animations, focus trapping, Escape/backdrop handling, its trigger or close button. MobileMenu uses `createDrawer`; only link dismissal, desktop transitions, accessible state and teardown belong to the integration.
- MobileMenu imports the original vendor CSS with `?inline`, normalizes fixed pixel lengths to rem and emits it inside native `@scope (ticker-mobile-menu)`. Keep scope explicit and verify target-browser support. Its regular style owns panel appearance and accessibility overrides. Do not add a parser or hand-maintained animation copies for this boundary.
- TickerDemo imports ticker and style.css through the public @samline/ticker entrypoints, as a consumer would. The landing Vite/TypeScript aliases resolve those imports to this checkout for development; consumers install the package normally. Keep only demo presentation in scoped component CSS; do not copy runtime CSS, rewrite measurements or use private runtime helpers.
- Theme owns the intentional shared document preference and inline head initialization. Keep storage failure safe, system/manual behavior consistent and theme-color literals synchronized with palette changes. Namespace storage keys, DOM roots and events appropriately when reusing the landing.

## Copy, examples and information design

- Put all editable UI text in `src/i18n/translations/<locale>/`: headings, navigation, descriptions, accessible names, metadata, sample/demo content, code source and language identifiers and client feedback. Use `getI18n(Astro)` and descriptive keys.
- Use complete messages with named placeholders through `format`. Rich translations render as escaped text; code source is safely highlighted by shared CodeFrame; catalogs contain no executable HTML. Pass resolved client messages through instance-owned data attributes, not entire dictionaries.
- Keep every locale compatible with `TranslationDictionary` and register it in `dictionaries`. English is the current language. Adding a catalog does not create locale routes or a language selector; add those only with a corresponding requirement and metadata plan.
- Preserve structural identifiers, code syntax and placeholder names when translating. Do not move copy into arbitrary TypeScript objects to evade the AST source-copy audit; the audit is not exhaustive.
- Audit the existing landing before adding content. Each section must answer a distinct question. Prefer concrete verified recipes over another list of benefits. The Recipes section adds partial updates, original-source edits/clone synchronization and registry cleanup; the former responsibility table belongs in docs.
- Keep the demo's integration note visible with reduced motion: the library manages movement, while integrations must supply pause controls and meaningful readable originals.
- Verify public API claims against package source and reference docs. Execute displayed snippets after relevant changes. Distinguish direct controller destruction from registry destruction; do not copy another package's method names or lifecycle contract.
- Read package name/version/author from the manifest where implemented. Still search for hardcoded versions, CDN imports, repository/npm/license URLs and measured claims when metadata changes. A derived version label does not update every prose reference.
- Keep illustrative prices, brand samples, asset attribution and license records clear. Rebuild/remeasure bundle-size claims when the package or selected entrypoint changes; do not preserve obsolete numbers as permanent marketing copy.

## Accessibility and validation

- Main consumes shared Fonts for local WOFF2 faces and selective heading preloads. Preserve the separate social-image TTF inputs and licenses. CopyButton, Tabs and TickerDemo reserve their control space with inert and visibility:hidden until ready; keep unavailable controls out of focus/accessibility while retaining readable no-JavaScript content. Run loading.spec.ts for delayed-script geometry and local-font requests after changing initialization.
- Both Astro configs share lib/site-build.mjs for the 40 KiB stylesheet inlining threshold; compare cold mobile LCP, HTML size and cacheable CSS before changing it. Preserve Vite's default treatment of non-CSS assets.

- Preserve semantic headings, section labels, skip-link behavior, visible focus and appropriate ARIA. Use native controls. Tabs support arrows/Home/End; modal menus retain focus, restore it on close and dismiss correctly on desktop transitions.
- Support both light and dark themes, reduced motion, blocked storage and JavaScript-disabled content. Respect hover capability and reduced motion for button feedback. Keep static ticker content and intentional code scrolling keyboard reachable.
- Check 320 through 1440 and back, both sides of breakpoints, all demo tabs and enlarged root text. Stack narrow actions and allow navigation/tabs to wrap. Do not use overflow clipping to conceal buttons or copy that do not fit.
- Test repeated controls/menus, unique DOM/ARIA IDs, unrelated matching classes and disconnect/reconnect cleanup when behavior changes. Review contrast in both themes. Automated axe results are evidence, not a claim of complete conformance.
- Run `npm run landing:check`, `npm --prefix landing run format:check` and `npm run landing:build` after maintained source changes. Build before `npm --prefix landing run test:browser`; run relevant browser checks for UI/behavior changes. The suite uses the compiled base path and an isolated foreground preview with `--ignore-lock`.
- Use `npm run site:build` for the combined release artifact. A standalone landing build may include stale existing documentation output. Check links/fragments and execute examples against current package behavior.
- Format authored landing files with its Prettier script. Leave `.agents/`, `skills-lock.json`, npm locks, generated output and third-party assets untouched by formatting. The root .gitignore owns generated-output, environment and browser-report exclusions for every app; do not duplicate it in app directories.

## SEO and publication contracts

- Keep SEO metadata in SEO.astro and its copy in the catalog. Derive canonical, sharing, sitemap and robots URLs from validated SITE_URL, never request/preview hosts. Keep development noindex.
- Escape JSON-LD through `serializeJsonLd`; escape generated-image text as XML. `set:html` may render this safe structured data and the trusted scoped vendor stylesheet, not translated interface HTML.
- Preserve the generated social image, source-package schema, description, keywords, accessible image text and absolute sharing URLs. Only include factual supported claims; verify output after edits. Social artwork uses shared dark palette tokens, translated copy and bundled Inter/Instrument Serif fonts with their licenses; disable system fonts to keep CI rendering reproducible. Inspect the generated 1200×630 PNG after typography or layout edits.
- Repository deployments have a base path. Use BASE_URL for local links/assets. A domain/base change must update Astro/default SITE_URL, docs Astro config, documentation paths, redirects, sitemap packaging, output assertions, browser config/test URLs and workflows together.
- Current deployment: landing `/ticker/`, documentation `/ticker/docs/`. `include-docs.mjs` copies sibling `docs/dist/` and merges sitemap entries. Adapt/remove this contract when replicating into a project without that docs site.
- Keep landing `trailingSlash: 'ignore'` and a slashless non-root Astro `base` so `/ticker` and `/ticker/` both resolve. The Vite `import.meta.env.BASE_URL` definition retains the slash-terminated deployment pathname for existing asset/link composition; verify both routes and built links after config changes.
- Preserve useful existing fragments and redirects during renames. Navigation now uses `#recipes`; `#compare` remains a compatibility alias.
- A commit or local merge is not a push or publication. Preserve unrelated user work and follow the user's Git instruction. When working on a task branch, use the project's codex/ naming convention; merge/delete it when requested.

## Keep references synchronized in the same change

| Changed surface                       | Required review                                                                                                                          |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Package metadata/version/distribution | Root manifest, manifest imports, common/SEO catalogs, hardcoded URLs/CDN examples, FAQ measurements, docs and sharing image              |
| API/entrypoint/lifecycle              | Demo adapters, setup/recipe/FAQ/features copy, snippets, reference docs, browser expectations and runnable examples                      |
| Package CSS or generated DOM          | Public stylesheet import, demo presentation selectors, theme and repeated-instance checks                                                |
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

## Examples page

Keep examples/ as a direct child page of the landing, with the same Main, Header, Footer, typography, palette and interactions. Use ExamplePreview with TickerDemo, BrandLogo, Button and SpeedControl. DemoStudio, DemoPanel and DemoFooter are extracted from the actual Home LiveDemo and consumed by both pages. Do not use iframe/srcdoc previews, independent theme propagation, native controls with separate styling or a second preview runtime build. Those produced the rejected visual mismatch.

ExampleRecipe generates complete standalone CDN/npm HTML documents for copying, formatted with root Prettier options. Standalone files require their own encapsulated setup; they must not become the site's UI implementation. Drive copied files and native previews from the same translated recipe content and initial settings. Clearly explain that interactive preview edits do not rewrite copied source, and disclose any control differences (individual preview row pause versus combined standalone pause).

TickerDemo owns package controllers, pause handling, measured rem conversion and lifecycle cleanup. Parent examples only send instance-local duration/direction/append/refresh events; they must not duplicate ticker initialization. Copied examples are executed in browser tests using bundles generated in memory, without shipping a second set of preview assets. Preserve manifest-version CDN URLs and licensed embedded SVG attribution. Check both themes, responsive/enlarged text, repeated controls, reduced motion/no-JavaScript and native preview accessibility.

Header/mobile links use lib/navigation.ts so home fragments work from examples/. Keep Docs last and distinguish current page from current home section. SEO must derive the route canonical while keeping site/software identities and social assets at the root. Keep docs gallery links, sitemap, release validation and maintenance notes aligned.

Keep Home LiveDemo's data-panel hooks on DemoPanel roots; shared Tabs requires them for visibility and ARIA relationships. Verify exactly one visible panel and per-ticker speed persistence. Gallery direction controls use shared Buttons with aria-pressed in a named group, not panel-less tabs. Compile and inspect heading word spacing; adjacent Astro expressions/inline elements can lose literal whitespace. Use an explicit string expression when needed.

The distributable Ticker integration skill lives in ../skills/ticker/SKILL.md and is served by the build-time skills/ticker/SKILL.md endpoint. Do not install it into users' agents automatically. Keep version/contracts aligned with the package, preserve self-contained downloads and audit the endpoint links.

Example code disclosures align summary text, notes, tabs and CodeFrame to the same inner inset. Group notes with a single gap, remove the final TabPanel's bottom margin, and keep bottom padding equal to horizontal padding. The body grid needs minmax(0, 1fr) so long source lines scroll inside CodeFrame instead of expanding the document. Responsive checks must include an open code disclosure.

Recipe sections own the single divider between examples. Keep code disclosures borderless so their bottom edge does not duplicate the next section's top border. Use 2.5rem vertical padding per recipe (2rem below 48rem), keeping the combined space between recipes compact and anchor compensation synchronized.

Share syntax rendering as well as the frame. Use CodeFrame text/language with the shared Astro/Shiki theme; CodeBlock only adapts catalog copy/filenames. Preserve whole source strings rather than manual syntax-token arrays. Markdown/MDX in docs uses the same theme and container. Verify computed colors and exact source copying across Home, Examples and Docs in both themes.

CodeFrame emits each snippet once. Shared CopyButton copies the current rendered code at click time unless an explicit text override is supplied; keep the installation command override and avoid duplicating all gallery sources in data-copy-text. Validate exact copied file execution and HTML transfer size when changing this boundary.

Pause controls use changing action labels (Pause animation / Play animation) and matching accessible names. Keep per-instance data attributes and state inside TickerDemo. The copied recipe uses the same translated messages. Changing-action buttons do not use aria-pressed; stable-label toggle semantics must not be mixed with this pattern.

## Ticker 2.1 runtime contract

Playback intent, automatic pause causes, CSS-animation seeking, logical navigation, vertical measurements and viewport rules belong to the package runtime. Site demos call play()/pause(), state/on() and connectControls() rather than implementing pause CSS or gesture/rail controllers. Horizontal left/right stay physical; auto uses inherited writing direction, while next/previous and position are logical. Axis changes reset position; same-axis updates preserve pixels modulo the measured period. Keep pinned versions, public skill and copied recipes synchronized. Site demos import the public package stylesheet directly; do not copy its runtime rules into component CSS. Runtime browser tests live in landing/e2e/runtime.spec.ts alongside the site suites.

Keep original gallery recipes and their jump links first in the established order; append new examples rather than displacing existing ones. Dynamic feeds use pixel speed so additions/removals do not change pace. Item mutation and selection belong to the demo integration, not new package DOM APIs; refresh originals after editing and cover remove-first/last/selected plus empty recovery. Vertical previews use readable illustrated content cards rather than horizontal separators stacked as extra rows. Keep copied CDN/npm files synchronized with native previews.

`resumeAfterDrag` defaults to false. Opting in restores playback requested before dragging only when no explicit intent command intervenes; hover/focus and other automatic pauses still apply. Keep its data attribute, types, copied recipes and browser regression coverage synchronized. Vertical example direction controls use the existing shared Button group and update the owning TickerDemo controller.

Brand attribution links target the rendered attribution page, backed by `public/assets/brands/sources.json`. Preserve the bundled license/disclaimer and label direct Markdown links as downloads. Do not imply every individual mark is CC0 or grants trademark rights.

The drag-playback recipe complements manual navigation. Its Resume after drag button uses stable-label aria-pressed semantics, with visible On/Off state. Toggle through the owning TickerDemo controller and retain intent; do not implement separate gesture behavior in the example.

Standalone copied recipes are teaching examples: use direct ticker calls, clear variables and arrow callbacks. Generate only per-recipe controls/options; avoid classes, this, generic data-option parsing and unrelated handlers. Internal site integrations use arrow-function setup and shared mountElements for repeated instances and removal cleanup; do not use classes or this. Test every copied CDN/npm example including dynamic removals, vertical controls, drag resumption, initial pause and multiple rows.

Use the shared integration labels Package / ESM and HTML / CDN. CDN is delivery, Global describes window.Ticker from the standalone script, and /browser is the optional imported registry; do not present them as competing loading modes. Direct ticker() is the introductory API in either setup; registry/page-manager ownership is a separate decision. Preserve old technical IDs and heading fragments even when visible labels improve. The public skill follows this distinction and the package runtime contract, while repository memory keeps site-specific architecture and visual conventions.

Mixed-language runnable examples use shared CodeFiles (Tabs + TabPanel + CodeFrame), with HTML, CSS and JavaScript files and an optional Complete file tab. Keep single-language API snippets focused. File copies must reference actual sibling filenames and retain package CSS/import/script ordering; the gallery's complete and separate variants share their generator. Test exact copying, nested tab keyboard behavior, no-JavaScript labels, both themes, overflow and execution of both variants. Do not create a second highlighter, clipboard handler or per-page tab controller.

Titles share Heading and PageTitle rather than page-local font rules. Heading separates semantic level from the controlled display/section scale; PageTitle composes the eyebrow, title and description. Keep the approved Home Inter/Instrument Serif pairing, weight, tracking and spacing tokens. Editorial accent text is an explicit trailing part of the translated title (titleAccent in docs frontmatter); never infer the last word or split API identifiers. Keep the full title unchanged in metadata/search and verify compiled whitespace, both themes, responsive sizes and enlarged text. API identifiers and single-word headings can remain entirely in the primary font.

Examples shares Home’s centered opening, HeroBackdrop, narrow title container and medium demo width. Its compact jump index precedes numbered SectionHeading recipe blocks with Home’s section spacing; code stays in the shared native disclosure. Keep the halo’s containing section tall enough for its gradient to fade naturally. Recipe anchors align the heading group (including its eyebrow) 2.5rem below the sticky header.

Reveal anticipates viewport entry by 64 CSS pixels, regardless of content height (threshold 0), and uses the shared 600ms duration with ease-ui so the fade remains visible. Use the first IntersectionObserver geometry snapshot to arm only offscreen blocks; do not synchronously measure each block during mounting. Preserve immediate initial-viewport content, reduced-motion/no-JavaScript readability and observer cleanup.

Interactive site code uses arrow functions, with named functions only when useful; no classes or `this`. Components register small setup functions with `shared/lib/mount-elements.ts`, keep state in closures and return cleanup. Existing ticker-* tags are scoped DOM roots, not registered custom elements. Call package controllers directly; keep recipe content editing in ExamplePreview and controller setup in TickerDemo. Generate copied files in landing/src/lib/recipes with separate markup, styles, behavior and file assembly. Preserve controllers on persisted pagehide so browser back/forward restoration keeps working; clean up only on a real departure.

The Examples gallery ends with a translated possibilities paragraph before its resource links. It invites developers to combine package capabilities with their own content, design and interactions, rather than presenting the gallery as an exhaustive list. Preserve the existing gallery composition and use its established typography and layout utilities; do not turn this closing into another banner or CTA. The same intent is maintained in the companion template.

Connected navigation arrows and rail arrow keys use `itemsPerStep` (default 1) with smooth motion by default on both axes, measured by the package from direct sequence children excluding `aria-hidden="true"` decorations. Explicit `behavior: 'instant'` and reduced motion disable smoothing. Multi-item movement retains the first incoming item; positive pixel `step` overrides this behavior. Keep the live manual-navigation recipe, copied files, controller reference and public skill synchronized. Pixel seeking, pointer dragging and range input retain their existing contracts.

Item navigation must reveal content inside the readable viewport, excluding wrapper borders and honoring CSS scroll-padding for application-owned fades/overlays. TickerDemo ties its horizontal scroll-padding to the fade width and clears it for vertical layouts. Verify actual link/card visibility outside overlays, not only a mathematically aligned outer edge.

The dynamic recipe demonstrates removal by stable data-example-item key and current position. Display positions from 1 while using zero-based indexes in scripts, keep selection valid after edits and disable removal when empty. Copied CDN/ESM complete and split files must execute both removal paths and synchronize clones through refresh().

Rapid same-direction connected-arrow clicks and rail keys accumulate at the pending destination. Reversals discard pending steps and calculate from the visible position; every retarget starts there without a positional jump and restarts duration. Project original item geometry at the pending destination without seeking the DOM, retaining signed travel across multiple cycles. Keep this policy inside the runtime, with no application queue or disabled controls. Pixel API seeks, range input, Home/End and existing cancellation commands replace/cancel pending steps. Test both axes, physical directions, RTL, grouping, cycle crossings, keyboard, reversals and cancellation.

Featured-menu and featured-logo previews compose TickerDemo, shared Button and BrandLogo. The package owns the fixed original, clone exclusion, positioning and focus reveal; ExamplePreview owns only category selection/ARIA. BrandLogo forwards native attributes so the actual direct item can carry data-featured. Preserve the first twelve recipes' order. Copied files share pinned release delivery; notes distinguish prepared releases from npm/CDN availability. Featured menu copies enable interactiveClones and delegate stable category keys to the original before setFeatured; every visible repeated button must select its category.

Playback feedback distinguishes requested intent from effective movement. TickerDemo and copied files display hover/focus reasons while preserving the manual Pause/Play action. Featured recipes explicitly opt out of hover pause, enable navigation/resume-after-drag, keep keyboard focus pause, and expose axis-aware position controls. Keep their selected-category content and labeled partner card consistent between preview and copied files. Use distinct hooks for playback explanations and application update announcements.

Playback explanations must reserve their wrapped geometry with accessibility-hidden message samples. Showing or clearing hover/focus feedback must not move controls between pointer down and pointer up; verify the actual Pause click after keyboard selection in previews and copied files.

The 2.5.0 manual-navigation example opts into `resumeDelay: 1500` in TickerDemo
and its generated complete/split files. Ticker owns the timer and cancellation;
do not add a site queue, disabled arrows or application play() timeout. Other
recipes retain the zero default. Keep preview/copy execution tests aligned.
