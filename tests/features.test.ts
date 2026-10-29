import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { TickerOptions } from '../src/core/types'

let media: Map<
  string,
  EventTarget & { matches: boolean; addEventListener: any; removeEventListener: any }
>
beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
  media = new Map()
  vi.stubGlobal('matchMedia', (query: string) => {
    if (!media.has(query)) {
      const target = Object.assign(new EventTarget(), { matches: false })
      vi.spyOn(target, 'addEventListener')
      vi.spyOn(target, 'removeEventListener')
      media.set(query, target)
    }
    return media.get(query)
  })
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(0), 16)
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  vi.stubGlobal('IntersectionObserver', undefined)
  vi.stubGlobal('ResizeObserver', undefined)
  document.body.innerHTML =
    '<div id="host"><div id="source">News</div></div><button id="prev">Previous</button><button id="next">Next</button><input type="range" id="rail" aria-label="Position">'
})
afterEach(async () => {
  ;(await import('../src/vanilla/render')).unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
async function create(options: TickerOptions = {}) {
  const c = (await import('../src/vanilla/render')).ticker('#source', options)!
  const content = c.element!.querySelector<HTMLElement>('.ticker-content')!
  vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
    width: 100.25,
    height: 80.5,
  } as DOMRect)
  vi.spyOn(c.element!, 'getBoundingClientRect').mockReturnValue({
    width: 200,
    height: 150,
  } as DOMRect)
  vi.advanceTimersByTime(16)
  return c
}

