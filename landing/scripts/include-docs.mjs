import { access, cp, rm, readFile, writeFile } from 'node:fs/promises'

const source = new URL('../../docs/dist/', import.meta.url)
const destination = new URL('../dist/docs/', import.meta.url)
try {
  await access(source)
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('Standalone landing built. Run npm run site:build to include documentation.')
    process.exit(0)
  }
  throw error
}
await rm(destination, { recursive: true, force: true })
await cp(source, destination, { recursive: true })
const mainIndex = new URL('../dist/sitemap-index.xml', import.meta.url)
const documentationIndex = new URL('sitemap-index.xml', destination)
const [landingSitemap, documentationSitemap] = await Promise.all([
  readFile(mainIndex, 'utf8'),
  readFile(documentationIndex, 'utf8'),
])
const documentationEntries = documentationSitemap.match(/<sitemap>.*?<\/sitemap>/g) ?? []
await writeFile(
  mainIndex,
  landingSitemap.replace('</sitemapindex>', `${documentationEntries.join('')}</sitemapindex>`)
)
console.log('Documentation and its sitemap included in the Pages artifact.')
