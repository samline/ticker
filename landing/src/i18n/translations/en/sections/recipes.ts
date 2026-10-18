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
        language: 'javascript',
        code: `news?.update({
  direction: 'right',
})`,
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
        language: 'javascript',
        code: `const item = document.createElement('span')
item.textContent = 'Shipping something new.'

news?.source.append(item)
news?.refresh()`,
      },
    },
    {
      context: 'Optional registry',
      title: 'Remove the registration, too',
      description: [
        { kind: 'text', value: 'If you created the ticker with ' },
        { kind: 'code', value: 'window.Ticker.newTicker()' },
        { kind: 'text', value: ' in HTML / CDN, clean it up through ' },
        { kind: 'code', value: 'destroyTicker(id)' },
        {
          kind: 'text',
          value:
            '. This removes the registry entry as well as the instance. Calling only the returned controller’s destroy() leaves registry bookkeeping behind.',
        },
      ],
      docsRoute: 'registry',
      docsLabel: 'Understand registry ownership',
      code: {
        filename: 'cleanup.js',
        language: 'javascript',
        code: `window.Ticker.destroyTicker('news')`,
      },
    },
  ],
} as const
