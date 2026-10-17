export default {
  eyebrow: '05 / Good questions',
  heading: [
    { kind: 'text', value: 'Frequently asked ' },
    { kind: 'emphasis', value: 'questions' },
    { kind: 'text', value: '.' },
  ],
  items: {
    cssAnimation: {
      question: [
        {
          kind: 'text',
          value: 'Why not just use a CSS animation?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value:
            'CSS handles the animation, while JavaScript manages clones, visibility, and changing measurements. This library provides that lifecycle. Call refresh() after updating content or loading fonts, and provide a pause control for continuous motion.',
        },
      ],
    },
    frameworkFree: {
      question: [
        {
          kind: 'text',
          value: 'Does it work without a framework?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value:
            'Yes. The browser global is a single IIFE you can drop into any plain HTML page, WordPress theme, or Shopify template. There is no build step, no peer dependency, and no ',
        },
        {
          kind: 'code',
          value: 'window',
        },
        {
          kind: 'text',
          value: ' pollution beyond the ',
        },
        {
          kind: 'code',
          value: 'Ticker',
        },
        {
          kind: 'text',
          value: ' namespace.',
        },
      ],
    },
    accessibility: {
      question: [
        {
          kind: 'text',
          value: 'How does it handle accessibility?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value: 'Visual clones are marked ',
        },
        {
          kind: 'code',
          value: 'aria-hidden="true"',
        },
        {
          kind: 'text',
          value:
            " and removed from the tab order, so screen readers and keyboard users only see your original content. The library also pauses animation when the document is hidden and when the user's system reports a preference for reduced motion.",
        },
      ],
    },
    nativeMarquee: {
      question: [
        {
          kind: 'text',
          value: 'Is the native ',
        },
        {
          kind: 'code',
          value: '<marquee>',
        },
        {
          kind: 'text',
          value: ' element deprecated?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value: 'Yes — both WHATWG and the HTML living standard list ',
        },
        {
          kind: 'code',
          value: '<marquee>',
        },
        {
          kind: 'text',
          value:
            ' as obsolete. This library gives you the behavior people still want from a marquee, on top of a normal ',
        },
        {
          kind: 'code',
          value: '<div>',
        },
        {
          kind: 'text',
          value: ' you fully control.',
        },
      ],
    },
    frameworkIntegration: {
      question: [
        {
          kind: 'text',
          value: 'Can I use it with React, Vue, or Svelte?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value: 'Yes. Pass a ref to a DOM element into the ',
        },
        {
          kind: 'code',
          value: 'ticker()',
        },
        {
          kind: 'text',
          value: ' factory and call ',
        },
        {
          kind: 'code',
          value: 'destroy()',
        },
        {
          kind: 'text',
          value:
            ' from your unmount handler. There is no framework adapter to install and no peer dependency to ship.',
        },
      ],
    },
    hiddenTab: {
      question: [
        {
          kind: 'text',
          value: 'Does it pause when the tab is hidden?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value:
            'Yes. The library listens to the document visibility API and to the IntersectionObserver for the ticker element itself, so the animation only runs when the user can actually see it. This keeps CPU and battery usage in check on long-running pages.',
        },
      ],
    },
    bundleSize: {
      question: [
        {
          kind: 'text',
          value: 'How big is the bundle?',
        },
      ],
      answer: [
        {
          kind: 'text',
          value:
            'Size depends on the entrypoint and your bundler’s tree shaking. The locally built v2.1.0 browser bundle is approximately ',
        },
        {
          kind: 'strong',
          value: '8.0 KiB gzipped',
        },
        {
          kind: 'text',
          value: ', plus ',
        },
        {
          kind: 'strong',
          value: '0.7 KiB gzipped',
        },
        {
          kind: 'text',
          value: ' for the required stylesheet. There are zero runtime dependencies.',
        },
      ],
    },
  },
} as const
