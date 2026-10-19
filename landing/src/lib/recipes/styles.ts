import { readFile } from 'node:fs/promises'

const themeSource = await readFile(
  new URL('../../../../shared/styles/theme.css', import.meta.url),
  'utf8'
)
const palette = (theme: 'light' | 'dark') => {
  const block = themeSource.match(new RegExp(`\\[data-theme='${theme}'\\] \\{([^}]+)\\}`))?.[1]
  if (!block) throw new Error(`Missing recipe theme: ${theme}`)
  const tokens = Object.fromEntries(
    [...block.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(match => [match[1], match[2]])
  )
  return Object.entries({
    bg: '--theme-bg',
    text: '--theme-text',
    surface: '--theme-surface',
    border: '--theme-border',
    accent: '--theme-accent',
    up: '--palette-price-up',
    down: '--palette-price-down',
    hover: '--palette-button-hover',
  })
    .map(([name, token]) => {
      if (!tokens[token]) throw new Error(`Missing recipe color: ${token}`)
      return `--${name}: ${tokens[token]};`
    })
    .join(' ')
}
export const recipeStyles = `body { margin: 0; font: 1rem/1.6 system-ui, sans-serif; }
.ticker-recipe {
  ${palette('light')}
  display: block; padding: 1rem; background: var(--bg); color: var(--text);
}
@media (prefers-color-scheme: dark) {
  .ticker-recipe { ${palette('dark')} }
}
@scope (.ticker-recipe) {
  h1 { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 500; }
  .window { overflow-x: auto; margin-block: 0.75rem; border: 0.0625rem solid var(--border); border-radius: 0.75rem; background: var(--surface); }
  [data-row] { display: flex; align-items: center; gap: 1.5rem; width: max-content; }
  .ticker-track { gap: 1.5rem; padding-block: 1rem; }
  .item { display: inline-flex; align-items: center; gap: 0.625rem; white-space: nowrap; padding-inline: 0.25rem; }
  a { color: var(--accent); text-underline-offset: 0.1875rem; }
  img { width: 2rem; height: 2rem; object-fit: contain; }
  .up { color: var(--up); } .down { color: var(--down); }
  .controls { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; margin-top: 1rem; }
  button, select { font: inherit; padding: 0.375rem 0.75rem; background: var(--surface); color: var(--text); border: 0.0625rem solid var(--border); border-radius: 0.5rem; cursor: pointer; }
  @media (hover: hover) { button:hover, select:hover { background: var(--hover); } }
  select { max-width: 100%; min-width: 0; }
  label { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
  input { accent-color: var(--accent); width: 6rem; } output { font-variant-numeric: tabular-nums; }
  p { margin: 0.75rem 0 0; font-size: 0.8125rem; } p:empty { display: none; }
  [hidden] { display: none !important; }
  :focus-visible { outline: 0.125rem solid var(--accent); outline-offset: 0.1875rem; }
  .window:focus-visible { outline-offset: -0.1875rem; }
  .window[data-vertical="true"] .ticker-wrapper { height: 22rem; }
  .window[data-vertical="true"] [data-row] { flex-direction: column; width: 100%; align-items: stretch; gap: 1rem; }
  .window[data-vertical="true"] .ticker-track { gap: 1rem; padding-block: 0.5rem; }
  .window[data-vertical="true"] .item { white-space: normal; }
  .story-item { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: start; gap: 1rem; width: 100%; box-sizing: border-box; padding: 1rem; border: 0.0625rem solid var(--border); border-radius: 1rem; background: var(--surface); }
  .story-image { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; border: 0.0625rem solid var(--border); border-radius: 0.625rem; }
  .story-image img { width: 1.75rem; height: 1.75rem; filter: brightness(0.55) saturate(1.3); }
  .story-copy { display: grid; min-width: 0; gap: 0.5rem; font-size: 0.8125rem; line-height: 1.6; }
  .story-copy a { font-size: 0.875rem; }
  @media (prefers-color-scheme: dark) { .story-image img { filter: none; } }
}
@media (prefers-reduced-motion: reduce) {
  .ticker-recipe [data-pause] { display: none; }
}`
