import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
const manifest = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
const npmName = manifest.name

test('document/social titles and footer identity use the shared convention', async ({ page }) => {
  test.skip(!test.info().config.metadata.combined, 'All routes need the combined artifact')
  for (const path of [
    '/ticker/',
    '/ticker/examples/',
    '/ticker/docs/',
    '/ticker/docs/getting-started/',
  ]) {
    await page.goto(path)
    const title = await page.title()
    if (path.endsWith('docs/')) expect(title).toBe(`Documentation — ${npmName}`)
    if (path.endsWith('examples/')) expect(title).toBe(`Examples — ${npmName}`)
    expect(title.endsWith(` — ${npmName}`), path).toBe(true)
    expect(title.slice(0, -` — ${npmName}`.length).trim()).not.toBe('')
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title)
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', title)
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', npmName)
    if (path === '/ticker/' || path === '/ticker/examples/') {
      const footer = page.locator('footer')
      await expect(footer.locator('.footer-bottom p')).toHaveText(
        /©\s+\d{4}\s+samline · Made for the open web\./
      )
      const nav = footer.getByRole('navigation', { name: 'Footer navigation' })
      for (const name of ['Docs', 'Installation guide', 'Working examples', 'Changelog'])
        await expect(nav.getByRole('link', { name, exact: true })).toBeVisible()
      await expect(nav.getByRole('link', { name: /^npm(?: |$)/ })).toBeVisible()
      await expect(nav.getByRole('link', { name: /skill for AI agents/ })).toBeVisible()
    }
  }
})
