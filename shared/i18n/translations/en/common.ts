import packageInfo from '../../../../package.json'

export default {
  packageName: packageInfo.name,
  version: packageInfo.version,
  author: packageInfo.author,
  externalLinkHint: '(opens in a new tab)',
  license: 'MIT',
  versionLabel: 'v{version}',
  brandHome: '{name} home',
  links: {
    github: 'GitHub',
    docs: 'Docs',
    npm: 'npm',
    license: 'License',
  },
  buttons: {
    getStarted: 'Get started',
    exploreDemo: 'Explore the demo',
    starGithub: 'Star on GitHub',
  },
} as const
