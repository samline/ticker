# Changelog

## [2.1.0] - 2026-10-17

- Add vertical `up`/`down` movement and inherited `auto` direction, with logical RTL seeking and fractional measurements on either axis.
- Add persistent `play()`/`pause()` intent, `autoplay`, immutable state snapshots and typed lifecycle/playback/navigation events.
- Add `pauseOnFocus` (enabled by default), constant `speed` in CSS pixels per second and ordered viewport `responsive` rules. Manual pause survives automatic causes and breakpoint changes.
- Add cyclic `scrollTo()`/`scrollBy()`, native button/range bindings through `connectControls()` and mouse/touch dragging that preserves perpendicular page scrolling and reduced-motion access.
- Add opt-in `resumeAfterDrag` and its data attribute, preserving pre-drag playback intent and existing focus. Explicit pauses remain effective.
- Keep dynamic additions/removals at constant pixel speed; fix empty source measurements so gaps never produce empty clones, with recovery on refresh.
- Extend the shared Home/Examples/Docs website with twelve live recipes and complete CDN/npm code, an interactive drag-resume toggle, illustrated vertical resources and rendered brand attribution. Preserve all original examples.
- Document the complete 2.1 API, upgrade behavior and agent integration; synchronize pinned examples and the downloadable Ticker skill.
- Preserve routes with or without trailing slashes and correct fractional documentation TOC tracking.

## [2.0.4] - 2026-10-12

- Preserve fractional animation distances and use the horizontal column gap so repeated content stays aligned when ticker loops restart.

## [2.0.3] - 2026-10-12

- Start tickers paused until they intersect the viewport, without a preactivation margin.
- Pause playback in hidden documents and share visibility and motion-preference listeners across standalone controllers and declarative tickers, with cleanup after the last ticker is destroyed.
- Reuse clones on unchanged automatic measurements to preserve animation progress; keep explicit refresh and updates rebuilding content even when its width is unchanged.

## [2.0.2] - 2026-09-25

- Expanded the bundled and Starlight references to cover every public API, option, type, core utility, entrypoint, registry helper, and lifecycle edge case.
- Added dedicated controller, core, entrypoint, and recipe documentation following the `@samline/forms` documentation structure.
- Added explicit ownership, cleanup, server-rendering, accessibility, styling, and browser-registry guidance across both documentation surfaces.

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
