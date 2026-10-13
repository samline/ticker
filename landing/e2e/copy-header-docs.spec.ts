import { test, expect } from '@playwright/test'

test('every code example copies its exact source with independent feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          ;(window as unknown as { copiedText: string }).copiedText = text
        },
      },
    })
  })
  await page.goto('./')
  const command = page.locator('.install-shortcut')
  await command.getByRole('button', { name: 'Copy npm install command' }).click()
  expect(await page.evaluate(() => (window as unknown as { copiedText: string }).copiedText)).toBe(
    await command.locator('code').textContent()
  )
  const checked = new Set<string>()
  async function checkVisibleCode() {
    for (const block of await page.locator('.code-block').all()) {
      if (!(await block.isVisible())) continue
      const source = (await block.locator('pre code').textContent()) ?? ''
      if (checked.has(source)) continue
      await block.getByRole('button', { name: /^Copy code from/ }).click()
      expect(
        await page.evaluate(() => (window as unknown as { copiedText: string }).copiedText)
      ).toBe(source)
      await expect(block.getByRole('status')).toHaveText('Copied to clipboard.')
      checked.add(source)
    }
  }
  await checkVisibleCode()
  for (const kind of ['pnpm', 'bun', 'cdn']) {
    await page.locator(`[data-tabs=install] [data-tab=${kind}]`).click()
    await checkVisibleCode()
  }
  await page.locator('[data-tabs=init] [data-tab=global]').click()
  await checkVisibleCode()
  expect(checked.size).toBe(10)
  await expect(command.locator('[data-copy-label]')).toHaveText('Copy')
  const last = page.locator('#recipes .code-block').last()
  await last.getByRole('button').click()
  await expect(last.locator('[data-copy-label]')).toHaveText('Copied!')
  await expect(last.locator('[data-copy-label]')).toHaveText('Copy', { timeout: 3500 })
  expect(await page.pageErrors()).toEqual([])
})

test('denied clipboard selects source and announces manual copy without affecting other controls', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new Error('Denied')
        },
      },
    })
  )
  await page.goto('./')
  const block = page.locator('#recipes .code-block').first()
  await block.getByRole('button').click()
  await expect(block.getByRole('status')).toHaveText(
    'Code selected. Press Control+C or Command+C to copy.'
  )
  expect(await page.evaluate(() => getSelection()?.toString())).toBe(
    await block.locator('pre code').textContent()
  )
  await expect(page.locator('#recipes .code-block').nth(1).getByRole('status')).toBeEmpty()
})

test('sticky navigation keeps targets below the header across viewport and text sizes', async ({
  page,
}) => {
  await page.goto('./')
  for (const width of [320, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(() => scrollTo(0, 1600))
    await expect
      .poll(() =>
        page
          .locator('ticker-header')
          .evaluate(element => Math.round(element.getBoundingClientRect().top))
      )
      .toBe(0)
    await page.evaluate(() => (document.documentElement.style.fontSize = '125%'))
    if (width >= 1024) {
      await page
        .getByRole('navigation', { name: 'Main navigation', exact: true })
        .getByRole('link', { name: 'Get started', exact: true })
        .first()
        .click()
      await expect
        .poll(() =>
          page.evaluate(() => {
            const header = document.querySelector('ticker-header')!.getBoundingClientRect()
            const target = document.querySelector('#how')!.getBoundingClientRect()
            return target.top >= header.bottom - 1
          })
        )
        .toBe(true)
    }
    await page.evaluate(() => (document.documentElement.style.fontSize = ''))
  }
})

test('Docs is available in desktop and mobile navigation and CTAs point to their specific topics', async ({
  page,
}) => {
  await page.goto('./')
  await page.setViewportSize({ width: 1440, height: 900 })
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation', exact: true })
      .getByRole('link', { name: 'Docs', exact: true })
  ).toHaveAttribute('href', '/ticker/docs/')
  await expect(page.getByRole('link', { name: 'Explore configuration options' })).toHaveAttribute(
    'href',
    '/ticker/docs/reference/configuration/'
  )
  await expect(page.getByRole('link', { name: 'Read the update() reference' })).toHaveAttribute(
    'href',
    '/ticker/docs/reference/api/#updateoptions'
  )
  await expect(page.getByRole('link', { name: 'Read the browser registry guide' })).toHaveAttribute(
    'href',
    '/ticker/docs/reference/browser/#cleanup'
  )
  await expect(page.getByRole('link', { name: 'Read the documentation' })).toHaveAttribute(
    'href',
    '/ticker/docs/'
  )
  await page.setViewportSize({ width: 375, height: 900 })
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  await expect(
    page.getByRole('dialog').getByRole('link', { name: 'Docs', exact: true })
  ).toHaveAttribute('href', '/ticker/docs/')
})
