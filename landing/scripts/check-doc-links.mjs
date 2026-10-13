import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'

const output = new URL('../dist/', import.meta.url)
try {
  await access(new URL('docs/index.html', output))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
  console.log('Docs link validation skipped: run npm run site:build to include documentation.')
  process.exit(0)
}
const html = await readFile(new URL('index.html', output), 'utf8')
const canonical = new URL(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1])
const docsBase = new URL('docs/', canonical).pathname
const links = new Set()
for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
  const target = new URL(match[1].replaceAll('&amp;', '&'), canonical)
  if (target.origin !== canonical.origin || !/(?:^|\/)docs(?:\/|$)/.test(target.pathname)) continue
  assert.ok(
    target.pathname.startsWith(docsBase),
    `Docs link drops the deployment base: ${target.href}`
  )
  links.add(target.href)
}
assert.ok(links.size, 'The landing must expose documentation links')
for (const href of links) {
  const target = new URL(href)
  const path = target.pathname.slice(canonical.pathname.length)
  const page = await readFile(
    new URL(`${path}${path.endsWith('/') ? 'index.html' : ''}`, output),
    'utf8'
  )
  if (target.hash) {
    const fragment = decodeURIComponent(target.hash.slice(1))
    assert.ok(page.includes(`id="${fragment}"`), `Missing documentation fragment: ${href}`)
  }
}
console.log(`Verified ${links.size} documentation destinations and their fragments.`)
