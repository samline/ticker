import { test, expect, type Page, type Locator } from '@playwright/test'
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

async function checkReadingInterval(page: Page, recipe: Locator) {
  const frame = recipe.locator('.ticker-wrapper')
  const pause = recipe.locator('button[data-pause]')
  if ((await pause.textContent())?.includes('Play')) await pause.click()
  await frame.scrollIntoViewIfNeeded()
  await page.mouse.move(5, 5)
  await expect(frame).toHaveAttribute('data-playing', 'true')
  const track = recipe.locator('.ticker-track')
  const transform = () => track.evaluate(el => getComputedStyle(el).transform)
  const before = await transform()
  await recipe.locator('button[data-next]').click()
  await expect.poll(transform).not.toBe(before)
  await expect
    .poll(() =>
      track.evaluate(async el => {
        const before = getComputedStyle(el).transform
        await new Promise<void>(resolve =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
        return before === getComputedStyle(el).transform
      })
    )
    .toBe(true)
  const held = await transform()
  await page.waitForTimeout(400)
  expect(await transform()).toBe(held)
  await expect(frame).toHaveAttribute('data-playing', 'false')
  await expect(frame).toHaveAttribute('data-playing', 'true')
}

async function checkCachedPageLifecycle(page: Page) {
  const wrappers = await page.locator('.ticker-wrapper').count()
  const pause = page.locator('button[data-pause]')
  const label = await pause.textContent()
  // Repeat the persisted transition: cleanup must remain registered for a later departure.
  await page.evaluate(() => {
    for (let i = 0; i < 2; i++) {
      dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
      dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    }
  })
  await expect(page.locator('.ticker-wrapper')).toHaveCount(wrappers)
  await pause.click()
  await expect(pause).not.toHaveText(label!)
  await page.evaluate(() =>
    dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))
  )
  await expect(page.locator('.ticker-wrapper')).toHaveCount(0)
}

async function checkDragModes(page: Page, recipe: Locator) {
  const frame = recipe.locator('.ticker-wrapper')
  const resume = recipe.getByRole('button', { name: 'Resume after drag', exact: true })
  const pause = recipe.locator('button[data-pause]')
  await expect(resume).toHaveAttribute('aria-pressed', 'true')
  const drag = async () => {
    await frame.scrollIntoViewIfNeeded()
    const box = (await frame.boundingBox())!
    await page.mouse.move(box.x + 150, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + 60, box.y + box.height / 2, { steps: 5 })
    await expect(frame).toHaveAttribute('data-playing', 'false')
    await page.mouse.up()
    await page.mouse.move(5, 5)
  }
  await drag()
  await expect(frame).toHaveAttribute('data-playing', 'true')
  await resume.click()
  await expect(resume).toHaveAttribute('aria-pressed', 'false')
  await expect(resume).toContainText('Off')
  await expect(frame).toHaveAttribute('data-resume-after-drag', 'false')
  await drag()
  await expect(frame).toHaveAttribute('data-playing', 'false')
  await resume.click()
  await expect(resume).toHaveAttribute('aria-pressed', 'true')
  await expect(resume).toContainText('On')
  await expect(frame).toHaveAttribute('data-playing', 'false')
  await pause.click()
  await drag()
  await expect(frame).toHaveAttribute('data-playing', 'true')
  await pause.click()
  await drag()
  await expect(frame).toHaveAttribute('data-playing', 'false')
}

