---
title: Browser reference
description: Browser registry behavior, ESM/CJS imports, the standalone global, replacement semantics, and cleanup.
---

## Module singleton

```ts
import { browser } from '@samline/ticker/browser'

const instance = browser.newTicker({
  id: 'headlines',
  options: { duration: 25 },
})
```

Importing this module does not modify `globalThis`.

## Standalone global

```html
<script src="https://cdn.jsdelivr.net/npm/@samline/ticker@2.0.0/dist/browser/global.global.js"></script>
```

The IIFE assigns the same API to `window.Ticker`. CSS ships separately and must be loaded explicitly.

## Registration identity

Registrations are keyed by source element id. `available[id]` and `getTicker(id)` expose the generated wrapper, while `newTicker()` returns its controller.

Calling `newTicker()` again with the same id:

1. destroys the existing controller;
2. restores the original source element;
3. applies the new options;
4. stores the new wrapper under the same id.

## Cleanup

```js
window.Ticker.destroyTicker('headlines')
window.Ticker.destroyTickers()
```

Destroy by id when possible. Passing a registered wrapper is also supported. Unknown ids and elements are safe no-ops.
