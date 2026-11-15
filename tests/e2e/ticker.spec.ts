import { fileURLToPath } from 'node:url'
import { expect, test } from './fixtures'

const styles = fileURLToPath(new URL('../../dist/style.css', import.meta.url))

const markup = `
  <div id="news" style="width: 320px">
    <a href="#one">First headline</a>
    <a href="#two">Second headline</a>
  </div>
`

test('the CDN bundle exposes window.Ticker and fills the row with hidden clones', async ({
  load,
}) => {
  const page = await load(markup, 'ticker')
  await page.addStyleTag({ path: styles })
  expect(await page.evaluate(() => typeof (window as any).Ticker?.ticker)).toBe('function')
  expect(await page.evaluate(() => 'default' in (window as any).Ticker)).toBe(false)

  await page.evaluate(() => {
    ;(window as any).controller = (window as any).Ticker.ticker('#news', { duration: 8 })
  })
  const wrapper = page.locator('.ticker-wrapper')
  await expect(wrapper).toHaveAttribute('data-ready', 'true')
  await expect(wrapper).toHaveAttribute('data-playing', 'true')
  const clones = page.locator('.ticker-clone')
  expect(await clones.count()).toBeGreaterThan(0)
  await expect(clones.first()).toHaveAttribute('aria-hidden', 'true')
  // Clones are inert, so only the originals are reachable by keyboard.
  expect(await clones.first().evaluate(element => (element as HTMLElement).inert)).toBe(true)
  expect(
    await page
      .locator('#news a')
      .first()
      .evaluate(element => element.closest('[inert]'))
  ).toBeNull()
})

test('the controller pauses, plays and restores the original markup on destroy', async ({
  load,
}) => {
  const page = await load(markup, 'ticker')
  await page.addStyleTag({ path: styles })
  await page.evaluate(() => {
    ;(window as any).controller = (window as any).Ticker.ticker('#news')
  })
  const wrapper = page.locator('.ticker-wrapper')
  await expect(wrapper).toHaveAttribute('data-ready', 'true')

  await page.evaluate(() => (window as any).controller.pause())
  await expect(wrapper).toHaveAttribute('data-playing', 'false')
  expect(await page.evaluate(() => (window as any).controller.state.reasons)).toContain('manual')
  await page.evaluate(() => (window as any).controller.play())
  await expect(wrapper).toHaveAttribute('data-playing', 'true')

  await page.evaluate(() => {
    ;(window as any).controller.destroy()
    ;(window as any).controller.destroy()
  })
  await expect(page.locator('.ticker-wrapper')).toHaveCount(0)
  await expect(page.locator('#news a')).toHaveCount(2)
})
