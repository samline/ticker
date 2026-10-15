import assert from 'node:assert/strict'
import { test, before } from 'node:test'
import { createServer } from 'vite'
import { findUnlocalizedCopy } from '../scripts/check-translations.mjs'

let i18n
let interpolate
before(async () => {
  const server = await createServer({
    configFile: false,
    root: new URL('../', import.meta.url).pathname,
    logLevel: 'silent',
    server: { middlewareMode: true, hmr: false, watch: null },
  })
  try {
    i18n = await server.ssrLoadModule('/src/i18n/utils.ts')
    interpolate = (
      await server.ssrLoadModule(new URL('../../shared/i18n/format.ts', import.meta.url).pathname)
    ).format
  } finally {
    await server.close()
  }
})

test('resolves supported regional language tags and defaults safely for unknown languages', () => {
  assert.equal(i18n.getLocale('EN-US'), 'en')
  assert.equal(i18n.getLocale('es-MX'), 'en')
  assert.equal(i18n.getLocale(), 'en')
  assert.equal(i18n.getLocale('toString'), 'en')
  assert.equal(i18n.getI18n({ currentLocale: 'en-US' }), i18n.dictionaries.en)
  assert.equal(i18n.getI18n({ currentLocale: 'unknown' }), i18n.dictionaries.en)
})

test('interpolates named variables, including repeated and numeric values, without losing whole sentences', () => {
  assert.equal(
    interpolate('{name}: {seconds}s — {name}', { name: 'Ticker', seconds: 0 }),
    'Ticker: 0s — Ticker'
  )
  assert.throws(() => interpolate('Pause {label}', {}), /Missing translation parameter: label/)
})

test('flags visible text, accessible attributes, inline JSX copy and client-side feedback', () => {
  const source = `<h1>Forgotten title</h1><button aria-label="Forgotten label">{\"Forgotten copy\"}</button><script>button.textContent = 'Forgotten feedback'; button.setAttribute('aria-label', 'Forgotten state')</script>`
  assert.equal(findUnlocalizedCopy(source).length, 5)
})

test('accepts dictionary expressions, scoped instance messages, structural metadata and decorative symbols', () => {
  const source = `<nav aria-label={i18n.navigation.mainLabel}><a href="#how" class:list={['btn']}>{i18n.common.buttons.getStarted}<span aria-hidden="true">↗</span></a></nav><meta name="description" content={i18n.seo.description}/><Icon name="chevron"/><slot name="content"/><style>.button {padding:1rem}</style><script>button.textContent = this.dataset.successMessage; console.error('Developer diagnostic')</script>`
  assert.deepEqual(findUnlocalizedCopy(source), [])
})

test('also detects literal copy passed through JSX attribute expressions', () => {
  assert.equal(
    findUnlocalizedCopy(`<button title={'Forgotten tooltip'} aria-label={"Forgotten label"}/>`)
      .length,
    2
  )
})
