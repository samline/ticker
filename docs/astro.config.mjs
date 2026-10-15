import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import accessibleOverflow from './scripts/rehype-accessible-code.mjs'
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
    shikiConfig: {
      theme: {
        name: 'ticker',
        type: 'dark',
        colors: {
          'editor.foreground': 'var(--palette-code-text)',
          'editor.background': 'var(--palette-code-surface)',
        },
        tokenColors: [
          {
            scope: ['comment'],
            settings: { foreground: 'var(--palette-syntax-muted)', fontStyle: 'italic' },
          },
          { scope: ['keyword', 'storage'], settings: { foreground: 'var(--palette-lavender)' } },
          { scope: ['string'], settings: { foreground: 'var(--palette-syntax-string)' } },
          {
            scope: ['entity.name.function', 'support.function'],
            settings: { foreground: 'var(--palette-syntax-tag)' },
          },
          {
            scope: ['constant.numeric', 'constant.language'],
            settings: { foreground: 'var(--palette-syntax-number)' },
          },
          { scope: ['entity.name.tag'], settings: { foreground: 'var(--palette-syntax-tag)' } },
          {
            scope: ['entity.other.attribute-name'],
            settings: { foreground: 'var(--palette-syntax-attribute)' },
          },
        ],
      },
    },
  },
})