async function checkRepeatedCategory(recipe: Locator) {
  const pause = recipe.locator('button[data-pause]')
  if ((await pause.textContent())?.includes('Pause')) await pause.click()
  await expect(recipe.locator('.ticker-wrapper')).toHaveAttribute('data-playing', 'false')
  const rail = recipe.locator('[data-position]')
  await rail.press('End')
  await expect
    .poll(async () => Number(await rail.inputValue()))
    .toBeCloseTo(Number(await rail.getAttribute('max')) - 0.001, 2)
  await recipe.locator('.ticker-wrapper').scrollIntoViewIfNeeded()
  const visible = await recipe.locator('.ticker-wrapper').evaluate(frame => {
    const viewport = frame.getBoundingClientRect()
    const button = Array.from(
      frame.querySelectorAll<HTMLElement>('.ticker-clone button[data-example-feature]')
    ).find(button => {
      const rect = button.getBoundingClientRect()
      const x = rect.x + rect.width / 2
      const y = rect.y + rect.height / 2
      return (
        x > viewport.left &&
        x < viewport.right &&
        y > viewport.top &&
        y < viewport.bottom &&
        button.contains(document.elementFromPoint(x, y))
      )
    })
    if (!button) return null
    const rect = button.getBoundingClientRect()
    return {
      key: button.dataset.exampleFeature,
      label: button.textContent!.trim(),
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
    }
  })
  expect(visible).toBeTruthy()
  const { key, label, x, y } = visible!
  await recipe.page().mouse.click(x, y)
  await expect(recipe.locator('.ticker-featured button')).toHaveText(label)
  await expect(recipe.locator('[data-featured-selection]')).toHaveText(label)
  await expect(recipe.locator('.ticker-featured')).toHaveCount(1)
  await expect(recipe.locator(`.ticker-clone button[data-example-feature="${key}"]`)).toHaveCount(0)
}

