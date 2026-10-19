import { test, expect } from '@playwright/test'

for (const theme of ['dark', 'light'] as const) {
  test(`Home titles preserve their text and centered alignment in ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
    await page.goto('./')
    await page.evaluate(() => document.fonts.ready)
    const closing = page.locator('.cta-card h2')
    await expect(closing).toHaveText('Ready to get moving?')
    for (const rootSize of ['100%', '200%']) {
      await page.evaluate(size => {
        document.documentElement.style.fontSize = size
      }, rootSize)
      for (const width of [320, 375, 768, 1024, 1440, 320]) {
        await page.setViewportSize({ width, height: 900 })
        for (const selector of ['.hero-intro h1', '#features h2', '.cta-card h2']) {
          const geometry = await page.locator(selector).evaluate(heading => {
            const bounds = heading.getBoundingClientRect()
            const container = heading.closest('.hero-intro, .section-heading, .cta-card')!
            const parent = container.getBoundingClientRect()
            return {
              offset: Math.abs(bounds.left + bounds.width / 2 - parent.left - parent.width / 2),
              alignment: getComputedStyle(heading).textAlign,
              overflow: heading.scrollWidth - heading.clientWidth,
              left: bounds.left,
              right: bounds.right,
            }
          })
          expect(geometry.offset, `${selector} at ${width}, text ${rootSize}`).toBeLessThan(1)
          expect(geometry.alignment).toBe('center')
          expect(geometry.overflow).toBeLessThanOrEqual(1)
          expect(geometry.left).toBeGreaterThanOrEqual(0)
          expect(geometry.right).toBeLessThanOrEqual(width)
        }
        const spacing = await closing.evaluate(heading => {
          return (
            parseFloat(getComputedStyle(heading).marginTop) /
            parseFloat(getComputedStyle(document.documentElement).fontSize)
          )
        })
        expect(spacing).toBeCloseTo(1.25, 1)
      }
    }
  })
}

test('gallery and attribution headings fit with enlarged text in both themes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const route of ['./', 'examples/', 'attribution/']) {
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)
    for (const theme of ['dark', 'light']) {
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        for (const size of ['100%', '200%']) {
          await page.evaluate(
            ({ theme, size }) => {
              document.documentElement.dataset.theme = theme
              document.documentElement.style.fontSize = size
            },
            { theme, size }
          )
          const broken = await page
            .locator('main h1, main h2, main h3, main h4, main h5, main h6')
            .evaluateAll(headings =>
              headings
                .filter(heading => {
                  const bounds = heading.getBoundingClientRect()
                  return (
                    bounds.width &&
                    (bounds.left < -1 ||
                      bounds.right > innerWidth + 1 ||
                      heading.scrollWidth > heading.clientWidth + 1)
                  )
                })
                .map(heading => heading.textContent)
            )
          expect(broken, `${route}, ${theme}, ${width}, ${size}`).toEqual([])
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            `${route}, ${theme}, ${width}, ${size}: full page`
          ).toBe(true)
        }
      }
    }
  }
})
