import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'
import ts from 'typescript'

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

for (const resumeAfterDrag of [false, true]) {
  test(`drag release restores prior intent only with resumeAfterDrag=${resumeAfterDrag}`, async ({
    page,
  }) => {
    await setup(page, {
      navigation: true,
      resumeAfterDrag,
      pauseOnHover: true,
      pauseOnFocus: false,
    })
    const frame = page.locator('.ticker-wrapper')
    const box = (await frame.boundingBox())!
    const drag = async (during?: () => Promise<unknown>) => {
      await page.mouse.move(box.x + 100, box.y + 20)
      await page.mouse.down()
      await page.mouse.move(box.x + 40, box.y + 20, { steps: 4 })
      expect((await state(page)).requested).toBe(false)
      await during?.()
      await page.mouse.up()
      await page.mouse.move(5, 5)
    }
    await drag()
    expect((await state(page)).requested).toBe(resumeAfterDrag)
    expect((await state(page)).playing).toBe(resumeAfterDrag)
    await page.evaluate(() => (window as any).controller.pause())
    await drag()
    expect((await state(page)).requested).toBe(false)
    await page.evaluate(() => (window as any).controller.play())
    await drag(() => page.evaluate(() => (window as any).controller.pause()))
    expect((await state(page)).requested).toBe(false)
    await page.evaluate(() => (window as any).controller.play())
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    expect((await state(page)).requested).toBe(false)
    if (resumeAfterDrag) {
      await page.evaluate(() =>
        (window as any).controller.update({ pauseOnFocus: true }).scrollTo(0).play()
      )
      const link = page.locator('.ticker-content:not(.ticker-clone) a')
      await link.focus()
      await drag()
      await expect(link).toBeFocused()
      expect((await state(page)).requested).toBe(true)
      expect((await state(page)).reasons).toContain('focus')
      expect((await state(page)).playing).toBe(false)
    }
  })
}

test('resumeAfterDrag restores intent on pointer cancellation while reduced motion stays paused', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await setup(page, { navigation: true, resumeAfterDrag: true })
  const wrapper = page.locator('.ticker-wrapper')
  const box = (await wrapper.boundingBox())!
  for (const end of ['pointercancel', 'lostpointercapture']) {
    await page.mouse.move(box.x + 100, box.y + 20)
    await page.mouse.down()
    await page.mouse.move(box.x + 30, box.y + 20, { steps: 4 })
    expect((await state(page)).requested).toBe(false)
    await wrapper.dispatchEvent(end, { pointerId: 1 })
    expect((await state(page)).requested).toBe(true)
    expect((await state(page)).playing).toBe(false)
    await page.mouse.up()
  }
})

test('smooth arrow navigation retains autoplay, respects pause, and reports control intent', async ({
  page,
}) => {
  await setup(page, { navigation: true, pauseOnFocus: false, speed: 0.1 })
  await page.evaluate(() => {
    const w = window as any
    w.disconnect()
    w.disconnect = w.controller.connectControls({
      next: document.querySelector('#next'),
      step: 80,
      behavior: 'smooth',
      duration: 240,
      preservePlayback: true,
    })
  })
  await page.click('#next')
  await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(true)
  const start = (await state(page)).position
  await page.waitForTimeout(70)
  const middle = (await state(page)).position
  expect(middle).toBeGreaterThan(start)
  await expect.poll(async () => (await state(page)).playing).toBe(true)
  expect((await state(page)).requested).toBe(true)
  expect(
    await page.evaluate(
      () =>
        (window as any).events.filter((e: any[]) => e[0] === 'navigate').at(-1)[1].navigationSource
    )
  ).toBe('control')
  await page.evaluate(() => (window as any).controller.pause())
  await page.click('#next')
  await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
  expect((await state(page)).requested).toBe(false)
})

