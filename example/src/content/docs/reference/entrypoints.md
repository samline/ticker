---
title: Entrypoints
description: Choose the root, Vanilla, core, browser module, browser global, or stylesheet export.
template: doc
---

| Import                           | Purpose                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `@samline/ticker`                | Main factory, page manager, types, validators, and browser singleton. |
| `@samline/ticker/vanilla`        | Factory, page manager, and primary public types.                      |
| `@samline/ticker/core`           | Advanced types, defaults, state factories, and validators.            |
| `@samline/ticker/browser`        | ESM/CJS registry module without global side effects.                  |
| `@samline/ticker/browser/global` | IIFE that installs `window.Ticker`.                                   |
| `@samline/ticker/style.css`      | Required runtime CSS.                                                 |

Bundler entrypoints ship ESM, CommonJS, source maps, and matching `.d.ts` / `.d.cts` declarations. The IIFE is self-contained. The package has no runtime dependencies or peer dependencies.

## CSS is explicit

JavaScript entrypoints do not import styles automatically:

```ts
import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'
```

This keeps server imports and non-CSS build pipelines predictable.
