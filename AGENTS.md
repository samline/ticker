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

Preserve unrelated user edits. Follow the user's Git instructions; a local commit or merge does not publish. Do not leave obsolete adapters, generated preview runtimes, unused files or superseded CSS after a refactor. When package APIs, version, distribution, site routes or shared UI change, update examples, docs, links, metadata, tests and maintenance notes in the same change. These notes capture accepted project decisions, not permission to override future user instructions.

The public Ticker integration skill is maintained in skills/ticker/SKILL.md and downloaded through the landing endpoint. It teaches package use, not this repository's personal design preferences. Update its version/API guidance with package changes and keep the general README's setup, URLs, architecture and agent installation steps current. Docs metadata and accessibility checks cover every article, including structured breadcrumbs and both themes.
