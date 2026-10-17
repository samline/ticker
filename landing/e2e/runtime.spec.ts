import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

let script: string
let css: string

test.beforeAll(async () => {
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
        entry: fileURLToPath(new URL('../../src/browser/global.ts', import.meta.url)),
        name: 'RuntimeTests',
        formats: ['iife'],
      },
    },
  })
  const output = (Array.isArray(result) ? result[0] : result) as {
    output: { type: string; code?: string }[]
  }
  script = output.output.find(chunk => chunk.type === 'chunk')!.code!
  css = await readFile(new URL('../../src/style.css', import.meta.url), 'utf8')
})

async function setup(page: Page, options: Record<string, unknown> = {}, dir = 'ltr') {
  await page.setContent(`<style>${css}
    body { margin: 0; font: 16px/1.5 sans-serif; }
    #host { width: 320px; margin: 30px; }
    .ticker-wrapper[data-axis=vertical] { height: 101.25px; }
    .ticker-track, .ticker-content, #source { gap: 10.5px; }
    .ticker-content, #source { display: flex; width: max-content; }
    [data-axis=vertical] .ticker-content, [data-axis=vertical] #source { flex-direction: column; width: 100%; }
    #source > * { flex: none; padding: 5.25px; }
    button:focus-visible, input:focus-visible { outline: 2px solid blue; }
  </style><main><div id=host dir=${dir}><div id=source><a href=#one>العربية 123 ABC</a><button>עברית 456 XYZ</button><input aria-label=Message value="LTR 789"></div></div>
  <button id=previous aria-label=Previous>Previous</button><button id=next aria-label=Next>Next</button><label>Position<input id=rail type=range></label><button id=outside>Outside</button></main>`)
  await page.addScriptTag({ content: script })
  await page.evaluate(options => {
    const w = window as any
    w.events = []
    w.controller = w.Ticker.ticker('#source', options)
    for (const event of ['ready', 'measure', 'playback', 'update', 'navigate', 'destroy'])
      w.controller.on(event, (value: unknown) => w.events.push([event, value]))
    w.disconnect = w.controller.connectControls({
      previous: document.querySelector('#previous'),
      next: document.querySelector('#next'),
      rail: document.querySelector('#rail'),
      step: 75.25,
    })
  }, options)
  await expect(page.locator('.ticker-wrapper')).toHaveAttribute('data-ready', 'true')
}

const state = (page: Page) => page.evaluate(() => (window as any).controller.state)
const offset = (page: Page) =>
  page.locator('.ticker-track').evaluate(el => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(el).transform)
    return [matrix.m41, matrix.m42]
  })

for (const direction of ['left', 'right', 'up', 'down']) {
  test(`${direction}: exact distance, gap, speed, and continuity across updates and loop boundaries`, async ({
    page,
  }) => {
    await setup(page, { direction, speed: 40, autoplay: false })
    const initial = await state(page)
    const geometry = await page.locator('.ticker-content:not(.ticker-clone)').evaluate(
      (el, vertical) => {
        const rect = el.getBoundingClientRect()
        return vertical ? rect.height : rect.width
      },
      direction === 'up' || direction === 'down'
    )
    expect(initial.distance).toBeCloseTo(geometry + 10.5, 5)
    expect(initial.duration).toBeCloseTo(initial.distance / 40, 5)
    await page.evaluate(() => (window as any).controller.scrollTo(37.25))
    const before = await offset(page)
    await page.evaluate(() =>
      (window as any).controller.update({ duration: 7, speed: 80 }).refresh()
    )
    await page.waitForTimeout(60)
    const after = await offset(page)
    expect(after[direction === 'up' || direction === 'down' ? 1 : 0]).toBeCloseTo(
      before[direction === 'up' || direction === 'down' ? 1 : 0],
      3
    )
    expect((await state(page)).requested).toBe(false)
    // At the end and beginning of a cycle the repeated content occupies the
    // same physical positions (the sequence itself is translated one period).
    const edges = await page.evaluate(() => {
      const c = (window as any).controller
      const track = document.querySelector('.ticker-track')!
      const a = track.getAnimations()[0]
      const duration = Number(a.effect!.getComputedTiming().duration)
      a.currentTime = duration - 0.001
      const end = getComputedStyle(track).transform
      a.currentTime = duration + 0.001
      return { end, start: getComputedStyle(track).transform, distance: c.state.distance }
    })
    const matrices = await page.evaluate(edges => {
      const a = new DOMMatrixReadOnly(edges.end),
        b = new DOMMatrixReadOnly(edges.start)
      return Math.max(Math.abs(a.m41 - b.m41), Math.abs(a.m42 - b.m42))
    }, edges)
    expect(matrices).toBeCloseTo(initial.distance, 2)
    const coverage = await page.locator('.ticker-wrapper').evaluate(el => {
      const w = el.getBoundingClientRect(),
        t = el.querySelector('.ticker-track')!.getBoundingClientRect()
      return el.getAttribute('data-axis') === 'vertical'
        ? [t.top <= w.top, t.bottom >= w.bottom]
        : [t.left <= w.left, t.right >= w.right]
    })
    expect(coverage).toEqual([true, true])
  })
}

