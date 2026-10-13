import { readdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { parse } from '@astrojs/compiler-rs'
import ts from 'typescript'

const textAttributes = new Set([
  'title',
  'alt',
  'label',
  'name',
  'eyebrow',
  'filename',
  'placeholder',
  'aria-label',
  'aria-description',
  'aria-valuetext',
])
const hasLetters = value => typeof value === 'string' && /\p{L}/u.test(value)

/** Detect authored interface copy without mistaking classes, SVG paths or script identifiers for prose. */
export function findUnlocalizedCopy(source) {
  const issues = []
  const report = (node, value) =>
    issues.push({ line: source.slice(0, node.start ?? 0).split('\n').length, value })
  const visit = (node, parent) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'JSXElement' && ['script', 'style'].includes(node.openingElement.name.name))
      return
    if (node.type === 'JSXText' && hasLetters(node.value)) report(node, node.value.trim())
    if (node.type === 'JSXAttribute') {
      const name = node.name.name
      const metaDescription =
        parent?.name?.name === 'meta' &&
        name === 'content' &&
        parent.attributes.some(
          attribute => attribute.name?.name === 'name' && attribute.value?.value === 'description'
        )
      if (
        ((textAttributes.has(name) &&
          !(name === 'name' && ['meta', 'slot'].includes(parent?.name?.name))) ||
          metaDescription) &&
        hasLetters(
          node.value?.type === 'JSXExpressionContainer'
            ? node.value.expression?.value
            : node.value?.value
        )
      )
        report(
          node,
          node.value.type === 'JSXExpressionContainer'
            ? node.value.expression.value
            : node.value.value
        )
    }
    if (
      node.type === 'JSXExpressionContainer' &&
      parent?.type !== 'JSXAttribute' &&
      node.expression?.type === 'Literal' &&
      hasLetters(node.expression.value)
    )
      report(node, node.expression.value)
    for (const [key, value] of Object.entries(node)) {
      if (key === 'frontmatter') continue
      if (Array.isArray(value)) value.forEach(child => visit(child, node))
      else if (value && typeof value === 'object') visit(value, node)
    }
  }
  visit(parse(source).ast)
  for (const match of source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) {
    const script = ts.createSourceFile(
      'component.ts',
      match[1],
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS
    )
    const literalText = node => {
      if (ts.isStringLiteralLike(node)) return node.text
      if (ts.isTemplateExpression(node))
        return [node.head.text, ...node.templateSpans.map(span => span.literal.text)].join('')
      return ''
    }
    const inspect = node => {
      let value = ''
      if (
        ts.isBinaryExpression(node) &&
        ts.isPropertyAccessExpression(node.left) &&
        ['textContent', 'innerText', 'innerHTML'].includes(node.left.name.text)
      )
        value = literalText(node.right)
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'setAttribute' &&
        node.arguments.length === 2 &&
        textAttributes.has(literalText(node.arguments[0]))
      )
        value = literalText(node.arguments[1])
      if (hasLetters(value))
        report({ start: match.index + match[0].indexOf(match[1]) + node.getStart(script) }, value)
      ts.forEachChild(node, inspect)
    }
    inspect(script)
  }
  return issues
}

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(
    entries.map(entry =>
      entry.isDirectory()
        ? files(path.join(directory, entry.name))
        : entry.name.endsWith('.astro')
          ? [path.join(directory, entry.name)]
          : []
    )
  )
  return groups.flat()
}

export async function checkTranslations() {
  const sourceDirectory = fileURLToPath(new URL('../src/', import.meta.url))
  let failures = 0
  for (const file of await files(sourceDirectory)) {
    for (const issue of findUnlocalizedCopy(await readFile(file, 'utf8'))) {
      console.error(
        `${path.relative(path.dirname(sourceDirectory), file)}:${issue.line}: Move interface copy into src/i18n/translations: ${JSON.stringify(issue.value)}`
      )
      failures++
    }
  }
  if (failures) throw new Error(`${failures} unlocalized interface strings`)
  console.log('All authored interface copy comes from translation catalogs.')
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await checkTranslations()
}