test('copied Astro host waits for deferred content, delegates clone actions and disposes its owner', async ({
  page,
}) => {
  const markdown = await readFile(
    new URL('../../docs/src/content/docs/guides/frameworks.mdx', import.meta.url),
    'utf8'
  )
  const host = [...markdown.matchAll(/```astro\n([\s\S]*?)\n```/g)].find(match =>
    match[1].includes('<ticker-feed')
  )![1]
  const client = host
    .match(/<script>([\s\S]*?)<\/script>/)![1]
    .replace(
      /import \{ ticker \} from ['"]@samline\/ticker['"]/g,
      'const ticker = window.Ticker.ticker'
    )
    .replace(/import ['"]@samline\/ticker\/style.css['"]/g, '')
  const styles = host.match(/<style is:global>([\s\S]*?)<\/style>/)![1]
  await page.setContent(
    `<style>${css} ${styles}</style><ticker-feed data-play="Play" data-pause="Pause"><button type="button" data-feed-toggle disabled>Pause</button><output data-feed-status></output></ticker-feed>`
  )
  await page.addScriptTag({ content: script })
  await page.addScriptTag({
    content: ts.transpileModule(client, { compilerOptions: { target: ts.ScriptTarget.ES2020 } })
      .outputText,
  })
  await expect(page.locator('[data-feed-toggle]')).toBeDisabled()
  await page
    .locator('ticker-feed')
    .evaluate(root =>
      root.insertAdjacentHTML(
        'afterbegin',
        '<div data-feed-source><button type="button" data-feed-select="one" data-message="Selected one">One</button><button type="button" data-feed-select="two" data-message="Selected two">Two</button></div>'
      )
    )
  await expect(page.locator('[data-feed-toggle]')).toBeEnabled()
  await expect(page.locator('.ticker-wrapper')).toHaveAttribute('data-ready', 'true')
  await page
    .locator('.ticker-clone [data-feed-select="two"]')
    .first()
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(page.locator('[data-feed-status]')).toHaveText('Selected two')
  await page.locator('[data-feed-toggle]').click()
  await expect(page.locator('[data-feed-toggle]')).toHaveText('Play')
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
  )
  await expect(page.locator('.ticker-wrapper')).toHaveCount(1)
  await page.evaluate(() =>
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false }))
  )
  await expect(page.locator('.ticker-wrapper')).toHaveCount(0)
  await expect(page.locator('[data-feed-source]')).toHaveCount(1)
})

for (const direction of ['left', 'right', 'up', 'down', 'auto']) {
  test(`${direction}: smooth steps wrap and explicit pause cancels without stale playback`, async ({
    page,
  }) => {
    await setup(
      page,
      { direction, autoplay: false, navigation: true },
      direction === 'auto' ? 'rtl' : 'ltr'
    )
    await page.evaluate(() => {
      const c = (window as any).controller
      c.scrollTo(c.state.distance - 5)
      c.scrollBy(20, { behavior: 'smooth', duration: 100, preservePlayback: true })
    })
    await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
    expect((await state(page)).position).toBeCloseTo(15, 2)
    expect((await state(page)).requested).toBe(false)
    await page.evaluate(() =>
      (window as any).controller.scrollBy(40, {
        behavior: 'smooth',
        duration: 500,
        preservePlayback: true,
      })
    )
    await page.waitForTimeout(60)
    await page.evaluate(() => (window as any).controller.pause())
    const paused = (await state(page)).position
    await page.waitForTimeout(550)
    expect((await state(page)).position).toBeCloseTo(paused, 3)
    expect((await state(page)).requested).toBe(false)
  })
}

