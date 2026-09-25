import { z } from 'astro/zod'

const SidebarItemSchema = z.union([
  z.string(),
  z.object({
    label: z.string().optional(),
    link: z.string().optional(),
    slug: z.string().optional(),
    collapsed: z.boolean().optional(),
    items: z.array(z.lazy(() => SidebarItemSchema)).optional(),
  }),
])

const SiteConfigSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  site: z.url(),
  base: z.string().regex(/^\/[a-zA-Z0-9_\-./]*$/),
  editLinkBaseUrl: z.url(),
  sidebar: z.array(SidebarItemSchema),
  social: z.array(z.object({ icon: z.string(), label: z.string(), href: z.url() })),
  defaultLocale: z.string().min(2),
  locales: z.record(
    z.string(),
    z.object({
      label: z.string(),
      lang: z.string().optional(),
      dir: z.enum(['ltr', 'rtl']).optional(),
    })
  ),
})

export function defineSiteConfig(raw) {
  const parsed = SiteConfigSchema.parse(raw)
  return {
    ...parsed,
    site: parsed.site.replace(/\/$/, ''),
    base: parsed.base === '/' ? '/' : parsed.base.replace(/\/$/, ''),
    editLinkBaseUrl: `${parsed.editLinkBaseUrl.replace(/\/$/, '')}/`,
  }
}
