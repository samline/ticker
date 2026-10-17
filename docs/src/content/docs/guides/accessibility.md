---
locale: en
sidebar:
  group: guides
  order: 3
title: 'Accessibility and motion'
description: 'Understand clone semantics, keyboard behavior, interactive controls, and reduced-motion handling.'
---

An infinite ticker repeats content visually. Repeating links or buttons in the accessibility tree usually creates duplicate announcements and keyboard stops, so clones are non-interactive by default.

## Default clone behavior

Generated clones receive `aria-hidden="true"`, `role="presentation"`, and `inert` when supported. In older browsers, focusable descendants receive `tabindex="-1"`. The stylesheet disables pointer events for these clones.

Keep meaningful interactive content in the original content node. Users can reach those controls while repeated copies remain visual only.

## Interactive clones

Set `interactiveClones: true` only when every repeated control should behave as a real independent control:

```ts
ticker('#products', { interactiveClones: true })
```

Interactive clones do not receive `aria-hidden`, presentation semantics, inert behavior, forced tab indexes, or disabled pointer events. Verify keyboard order, accessible names, analytics behavior, and duplicate element IDs yourself.

## Reduced motion

When `prefers-reduced-motion: reduce` matches, animation stops, transforms reset, the runtime builds no visual clones, and travel distance becomes zero. Existing clones are removed when the preference changes. Shared runtime listeners respond to preference changes for standalone controllers and declaratively mounted tickers. They are removed when the last ticker is destroyed.

## Pause controls

`pauseOnHover` is a pointer convenience. Focus pause is enabled by default in 2.1 and composes with manual pause, hidden document, viewport and reduced motion. Use `pause()` / `play()` for a persistent control and `state` / `on('playback', ...)` to synchronize its action label (Pause while playback is requested, Play while explicitly paused). Update visible text and any accessible name together. A changing action label does not use `aria-pressed`; a stable toggle label may use that state instead. The landing demonstrates the controller API. Keep originals readable when motion is disabled and supply labelled native controls for manual navigation. See [controller examples](/ticker/docs/reference/api/controller/).

## Content guidance

- Avoid putting time-critical information only inside a moving region.
- Give links and controls useful accessible names.
- Avoid IDs inside content that will be cloned, or generate unique IDs deliberately.
- Do not rely only on hover to expose or pause essential content.
- Test keyboard focus and reduced motion before enabling interactive clones.
