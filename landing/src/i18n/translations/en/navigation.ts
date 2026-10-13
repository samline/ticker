export default {
  mainLabel: 'Main navigation',
  skipContent: 'Skip to content',
  mobile: {
    title: 'Explore Ticker',
    label: 'Mobile navigation',
    open: 'Open navigation menu',
    close: 'Close navigation menu',
  },
  items: [
    { docsRoute: 'overview', label: 'Docs' },
    {
      href: '#features',
      label: 'Features',
    },
    {
      href: '#how',
      label: 'Get started',
    },
    {
      href: '#recipes',
      label: 'Recipes',
    },
    {
      href: '#faq',
      label: 'FAQ',
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
