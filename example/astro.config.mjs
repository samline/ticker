import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import siteConfig from './site.config.mjs'

export default defineConfig({
  site: siteConfig.site,
  base: siteConfig.base,
  integrations: [
    starlight({
      title: siteConfig.title,
      description: siteConfig.description,
      editLink: { baseUrl: siteConfig.editLinkBaseUrl },
      sidebar: siteConfig.sidebar,
      social: siteConfig.social,
      defaultLocale: siteConfig.defaultLocale,
      locales: siteConfig.locales,
      customCss: ['./src/styles/custom.css'],
      lastUpdated: true,
      pagination: true,
    }),
  ],
})