for (const direction of ['left', 'right', 'up', 'down']) {
  test(`${direction}: reading delay holds the final card and restarts after rapid or slow clicks`, async ({
    page,
  }) => {
    await setup(page, { direction, autoplay: true, navigation: true, pauseOnHover: false })
    await page.evaluate(() => {
      const w = window as any
      w.disconnect()
      w.disconnect = w.controller.connectControls({
        previous: document.querySelector('#previous'),
        next: document.querySelector('#next'),
        step: 25,
        behavior: 'smooth',
        duration: 80,
        preservePlayback: true,
        resumeDelay: 600,
      })
    })
    await page.locator('#next').click()
    // Wait for motion completion, not autoplay resumption.
    await expect
      .poll(async () =>
        page.evaluate(() => (window as any).events.filter((e: any[]) => e[0] === 'navigate').length)
      )
      .toBe(1)
    const held = (await state(page)).position
    await page.waitForTimeout(160)
    expect((await state(page)).position).toBeCloseTo(held, 2)
    expect((await state(page)).playing).toBe(false)
    // A slow click during the reading interval and a rapid burst replace its timer.
    await page.locator('#next').click()
    await page.locator('#next').click()
    await page.locator('#previous').click()
    await expect
      .poll(async () =>
        page.evaluate(() => (window as any).events.filter((e: any[]) => e[0] === 'navigate').length)
      )
      .toBeGreaterThan(1)
    await page.waitForTimeout(150)
    const final = (await state(page)).position
    await page.waitForTimeout(160)
    expect((await state(page)).position).toBeCloseTo(final, 2)
    await expect.poll(async () => (await state(page)).playing).toBe(true)
    await page.evaluate(() => (window as any).controller.pause())
    await page.locator('#next').click()
    await page.waitForTimeout(850)
    expect(await state(page)).toMatchObject({ requested: false, playing: false })
    expect((await state(page)).reasons).not.toContain('navigation')
  })
}

for (const [direction, dir] of [
  ['left', 'ltr'],
  ['right', 'ltr'],
  ['left', 'rtl'],
  ['up', 'ltr'],
  ['down', 'ltr'],
]) {
  test(`${direction}/${dir}: item steps reveal partial items, cap groups and wrap`, async ({
    page,
  }) => {
    await setup(page, { direction, autoplay: false, navigation: true }, dir)
    await page.evaluate(() => {
      const w = window as any
      w.disconnect()
      const c = w.controller
      const vertical = c.element.dataset.axis === 'vertical'
      c.source.innerHTML = [80, 110, 60, 140]
        .map(
          (size, i) =>
            `<span style="flex:none;padding:0;${vertical ? 'height' : 'width'}:${size}px">${i}</span>`
        )
        .join('')
      c.element.style[vertical ? 'height' : 'width'] = '320px'
      c.refresh()
      w.connectItems = (count?: number, step?: number) => {
        w.disconnect?.()
        w.disconnect = c.connectControls({
          previous: document.querySelector('#previous'),
          next: document.querySelector('#next'),
          rail: document.querySelector('#rail'),
          behavior: 'instant',
          itemsPerStep: count,
          step,
        })
      }
    })
    await page.waitForTimeout(80)
    // Compare actual visible geometry, including clone instances, rather than
    // assuming animation direction or source order is the physical order.
    for (const count of [undefined, 1, 2, 3, 100, 0, 1.5, -2]) {
      for (const forward of [true, false]) {
        const result = await page.evaluate(
          ({ count, forward }) => {
            const w = window as any
            const c = w.controller
            c.scrollTo(17.25)
            w.connectItems(count)
            const viewport = c.element.getBoundingClientRect()
            const vertical = c.element.dataset.axis === 'vertical'
            const rtl = !vertical && getComputedStyle(c.element).direction === 'rtl'
            const extent = vertical ? viewport.height : viewport.width
            const period = c.state.distance
            const intervals = [...c.source.children]
              .flatMap((el: any) => {
                const r = el.getBoundingClientRect()
                let start = vertical
                  ? r.top - viewport.top
                  : rtl
                    ? viewport.right - r.right
                    : r.left - viewport.left
                let end = vertical
                  ? r.bottom - viewport.top
                  : rtl
                    ? viewport.right - r.left
                    : r.right - viewport.left
                if (!forward) [start, end] = [extent - end, extent - start]
                return Array.from({ length: 12 }, (_, i) => ({
                  start: start + (i - 4) * period,
                  end: end + (i - 4) * period,
                }))
              })
              .filter((r: any) => r.end > extent + 0.001)
              .sort((a: any, b: any) => a.end - b.end)
            const n = Number.isSafeInteger(count) && Number(count) > 0 ? Number(count) : 1
            const delta = Math.min(
              intervals[Math.min(n, intervals.length) - 1].end - extent,
              intervals[0].start
            )
            const expected = (((17.25 + (forward ? delta : -delta)) % period) + period) % period
            document.querySelector<HTMLButtonElement>(forward ? '#next' : '#previous')!.click()
            return { actual: c.state.position, expected }
          },
          { count, forward }
        )
        expect(
          Math.min(
            Math.abs(result.actual - result.expected),
            Math.abs(Math.abs(result.actual - result.expected) - (await state(page)).distance)
          ),
          JSON.stringify({ count, forward, result })
        ).toBeLessThan(0.001)
      }
    }
    await page.evaluate(() => {
      const w = window as any
      w.controller.scrollTo(0)
      w.connectItems(3, 25.5)
      document.querySelector<HTMLButtonElement>('#next')!.click()
    })
    expect((await state(page)).position).toBeCloseTo(25.5, 4)
  })
}

