import type { APIRoute } from 'astro'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'
import { getI18n } from '../i18n/utils'
import { escapeXml } from '../../../shared/lib/serialize'

/** Build-time artwork shares the landing copy, palette and locally bundled fonts. */
export const GET: APIRoute = () => {
  const i18n = getI18n()
  const text = escapeXml
  const theme = readFileSync(resolve('../shared/styles/theme.css'), 'utf8')
  const dark = theme.match(/\[data-theme='dark'\] \{([^}]+)\}/)?.[1]
  const color = (name: string) => {
    const value = dark?.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1]
    if (!value) throw new Error(`Missing social image color: ${name}`)
    return value
  }
  const bg = color('theme-bg')
  const accent = color('theme-accent')
  const foreground = color('theme-text')
  const muted = color('theme-text-muted')
  const border = color('theme-border-soft')
  const items = i18n.seo.social.items
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
    <defs>
      <radialGradient id="halo">
        <stop stop-color="${accent}" stop-opacity="0.17"/>
        <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="strip" x2="1" y2="0">
        <stop stop-color="${color('theme-surface')}"/>
        <stop offset="1" stop-color="${color('theme-bg-soft')}"/>
      </linearGradient>
      <linearGradient id="fade" x2="1" y2="0">
        <stop stop-color="${bg}"/>
        <stop offset="0.12" stop-color="${bg}" stop-opacity="0"/>
        <stop offset="0.88" stop-color="${bg}" stop-opacity="0"/>
        <stop offset="1" stop-color="${bg}"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="${bg}"/>
    <ellipse cx="1020" cy="180" rx="600" ry="460" fill="url(#halo)"/>
    <g font-family="Inter" fill="${foreground}">
      <circle cx="76" cy="66" r="7" fill="${accent}"/>
      <text x="96" y="75" font-size="25" letter-spacing="-0.7">${text(i18n.common.packageName)}</text>
      <rect x="1040" y="45" width="88" height="36" rx="18" fill="none" stroke="${border}"/>
      <text x="1084" y="69" text-anchor="middle" font-size="17" fill="${muted}">${text(i18n.common.version)}</text>
      <path d="M72 110H1128" stroke="${border}"/>
      <text x="72" y="232" font-size="84" letter-spacing="-4">${text(i18n.sections.hero.title)}</text>
      <text x="72" y="331" font-family="Instrument Serif" font-style="italic" font-size="103" letter-spacing="-2" fill="${accent}">${text(i18n.sections.hero.titleAccent)}</text>
      <text x="76" y="397" font-size="27" letter-spacing="-0.5" fill="${muted}">${text(i18n.seo.social.tagline)}</text>
      <rect y="447" width="1200" height="91" fill="url(#strip)"/>
      <path d="M0 447H1200M0 538H1200" stroke="${border}"/>
      <g font-size="29" letter-spacing="-0.5">
        <text x="90" y="504">${text(items[0])}</text>
        <text x="492" y="504">${text(items[1])}</text>
        <text x="736" y="504">${text(items[2])}</text>
        <text x="992" y="504">${text(items[0])}</text>
      </g>
      <g fill="${accent}"><circle cx="431" cy="493" r="4"/><circle cx="677" cy="493" r="4"/><circle cx="931" cy="493" r="4"/></g>
      <rect y="448" width="1200" height="89" fill="url(#fade)"/>
      <text x="72" y="590" font-size="19" fill="${muted}">${text(i18n.seo.social.details)}</text>
    </g>
  </svg>`
  const image = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      loadSystemFonts: false,
      fontFiles: [
        resolve('src/assets/fonts/Inter.ttf'),
        resolve('src/assets/fonts/InstrumentSerif-Italic.ttf'),
      ],
      defaultFontFamily: 'Inter',
    },
  })
    .render()
    .asPng()
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } })
}
