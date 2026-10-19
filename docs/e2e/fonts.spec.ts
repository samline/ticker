import { test, expect } from '@playwright/test'

test('Docs uses the shared local font families without external font services', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', request => requests.push(request.url()))
  await page.goto('getting-started/')
  await page.evaluate(() => document.fonts.ready)
  const fonts = requests.filter(url => url.endsWith('.woff2'))
  expect(fonts).toHaveLength(3)
  expect(fonts.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true)
  expect(requests.filter(url => /fonts\.(bunny|googleapis|gstatic)/.test(url))).toEqual([])
  await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(2)
  expect(
    await page.evaluate(() =>
      Array.from(document.fonts, font => ({ family: font.family, status: font.status }))
    )
  ).toEqual([
    { family: 'Inter', status: 'loaded' },
    { family: 'Instrument Serif', status: 'loaded' },
    { family: 'JetBrains Mono', status: 'loaded' },
  ])
})
