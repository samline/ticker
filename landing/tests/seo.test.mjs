import assert from 'node:assert/strict'
import { test, before } from 'node:test'
import { createServer } from 'vite'

let site
let serialization
before(async () => {
  const server = await createServer({
    configFile: false,
    root: new URL('../', import.meta.url).pathname,
    logLevel: 'silent',
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  try {
    site = await server.ssrLoadModule('/src/lib/site.ts')
    serialization = await server.ssrLoadModule(
      new URL('../../shared/lib/serialize.ts', import.meta.url).pathname
    )
  } finally {
    await server.close()
  }
})

test('normalizes the deployed base path and excludes local preview URLs', () => {
  assert.equal(site.getSiteUrl('https://samline.github.io/ticker').href, site.productionSiteUrl)
  assert.equal(site.getSiteUrl(' https://example.com/path/// ').href, 'https://example.com/path/')
  for (const value of [
    undefined,
    '',
    'http://localhost:4321',
    'http://127.0.0.1',
    'http://[::1]',
  ]) {
    assert.equal(site.getSiteUrl(value), undefined)
  }
  for (const value of [
    'javascript:alert(1)',
    'https://name:password@example.com',
    'https://example.com/?x=1',
    'https://example.com/#fragment',
  ]) {
    assert.throws(() => site.getSiteUrl(value))
  }
})

test('serializes structured metadata without allowing a script element to be terminated', () => {
  const value = { description: '</script><script>alert("test")</script>&' }
  const json = serialization.serializeJsonLd(value)
  assert.doesNotMatch(json, /[<>&]/)
  assert.deepEqual(JSON.parse(json), value)
})

test('escapes translated sharing-image text as XML, including quotes and ampersands', () => {
  assert.equal(
    serialization.escapeXml('<title "A&B">\'text\'</title>'),
    '&lt;title &quot;A&amp;B&quot;&gt;&apos;text&apos;&lt;/title&gt;'
  )
})
