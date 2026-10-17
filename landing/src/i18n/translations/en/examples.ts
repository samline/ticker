export interface Recipe {
  id: string
  title: string
  navigationLabel: string
  description: string
  kind: 'news' | 'logos' | 'prices' | 'rows' | 'dynamic' | 'controls'
  docsPath: string
  docsLabel: string
  note: string
  rows: readonly {
    label: string
    duration: number
    direction: 'left' | 'right'
    items: readonly {
      label: string
      href?: string
      logo?: string
      value?: string
      change?: string
    }[]
  }[]
}
const news = [
  { label: 'Start with a working ticker', href: 'getting-started/' },
  { label: 'Make motion accessible', href: 'guides/accessibility/' },
  { label: 'Choose your configuration', href: 'reference/configuration/' },
]
export default {
  title: 'Ticker examples — Copy, paste, make it move',
  description:
    'Six working Ticker recipes with complete HTML/CDN and npm examples. Try announcements, logos, sample prices, opposite rows, dynamic content and controls.',
  keywords: ['ticker examples', 'marquee examples', 'copy and paste HTML', 'vanilla JavaScript'],
  eyebrow: 'Examples',
  heading: 'Ticker',
  headingAccent: 'examples.',
  introduction:
    'Six patterns to try, adjust and copy. Start with a live preview, then open the complete HTML / CDN or npm example below it.',
  instructions:
    'HTML / CDN opens directly as an index.html file with an internet connection. For npm / ESM, install @samline/ticker and use the file in an HTML-entry bundler such as Vite.',
  accessibility:
    'Pause any preview to read at your own pace. Reduced motion and readable static content are built in.',
  gettingStarted: 'New to Ticker? Start with installation',
  skill: 'Building with an AI agent? Download the Ticker skill',
  code: 'Open code · HTML / CDN or npm',
  format: 'Example format',
  navigation: 'Choose an example',
  formats: [
    { id: 'cdn', label: 'HTML / CDN' },
    { id: 'npm', label: 'npm / ESM' },
  ] as const,
  file: 'index.html',
  copy: 'Copy complete {format} example: {title}',
  add: 'Add an update',
  added: 'New update {count}',
  addedStatus: 'Added update {count}. Visual copies refreshed.',
  speed: 'Loop duration (seconds)',
  direction: 'Direction',
  left: 'Left',
  right: 'Right',
  noJs: 'Motion needs JavaScript. Scroll to read all the original content.',
  sourceNote:
    'Copied code uses the initial settings shown when this page loads. Preview changes are not included.',
  brandAttribution: 'Demo brand marks and attribution',
  recipes: [
    {
      id: 'announcements',
      navigationLabel: 'Announcements',
      kind: 'news',
      title: 'News and updates',
      description:
        'Share releases, notices and useful links in a moving news strip. Visitors can follow the original links without tabbing through repeated copies.',
      docsPath: 'guides/accessibility/',
      docsLabel: 'Read about links and clone accessibility',
      note: 'Hover or focus a link to pause. The pause button works independently of pointer hover.',
      rows: [{ label: 'Ticker resources', duration: 28, direction: 'left', items: news }],
    },
    {
      id: 'brand-logos',
      navigationLabel: 'Brand logos',
      kind: 'logos',
      title: 'Partners and tools',
      description:
        'Give partners, sponsors or tools a place on your page. This example includes the SVGs in its copied code, ready to use with attribution.',
      docsPath: 'reference/styling/',
      docsLabel: 'Explore the styling and DOM contract',
      note: 'Brand marks are illustrative and do not imply endorsement. Keep their attribution when reusing them.',
      rows: [
        {
          label: 'Example technology marks',
          duration: 36,
          direction: 'left',
          items: [
            { label: 'Astro', logo: 'astro.svg' },
            { label: 'Vite', logo: 'vite.svg' },
            { label: 'GitHub', logo: 'github.svg' },
            { label: 'Figma', logo: 'figma.svg' },
          ],
        },
      ],
    },
    {
      id: 'sample-prices',
      navigationLabel: 'Prices & stats',
      kind: 'prices',
      title: 'Prices and metrics',
      description:
        'Display prices, scores or other changing numbers in a compact row. Plus and minus signs make the trend clear alongside color.',
      docsPath: 'reference/configuration/',
      docsLabel: 'Adjust timing and direction',
      note: 'Illustrative data only. These values do not update from a market feed.',
      rows: [
        {
          label: 'Illustrative market data',
          duration: 32,
          direction: 'right',
          items: [
            { label: 'ACME', value: '$128.40', change: '+2.4%' },
            { label: 'ORBIT', value: '$84.12', change: '−0.8%' },
            { label: 'LAYER', value: '$206.55', change: '+1.3%' },
            { label: 'NORTH', value: '$62.70', change: '+0.6%' },
          ],
        },
      ],
    },
    {
      id: 'opposite-rows',
      navigationLabel: 'Opposite rows',
      kind: 'rows',
      title: 'Two rows, two directions',
      description:
        'Pair two strips moving in opposite directions, each at its own pace. In the preview, you can pause either row without stopping the other.',
      docsPath: 'guides/lifecycle/',
      docsLabel: 'Understand controller ownership and cleanup',
      note: 'Each row is a separate instance. They share content styling, not runtime state. The standalone example includes a combined pause control.',
      rows: [
        {
          label: 'Creative disciplines',
          duration: 26,
          direction: 'left',
          items: [
            { label: 'Design' },
            { label: 'Development' },
            { label: 'Motion' },
            { label: 'Accessibility' },
          ],
        },
        {
          label: 'Ways of working',
          duration: 38,
          direction: 'right',
          items: [
            { label: 'Build with care' },
            { label: 'Keep it readable' },
            { label: 'Ship something useful' },
          ],
        },
      ],
    },
    {
      id: 'dynamic-content',
      navigationLabel: 'Dynamic content',
      kind: 'dynamic',
      title: 'A feed that grows',
      description:
        'Add a new announcement without rebuilding your ticker. Try the button: the original content and its moving copies update together.',
      docsPath: 'guides/lifecycle/#update-versus-refresh',
      docsLabel: 'Learn when to update() or refresh()',
      note: 'The application changes the source. Ticker measures it and refreshes its visual copies.',
      rows: [
        {
          label: 'Live example updates',
          duration: 28,
          direction: 'left',
          items: [
            { label: 'Project created' },
            { label: 'Design approved' },
            { label: 'Ready to ship' },
          ],
        },
      ],
    },
    {
      id: 'playback-controls',
      navigationLabel: 'Playback controls',
      kind: 'controls',
      title: 'Speed and direction',
      description:
        'Find a pace that suits your content, then try the opposite direction. A shorter loop moves faster; your content stays in place while the settings change.',
      docsPath: 'reference/api/update/',
      docsLabel: 'See the update() contract',
      note: 'A shorter duration moves faster. Focus inside the preview pauses motion so controls and content stay usable.',
      rows: [
        {
          label: 'Adjustable ticker',
          duration: 24,
          direction: 'left',
          items: [
            { label: 'Your content' },
            { label: 'Your direction' },
            { label: 'Your pace' },
            { label: 'One small library' },
          ],
        },
      ],
    },
  ] satisfies Recipe[],
}
