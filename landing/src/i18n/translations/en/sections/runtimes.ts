import sharedControls from '../../../../../../shared/i18n/translations/en/controls'
export default {
  eyebrow: '02 / Choose your entrypoint',
  heading: [
    { kind: 'text', value: 'Built for every ' },
    { kind: 'emphasis', value: 'runtime' },
    { kind: 'text', value: '.' },
  ],
  description:
    'Start with the package import or an HTML script tag. The optional registry is available in either setup; CDN describes file delivery, not a different Ticker API.',
  items: {
    main: {
      label: 'Main',
      entrypoint: '@samline/ticker',
      description:
        'Package / ESM entry: import ticker() and load style.css. Also exports types, defaults and the optional registry.',
    },
    vanilla: {
      label: 'Vanilla',
      entrypoint: '@samline/ticker/vanilla',
      description:
        'Element-scoped controller plus the declarative page manager. Auto-discovers tickers as the DOM changes.',
    },
    browser: {
      label: 'Registry',
      entrypoint: '@samline/ticker/browser',
      description:
        'Optional ID-based registry for module imports. This browser subpath does not install window.Ticker and is not the CDN script.',
    },
    global: {
      label: sharedControls.integration.html,
      entrypoint: '/browser/global',
      description:
        'Load the script from a CDN or your own server, plus style.css. It exposes window.Ticker for plain HTML, WordPress or Shopify.',
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
