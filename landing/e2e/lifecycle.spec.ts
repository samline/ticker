import { test, expect } from '@playwright/test'

test('demo and recipe functions release removed instances and reconnect once', async ({ page }) => {
  await page.goto('examples/')
  const recipe = page.locator('#dynamic-content')
  const demo = recipe.locator('ticker-demo')
  await expect(demo).toHaveAttribute('data-initialized', 'true')
  await page.evaluate(() => {
    const parking = document.createElement('template')
    parking.id = 'parked-recipe'
    document.body.append(parking)
    parking.content.append(document.querySelector('#dynamic-content')!)
  })
  await expect
    .poll(() =>
      page.evaluate(() => {
        const parking = document.querySelector<HTMLTemplateElement>('#parked-recipe')!
        const demo = parking.content.querySelector('ticker-demo')!
        return demo.hasAttribute('data-initialized')
      })
    )
    .toBe(false)
  await page.evaluate(() => {
    const parking = document.querySelector<HTMLTemplateElement>('#parked-recipe')!
    document.querySelector('main')!.append(parking.content)
    parking.remove()
  })
  await expect(demo).toHaveAttribute('data-initialized', 'true')
  await demo.scrollIntoViewIfNeeded()
  const originals = recipe.locator('.ticker-content:not(.ticker-clone) [data-example-item]')
  await recipe.getByRole('button', { name: 'Add an update' }).click()
  await expect(originals).toHaveCount(4)
  await recipe.getByRole('button', { name: 'Remove last', exact: true }).click()
  await expect(originals).toHaveCount(3)
  await recipe.getByRole('button', { name: /Pause animation:/ }).click()
  await expect(recipe.getByRole('button', { name: /Play animation:/ })).toBeVisible()
  await expect(demo.locator('.ticker-frame')).toHaveAttribute('data-user-paused', 'true')
})
