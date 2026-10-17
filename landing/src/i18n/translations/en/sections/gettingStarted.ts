export default {
  eyebrow: '03 / From zero to rolling',
  heading: [
    { kind: 'text', value: 'Three steps. ' },
    { kind: 'emphasis', value: 'No build step required.' },
  ],
  steps: {
    install: 'Install',
    markup: 'Add markup',
    initialize: 'Initialize',
  },
  docs: {
    description:
      'This is the minimal setup. Explore duration, direction and hover behavior before adapting the ticker to your design.',
    label: 'Explore configuration options',
  },
  markupDescription:
    'Write the content as you normally would. The library enhances it, never replaces it.',
  installLabel: 'Installation method',
  initLabel: 'Initialization method',
  installTabs: [
    {
      id: 'npm',
      label: 'npm',
    },
    {
      id: 'pnpm',
      label: 'pnpm',
    },
    {
      id: 'bun',
      label: 'bun',
    },
    {
      id: 'cdn',
      label: 'CDN',
    },
  ],
  initTabs: [
    {
      id: 'vanilla',
      label: 'Vanilla',
    },
    {
      id: 'global',
      label: 'Global',
    },
  ],
  examples: {
    npm: {
      filename: 'terminal',
      language: 'bash',
      code: `npm install @samline/ticker`,
    },
    pnpm: {
      filename: 'terminal',
      language: 'bash',
      code: `pnpm add @samline/ticker`,
    },
    bun: {
      filename: 'terminal',
      language: 'bash',
      code: `bun add @samline/ticker`,
    },
    cdn: {
      filename: 'index.html',
      language: 'html',
      code: `<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.0.4/dist/style.css">
<script src="https://unpkg.com/@samline/ticker@2.0.4/dist/browser/global.global.js"></script>`,
    },
    markup: {
      filename: 'index.html',
      language: 'html',
      code: `<div id="news">
  <a href="/one">First story</a>
  <a href="/two">Second story</a>
  <a href="/three">Third story</a>
</div>`,
    },
    vanilla: {
      filename: 'main.ts',
      language: 'typescript',
      code: `import { ticker } from '@samline/ticker'
import '@samline/ticker/style.css'

const news = ticker('#news', {
  duration: 20,
  pauseOnHover: true,
})`,
    },
    global: {
      filename: 'inline script',
      language: 'javascript',
      code: `const news = window.Ticker.newTicker({
  id: 'news',
  options: { duration: 24, pauseOnHover: true },
})`,
    },
  },
} as const
