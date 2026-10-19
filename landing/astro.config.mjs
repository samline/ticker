import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import { getSiteUrl, productionSiteUrl } from './src/lib/site.ts'
import { inlineSmallStylesheets } from '../shared/lib/site-build.mjs'

const directory = fileURLToPath(new URL('.', import.meta.url))
const environment = loadEnv(process.env.NODE_ENV ?? 'development', directory, 'SITE_')
const site = getSiteUrl(process.env.SITE_URL ?? environment.SITE_URL ?? productionSiteUrl)
const base = site?.pathname ?? '/'

export default defineConfig({
  site: site?.href,
  base: base === '/' ? base : base.replace(/\/$/, ''),
  output: 'static',
  trailingSlash: 'ignore',
  redirects: Object.fromEntries(
    [
      'getting-started',
      'guides/accessibility',
      'guides/html-and-browser',
      'guides/lifecycle',
      'guides/migration',
      'reference',
      'reference/api',
      'reference/browser',
      'reference/configuration',
      'reference/core',
      'reference/entrypoints',
      'reference/examples',
      'reference/styling',
      'reference/typescript',
    ].map(path => [`/${path}`, `${site?.pathname ?? '/'}docs/${path}/`])
  ),
  integrations: site ? [sitemap()] : [],
  devToolbar: { enabled: false },
  compressHTML: true,
  vite: {
    // Develop against this checkout through the same public imports consumers use.
    resolve: {
      alias: [
        {
          find: '@samline/ticker/style.css',
          replacement: fileURLToPath(new URL('../src/style.css', import.meta.url)),
        },
        {
          find: /^@samline\/ticker$/,
          replacement: fileURLToPath(new URL('../src/index.ts', import.meta.url)),
        },
      ],
    },
    build: { assetsInlineLimit: inlineSmallStylesheets },
    plugins: [tailwindcss()],
    // Keep link/asset composition slash-terminated while routing accepts the bare base.
    define: { 'import.meta.env.BASE_URL': JSON.stringify(base) },
  },
})
