import { test, expect } from '@playwright/test'
import axe from 'axe-core'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const ids = [
  'announcements',
  'brand-logos',
  'sample-prices',
  'opposite-rows',
  'dynamic-content',
  'playback-controls',
]

test('all six previews run actual controllers, pause independently, and expose functional controls', async ({
  page,
}) => {
  await page.goto('examples/')
  for (const id of ids) {
    const recipe = page.locator(`#${id}`)
    await recipe.locator('ticker-demo').first().scrollIntoViewIfNeeded()
    const frame = recipe
    await expect(frame.locator('.ticker-wrapper[data-ready=true]')).toHaveCount(
      id === 'opposite-rows' ? 2 : 1
    )
    expect(await frame.locator('.ticker-clone').count()).toBeGreaterThan(0)
    await frame
      .getByRole('button', { name: /Pause animation:/ })
      .first()
      .click()
    await expect(frame.locator('.ticker-frame').first()).toHaveAttribute('data-user-paused', 'true')
    expect(
      await frame
        .locator('.ticker-track')
        .first()
        .evaluate(el => getComputedStyle(el).animationPlayState)
    ).toBe('paused')
    await expect(frame.getByRole('button', { name: /Play animation:/ }).first()).toHaveText(
      'Play animation'
    )
    await frame
      .getByRole('button', { name: /Play animation:/ })
      .first()
      .press('Enter')
    await expect(frame.locator('.ticker-frame').first()).toHaveAttribute(
      'data-user-paused',
      'false'
    )
    await expect(frame.getByRole('button', { name: /Pause animation:/ }).first()).toHaveText(
      'Pause animation'
    )
  }
  const dynamic = page.locator('#dynamic-content')
  await dynamic.locator('ticker-demo').scrollIntoViewIfNeeded()
  const updates = dynamic
  await updates.getByRole('button', { name: 'Add an update' }).click()
  await expect(updates.getByRole('status')).toContainText('Added update 1')
  await expect(updates.locator('.ticker-content:not(.ticker-clone) > span:not(.sep)')).toHaveCount(
    4
  )
  await expect(updates.locator('.ticker-clone').first()).toContainText('New update 1')
  const controls = page.locator('#playback-controls')
  await controls.locator('ticker-demo').scrollIntoViewIfNeeded()
  const adjustable = controls
  await adjustable.getByRole('slider').press('Home')
  await adjustable.getByRole('slider').press('ArrowRight')
  await expect(adjustable.locator('output')).toHaveText('15s')
  await expect(adjustable.locator('.ticker-wrapper')).toHaveAttribute('data-duration', '15')
  await adjustable.getByRole('button', { name: 'Right', exact: true }).click()
  await expect(adjustable.locator('.ticker-wrapper')).toHaveAttribute('data-direction', 'right')
  for (const frame of page.frames()) await frame.addScriptTag({ content: axe.source })
  const violations = await page.evaluate(async () => {
    const api = (window as unknown as { axe: typeof axe }).axe
    return (
      await api.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'] },
      })
    ).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))
  })
  expect(violations).toEqual([])
})

