# Changelog

## Unreleased

No unreleased changes.

## [2.4.0] - 2026-10-29

### Added

- One fixed featured original per ticker, marked with `data-featured` or selected with `setFeatured(element)`. The first marked direct item wins; other marked items remain ordinary moving items. `setFeatured(null)` clears the selection, and `featured` exposes the current original.
- `featuredPosition` / `data-featured-position` align the overlay at logical start/center/end or axis-specific physical edges. The original is excluded from clones, repeat distance and item steps, with order/focus restoration and keyboard reveal beside the overlay. Playback intent is preserved.

### Behavior changes

- Preserve opt-in mouse focus handling on fixed actions without allowing them to start a drag. Keyboard focus pause and explicit playback intent remain effective.

### Examples

- Explain temporary hover/focus pauses in live and copied examples, with configuration guidance for changing those policies. Reserve message geometry so clearing focus does not move controls and lose a pointer click.
- Add selected-category and centered-logo recipes with position/orientation controls, drag navigation, associated category content and a labeled partner card. Every visible category button, including repeated copies, selects the original through stable keys. Complete and split files pin the prepared release; npm publication remains a separate maintainer action.

## [2.3.0] - 2026-10-29

### Added

- `TickerControls.itemsPerStep` selects the number of incoming items per button or rail arrow-key command; positive safe integers are supported, with a default of one.

### Behavior changes

- Rapid connected-arrow clicks and rail arrow keys now count every same-direction step instead of repeatedly targeting the same incoming item. Reversals discard pending steps and move from the visible position; retargeting stays continuous on both axes and in RTL, with one completion event for the final destination.
- Connected arrows and range arrow keys now smoothly reveal one incoming item by default on horizontal and vertical axes instead of jumping one viewport. Configure `itemsPerStep` for multiple items; movement keeps the first incoming item visible. Explicit positive pixel `step` remains supported and takes precedence. Item stepping excludes wrapper borders and respects CSS scroll-padding so applications can reserve readable space outside edge fades or overlays.

### Examples

- Demonstrate removal by stable item key and current position in the live dynamic feed and complete/split CDN/ESM files; refresh copies after each edit.

## [2.2.0] - 2026-10-28

### Added

- Opt-in smooth navigation with duration and playback-intent preservation on controller methods and connected controls. Retain manual pauses, respect reduced motion and cancel on competing commands, drag, rebuild and destroy.
- Navigation event source identifies API, arrows, range, keyboard and drag without application replay handlers.
- Document deferred Astro mounting, delegated clone actions and equal sequence/track spacing.

### Maintenance

- Update vulnerable website transitive dependencies without relaxing CI audits. npm publication is a separate maintainer action.

## [2.1.0] - 2026-10-17

### Behavior changes

- Keyboard focus now pauses playback by default (`pauseOnFocus: true`). Set `pauseOnFocus: false` only when your integration provides an equivalent policy.
- `data-playing` now reflects manual, focus and hover pause causes in addition to visibility and reduced motion. Integrations that read it should account for all pause reasons.
- Existing entrypoints, physical left/right directions, selectors and duration mode remain supported. Use `play()` / `pause()` instead of application-owned pause CSS.

### Added and fixed

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

### Breaking changes

- Replace `enhance()` and `createTicker()` with `ticker(target, options)` for an element-scoped controller, or `mount()` for declarative page ownership. Call the returned controller's `destroy()` for teardown.
- `newTicker()` returns `TickerInstance | null` instead of `HTMLElement | null`. `available`, `getTicker()` and `getTickers()` still expose wrapper elements; use registry destroy helpers to remove registered entries.
- Framework adapters are no longer shipped. Initialize Ticker in your framework's client mount hook and destroy it during cleanup.
- `@samline/ticker/browser` is a side-effect-free ESM/CJS registry module. Plain HTML must load `dist/browser/global.global.js` to install `window.Ticker`.

### Added and fixed

- Replaced the ambiguous `createTicker()` / `enhance()` pair with `ticker(target, options)` and an element-scoped controller.
- Reduced the browser namespace to the factory and registry lifecycle.
- Fixed `interactiveClones` so interactive clones no longer inherit `pointer-events: none`.
- Removed framework adapters, unused helpers, duplicate documentation, and obsolete planning files.
- Added Starlight documentation, package smoke tests, CI, coverage, and GitHub Pages deployment.

## [1.1.0] - 2026-09-23

- Added a shared `Ticker` / `browser` singleton and named registry helpers.
- Recreating an id now tears down the previous runtime before enhancing it again.
- Destroying a registered ticker clears observers, clones, registry state, and restores the source DOM.

## [1.0.8] - 2026-06-11

- Add `interactiveClones` to opt repeated controls into interaction, with matching runtime, framework adapter and documentation support.

## [1.0.7] - 2026-06-11

- Initialize and destroy the React ticker at the component boundary; normalize class tokens and add server-rendering and React regression tests.

## [1.0.6] - 2026-06-11

- Historical npm release. No version-specific functional notes were recorded in the repository.

## [1.0.5] - 2026-06-11

- Historical npm release. No version-specific functional notes were recorded in the repository.

## [1.0.4] - 2026-04-21

- Include the stylesheet as an explicit build entry and align browser/CDN usage documentation.

## [1.0.3] - 2026-04-21

- Correct enhancement of existing content nodes, preserve source placement and accept multiple option class tokens.

## [1.0.2] - 2026-04-21

- Publish the patch release after correcting conditional wrapper classes and CDN references.

## [1.0.1] - 2026-04-21

- Correct the browser entry filename and version-pinned CDN URLs.

## [1.0.0] - 2026-04-21

- Initial ticker runtime for Vanilla JavaScript, browser scripts and React, Vue and Svelte adapters, with automatic visual copies, reduced-motion support and responsive visibility observers.
