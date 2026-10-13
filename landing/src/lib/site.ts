export const productionSiteUrl = 'https://samline.github.io/ticker/'

/** Public deployment metadata: never derive canonical URLs from a request or preview hostname. */
export function getSiteUrl(value?: string): URL | undefined {
  if (!value?.trim()) return undefined
  const url = new URL(value.trim())
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'SITE_URL must be an absolute HTTP(S) URL without credentials, query or fragment.'
    )
  }
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) return undefined
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`
  return url
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export function escapeXml(value: string): string {
  return value.replace(
    /[<>&"']/g,
    character =>
      ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!
  )
}
