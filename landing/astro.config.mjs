import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import { getSiteUrl, productionSiteUrl } from './src/lib/site.ts'

const directory = fileURLToPath(new URL('.', import.meta.url))
const environment = loadEnv(process.env.NODE_ENV ?? 'development', directory, 'SITE_')
const site = getSiteUrl(process.env.SITE_URL ?? environment.SITE_URL ?? productionSiteUrl)

export default defineConfig({
  site: site?.href,
  base: site?.pathname ?? '/',
  output: 'static',
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
  vite: { plugins: [tailwindcss()] },
})