async function checkFeaturedControls(page: Page, recipe: Locator) {
  const frame = recipe.locator('.ticker-wrapper')
  const positions = recipe.getByRole('group', { name: 'Featured position', exact: true })
  const axes = recipe.getByRole('group', { name: 'Motion axis', exact: true })
  const pause = recipe.locator('button[data-pause]')
  for (const axis of ['Horizontal', 'Vertical']) {
    await axes.getByRole('button', { name: axis, exact: true }).click()
    await expect(frame).toHaveAttribute('data-axis', axis.toLowerCase())
    for (const [position, label] of [
      ['start', axis === 'Vertical' ? 'Top' : 'Left'],
      ['center', 'Center'],
      ['end', axis === 'Vertical' ? 'Bottom' : 'Right'],
    ]) {
      const button = positions.getByRole('button', { name: label, exact: true })
      await button.click()
      await expect(button).toHaveAttribute('aria-pressed', 'true')
      await expect(frame).toHaveAttribute('data-featured-position', position)
      await expect(recipe.locator('.ticker-featured')).toHaveCount(1)
    }
  }
  await axes.getByRole('button', { name: 'Horizontal', exact: true }).click()
  await positions.getByRole('button', { name: 'Center', exact: true }).click()
  if ((await pause.textContent())?.includes('Pause')) await pause.click()
  await frame.scrollIntoViewIfNeeded()
  const before = (await frame.boundingBox())!
  const fixed = (await recipe.locator('.ticker-featured').boundingBox())!
  const rail = recipe.locator('[data-position]')
  const value = await rail.inputValue()
  await page.mouse.move(before.x + before.width - 12, before.y + before.height / 2)
  await page.mouse.down()
  await page.mouse.move(before.x + before.width - 102, before.y + before.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect.poll(() => rail.inputValue()).not.toBe(value)
  const after = (await recipe.locator('.ticker-featured').boundingBox())!
  expect(after.x).toBeCloseTo(fixed.x, 1)
  expect(after.y).toBeCloseTo(fixed.y, 1)
  await expect(pause).toContainText('Play')
  await pause.click()
  await expect(frame).toHaveAttribute('data-playing', 'true')
}

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
  await expect(updates.locator('.update-status')).toContainText('Added update 1')
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
    'drag-playback',
    'featured-menu',
    'featured-logo',
  ])
  const recipe = page.locator('#dynamic-content')
  await page
    .getByRole('navigation', { name: 'Choose an example' })
    .getByRole('link', { name: 'Dynamic content', exact: true })
    .click()
  const add = recipe.getByRole('button', { name: 'Add an update' })
  await expect(add).toBeVisible()
  await expect(add).toBeEnabled()
  await expect(
    recipe.getByRole('combobox', { name: 'Choose a position', exact: true })
  ).toHaveValue('0')
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
  await recipe
    .getByRole('combobox', { name: 'Choose a position', exact: true })
    .selectOption({ value: '1' })
  await recipe.getByRole('button', { name: 'Remove at position', exact: true }).click()
  await expect(originals).toHaveText(['Design approved', 'New update 2'])
  await expect(
    recipe.locator('.ticker-clone [data-example-item]').filter({ hasText: 'Ready to ship' })
  ).toHaveCount(0)
  for (let i = 0; i < 2; i++)
    await recipe.getByRole('button', { name: 'Remove first', exact: true }).click()
  await expect(originals).toHaveCount(0)
  await expect(recipe.locator('.ticker-clone')).toHaveCount(0)
  await expect(recipe.getByRole('combobox', { name: 'Choose an item', exact: true })).toBeDisabled()
  await expect(recipe.getByRole('button', { name: 'Remove selected', exact: true })).toBeDisabled()
  await expect(
    recipe.getByRole('button', { name: 'Remove at position', exact: true })
  ).toBeDisabled()
  await expect(
    recipe.getByRole('combobox', { name: 'Choose a position', exact: true })
  ).toBeDisabled()
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
    'drag-playback',
    'featured-menu',
    'featured-logo',
  ]) {
    const recipe = page.locator(`#${id}`)
    await recipe.locator('summary').click()
    for (const mode of ['HTML / CDN', 'Package / ESM']) {
      await recipe.getByRole('tab', { name: mode, exact: true }).click()
      const panel = recipe.getByRole('tabpanel', { name: mode })
      const files: Record<string, string> = {}
      for (const language of ['HTML', 'CSS', 'JavaScript']) {
        await panel.getByRole('tab', { name: language, exact: true }).click()
        const file = panel.getByRole('tabpanel', { name: language, exact: true })
        files[language] = (await file.locator('code').textContent())!
        await file.getByRole('button', { name: /Copy code from/ }).click()
        expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(files[language])
      }
      await panel.getByRole('tab', { name: 'Complete file', exact: true }).click()
      const code = await panel
        .getByRole('tabpanel', { name: 'Complete file', exact: true })
        .locator('code')
        .textContent()
      expect(code).toContain('<!doctype html>')
      expect(code).not.toMatch(/\bclass\s+\w+|\bthis\./)
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
        mode === 'Package / ESM'
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
      if (id === 'manual-navigation')
        await standalone.getByRole('button', { name: 'Play animation', exact: true }).click()
      await standalone.getByRole('button', { name: 'Pause animation', exact: true }).click()
      await expect(standalone.locator('.ticker-recipe')).toHaveAttribute('data-paused', 'true')
      await expect(
        standalone.getByRole('button', { name: 'Play animation', exact: true })
      ).toBeVisible()
      await standalone.getByRole('button', { name: 'Play animation', exact: true }).click()
      await expect(standalone.locator('.ticker-recipe')).toHaveAttribute('data-paused', 'false')
      if (id === 'featured-menu') {
        await expect(standalone.locator('.ticker-featured')).toHaveText('Overview')
        await standalone
          .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
          .first()
          .focus()
        await standalone
          .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
          .first()
          .click()
        await expect(standalone.locator('.ticker-featured')).toHaveText('Components')
        await expect(standalone.locator('.ticker-featured')).toHaveCount(1)
        await checkRepeatedCategory(standalone.locator('.ticker-recipe'))
      }
      if (id === 'featured-logo') {
        await expect(standalone.locator('.ticker-featured strong')).toHaveText('Vite')
        await expect(standalone.locator('.ticker-clone [data-featured]')).toHaveCount(0)
      }
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
        await standalone
          .getByRole('combobox', { name: 'Choose a position', exact: true })
          .selectOption({ value: '1' })
        await standalone.getByRole('button', { name: 'Remove at position', exact: true }).click()
        await expect(originals).toHaveText(['Design approved'])
        await expect(standalone.locator('.ticker-clone [data-example-item="item-2"]')).toHaveCount(
          0
        )
      }
      if (id === 'brand-logos' || id === 'vertical-news')
        await expect(
          standalone.getByRole('link', { name: 'Demo brand marks and attribution', exact: true })
        ).toHaveAttribute('href', 'https://samline.github.io/ticker/attribution/')
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
      if (id === 'drag-playback')
        await checkDragModes(standalone, standalone.locator('.ticker-recipe'))
      if (id === 'featured-menu' || id === 'featured-logo')
        await checkFeaturedControls(standalone, standalone.locator('.ticker-recipe'))
      if (id === 'manual-navigation')
        await checkReadingInterval(standalone, standalone.locator('.ticker-recipe'))
      await checkCachedPageLifecycle(standalone)
      // The same example must also run when copied into three independent files.
      const splitHtml =
        mode === 'Package / ESM'
          ? files.HTML.replace(
              '</head>',
              '<link rel="stylesheet" href="https://example.test/style.css"></head>'
            )
          : files.HTML
      const splitJs =
        mode === 'Package / ESM'
          ? files.JavaScript.replace(
              /from ['"]@samline\/ticker['"]/g,
              "from 'https://example.test/module.js'"
            ).replace(/import ['"]@samline\/ticker\/style.css['"];?/g, '')
          : files.JavaScript
      await standalone.route('https://recipe.test/**', route => {
        const path = new URL(route.request().url()).pathname
        return route.fulfill({
          body: path.endsWith('main.js')
            ? splitJs
            : path.endsWith('style.css')
              ? files.CSS
              : splitHtml,
          contentType: path.endsWith('.js')
            ? 'text/javascript'
            : path.endsWith('.css')
              ? 'text/css'
              : 'text/html',
        })
      })
      await standalone.goto('https://recipe.test/index.html')
      await expect(standalone.locator('.ticker-wrapper[data-ready=true]')).toHaveCount(
        id === 'opposite-rows' || id === 'constant-speed' ? 2 : 1
      )
      if (id === 'manual-navigation')
        await standalone.getByRole('button', { name: 'Play animation', exact: true }).click()
      await standalone.getByRole('button', { name: 'Pause animation', exact: true }).click()
      await expect(standalone.locator('button[data-pause]')).toHaveText('Play animation')
      if (id === 'featured-menu') {
        await expect(standalone.locator('.ticker-featured')).toHaveText('Overview')
        await standalone
          .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
          .first()
          .focus()
        await standalone
          .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
          .first()
          .click()
        await expect(standalone.locator('.ticker-featured')).toHaveText('Components')
        await expect(standalone.locator('.ticker-featured')).toHaveCount(1)
        await checkRepeatedCategory(standalone.locator('.ticker-recipe'))
      }
      if (id === 'featured-logo') {
        await expect(standalone.locator('.ticker-featured strong')).toHaveText('Vite')
        await expect(standalone.locator('.ticker-clone [data-featured]')).toHaveCount(0)
      }
      if (id === 'dynamic-content') {
        const originals = standalone.locator(
          '[data-row]:not(.ticker-clone [data-row]) [data-example-item]'
        )
        await standalone
          .getByRole('combobox', { name: 'Choose an item', exact: true })
          .selectOption('item-1')
        await standalone.getByRole('button', { name: 'Remove selected', exact: true }).click()
        await expect(originals).toHaveText(['Project created', 'Ready to ship'])
        await standalone
          .getByRole('combobox', { name: 'Choose a position', exact: true })
          .selectOption({ value: '1' })
        await standalone.getByRole('button', { name: 'Remove at position', exact: true }).click()
        await expect(originals).toHaveText(['Project created'])
        await expect(standalone.locator('.ticker-clone [data-example-item="item-2"]')).toHaveCount(
          0
        )
      }
      if (id === 'featured-menu' || id === 'featured-logo')
        await checkFeaturedControls(standalone, standalone.locator('.ticker-recipe'))
      if (id === 'manual-navigation')
        await checkReadingInterval(standalone, standalone.locator('.ticker-recipe'))
      await checkCachedPageLifecycle(standalone)
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
      (document.querySelector('#announcements .section-heading')!.getBoundingClientRect().top -
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
  await expect(recipe.locator('pre')).toHaveCount(8)
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
  await expect(studio.locator('ticker-demo[data-kind=news] .ticker-frame')).toHaveAttribute(
    'data-duration',
    '15'
  )
  await studio.locator('[data-tab=logos]').click()
  await expect(studio.locator('[data-panel=news]')).toBeHidden()
  await expect(studio.locator('[data-panel=logos]')).toBeVisible()
  await expect(speed).toHaveValue('48')
  await speed.press('End')
  await expect(studio.locator('ticker-demo[data-kind=logos] .ticker-frame')).toHaveAttribute(
    'data-duration',
    '60'
  )
  await expect(studio.locator('ticker-demo[data-kind=news] .ticker-frame')).toHaveAttribute(
    'data-duration',
    '15'
  )
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

test('brand attribution opens a readable page with sources and explicit Markdown downloads', async ({
  page,
}) => {
  await page.goto('examples/')
  await page.getByRole('link', { name: 'Demo brand marks and attribution', exact: true }).click()
  await expect(page).toHaveURL(/\/ticker\/attribution\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Demo brand marks and attribution'
  )
  await expect(
    page.getByText('The demo icons come from Simple Icons 16.0.0.', { exact: false })
  ).toBeVisible()
  await expect(page.locator('.attribution li')).toHaveCount(12)
  await expect(
    page.getByRole('link', { name: 'Download the bundled CC0 license (Markdown)', exact: true })
  ).toHaveAttribute('download', 'LICENSE.md')
  await expect(
    page.getByRole('link', { name: 'Download the bundled icon disclaimer (Markdown)', exact: true })
  ).toHaveAttribute('download', 'DISCLAIMER.md')
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => (document.documentElement.dataset.theme = theme), theme)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true
      )
    }
  }
  await page.getByRole('link', { name: 'Back to Ticker examples', exact: true }).click()
  await expect(page).toHaveURL(/\/ticker\/examples\/$/)
})

test('drag recipe switches resume behavior without clearing a manual pause', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('examples/#drag-playback')
  await checkDragModes(page, page.locator('#drag-playback'))
  expect(errors).toEqual([])
})

