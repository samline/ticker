import { format, resolveConfig } from 'prettier'
import t from '../i18n/translations/en/frameworks'
const options = await resolveConfig(process.cwd())
const css = await format(t.css, { ...options, parser: 'css' })
export const frameworkFiles = await Promise.all(
  t.examples.map(async item => ({
    ...item,
    files: [
      {
        ...item,
        code:
          item.language === 'svelte'
            ? item.code
            : await format(item.code, {
                ...options,
                parser: item.language === 'vue' ? 'vue' : 'babel',
              }),
      },
      {
        id: 'css',
        label: t.stylesheet,
        filename: 'ticker.css',
        language: 'css' as const,
        code: css,
      },
    ],
  }))
)
