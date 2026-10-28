# Ticker project memory and maintenance contract

<!-- codebase-memory-mcp:start -->

For structural codebase exploration, use the installed `codebase-memory` skill. Check indexed-path coverage and use source reads for stale or missing Astro/CSS coverage.
<!-- codebase-memory-mcp:end -->

## One website, three destinations

Landing (`/ticker/`), Examples (`/ticker/examples/`) and Docs (`/ticker/docs/`) are one site. Their separate directories are build boundaries, not permission to invent separate design systems. Read [shared/AGENTS.md](shared/AGENTS.md), [landing/AGENTS.md](landing/AGENTS.md) and [docs/AGENTS.md](docs/AGENTS.md) before changing the affected surfaces. Update those contracts and READMEs when behavior or architecture changes.

## Lessons that must guide future edits

- Reuse the complete code-rendering contract, not just its toolbar: CodeFrame and the shared Shiki theme must produce the same highlighting in Home, Examples and Docs. Keep whole source/language entries, not manual token arrays, and verify computed colors in both themes plus exact copied text.
- Pause action buttons must display Play while paused and Pause while playing, with a matching accessible name. Do not mix changing action labels with stable-label aria-pressed toggle semantics.
- Inventory existing components before writing markup or CSS. Reuse shared Box, Heading, Button, NavLink, TextLink, Surface, Tabs, CodeFrame/CopyButton, Theme and DrawerStyles. Extract existing presentation when two consumers need it; do not recreate a visually similar control with new CSS.
- Examples must use the actual Home demo: TickerDemo, BrandLogo and SpeedControl, composed through DemoStudio/DemoPanel/DemoFooter. Iframe/srcdoc previews were rejected because they introduced foreign typography, controls, colors and redundant sizing/theme/runtime machinery. Do not restore that approach without an explicit new requirement.
- Preserve behavior hooks when extracting UI: Home Tabs needs data-panel on each DemoPanel root. Test exactly one visible panel and independent remembered speed values. Astro can strip literal whitespace between expressions and inline tags; verify compiled heading text, not only source formatting.
- Give application action hooks their own names (for example data-example-direction), and constrain control queries to native buttons. Reusing the package data-direction attribute accidentally selected ticker wrappers and put button-only ARIA on regions.
- Keep package behavior in its owner. TickerDemo owns controllers; Drawer owns modal animation, gestures, focus and scroll locking; shared CopyButton owns clipboard/reset behavior. Add only the integration needed by the application.
- Preserve the user's Box changes and widths. Box owns gutters and maximum widths. Use scoped component styles/scripts, instance-local arrow-function setup with explicit cleanup, rem fixed lengths and class:list in Astro. Keep editable interface copy and demo data in translation catalogs.
- Use the existing palette, typography, spacing, focus and motion tokens. Do not introduce another font scale, shadow, hover transform or animation per page. Check resting/hover/focus states in both themes, from 320 to 1440 and with enlarged text. Never hide overflow to conceal layout defects.
- Dividers stay straight and visible; hover cards remain between them with equal vertical inset and aligned horizontal edges. Active navigation changes background without an extra border. Docs stays last in the main menu. Anchor headings sit 2.5rem below the measured sticky header; do not add global scroll padding or manual scroll restoration workarounds.
- Make actions recognizable before hover: example jump links use the shared secondary Button, with visible surface/border and a direction cue. Do not use unadorned navigation text as a primary page action. Use direct titles (Ticker examples), not disconnected generic slogans.
- Prefer useful, direct copy to generic slogans. Audit existing information before adding benefits or claims. Preserve docs coverage, migration records, public fragments, attribution and meaningful routes. Verify package APIs and execute copied examples; a screenshot or type check alone does not prove behavior.
- Before calling a website change complete, review it in the browser beside Home, then run affected checks, formatting, combined build/link audit and browser suites. Shared changes require both apps' validation. Record actual results and remaining limits, not assumed success.

## PageSpeed performance contract

