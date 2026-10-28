import sharedControls from '../../../../../../shared/i18n/translations/en/controls'
export default {
  eyebrow: '03 / From zero to rolling',
  heading: [
    { kind: 'text', value: 'Three steps. ' },
    { kind: 'emphasis', value: 'Package or script tag.' },
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
  integrationDescription:
    'Installed with npm, pnpm or bun? Choose Package / ESM to import Ticker. Loaded the CDN files? Choose HTML / CDN to call window.Ticker. Both return the same controller.',
  integrationLabel: 'Understand the loading options',
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
      label: sharedControls.integration.package,
    },
    {
      id: 'global',
      label: sharedControls.integration.html,
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
      code: `<link rel="stylesheet" href="https://unpkg.com/@samline/ticker@2.2.0/dist/style.css">
<script src="https://unpkg.com/@samline/ticker@2.2.0/dist/browser/global.global.js"></script>`,
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
      code: `const news = window.Ticker.ticker('#news', {
  duration: 20,
  pauseOnHover: true,
})`,
    },
  },
} as const
