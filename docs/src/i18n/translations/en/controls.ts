import sharedControls from '../../../../../shared/i18n/translations/en/controls'
export default {
  tabs: {
    installation: 'Installation method',
    installItems: [
      { id: 'npm', label: 'npm' },
      { id: 'pnpm', label: 'pnpm' },
      { id: 'yarn', label: 'yarn' },
      { id: 'bun', label: 'bun' },
      { id: 'cdn', label: 'CDN' },
    ],
    initialization: 'Initialization format',
    initItems: [
      { id: 'module', label: sharedControls.integration.package },
      { id: 'global', label: sharedControls.integration.html },
    ],
    moduleFormat: 'Module format',
    formatItems: [
      { id: 'esm', label: 'ESM / TypeScript' },
      { id: 'cjs', label: 'CommonJS' },
    ],
  },
  search: {
    label: 'Search documentation',
    placeholder: 'Search APIs, guides, and examples…',
    hint: 'Ctrl / ⌘ K',
    close: 'Close search',
    handle: 'Drag up to close search',
    initial: 'Find an API, integration pattern, or answer.',
    loading: 'Searching…',
    empty: 'No results. Try another term.',
    error: 'Search could not load. Browse the navigation or try again.',
    results: 'Search results',
    count: 'Showing {shown} of {count} results',
  },
  copy: { aria: 'Copy code example', code: 'Code' },
}
