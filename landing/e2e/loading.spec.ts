import { test, expect } from '@playwright/test'

for (const width of [390, 1350]) {
  test(`initial controls reserve their space with delayed JavaScript at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 940 })
    let release!: () => void
    const scripts = new Promise<void>(resolve => (release = resolve))
    await page.route('**/_astro/*.js', async route => {
      await scripts
      await route.continue()
    })
    try {
      await page.goto('./', { waitUntil: 'commit' })
      await page.locator('footer').waitFor({ state: 'attached' })
      await page.evaluate(() => Promise.all(Array.from(document.fonts, font => font.load())))
      const command = page.locator('.install-shortcut')
      const tabs = page.locator('[data-tabs="demo"]')
      const controls = page.locator('[data-kind="news"] .ticker-controls')
      for (const control of [command.locator('button'), tabs, controls]) {
        await expect(control).toHaveAttribute('inert', '')
        await expect(control).toBeHidden()
        expect((await control.boundingBox())!.height).toBeGreaterThan(0)
      }
      const before = await command.boundingBox()
      const headerBefore = await page.locator('#demo .studio-header').boundingBox()
      release()
      await page.waitForLoadState('networkidle')
      await expect(command.locator('button')).toBeVisible()
      await expect(tabs).toBeVisible()
      await expect(controls).toBeVisible()
      expect(await command.boundingBox()).toEqual(before)
      expect(await page.locator('#demo .studio-header').boundingBox()).toEqual(headerBefore)
      await expect(page.locator('#demo [data-panel]:visible')).toHaveCount(1)
    } finally {
      release()
    }
  })
}

test('Home and Examples load three local font files without external font services', async ({
  page,
}) => {
  for (const route of ['./', 'examples/']) {
    const requests: string[] = []
    const record = (request: import('@playwright/test').Request) => requests.push(request.url())
    page.on('request', record)
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)
    const fonts = requests.filter(url => url.endsWith('.woff2'))
    expect(fonts).toHaveLength(3)
    expect(fonts.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
    expect(requests.filter(url => /fonts\.(bunny|googleapis|gstatic)/.test(url))).toEqual([])
    await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2)
    page.off('request', record)
  }
})