test('keyboard focus, hover and explicit pause compose without moving focus or resuming between children', async ({
  page,
}) => {
  await setup(page, { pauseOnHover: true, speed: 30 })
  await page.mouse.move(900, 500)
  await expect.poll(async () => (await state(page)).playing).toBe(true)
  await page.keyboard.press('Tab')
  await expect(page.locator('.ticker-content:not(.ticker-clone) #source a')).toBeFocused()
  await expect.poll(async () => (await state(page)).reasons).toContain('focus')
  await page.keyboard.press('Tab')
  await expect(page.locator('.ticker-content:not(.ticker-clone) #source button')).toBeFocused()
  const reasons = await page.evaluate(() =>
    (window as any).events
      .filter(([name]: any[]) => name === 'playback')
      .slice(-2)
      .map(([, value]: any[]) => value.playing)
  )
  expect(reasons.at(-1)).toBe(false)
  await page.evaluate(() => (window as any).controller.pause())
  await page.locator('#outside').focus()
  await page.locator('.ticker-wrapper').hover()
  await page.mouse.move(900, 500)
  expect((await state(page)).requested).toBe(false)
  expect((await state(page)).reasons).toContain('manual')
  await page.evaluate(() => {
    const c = (window as any).controller
    c.refresh().update({ speed: 45 })
  })
  await page.waitForTimeout(60)
  expect((await state(page)).playing).toBe(false)
  await expect(page.locator('.ticker-content:not(.ticker-clone) #source a')).toHaveCount(1)
  await expect(page.locator('.ticker-clone').first()).toHaveAttribute('aria-hidden', 'true')
})

test('controls, range keyboard, dragging, cyclic wrap and reduced motion leave the ticker paused', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await setup(page, { autoplay: false, navigation: true })
  await page.locator('#next').click()
  expect((await state(page)).position).toBeCloseTo(75.25)
  await page.locator('#previous').click()
  expect((await state(page)).position).toBeCloseTo(0)
  await page.locator('#rail').press('ArrowRight')
  expect((await state(page)).position).toBeCloseTo(75.25)
  await page.locator('#rail').press('Home')
  const box = (await page.locator('.ticker-wrapper').boundingBox())!
  await page.mouse.move(box.x + 200, box.y + 15)
  await page.mouse.down()
  await page.mouse.move(box.x + 150, box.y + 15, { steps: 5 })
  await page.mouse.up()
  expect((await state(page)).position).toBeCloseTo(50)
  expect((await state(page)).playing).toBe(false)
  await page.evaluate(() => (window as any).controller.play())
  expect((await state(page)).reasons).toContain('reduced-motion')
  expect((await offset(page))[0]).toBeCloseTo(-50)
  await page.evaluate(() => {
    const c = (window as any).controller
    c.scrollTo(c.state.distance + 12.5)
  })
  expect((await state(page)).position).toBeCloseTo(12.5)
  await page.evaluate(() => (window as any).controller.destroy())
  await expect(page.locator('.ticker-wrapper')).toHaveCount(0)
  await expect(page.locator('#source')).toHaveCount(1)
  await page.locator('#next').click()
  expect((await state(page)).destroyed).toBe(true)
})

