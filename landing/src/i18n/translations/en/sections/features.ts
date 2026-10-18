export default {
  eyebrow: '01 / Less code. More care.',
  title: 'Thoughtful by default.',
  titleAccent: 'Effortless by design.',
  items: {
    dependencies: {
      title: 'Zero dependencies',
      description: [
        {
          kind: 'text',
          value:
            'No animation library, no framework peer, no transitive packages. Import only the API your project needs.',
        },
      ],
    },
    accessibility: {
      title: 'Accessible by default',
      description: [
        {
          kind: 'text',
          value: 'Visual clones stay out of the accessibility tree and keyboard order. Honors ',
        },
        {
          kind: 'code',
          value: 'prefers-reduced-motion',
        },
        {
          kind: 'text',
          value: ' automatically.',
        },
      ],
    },
    lifecycle: {
      title: 'Responsive lifecycle',
      description: [
        {
          kind: 'text',
          value:
            'Remeasures on resize. Call refresh() after changing content. Pauses when the ticker leaves the viewport or the document is hidden.',
        },
      ],
    },
    entrypoints: {
      title: 'Multiple entrypoints',
      description: [
        {
          kind: 'text',
          value:
            'Package imports or an HTML script tag, with the same controller API. Optional registry, page manager and core helpers fit different ownership needs.',
        },
      ],
    },
    frameworks: {
      title: 'Framework agnostic',
      description: [
        {
          kind: 'text',
          value:
            'Works in React, Vue, Svelte, Astro, plain HTML, WordPress, or Shopify. No adapter, no wrapper, no peer dependency.',
        },
      ],
    },
    markup: {
      title: 'Enhances your markup',
      description: [
        {
          kind: 'text',
          value: 'Pass a selector or DOM element. Your source is restored on ',
        },
        {
          kind: 'code',
          value: 'destroy()',
        },
        {
          kind: 'text',
          value: '; the controller manages animation markup.',
        },
      ],
    },
  },
} as const