test('mixed RTL characters start in autoplay with inherited direction', async ({ page }) => {
  await page.goto('examples/')
  const recipe = page.locator('#rtl-content')
  const frame = recipe.locator('.ticker-wrapper')
  await expect(recipe.locator('ticker-demo')).toHaveAttribute('data-initialized', 'true')
  await page.evaluate(() => document.fonts.ready.then(() => undefined))
  await frame.scrollIntoViewIfNeeded()
  await page.mouse.move(5, 5)
  await expect(frame).toBeInViewport()
  await expect(frame).toHaveAttribute('data-autoplay', 'true')
  await expect(frame).toHaveAttribute('data-motion-direction', 'right')
  await expect(frame).toHaveAttribute('data-playing', 'true')
  await expect(
    recipe.getByRole('button', { name: 'Pause animation: RTL mixed content', exact: true })
  ).toBeVisible()
})

test('manual navigation preview holds the incoming card before resuming playback', async ({
  page,
}) => {
  await page.goto('examples/#manual-navigation')
  await page.evaluate(() => document.fonts.ready)
  const recipe = page.locator('#manual-navigation')
  await expect(recipe.locator('ticker-demo')).toHaveAttribute('data-initialized', 'true')
  await checkReadingInterval(page, recipe)
})

test('manual arrows reveal the entire incoming link outside both edge fades', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    for (const [width, textSize] of [
      [320, '100%'],
      [672, '100%'],
      [1440, '100%'],
      [672, '200%'],
      [1440, '200%'],
    ]) {
      await page.setViewportSize({ width: Number(width), height: 900 })
      await page.goto('examples/#manual-navigation')
      await page.evaluate(
        ({ theme, textSize }) => {
          document.documentElement.dataset.theme = theme
          document.documentElement.style.fontSize = String(textSize)
        },
        { theme, textSize }
      )
      const recipe = page.locator('#manual-navigation')
      await expect(recipe.locator('ticker-demo')).toHaveAttribute('data-initialized', 'true')
      await page.evaluate(() => document.fonts.ready)
      await expect
        .poll(() =>
          recipe.locator('.ticker-frame').evaluate(frame => {
            const content = frame.querySelector('.ticker-content:not(.ticker-clone)')!
            const track = frame.querySelector('.ticker-track')!
            const measured = parseFloat(
              (frame as HTMLElement).style.getPropertyValue('--ticker-distance')
            )
            return Math.abs(
              measured -
                content.getBoundingClientRect().width -
                parseFloat(getComputedStyle(track).columnGap)
            )
          })
        )
        .toBeLessThan(0.001)
      for (const forward of [true, true, true, true, false, false, false, false]) {
        const target = await recipe.locator('.ticker-frame').evaluate((frame, forward) => {
          const viewport = frame.getBoundingClientRect()
          // The actual decorative overlays, not the navigation implementation,
          // define the readable bounds used by this regression.
          const left = viewport.left + parseFloat(getComputedStyle(frame, '::before').width)
          const right = viewport.right - parseFloat(getComputedStyle(frame, '::after').width)
          const links = [...frame.querySelectorAll('.ticker-content > a')].map(link => ({
            text: link.textContent,
            left: link.getBoundingClientRect().left,
            right: link.getBoundingClientRect().right,
          }))
          const incoming = links
            .filter(link => (forward ? link.right > right + 0.5 : link.left < left - 0.5))
            .sort((a, b) => (forward ? a.right - b.right : b.left - a.left))[0]
          return incoming?.text
        }, forward)
        expect(target).toBeTruthy()
        await recipe
          .getByRole('button', { name: forward ? 'Next items' : 'Previous items', exact: true })
          .click()
        await expect
          .poll(
            () =>
              recipe.locator('.ticker-frame').evaluate(async (frame, target) => {
                const track = frame.querySelector('.ticker-track')!
                const before = getComputedStyle(track).transform
                // Wait for real frames: slow runners may not finish a 300ms step
                // within a fixed wall-clock delay after the click.
                await new Promise<void>(resolve =>
                  requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
                )
                const settled = before === getComputedStyle(track).transform
                const viewport = frame.getBoundingClientRect()
                const left = viewport.left + parseFloat(getComputedStyle(frame, '::before').width)
                const right = viewport.right - parseFloat(getComputedStyle(frame, '::after').width)
                const links = [...frame.querySelectorAll('.ticker-content > a')]
                  .filter(link => link.textContent === target)
                  .map(link => {
                    const r = link.getBoundingClientRect()
                    return { left: r.left, right: r.right, width: r.width }
                  })
                return {
                  settled,
                  left,
                  right,
                  links,
                  fits: links.some(r => r.left >= left - 0.5 && r.right <= right + 0.5),
                }
              }, target),
            { message: `${theme}/${width}/${textSize}/${forward}: ${target}`, intervals: [50, 100] }
          )
          .toMatchObject({ settled: true, fits: true })
      }
    }
  }
})