describe('extended controller', () => {
  it.each(['left', 'up'] as const)(
    'keeps an empty %s source clone-free despite track gaps and recovers after insertion',
    async direction => {
      const c = await create({ direction, speed: 40 })
      const content = c.element!.querySelector<HTMLElement>('.ticker-content')!
      c.element!.querySelector<HTMLElement>('.ticker-track')!.style.gap = '10px'
      c.pause()
      vi.mocked(content.getBoundingClientRect).mockReturnValue({ width: 0, height: 0 } as DOMRect)
      c.source.replaceChildren()
      c.refresh()
      vi.advanceTimersByTime(16)
      expect(c.element!.querySelectorAll('.ticker-clone')).toHaveLength(0)
      expect(c.state).toMatchObject({ ready: false, playing: false, position: 0, distance: 0 })
      c.source.textContent = 'Restored item'
      vi.mocked(content.getBoundingClientRect).mockReturnValue({
        width: 100,
        height: 80,
      } as DOMRect)
      c.refresh()
      vi.advanceTimersByTime(16)
      expect(c.state.ready).toBe(true)
      expect(c.state.requested).toBe(false)
      expect(c.state.distance / c.state.duration).toBe(40)
      expect(c.element!.querySelector('.ticker-clone')?.textContent).toBe('Restored item')
    }
  )
  it('normalizes speed, keeps duration fallback, returns independent options, and supports every axis', async () => {
    const c = await create({ speed: 50, duration: 9 })
    expect(c.state.duration).toBe(100.25 / 50)
    c.update({ speed: NaN, direction: 'up' })
    vi.advanceTimersByTime(16)
    expect(c.options.speed).toBe(0)
    expect(c.state.duration).toBe(9)
    expect(c.state.distance).toBe(80.5)
    c.update({ speed: -5, direction: 'down' })
    vi.advanceTimersByTime(16)
    expect(c.state.direction).toBe('down')
    expect(c.options.pauseOnFocus).toBe(true)
    expect(c.options.resumeAfterDrag).toBe(false)
    c.update({ resumeAfterDrag: true })
    expect(c.options.resumeAfterDrag).toBe(true)
    const options = c.options
    expect(options).not.toBe(c.options)
  })
  it('emits ordered, cancellable real changes; no replay; destroy is terminal and reentry is safe', async () => {
    const c = await create({ autoplay: false })
    const events: string[] = []
    const off = c.on('playback', () => events.push('playback'))
    c.play().play().pause().pause()
    expect(events).toEqual(['playback', 'playback'])
    off()
    c.play()
    expect(events).toHaveLength(2)
    const update = vi.fn()
    c.on('update', update)
    c.update({ speed: 30 }).update({ speed: 30 })
    expect(update).toHaveBeenCalledTimes(1)
    const late = vi.fn()
    c.on('ready', late)
    expect(late).not.toHaveBeenCalled()
    const second = vi.fn()
    c.on('navigate', () => c.destroy())
    c.on('navigate', second)
    const destroyed = vi.fn()
    c.on('destroy', destroyed)
    c.scrollBy(10)
    expect(second).not.toHaveBeenCalled()
    expect(destroyed).toHaveBeenCalledOnce()
    c.destroy()
    c.play().pause().update({ autoplay: true }).scrollBy(1).refresh()
    expect(destroyed).toHaveBeenCalledOnce()
    expect(c.state.destroyed).toBe(true)
    expect(c.state.playing).toBe(false)
    expect(c.element).toBeNull()
  })
  it('applies viewport rules in order, restores updated base, and cleans media listeners', async () => {
    const c = await create({
      duration: 12,
      responsive: [
        { query: '(max-width: 800px)', options: { duration: 8, autoplay: false } },
        { query: '(max-width: 500px)', options: { duration: 5 } },
      ],
    })
    const change = (query: string, value: boolean) => {
      const m = media.get(query)!
      m.matches = value
      m.dispatchEvent(new Event('change'))
      vi.advanceTimersByTime(16)
    }
    change('(max-width: 800px)', true)
    expect(c.state.duration).toBe(8)
    expect(c.state.requested).toBe(false)
    c.pause().update({ duration: 15 })
    change('(max-width: 500px)', true)
    expect(c.state.duration).toBe(5)
    change('(max-width: 800px)', false)
    change('(max-width: 500px)', false)
    expect(c.state.duration).toBe(15)
    expect(c.state.requested).toBe(false)
    c.destroy()
    for (const query of ['(max-width: 800px)', '(max-width: 500px)']) {
      expect(media.get(query)!.removeEventListener.mock.calls.length).toBe(
        media.get(query)!.addEventListener.mock.calls.length
      )
    }
  })
  it('connects native controls with cyclic positions and releases controls on disconnect/destroy', async () => {
    const c = await create()
    const rail = document.querySelector<HTMLInputElement>('#rail')!
    const next = document.querySelector<HTMLButtonElement>('#next')!
    const previous = document.querySelector<HTMLButtonElement>('#prev')!
    const disconnect = c.connectControls({ rail, next, previous, step: 40 })
    next.click()
    expect(c.state.position).toBe(40)
    expect(c.state.requested).toBe(false)
    previous.click()
    expect(c.state.position).toBe(0)
    c.scrollTo(201)
    expect(c.state.position).toBe(0.5)
    rail.value = '50.125'
    rail.dispatchEvent(new Event('input'))
    expect(c.state.position).toBe(50.125)
    rail.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(c.state.position).toBe(90.125)
    rail.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }))
    expect(c.state.position).toBeCloseTo(100.249)
    rail.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }))
    expect(c.state.position).toBe(0)
    disconnect()
    disconnect()
    next.click()
    expect(c.state.position).toBe(0)
    c.connectControls({ next })
    c.destroy()
    next.click()
    expect(rail.getAttribute('max')).toBeNull()
  })
  it('reads declarative configuration including responsive JSON and initially paused focus policy', async () => {
    const { ticker, mount } = await import('../src/vanilla/render')
    document.body.innerHTML = `<div class="ticker-wrapper" data-ticker data-direction="up" data-autoplay="false" data-speed="35" data-pause-on-focus="false" data-navigation="true" data-resume-after-drag="true" data-responsive='[{"query":"(max-width: 500px)","options":{"speed":60}}]'><div class="ticker-track"><div class="ticker-content">News</div></div></div>`
    const c = ticker('.ticker-wrapper')!
    expect(c.options).toMatchObject({
      direction: 'up',
      autoplay: false,
      speed: 35,
      pauseOnFocus: false,
      navigation: true,
      resumeAfterDrag: true,
    })
    expect(c.options.responsive).toHaveLength(1)
    c.destroy()
    mount()
    document.dispatchEvent(new Event('DOMContentLoaded'))
    expect(media.get('(max-width: 500px)')!.addEventListener).toHaveBeenCalled()
  })
  it('restores source descendants when enhancing an existing content container', async () => {
    const { ticker } = await import('../src/vanilla/render')
    document.body.innerHTML =
      '<article id="source"><header>Heading</header><div class="ticker-content"><a href="#">Story</a></div><footer>Footer</footer></article>'
    const source = document.querySelector('#source')!
    const original = source.innerHTML
    const link = source.querySelector('a')!
    const c = ticker('#source')!
    c.destroy()
    expect(source.querySelector('a')).toBe(link)
    expect(source.innerHTML).toBe(original)
  })
})

