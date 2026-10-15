---
name: ticker
description: Integrate @samline/ticker marquees into websites, plain HTML, CMS templates or framework components. Use for ticker installation, styling, options, accessible motion and lifecycle; not financial market data or unrelated slider libraries.
metadata:
  package: '@samline/ticker'
  package-version: '2.0.4'
---

# Ticker

Build against the installed `@samline/ticker` version. This skill describes v2.0.4. Check the dependency version and its exports before applying it to another release. Preserve the host project's components, theme and lifecycle conventions; Ticker supplies movement, not a UI framework or financial data.

## Choose the integration

- **Bundler / framework:** install `@samline/ticker`, import `{ ticker }` from `@samline/ticker/vanilla` (or the root entry), and import `@samline/ticker/style.css` once. Initialize after the source element exists on the client; release the returned controller on unmount/disconnect. Do not access the DOM during SSR.
- **Plain HTML / CMS:** load the pinned CSS and global build, then use `window.Ticker.ticker(element, options)`. For v2.0.4 the files are `https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.4/dist/style.css` and `https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.4/dist/browser/global.global.js`. Keep script loading and initialization ordered.
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

Options are `duration` (positive seconds per full loop, default 20), `direction` (`left`/`right`, default `left`), `pauseOnHover` (default false), `interactiveClones` (default false) and `class` (custom wrapper classes). Shorter duration means faster motion. There is no pixels-per-second option and no `pause()`, `play()` or `resume()` method.

## Accessible motion

Always preserve readable original content. CSS must be loaded for reduced-motion behavior. Clones are hidden from assistive technology and keyboard interaction by default; avoid enabling `interactiveClones` unless each repeated control really must be independently usable. Avoid IDs in content that will be cloned.

`pauseOnHover` is not a persistent pause control. Provide a named application button for continuing motion, with synchronized `aria-pressed`, plus keyboard focus pause. Keep this state outside the package-owned `data-playing` attribute. For example, scope an application rule to its own component:

```css
.ticker-example[data-paused='true'] .ticker-wrapper .ticker-track,
.ticker-example .ticker-wrapper:focus-within .ticker-track {
  animation-play-state: paused;
}
```

Set `data-paused` on that owner from its button. Keep the pause rule specific enough to survive the package's direction animation shorthand. Do not replace the package's reduced-motion rules. Make static overflow keyboard reachable; test original links, pause state and reduced-motion content rather than relying on pointer hover alone.

## Layout and lifecycle invariants

- The runtime creates a `.ticker-wrapper`, animated `.ticker-track`, original `.ticker-content` and `.ticker-clone` sequences. Query within the owning component and use `controller.source` for content updates.
- Match horizontal gaps on the track and original content. Include a final separator if the sequence alternates text and separators. Unequal repeat spacing can look like an animation jump.
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
