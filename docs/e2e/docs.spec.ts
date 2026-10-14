import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test('every code block copies exact text and resets feedback', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('getting-started/')
  const blocks = page.locator('ticker-docs-article pre'),
    buttons = page.locator('ticker-docs-article ticker-copy button')
  await expect.poll(() => buttons.count()).toBe(await blocks.count())
  await buttons.first().click()
  await expect(buttons.first()).toContainText('Copied')
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    await blocks.first().textContent()
  )
  await expect(buttons.first()).toContainText('Copy', { timeout: 4000 })
  await expect(buttons.first()).not.toContainText('Copied')
})
test('lazy search returns valid API pages and heading links', async ({ page }) => {
  const requested: string[] = []
  page.on('request', (request) => requested.push(request.url()))
  await page.goto('getting-started/')
  expect(requested.some((url) => url.includes('/pagefind/'))).toBe(false)
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Search documentation' })
  await dialog.getByRole('searchbox').fill('interactiveClones')
  const result = dialog.locator('li a').first()
  await expect(result).toBeVisible({ timeout: 15000 })
  expect(await result.getAttribute('href')).toContain('/ticker/docs/')
  await result.click()
  await expect(page.locator('h1')).toBeVisible()
  expect(new URL(page.url()).pathname).toMatch(/^\/ticker\/docs\//)
  expect((await page.request.get(page.url())).status()).toBe(200)
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  await page.getByRole('dialog').getByRole('searchbox').fill('zzzznosuchwordzzzz')
  await expect(page.getByRole('dialog').getByRole('status')).toHaveText(
    'No results. Try another term.'
  )
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})
test('responsive themes, enlarged text, keyboard accessibility and stable drawer close', async ({
  page,
}) => {
  await page.goto('reference/configuration/')
  for (const width of [320, 375, 600, 768, 1024, 1280, 1440, 320]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      `overflow at ${width}`
    ).toBe(true)
  }
  await page.setViewportSize({ width: 375, height: 800 })
  await page.evaluate(() => window.scrollTo(0, 500))
  const before = await page.evaluate(() => scrollY)
  const open = page.getByRole('button', { name: 'Browse documentation' })
  await open.click()
  await expect(page.locator('.docs-menu-panel')).toBeVisible()
  await expect(page.locator('.docs-menu-panel a[aria-current=page]')).toHaveText('Configuration')
  await page.keyboard.press('Escape')
  await expect(page.locator('.docs-menu-panel')).not.toBeVisible()
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before, 0)
  await expect(open).toBeFocused()
  await page.evaluate(() => (document.documentElement.style.fontSize = '24px'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  )
  await page.evaluate(() => (document.documentElement.style.fontSize = ''))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme)
    await page.addScriptTag({
      content: await readFile(
        new URL('../node_modules/axe-core/axe.min.js', import.meta.url),
        'utf8'
      ),
    })
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      })
      return results.violations.map((v: any) => ({
        id: v.id,
        nodes: v.nodes.map((n: any) => n.target),
      }))
    })
    expect(violations).toEqual([])
  }
})
test('anchors leave 2.5rem beneath sticky header', async ({ page }) => {
  await page.goto('getting-started/')
  await page.locator('.desktop-toc a[href="#install"]').click()
  const gap = await page.evaluate(() => {
    const top = document.getElementById('install')!.getBoundingClientRect().top
    return (
      (top - document.querySelector('ticker-docs-header')!.getBoundingClientRect().bottom) /
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    )
  })
  expect(gap).toBeCloseTo(2.5, 1)
})
test('no JavaScript retains readable docs, code and mobile navigation', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4327/ticker/docs/getting-started/')
  await expect(page.locator('h1')).toHaveText('Getting started')
  await expect(page.locator('pre').first()).toContainText('npm install @samline/ticker')
  await expect(page.locator('ticker-docs-search button.open')).not.toBeVisible()
  await page.locator('ticker-docs-menu summary').click()
  await expect(page.locator('ticker-docs-menu details nav')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  )
  await context.close()
})