test('featured previews share Home components, preserve selection, and remain readable in both themes', async ({
  page,
  browser,
}, testInfo) => {
  await page.goto('./')
  await page.screenshot({ path: testInfo.outputPath('home.png') })
  await page.goto('docs/reference/configuration/#featured-items')
  await page.screenshot({ path: testInfo.outputPath('docs-featured.png') })
  await page.goto('examples/')
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => {
      document.documentElement.dataset.theme = theme
    }, theme)
    const menu = page.locator('#featured-menu')
    await menu.scrollIntoViewIfNeeded()
    const category = menu
      .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
      .first()
    await category.focus()
    const title = await category.textContent()
    await expect(category).toBeInViewport()
    await category.click()
    await expect(menu.locator('.ticker-featured')).toHaveText(title!.trim())
    await expect(menu.locator('.ticker-featured button')).toHaveAttribute('aria-pressed', 'true')
    await expect(menu.locator('.ticker-featured button')).toBeFocused()
    await menu
      .locator('ticker-demo')
      .screenshot({ path: testInfo.outputPath(`featured-menu-${theme}.png`) })
    await page.locator('#featured-logo').scrollIntoViewIfNeeded()
    await expect(page.locator('#featured-logo .ticker-featured .brand-logo')).toHaveCount(1)
    await page
      .locator('#featured-logo ticker-demo')
      .screenshot({ path: testInfo.outputPath(`featured-logo-${theme}.png`) })
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
      ).toBe(true)
    }
    await page.setViewportSize({ width: 320, height: 900 })
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '24px'
    })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true
    )
    await page.evaluate(() => {
      document.documentElement.style.fontSize = ''
    })
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('#featured-logo .ticker-featured')).toBeVisible()
  const context = await browser.newContext({ javaScriptEnabled: false })
  const fallback = await context.newPage()
  await fallback.goto('http://127.0.0.1:4324/ticker/examples/')
  await expect(fallback.locator('#featured-menu .ticker-content button')).toHaveCount(5)
  await expect(fallback.locator('#featured-logo .ticker-content .brand-logo')).toHaveCount(4)
  await context.close()
})

