import { defineSiteConfig } from './site.schema.mjs'

export default defineSiteConfig({
  title: 'Ticker',
  description:
    '@samline/ticker — accessible, dependency-free tickers for Vanilla JavaScript, TypeScript, and plain HTML.',
  site: 'https://samline.github.io',
  base: '/ticker',
  editLinkBaseUrl: 'https://github.com/samline/ticker/edit/main/example/src/content/docs/',
  sidebar: [
    {
      label: 'Guide',
      items: [
        { slug: 'getting-started' },
        { slug: 'guides/lifecycle' },
        { slug: 'guides/html-and-browser' },
        { slug: 'guides/accessibility' },
        { slug: 'guides/migration' },
      ],
    },
    {
      label: 'Reference',
      items: [
        { slug: 'reference' },
        { slug: 'reference/configuration' },
        { slug: 'reference/api' },
        { slug: 'reference/core' },
        { slug: 'reference/typescript' },
        { slug: 'reference/browser' },
        { slug: 'reference/entrypoints' },
        { slug: 'reference/styling' },
        { slug: 'reference/examples' },
      ],
    },
  ],
  social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/samline/ticker' }],
  defaultLocale: 'en',
  locales: { root: { label: 'English', lang: 'en' } },
})
