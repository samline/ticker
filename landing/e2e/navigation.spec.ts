import { test, expect, type Page } from '@playwright/test'
import axe from 'axe-core'

async function accessibilityViolations(page: Page) {
  return await page.evaluate(async () => {
    const api = (window as unknown as { axe: typeof axe }).axe
    return (
      await api.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
      })
    ).violations.map(item => ({ id: item.id, targets: item.nodes.map(node => node.target) }))
  })
}

test.afterEach(async ({ page }) => {
  expect(await page.pageErrors()).toEqual([])
})

for (const theme of ['dark', 'light'] as const) {
  test(`mobile drawer owns its focus, ARIA and dismissal lifecycle in ${theme} mode`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: theme })
    await page.goto('./')
    await page.addScriptTag({ content: axe.source })
    await page.evaluate(() => {
      const unrelated = document.createElement('div')
      unrelated.setAttribute('data-drawer', '')
      unrelated.dataset.state = 'open'
      unrelated.dataset.drawerDirection = 'right'
      unrelated.dataset.drawerSnapPoints = 'false'
      unrelated.id = 'unrelated-drawer-markup'
      document.body.append(unrelated)
    })
    expect(
      await page
        .locator('#unrelated-drawer-markup')
        .evaluate(element => getComputedStyle(element).animationName)
    ).toBe('none')
    const trigger = page.locator('[data-menu-trigger]')
    for (const width of [320, 375, 600, 768, 1023]) {
      await page.setViewportSize({ width, height: 800 })
      await trigger.click()
      const dialog = page.getByRole('dialog', { name: 'Explore Ticker' })
      await expect(dialog).toBeVisible()
      await expect(trigger).toHaveAttribute('aria-expanded', 'true')
      expect(await dialog.evaluate(element => getComputedStyle(element).animationName)).toBe(
        'slideFromRight'
      )
      await expect
        .poll(() => dialog.evaluate(element => element.contains(document.activeElement)))
        .toBe(true)
      await expect
        .poll(() => page.locator('body').evaluate(element => getComputedStyle(element).overflow))
        .toBe('hidden')
      await page.waitForTimeout(550)
      expect(
        await dialog.evaluate(element => {
          const bounds = element.getBoundingClientRect()
          return bounds.left >= 0 && bounds.right <= innerWidth
        })
      ).toBe(true)
      const violations = await accessibilityViolations(page)
      expect(violations).toEqual([])
      await page.keyboard.press('Shift+Tab')
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Tab')
      expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true)
      await page.keyboard.press('Escape')
      await expect(trigger).toHaveAttribute('aria-expanded', 'false')
      await expect(dialog).toHaveCount(0)
      await expect(trigger).toBeFocused()
    }
    await trigger.click()
    await page.locator('.mobile-menu-panel a[href="#features"]').click()
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page).toHaveURL(/#features$/)
    await page.setViewportSize({ width: 768, height: 800 })
    await trigger.click()
    await page.waitForTimeout(550)
    await page.locator('.mobile-menu-overlay').click({ position: { x: 10, y: 100 } })
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await trigger.click()
    await page.setViewportSize({ width: 1440, height: 900 })
    await expect(trigger).toBeHidden()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    expect(
      await page.locator('body').evaluate(element => getComputedStyle(element).overflow)
    ).not.toBe('hidden')
    await page.setViewportSize({ width: 320, height: 800 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await trigger.click()
    expect(
      await page.getByRole('dialog').evaluate(element => getComputedStyle(element).animationName)
    ).toBe('none')
    await page.locator('.mobile-menu-panel [data-drawer-close]').click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    for (const section of await page.locator('main > section').all())
      await section.scrollIntoViewIfNeeded()
    await page.locator('.cta-card').scrollIntoViewIfNeeded()
    await page.waitForTimeout(1100)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await accessibilityViolations(page)).toEqual([])
    }
  })
}

test('navigation remains usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4324/ticker/')
  await page.locator('.menu-fallback summary').click()
  await expect(page.locator('.menu-fallback a[href="#features"]')).toBeVisible()
  await page.locator('.menu-fallback a[href="#features"]').click()
  await expect(page).toHaveURL(/#features$/)
  await context.close()
})

test('repeated menu instances have separate controllers and clean up on reconnect', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('./')
  await page.evaluate(() => {
    const original = document.querySelector('ticker-mobile-menu') as HTMLElement
    const copy = original.cloneNode(true) as HTMLElement
    copy.dataset.instanceId = 'mobile-menu-test-copy'
    copy.querySelector('[data-drawer-vanilla-root]')?.remove()
    copy.querySelector('[id]')?.removeAttribute('id')
    original.after(copy)
  })
  const menus = page.locator('ticker-mobile-menu')
  await menus.nth(1).locator('[data-menu-trigger]').click()
  await expect(menus.nth(1).getByRole('dialog')).toHaveCount(1)
  await expect(menus.nth(0).getByRole('dialog')).toHaveCount(0)
  await page.evaluate(() => {
    const menu = document.querySelectorAll('ticker-mobile-menu')[1]
    const parent = menu.parentElement as HTMLElement
    menu.remove()
    parent.append(menu)
  })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(
    await page.locator('body').evaluate(element => getComputedStyle(element).overflow)
  ).not.toBe('hidden')
  await menus.nth(1).locator('[data-menu-trigger]').click()
  await expect(menus.nth(1).getByRole('dialog')).toHaveCount(1)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
