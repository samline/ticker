import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

test('the HTML/CDN guide runs when copied into three files', async ({ page, context }) => {
  const result = await build({
    configFile: false,
    root: fileURLToPath(new URL('../../', import.meta.url)),
    publicDir: false,
    logLevel: 'warn',
    build: {
      write: false,
      target: 'es2020',
      rolldownOptions: { output: { exports: 'named' } },
      lib: {
        entry: fileURLToPath(new URL('../../src/browser/global.ts', import.meta.url)),
        name: 'TickerExample',
        formats: ['iife'],
      },
    },
  })
  const output = (Array.isArray(result) ? result[0] : result) as {
    output: { type: string; code?: string }[]
  }
  const assets = new Map([
    ['global.global.js', output.output.find(chunk => chunk.type === 'chunk')!.code!],
    ['style.css', await readFile(new URL('../../src/style.css', import.meta.url), 'utf8')],
  ])
  // Execute the documentation's three-file starter with the same real runtime.
  await page.goto('guides/html-and-browser/')
  const guideFiles: Record<string, string> = {}
  const viewer = page.locator('[data-code-files]')
  for (const name of ['HTML', 'CSS', 'JavaScript']) {
    await viewer.getByRole('tab', { name, exact: true }).click()
    guideFiles[name] = (await viewer
      .getByRole('tabpanel', { name, exact: true })
      .locator('code')
      .textContent())!
  }
  const guide = await context.newPage()
  const guideErrors: string[] = []
  guide.on('pageerror', error => guideErrors.push(error.message))
  await guide.route('https://cdn.jsdelivr.net/**', route =>
    route.fulfill({
      body: assets.get(route.request().url().endsWith('.css') ? 'style.css' : 'global.global.js'),
      contentType: route.request().url().endsWith('.css') ? 'text/css' : 'text/javascript',
    })
  )
  await guide.route('https://docs-example.test/**', route => {
    const path = new URL(route.request().url()).pathname
    return route.fulfill({
      body: path.endsWith('.js')
        ? guideFiles.JavaScript
        : path.endsWith('.css')
          ? guideFiles.CSS
          : guideFiles.HTML,
      contentType: path.endsWith('.js')
        ? 'text/javascript'
        : path.endsWith('.css')
          ? 'text/css'
          : 'text/html',
    })
  })
  await guide.goto('https://docs-example.test/index.html')
  await expect(guide.locator('.ticker-wrapper')).toHaveAttribute('data-ready', 'true')
  await expect(guide.locator('.ticker-wrapper')).toHaveAttribute('data-duration', '30')
  await expect(guide.locator('.ticker-content:not(.ticker-clone) a')).toHaveCount(2)
  await guide.evaluate(() => {
    dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
    dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
  })
  await expect(guide.locator('.ticker-wrapper')).toHaveAttribute('data-ready', 'true')
  await guide.evaluate(() =>
    dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))
  )
  await expect(guide.locator('.ticker-wrapper')).toHaveCount(0)
  expect(guideErrors).toEqual([])
  await guide.close()
})
