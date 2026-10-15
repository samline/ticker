import type { DocsRoute } from './docs'
import { docsHref } from './docs'
type Item = { href: string } | { docsRoute: DocsRoute } | { page: 'examples' }
export function isHome(pathname: string) {
  return pathname.replace(/\/$/, '') === import.meta.env.BASE_URL.replace(/\/$/, '')
}
export function navigationHref(item: Item, pathname: string): string {
  if ('docsRoute' in item) return docsHref(item.docsRoute)
  if ('page' in item) return `${import.meta.env.BASE_URL}examples/`
  return isHome(pathname) ? item.href : `${import.meta.env.BASE_URL}${item.href}`
}
