# Ticker landing

Static marketing page and interactive demos for `@samline/ticker`. Keep the existing English copy and dark/lavender visual identity.

## Local preview

From the repository root:

```sh
npm run landing:dev
```

The committed HTML, CSS, JavaScript, and vendor assets can also be served by any static HTTP server. Fonts have system fallbacks if Bunny Fonts is unavailable.

## Rebuild

```sh
npm ci --prefix landing
npm run landing:build
```

The root command first builds the library. The landing build then compiles `assets/css/source.css` into `assets/css/main.css` and copies the browser bundle, stylesheet, and MIT license into `assets/vendor/`. Deploy the contents of `landing/` without `node_modules/`; no client-side Tailwind compiler or package CDN is needed. Edit the CSS source and rebuild; the output stylesheet and vendor assets are generated.

## Audit fixes

- Removed the animation override that defeated reduced motion and reset playback state.
- Added a pause toggle to each demo and paused interactive content while it has keyboard focus.
- Kept demo content horizontally scrollable when motion is reduced or initialization is unavailable.
- Added keyboard tab navigation, associated panels, visible focus, a skip link, and readable secondary text.
- Kept all examples and page content available before JavaScript enhancement.
- Refreshed actual controller instances after fonts load; the public registry contains DOM elements.
- Fixed mobile navigation overflow and responsive button visibility.
- Replaced empty links, implied customer endorsements, unsupported competitor comparisons, and inaccurate bundle claims. Prices and brands are explicitly illustrative.

The bundle size in the FAQ refers to the local v2.0.4 browser build and CSS, measured with gzip. Remeasure it when updating the library. Landing tooling has its own pinned dependencies and lockfile and stays outside the published npm package.

## Visual direction

The refined design takes the quiet dark surfaces, restrained cards, short copy, and paired actions of [Statements](https://statements.now/) as a reference. The soft lavender accent and Instrument Serif remain part of Ticker’s identity. The page adds editorial headings, a softly elevated dark demo surface, a compact runtime list, and a dark closing panel.

The live demo switches between announcements, sample brands, and illustrative prices. Its keyboard-accessible tabs preserve each demo’s loop duration; the slider updates the active controller. The install shortcut copies the command, with selection as a fallback. Demo content stays available without JavaScript, and reduced motion preserves the static content.

Related inspiration: [Webflow’s 2026 design trends](https://webflow.com/blog/web-design-trends-2026) and [Framer’s expressive typography](https://www.framer.com/blog/framer-typography-components/).

Brand demo images are local SVG marks from [Simple Icons v16.0.0](https://github.com/simple-icons/simple-icons/tree/16.0.0), displayed in the demo’s soft lavender palette. Each image has an accessible brand name and explicit dimensions. Upstream sources, brand metadata, license, and disclaimer are retained in `assets/brands/`.

The palette uses charcoal with a slight violet tint, layered dark demo surfaces, warm off-white text, and muted lavender accents. Demo panels and the closing section stay dark to avoid large brightness jumps.

## Loop continuity

The demo needs a uniform join between the source content and the first clone. Both `.ticker-track` and `.ticker-content` use `--demo-item-gap`; the brand track sets it to `18px`. Announcements and prices include an ending separator so their last-to-first join follows the same pattern as the interior items.

The local package build also preserves fractional content widths and reads the horizontal column gap. Rounding the repeat distance upward caused a small positional jump at each animation reset. Browser measurements before the correction showed a `40px` brand join versus `18px` interior spacing, and approximately `0.58px` of reset error in announcements. After the correction, the measured reset mismatch is below `0.001px` in all three desktop demos. Exact values depend on fonts and viewport size.

The package fix is included in the **2.0.4** release in the root changelog. This landing consumes the rebuilt local bundle; its CDN examples point to 2.0.4 and become available once that version is published to npm.
