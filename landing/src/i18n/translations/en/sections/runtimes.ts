export default {
  eyebrow: '02 / Choose your entrypoint',
  heading: [
    { kind: 'text', value: 'Built for every ' },
    { kind: 'emphasis', value: 'runtime' },
    { kind: 'text', value: '.' },
  ],
  description:
    'Import the API your stack already uses. No polyfill, no configuration step, no global state you did not ask for.',
  items: {
    main: {
      label: 'Main',
      entrypoint: '@samline/ticker',
      description: 'Full API plus defaults, the browser singleton, and the registry.',
    },
    vanilla: {
      label: 'Vanilla',
      entrypoint: '@samline/ticker/vanilla',
      description:
        'Element-scoped controller plus the declarative page manager. Auto-discovers tickers as the DOM changes.',
    },
    browser: {
      label: 'Browser',
      entrypoint: '@samline/ticker/browser',
      description:
        'ESM/CJS browser registry without installing a window global. Tree-shakable for modern bundles.',
    },
    global: {
      label: 'Global',
      entrypoint: '/browser/global',
      description:
        'A single IIFE for plain HTML, WordPress, Shopify, and any server-rendered template. Just one script tag.',
    },
    core: {
      label: 'Core',
      entrypoint: '@samline/ticker/core',
      description:
        'Types, defaults, state factories, and validation helpers for advanced integrations and custom builds.',
    },
    style: {
      label: 'Style',
      entrypoint: '/style.css',
      description:
        'Required layout, animation, and reduced-motion styles. One import, no CSS framework required.',
    },
  },
} as const
