import { test, expect } from '@playwright/test'

test('tabs initialize without animating their active color or background', async ({ page }) => {
  await page.addInitScript(() => {
    const transitions: string[] = []
    Object.assign(window, { initialTabTransitions: transitions })
    document.addEventListener('transitionrun', event => {
      if (event.target instanceof HTMLElement && event.target.matches('.tab'))
        transitions.push(event.propertyName)
    })
  })
  await page.goto('./')
  await expect(page.locator('[data-tabs="demo"]')).toBeVisible()
  // Allow the UI transition window to elapse so delayed starts are captured.
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => Reflect.get(window, 'initialTabTransitions'))).toEqual([])
  const tabs = page.locator('[data-tabs="demo"]')
  await tabs.getByRole('tab').nth(1).click()
  await expect(tabs.getByRole('tab').nth(1)).toHaveAttribute('aria-selected', 'true')
  await expect
    .poll(() => page.evaluate(() => Reflect.get(window, 'initialTabTransitions')))
    .toContain('background-color')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(
    await tabs
      .getByRole('tab')
      .nth(1)
      .evaluate(el => getComputedStyle(el).transitionDuration)
  ).toBe('0s')
})

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