Performance is a shared site requirement for Home, Examples and Docs. Preserve readable content, the approved design, accessibility, keyboard controls and package behavior while optimizing. Use this section as the cross-site policy; app/shared contracts describe implementation ownership, and [landing/README.md](landing/README.md#performance-validation--2026-10-19) records dated measurements and limitations.

### Goals and evidence

- Aim for at least 95 mobile performance and 100 desktop, and retain 100 accessibility, best practices and SEO in PageSpeed. These are engineering targets, not guaranteed scores or evidence of complete accessibility. Investigate metric regressions even when the overall score stays green; do not change the design merely to chase a perfect score.
- Track FCP, LCP, TBT, CLS and Speed Index separately. Aim for near-zero initialization CLS and TBT; prioritize visible content and responsiveness over diagnostic counts. Lighthouse TBT is not field INP. Missing field data means unknown real-user performance, not a Core Web Vitals pass.
- The published Home report `jszyvpap9c` on 2026-10-19 measured 97 mobile / 100 desktop. Mobile FCP/LCP were 1.4/1.7 s, TBT 10 ms, CLS 0 and Speed Index 4.4 s; accessibility, best practices and SEO were 100. This predates commit `4d18f4a`; do not describe it as validation of that commit. It covers Home only.

### Loading and asset conventions

- Keep static content and syntax highlighting in generated HTML. Reuse Astro's processed, deduplicated scripts and existing shared components; avoid client hydration, third-party scripts and duplicate runtimes unless a concrete requirement justifies their loading cost. Keep Pagefind lazy and package animation/viewport behavior in the package owner.
- Fonts must come through shared Fonts: three local Latin WOFF2 faces, currently 96.4 KiB total, with `font-display: swap`. Preload only Inter and Instrument Serif for initial headings; do not preload every font or restore Google/Bunny stylesheets. Keep weights, character coverage, hashes, versions and licenses in shared/assets/fonts/README.md. Preserve the separate social-image TTF inputs. Recheck coverage when adding locales or weights.
- Both Astro configs use shared/lib/site-build.mjs. The current policy inlines CSS strictly below 40 KiB of uncompressed content and preserves Vite defaults for other assets. Home and Examples currently have no external stylesheets; the larger Docs stylesheet remains cacheable. Before changing the threshold, compare compressed HTML plus CSS transfer, blocking requests, cold mobile LCP and repeat/cross-route caching. Neither blanket inlining nor eliminating every external stylesheet is a goal.
- Emit highlighted code once. CopyButton reads live rendered source unless a command explicitly overrides it; never duplicate complete snippets in clipboard attributes, hidden markup or client state. Keep Shiki at build time, exact copying, final newlines and execution of complete/split examples.
- Keep hashed assets and valid base paths. Inspect actual response headers before diagnosing cache warnings. GitHub Pages served a 10-minute asset TTL in the recorded report; that is a hosting observation, not an application guarantee. Do not add a service worker, caching proxy or hosting migration just to silence that audit without a separate requirement and evidence.

### Layout, initialization and motion

- Reserve control geometry before scripts run using inert plus visibility:hidden, as CopyButton, Tabs and TickerDemo already do. Keep unavailable actions outside focus/accessibility until ready. Do not replace this with display:none or override native hidden on inactive panels. Preserve readable no-JavaScript content and test delayed-script dimensions after initialization changes.
- Finish initial tab and fragment selection before releasing inert. Initial selection must not animate. Limit interactive feedback to explicit color/background-color transitions on hover/focus, rather than the background shorthand; respect reduced motion.
- Use observer-provided geometry and batch layout reads before writes. Do not measure every Reveal block synchronously during mount or add per-item scroll listeners. Reveal uses the first IntersectionObserver snapshot, arms only offscreen blocks, anticipates entry by 64 CSS pixels and retains the 600ms fade. Initial viewport content must remain visible immediately; disconnect observers on reveal/removal.
- Prefer opacity/transform for entrance motion, with cleanup and reduced-motion alternatives. Avoid layout-property animation, blanket transition:all, persistent will-change on every item and new independent animation systems. The approved HeroBackdrop entrance lasts 4.8 seconds; if Speed Index is slow, inspect the filmstrip and trace before attributing the delay or changing that visual contract. Do not hide meaningful content to improve a score.
- Avoid unnecessary DOM and repeated generated content, while preserving readable originals, runtime-owned ticker clones, all recipes and public fragments. Investigate long tasks and expensive measurements at their owner rather than bypassing runtime behavior. Preserve image dimensions/aspect ratios when adding media, and defer offscreen media rather than the initial LCP content.

### Measurement and completion workflow

1. Record the commit and dirty state, route, date, tool/browser versions, device, throttling and cache conditions. Build the production artifact; do not benchmark a dev server. Capture a baseline before editing. Measure Home, Examples and a representative Docs article separately when shared loading changes; Home's score cannot stand in for the gallery or docs.
2. Compare at least three cold mobile runs per before/after configuration using the same environment and median metrics. Avoid concurrent builds/tests during timing. Report compressed HTML/CSS/JS/font sizes and request changes alongside metrics; also inspect repeat navigation if caching changes. Keep raw reports locally, record reproducible conditions and summarized evidence in the owning README, and do not commit generated reports or machine-specific temporary paths as tooling.
3. Change a bounded cause, compare the result and retain it only with a justified tradeoff. Local HTTP Lighthouse and deployed HTTPS PageSpeed use different environments; never compare their scores as a controlled experiment. Label simulated and observed timings, lab and field data, single runs and medians. Report failed diagnostics as unverified, not passed. The local Lighthouse 12.3.0 / Chromium 151 animation diagnostic failed with RootCauses/frame_sequence; browser regressions checked initial transitions separately.
4. Review Home beside Examples and Docs. Run affected app checks and formatting, site:build/link audit and browser suites; shared changes require both app suites and the combined suite. Preserve loading.spec.ts, reveal.spec.ts, fonts.spec.ts and related responsive, theme, enlarged-text, keyboard, no-JavaScript, copy and lifecycle coverage. Documentation-only edits need formatting/link review, not a new performance benchmark or full browser run.
5. After an authorized commit/push, confirm the deployment's exact head and successful publication, then verify the live artifact/assets before re-running PageSpeed mobile and desktop. A queued workflow or a local green build is not a published improvement. Check job logs, environment approvals, concurrency and GitHub Status when publication stalls; do not change application code or repeatedly restart workflows without evidence.

The `4d18f4a` follow-up improved the median local Home mobile score from 96 to 98, FCP from 1.89 to 1.73 s and LCP from 2.41 to 2.26 s across three runs per configuration. Home gzip HTML increased from 19,842 to 27,416 bytes as its last CSS request moved inline. These local results justify that measured tradeoff; they do not establish a new production score, reproduce the published 4.4 s Speed Index or prove every trace warning was eliminated. Update the dated evidence after future measurements rather than rewriting historical observations.

## Change discipline

Integration language has two loading modes: Package / ESM (package-manager imports) and HTML / CDN (a script tag, CDN-delivered or self-hosted). Global names the window.Ticker namespace exposed by the standalone IIFE; browser is the environment and /browser is an optional importable ID registry, not a third loading mode. Teach ticker() first in both modes; choose direct, registry or declarative ownership separately. Reuse shared mode labels, preserve public fragments, and explain the distinctions in the HTML/CDN guide. Keep translations, README, docs, gallery, skill and tests aligned. Verify release/CDN availability rather than assuming a version header means a published npm release.

Public copied examples teach direct package use: prefer clear variables, arrow callbacks and per-recipe scripts. Do not wrap standalone examples in custom-element classes, `this`, generic data-option parsers or unused control handlers. Internal site components use arrow-function setup and shared mountElements for insertion/removal cleanup; do not use classes or this. Preserve runtime-owned controls, accessible labels and cleanup, and execute every copied CDN/npm recipe after refactoring.

The root CHANGELOG.md is the single release-note source and is loaded into the docs collection. Mark actual API removals/incompatibilities under Breaking changes and distinguish behavior changes; preserve verified historical notes and label gaps rather than inventing release details. The former migration route redirects to the changelog.

The root README is the public package guide: installation, usage, API, examples, documentation and agent integration. Complement that material without replacing it with website architecture or maintenance details; those belong in the app/shared READMEs and AGENTS contracts.

Preserve unrelated user edits. Follow the user's Git instructions; a local commit or merge does not publish. Do not leave obsolete adapters, generated preview runtimes, unused files or superseded CSS after a refactor. When package APIs, version, distribution, site routes or shared UI change, update examples, docs, links, metadata, tests and maintenance notes in the same change. These notes capture accepted project decisions, not permission to override future user instructions.

The public Ticker integration skill is maintained in skills/ticker/SKILL.md and downloaded through the landing endpoint. It teaches package use, not this repository's personal design preferences. Update its version/API guidance with package changes and keep the general README's package installation, usage, URLs and agent installation steps current. Docs metadata and accessibility checks cover every article, including structured breadcrumbs and both themes.

## Ticker 2.2 runtime contract

Playback intent, automatic pause causes, CSS-animation seeking, logical navigation, vertical measurements and viewport rules belong to the package runtime. Site demos call play()/pause(), state/on() and connectControls() rather than implementing pause CSS or gesture/rail controllers. Horizontal left/right stay physical; auto uses inherited writing direction, while next/previous and position are logical. Axis changes reset position; same-axis updates preserve pixels modulo the measured period. Keep pinned versions, public skill and copied recipes synchronized. Site demos import the public package stylesheet directly; do not copy its runtime rules into component CSS. Runtime browser tests live in landing/e2e/runtime.spec.ts alongside the site suites.

An empty original sequence has no repeat distance even when the track has a gap. Leave it not ready and clone-free, then recover on refresh/resize after insertion. Dynamic demos use pixel speed to avoid acceleration as items are added or removed, and existing gallery examples keep their original order.

`resumeAfterDrag` defaults to false. Opting in restores playback requested before dragging only when no explicit intent command intervenes; hover/focus and other automatic pauses still apply. Keep its data attribute, types, copied recipes and browser regression coverage synchronized. Vertical example direction controls use the existing shared Button group and update the owning TickerDemo controller.

Mixed-language runnable examples use shared CodeFiles (Tabs + TabPanel + CodeFrame), with HTML, CSS and JavaScript files and an optional Complete file tab. Keep single-language API snippets focused. File copies must reference actual sibling filenames and retain package CSS/import/script ordering; the gallery's complete and separate variants share their generator. Test exact copying, nested tab keyboard behavior, no-JavaScript labels, both themes, overflow and execution of both variants. Do not create a second highlighter, clipboard handler or per-page tab controller.

Titles share Heading and PageTitle rather than page-local font rules. Heading separates semantic level from the controlled display/section scale; PageTitle composes the eyebrow, title and description. Keep the approved Home Inter/Instrument Serif pairing, weight, tracking and spacing tokens. Editorial accent text is an explicit trailing part of the translated title (titleAccent in docs frontmatter); never infer the last word or split API identifiers. Keep the full title unchanged in metadata/search and verify compiled whitespace, both themes, responsive sizes and enlarged text. API identifiers and single-word headings can remain entirely in the primary font.

Npm publication is runtime-only: package.json files allows dist/ and CHANGELOG.md; npm also includes package.json, README.md and LICENSE.md. Explicitly exclude landing/, docs/, shared/, development scripts, source, tests and agent memory in .npmignore. Test the actual npm pack manifest, not just ignore patterns: test:package rejects any file outside that contract. Keep 2.2.0 references while preparing its release; publication is the maintainer's action.

Enlarged text must be tested against the full rendered page, not just the new heading. Shared text buttons use min-height and allow wrapping; fixed heights/nowrap can push their arrows outside mobile gutters. Grid copy columns use minmax(0, 1fr) and allow long inline API identifiers to wrap. Do not clip these defects. Keep single-app browser tests independent of sibling output; CI also builds and tests the combined artifact for cross-route contracts.

Interactive site code uses arrow functions, with named functions only when useful; no classes or `this`. Components register small setup functions with `shared/lib/mount-elements.ts`, keep state in closures and return cleanup. Existing ticker-* tags are scoped DOM roots, not registered custom elements. Call package controllers directly; keep recipe content editing in ExamplePreview and controller setup in TickerDemo. Generate copied files in landing/src/lib/recipes with separate markup, styles, behavior and file assembly. Preserve controllers on persisted pagehide so browser back/forward restoration keeps working; clean up only on a real departure.

## Maintenance audit — 2026-10-19

Home and Examples must read like consumer integrations. Import `ticker` and its types from `@samline/ticker`, and load `@samline/ticker/style.css`; the landing's Vite/TypeScript aliases only connect those public imports to this checkout. Do not reach into render/state helpers, copy runtime CSS, rewrite package measurements or add another controller API. Application content editing belongs in ExamplePreview. Keep blank lines between authored markup, script and style blocks, including generated complete examples, and run Prettier on both source and copied files.

The 15 site classes were replaced with arrow-function setup and closure state. Shared mountElements owns insertion/removal cleanup, including removal and reinsertion in one mutation batch; that case must close an open Drawer and release scroll locking. Retain native events and necessary state notifications, rather than forwarding command-event chains around controller calls. The convention test parses maintained TypeScript and Astro scripts to reject class declarations/expressions and this.

The optimization review removed the hand-maintained runtime stylesheet and measurement observer/conversion, and moved markup/styles/behavior/file assembly out of ExampleRecipe. Recipe theme loading now happens once in its module. These are reductions in duplicated logic and maintenance work; no before/after performance benchmark was collected, so do not claim a measured runtime speedup.

Bounded graph, coverage and source-reference review found no additional unreferenced maintained component/helper candidates or empty maintained directories. Read Astro/CSS and dynamic asset paths directly where indexing was incomplete. The seven graph zero-degree function candidates were live entrypoints, configured hooks, exported helpers or test callbacks. Preserve the TTF social-image inputs, WOFF2 website fonts and licenses, public redirects/fragments, all 23 documentation articles/33 migration records, and installed upstream skills. Do not delete them based on an import-count heuristic.

All five root test files, four landing Node test files, ten landing browser specs and six documentation browser specs are connected to validation commands/configurations and cover distinct contracts. Keep them. Generated reports, caches, environment files and npm archives are ignored; authored tests/configuration remain tracked. Removed the obsolete bunchee build-artifact ignore and the redundant landing/docs .gitignore files; the root ignore now owns all shared exclusions. The npm manifest smoke test still permits only dist/ plus package.json, README.md, LICENSE.md and CHANGELOG.md (46 files in this review).

Persisted pagehide preserves controllers/listeners for back/forward restoration. A non-persisted departure aborts copied-example listeners and destroys its controllers; use the same lifecycle guidance in docs and the public skill. Regression checks exercise both persisted transitions and the later real cleanup, plus separate/complete CDN and ESM output.

Validation for this review: landing:check passed with zero Astro diagnostics and 17 Node tests; docs:check passed with zero diagnostics and complete article/source coverage; both app format checks passed. site:build verified 1,882 links across 41 generated pages. All 48 landing browser tests and 27 combined documentation browser tests passed, including narrow/enlarged-text, both themes, no-JavaScript, keyboard, copy and reconnect coverage. The copied CDN/ESM complete/split execution test passed again after the final blank-line and abortable pagehide-listener changes. Inspected Home, Examples and Docs screenshots in both themes. The package build and test:package passed, including the actual npm dry-run manifest. Persisted pagehide/pageshow was simulated in Chromium; this does not claim a separate native browser-history cache benchmark. No package API, version or publication changed.

## Reusable theme synchronization

The companion template is https://github.com/samline/package-landing-docs, local sibling ../package-landing-docs. Its UPSTREAM.md records deliberate ports; REFERENCE.md/design-reference.json pin the reviewed Ticker revision. The first synchronization after c74ec91 reviews a5ed5ae, 24b4c19, a4c2899 and 4d18f4a. Keep that reference current when reusable site conventions change; compare committed source, not another agent's uncommitted changes.

Transfer shared presentation, arrow setup/mountElements cleanup, live-code clipboard ownership, WOFF2 Fonts, CSS-loading policy and regression coverage. Keep package controllers, source aliases, content editing and real integration recipes specific to their package. The template has a neutral counter and its own identity/base/audit tests; do not replace those with Ticker-only assumptions. A successful build is not semantic documentation coverage.

Upstream timing/transfer measurements do not establish gains in another site. Recheck delayed controls, first-viewport reveals, no JavaScript, font requests, reconnects, persisted pagehide and enlarged text after adapting loading behavior. Parent component selectors must express intended precedence rather than rely on stylesheet order; CSS inlining can expose previously masked equal-specificity display rules. Preserve font-source notices separately when browser WOFF2 and social-image TTF inputs have different provenance.

Drawer destroy closes its modal but does not emit the application onOpenChange callback. Cleanup resets application-owned aria-expanded after destroying the owned controller for Home menu, Docs menu and Search. Preserve native locking/focus/isolation ownership. The added same-batch reinsertion regressions passed with 51 Landing and 29 combined Docs browser tests; both app checks and the 1,882-link/41-page site build passed. No package runtime API or new PageSpeed measurement changed.

## Host integrations — 2026-10-20

Keep Framework integrations as a useful guide, not a replacement for lifecycle reference. React/Vue/Svelte, Astro, Shopify and WordPress use verified public APIs; there are no restored framework adapter exports. Shared FrameworkExamples accepts source groups and composes Tabs/CodeFiles without another renderer/controller. CMS catalogs own package-specific code; loaders run once and clean up only their widget. Test actual copied components, asset ordering, independent instances, host events and cleanup. Framework unmount removes framework-owned children after package destroy; do not assert those children remain in detached elements. CMS fixtures are not live-host deployment evidence. The guide brings the current article inventory to 24; keep metadata/accessibility discovery and coverage checks aligned.

## Drawer dependency — 2026-10-21

Both apps pin the published @samline/drawer 5.0.2. Home menu, Docs menu and Search import createDrawer from the root entry, clone their existing DOM/template content through a native content factory and retain the returned controller. Destroy that exact owner during cleanup; do not look it up again by id or restore removed browser.newDrawer/destroyDrawer helpers. Preserve application-owned ARIA reset, abortable listeners, Pagefind/debounce behavior, native modal/scroll/focus ownership and the scoped public vendor stylesheet. Verify independent/reopened instances, detach/reinsert in one mutation batch, search dragging, focus and background scroll. Keep package locks current; a version label alone is not a migration. This is a site dependency change, not a change to the documented package's API or version.

Validation for this dependency migration: clean npm ci installs resolved 5.0.2 in both apps; both Astro checks, 17 landing Node tests and both formatting checks passed. The combined build audited 2,013 links across 42 pages. Eight landing navigation/lifecycle tests and nine combined Docs menu/search tests passed, including both themes, focus, scroll, native search dragging, debounce and same-batch reinsertion. This bounded change did not alter shared presentation or collect new performance measurements.

## Public README structure

Keep sibling READMEs aligned around identity and resource links, a table of contents, Installation, Quick start, optional HTML / CDN, Capabilities, API at a glance, Documentation, Changelog, AI agent skill and License. Package-specific lifecycle, entrypoint and TypeScript details remain subsections; preserve meaningful public anchors. Runtime READMEs teach the actual package, not website internals. The template uses the same progression but describes its configuration/commands and adaptation workflow rather than inventing a runtime API or npm installation. Keep release notes in CHANGELOG.md and link to them. Keep skills discoverable with a real source/download path and agent-dependent installation guidance. Review snippets, local/external links and formatting after documentation changes; no browser or performance run is needed for README-only edits.

## Documentation navigation visibility — 2026-10-26

The human reported that deep active sidebar links were hidden below the menu
viewport in Astro, Ticker, Drawer and the package landing/docs template. Keep the
current page visible within the menu on mounting/navigation/resize, without
scrolling the article or stealing focus. Preserve manual menu exploration and
clean up observers through mountElements. Mobile menus let Drawer focus their
dialog rather than an offscreen first link. Regression tests cover direct deep
URLs, actual navigation, resize, same-batch remount and repeated mobile opening.
Validation: Docs and Landing checks passed with zero Astro diagnostics;
combined build verified 2,013 links across 42 pages. An initial broad Docs run
passed 31 tests with five optional host-fixture skips. After the final mobile
body correction, all three selected browser tests passed: desktop current-page
visibility, mobile/enlarged-text/close behavior and all-article accessibility.
The combined artifact was refreshed from those final Docs. This does not claim
new runtime/package publication validation.

The human clarified active-page placement: try to bring it toward the top
using the menu's natural scroll range. Do not add margins, padding, pseudo
spacers or any artificial blank space to force final items upward. Native
scrollTop clamping is intentional. Preserve the article position, manual menu
scrolling and the reachable mobile close control. The temporary spacer approach
was rejected and removed from all four projects.

Natural-scroll correction validated: both targeted browser regressions pass in
each of the four projects (eight total). All combined artifacts rebuilt and
passed their link audits. The SEO preview was inspected: article scroll remains
0, the sidebar has no generated ::after content and no trailing-space variable.

## Navigation integration contract

Ticker owns smooth seeking and the transient navigation pause cause. Controller
methods and connected controls accept behavior/duration/preservePlayback, with
instant/pause as compatible defaults. Preserve requested intent rather than
resuming from every navigate event; navigationSource distinguishes controls,
range, keyboard, API and drag. Cancel pending transitions on competing commands,
drag, changed geometry, explicit refresh, reduced motion and destruction. An
unchanged automatic measurement must not cancel a running step. Keep the live
manual-navigation example, copied files, public skill and API types aligned.
