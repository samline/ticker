import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

await mkdir(new URL('./assets/vendor/', import.meta.url), { recursive: true })
for (const [source, destination] of [
  ['../dist/browser/global.global.js', './assets/vendor/ticker.js'],
  ['../dist/style.css', './assets/vendor/ticker.css'],
]) {
  const contents = await readFile(new URL(source, import.meta.url), 'utf8')
  // The static landing does not ship package source maps.
  const withoutMap = contents
    .replace(/^\/\/# sourceMappingURL=.*$/gm, '')
    .replace(/\/\*# sourceMappingURL=.*?\*\//g, '')
  await writeFile(new URL(destination, import.meta.url), withoutMap)
}
await copyFile(
  new URL('../LICENSE.md', import.meta.url),
  new URL('./assets/vendor/LICENSE.md', import.meta.url)
)
