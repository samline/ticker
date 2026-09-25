# `unmount()`

Stop the page-level manager and destroy all ticker state it owns.

```ts
import { unmount } from '@samline/ticker/vanilla'

unmount(): void
```

It removes page listeners, disconnects the mutation observer, unregisters reduced-motion listeners, and destroys every managed ticker. In non-DOM environments it returns without side effects.
