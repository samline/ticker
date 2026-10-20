---
name: ticker
description: Integrate @samline/ticker marquees into websites, plain HTML, CMS templates or framework components. Use for ticker installation, styling, options, accessible motion and lifecycle; not financial market data or unrelated slider libraries.
metadata:
  package: '@samline/ticker'
  package-version: '2.1.0'
---

# Ticker

Build against the installed `@samline/ticker` version. This skill describes v2.1.0. Check the dependency version and its exports before applying it to another release. For 2.x, do not use the removed enhance()/createTicker() APIs or the former framework-adapter entrypoints; read the changelog when handling 1.x code. Preserve the host project's components, theme and lifecycle conventions; Ticker supplies movement, not a UI framework or financial data.

## Choose loading, then ownership

Use the site's two loading labels consistently:

- **Package / ESM:** install with npm, pnpm, yarn or bun. Import `{ ticker }` from `@samline/ticker` (or `/vanilla`) and import `@samline/ticker/style.css` once. Initialize in client code after markup exists. ESM/TypeScript and CommonJS are module formats; neither installs `window.Ticker`.
- **HTML / CDN:** load `dist/style.css` with `<link>` and `dist/browser/global.global.js` with `<script>`, then call `window.Ticker.ticker(target, options)`. A CDN is only file delivery: self-hosting those same files uses the same API. The JavaScript is an IIFE that exposes the global namespace `window.Ticker`; “Global” is not a third setup. Keep both asset versions equal. The script and source markup must exist before initialization; avoid `async` or a deferred script followed by an immediately executed inline initializer.

For v2.1.0, a CDN URL is `https://cdn.jsdelivr.net/npm/@samline/ticker@2.1.0/dist/browser/global.global.js`, with `style.css` at the same version's dist root. Verify that the chosen release/assets actually exist. A repository version, tag or documentation header does not prove npm/CDN availability. If the project uses a local build, load that build; never silently use an older CDN release with newer APIs.

Select ownership separately from loading:

- **Direct controller (default):** `ticker(target, options)` in Package / ESM or `window.Ticker.ticker(target, options)` in HTML / CDN. Retain the controller and call its `destroy()` at the owning lifecycle boundary. Both are the same factory contract, without registration.
- **Optional ID registry:** import `{ browser }` from `@samline/ticker/browser` (or the root) in Package / ESM; use `window.Ticker` in HTML / CDN. Call `newTicker({ id, options })`, then `destroyTicker(id)` / `destroyTickers()`. `getTicker()`/`getTickers()` return wrappers, not controllers. The `/browser` module does not install a global and is not the CDN script. Direct instance destruction does not remove registry bookkeeping.
- **Declarative page ownership:** import `mount`, module-level `refresh` and `unmount` from `/vanilla`, with `[data-ticker] > [data-ticker-track] > [data-ticker-content]` markup. These manager helpers are not members of `window.Ticker`; a no-build page can use direct controllers or the registry instead. Do not run competing managers from repeated components or give direct and declarative ownership to the same root.

