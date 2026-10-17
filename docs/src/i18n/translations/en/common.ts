import common from '../../../../../shared/i18n/translations/en/common'
import packageMetadata from '../../../../../package.json'
export default {
  name: packageMetadata.name,
  versionLabel: common.versionLabel,
  docs: 'Documentation',
  examples: 'Working examples',
  examplesDescription: 'Try a live recipe, then copy its complete HTML or npm example.',
  github: 'GitHub',
  skip: 'Skip to content',
  license: 'MIT licensed',
  footer: 'Made for the web. Built with care.',
  changelog: {
    title: 'Changelog',
    description:
      'Release notes for every documented Ticker version, including breaking changes, behavior changes, features and fixes.',
  },
  reading: 'Guide',
  apiReading: 'API reference',
}
