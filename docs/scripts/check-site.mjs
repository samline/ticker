import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = new URL('../dist/', import.meta.url),
  base = '/ticker/docs/'
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(item =>
        item.isDirectory() ? files(new URL(`${item.name}/`, dir)) : [new URL(item.name, dir)]
      )
    )
  ).flat()
}
const pages = (await files(root)).filter(url => url.pathname.endsWith('.html'))
const parsed = new Map(),
  errors = []
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])
  assert.equal(new Set(ids).size, ids.length, `Duplicate DOM ID in ${page.pathname}`)
  parsed.set(fileURLToPath(page), {
    html,
    ids: new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1])),
  })
  assert.match(html, /<h1\b/)
  assert.match(html, /<link rel="canonical" href="https:\/\/samline.github.io\/ticker\/docs\//)
  assert.ok(!html.includes('/ticker/docsfavicon'), 'Broken base-path concatenation')
}
for (const [path, { html }] of parsed) {
  const relative = path.slice(fileURLToPath(root).length).replace(/index\.html$/, '')
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&')
    if (/^(?:https?:|mailto:|data:|tel:)/.test(value)) continue
    const url = new URL(value, `https://samline.github.io${base}${relative}`)
    // Landing links/assets are verified by the combined release checks.
    if (!url.pathname.startsWith(base)) {
      assert.ok(url.pathname.startsWith('/ticker/'), `Invalid site link ${value} in ${path}`)
      continue
    }
    let destination = new URL(decodeURIComponent(url.pathname.slice(base.length)), root)
    if (url.pathname.endsWith('/')) destination = new URL('index.html', destination)
    await stat(destination).catch(() => assert.fail(`Broken local link ${value} in ${path}`))
    if (url.hash) {
      const target = parsed.get(fileURLToPath(destination))
      if (!target?.ids.has(decodeURIComponent(url.hash.slice(1))))
        errors.push(`Missing fragment ${value} in ${path}`)
    }
  }
}
assert.deepEqual(errors, [])
await stat(new URL('pagefind/pagefind.js', root))
await stat(new URL('sitemap-index.xml', root))
console.log(
  `Built documentation: ${pages.length} pages, local links, fragments, assets, canonical URLs, search bundle and sitemap verified.`
)
