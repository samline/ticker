import { test, expect } from '@playwright/test'
import { codeColors } from '../../shared/testing/code-colors'

test('Home and Examples render HTML with the same shared syntax palette in both themes', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('./')
  const examples = await context.newPage()
  await examples.emulateMedia({ reducedMotion: 'reduce' })
  await examples.goto('http://127.0.0.1:4324/ticker/examples/')
  await examples.locator('#announcements summary').click()
  for (const theme of ['dark', 'light']) {
    for (const target of [page, examples])
      await target.evaluate(theme => {
        document.documentElement.dataset.theme = theme
      }, theme)
    const home = page.locator('#how pre[data-language=html]:visible').first()
    const gallery = examples.locator('#announcements pre[data-language=html]:visible')
    const colors = await home.evaluate(codeColors)
    for (const token of Object.values(colors)) expect(token.actual).toBe(token.expected)
    expect(new Set(Object.values(colors).map(token => token.actual)).size).toBe(3)
    expect(await gallery.evaluate(codeColors)).toEqual(colors)
  }
  await examples.close()
})
