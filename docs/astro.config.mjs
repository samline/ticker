import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import accessibleOverflow from './scripts/rehype-accessible-code.mjs'
import { codeTheme } from '../shared/lib/code-theme.mjs'
export default defineConfig({
  site: 'https://samline.github.io',
  base: '/ticker/docs',
  trailingSlash: 'always',
  output: 'static',
  i18n: { defaultLocale: 'en', locales: ['en'], routing: { prefixDefaultLocale: false } },
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: {
    processor: unified({ rehypePlugins: [accessibleOverflow] }),
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: codeTheme },
  },
})