test('every gallery preview explains hover/focus pauses without overwriting manual intent', async ({
  page,
}) => {
  await page.goto('examples/')
  const demos = page.locator('ticker-demo')
  for (let i = 0; i < (await demos.count()); i++) {
    const demo = demos.nth(i)
    const frame = demo.locator('.ticker-frame')
    const pause = demo.locator('button[data-pause]')
    const status = demo.locator('[data-playback-status]')
    await frame.scrollIntoViewIfNeeded()
    if ((await pause.textContent())?.includes('Play')) await pause.click()
    await page.mouse.move(0, 0)
    await frame.hover()
    if ((await frame.getAttribute('data-pause-on-hover')) === 'true') {
      await expect(frame).toHaveAttribute('data-playing', 'false')
      await expect(status).toContainText('pointer')
      await expect(pause).toContainText('Pause')
    } else {
      await expect(frame).toHaveAttribute('data-playing', 'true')
      await expect(status).toBeEmpty()
    }
    await page.mouse.move(0, 0)
    await frame.focus()
    await expect(status).toContainText('focus')
    await expect(frame).toHaveAttribute('data-playing', 'false')
    await expect(pause).toContainText('Pause')
    await pause.click()
    await expect(pause).toContainText('Play')
    await expect(status).toBeEmpty()
    await frame.hover()
    await expect(frame).toHaveAttribute('data-playing', 'false')
    await pause.click()
    await page.mouse.move(0, 0)
    await expect(frame).toHaveAttribute('data-playing', 'true')
  }
})