for (const dir of ['ltr', 'rtl']) {
  test(`${dir}: auto direction, bidi text and logical previous/next`, async ({ page }) => {
    await setup(page, { direction: 'auto', navigation: true, autoplay: false }, dir)
    expect((await state(page)).direction).toBe(dir === 'rtl' ? 'right' : 'left')
    const text = await page.locator('.ticker-content:not(.ticker-clone) #source').textContent()
    await page.locator('#rail').press(dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight')
    expect((await state(page)).position).toBeCloseTo(75.25)
    expect(await page.locator('.ticker-content:not(.ticker-clone) #source').textContent()).toBe(
      text
    )
    const rect = await page.locator('.ticker-track').evaluate(el => ({
      left: el.getBoundingClientRect().left,
      right: el.getBoundingClientRect().right,
    }))
    const wrapper = (await page.locator('.ticker-wrapper').boundingBox())!
    expect(rect.left).toBeLessThanOrEqual(wrapper.x)
    expect(rect.right).toBeGreaterThanOrEqual(wrapper.x + wrapper.width)
    await page.evaluate(() => (window as any).controller.update({ direction: 'left' }))
    expect((await state(page)).direction).toBe('left')
  })
}

test('responsive rules apply in order, revert to updated base and retain explicit pause', async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 700 })
  await setup(page, {
    speed: 20,
    responsive: [
      { query: '(max-width: 800px)', options: { speed: 40, direction: 'up', autoplay: false } },
      { query: '(max-width: 500px)', options: { speed: 60 } },
    ],
  })
  await page.setViewportSize({ width: 700, height: 700 })
  await expect.poll(async () => (await state(page)).direction).toBe('up')
  await expect.poll(async () => (await state(page)).requested).toBe(false)
  await page.evaluate(() => (window as any).controller.pause().update({ speed: 25 }))
  await page.setViewportSize({ width: 400, height: 700 })
  await expect
    .poll(async () => {
      const s = await state(page)
      return s.distance / s.duration
    })
    .toBeCloseTo(60)
  await page.setViewportSize({ width: 900, height: 700 })
  await expect.poll(async () => (await state(page)).direction).toBe('left')
  await expect
    .poll(async () => {
      const s = await state(page)
      return s.distance / s.duration
    })
    .toBeCloseTo(25)
  expect((await state(page)).requested).toBe(false)
  await page.evaluate(() => (window as any).controller.destroy())
  await page.setViewportSize({ width: 400, height: 700 })
  await expect(page.locator('.ticker-clone')).toHaveCount(0)
})

test('touch gestures distinguish taps from drags and leave perpendicular page scrolling available', async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 600, height: 700 },
  })
  const page = await context.newPage()
  // Keep fragment navigation on an ordinary document URL in every platform.
  await page.route('https://ticker.test/runtime', route =>
    route.fulfill({ body: '<!doctype html><html></html>', contentType: 'text/html' })
  )
  await page.goto('https://ticker.test/runtime')
  await setup(page, { autoplay: false, navigation: true })
  await page.evaluate(() => {
    document.body.style.minHeight = '2400px'
  })
  // Verify a real tap before synthetic drag streams; a following touch stream
  // can otherwise race Chromium's synthesized click from the previous one.
  const link = page.locator('.ticker-content:not(.ticker-clone) a')
  await link.tap()
  await expect(page).toHaveURL(/#one$/)
  await page.evaluate(() => {
    document
      .querySelector('.ticker-content:not(.ticker-clone) a')!
      .setAttribute('href', '#drag-target')
  })
  const cdp = await context.newCDPSession(page)
  const box = (await page.locator('.ticker-wrapper').boundingBox())!
  const x = box.x + 100,
    y = box.y + 15
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let i = 1; i <= 6; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x - i * 12, y }],
    })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  expect((await state(page)).position).toBeCloseTo(72)
  expect((await state(page)).requested).toBe(false)
  await page.evaluate(() => (window as any).controller.scrollTo(0))
  await expect(page).toHaveURL(/#one$/)
  const position = (await state(page)).position
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y: y + 10 }],
  })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x, y: y + 10 - i * 5 }],
    })
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  expect((await state(page)).position).toBeCloseTo(position)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
  await context.close()
})

test('ready/measure ordering, late subscriptions, images and content changes retain constant speed', async ({
  page,
}) => {
  await setup(page, { speed: 40, autoplay: false })
  const initialEvents = await page.evaluate(() =>
    (window as any).events.map(([event]: any[]) => event)
  )
  expect(initialEvents.indexOf('ready')).toBeLessThan(initialEvents.indexOf('measure'))
  const previousDistance = (await state(page)).distance
  await page.evaluate(() => {
    const w = window as any
    w.lateReady = 0
    w.controller.on('ready', () => w.lateReady++)
    const item = document.createElement('span')
    item.textContent = 'A much longer update with variable length and numbers 12345'
    w.controller.source.append(item)
    w.controller.refresh()
  })
  await expect.poll(async () => (await state(page)).distance).toBeGreaterThan(previousDistance)
  const resized = await state(page)
  expect(resized.distance / resized.duration).toBeCloseTo(40)
  expect(await page.evaluate(() => (window as any).lateReady)).toBe(0)
  await page.evaluate(() => {
    const image = document.createElement('img')
    image.alt = 'Loaded logo'
    image.src =
      'data:image/svg+xml,' +
      encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="24"></svg>')
    ;(window as any).controller.source.append(image)
  })
  await expect.poll(async () => (await state(page)).distance).toBeGreaterThan(resized.distance)
  const loaded = await state(page)
  expect(loaded.distance / loaded.duration).toBeCloseTo(40)
  await page.evaluate(() => (window as any).controller.destroy())
  const eventCount = await page.evaluate(() => (window as any).events.length)
  await page.setViewportSize({ width: 420, height: 700 })
  await page.waitForTimeout(180)
  expect(await page.evaluate(() => (window as any).events.length)).toBe(eventCount)
})
