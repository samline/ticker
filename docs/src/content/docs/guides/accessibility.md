---
locale: en
sidebar:
  group: guides
  order: 3
title: 'Accessibility and motion'
titleAccent: 'motion'
description: 'Understand clone semantics, keyboard behavior, interactive controls, and reduced-motion handling.'
---

An infinite ticker repeats content visually. Repeating links or buttons in the accessibility tree usually creates duplicate announcements and keyboard stops, so clones are non-interactive by default.

## Default clone behavior

Generated clones receive `aria-hidden="true"`, `role="presentation"`, and `inert` when supported. In older browsers, focusable descendants receive `tabindex="-1"`. The stylesheet disables pointer events for these clones.

Keep meaningful interactive content in the original content node. Users can reach those controls while repeated copies remain visual only.

## Interactive clones

Set `interactiveClones: true` only when every repeated control should be actionable:

```ts
ticker('#products', { interactiveClones: true })
```

The [featured category menu](/ticker/examples/#featured-menu) enables this option so every visible button responds. Its delegated click handler reads a stable category key, finds the corresponding original outside `.ticker-clone`, updates selection ARIA and calls `setFeatured(original)`. Never pass a clone to `setFeatured()`: only direct originals are eligible. Without this option, visible repetitions are inert by design and can look broken in an actionable menu. Cloning does not copy listeners registered with `addEventListener`; use delegation on a stable outer container.

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

## Requested playback and automatic pauses

A ticker can have playback **requested** while it is temporarily **not playing**. `state.requested` records Play/Pause intent; `state.playing` also accounts for `state.reasons`. The gallery keeps the button's manual action label and displays a separate explanation for hover or focus pauses. Pressing Pause during an automatic pause makes it persistent; leaving the item does not undo that choice.

| Trigger                                                      | What happens                                                                               | How playback returns                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Pointer enters with `pauseOnHover: true`                     | Temporary `hover` pause                                                                    | Pointer leaves, provided no other pause remains             |
| An item receives focus with the default `pauseOnFocus: true` | Temporary `focus` pause, including after a pointer click that gives focus                  | Focus leaves the ticker, provided no other pause remains    |
| Pause button or default API/control navigation               | Requested playback becomes false                                                           | Explicit Play                                               |
| Drag with default `resumeAfterDrag: false`                   | Requested playback becomes false                                                           | Explicit Play                                               |
| Drag with `resumeAfterDrag: true`                            | Earlier playback intent is restored after release unless another intent command intervenes | Release; hover/focus and other automatic causes still apply |
| Reduced motion, hidden document or offscreen ticker          | Environmental pause                                                                        | The cause clears; explicit Play does not bypass it          |

For a menu whose selection should keep circulating alternatives, disable hover pause explicitly. The featured gallery also enables navigation and resume-after-drag; mouse gestures preserve existing focus rather than focusing a moving item. Keyboard focus still pauses the example, with a visible explanation. Activating a category with the keyboard preserves focus, so that pause remains until focus leaves.

```js
const menu = ticker('#categories', {
  pauseOnHover: false,
  navigation: true,
  resumeAfterDrag: true,
  // pauseOnFocus defaults to true for keyboard reading.
})
```

To opt out of both pointer and focus pauses, set `pauseOnHover: false` and `pauseOnFocus: false`. Keep an explicit keyboard-accessible Pause/Play action and usable manual navigation so users can stop and read content themselves. `resumeAfterDrag` changes drag release only; it does not disable other pause causes. For connected arrows and rails that should retain current intent, use `connectControls({ previous, next, rail, preservePlayback: true })`. Explicit manual pauses remain preserved.

Use `on('playback', listener)` and `state.reasons` to explain temporary pauses; do not call `play()` after every focus, click or navigation event. That would overwrite a user's earlier manual pause. A changing Pause/Play action label should describe manual intent; avoid mixing it with stable-label `aria-pressed` semantics. See [controller playback](../../reference/api/controller/) and [configuration](../../reference/configuration/).

Reserve space for playback explanations instead of inserting/removing a row above controls on focus changes. Otherwise blur can move a button between pointer down and pointer up and lose the click. The gallery and copied recipes keep invisible, accessibility-hidden message samples in a shared grid cell to reserve the translated, wrapped message height; the live status text occupies that same cell.
