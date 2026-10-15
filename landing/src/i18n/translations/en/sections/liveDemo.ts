export default {
  label: 'Live demo content',
  title: 'THE LIBRARY, LIVE',
  integrationNote:
    'Ticker manages motion. Your integration should provide a pause control and keep the original content readable.',
  tabs: [
    {
      id: 'news',
      label: 'Announcements',
    },
    {
      id: 'logos',
      label: 'Brands',
    },
    {
      id: 'prices',
      label: 'Prices',
    },
  ],
  panels: {
    news: {
      eyebrow: '01 / ANNOUNCEMENTS',
      tagline: 'GOOD NEWS TRAVELS.',
      label: 'Latest announcements',
    },
    logos: {
      eyebrow: '02 / BRAND STRIP',
      tagline: 'SAMPLE LOGOS, NO ENDORSEMENTS.',
      label: 'Sample brand logos; illustrative content, not endorsements',
    },
    prices: {
      eyebrow: '03 / MARKET TAPE',
      tagline: 'ILLUSTRATIVE DATA.',
      label: 'Sample market data',
    },
  },
  news: [
    {
      href: '#how',
      label: 'Get started with v{version}',
      openPrices: false,
    },
    {
      href: '#features',
      label: 'Built-in reduced-motion support',
      openPrices: false,
    },
    {
      href: '#demo',
      label: 'Try a sample price ticker',
      openPrices: true,
    },
    {
      href: '#how',
      label: 'Get started with plain HTML',
      openPrices: false,
    },
    {
      href: 'https://github.com/samline/ticker',
      label: 'Explore the source on GitHub',
      openPrices: false,
    },
    {
      href: '#faq',
      label: 'Read the accessibility FAQ',
      openPrices: false,
    },
  ],
  brands: [
    {
      src: '/assets/brands/vercel.svg',
      name: 'Vercel',
    },
    {
      src: '/assets/brands/linear.svg',
      name: 'Linear',
    },
    {
      src: '/assets/brands/stripe.svg',
      name: 'Stripe',
    },
    {
      src: '/assets/brands/shopify.svg',
      name: 'Shopify',
    },
    {
      src: '/assets/brands/figma.svg',
      name: 'Figma',
    },
    {
      src: '/assets/brands/notion.svg',
      name: 'Notion',
    },
    {
      src: '/assets/brands/github.svg',
      name: 'GitHub',
    },
    {
      src: '/assets/brands/supabase.svg',
      name: 'Supabase',
    },
    {
      src: '/assets/brands/raycast.svg',
      name: 'Raycast',
    },
    {
      src: '/assets/brands/astro.svg',
      name: 'Astro',
    },
    {
      src: '/assets/brands/vite.svg',
      name: 'Vite',
    },
    {
      src: '/assets/brands/cloudflare.svg',
      name: 'Cloudflare',
    },
  ],
  prices: [
    {
      symbol: 'BTC',
      price: '$94,210.40',
      direction: 'up',
      change: '+2.31%',
    },
    {
      symbol: 'ETH',
      price: '$3,540.18',
      direction: 'up',
      change: '+1.84%',
    },
    {
      symbol: 'SOL',
      price: '$182.07',
      direction: 'down',
      change: '−0.42%',
    },
    {
      symbol: 'AAPL',
      price: '$228.10',
      direction: 'up',
      change: '+0.62%',
    },
    {
      symbol: 'TSLA',
      price: '$341.92',
      direction: 'down',
      change: '−1.18%',
    },
    {
      symbol: 'NVDA',
      price: '$138.55',
      direction: 'up',
      change: '+3.07%',
    },
    {
      symbol: 'SPY',
      price: '$592.40',
      direction: 'up',
      change: '+0.22%',
    },
    {
      symbol: 'META',
      price: '$612.83',
      direction: 'up',
      change: '+0.91%',
    },
  ],
  hoverHint: 'Hover to pause.',
  paceHint: 'Make it your pace.',
} as const
