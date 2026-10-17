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
const titles = new Set(),
  descriptions = new Set(),
  canonicals = new Set()
for (const page of pages) {
  const html = await readFile(page, 'utf8')
  if (html.includes('http-equiv="refresh"')) {
    assert.ok(html.includes('/ticker/docs/changelog/'), 'Unexpected documentation redirect')
    continue
  }
  assert.match(html, /<h1\b/)
  assert.match(html, /<link rel="canonical" href="https:\/\/samline.github.io\/ticker\/docs\//)
  assert.ok(!html.includes('/ticker/docsfavicon'), 'Broken base-path concatenation')
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1]
  for (const [value, seen, name] of [
    [canonical, canonicals, 'canonical'],
    [title, titles, 'title'],
    [description, descriptions, 'description'],
  ]) {
    assert.ok(value, `Missing article ${name}: ${page.pathname}`)
    assert.ok(!seen.has(value), `Duplicate article ${name}: ${value}`)
    seen.add(value)
  }
  assert.ok(html.includes(`property="og:url" content="${canonical}"`))
  assert.ok(html.includes('max-image-preview:large'))
  assert.ok(html.includes('aria-labelledby="article-title"'))
  const schema = JSON.parse(
    html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] ?? 'null'
  )
  assert.ok(schema?.['@graph'], 'Missing article structured data')
  const article = schema['@graph'].find(item => item['@type'] === 'TechArticle')
  const breadcrumb = schema['@graph'].find(item => item['@type'] === 'BreadcrumbList')
  assert.equal(article?.url, canonical)
  assert.equal(breadcrumb?.itemListElement.at(-1).item, canonical)
}
await checkLinks({
  directory: root,
  site: `https://samline.github.io${base}`,
  externalPaths: ['/ticker/', '/ticker/examples/'],
})
await stat(new URL('pagefind/pagefind.js', root))
await stat(new URL('sitemap-index.xml', root))
console.log(
  `Built documentation: ${pages.length} pages, local links, fragments, assets, canonical URLs, search bundle and sitemap verified.`
)
