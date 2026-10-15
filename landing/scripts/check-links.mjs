import { access, readFile } from 'node:fs/promises'
import { checkLinks } from '../../shared/scripts/check-links.mjs'

const directory = new URL('../dist/', import.meta.url)
const html = await readFile(new URL('index.html', directory), 'utf8')
const site = new URL(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1])
try {
  await access(new URL('docs/index.html', directory))
} catch (error) {
  if (error.code !== 'ENOENT') throw error
  // A standalone landing build can precede docs. Release builds must include them.
  console.log('Cross-site link validation skipped: run npm run site:build to include docs.')
  process.exit(0)
}
const result = await checkLinks({ directory, site })
console.log(
  `Verified ${result.links} links across ${result.pages} landing/docs pages, including fragments, assets and redirects.`
)
