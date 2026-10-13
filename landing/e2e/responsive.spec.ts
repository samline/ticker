import { test, expect } from '@playwright/test'

for (const theme of ['dark', 'light'] as const) {
  test(`buttons, headings and layout fit from 320 to 1440 and back in ${theme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto('./')
    for (const section of await page.locator('main > section').all()) {
      await section.scrollIntoViewIfNeeded()
    }
    await page.locator('.cta-card').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1100)
    const widths = [
      ...new Set([
        ...Array.from({ length: 71 }, (_, index) => 320 + index * 16),
        374,
        375,
        376,
        479,
        480,
        481,
        599,
        600,
        601,
        767,
        768,
        769,
        1023,
        1024,
        1025,
        1199,
        1200,
        1201,
        1365,
        1366,
        1367,
        1440,
      ]),
    ].sort((a, b) => a - b)
    for (const rootSize of [16, 20]) {
      await page.evaluate(size => {
        document.documentElement.style.fontSize = `${(size / 16) * 100}%`
      }, rootSize)
      for (const kind of ['news', 'logos', 'prices']) {
        await page.locator(`[data-tabs=demo] [data-tab=${kind}]`).click()
        for (const width of rootSize === 16
          ? [...widths, ...widths.toReversed()]
          : [320, 375, 600, 768, 1024, 1440]) {
          await page.setViewportSize({ width, height: 900 })
          const overflow = await page.evaluate(() => {
            const candidates = document.querySelectorAll<HTMLElement>(
              'header a, header button, main a.btn, main button, main h1, main h2, main h3, main h4, main h5, main h6, main summary, main p, footer a, .install-shortcut, .tabs'
            )
            return Array.from(candidates)
              .filter(element => {
                const bounds = element.getBoundingClientRect()
                const style = getComputedStyle(element)
                if (
                  !bounds.width ||
                  style.visibility === 'hidden' ||
                  element.closest('[hidden], [inert]')
                )
                  return false
                return (
                  bounds.left < -0.5 ||
                  bounds.right > innerWidth + 0.5 ||
                  (element.scrollWidth > element.clientWidth + 1 &&
                    !['auto', 'scroll', 'hidden'].includes(style.overflowX))
                )
              })
              .map(element => ({
                element: element.tagName,
                text: element.textContent?.trim().slice(0, 80),
              }))
          })
          expect(overflow, `${theme}, ${kind}, width ${width}, root ${rootSize}`).toEqual([])
        }
      }
    }
  })
}