test('keeps the original recipes first and edits the dynamic feed at a constant speed', async ({
  page,
}) => {
  await page.goto('examples/')
  const order = await page
    .locator('section.recipe')
    .evaluateAll(elements => elements.map(el => el.id))
  expect(order).toEqual([
    ...ids,
    'manual-navigation',
    'vertical-news',
    'constant-speed',
    'rtl-content',
    'responsive-options',
  ])
  const recipe = page.locator('#dynamic-content')
  await page
    .getByRole('navigation', { name: 'Choose an example' })
    .getByRole('link', { name: 'Dynamic content', exact: true })
    .click()
  const add = recipe.getByRole('button', { name: 'Add an update' })
  await expect(add).toBeVisible()
  await expect(add).toBeEnabled()
  const originals = recipe.locator('.ticker-content:not(.ticker-clone) [data-example-item]')
  const speed = () =>
    recipe.locator('.ticker-frame').evaluate(frame => {
      const track = frame.querySelector('.ticker-track')!
      const content = frame.querySelector('.ticker-content:not(.ticker-clone)')!
      const styles = getComputedStyle(track)
      return (
        (content.getBoundingClientRect().width + parseFloat(styles.columnGap)) /
        parseFloat(styles.animationDuration)
      )
    })
  await expect.poll(speed).toBeCloseTo(40, 3)
  await recipe.getByRole('button', { name: /Pause animation:/ }).click()
  for (let i = 0; i < 3; i++) await add.click()
  await expect(originals).toHaveCount(6)
  await expect.poll(speed).toBeCloseTo(40, 3)
  await recipe.getByRole('button', { name: 'Remove first', exact: true }).click()
  await expect(originals).toHaveCount(5)
  await expect(originals.first()).toHaveText('Design approved')
  await recipe.getByRole('button', { name: 'Remove last', exact: true }).click()
  await expect(originals).toHaveCount(4)
  await expect(originals.last()).toHaveText('New update 2')
  await recipe
    .getByRole('combobox', { name: 'Choose an item', exact: true })
    .selectOption({ label: 'New update 1' })
  await recipe.getByRole('button', { name: 'Remove selected', exact: true }).click()
  await expect(originals).toHaveCount(3)
  await expect.poll(speed).toBeCloseTo(40, 3)
  await expect(
    recipe.locator('.ticker-clone [data-example-item]').filter({ hasText: 'New update 1' })
  ).toHaveCount(0)
  await expect(recipe.locator('.ticker-frame')).toHaveAttribute('data-user-paused', 'true')
  for (let i = 0; i < 3; i++)
    await recipe.getByRole('button', { name: 'Remove first', exact: true }).click()
  await expect(originals).toHaveCount(0)
  await expect(recipe.locator('.ticker-clone')).toHaveCount(0)
  await expect(recipe.getByRole('combobox', { name: 'Choose an item', exact: true })).toBeDisabled()
  await expect(recipe.getByRole('button', { name: 'Remove selected', exact: true })).toBeDisabled()
  await add.click()
  await expect(originals).toHaveCount(1)
  await expect(recipe.locator('.ticker-frame')).toHaveAttribute('data-ready', 'true')
  await expect.poll(speed).toBeCloseTo(40, 3)
})

test('vertical feed has readable illustrated cards without horizontal separator rows', async ({
  page,
}) => {
  await page.goto('examples/#vertical-news')
  const recipe = page.locator('#vertical-news')
  await expect(recipe.locator('.ticker-frame')).toHaveAttribute('data-ready', 'true')
  const original = recipe.locator('.ticker-content:not(.ticker-clone)')
  await expect(original.locator('.story-item')).toHaveCount(4)
  await expect(original.locator('.sep')).toHaveCount(0)
  expect(
    await original
      .locator('img')
      .evaluateAll(images =>
        images.every(
          img => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0
        )
      )
  ).toBe(true)
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => {
      document.documentElement.dataset.theme = theme
    }, theme)
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      ).toBe(true)
      const bounds = await original
        .locator('.story-item')
        .first()
        .evaluate(el => {
          const card = el.getBoundingClientRect(),
            image = el.querySelector('img')!.getBoundingClientRect(),
            copy = el.querySelector('.story-copy')!.getBoundingClientRect()
          return {
            imageFits: image.left >= card.left && image.right < copy.left,
            textFits: copy.right <= card.right + 1,
          }
        })
      expect(bounds).toEqual({ imageFits: true, textFits: true })
    }
  }
})

