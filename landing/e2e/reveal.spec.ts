import { test, expect } from '@playwright/test'

test('a tall block starts fading just before entering the viewport', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(async () => {
    await customElements.whenDefined('ticker-reveal')
    const reveal = document.createElement('ticker-reveal')
    reveal.id = 'tall-reveal'
    const block = document.createElement('div')
    block.style.height = '3000px'
    reveal.append(block)
    document.querySelector('main')!.append(reveal)
  })
  const reveal = page.locator('#tall-reveal')
  await expect(reveal).toHaveAttribute('data-pending', 'true')
  await page.evaluate(() => {
    const top = document.querySelector('#tall-reveal > div')!.getBoundingClientRect().top + scrollY
    window.scrollTo(0, top - innerHeight - 32)
  })
  await expect(reveal).not.toHaveAttribute('data-pending')
  await expect.poll(() => reveal.evaluate(el => getComputedStyle(el).opacity)).toBe('1')
  // It stays revealed when the visitor scrolls back out and returns.
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(reveal).not.toHaveAttribute('data-pending')
})
