# Changelog

## [2.0.1] - 2026-09-24

- Aligned the README and Starlight documentation with the `@samline/forms` documentation conventions.
- Added an npm-bundled `docs/` reference for configuration, browser usage, styling, accessibility, TypeScript, and the public API.
- Added `.npmignore` so source, tests, tooling, and the documentation site stay out of the published tarball.

## [2.0.0] - 2026-09-24

- Replaced the ambiguous `createTicker()` / `enhance()` pair with `ticker(target, options)` and an element-scoped controller.
- Reduced the browser namespace to the factory and registry lifecycle.
- Fixed `interactiveClones` so interactive clones no longer inherit `pointer-events: none`.
- Removed framework adapters, unused helpers, duplicate documentation, and obsolete planning files.
- Added Starlight documentation, package smoke tests, CI, coverage, and GitHub Pages deployment.

## [1.1.0] - 2026-09-23

- Added a shared `Ticker` / `browser` singleton and named registry helpers.
- Recreating an id now tears down the previous runtime before enhancing it again.
- Destroying a registered ticker clears observers, clones, registry state, and restores the source DOM.
