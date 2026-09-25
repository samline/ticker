# Accessibility

Ticker defaults are designed to repeat content visually without repeating it for assistive technology or keyboard users.

---

## Clone behavior

By default every generated clone receives:

- `aria-hidden="true"`
- `role="presentation"`
- `inert` when the browser supports it
- `tabindex="-1"` on focusable descendants as a fallback

The original content remains available once in the accessibility tree and tab order.

## Reduced motion

When `prefers-reduced-motion: reduce` matches, the runtime does not generate visual clones and sets the travel distance to zero. It listens for preference changes and refreshes mounted tickers.

## Interactive clones

`interactiveClones: true` deliberately skips clone hiding and inert behavior. Use it only when every repeated control needs to be independently operable and the repetition is understandable to assistive technology users.

For linked headlines, buttons, or other controls, the default `false` is usually the correct choice: users encounter the actionable content once even though it repeats visually.

Interactive clones can duplicate element ids, accessible names, analytics events, and tab stops. Audit all four when opting in.

## Pause on hover

`pauseOnHover` is a pointer convenience, not the only accessibility mechanism. Pair continuously moving content with clear page-level controls when users need to stop or dismiss it, and avoid using a ticker for information that disappears before it can be read.

## Content checklist

- Keep meaningful controls in the original content sequence.
- Give links and buttons useful accessible names.
- Avoid ids inside cloned content unless your integration deliberately rewrites them.
- Never rely on motion alone to convey status or urgency.
- Test keyboard order, screen-reader output, and reduced-motion mode before release.
