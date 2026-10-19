import { format as formatCode, resolveConfig } from 'prettier'
import { escapeXml as e } from '../../../../shared/lib/serialize'
import manifest from '../../../../package.json'
import { createRecipeMarkup } from './markup'
import { createRecipeScript } from './behavior'
import { recipeStyles as css } from './styles'
import type { RecipeContext } from './types'

export const createRecipeFiles = async ({ recipe, i18n }: RecipeContext) => {
  const cdn = `https://cdn.jsdelivr.net/npm/${manifest.name}@${manifest.version}/dist/`
  const markup = await createRecipeMarkup({ recipe, i18n })
  const scriptFor = (mode: 'cdn' | 'npm') => createRecipeScript({ recipe, i18n }, mode)
  const documentFor = (mode: 'cdn' | 'npm', separate = false) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(recipe.title)}</title>

${mode === 'cdn' ? `<link rel="stylesheet" href="${cdn}style.css">` : ''}
${separate ? '<link rel="stylesheet" href="./style.css">' : `<style>\n${css}\n</style>`}
</head>

<body>
<main aria-label="${e(recipe.title)}">
${markup}
</main>

${mode === 'cdn' ? `<script src="${cdn}browser/global.global.js"></script>\n\n` : ''}${separate ? '<script type="module" src="./main.js"></script>' : `<script type="module">\n${scriptFor(mode)}\n</script>`}
</body>
</html>`
  const codeOptions = await resolveConfig(
    new URL('../../../../.prettierrc.cjs', import.meta.url).pathname
  )
  const fileLabels = i18n.controls.codeFiles
  const filesFor = async (mode: 'cdn' | 'npm') => [
    {
      id: 'html',
      label: fileLabels.html,
      filename: 'index.html',
      language: 'html' as const,
      code: await formatCode(documentFor(mode, true), { ...codeOptions, parser: 'html' }),
    },
    {
      id: 'css',
      label: fileLabels.css,
      filename: 'style.css',
      language: 'css' as const,
      code: await formatCode(css, { ...codeOptions, parser: 'css' }),
    },
    {
      id: 'js',
      label: fileLabels.javascript,
      filename: 'main.js',
      language: 'javascript' as const,
      code: await formatCode(scriptFor(mode), { ...codeOptions, parser: 'babel' }),
    },
  ]
  return {
    cdn: {
      code: await formatCode(documentFor('cdn'), { ...codeOptions, parser: 'html' }),
      files: await filesFor('cdn'),
    },
    npm: {
      code: await formatCode(documentFor('npm'), { ...codeOptions, parser: 'html' }),
      files: await filesFor('npm'),
    },
  }
}
