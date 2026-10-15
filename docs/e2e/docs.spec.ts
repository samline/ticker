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
  await expect(page.locator('ticker-docs-search button[data-search-trigger]')).not.toBeVisible()
  await page.locator('ticker-docs-menu summary').click()
  await expect(page.locator('ticker-docs-menu details nav')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  )
  await context.close()
})

test('search Drawer opens from the top, stays inside the viewport and restores focus and scroll', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('reference/configuration/')
  const trigger = page.getByRole('button', { name: 'Search documentation', exact: true })
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    await page.evaluate(() => scrollTo(0, 500))
    const before = await page.evaluate(() => scrollY)
    await trigger.click()
    const panel = page.getByRole('dialog', { name: 'Search documentation' })
    await expect(panel).toBeVisible()
    await expect.poll(async () => Math.abs((await panel.boundingBox())!.y)).toBeLessThan(1)
    const bounds = (await panel.boundingBox())!
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.width).toBeLessThanOrEqual(width + 1)
    await panel.getByRole('searchbox').fill('direction')
    await expect(panel.locator('li a').first()).toBeVisible()
    expect(await panel.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true)
    await panel.getByRole('button', { name: 'Close search', exact: true }).click()
    await expect(panel).not.toBeVisible()
    await expect(trigger).toBeFocused()
    await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(before, 0)
  }
  await page.setViewportSize({ width: 320, height: 800 })
  await page.evaluate(() => (document.documentElement.style.fontSize = '24px'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  )
  await trigger.click()
  await expect(page.getByRole('dialog', { name: 'Search documentation' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
})

test('collection index IDs select the matching navigation page', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('.sidebar a[aria-current=page]')).toHaveText('Overview')
  await page.goto('reference/')
  await expect(page.locator('.sidebar a[aria-current=page]')).toHaveText('Reference overview')
  await expect(page.locator('.article-footer .edit')).toHaveAttribute(
    'href',
    /reference\/index\.md$/
  )
})

test('search components retain native input focus and accessible results in both themes', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('getting-started/')
  await page.addScriptTag({
    content: await readFile(
      new URL('../node_modules/axe-core/axe.min.js', import.meta.url),
      'utf8'
    ),
  })
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme)
    await page.keyboard.press('Control+k')
    const panel = page.getByRole('dialog', { name: 'Search documentation' }),
      input = panel.getByRole('searchbox')
    await expect(input).toBeFocused()
    await input.fill('direction')
    await expect(panel.locator('li a').first()).toBeVisible()
    const violations = await page.evaluate(async () => {
      const result = await (window as any).axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      })
      return result.violations.map((v: any) => ({
        id: v.id,
        targets: v.nodes.map((node: any) => node.target),
      }))
    })
    expect(violations).toEqual([])
    await page.keyboard.press('Escape')
    await expect(panel).not.toBeVisible()
  }
})

test('search keeps close visible after result scrolling and supports native upward drag', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 375, height: 700 })
  await page.goto('getting-started/')
  const trigger = page.getByRole('button', { name: 'Search documentation', exact: true })
  await trigger.click()
  const panel = page.getByRole('dialog', { name: 'Search documentation' })
  await panel.getByRole('searchbox').fill('ticker')
  await expect(panel.locator('li a').first()).toBeVisible()
  const close = panel.getByRole('button', { name: 'Close search', exact: true })
  const before = await close.boundingBox()
  await panel
    .locator('.search-results')
    .evaluate((element) => (element.scrollTop = element.scrollHeight))
  await expect
    .poll(() => panel.locator('.search-results').evaluate((element) => element.scrollTop))
    .toBeGreaterThan(0)
  expect(await close.boundingBox()).toEqual(before)
  await close.click()
  await expect(panel).not.toBeVisible()
  await trigger.click()
  const handle = panel.getByRole('button', { name: 'Drag up to close search' })
  // Drawer 4.2.1 intentionally ignores gestures for 500ms after opening, even with reduced motion.
  await page.waitForTimeout(550)
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, 50, { steps: 20 })
  await page.mouse.up()
  await expect(panel).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test('search grows with results and shrinks again when cleared in both motion preferences', async ({
  page,
}) => {
  await page.goto('getting-started/')
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion })
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 800 })
      await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
      const panel = page.getByRole('dialog', { name: 'Search documentation' })
      const input = panel.getByRole('searchbox')
      await expect(input).toBeFocused()
      const compact = (await panel.boundingBox())!.height
      expect(compact).toBeLessThan(400)
      await input.fill('direction')
      await expect(panel.locator('li a').first()).toBeVisible()
      await expect
        .poll(async () => (await panel.boundingBox())!.height)
        .toBeGreaterThan(compact + 50)
      expect(Math.round((await panel.boundingBox())!.height)).toBeLessThanOrEqual(704)
      await input.fill('zzzznosuchwordzzzz')
      await expect(panel.getByRole('status')).toHaveText('No results. Try another term.')
      await expect.poll(async () => (await panel.boundingBox())!.height).toBeLessThan(compact + 100)
      await input.fill('')
      await expect.poll(async () => (await panel.boundingBox())!.height).toBeCloseTo(compact, 0)
      await panel.getByRole('button', { name: 'Close search', exact: true }).click()
      await expect(panel).not.toBeVisible()
    }
  }
})

test('search debounces typing without collapsing the previous results', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('getting-started/')
  await page.getByRole('button', { name: 'Search documentation', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Search documentation' })
  const input = panel.getByRole('searchbox')
  await input.fill('direction')
  await expect(panel.locator('li a').first()).toBeVisible()
  const previous = await panel.locator('ul').innerHTML()
  const height = (await panel.boundingBox())!.height
  const time = new Date('2026-10-15T12:00:00Z')
  await page.clock.install({ time })
  await page.clock.pauseAt(time)
  await input.fill('zzzznosuchwordzzzz')
  await page.clock.runFor(200)
  expect(await panel.locator('ul').innerHTML()).toBe(previous)
  expect((await panel.boundingBox())!.height).toBeCloseTo(height, 0)
  await input.fill('zzzznosuchwordzzzz1')
  await page.clock.runFor(200)
  expect(await panel.locator('ul').innerHTML()).toBe(previous)
  await page.clock.runFor(100)
  await expect(panel.getByRole('status')).toHaveText('No results. Try another term.')
  await expect(panel.locator('li')).toHaveCount(0)
  await input.fill('')
  await expect(panel.locator('[role=status]')).toBeEmpty()
})
