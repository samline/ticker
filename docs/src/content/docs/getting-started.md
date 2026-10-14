---
locale: en
sidebar:
  group: start
  order: 2
title: 'Getting started'
description: 'Install @samline/ticker, enhance existing HTML, and manage one ticker through its controller.'
---

This page walks through installing `@samline/ticker`, loading its stylesheet, and controlling a working ticker. By the end you will understand both controller-owned and declarative lifecycles.

## Prerequisites

- **Node.js 20+** when bundling.
- A package manager — npm, pnpm, yarn, or bun.
- A browser target of **ES2020**.

## Install

### npm

```bash
npm install @samline/ticker
```

### pnpm

```bash
pnpm add @samline/ticker
```

### yarn

```bash
yarn add @samline/ticker
```

### bun

```bash
bun add @samline/ticker
```

Import the stylesheet once in your application entrypoint:

```ts title="app.ts"
import '@samline/ticker/style.css'
```

## First example

```html title="index.html"
<div id="news-ticker">
  <a href="/story/one">First story</a>
  <a href="/story/two">Second story</a>
</div>
```

```ts title="app.ts"
import { ticker } from '@samline/ticker'

const news = ticker('#news-ticker', {
  duration: 24,
  direction: 'left',
  pauseOnHover: true,
})

if (!news) throw new Error('Ticker target not found')

news.update({ duration: 32 })
news.refresh()
```

What this does:

- Wraps the source content in the required ticker structure.
- Measures it and creates enough visual clones to fill the viewport.
- Keeps clones out of the accessibility tree and tab order by default.
- Rebuilds after responsive size changes.
- Returns `null` without changing the DOM if the selector is missing.

## Controller lifecycle

Destroy the controller when the view that created it is removed:

```ts
news.destroy()
```

## Declarative markup

When a server or template renders the complete ticker structure, initialize it at page level:

```html title="index.html"
<div data-ticker data-duration="24" data-direction="left" data-pause-on-hover="true">
  <div data-ticker-track>
    <div data-ticker-content>...</div>
  </div>
</div>
```

```ts title="app.ts"
import { mount, unmount } from '@samline/ticker/vanilla'
import '@samline/ticker/style.css'

mount()
window.addEventListener('pagehide', unmount, { once: true })
```

> **Keep one lifecycle owner**
>
> Use the controller API for application-owned instances and the page manager for declarative markup. Do not give both lifecycles ownership of the same element.

## What's next?

### Configuration

Every option, default, normalization rule, and declarative data attribute.

[Configuration →](/ticker/docs/reference/configuration/)

### Lifecycle

Understand controller ownership, page management, refreshes, and teardown.

[Lifecycle guide →](/ticker/docs/guides/lifecycle/)

### Accessibility

Reduced motion, clone semantics, keyboard behavior, and interactive content.

[Accessibility guide →](/ticker/docs/guides/accessibility/)

### Browser global

Use the pre-bundled `window.Ticker` registry without a build step.

[Browser reference →](/ticker/docs/reference/browser/)
