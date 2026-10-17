import { test, expect } from '@playwright/test'
import { codeColors } from '../../shared/testing/code-colors'

test('Markdown and MDX code use the shared syntax colors before and after framing', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['getting-started/', 'guides/html-and-browser/']) {
    await page.goto(route)
    for (const theme of ['dark', 'light']) {
      await page.evaluate(theme => {
        document.documentElement.dataset.theme = theme
      }, theme)
      const pre = page.locator('ticker-docs-article pre[data-language=html]:visible').first()
      await expect(pre).toBeVisible()
      expect(await pre.evaluate(el => !!el.closest('[data-copy-source]'))).toBe(true)
      const colors = await pre.evaluate(codeColors)
      for (const token of Object.values(colors)) expect(token.actual).toBe(token.expected)
      expect(new Set(Object.values(colors).map(token => token.actual)).size).toBe(3)
    }
  }
  const context = await browser.newContext({ javaScriptEnabled: false })
  const fallback = await context.newPage()
  await fallback.goto('http://127.0.0.1:4327/ticker/docs/getting-started/')
  const colors = await fallback.locator('pre[data-language=html]').first().evaluate(codeColors)
  for (const token of Object.values(colors)) expect(token.actual).toBe(token.expected)
  await context.close()
})
