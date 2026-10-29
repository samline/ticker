import { readFile } from 'node:fs/promises'
import { escapeXml as e } from '../../../../shared/lib/serialize'
import manifest from '../../../../package.json'
import type { RecipeContext } from './types'

export const createRecipeMarkup = async ({ recipe, i18n }: RecipeContext) => {
  const t = i18n.examples
  const playback = i18n.controls.ticker
  const docsBase = `${manifest.homepage.replace(/\/$/, '')}/docs/`
  const rows = await Promise.all(
    recipe.rows.map(async (row, rowIndex) => {
      const items = await Promise.all(
        row.items.map(async (item, index) => {
          if (item.logo) {
            const svg = await readFile(
              new URL(`../../../public/assets/brands/${item.logo}`, import.meta.url),
              'utf8'
            )
            if (item.description && item.href)
              return `<div class="item story-item"><span class="story-image"><img src="data:image/svg+xml,${encodeURIComponent(svg)}" alt=""></span><span class="story-copy"><a href="${e(docsBase + item.href)}">${e(item.label)}</a><span>${e(item.description)}</span></span></div>`
            return `<span class="item"><img src="data:image/svg+xml,${encodeURIComponent(svg)}" alt="">${e(item.label)}</span>`
          }
          if (item.href)
            return `<a class="item" href="${e(docsBase + item.href)}" target="_blank" rel="noopener noreferrer">${e(item.label)}</a>`
          if (item.value)
            return `<span class="item"><strong>${e(item.label)}</strong> ${e(item.value)} <span class="${item.change?.startsWith('+') ? 'up' : 'down'}">${e(item.change ?? '')}</span></span>`
          return `<span class="item"${recipe.kind === 'dynamic' ? ` data-example-item="item-${index}"` : ''}>${e(item.label)}</span>`
        })
      )
      return `<div class="window" dir="${row.rtl ? 'rtl' : 'ltr'}" data-vertical="${row.direction === 'up' || row.direction === 'down'}" tabindex="0" role="region" aria-label="${e(row.label)}" aria-live="off">
  <div id="ticker-${rowIndex + 1}" data-row>${items.join('\n    ')}</div>
</div>`
    })
  )
  const controls =
    recipe.kind === 'controls'
      ? `
  <label>${e(t.speed)} <input type="range" min="14" max="60" value="24" aria-label="${e(t.speed)}"><output>24s</output></label>
  <label>${e(t.direction)} <select data-example-direction-select aria-label="${e(t.direction)}"><option value="left">${e(t.left)}</option><option value="right">${e(t.right)}</option></select></label>`
      : recipe.rows.some(row => row.navigation)
        ? `
  <button type="button" data-previous>${e(playback.previous)}</button><button type="button" data-next>${e(playback.next)}</button>
  <label>${e(playback.position)} <input type="range" data-position min="0" max="1" value="0"></label>`
        : ''
  const verticalControls = recipe.rows.some(
    row => row.direction === 'up' || row.direction === 'down'
  )
    ? `<div role="group" aria-label="${e(t.direction)}"><button type="button" data-example-direction="up" aria-pressed="true">${e(t.up)}</button><button type="button" data-example-direction="down" aria-pressed="false">${e(t.down)}</button></div>`
    : ''
  const dragControls =
    recipe.kind === 'drag'
      ? `<button type="button" data-example-resume aria-label="${e(t.resumeAfterDrag)}" aria-pressed="${recipe.rows[0].resumeAfterDrag === true}">${e(t.resumeAfterDrag)} <span data-resume-state aria-hidden="true">${e(recipe.rows[0].resumeAfterDrag ? t.enabled : t.disabled)}</span></button>`
      : ''
  const markup = `<section class="ticker-recipe">
  <h1>${e(recipe.title)}</h1>
  ${rows.join('\n  ')}
  <div class="controls" hidden>
    <button type="button" data-pause>${e(playback.pause)}</button>${
      recipe.kind === 'dynamic'
        ? `
    <button type="button" data-add>${e(t.add)}</button>
    <button type="button" data-remove-first>${e(t.removeFirst)}</button>
    <button type="button" data-remove-last>${e(t.removeLast)}</button>
    <label>${e(t.itemLabel)} <select data-item-select></select></label>
    <button type="button" data-remove-selected>${e(t.removeSelected)}</button>
    <label>${e(t.positionLabel)} <select data-item-position></select></label>
    <button type="button" data-remove-position>${e(t.removeAtPosition)}</button>`
        : ''
    }${controls}${verticalControls}${dragControls}
  </div>
  <p>${e(recipe.note)}</p>${recipe.rows.some(row => row.items.some(item => item.logo)) ? `\n  <p><a href="${e(manifest.homepage + '/attribution/')}" target="_blank" rel="noopener noreferrer">${e(t.brandAttribution)}</a></p>` : ''}
  <p role="status" aria-live="polite"></p>
  <noscript><p>${e(t.noJs)}</p></noscript>
</section>`

  return markup
}