for (const direction of ['left', 'up', 'down']) {
  test(`${direction}: default item controls animate, keyboard follows items, reduced motion seeks instantly`, async ({
    page,
  }) => {
    await setup(page, { direction, autoplay: false, navigation: true })
    await page.evaluate(() => {
      const w = window as any
      w.disconnect()
      w.controller.connectControls({
        next: document.querySelector('#next'),
        rail: document.querySelector('#rail'),
      })
      document.querySelector<HTMLButtonElement>('#next')!.click()
    })
    expect((await state(page)).reasons).toContain('navigation')
    await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
    const first = (await state(page)).position
    await page.locator('#rail').press(direction === 'left' ? 'ArrowRight' : 'ArrowDown')
    expect((await state(page)).reasons).toContain('navigation')
    await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
    expect((await state(page)).position).not.toBeCloseTo(first, 2)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(80)
    await page.locator('#next').click()
    expect((await state(page)).reasons).not.toContain('navigation')
  })
}

for (const [direction, dir] of [
  ['left', 'ltr'],
  ['right', 'ltr'],
  ['auto', 'rtl'],
  ['up', 'ltr'],
  ['down', 'ltr'],
]) {
  test(`${direction}/${dir}: rapid item clicks and rail keys count every step and reverse immediately`, async ({
    page,
  }) => {
    await setup(page, { direction, autoplay: false, navigation: true }, dir)
    await page.evaluate(() => {
      const w = window as any
      const c = w.controller
      w.disconnect()
      const vertical = c.element.dataset.axis === 'vertical'
      c.source.innerHTML = [80, 110, 60, 140]
        .map(
          (size, i) =>
            `<span style="padding:0;flex:none;${vertical ? 'height' : 'width'}:${size}px">${i}</span>`
        )
        .join('')
      c.element.style[vertical ? 'height' : 'width'] = '320px'
      c.element.style[vertical ? 'scrollPaddingTop' : 'scrollPaddingLeft'] = '24px'
      c.element.style[vertical ? 'scrollPaddingBottom' : 'scrollPaddingRight'] = '32px'
      c.refresh()
      w.connectSteps = (behavior: string, itemsPerStep = 1) => {
        w.disconnect()
        w.disconnect = c.connectControls({
          previous: document.querySelector('#previous'),
          next: document.querySelector('#next'),
          rail: document.querySelector('#rail'),
          behavior,
          itemsPerStep,
          duration: 120,
          preservePlayback: true,
        })
      }
    })
    await expect.poll(async () => (await state(page)).distance).toBeCloseTo(432, 2)
    for (const count of [1, 3]) {
      for (const forward of [true, false]) {
        const expected = await page.evaluate(
          ({ count, forward }) => {
            const w = window as any
            w.controller.scrollTo(0)
            w.connectSteps('instant', count)
            const button = document.querySelector<HTMLButtonElement>(
              forward ? '#next' : '#previous'
            )!
            for (let i = 0; i < 7; i++) button.click()
            return w.controller.state.position
          },
          { count, forward }
        )
        const jumps = await page.evaluate(
          async ({ count, forward }) => {
            const w = window as any
            const c = w.controller
            c.scrollTo(0)
            w.connectSteps('smooth', count)
            const button = document.querySelector<HTMLButtonElement>(
              forward ? '#next' : '#previous'
            )!
            const vertical = c.element.dataset.axis === 'vertical'
            const rtl = c.element.dataset.writingDirection === 'rtl'
            const key = vertical
              ? forward
                ? 'ArrowDown'
                : 'ArrowUp'
              : forward !== rtl
                ? 'ArrowRight'
                : 'ArrowLeft'
            const jumps = []
            for (let i = 0; i < 7; i++) {
              const before = c.state.position
              if (count === 3)
                document
                  .querySelector('#rail')!
                  .dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
              else button.click()
              jumps.push(Math.abs(c.state.position - before))
              await new Promise<void>(resolve =>
                requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
              )
            }
            return jumps
          },
          { count, forward }
        )
        expect(Math.max(...jumps)).toBeLessThan(0.1)
        await expect
          .poll(async () => (await state(page)).reasons.includes('navigation'))
          .toBe(false)
        expect((await state(page)).position).toBeCloseTo(expected, 2)
        expect((await state(page)).requested).toBe(false)
      }
    }
    const reversed = await page.evaluate(async () => {
      const w = window as any
      const c = w.controller
      c.scrollTo(0)
      w.connectSteps('smooth')
      const rail = document.querySelector('#rail')!
      const vertical = c.element.dataset.axis === 'vertical'
      const forward = vertical
        ? 'ArrowDown'
        : c.element.dataset.writingDirection === 'rtl'
          ? 'ArrowLeft'
          : 'ArrowRight'
      for (let i = 0; i < 3; i++)
        rail.dispatchEvent(new KeyboardEvent('keydown', { key: forward, bubbles: true }))
      await new Promise<void>(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
      const visible = c.state.position
      document.querySelector<HTMLButtonElement>('#previous')!.click()
      return { visible, after: c.state.position }
    })
    expect(reversed.after).toBeCloseTo(reversed.visible, 2)
    await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
    const actual = (await state(page)).position
    const expected = await page.evaluate(visible => {
      const w = window as any
      w.controller.scrollTo(visible)
      w.connectSteps('instant')
      document.querySelector<HTMLButtonElement>('#previous')!.click()
      return w.controller.state.position
    }, reversed.visible)
    expect(actual).toBeCloseTo(expected, 2)
  })
}

test('item stepping skips decorations, measures updates, handles oversized and empty sources', async ({
  page,
}) => {
  await setup(page, { autoplay: false, navigation: true })
  await page.evaluate(() => {
    const w = window as any
    w.disconnect()
    w.controller.source.innerHTML =
      '<span style="width:100px;padding:0;flex:none">A</span><span aria-hidden="true" style="width:40px;padding:0;flex:none">·</span><span style="width:450px;padding:0;flex:none">B</span>'
    w.controller.refresh()
    w.controller.connectControls({
      next: document.querySelector('#next'),
      behavior: 'instant',
      itemsPerStep: 3,
    })
  })
  await page.waitForTimeout(80)
  await page.evaluate(() => (window as any).controller.scrollTo(0))
  await page.locator('#next').click()
  // 100 + 10.5 + decoration 40 + 10.5 + oversized 450 - viewport 320.
  expect((await state(page)).position).toBeCloseTo(291, 4)
  await page.evaluate(() => {
    const c = (window as any).controller
    c.source.replaceChildren()
    c.refresh()
  })
  await page.waitForTimeout(80)
  await page.locator('#next').click()
  expect((await state(page)).position).toBe(0)
  expect((await state(page)).ready).toBe(false)
})

for (const [direction, dir] of [
  ['left', 'ltr'],
  ['right', 'ltr'],
  ['auto', 'rtl'],
  ['up', 'ltr'],
  ['down', 'ltr'],
]) {
  test(`${direction}/${dir}: item navigation respects borders and asymmetric scroll padding`, async ({
    page,
  }) => {
    await setup(page, { direction, autoplay: false, navigation: true }, dir)
    await page.evaluate(() => {
      const w = window as any
      w.disconnect()
      const c = w.controller
      const vertical = c.element.dataset.axis === 'vertical'
      c.source.innerHTML = [80, 110, 60, 140]
        .map(
          (size, i) =>
            `<span style="padding:0;flex:none;${vertical ? 'height' : 'width'}:${size}px">item-${i}</span>`
        )
        .join('')
      c.element.style[vertical ? 'height' : 'width'] = '320px'
      c.element.style.border = '2px solid'
      c.element.style.scrollPadding = vertical ? '10% 0px 24px' : '0px 10% 0px 24px'
      c.refresh()
      c.connectControls({
        previous: document.querySelector('#previous'),
        next: document.querySelector('#next'),
      })
    })
    await page.waitForTimeout(80)
    for (const forward of [true, true, true, false, false, false]) {
      const target = await page.evaluate(forward => {
        const c = (window as any).controller
        const frame = c.element
        const rect = frame.getBoundingClientRect()
        const vertical = frame.dataset.axis === 'vertical'
        const rtl = !vertical && getComputedStyle(frame).direction === 'rtl'
        const low = (vertical ? rect.top : rect.left) + 2 + (vertical ? 32 : 24)
        const high = (vertical ? rect.bottom : rect.right) - 2 - (vertical ? 24 : 32)
        const descending = forward === rtl
        const candidates = [...frame.querySelectorAll('.ticker-content span')]
          .map((item: any) => {
            const r = item.getBoundingClientRect()
            return {
              text: item.textContent,
              start: vertical ? r.top : r.left,
              end: vertical ? r.bottom : r.right,
            }
          })
          .filter((r: any) => (descending ? r.start < low - 0.5 : r.end > high + 0.5))
          .sort((a: any, b: any) => (descending ? b.start - a.start : a.end - b.end))
        return candidates[0]?.text
      }, forward)
      expect(target).toBeTruthy()
      await page.locator(forward ? '#next' : '#previous').click()
      await expect.poll(async () => (await state(page)).reasons.includes('navigation')).toBe(false)
      expect(
        await page.evaluate(target => {
          const c = (window as any).controller
          const rect = c.element.getBoundingClientRect()
          const vertical = c.element.dataset.axis === 'vertical'
          const low = (vertical ? rect.top : rect.left) + 2 + (vertical ? 32 : 24)
          const high = (vertical ? rect.bottom : rect.right) - 2 - (vertical ? 24 : 32)
          return [...c.element.querySelectorAll('.ticker-content span')].some((item: any) => {
            const r = item.getBoundingClientRect()
            return (
              item.textContent === target &&
              (vertical ? r.top : r.left) >= low - 0.5 &&
              (vertical ? r.bottom : r.right) <= high + 0.5
            )
          })
        }, target)
      ).toBe(true)
    }
  })
}

test('removes a desired original by stable identifier and current item position, then refreshes clones', async ({
  page,
}) => {
  await setup(page, { autoplay: false, navigation: true })
  await page.evaluate(() => {
    const c = (window as any).controller
    c.source.innerHTML = ['a', 'b', 'c', 'd']
      .map(id => `<span data-item-id="${id}" style="padding:0;flex:none;width:90px">${id}</span>`)
      .join('')
    c.refresh()
  })
  await page.waitForTimeout(80)
  await page.evaluate(() => {
    const c = (window as any).controller
    c.source.querySelector('[data-item-id="b"]')?.remove()
    c.refresh()
  })
  await expect(page.locator('.ticker-content:not(.ticker-clone) [data-item-id]')).toHaveText([
    'a',
    'c',
    'd',
  ])
  await expect(page.locator('.ticker-clone [data-item-id="b"]')).toHaveCount(0)
  await page.evaluate(() => {
    const c = (window as any).controller
    // Zero-based index among current items; decoration is not included.
    c.source.querySelectorAll('[data-item-id]')[1]?.remove()
    c.refresh()
  })
  await expect(page.locator('.ticker-content:not(.ticker-clone) [data-item-id]')).toHaveText([
    'a',
    'd',
  ])
  await expect(page.locator('.ticker-clone [data-item-id="c"]')).toHaveCount(0)
  await expect.poll(async () => (await state(page)).distance).toBeCloseTo(201, 4)
})

test('features one original, replaces it without losing identity/focus, and restores authored order', async ({
  page,
}) => {
  await setup(page, { autoplay: false, featuredPosition: 'left' })
  await page.evaluate(() => {
    const w = window as any
    const items = [...w.controller.source.children]
    w.originalItems = items
    items[0].setAttribute('data-featured', '')
    items[1].setAttribute('data-featured', '')
    w.controller.refresh()
  })
  await expect(page.locator('.ticker-featured')).toHaveCount(1)
  await expect(page.locator('.ticker-featured a')).toHaveCount(1)
  expect(await page.locator('.ticker-clone a').count()).toBe(0)
  const fixed = await page.locator('.ticker-featured').boundingBox()
  await page.evaluate(() => (window as any).controller.scrollBy(50))
  const after = await page.locator('.ticker-featured').boundingBox()
  expect(after!.x).toBeCloseTo(fixed!.x, 1)
  await page.evaluate(() => {
    const w = window as any
    const button = w.originalItems[1]
    button.focus()
    w.controller.setFeatured(button)
  })
  await expect(page.locator('.ticker-featured button')).toBeFocused()
  expect(
    await page.evaluate(
      () => (window as any).controller.featured === (window as any).originalItems[1]
    )
  ).toBe(true)
  expect(await page.locator('.ticker-clone button').count()).toBe(0)
  await page.evaluate(() => (window as any).controller.setFeatured(null))
  await expect(page.locator('.ticker-featured')).toHaveCount(0)
  await page.evaluate(() => (window as any).controller.destroy())
  expect(
    await page.evaluate(() =>
      [...document.querySelector('#source')!.children].every(
        (item, i) => item === (window as any).originalItems[i]
      )
    )
  ).toBe(true)
})

test('aligns featured items in both axes and writing directions and keeps them fixed during playback', async ({
  page,
}) => {
  for (const dir of ['ltr', 'rtl']) {
    for (const direction of ['left', 'right', 'up', 'down']) {
      await setup(page, { direction, autoplay: false }, dir)
      await page.evaluate(() =>
        (window as any).controller.setFeatured((window as any).controller.source.firstElementChild)
      )
      const vertical = direction === 'up' || direction === 'down'
      for (const position of [
        'start',
        'center',
        'end',
        ...(vertical ? ['top', 'bottom'] : ['left', 'right']),
      ]) {
        await page.evaluate(
          position => (window as any).controller.update({ featuredPosition: position }),
          position
        )
        await expect(page.locator('.ticker-wrapper')).toHaveAttribute(
          'data-featured-position',
          position
        )
        const wrapper = (await page.locator('.ticker-wrapper').boundingBox())!
        const featured = (await page.locator('.ticker-featured').boundingBox())!
        const from = vertical ? featured.y - wrapper.y : featured.x - wrapper.x
        const free = vertical ? wrapper.height - featured.height : wrapper.width - featured.width
        const end =
          position === 'bottom' ||
          position === 'right' ||
          (position === 'end' && (vertical || dir === 'ltr')) ||
          (position === 'start' && !vertical && dir === 'rtl')
        const expected = position === 'center' ? free / 2 : end ? free : 0
        expect(from, `${dir}/${direction}/${position}`).toBeCloseTo(expected, 0)
      }
      const before = (await page.locator('.ticker-featured').boundingBox())!
      await page.evaluate(() => (window as any).controller.play())
      await expect.poll(() => offset(page)).not.toBe(0)
      const after = (await page.locator('.ticker-featured').boundingBox())!
      expect(after.x).toBeCloseTo(before.x, 1)
      expect(after.y).toBeCloseTo(before.y, 1)
      await page.evaluate(() => (window as any).controller.destroy())
    }
  }
})

test('reveals keyboard focus outside the featured overlay, ignores featured drag, and respects reduced motion', async ({
  page,
}) => {
  await setup(page, { navigation: true, autoplay: false, featuredPosition: 'left' })
  await page.evaluate(() => {
    const w = window as any
    w.controller.setFeatured(w.controller.source.firstElementChild)
    w.controller.scrollTo(0)
  })
  await page.locator('.ticker-content:not(.ticker-clone) #source button').focus()
  const overlay = (await page.locator('.ticker-featured').boundingBox())!
  const button = (await page
    .locator('.ticker-content:not(.ticker-clone) #source button')
    .boundingBox())!
  expect(button.x).toBeGreaterThanOrEqual(overlay.x + overlay.width - 1)
  const before = await state(page)
  await page.mouse.move(overlay.x + 5, overlay.y + 5)
  await page.mouse.down()
  await page.mouse.move(overlay.x + 65, overlay.y + 5, { steps: 5 })
  await page.mouse.up()
  expect((await state(page)).position).toBeCloseTo(before.position, 1)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.evaluate(() => (window as any).controller.play())
  expect((await state(page)).playing).toBe(false)
  await expect(page.locator('.ticker-featured a')).toBeVisible()
})

test('keeps focused originals in an uncovered segment across cycle boundaries on either axis and in RTL', async ({
  page,
}) => {
  for (const dir of ['ltr', 'rtl']) {
    for (const direction of ['left', 'right', 'up', 'down']) {
      await setup(page, { direction, autoplay: false, featuredPosition: 'start' }, dir)
      await page.evaluate(() => {
        const w = window as any
        w.controller.setFeatured(w.controller.source.firstElementChild)
        w.controller.scrollTo(w.controller.state.distance - 1)
      })
      for (const selector of ['button', 'input', 'button']) {
        const original = page.locator(`.ticker-content:not(.ticker-clone) #source ${selector}`)
        await original.focus()
        await page.evaluate(() => {
          ;(window as any).controller.refresh()
          return new Promise<void>(resolve => requestAnimationFrame(() => resolve()))
        })
        await expect(original).toBeFocused()
        const feature = (await page.locator('.ticker-featured').boundingBox())!
        const item = (await original.boundingBox())!
        const wrapper = (await page.locator('.ticker-wrapper').boundingBox())!
        if (direction === 'up' || direction === 'down') {
          expect(item.y, `${direction}/${dir}`).toBeGreaterThanOrEqual(
            feature.y + feature.height - 1
          )
          expect(item.y + item.height).toBeLessThanOrEqual(wrapper.y + wrapper.height + 1)
        } else if (dir === 'ltr') {
          expect(item.x).toBeGreaterThanOrEqual(feature.x + feature.width - 1)
          expect(item.x + item.width).toBeLessThanOrEqual(wrapper.x + wrapper.width + 1)
        } else {
          expect(item.x + item.width).toBeLessThanOrEqual(feature.x + 1)
          expect(item.x).toBeGreaterThanOrEqual(wrapper.x - 1)
        }
      }
      await page.evaluate(() => (window as any).controller.destroy())
    }
  }
})