test('every copied CDN and npm document executes as a standalone example', async ({
  page,
  context,
}) => {
  test.setTimeout(120000)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const assets = new Map<string, string>()
  for (const [entry, format, key] of [
    ['src/browser/global.ts', 'iife', 'global.global.js'],
    ['src/index.ts', 'es', 'module.js'],
  ] as const) {
    const result = await build({
      configFile: false,
      root: fileURLToPath(new URL('../../', import.meta.url)),
      publicDir: false,
      logLevel: 'warn',
      build: {
        write: false,
        target: 'es2020',
        rolldownOptions: { output: { exports: 'named' } },
        lib: {
          entry: fileURLToPath(new URL(`../../${entry}`, import.meta.url)),
          name: 'TickerExample',
          formats: [format],
        },
      },
    })
    const output = (Array.isArray(result) ? result[0] : result) as {
      output: { type: string; code?: string }[]
    }
    assets.set(key, output.output.find(chunk => chunk.type === 'chunk')!.code!)
  }
  assets.set('style.css', await readFile(new URL('../../src/style.css', import.meta.url), 'utf8'))
  const published = process.env.TICKER_PUBLISHED_ASSETS
  const cdnAssets = published
    ? new Map([
        ['global.global.js', await readFile(`${published}.global.js`, 'utf8')],
        ['style.css', await readFile(`${published}.css`, 'utf8')],
      ])
    : assets
  await page.goto('examples/')
  for (const id of [
    ...ids,
    'manual-navigation',
    'vertical-news',
    'constant-speed',
    'rtl-content',
    'responsive-options',
  ]) {
    const recipe = page.locator(`#${id}`)
    await recipe.locator('summary').click()
    for (const mode of ['HTML / CDN', 'npm / ESM']) {
      await recipe.getByRole('tab', { name: mode, exact: true }).click()
      const panel = recipe.getByRole('tabpanel', { name: mode })
      const code = await panel.locator('code').textContent()
      expect(code).toContain('<!doctype html>')
      await panel.getByRole('button', { name: /Copy complete/ }).click()
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code)
      const standalone = await context.newPage()
      // Substitute dependency delivery only. Recipe markup, styles and behavior are copied verbatim.
      await standalone.route('https://cdn.jsdelivr.net/**', route => {
        const key = route.request().url().endsWith('style.css') ? 'style.css' : 'global.global.js'
        return route.fulfill({
          body: cdnAssets.get(key),
          contentType: key.endsWith('.css') ? 'text/css' : 'text/javascript',
          headers: { 'Access-Control-Allow-Origin': '*' },
        })
      })
      await standalone.route('https://example.test/*', route =>
        route.fulfill({
          body: assets.get(route.request().url().endsWith('.css') ? 'style.css' : 'module.js'),
          contentType: route.request().url().endsWith('.css') ? 'text/css' : 'text/javascript',
          headers: { 'Access-Control-Allow-Origin': '*' },
        })
      )
      const executable =
        mode === 'npm / ESM'
          ? code!
              .replace(/from ['"]@samline\/ticker['"]/g, "from 'https://example.test/module.js'")
              .replace(/import ['"]@samline\/ticker\/style.css['"];?/g, '')
              .replace(
                '</head>',
                '<link rel="stylesheet" href="https://example.test/style.css"></head>'
              )
          : code!
      const errors: string[] = []
      standalone.on('pageerror', error => errors.push(error.message))
      await standalone.setContent(executable)
      await expect(standalone.locator('.ticker-wrapper[data-ready=true]')).toHaveCount(
        id === 'opposite-rows' || id === 'constant-speed' ? 2 : 1
      )
      if (id === 'manual-navigation' || id === 'rtl-content')
        await standalone.getByRole('button', { name: 'Play animation', exact: true }).click()
      await standalone.getByRole('button', { name: 'Pause animation', exact: true }).click()
      await expect(standalone.locator('ticker-recipe')).toHaveAttribute('data-paused', 'true')
      await expect(
        standalone.getByRole('button', { name: 'Play animation', exact: true })
      ).toBeVisible()
      await standalone.getByRole('button', { name: 'Play animation', exact: true }).click()
      await expect(standalone.locator('ticker-recipe')).toHaveAttribute('data-paused', 'false')
      if (id === 'dynamic-content') {
        const originals = standalone.locator(
          '[data-row]:not(.ticker-clone [data-row]) [data-example-item]'
        )
        await standalone.getByRole('button', { name: 'Add an update' }).click()
        await expect(originals).toHaveCount(4)
        await standalone.getByRole('button', { name: 'Remove first', exact: true }).click()
        await expect(originals).toHaveCount(3)
        await standalone
          .getByRole('combobox', { name: 'Choose an item', exact: true })
          .selectOption({ label: 'New update 1' })
        await standalone.getByRole('button', { name: 'Remove selected', exact: true }).click()
        await expect(originals).toHaveCount(2)
      }
      if (id === 'vertical-news') {
        for (const direction of ['Down', 'Up']) {
          await standalone.getByRole('button', { name: direction, exact: true }).click()
          await expect(standalone.locator('.ticker-wrapper')).toHaveAttribute(
            'data-motion-direction',
            direction.toLowerCase()
          )
        }
      }
      if (id === 'manual-navigation') {
        const frame = standalone.locator('.ticker-wrapper')
        const box = (await frame.boundingBox())!
        await standalone.mouse.move(box.x + 140, box.y + box.height / 2)
        await standalone.mouse.down()
        await standalone.mouse.move(box.x + 60, box.y + box.height / 2, { steps: 5 })
        await standalone.mouse.up()
        await standalone.mouse.move(0, 0)
        await expect(frame).toHaveAttribute('data-playing', 'true')
      }
      expect(errors).toEqual([])
      await standalone.close()
    }
    await recipe.locator('summary').click()
  }
})

test('gallery navigation, metadata and layouts work in both themes from 320 to 1440', async ({
  page,
}) => {
  await page.goto('examples/')
  await page.locator('#announcements summary').click()
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://samline.github.io/ticker/examples/'
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://samline.github.io/ticker/social.png'
  )
  for (const theme of ['dark', 'light']) {
    await page.evaluate(theme => {
      document.documentElement.dataset.theme = theme
      document.dispatchEvent(new Event('ticker:theme-change'))
    }, theme)
    const first = page.locator('#announcements ticker-demo')
    await first.scrollIntoViewIfNeeded()
    expect(await first.evaluate(el => getComputedStyle(el).color)).toBe(
      await page.locator('#announcements .studio-panel').evaluate(el => getComputedStyle(el).color)
    )
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${theme} ${width}`
      ).toBe(true)
    }
  }
  await page.setViewportSize({ width: 320, height: 800 })
  await page.evaluate(() => (document.documentElement.style.fontSize = '24px'))
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true
  )
  await page.getByRole('button', { name: 'Open navigation menu' }).click()
  const menu = page.getByRole('dialog')
  await expect(menu.getByRole('link', { name: 'Examples', exact: true })).toHaveAttribute(
    'aria-current',
    'page'
  )
  await expect(menu.getByRole('link', { name: 'Features', exact: true })).toHaveAttribute(
    'href',
    '/ticker/#features'
  )
  await expect(menu.locator('.menu-link').last()).toHaveAccessibleName('Docs')
  await page.keyboard.press('Escape')
  await page
    .getByRole('navigation', { name: 'Choose an example' })
    .getByRole('link', { name: 'Announcements', exact: true })
    .click()
  const gap = await page.evaluate(
    () =>
      (document.getElementById('announcements-title')!.getBoundingClientRect().top -
        document.querySelector('ticker-header')!.getBoundingClientRect().bottom) /
      parseFloat(getComputedStyle(document.documentElement).fontSize)
  )
  expect(gap).toBeCloseTo(2.5, 1)
})

test('reduced motion and no-JavaScript preserve readable example content and code', async ({
  page,
  browser,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('examples/')
  const preview = page.locator('#announcements')
  await expect(preview.locator('.ticker-wrapper')).toHaveCount(1)
  expect(
    await preview.locator('.ticker-track').evaluate(el => getComputedStyle(el).animationName)
  ).toBe('none')
  await expect(preview.getByRole('button', { name: /Pause animation:/ })).toBeHidden()
  const context = await browser.newContext({ javaScriptEnabled: false })
  const fallback = await context.newPage()
  await fallback.goto('http://127.0.0.1:4324/ticker/examples/')
  const recipe = fallback.locator('#announcements')
  await recipe.locator('summary').click()
  await expect(recipe.locator('pre')).toHaveCount(2)
  await recipe.locator('ticker-demo').scrollIntoViewIfNeeded()
  await expect(recipe.locator('.ticker-content a')).toHaveCount(3)
  await context.close()
})

test('Home keeps three separate demo tabs, remembers per-example speed, and shares its preview design with Examples', async ({
  page,
  context,
}) => {
  await page.goto('./')
  const studio = page.locator('ticker-live-demo')
  await studio.getByRole('button', { name: /Pause animation:/ }).click()
  await expect(studio.getByRole('button', { name: /Play animation:/ })).toHaveText('Play animation')
  await studio.getByRole('button', { name: /Play animation:/ }).click()
  await expect(studio.getByRole('button', { name: /Pause animation:/ })).toHaveText(
    'Pause animation'
  )
  await expect(studio.getByRole('tab')).toHaveCount(3)
  await expect(studio.locator('[role=tabpanel]:visible')).toHaveCount(1)
  const speed = studio.getByRole('slider')
  await speed.press('Home')
  await speed.press('ArrowRight')
  await expect(studio.locator('ticker-demo[data-kind=news]')).toHaveAttribute('data-duration', '15')
  await studio.locator('[data-tab=logos]').click()
  await expect(studio.locator('[data-panel=news]')).toBeHidden()
  await expect(studio.locator('[data-panel=logos]')).toBeVisible()
  await expect(speed).toHaveValue('48')
  await speed.press('End')
  await expect(studio.locator('ticker-demo[data-kind=logos]')).toHaveAttribute(
    'data-duration',
    '60'
  )
  await expect(studio.locator('ticker-demo[data-kind=news]')).toHaveAttribute('data-duration', '15')
  await studio.locator('[data-tab=prices]').click()
  await expect(speed).toHaveValue('34')
  await studio.locator('[data-tab=news]').click()
  await expect(speed).toHaveValue('15')
  const examples = await context.newPage()
  await examples.goto('http://127.0.0.1:4324/ticker/examples/')
  const inspect = (el: Element) => {
    const style = getComputedStyle(el)
    return {
      background: style.backgroundColor,
      border: style.borderColor,
      radius: style.borderRadius,
      font: style.fontFamily,
      padding: style.padding,
    }
  }
  for (const theme of ['dark', 'light']) {
    for (const target of [page, examples])
      await target.evaluate(theme => {
        document.documentElement.dataset.theme = theme
      }, theme)
    expect(await examples.locator('#announcements .demo-studio').evaluate(inspect)).toEqual(
      await studio.locator('.demo-studio').evaluate(inspect)
    )
    expect(await examples.locator('#announcements .studio-panel').evaluate(inspect)).toEqual(
      await studio.locator('[data-panel=news]').evaluate(inspect)
    )
  }
  await expect(examples.locator('h1')).toHaveText('Ticker examples.')
  await expect(examples.locator('iframe')).toHaveCount(0)
  await examples.close()
})

test('vertical direction controls and manual drag resumption work without console errors', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.goto('examples/')
  const vertical = page.locator('#vertical-news')
  await vertical.getByRole('button', { name: 'Down', exact: true }).click()
  await expect(vertical.locator('.ticker-wrapper')).toHaveAttribute('data-motion-direction', 'down')
  await expect(vertical.getByRole('button', { name: 'Down', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await vertical.getByRole('button', { name: 'Up', exact: true }).click()
  await expect(vertical.locator('.ticker-wrapper')).toHaveAttribute('data-motion-direction', 'up')
  const manual = page.locator('#manual-navigation')
  await manual
    .getByRole('button', { name: 'Play animation: Manual news navigation', exact: true })
    .click()
  const frame = manual.locator('.ticker-wrapper')
  await frame.scrollIntoViewIfNeeded()
  const box = (await frame.boundingBox())!
  await page.mouse.move(box.x + 150, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + 60, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await page.mouse.move(5, 5)
  await expect(frame).toHaveAttribute('data-playing', 'true')
  await expect(
    manual.getByRole('button', { name: 'Pause animation: Manual news navigation', exact: true })
  ).toBeVisible()
  expect(errors).toEqual([])
})
