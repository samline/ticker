import assert from 'node:assert/strict'
import { readFile, readdir, stat } from 'node:fs/promises'
import { checkLinks } from '../../shared/scripts/check-links.mjs'
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
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  assert.match(html, /<h1\b/)
  assert.match(html, /<link rel="canonical" href="https:\/\/samline.github.io\/ticker\/docs\//)
  assert.ok(!html.includes('/ticker/docsfavicon'), 'Broken base-path concatenation')
}
await checkLinks({
  directory: root,
  site: `https://samline.github.io${base}`,
  externalPaths: ['/ticker/'],
})
await stat(new URL('pagefind/pagefind.js', root))
await stat(new URL('sitemap-index.xml', root))
console.log(
  `Built documentation: ${pages.length} pages, local links, fragments, assets, canonical URLs, search bundle and sitemap verified.`
)
