import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
const root = new URL('../../', import.meta.url)
const content = new URL('../src/content/docs/', import.meta.url)
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map(item =>
        item.isDirectory() ? files(new URL(`${item.name}/`, dir)) : [new URL(item.name, dir)]
      )
    )
  ).flat()
}
const pages = (await files(content)).filter(url => /\.mdx?$/.test(url.pathname))
const texts = await Promise.all(pages.map(url => readFile(url, 'utf8')))
const all = texts.join('\n')
const inventory = JSON.parse(await readFile(new URL('../migration-coverage.json', import.meta.url)))
assert.equal(
  inventory.sources.length,
  33,
  'Migration inventory must account for the original 18 repository + 15 website pages'
)
for (const entry of inventory.sources) {
  assert.match(entry.sha256, /^[a-f0-9]{64}$/)
  await readFile(new URL(entry.destination, root))
}
// Follow public TypeScript exports, including type-only surfaces. New undocumented exports fail this gate.
async function exportsFrom(path, seen = new Set()) {
  if (seen.has(path)) return new Set()
  seen.add(path)
  const code = await readFile(new URL(path, root), 'utf8'),
    ast = ts.createSourceFile(path, code, ts.ScriptTarget.Latest, true)
  const names = new Set()
  for (const node of ast.statements) {
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause))
        for (const item of node.exportClause.elements) names.add(item.name.text)
      else if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const stem = new URL(node.moduleSpecifier.text, new URL(path, root))
        let relative = fileURLToPath(stem).slice(fileURLToPath(root).length)
        try {
          await readFile(new URL(relative + '.ts', root))
          relative += '.ts'
        } catch {
          relative += '/index.ts'
        }
        for (const name of await exportsFrom(relative, seen)) names.add(name)
      }
    } else if (node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
      if (node.name) names.add(node.name.text)
      if (ts.isVariableStatement(node))
        for (const declaration of node.declarationList.declarations)
          if (ts.isIdentifier(declaration.name)) names.add(declaration.name.text)
    }
  }
  return names
}
const entrypoints = {
  '.': 'src/index.ts',
  '/core': 'src/core/index.ts',
  '/vanilla': 'src/vanilla/index.ts',
  '/browser': 'src/browser/index.ts',
}
for (const [subpath, source] of Object.entries(entrypoints)) {
  const names = await exportsFrom(source)
  for (const name of names)
    if (name !== 'default')
      assert.ok(all.includes(name), `Undocumented public export ${subpath}: ${name}`)
  for (let i = 0; i < texts.length; i++) {
    const snippets = [
      ...texts[i].matchAll(/```(?:ts|js|typescript|javascript)[^\n]*\n([\s\S]*?)```/g),
    ]
    for (const match of snippets) {
      const ast = ts.createSourceFile('snippet.ts', match[1], ts.ScriptTarget.Latest, true)
      for (const node of ast.statements) {
        if (!ts.isImportDeclaration(node) || !ts.isStringLiteral(node.moduleSpecifier)) continue
        if (node.moduleSpecifier.text !== '@samline/ticker' + (subpath === '.' ? '' : subpath))
          continue
        const bindings = node.importClause?.namedBindings
        if (bindings && ts.isNamedImports(bindings))
          for (const item of bindings.elements)
            assert.ok(
              names.has(item.propertyName?.text ?? item.name.text),
              `Invalid named import ${item.name.text} in ${pages[i].pathname}`
            )
      }
    }
  }
}
const manifest = JSON.parse(await readFile(new URL('package.json', root)))
for (let i = 0; i < texts.length; i++) {
  assert.ok(
    !/@astrojs\/starlight|:::caution|<TabItem\b/.test(texts[i]),
    `Unmigrated markup: ${pages[i].pathname}`
  )
  for (const match of texts[i].matchAll(/@samline\/ticker@(\d+\.\d+\.\d+)/g))
    assert.equal(match[1], manifest.version, `Stale CDN version in ${pages[i].pathname}`)
}
console.log(
  `Documentation coverage: ${pages.length} maintained pages, all 33 original sources accounted for; public exports, snippet imports and pinned CDN versions checked.`
)
