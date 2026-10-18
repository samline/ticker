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
- Preserve the user's Box changes and widths. Box owns gutters and maximum widths. Use scoped component styles/scripts, instance-local custom elements with disconnect cleanup, rem fixed lengths and class:list in Astro. Keep editable interface copy and demo data in translation catalogs.
- Use the existing palette, typography, spacing, focus and motion tokens. Do not introduce another font scale, shadow, hover transform or animation per page. Check resting/hover/focus states in both themes, from 320 to 1440 and with enlarged text. Never hide overflow to conceal layout defects.
- Dividers stay straight and visible; hover cards remain between them with equal vertical inset and aligned horizontal edges. Active navigation changes background without an extra border. Docs stays last in the main menu. Anchor headings sit 2.5rem below the measured sticky header; do not add global scroll padding or manual scroll restoration workarounds.
- Make actions recognizable before hover: example jump links use the shared secondary Button, with visible surface/border and a direction cue. Do not use unadorned navigation text as a primary page action. Use direct titles (Ticker examples), not disconnected generic slogans.
- Prefer useful, direct copy to generic slogans. Audit existing information before adding benefits or claims. Preserve docs coverage, migration records, public fragments, attribution and meaningful routes. Verify package APIs and execute copied examples; a screenshot or type check alone does not prove behavior.
- Before calling a website change complete, review it in the browser beside Home, then run affected checks, formatting, combined build/link audit and browser suites. Shared changes require both apps' validation. Record actual results and remaining limits, not assumed success.

## Change discipline

Integration language has two loading modes: Package / ESM (package-manager imports) and HTML / CDN (a script tag, CDN-delivered or self-hosted). Global names the window.Ticker namespace exposed by the standalone IIFE; browser is the environment and /browser is an optional importable ID registry, not a third loading mode. Teach ticker() first in both modes; choose direct, registry or declarative ownership separately. Reuse shared mode labels, preserve public fragments, and explain the distinctions in the HTML/CDN guide. Keep translations, README, docs, gallery, skill and tests aligned. Verify release/CDN availability rather than assuming a version header means a published npm release.

Public copied examples teach direct package use: prefer clear variables, arrow callbacks and per-recipe scripts. Do not wrap standalone examples in custom-element classes, `this`, generic data-option parsers or unused control handlers. Internal site components may retain custom elements for their real mount/disconnect lifecycle. Preserve runtime-owned controls, accessible labels and cleanup, and execute every copied CDN/npm recipe after refactoring.

The root CHANGELOG.md is the single release-note source and is loaded into the docs collection. Mark actual API removals/incompatibilities under Breaking changes and distinguish behavior changes; preserve verified historical notes and label gaps rather than inventing release details. The former migration route redirects to the changelog.

The root README is the public package guide: installation, usage, API, examples, documentation and agent integration. Complement that material without replacing it with website architecture or maintenance details; those belong in the app/shared READMEs and AGENTS contracts.

Preserve unrelated user edits. Follow the user's Git instructions; a local commit or merge does not publish. Do not leave obsolete adapters, generated preview runtimes, unused files or superseded CSS after a refactor. When package APIs, version, distribution, site routes or shared UI change, update examples, docs, links, metadata, tests and maintenance notes in the same change. These notes capture accepted project decisions, not permission to override future user instructions.

The public Ticker integration skill is maintained in skills/ticker/SKILL.md and downloaded through the landing endpoint. It teaches package use, not this repository's personal design preferences. Update its version/API guidance with package changes and keep the general README's package installation, usage, URLs and agent installation steps current. Docs metadata and accessibility checks cover every article, including structured breadcrumbs and both themes.

## Ticker 2.1 runtime contract

Playback intent, automatic pause causes, CSS-animation seeking, logical navigation, vertical measurements and viewport rules belong to the package runtime. Site demos call play()/pause(), state/on() and connectControls() rather than implementing pause CSS or gesture/rail controllers. Horizontal left/right stay physical; auto uses inherited writing direction, while next/previous and position are logical. Axis changes reset position; same-axis updates preserve pixels modulo the measured period. Keep pinned versions, public skill, copied recipes and the scoped package CSS adaptation synchronized. Runtime browser tests live in landing/e2e/runtime.spec.ts alongside the site suites.

An empty original sequence has no repeat distance even when the track has a gap. Leave it not ready and clone-free, then recover on refresh/resize after insertion. Dynamic demos use pixel speed to avoid acceleration as items are added or removed, and existing gallery examples keep their original order.

`resumeAfterDrag` defaults to false. Opting in restores playback requested before dragging only when no explicit intent command intervenes; hover/focus and other automatic pauses still apply. Keep its data attribute, types, copied recipes and browser regression coverage synchronized. Vertical example direction controls use the existing shared Button group and update the owning TickerDemo controller.

Mixed-language runnable examples use shared CodeFiles (Tabs + TabPanel + CodeFrame), with HTML, CSS and JavaScript files and an optional Complete file tab. Keep single-language API snippets focused. File copies must reference actual sibling filenames and retain package CSS/import/script ordering; the gallery's complete and separate variants share their generator. Test exact copying, nested tab keyboard behavior, no-JavaScript labels, both themes, overflow and execution of both variants. Do not create a second highlighter, clipboard handler or per-page tab controller.

Titles share Heading and PageTitle rather than page-local font rules. Heading separates semantic level from the controlled display/section scale; PageTitle composes the eyebrow, title and description. Keep the approved Home Inter/Instrument Serif pairing, weight, tracking and spacing tokens. Editorial accent text is an explicit trailing part of the translated title (titleAccent in docs frontmatter); never infer the last word or split API identifiers. Keep the full title unchanged in metadata/search and verify compiled whitespace, both themes, responsive sizes and enlarged text. API identifiers and single-word headings can remain entirely in the primary font.

Npm publication is runtime-only: package.json files allows dist/ and CHANGELOG.md; npm also includes package.json, README.md and LICENSE.md. Explicitly exclude landing/, docs/, shared/, development scripts, source, tests and agent memory in .npmignore. Test the actual npm pack manifest, not just ignore patterns: test:package rejects any file outside that contract. Keep 2.1.0 references while preparing its release; publication is the maintainer's action.

Enlarged text must be tested against the full rendered page, not just the new heading. Shared text buttons use min-height and allow wrapping; fixed heights/nowrap can push their arrows outside mobile gutters. Grid copy columns use minmax(0, 1fr) and allow long inline API identifiers to wrap. Do not clip these defects. Keep single-app browser tests independent of sibling output; CI also builds and tests the combined artifact for cross-route contracts.
