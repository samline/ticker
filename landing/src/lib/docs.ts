/** Verified documentation targets; keep paths and fragments synchronized with the built docs. */
export const docsRoutes = {
  overview: '',
  setup: 'getting-started/',
  options: 'reference/configuration/',
  update: 'reference/api/#updateoptions',
  content: 'guides/lifecycle/#update-versus-refresh',
  registry: 'reference/browser/#cleanup',
} as const
export type DocsRoute = keyof typeof docsRoutes
export function docsHref(route: DocsRoute): string {
  return `${import.meta.env.BASE_URL}docs/${docsRoutes[route]}`
}
