import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'

const directory = new URL('../dist/', import.meta.url)
const html = await readFile(new URL('index.html', directory), 'utf8')
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1]
assert.ok(canonical, 'A production canonical URL must be present')
const base = new URL(canonical).pathname
assert.ok(html.includes(`property="og:url" content="${canonical}"`))
assert.ok(html.includes(`property="og:image" content="${canonical}social.png"`))
for (const name of [
  'description',
  'keywords',
  'author',
  'robots',
  'twitter:card',
  'twitter:image:alt',
]) {
  assert.ok(html.includes(`name="${name}"`), `Missing metadata: ${name}`)
}
assert.ok(html.includes('index, follow, max-image-preview:large'))
const json = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1]
assert.ok(json, 'Structured data must be safely serialized')
const schema = JSON.parse(json)
assert.deepEqual(
  schema['@graph'].map(item => item['@type']),
  ['WebSite', 'WebPage', 'SoftwareSourceCode']
)
assert.equal(schema['@graph'][1].url, canonical)
assert.equal(schema['@graph'][2].url, canonical)
const robots = await readFile(new URL('robots.txt', directory), 'utf8')
assert.ok(robots.includes(`Sitemap: ${canonical}sitemap-index.xml`))
const sitemap = await readFile(new URL('sitemap-0.xml', directory), 'utf8')
assert.ok(sitemap.includes(`<loc>${canonical}</loc>`))
const png = await readFile(new URL('social.png', directory))
assert.equal(png.readUInt32BE(16), 1200)
assert.equal(png.readUInt32BE(20), 630)
assert.ok(html.includes(`href="${base}docs/"`))
const redirect = await readFile(new URL('getting-started/index.html', directory), 'utf8')
assert.ok(
  redirect.includes(`url=${base}docs/getting-started/`),
  'Legacy docs redirect must include the deployment base'
)
if (process.argv.includes('--docs')) {
  const docs = await readFile(new URL('docs/index.html', directory), 'utf8')
  assert.ok(docs.includes(`${base}docs/`))
  await access(new URL('docs/getting-started/index.html', directory))
  const sitemapIndex = await readFile(new URL('sitemap-index.xml', directory), 'utf8')
  assert.ok(sitemapIndex.includes(`${canonical}docs/sitemap-0.xml`))
}
console.log('Production metadata, sharing image, base path and documentation redirects verified.')
