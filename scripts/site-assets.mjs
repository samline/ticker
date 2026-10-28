import { mkdir, readFile, writeFile } from 'node:fs/promises'

/**
 * Read the dark-theme accent straight from the stylesheet.
 *
 * The accent already lives in shared/styles/theme.css, so copying it into a
 * second config file would create a colour source that can silently drift away
 * from the real theme. Parsing the dark block keeps CSS as the only owner.
 */
const readDarkAccent = css => {
  const dark = /\[data-theme=['"]dark['"]\][^{]*\{([^}]*)\}/.exec(css)
  if (!dark) throw new Error('Could not find the dark theme block in theme.css')
  const accent = /--theme-accent:\s*(#[0-9a-f]{6})\s*;/i.exec(dark[1])
  if (!accent) throw new Error('Could not find --theme-accent inside the dark theme block')
  return accent[1]
}

const theme = await readFile(new URL('../shared/styles/theme.css', import.meta.url), 'utf8')
const accent = readDarkAccent(theme)
const template = await readFile(new URL('../shared/assets/favicon.svg', import.meta.url), 'utf8')

if (!template.includes('{accent}'))
  throw new Error('favicon.svg is missing the {accent} placeholder')
const filled = template.replace('{accent}', accent)
// Keep the committed convention of a trailing newline so regenerating never
// shows up as a spurious diff on the checked-in copies.
const favicon = filled.endsWith('\n') ? filled : `${filled}\n`

for (const app of ['landing', 'docs']) {
  const target = new URL(`../${app}/public/`, import.meta.url)
  await mkdir(target, { recursive: true })
  await writeFile(new URL('favicon.svg', target), favicon)
}

console.log(`favicon.svg generated for landing and docs with accent ${accent}`)
