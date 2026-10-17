---
name: ticker
description: Integrate @samline/ticker marquees into websites, plain HTML, CMS templates or framework components. Use for ticker installation, styling, options, accessible motion and lifecycle; not financial market data or unrelated slider libraries.
metadata:
  package: '@samline/ticker'
  package-version: '2.1.0'
---

# Ticker

Build against the installed `@samline/ticker` version. This skill describes v2.1.0. Check the dependency version and its exports before applying it to another release. Preserve the host project's components, theme and lifecycle conventions; Ticker supplies movement, not a UI framework or financial data.

## Choose the integration

- **Bundler / framework:** install `@samline/ticker`, import `{ ticker }` from `@samline/ticker/vanilla` (or the root entry), and import `@samline/ticker/style.css` once. Initialize after the source element exists on the client; release the returned controller on unmount/disconnect. Do not access the DOM during SSR.
- **Plain HTML / CMS:** load the pinned CSS and global build, then use `window.Ticker.ticker(element, options)`. For v2.1.0 the files are `https://cdn.jsdelivr.net/npm/@samline/ticker@2.1.0/dist/style.css` and `https://cdn.jsdelivr.net/npm/@samline/ticker@2.1.0/dist/browser/global.global.js`. Keep script loading and initialization ordered.
- **Declarative page ownership:** use `mount()`, module-level `refresh()` and `unmount()` from `/vanilla` when the application deliberately owns a page-wide manager. See the declarative lifecycle reference for its `data-ticker` markup. Do not start competing global managers from repeated components.
- **Registry ownership:** use `newTicker({ id, options })` and registry destruction only when ID-based lookup is useful. `getTicker()`/`getTickers()` return wrapper elements, not controllers. A directly created `ticker()` controller is not automatically registered.

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

`scrollTo(px)` / `scrollBy(px)` seek instantly in logical reading order, wrap modulo one sequence and leave playback paused. `navigation: true` enables axis-aware pointer gestures, preserves perpendicular page scrolling and permits instant navigation with reduced motion. Set `resumeAfterDrag: true` to restore pre-drag playback intent on release; preserve prior manual pause and all environmental pause causes. Buttons, rail and programmatic navigation still pause. Supply native named buttons and a labelled range with `connectControls({ previous, next, rail, step })`; use the host project's existing components and focus styles. The rail spans one repeated period. Do not intercept keys in content inputs.

`on()` supports ready, playback, update, measure, navigate and destroy; no replay or per-frame public events. Read state for late subscriptions. Destroy clears subscriptions and owned runtime resources. `responsive: [{ query, options }]` uses viewport media queries merged in order after base options; `update()` modifies that base. Explicit pause survives rule changes. Axis changes reset position; same-axis changes preserve pixel distance modulo the new period.

Always preserve readable originals and load package CSS. Clones remain noninteractive and hidden by default. Avoid duplicate IDs in source that will be cloned. Verify movement, focus and manual navigation under reduced motion.

## Layout and lifecycle invariants

- The runtime creates a `.ticker-wrapper`, animated `.ticker-track`, original `.ticker-content` and `.ticker-clone` sequences. Query within the owning component and use `controller.source` for content updates.
- Match axis gaps on the track and original content. Include a final separator if the sequence alternates text and separators. Unequal repeat spacing can look like an animation jump.
- Adding/removing original items belongs to the application: edit `controller.source`, then call `refresh()`. There are no package `add()` / `remove()` methods. Use `speed` to keep a dynamic feed steady; an empty original stays not ready and clone-free until content is measurable again.
- Treat `--ticker-distance`, generated clone counts, transforms and package-owned state attributes as runtime output. Do not continuously overwrite them or measure/rebuild clones in application code.
- The runtime handles resize observation, document visibility, viewport pausing and reduced motion. Application integration owns useful pause controls, meaningful content and teardown of its own listeners/timers.
- In Astro, use a processed component script with instance-local queries or a custom element with disconnect cleanup. Do not copy ticker initialization into unrelated page-wide scripts. In other frameworks, use the framework's mount/unmount boundary.

## Verify the result

Check a narrow and wide viewport, repeat spacing in both directions, keyboard access, pause/resume of application state, reduced motion, no-JavaScript originals, content refresh and unmount/reinsert. Multiple tickers must remain independently owned. Use the host site's existing controls and colors instead of introducing a separate demo design.

For deeper contracts, read only the relevant maintained reference:

- [Installation](https://samline.github.io/ticker/docs/getting-started/)
- [Options and normalization](https://samline.github.io/ticker/docs/reference/configuration/)
- [Lifecycle and ownership](https://samline.github.io/ticker/docs/guides/lifecycle/)
- [Styling and seamless loops](https://samline.github.io/ticker/docs/reference/styling/)
- [Accessibility and motion](https://samline.github.io/ticker/docs/guides/accessibility/)
- [Browser registry](https://samline.github.io/ticker/docs/reference/browser/)
- [Working examples with complete copyable files](https://samline.github.io/ticker/examples/)

If the package or documentation changes, verify these contracts against that release instead of inventing APIs from another ticker or drawer library.
