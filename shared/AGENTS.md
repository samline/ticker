# Shared site UI contract

Read README.md. Landing and docs consume this single source package. Do not copy primitives back into app folders or import app content/catalogs into shared UI. Keep app-specific composition in app components/sections/layouts.

Use Astro 7, scoped component styles/scripts, rem fixed lengths, `class:list`, native attributes and existing palette/spacing/radius/focus/motion tokens. Preserve the user's Box widths and gutters. Do not put component selectors in theme.css. Use typed shared catalogs for control messages; shared UI must remain independent of marketing/docs prose.

TextLink owns contextual documentation CTAs and their focus/hover. NavLink owns current/hover/focus and symmetric padding; indentation is a separate margin. Surface owns card appearance. Disclosure owns native summary layout. CodeFrame/CopyButton and Theme/ThemeToggle each have one implementation. DrawerStyles owns native scoped CSS normalization, close styling and reduced motion; never implement dependency gestures or focus traps here.

Shared files have their own Astro type tooling. Both app checks and format commands include shared source. Use the root Prettier configuration. A shared change requires both sites' build and browser checks, including both themes, responsive/enlarged text, repeated instances, keyboard and lifecycle cleanup. Keep setup, CI, catalogs and these maintenance notes synchronized.

Share locale resolution through i18n/createI18n.ts and safe metadata serialization through lib/serialize.ts; neither app imports sibling implementation files. During cleanup, prove references are absent before deleting. Check Astro/MDX imports, generated hooks, translated data, assets and tooling entrypoints. Preserve migration/source inventory, legal attribution, public fragments/redirects and no-JavaScript paths. Remove superseded CSS rather than adding more overrides; preserve existing computed appearance and Box dimensions.