test('featured selection keeps mouse playback, explains keyboard pauses, and exposes positions and drag', async ({
  page,
}) => {
  await page.goto('examples/#featured-menu')
  const menu = page.locator('#featured-menu')
  await menu.locator('.ticker-frame').scrollIntoViewIfNeeded()
  await menu.locator('.ticker-featured button').click()
  await expect(menu.locator('.ticker-frame')).toHaveAttribute('data-playing', 'true')
  const category = menu
    .locator('.ticker-content:not(.ticker-clone) button[data-example-feature]')
    .first()
  await category.focus()
  await expect(menu.locator('[data-playback-status]')).toContainText('focus')
  const label = await category.textContent()
  await category.press('Enter')
  await expect(menu.locator('[data-featured-selection]')).toHaveText(label!.trim())
  await expect(menu.locator('[data-featured-description]:not(button)')).not.toBeEmpty()
  const pause = menu.locator('button[data-pause]')
  const before = (await pause.boundingBox())!
  await pause.click()
  await expect(menu.locator('.ticker-frame')).toHaveAttribute('data-playing', 'false')
  await expect(pause).toContainText('Play')
  const after = (await pause.boundingBox())!
  expect(after.y).toBeCloseTo(before.y, 1)
  await checkFeaturedControls(page, menu)
  const logo = page.locator('#featured-logo')
  await expect(logo.locator('.ticker-featured .featured-badge')).toHaveText('Featured partner')
  await checkFeaturedControls(page, logo)
})

test('visible repeated featured categories respond to pointer selection on both axes', async ({
  page,
}) => {
  await page.goto('examples/#featured-menu')
  const menu = page.locator('#featured-menu')
  for (const axis of ['horizontal', 'vertical']) {
    await menu.locator(`button[data-example-featured-axis="${axis}"]`).click()
    await checkRepeatedCategory(menu)
  }
})
