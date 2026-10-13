export default {
  eyebrow: '03 / From zero to rolling',
  heading: [
    { kind: 'text', value: 'Three steps. ' },
    { kind: 'emphasis', value: 'No build step required.' },
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
      label: 'Vanilla',
    },
    {
      id: 'global',
      label: 'Global',
    },
  ],
  examples: {
    npm: {
      filename: 'terminal',
      tokens: [
        {
          kind: 'key',
          value: 'npm',
        },
        {
          kind: 'plain',
          value: ' install ',
        },
        {
          kind: 'str',
          value: '@samline/ticker',
        },
      ],
    },
    pnpm: {
      filename: 'terminal',
      tokens: [
        {
          kind: 'key',
          value: 'pnpm',
        },
        {
          kind: 'plain',
          value: ' add ',
        },
        {
          kind: 'str',
          value: '@samline/ticker',
        },
      ],
    },
    bun: {
      filename: 'terminal',
      tokens: [
        {
          kind: 'key',
          value: 'bun',
        },
        {
          kind: 'plain',
          value: ' add ',
        },
        {
          kind: 'str',
          value: '@samline/ticker',
        },
      ],
    },
    cdn: {
      filename: 'index.html',
      tokens: [
        {
          kind: 'tag',
          value: '<link',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'rel',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"stylesheet"',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'href',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"https://unpkg.com/@samline/ticker@2.0.4/dist/style.css"',
        },
        {
          kind: 'tag',
          value: '>',
        },
        {
          kind: 'plain',
          value: '\n',
        },
        {
          kind: 'tag',
          value: '<script',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'src',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"https://unpkg.com/@samline/ticker@2.0.4/dist/browser/global.global.js"',
        },
        {
          kind: 'tag',
          value: '></script>',
        },
      ],
    },
    markup: {
      filename: 'index.html',
      tokens: [
        {
          kind: 'tag',
          value: '<div',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'id',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"news"',
        },
        {
          kind: 'tag',
          value: '>',
        },
        {
          kind: 'plain',
          value: '\n  ',
        },
        {
          kind: 'tag',
          value: '<a',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'href',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"/one"',
        },
        {
          kind: 'tag',
          value: '>',
        },
        {
          kind: 'plain',
          value: 'First story',
        },
        {
          kind: 'tag',
          value: '</a>',
        },
        {
          kind: 'plain',
          value: '\n  ',
        },
        {
          kind: 'tag',
          value: '<a',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'href',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"/two"',
        },
        {
          kind: 'tag',
          value: '>',
        },
        {
          kind: 'plain',
          value: 'Second story',
        },
        {
          kind: 'tag',
          value: '</a>',
        },
        {
          kind: 'plain',
          value: '\n  ',
        },
        {
          kind: 'tag',
          value: '<a',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'attr',
          value: 'href',
        },
        {
          kind: 'plain',
          value: '=',
        },
        {
          kind: 'str',
          value: '"/three"',
        },
        {
          kind: 'tag',
          value: '>',
        },
        {
          kind: 'plain',
          value: 'Third story',
        },
        {
          kind: 'tag',
          value: '</a>',
        },
        {
          kind: 'plain',
          value: '\n',
        },
        {
          kind: 'tag',
          value: '</div>',
        },
      ],
    },
    vanilla: {
      filename: 'main.ts',
      tokens: [
        {
          kind: 'key',
          value: 'import',
        },
        {
          kind: 'plain',
          value: ' { ',
        },
        {
          kind: 'fn',
          value: 'ticker',
        },
        {
          kind: 'plain',
          value: ' } ',
        },
        {
          kind: 'key',
          value: 'from',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'str',
          value: "'@samline/ticker'",
        },
        {
          kind: 'plain',
          value: '\n',
        },
        {
          kind: 'key',
          value: 'import',
        },
        {
          kind: 'plain',
          value: ' ',
        },
        {
          kind: 'str',
          value: "'@samline/ticker/style.css'",
        },
        {
          kind: 'plain',
          value: '\n\n',
        },
        {
          kind: 'key',
          value: 'const',
        },
        {
          kind: 'plain',
          value: ' news = ',
        },
        {
          kind: 'fn',
          value: 'ticker',
        },
        {
          kind: 'plain',
          value: '(',
        },
        {
          kind: 'str',
          value: "'#news'",
        },
        {
          kind: 'plain',
          value: ', {\n  duration: ',
        },
        {
          kind: 'num',
          value: '20',
        },
        {
          kind: 'plain',
          value: ',\n  pauseOnHover: ',
        },
        {
          kind: 'key',
          value: 'true',
        },
        {
          kind: 'plain',
          value: ',\n})',
        },
      ],
    },
    global: {
      filename: 'inline script',
      tokens: [
        {
          kind: 'key',
          value: 'const',
        },
        {
          kind: 'plain',
          value: ' news = ',
        },
        {
          kind: 'attr',
          value: 'window',
        },
        {
          kind: 'plain',
          value: '.',
        },
        {
          kind: 'fn',
          value: 'Ticker',
        },
        {
          kind: 'plain',
          value: '.',
        },
        {
          kind: 'fn',
          value: 'newTicker',
        },
        {
          kind: 'plain',
          value: '({\n  id: ',
        },
        {
          kind: 'str',
          value: "'news'",
        },
        {
          kind: 'plain',
          value: ',\n  options: { duration: ',
        },
        {
          kind: 'num',
          value: '24',
        },
        {
          kind: 'plain',
          value: ', pauseOnHover: ',
        },
        {
          kind: 'key',
          value: 'true',
        },
        {
          kind: 'plain',
          value: ' },\n})',
        },
      ],
    },
  },
} as const