Load one JavaScript setup for an integration. Do not initialize the same root through both imported and standalone copies. All setups require package CSS; CDN use does not imply registry use. See [loading terminology](https://samline.github.io/ticker/docs/guides/html-and-browser/#loading-terms).

## Controller contract

```ts
import { ticker } from '@samline/ticker/vanilla'
import '@samline/ticker/style.css'

const controller = ticker(element, {
  duration: 24,
  direction: 'left',
  pauseOnHover: true,
})

controller?.update({ duration: 30 })
// Change original content through controller.source, not generated clones.
controller?.source.append(newItem)
controller?.refresh()
// Run when the owner leaves the page, not immediately after initialization.
controller?.destroy()
```

`ticker()` accepts an HTMLElement or selector and returns `TickerInstance | null`. Retain and reuse that instance rather than reinitializing on each interaction. `update()` merges partial options; `refresh()` measures source changes and synchronizes visual copies. Both return the instance. `destroy()` removes runtime work and restores the source. Call `refresh()` after relevant font/content changes if they do not cause an automatic resize.

Options include positive `duration` (seconds per cycle, default 20), `speed` (positive CSS px/s overrides duration; invalid/zero disables speed), `direction` (`left`/`right`/`up`/`down`/`auto`), `autoplay` (true), `pauseOnFocus` (true), `pauseOnHover` (false), `navigation` (false), `resumeAfterDrag` (false), ordered viewport `responsive` rules, `interactiveClones` (false) and wrapper `class`. `auto` resolves inherited writing direction; physical directions retain their meanings. Give vertical wrappers an explicit height.

## Accessible motion and controls

Use `controller.pause()` / `play()` for persistent intent. Read `controller.state` and subscribe with `on('playback', listener)`; the unsubscribe function and `connectControls()` cleanup are idempotent. State distinguishes requested from effective playback and reports manual, hover, focus, hidden, offscreen and reduced-motion reasons. `play()` never bypasses those environmental causes. Methods after destroy are inert.

For changing action labels, display Pause when playback is requested and Play when explicitly paused; update the accessible name with the text. Do not mix changing labels with `aria-pressed`. Focus pause is automatic by default. Do not recreate pause ownership with application CSS.

`scrollTo(px)` / `scrollBy(px)` seek instantly in logical reading order, wrap modulo one sequence and leave playback paused. `navigation: true` enables axis-aware pointer gestures, preserves perpendicular page scrolling and permits instant navigation with reduced motion. Set `resumeAfterDrag: true` to restore pre-drag playback intent on release; preserve prior manual pause and all environmental pause causes. Buttons, rail and programmatic navigation still pause. Change the drag option with `update({ resumeAfterDrag })`; this does not start playback. A complete toggle recipe is at https://samline.github.io/ticker/examples/#drag-playback. Supply native named buttons and a labelled range with `connectControls({ previous, next, rail, step })`; use the host project's existing components and focus styles. The rail spans one repeated period. Do not intercept keys in content inputs.

`on()` supports ready, playback, update, measure, navigate and destroy; no replay or per-frame public events. Read state for late subscriptions. Destroy clears subscriptions and owned runtime resources. `responsive: [{ query, options }]` uses viewport media queries merged in order after base options; `update()` modifies that base. Explicit pause survives rule changes. Axis changes reset position; same-axis changes preserve pixel distance modulo the new period.

Always preserve readable originals and load package CSS. Clones remain noninteractive and hidden by default. Avoid duplicate IDs in source that will be cloned. Verify movement, focus and manual navigation under reduced motion.

## Layout and lifecycle invariants

- The runtime creates a `.ticker-wrapper`, animated `.ticker-track`, original `.ticker-content` and `.ticker-clone` sequences. Query within the owning component and use `controller.source` for content updates.
- Match axis gaps on the track and original content. Include a final separator if the sequence alternates text and separators. Unequal repeat spacing can look like an animation jump.
- Adding/removing original items belongs to the application: edit `controller.source`, then call `refresh()`. There are no package `add()` / `remove()` methods. Use `speed` to keep a dynamic feed steady; an empty original stays not ready and clone-free until content is measurable again.
- Treat `--ticker-distance`, generated clone counts, transforms and package-owned state attributes as runtime output. Do not continuously overwrite them or measure/rebuild clones in application code.
- The runtime handles resize observation, document visibility, viewport pausing and reduced motion. Application integration owns useful pause controls, meaningful content and teardown of its own listeners/timers.
- In Astro, use a processed component script with instance-local queries or a custom element with disconnect cleanup. Do not copy ticker initialization into unrelated page-wide scripts. In other frameworks, use the framework's mount/unmount boundary.

## Write understandable integrations

For standalone examples, use direct calls, descriptive variables and arrow callbacks. Include only the options and handlers needed by the requested case. Do not introduce a custom-element class, this-based shared state or a generic dataset-to-options parser just to initialize a ticker. The working gallery offers HTML, CSS and JavaScript file tabs plus Complete file for a single runnable HTML document. Copy all three sibling files together, or use the complete alternative; do not mix the two layouts. Complete HTML examples still need real markup, explicit CSS, script ordering, usable controls and cleanup; explain which parts are presentation versus package use. In a real framework/component integration, keep its existing mount/unmount lifecycle rather than imposing a different architecture.

Use a single retained controller for one sequence; use an explicit list only for multiple independent tickers. Updating controls should call package methods rather than recreating measurement, pause CSS, drag handling or rail bookkeeping. Keep arrow callbacks readable; shorter code must not remove null handling, accessible labels or cleanup that the host lifecycle requires.

## Verify the result

Check a narrow and wide viewport, repeat spacing in both directions, keyboard access, pause/resume of application state, reduced motion, no-JavaScript originals, content refresh and unmount/reinsert. Multiple tickers must remain independently owned. Use the host site's existing controls and colors instead of introducing a separate demo design.

For deeper contracts, read only the relevant maintained reference:

- [Changelog and breaking changes](https://samline.github.io/ticker/docs/changelog/)
- [Loading modes and terminology](https://samline.github.io/ticker/docs/guides/html-and-browser/#loading-terms)
- [Installation](https://samline.github.io/ticker/docs/getting-started/)
- [Options and normalization](https://samline.github.io/ticker/docs/reference/configuration/)
- [Lifecycle and ownership](https://samline.github.io/ticker/docs/guides/lifecycle/)
- [Styling and seamless loops](https://samline.github.io/ticker/docs/reference/styling/)
- [Accessibility and motion](https://samline.github.io/ticker/docs/guides/accessibility/)
- [Browser registry](https://samline.github.io/ticker/docs/reference/browser/)
- [Working examples with complete copyable files](https://samline.github.io/ticker/examples/)

If the package or documentation changes, verify these contracts against that release instead of inventing APIs from another ticker or drawer library.

Write integrations with direct controller calls, clear variables and arrow callbacks; do not introduce classes, `this` or command-event layers around the API. Keep application content editing outside reusable controller setup. In pagehide cleanup, preserve the controller when `event.persisted` is true so back/forward restoration keeps working; destroy on non-persisted departure or application unmount.

## Framework and CMS hosts

Use the [framework integrations guide](https://samline.github.io/ticker/docs/guides/frameworks/) for React, Vue, Svelte, Astro, Shopify and WordPress examples. These hosts use the ordinary public browser API, not adapter entrypoints. Initialize after client mount and destroy before the framework replaces the enhanced subtree. Keep source DOM stable, action labels synchronized through playback state, and component cleanup local. React development effects must survive setup/cleanup/setup.

For Shopify, load shared runtime assets once from the layout, initialize each section independently and handle section load/unload events. For WordPress, enqueue runtime and integration assets with explicit dependencies; the sample shortcode plugin covers ordinary singular content and WordPress 6.3+ deferred scripts. Builders, widgets and dynamic navigation need their own mount/enqueue policy. Preserve package CSS, pinned matching assets and readable source markup. CMS fixture execution is not proof of a live store/plugin deployment.
