export default {
  eyebrow: '04 / The details that matter',
  title: 'Small footprint.',
  titleAccent: 'A considered foundation.',
  description: 'See what the library handles and what your integration controls.',
  ariaLabel: 'Ticker capabilities table',
  caption: 'Ticker capabilities and integration responsibilities',
  headers: {
    capability: 'Capability',
    integration: 'Your integration',
  },
  rows: {
    frameworks: {
      capability: 'Framework dependencies',
      library: 'None',
      integration: 'Use the DOM API from your framework lifecycle.',
    },
    clones: {
      capability: 'Visual clones',
      library: 'Hidden from assistive technology and keyboard focus',
      integration: 'Keep the original content meaningful and accessible.',
    },
    playback: {
      capability: 'Playback',
      library: 'Pauses off-screen and in hidden documents',
      integration: 'Offer a pause control for continuous motion.',
    },
    motion: {
      capability: 'Reduced motion',
      library: 'Respects the system preference',
      integration: 'Keep static content readable and reachable.',
    },
    layout: {
      capability: 'Layout changes',
      library: 'Remeasures on resize',
      integration: 'Call refresh() after editing content or loading fonts.',
    },
    distribution: {
      capability: 'Distribution',
      library: 'ESM, CommonJS, browser global, and CSS',
      integration: 'Load the stylesheet alongside the API.',
    },
    license: {
      capability: 'Licensing',
      library: 'MIT',
      integration: 'Retain the license when redistributing.',
    },
  },
} as const
