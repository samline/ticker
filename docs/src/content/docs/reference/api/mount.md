---
locale: en
sidebar:
  group: api
  order: 6
title: 'mount()'
description: 'Detailed Ticker API contract: mount()'
---

Starts the shared page manager for declarative ticker markup.

## Signature

```ts
import { mount } from '@samline/ticker/vanilla'

mount(): void
```

The package root also exports `mount`.

## Behavior

When a DOM is available, `mount()`:

1. marks the manager mounted;
2. waits for `DOMContentLoaded` when the document is still loading, otherwise scans immediately;
3. initializes `[data-ticker]` and `.ticker-wrapper` roots that contain a recognized track and content element;
4. observes `document.body` for inserted and removed ticker roots;
5. refreshes tracked tickers after `document.fonts.ready` and window `load`;
6. installs a window `resize` fallback when `ResizeObserver` is unavailable;
7. initializes shared document-visibility and reduced-motion listeners when the first ticker starts.

These playback listeners also apply to standalone `ticker()` controllers and are removed when the last tracked ticker is destroyed.

Calls return without side effects when `window` or `document` is unavailable.

## Required markup

```html
<div data-ticker data-duration="24">
  <div data-ticker-track>
    <div data-ticker-content>...</div>
  </div>
</div>
```

The class equivalents `.ticker-wrapper`, `.ticker-track`, and `.ticker-content` are also recognized.

## Ownership

The manager and controller factory share runtime state. Do not call `ticker()` for a root already owned through declarative discovery. Call [`unmount()`](/ticker/docs/reference/api/unmount/) when the integration ends.

## Related

- [`refresh()`](/ticker/docs/reference/api/refresh/#declarative-page-refresh)
- [`unmount()`](/ticker/docs/reference/api/unmount/)
- [Styling and DOM contract](/ticker/docs/reference/styling/)
