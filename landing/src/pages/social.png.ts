import type { APIRoute } from 'astro'
import { Resvg } from '@resvg/resvg-js'
import { getI18n } from '../i18n/utils'
import { escapeXml } from '../../../shared/lib/serialize'

/** The image is generated at build time from the same locale copy as the page. */
export const GET: APIRoute = () => {
  const i18n = getI18n()
  const text = escapeXml
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="#1d1c23"/>
    <rect x="40" y="40" width="1120" height="550" rx="32" fill="#24222c" stroke="#474250"/>
    <circle cx="98" cy="101" r="9" fill="#b7aed2"/>
    <g fill="#e5e2eb" font-family="sans-serif">
      <text x="123" y="110" font-size="28">${text(i18n.common.packageName)}</text>
      <text x="76" y="260" font-size="86" font-weight="600">${text(i18n.sections.hero.title)}</text>
      <text x="76" y="350" font-size="78" fill="#b7aed2">${text(i18n.sections.hero.titleAccent)}</text>
      <text x="80" y="430" font-size="30" fill="#c5becf">${text(i18n.seo.social.tagline)}</text>
      <text x="80" y="530" font-size="23" fill="#b1a8bd">${text(i18n.seo.social.details)}</text>
      <text x="1100" y="110" text-anchor="end" font-size="22" fill="#c5becf">${text(i18n.common.version)}</text>
    </g>
  </svg>`
  const image = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } })
}
