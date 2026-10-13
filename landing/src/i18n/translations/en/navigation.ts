export default {
  mainLabel: 'Main navigation',
  skipContent: 'Skip to content',
  mobile: {
    title: 'Explore Ticker',
    introduction: 'Find your starting point. Make it your own.',
    resources: 'Around the project',
    label: 'Mobile navigation',
    open: 'Open navigation menu',
    close: 'Close navigation menu',
  },
  items: [
    { docsRoute: 'overview', label: 'Docs', description: 'The complete guide and API reference.' },
    {
      href: '#features',
      label: 'Features',
      description: 'What Ticker brings to your project.',
    },
    {
      href: '#how',
      label: 'Get started',
      description: 'Install, initialize and start moving.',
    },
    {
      href: '#recipes',
      label: 'Recipes',
      description: 'Practical patterns for real integrations.',
    },
    {
      href: '#faq',
      label: 'FAQ',
      description: 'A few details before you build.',
    },
  ],
  footer: {
    description: 'A small, framework-agnostic library for moving content across the open web.',
    label: 'Footer navigation',
    explore: 'Explore',
    project: 'Project',
    setup: 'Installation guide',
    backToTop: 'Back to top',
    credit: 'Samuel Olvera · Made for the open web.',
  },
} as const