describe('item navigation decisions', () => {
  const fixture = async (
    direction: 'left' | 'up' | 'auto' = 'left',
    sizes = [80, 110, 60, 140]
  ) => {
    const c = await create({ direction, autoplay: false, navigation: true })
    const wrapper = c.element!
    const vertical = direction === 'up'
    const rtl = direction === 'auto'
    if (rtl) wrapper.dir = 'rtl'
    const period = sizes.reduce((sum, size) => sum + size + 10, 0)
    const rect = (start: number, size: number, cross = 320): DOMRect =>
      ({
        left: vertical ? 0 : start,
        right: vertical ? cross : start + size,
        top: vertical ? start : 0,
        bottom: vertical ? start + size : cross,
        width: vertical ? cross : size,
        height: vertical ? size : cross,
      }) as DOMRect
    vi.mocked(wrapper.getBoundingClientRect).mockReturnValue(rect(0, 324))
    wrapper.style.border = '2px solid'
    wrapper.style[vertical ? 'scrollPaddingTop' : 'scrollPaddingLeft'] = '24px'
    wrapper.style[vertical ? 'scrollPaddingBottom' : 'scrollPaddingRight'] = '10%'
    const content = wrapper.querySelector<HTMLElement>('.ticker-content')!
    vi.mocked(content.getBoundingClientRect).mockReturnValue(rect(0, period - 10))
    wrapper.querySelector<HTMLElement>('.ticker-track')!.style.gap = '10px'
    let start = 0
    const children = sizes.map(size => {
      const item = document.createElement('span')
      const base = rtl ? period - 10 - start - size : start
      start += size + 10
      vi.spyOn(item, 'getBoundingClientRect').mockImplementation(() => {
        const position = c.state.position
        const offset = rtl ? (period - position) % period : position
        return rect(2 + base - offset, size)
      })
      return item
    })
    c.source.replaceChildren(...children)
    c.refresh()
    vi.advanceTimersByTime(16)
    return { c, wrapper, children, period }
  }

  it.each([
    [undefined, 132],
    [1, 132],
    [2, 222],
    [3, 256],
    [100, 256],
    [0, 132],
    [-1, 132],
    [1.5, 132],
    [NaN, 132],
    [Infinity, 132],
  ])(
    'reveals the requested items or retains the first incoming item for count %s',
    async (count, target) => {
      const { c } = await fixture()
      c.connectControls({
        next: document.querySelector('#next')!,
        itemsPerStep: count,
        behavior: 'instant',
      })
      document.querySelector<HTMLButtonElement>('#next')!.click()
      expect(c.state.position).toBe(target)
      expect(c.state.requested).toBe(false)
    }
  )

  it.each(['left', 'up', 'auto'] as const)(
    'reveals both incoming edges with borders and insets for %s',
    async direction => {
      const { c, period } = await fixture(direction)
      c.connectControls({
        previous: document.querySelector('#prev')!,
        next: document.querySelector('#next')!,
        behavior: 'instant',
      })
      document.querySelector<HTMLButtonElement>('#next')!.click()
      // RTL enters from the left: the first item is clipped by the 24px inset.
      expect(c.state.position).toBe(direction === 'auto' ? 24 : 132)
      c.scrollTo(0)
      document.querySelector<HTMLButtonElement>('#prev')!.click()
      // In RTL, item 1 ends at 332px: 42px beyond the readable right edge at 290px.
      expect(c.state.position).toBe(direction === 'auto' ? period - 42 : period - 24)
    }
  )

  it('skips decorative/unmeasurable items and reveals an oversized item without extra steps', async () => {
    const { c, children } = await fixture('left', [100, 40, 450])
    children[1].setAttribute('aria-hidden', 'true')
    const hidden = document.createElement('span')
    c.source.append(hidden)
    c.connectControls({
      next: document.querySelector('#next')!,
      itemsPerStep: 3,
      behavior: 'instant',
    })
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state.position).toBe(322)
    c.source.replaceChildren(hidden)
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state.position).toBe(322)
  })

  it('uses the full clipping area if scroll padding leaves no readable area, and preserves pixel overrides', async () => {
    const { c, wrapper } = await fixture()
    wrapper.style.scrollPaddingLeft = wrapper.style.scrollPaddingRight = '50%'
    const disconnect = c.connectControls({
      next: document.querySelector('#next')!,
      behavior: 'instant',
    })
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state.position).toBe(100)
    disconnect()
    c.scrollTo(0)
    c.connectControls({ next: document.querySelector('#next')!, itemsPerStep: 3, step: 25 })
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state.position).toBe(25)
  })

  it('smooths item controls by default and treats an empty source as a no-op', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 16)
    )
    const { c } = await fixture()
    c.connectControls({ next: document.querySelector('#next')! })
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state.reasons).toContain('navigation')
    vi.advanceTimersByTime(336)
    expect(c.state.position).toBe(132)
    expect(c.state.reasons).not.toContain('navigation')
    c.source.replaceChildren()
    vi.mocked(
      c.element!.querySelector<HTMLElement>('.ticker-content')!.getBoundingClientRect
    ).mockReturnValue({ width: 0, height: 0 } as DOMRect)
    c.refresh()
    vi.advanceTimersByTime(16)
    document.querySelector<HTMLButtonElement>('#next')!.click()
    expect(c.state).toMatchObject({ position: 0, ready: false })
  })
})
