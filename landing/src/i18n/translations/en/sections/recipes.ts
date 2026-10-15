export default {
  examplesLabel: 'Try the complete working examples',
  eyebrow: '04 / Working with a live instance',
  title: 'Beyond the first render.',
  titleAccent: 'Handle what changes.',
  description:
    'Changing settings, editing content and removing a registered ticker need different actions. Start with the instance from Get started, then use the recipe that fits.',
  items: [
    {
      context: 'Controller',
      title: 'Change direction without starting over',
      description: [
        { kind: 'text', value: 'Use ' },
        { kind: 'code', value: 'update()' },
        {
          kind: 'text',
          value:
            ' on the existing instance. Omitted settings keep their current values, so changing direction leaves the configured duration intact. The library schedules the refresh for you.',
        },
      ],
      docsRoute: 'update',
      docsLabel: 'Read the update() reference',
      code: {
        filename: 'update.js',
        tokens: [
          { kind: 'plain', value: 'news?.' },
          { kind: 'fn', value: 'update' },
          { kind: 'plain', value: '({\n  direction: ' },
          { kind: 'str', value: "'right'" },
          { kind: 'plain', value: ',\n})' },
        ],
      },
    },
    {
      context: 'Controller',
      title: 'Edit the source, then sync its copies',
      description: [
        { kind: 'text', value: 'Add content to ' },
        { kind: 'code', value: 'source' },
        {
          kind: 'text',
          value:
            ', rather than the generated copies. Explicitly refresh after the edit: a resize check can reuse copies if the measured width stays unchanged.',
        },
      ],
      docsRoute: 'content',
      docsLabel: 'See how content refresh works',
      code: {
        filename: 'content.js',
        tokens: [
          { kind: 'key', value: 'const' },
          { kind: 'plain', value: ' item = document.' },
          { kind: 'fn', value: 'createElement' },
          { kind: 'plain', value: '(' },
          { kind: 'str', value: "'span'" },
          { kind: 'plain', value: ')\nitem.textContent = ' },
          { kind: 'str', value: "'Shipping something new.'" },
          { kind: 'plain', value: '\n\nnews?.source.' },
          { kind: 'fn', value: 'append' },
          { kind: 'plain', value: '(item)\nnews?.' },
          { kind: 'fn', value: 'refresh' },
          { kind: 'plain', value: '()' },
        ],
      },
    },
    {
      context: 'Browser global',
      title: 'Remove the registration, too',
      description: [
        { kind: 'text', value: 'If you created the ticker with ' },
        { kind: 'code', value: 'window.Ticker.newTicker()' },
        { kind: 'text', value: ', clean it up through ' },
        { kind: 'code', value: 'destroyTicker(id)' },
        {
          kind: 'text',
          value:
            '. This removes the registry entry as well as the instance. Calling only the returned controller’s destroy() leaves registry bookkeeping behind.',
        },
      ],
      docsRoute: 'registry',
      docsLabel: 'Read the browser registry guide',
      code: {
        filename: 'cleanup.js',
        tokens: [
          { kind: 'attr', value: 'window' },
          { kind: 'plain', value: '.Ticker.' },
          { kind: 'fn', value: 'destroyTicker' },
          { kind: 'plain', value: '(' },
          { kind: 'str', value: "'news'" },
          { kind: 'plain', value: ')' },
        ],
      },
    },
  ],
} as const
