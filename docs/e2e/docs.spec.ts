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
  page.on('request', request => requested.push(request.url()))
  await page.goto('getting-started/')
  expect(requested.some(url => url.includes('/pagefind/'))).toBe(false)
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
    await page.evaluate(theme => (document.documentElement.dataset.theme = theme), theme)
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
    expect(await panel.evaluate(e => e.scrollWidth <= e.clientWidth + 1)).toBe(true)
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
    await page.evaluate(theme => (document.documentElement.dataset.theme = theme), theme)
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
    .evaluate(element => (element.scrollTop = element.scrollHeight))
  await expect
    .poll(() => panel.locator('.search-results').evaluate(element => element.scrollTop))
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

test('table of contents tracks clicks, scroll, nested headings and initial fragments in both instances', async ({
  page,
}) => {
  await page.goto('getting-started/#first-example')
  const current = page.locator('ticker-docs-toc a[aria-current=location]')
  await expect(current).toHaveCount(2)
  for (const link of await current.all())
    await expect(link).toHaveAttribute('href', '#first-example')
  await page.locator('.desktop-toc a[href="#install"]').click()
  for (const link of await current.all()) await expect(link).toHaveAttribute('href', '#install')
  await page.evaluate(() => document.getElementById('first-example')!.scrollIntoView())
  for (const link of await current.all())
    await expect(link).toHaveAttribute('href', '#first-example')
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  for (const link of await current.all()) await expect(link).toHaveAttribute('href', '#whats-next')
  await page.evaluate(() => scrollTo(0, 0))
  await expect(current).toHaveCount(0)
  await page.setViewportSize({ width: 375, height: 800 })
  await page.locator('.mobile-toc summary').click()
  await page.locator('.mobile-toc a[href="#first-example"]').click()
  await expect(current).toHaveCount(2)
  for (const link of await current.all())
    await expect(link).toHaveAttribute('href', '#first-example')
  await page.evaluate(() => (document.documentElement.style.fontSize = '24px'))
  await page.evaluate(() => document.getElementById('install')!.scrollIntoView())
  for (const link of await current.all()) await expect(link).toHaveAttribute('href', '#install')
})

test('table of contents keeps symmetric item padding and an inset active background beside its rail', async ({
  page,
}) => {
  await page.goto('reference/core/#state-factories')
  await page.evaluate(() => document.fonts.ready)
  const active = page.locator('.desktop-toc a[aria-current=location]')
  await expect(active).toHaveAttribute('href', '#state-factories')
  const geometry = await active.evaluate(link => {
    const style = getComputedStyle(link)
    const rect = link.getBoundingClientRect()
    const list = link.closest('ul')!.getBoundingClientRect()
    return {
      left: rect.left - list.left,
      right: list.right - rect.right,
      paddingLeft: style.paddingLeft,
      paddingRight: style.paddingRight,
    }
  })
  expect(geometry.left).toBeGreaterThan(4)
  expect(geometry.right).toBeGreaterThan(4)
  expect(geometry.paddingLeft).toBe(geometry.paddingRight)
  await page.locator('.desktop-toc a[href="#factory-output"]').click()
  await expect(active).toHaveAttribute('href', '#factory-output')
  expect(await active.evaluate(link => getComputedStyle(link).paddingLeft)).toBe(
    geometry.paddingLeft
  )
})

test('all documentation pages fit narrow and desktop layouts in both themes', async ({ page }) => {
  test.setTimeout(120000)
  await page.goto('./')
  const urls = await page
    .locator('.sidebar nav a')
    .evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href))
  expect(urls).toHaveLength(23)
  for (const url of urls) {
    await page.goto(url)
    for (const theme of ['light', 'dark']) {
      await page.evaluate(theme => (document.documentElement.dataset.theme = theme), theme)
      for (const width of [320, 1440]) {
        await page.setViewportSize({ width, height: 900 })
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
          `${url} ${theme} ${width}`
        ).toBe(true)
      }
    }
  }
})

