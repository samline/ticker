import sharedControls from '../../../../../shared/i18n/translations/en/controls'
export interface Recipe {
  id: string
  title: string
  navigationLabel: string
  description: string
  kind: 'news' | 'logos' | 'prices' | 'rows' | 'dynamic' | 'controls' | 'drag'
  docsPath: string
  docsLabel: string
  note: string
  rows: readonly {
    label: string
    duration: number
    direction: import('@samline/ticker').TickerDirection
    speed?: number
    autoplay?: boolean
    navigation?: boolean
    resumeAfterDrag?: boolean
    rtl?: boolean
    responsive?: import('@samline/ticker').TickerResponsiveRule[]
    items: readonly {
      label: string
      description?: string
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
    'Working Ticker recipes with complete HTML/CDN and npm examples. Try announcements, logos, sample prices, opposite rows, dynamic content and controls.',
  keywords: ['ticker examples', 'marquee examples', 'copy and paste HTML', 'vanilla JavaScript'],
  eyebrow: 'Examples',
  heading: 'Ticker',
  headingAccent: 'examples.',
  introduction:
    'Patterns to try, adjust and copy. Start with a live preview, then open the complete HTML / CDN or Package / ESM example below it.',
  instructions:
    'HTML / CDN opens directly as an index.html file with an internet connection; the CDN script exposes window.Ticker. For Package / ESM, install @samline/ticker and use the file in an HTML-entry bundler such as Vite. Both use the same ticker() API; a registry is optional.',
  accessibility:
    'Pause any preview to read at your own pace. Reduced motion and readable static content are built in.',
  gettingStarted: 'New to Ticker? Start with installation',
  skill: 'Building with an AI agent? Download the Ticker skill',
  code: 'Open code · HTML / CDN or Package / ESM',
  format: 'Example format',
  navigation: 'Choose an example',
  exploreAction: 'Explore the examples',
  installAction: 'Get started',
  formats: [
    { id: 'cdn', label: sharedControls.integration.html },
    { id: 'npm', label: sharedControls.integration.package },
  ] as const,
  file: 'index.html',
  copy: 'Copy complete {format} example: {title}',
  add: 'Add an update',
  removeFirst: 'Remove first',
  removeLast: 'Remove last',
  removeSelected: 'Remove selected',
  itemLabel: 'Choose an item',
  itemEmpty: 'No items left',
  removedStatus: 'Removed {item}. Visual copies refreshed.',
  added: 'New update {count}',
  addedStatus: 'Added update {count}. Visual copies refreshed.',
  speed: 'Loop duration (seconds)',
  direction: 'Direction',
  resumeAfterDrag: 'Resume after drag',
  enabled: 'On',
  disabled: 'Off',
  left: 'Left',
  right: 'Right',
  up: 'Up',
  down: 'Down',
  noJs: 'Motion needs JavaScript. Scroll to read all the original content.',
  sourceNote:
    'Read or copy HTML, CSS and JavaScript as three files in the same folder. Use Complete file to copy one runnable index.html instead. Copied code uses the initial settings; preview changes are not included.',
  brandAttribution: 'Demo brand marks and attribution',
  attribution: {
    titleAccent: 'attribution',
    description:
      'Sources, licenses and brand guidelines for the illustrative icons used in Ticker demos.',
    introduction:
      'The demo icons come from Simple Icons {version}. They illustrate sample content and do not imply endorsement by any brand.',
    project: 'Simple Icons source collection',
    licenseNote:
      'The Simple Icons project is distributed under CC0 1.0. Individual icons may have separate licenses and brand guidelines; the project license does not grant trademark rights.',
    license: 'Download the bundled CC0 license (Markdown)',
    disclaimer: 'Download the bundled icon disclaimer (Markdown)',
    sources: 'Icon sources',
    sourcesNote:
      'These links are recorded in the bundled Simple Icons metadata. Check the source and brand guidelines before reusing a mark.',
    guidelines: '{brand} brand guidelines',
    back: 'Back to Ticker examples',
  },
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
        'Add or remove announcements while the feed keeps a constant 40 pixels per second. Try removing the first, last or selected item; the original content and its visual copies stay in sync.',
      docsPath: 'guides/lifecycle/#update-versus-refresh',
      docsLabel: 'Learn when to update() or refresh()',
      note: 'The application owns the items and calls refresh() after editing the source. Pixel speed keeps the pace steady as the feed grows or shrinks.',
      rows: [
        {
          label: 'Live example updates',
          duration: 28,
          speed: 40,
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

    {
      id: 'manual-navigation',
      navigationLabel: 'Manual navigation',
      kind: 'news',
      title: 'Read at your own pace',
      description:
        'Start paused. Use Previous, Next, the position rail or a pointer gesture to explore a repeating sequence. Press Play, then drag: playback resumes after release when hover and focus pauses clear. Buttons and the rail leave playback paused.',
      docsPath: 'reference/api/controller/#manual-navigation',
      docsLabel: 'Read the manual navigation contract',
      note: 'Buttons advance one visible extent. The rail represents one repeated sequence and wraps at its end. Drag horizontally; vertical page scrolling stays available.',
      rows: [
        {
          label: 'Manual news navigation',
          duration: 20,
          direction: 'left',
          autoplay: false,
          navigation: true,
          resumeAfterDrag: true,
          items: news,
        },
      ],
    },
    {
      id: 'vertical-news',
      navigationLabel: 'Vertical news',
      kind: 'news',
      title: 'Vertical news',
      description:
        'A scrolling resource feed with illustrated cards, useful links and descriptions. Each card keeps its own height while the column moves at 28 pixels per second.',
      docsPath: 'reference/configuration/#vertical-and-writing-direction',
      docsLabel: 'Configure vertical movement',
      note: 'Illustrative technology marks, not product announcements or endorsements. Choose Up or Down to change movement. Hover or focus a link to read; use Previous, Next, the rail or drag to browse.',
      rows: [
        {
          label: 'Vertical ticker resources',
          duration: 20,
          speed: 28,
          direction: 'up',
          navigation: true,
          items: [
            {
              label: 'Astro: start with your own markup',
              description:
                'Initialize a ticker after the page mounts and keep its original links available.',
              logo: 'astro.svg',
              href: 'getting-started/',
            },
            {
              label: 'Vite: choose a steady reading pace',
              description:
                'Use pixel speed and viewport rules to keep a feed readable as its layout changes.',
              logo: 'vite.svg',
              href: 'reference/configuration/',
            },
            {
              label: 'GitHub: keep live content in sync',
              description:
                'Add items to the original source, refresh its copies and release the controller on cleanup.',
              logo: 'github.svg',
              href: 'guides/lifecycle/',
            },
            {
              label: 'Figma: make motion accessible',
              description:
                'Give keyboard users time to read with focus pause and respect reduced motion preferences.',
              logo: 'figma.svg',
              href: 'guides/accessibility/',
            },
          ],
        },
      ],
    },
    {
      id: 'constant-speed',
      navigationLabel: 'Constant speed',
      kind: 'rows',
      title: 'Duration and constant speed',
      description:
        'Compare a fixed 20-second cycle with a longer sequence moving at 40 pixels per second. Speed takes precedence over duration and survives content resizing.',
      docsPath: 'reference/configuration/#speed',
      docsLabel: 'Compare speed and duration',
      note: 'The first row uses duration. The second uses speed, so its duration follows the measured sequence length.',
      rows: [
        { label: 'Fixed duration', duration: 20, direction: 'left', items: news },
        {
          label: 'Constant pixel speed',
          duration: 20,
          speed: 40,
          direction: 'left',
          items: [...news, ...news],
        },
      ],
    },
    {
      id: 'rtl-content',
      navigationLabel: 'RTL content',
      kind: 'news',
      title: 'RTL content and logical movement',
      description:
        'Arabic and Hebrew text retain their writing order alongside numbers and Latin text. Automatic direction follows the inherited writing direction.',
      docsPath: 'reference/configuration/#vertical-and-writing-direction',
      docsLabel: 'Read the writing direction contract',
      note: 'Playback starts automatically. The preview has an explicit RTL region inside this LTR page. Previous and Next follow reading order; left and right remain physical animation directions.',
      rows: [
        {
          label: 'RTL mixed content',
          duration: 20,
          direction: 'auto',
          rtl: true,
          navigation: true,
          autoplay: true,
          items: [
            { label: 'العربية 123 ABC' },
            { label: 'עברית 456 XYZ' },
            { label: 'Release 2.1 — 789' },
          ],
        },
      ],
    },
    {
      id: 'responsive-options',
      navigationLabel: 'Responsive options',
      kind: 'news',
      title: 'Responsive motion',
      description:
        'Resize the viewport: the same content uses 45 pixels per second on desktop and 24 on narrow screens. Focus and explicit pause remain independent.',
      docsPath: 'reference/configuration/#responsive',
      docsLabel: 'Configure viewport rules',
      note: 'Below 48rem the viewport rule overrides speed. Leaving the rule restores the current base speed. Reduced motion still prevents autoplay.',
      rows: [
        {
          label: 'Responsive news',
          duration: 20,
          direction: 'left',
          speed: 45,
          responsive: [{ query: '(width < 48rem)', options: { speed: 24 } }],
          items: news,
        },
      ],
    },
    {
      id: 'drag-playback',
      navigationLabel: 'Drag and resume',
      kind: 'drag',
      title: 'Drag and choose what happens next',
      description:
        'Drag the moving strip with a mouse or touch. Turn Resume after drag on to continue playback after release, or off to leave the strip paused.',
      docsPath: 'reference/api/controller/#manual-navigation',
      docsLabel: 'Read about drag playback',
      note: 'With the option on, release and move the pointer away to clear hover pause. With it off, press Play before trying another drag. Changing the option does not start playback or clear a manual pause.',
      rows: [
        {
          label: 'Drag playback demo',
          duration: 20,
          speed: 40,
          direction: 'left',
          navigation: true,
          resumeAfterDrag: true,
          items: [
            { label: 'Grab the strip' },
            { label: 'Drag to explore' },
            { label: 'Release to compare' },
            { label: 'Switch resume on or off' },
          ],
        },
      ],
    },
  ] satisfies Recipe[],
}
