# Ticker site foundations

The landing, examples gallery and documentation are routes of one product website. This private source package owns their reusable UI, shared interface catalogs and design tokens. The apps compile the same `.astro` sources; there is no second UI build, copied component tree or published npm UI artifact.

## Ownership

- `components/`: Box, Button/TextLink, Logo, Theme/ThemeToggle, Heading/Eyebrow, CopyButton/CodeFrame, Icon/IconButton, TextField, NavLink, Disclosure, Surface/LinkCard and DrawerStyles. Components own scoped CSS and processed behavior. Pass native and Astro scope attributes through composed roots.
- `styles/theme.css`: the single palette, font families, breakpoints, spacing scale, radii, focus and motion tokens. This is theme configuration, not a global component stylesheet.
- `lib/serialize.ts`: safe JSON-LD and XML serialization shared by metadata and social images.
- `i18n/createI18n.ts`: one typed locale resolver and translation-shape contract; each app still owns its catalogs.
- `i18n/translations/<locale>/`: shared branding and control messages. Each app owns its navigation/article/marketing copy. `i18n/format.ts` interpolates whole translated messages.

Keep complete sections, content collections, search integration and package demos in the app that owns them. Share genuine UI roles; do not force every distinct section into the same layout or add props for hypothetical variants.

## Visual contracts

TextLink owns contextual underlined links, arrows, focus and closing-theme colors. NavLink owns navigation padding, nested indentation, hover, background-only current state and focus. Nest by margin rather than asymmetric padding. Lists own their gaps and rail inset; current backgrounds must leave room on both sides of a divider. Do not style NavLink internals from a page.

Surface owns card background, border, radius and optional hover. Consumers own layout and content padding. Disclosure owns native details/summary layout, indicator and keyboard focus; consumers own panel/FAQ boundaries and content spacing. CodeFrame owns the code toolbar, typography variant and build-time Astro/Shiki renderer for source passed as text; CopyButton owns exact copying, failure selection, independent feedback/reset and cleanup.

DrawerStyles receives the installed vendor stylesheet from each consuming app, normalizes fixed lengths to rem and scopes it to the owning custom element. It owns common native close appearance and reduced-motion overrides. Drawer owns animations, gestures, focus trapping, scroll locking and dismissal; app integrations own configuration and meaningful content only.

## Setup and checks

From the repository root, install `npm ci --prefix shared`, then the apps' dependencies. Astro is a development dependency here so shared components have their own type environment. It does not add another runtime framework. Both apps' TypeScript checks include this source package; both formatter commands include it and use the root Prettier configuration. Tailwind scans `shared/components/` explicitly in both apps.

After a shared change, run both app checks/format checks, `npm run site:build`, `npm run site:test:browser`, and the landing browser suite. Check 320–1440, both themes, enlarged text, keyboard, no JavaScript and reduced motion. Inspect the original report visually; automated checks do not establish complete accessibility or visual quality.

CI installs this package before checking either app. Keep its lockfile and the CI/deployment setup synchronized. Root npm packaging must continue to include only the runtime distribution and maintained documentation Markdown, never these components or site dependencies.

## Content composition

`Tabs` is the same component in landing demos/installers and documentation. `TabPanel` adds readable labels when JavaScript is disabled and preserves stable published fragment IDs. Tabs support roving keyboard focus, Home/End/arrows, independent instances, native hidden panels and fragment activation; do not rebuild tab markup in a Markdown transform. Use tabs for alternatives, while keeping ordered steps and API tables visible.

`CardGrid` lays out landing features and documentation destinations. `LinkCard` owns compact navigation title/body appearance. `Callout` composes Surface for important prose. Documentation uses the official Astro MDX integration only in articles that need components; plain Markdown remains appropriate elsewhere. The collection accepts both formats without changing route IDs. Preserve source file extensions in migration inventory records.

Shared interactive roots mark interface content with `data-ui`; Article's prose CSS excludes those subtrees. Do not let a broad Markdown selector override buttons, navigation links, card titles or code frames. Keep catalog messages in shared/app i18n and article prose in locale content files. MDX articles import their locale's UI catalog explicitly.

`shared/scripts/check-links.mjs` is the build-only link validator consumed by both apps. It validates generated live markup, same-origin destinations (including absolute URLs), fragments, assets, duplicate IDs and static redirects. The combined landing artifact closes the cross-site coverage gap. It does not claim online availability or semantic correctness of external actions; review those separately.

## Source hygiene

Before deleting a source, trace imports, Astro/MDX composition, generated DOM hooks, translated data, assets and build/CI entrypoints. Keep package-owned runtime CSS adaptations, no-JavaScript fallbacks, compatibility fragments/redirects, asset licenses and migration evidence. Remove only proven-unused hooks, palette values, retired props and obsolete override rules. Adjacent equivalent media blocks can be consolidated without changing cascade order. Keep final visual values in the owning component rather than layering a retired design underneath. Generated dependency/build directories are not maintained source; never revive the retired Starlight example project.

## Code rendering

`components/CodeFrame.astro` renders source with Astro Code/Shiki when given text and a language, and composes the existing CopyButton. The optional slot accepts already-highlighted native Markdown output. `lib/code-theme.mjs` is the only syntax-theme configuration for both paths, using the existing palette tokens in both themes. App code must not create manual tok-* spans, plain pre alternatives for known languages or another Shiki theme. No highlighter JavaScript is shipped to the client.

Home's CodeBlock is a small catalog/filename adapter; Examples passes its complete HTML directly. Docs retain Astro's Markdown/MDX compilation and Article frames that highlighted output with CodeFrame without replacing spans. Keep exact source copying (including terminal newlines), readable no-JavaScript code and code-only scrolling. Browser checks compare actual tag/attribute/string colors across routes and both themes.

`RangeControl` extracts the demo range label/input presentation used by duration and manual position controls. It forwards native attributes and keeps package navigation separate from site presentation.

The shared integration labels are Package / ESM and HTML / CDN. The HTML/CDN guide explains delivery (CDN or self-hosted), global namespace (window.Ticker) and optional registry ownership separately. Root README, initialization tabs, entrypoint summaries, copied examples and the downloadable skill follow that terminology. Keep technical export paths/legacy anchors intact when adjusting user-facing labels; choose the default direct ticker() factory before teaching optional registry ownership.

CodeFiles composes the shared tabs and highlighted code frame for examples that mix languages. It shows independently copyable HTML/CSS/JavaScript and accepts an optional complete runnable HTML file. The gallery derives both outputs from the same source and references style.css/main.js in its separate HTML; the HTML/CDN guide consumes the same renderer in MDX. Keep small API snippets as normal fences. Preserve exact source copying, no-JavaScript fallback labels and native keyboard selection when nesting file tabs inside loading-mode tabs.
