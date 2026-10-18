import { test, expect } from '@playwright/test'

test('Home, Examples and Docs share title typography without changing full titles', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.config.metadata.combined, 'Cross-site titles require the combined artifact')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const routes = [
    { path: '/ticker/#features', selector: '#features h2', size: 'section' },
    { path: '/ticker/examples/', selector: 'h1', size: 'display', text: 'Ticker examples.' },
    { path: '/ticker/docs/', selector: 'h1', size: 'section', text: '@samline/ticker' },
    {
      path: '/ticker/docs/getting-started/',
      selector: 'h1',
      size: 'section',
      text: 'Getting started',
    },
  ]
  for (const width of [320, 768, 1440, 320]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      await page.goto(route.path)
      await page.evaluate(() => document.fonts.ready)
      if (route.text) await expect(page.locator(route.selector)).toHaveText(route.text)
      for (const theme of ['dark', 'light']) {
        await page.evaluate(theme => {
          document.documentElement.dataset.theme = theme
        }, theme)
        const styles = await page.locator(route.selector).evaluate(heading => {
          const primary = getComputedStyle(heading)
          const accent = getComputedStyle(heading.querySelector('.serif')!)
          return {
            primary: primary.fontFamily,
            weight: primary.fontWeight,
            style: primary.fontStyle,
            accent: accent.fontFamily,
            accentStyle: accent.fontStyle,
            accentWeight: accent.fontWeight,
            fontSize: parseFloat(primary.fontSize),
          }
        })
        expect(styles.primary).toContain('Inter')
        expect(styles.weight).toBe('500')
        expect(styles.style).toBe('normal')
        expect(styles.accent).toContain('Instrument Serif')
        expect(styles.accentStyle).toBe('italic')
        expect(styles.accentWeight).toBe('400')
        expect(styles.fontSize).toBeGreaterThanOrEqual(route.size === 'section' ? 32 : 40)
        expect(styles.fontSize).toBeLessThanOrEqual(route.size === 'section' ? 48 : 80)
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true
        )
      }
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%'
      })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `${route.path} at ${width} with 200% text`
      ).toBe(true)
    }
  }
  await page.goto('/ticker/docs/reference/api/ticker/')
  await expect(page.locator('h1 .serif')).toHaveCount(0)
})
