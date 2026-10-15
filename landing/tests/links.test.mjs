import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { test } from 'node:test'
import { checkLinks } from '../../shared/scripts/check-links.mjs'

async function fixture(t, files) {
  const path = await mkdtemp(join(tmpdir(), 'ticker-links-'))
  t.after(() => rm(path, { recursive: true, force: true }))
  for (const [name, html] of Object.entries(files)) {
    const file = join(path, name)
    await mkdir(join(file, '..'), { recursive: true })
    await writeFile(file, html)
  }
  return { directory: pathToFileURL(`${path}/`), site: 'https://example.com/ticker/' }
}

test('audits relative and absolute same-site links, encoded fragments, assets and redirect destinations', async t => {
  const options = await fixture(t, {
    'index.html':
      '<a href="docs/#one%20two">Docs</a><a href="old/#one%20two">Old</a><img src="logo.svg"><a href="https://example.com/ticker/docs/#one%20two">Absolute</a><template><a href="">Search result template</a></template>',
    'docs/index.html': '<h1 id="one two">Docs</h1><a href="../">Home</a>',
    'old/index.html': '<meta http-equiv="refresh" content="0;url=../docs/">',
    'logo.svg': '<svg></svg>',
  })
  assert.deepEqual(await checkLinks(options), { pages: 3, links: 4, external: [] })
})

for (const [name, html, error] of [
  ['missing local page', '<a href="missing/">Missing</a>', /Broken local destination/],
  [
    'missing fragment in an absolute same-site URL',
    '<a href="https://example.com/ticker/#missing">Missing</a>',
    /Missing fragment/,
  ],
  ['placeholder', '<a href="#">Placeholder</a>', /Empty link/],
  ['empty href', '<a href="">Empty</a>', /Empty link/],
  ['wrong deployment base', '<a href="/docs/">Docs</a>', /Outside deployment base/],
  [
    'broken redirect',
    '<meta http-equiv="refresh" content="0;url=missing/">',
    /Broken local destination/,
  ],
  ['redirect loop', '<meta http-equiv="refresh" content="0;url=./">', /Redirect loop/],
]) {
  test(`rejects ${name}`, async t => {
    const options = await fixture(t, { 'index.html': html })
    await assert.rejects(checkLinks(options), error)
  })
}