test('installation reuses accessible tabs with exact copying for each package manager and CDN', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('getting-started/')
  const installation = page.locator('ticker-tabs[data-group="docs-install"]')
  for (const name of ['npm', 'pnpm', 'yarn', 'bun', 'CDN']) {
    const tab = installation.getByRole('tab', { name, exact: true })
    await tab.click()
    const panel = installation.getByRole('tabpanel')
    await expect(panel).toHaveCount(1)
    await expect(tab).toHaveAttribute('aria-selected', 'true')
    await panel.getByRole('button', { name: 'Copy code example' }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await panel.locator('pre').textContent()
    )
    if (name === 'CDN') {
      await expect(panel.locator('code')).toContainText('/dist/style.css')
      await expect(panel.locator('code')).toContainText('/dist/browser/global.global.js')
    }
  }
  await installation.getByRole('tab', { name: 'CDN', exact: true }).press('Home')
  await expect(installation.getByRole('tab', { name: 'npm', exact: true })).toBeFocused()
  await page
    .locator('ticker-tabs[data-group="docs-initialization"]')
    .getByRole('tab', { name: 'HTML / CDN', exact: true })
    .click()
  await expect(
    page.getByRole('tabpanel', { name: 'HTML / CDN', exact: true }).locator('code')
  ).toContainText('window.Ticker.ticker')
  await expect(page.getByRole('link', { name: 'Edit this page' })).toHaveCount(0)
  await page.goto('reference/entrypoints/')
  await page.getByRole('tab', { name: 'CommonJS', exact: true }).click()
  await expect(page.getByRole('tabpanel', { name: 'CommonJS' }).locator('code')).toContainText(
    "require('@samline/ticker')"
  )
})

test('article footer offers working reading navigation without a GitHub editing action', async ({
  page,
}) => {
  await page.goto('getting-started/')
  const pagination = page.getByRole('navigation', { name: 'Documentation pagination' })
  await expect(page.getByRole('link', { name: 'Edit this page' })).toHaveCount(0)
  await pagination.getByRole('link', { name: /Next/ }).click()
  await expect(page).toHaveURL(/\/guides\/lifecycle\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Lifecycle and updates')
  await pagination.getByRole('link', { name: /Previous/ }).click()
  await expect(page).toHaveURL(/\/getting-started\/$/)
})

test('old installation fragments reveal the matching tab and no-JavaScript retains every option', async ({
  page,
  browser,
}) => {
  await page.goto('getting-started/#pnpm')
  await expect(page.getByRole('tab', { name: 'pnpm', exact: true })).toHaveAttribute(
    'aria-selected',
    'true'
  )
  await expect(page.getByRole('tabpanel', { name: 'pnpm', exact: true })).toBeVisible()
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  })
  const fallback = await context.newPage()
  await fallback.goto('http://127.0.0.1:4327/ticker/docs/getting-started/')
  for (const name of ['npm', 'pnpm', 'yarn', 'bun', 'CDN'])
    await expect(
      fallback.locator(`section[data-panel="${name.toLowerCase()}"] pre`).first()
    ).toBeVisible()
  for (const group of await fallback.locator('ticker-tabs [data-tabs]').all())
    await expect(group).not.toBeVisible()
  await context.close()
})

test('prose styles do not add a second frame to shared code blocks or underline destination cards', async ({
  page,
}) => {
  await page.goto('getting-started/')
  const code = page.locator('ticker-docs-article .code-frame pre').first()
  expect(
    await code.evaluate(element => {
      const style = getComputedStyle(element)
      return { margin: style.marginTop, border: style.borderTopWidth, radius: style.borderRadius }
    })
  ).toEqual({ margin: '0px', border: '0px', radius: '0px' })
  const card = page.locator('a.link-card#configuration')
  expect(await card.evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('none')
})

test('changelog replaces migration and keeps the historical URL useful', async ({ page }) => {
  const source = await readFile(new URL('../../CHANGELOG.md', import.meta.url), 'utf8')
  const versions = [...source.matchAll(/^## (\[[^\]]+\] - \S+)/gm)].map(match => match[1])
  await page.goto('changelog/')
  await expect(page.locator('#article-title')).toHaveText('Changelog')
  await expect(page.locator('ticker-docs-article h2')).toHaveText(versions)
  await expect(page.getByRole('heading', { name: 'Breaking changes', exact: true })).toBeVisible()
  await expect(page.locator('.sidebar nav')).not.toContainText('Migrating to v2')
  await page.goto('guides/migration/')
  await expect(page).toHaveURL(/\/changelog\/$/)
  await expect(page.locator('#article-title')).toHaveText('Changelog')
})

test('HTML/CDN guide reuses file tabs with exact copying and keyboard navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('guides/html-and-browser/')
  const files = page.locator('[data-code-files]')
  for (const name of ['HTML', 'CSS', 'JavaScript']) {
    await files.getByRole('tab', { name, exact: true }).click()
    const panel = files.getByRole('tabpanel', { name, exact: true })
    await panel.getByRole('button', { name: /Copy code from/ }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      await panel.locator('code').textContent()
    )
  }
  await files.getByRole('tab', { name: 'HTML', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(files.getByRole('tab', { name: 'CSS', exact: true })).toBeFocused()
  await expect(files.getByRole('tabpanel', { name: 'CSS', exact: true })).toBeVisible()
})
