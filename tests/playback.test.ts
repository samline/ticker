import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

const tickerStyles = readFileSync('src/style.css', 'utf8')

describe('ticker playback and measurement', () => {
  let intersections: Array<{
    callback: IntersectionObserverCallback
    observer: IntersectionObserver
    options?: IntersectionObserverInit
  }>
  let resizes: ResizeObserverCallback[]
  let media: EventTarget & { matches: boolean }
  let hidden: boolean

  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    intersections = []
    resizes = []
    hidden = false
    media = Object.assign(new EventTarget(), { matches: false })
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media)
    )
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(0), 16)
    )
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          intersections.push({
            callback,
            observer: this as unknown as IntersectionObserver,
            options,
          })
        }
      }
    )
    vi.stubGlobal(
      'ResizeObserver',
      class {
        observe = vi.fn()
        disconnect = vi.fn()
        constructor(callback: ResizeObserverCallback) {
          resizes.push(callback)
        }
      }
    )
    document.head.innerHTML = `<style>${tickerStyles}</style>`
    document.body.innerHTML = ''
  })

  afterEach(async () => {
    ;(await import('../src/vanilla/render')).unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.head.innerHTML = ''
    document.body.innerHTML = ''
  })

  const createTicker = async () => {
    const { ticker } = await import('../src/vanilla/render')
    const wrapper = document.createElement('div')
    wrapper.className = 'ticker-wrapper'
    wrapper.dataset.ticker = ''
    wrapper.innerHTML = `
      <div class="ticker-track" data-ticker-track>
        <div class="ticker-content" data-ticker-content><button>News</button></div>
      </div>
    `
    document.body.append(wrapper)
    const content = wrapper.querySelector<HTMLElement>('[data-ticker-content]')!
    const track = wrapper.querySelector<HTMLElement>('[data-ticker-track]')!
    const dimensions = { wrapper: 160, content: 80 }
    vi.spyOn(wrapper, 'getBoundingClientRect').mockImplementation(
      () => ({ width: dimensions.wrapper }) as DOMRect
    )
    vi.spyOn(content, 'getBoundingClientRect').mockImplementation(
      () => ({ width: dimensions.content }) as DOMRect
    )
    const instance = ticker(wrapper)!
    vi.advanceTimersByTime(16)
    return { instance, wrapper, content, track, dimensions }
  }

  const intersect = (isIntersecting: boolean, index = 0) => {
    const { callback, observer } = intersections[index]
    callback([{ isIntersecting } as IntersectionObserverEntry], observer)
    vi.advanceTimersByTime(16)
  }

  const resize = () => {
    resizes[0]([], {} as ResizeObserver)
    vi.advanceTimersByTime(166)
  }

  it('starts paused and resumes without replacing clones when it reenters the viewport', async () => {
    const { wrapper, track } = await createTicker()
    expect(intersections[0].options?.rootMargin).toBe('0px')
    expect(wrapper.dataset.active).toBe('false')
    expect(wrapper.dataset.playing).toBe('false')
    expect(window.getComputedStyle(track).animationPlayState).toBe('paused')
    const clone = wrapper.querySelector('.ticker-clone')
    const readiness = new MutationObserver(() => {})
    readiness.observe(wrapper, { attributes: true, attributeFilter: ['data-ready'] })

    intersect(true)
    expect(wrapper.dataset.playing).toBe('true')
    expect(window.getComputedStyle(track).animationPlayState).not.toBe('paused')
    intersect(false)
    expect(wrapper.dataset.playing).toBe('false')
    intersect(true)
    expect(wrapper.querySelector('.ticker-clone')).toBe(clone)
    expect(wrapper.dataset.ready).toBe('true')
    expect(readiness.takeRecords()).toHaveLength(0)
    readiness.disconnect()
  })

  it('keeps an intersecting ticker paused in a hidden document and respects offscreen state', async () => {
    hidden = true
    const { wrapper } = await createTicker()
    intersect(true)
    expect(wrapper.dataset.active).toBe('true')
    expect(wrapper.dataset.playing).toBe('false')
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(wrapper.dataset.playing).toBe('true')
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(wrapper.dataset.playing).toBe('false')
    intersect(false)
    hidden = false
    document.dispatchEvent(new Event('visibilitychange'))
    expect(wrapper.dataset.playing).toBe('false')
  })

  it('reuses clones for unchanged sizes and rebuilds for width and gap changes', async () => {
    const { wrapper, track, dimensions } = await createTicker()
    const clone = wrapper.querySelector('.ticker-clone')
    resize()
    expect(wrapper.querySelector('.ticker-clone')).toBe(clone)
    dimensions.wrapper = 240
    resize()
    expect(wrapper.querySelector('.ticker-clone')).not.toBe(clone)
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(3)
    track.style.gap = '10px'
    resize()
    expect(wrapper.style.getPropertyValue('--ticker-distance')).toBe('90px')
    dimensions.content = 120
    resize()
    expect(wrapper.style.getPropertyValue('--ticker-distance')).toBe('130px')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(2)
  })

  it('forces same-width content refresh even when an intersection callback supersedes its frame', async () => {
    const { instance, wrapper, content } = await createTicker()
    const clone = wrapper.querySelector('.ticker-clone')
    content.querySelector('button')!.textContent = 'Sale'
    instance.refresh()
    intersect(true)
    expect(wrapper.querySelector('.ticker-clone')).not.toBe(clone)
    expect(wrapper.querySelector('.ticker-clone button')?.textContent).toBe('Sale')
    instance.update({ interactiveClones: true })
    vi.advanceTimersByTime(16)
    expect(wrapper.querySelector('.ticker-clone')?.hasAttribute('aria-hidden')).toBe(false)
  })

  it('reacts to motion preferences for standalone controllers and rebuilds after restoring motion', async () => {
    const { wrapper } = await createTicker()
    intersect(true)
    media.matches = true
    media.dispatchEvent(new Event('change'))
    expect(wrapper.dataset.playing).toBe('false')
    vi.advanceTimersByTime(16)
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(0)
    expect(wrapper.style.getPropertyValue('--ticker-distance')).toBe('0px')
    media.matches = false
    media.dispatchEvent(new Event('change'))
    vi.advanceTimersByTime(16)
    expect(wrapper.dataset.playing).toBe('true')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(2)
    expect(wrapper.style.getPropertyValue('--ticker-distance')).toBe('80px')
  })

  it('shares playback listeners and removes them only after the last ticker is destroyed', async () => {
    const add = vi.spyOn(document, 'addEventListener')
    const remove = vi.spyOn(document, 'removeEventListener')
    const mediaAdd = vi.spyOn(media, 'addEventListener')
    const mediaRemove = vi.spyOn(media, 'removeEventListener')
    const first = await createTicker()
    const second = await createTicker()
    expect(add.mock.calls.filter(([event]) => event === 'visibilitychange')).toHaveLength(1)
    expect(mediaAdd).toHaveBeenCalledTimes(1)
    first.instance.destroy()
    expect(remove.mock.calls.filter(([event]) => event === 'visibilitychange')).toHaveLength(0)
    intersect(true, 1)
    expect(second.wrapper.dataset.playing).toBe('true')
    second.instance.destroy()
    expect(remove.mock.calls.filter(([event]) => event === 'visibilitychange')).toHaveLength(1)
    expect(mediaRemove).toHaveBeenCalledTimes(1)
    expect(
      intersections.every(({ observer }) => vi.mocked(observer.disconnect).mock.calls.length === 1)
    ).toBe(true)
    expect(second.wrapper.dataset.playing).toBe('false')
    expect(second.wrapper.dataset.ready).toBe('false')
    await createTicker()
    expect(add.mock.calls.filter(([event]) => event === 'visibilitychange')).toHaveLength(2)
  })

  it('plays without IntersectionObserver while still respecting document visibility', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const { wrapper } = await createTicker()
    expect(wrapper.dataset.active).toBe('true')
    expect(wrapper.dataset.playing).toBe('true')
    hidden = true
    document.dispatchEvent(new Event('visibilitychange'))
    expect(wrapper.dataset.playing).toBe('false')
  })

  it('supports legacy motion listeners and starts without clones when motion is reduced', async () => {
    let onChange: (() => void) | undefined
    const legacyMedia = {
      matches: true,
      addListener: vi.fn((callback: () => void) => {
        onChange = callback
      }),
      removeListener: vi.fn(),
    }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => legacyMedia)
    )
    const { instance, wrapper } = await createTicker()
    intersect(true)
    expect(wrapper.dataset.playing).toBe('false')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(0)
    legacyMedia.matches = false
    onChange!()
    vi.advanceTimersByTime(16)
    expect(wrapper.dataset.playing).toBe('true')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(2)
    instance.destroy()
    expect(legacyMedia.removeListener).toHaveBeenCalledWith(onChange)
  })

  it('reuses clones for fallback window resize while page refresh still updates same-width content', async () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const { wrapper, content } = await createTicker()
    const { mount, refresh, unmount } = await import('../src/vanilla/render')
    mount()
    document.dispatchEvent(new Event('DOMContentLoaded'))
    vi.advanceTimersByTime(16)
    const clone = wrapper.querySelector('.ticker-clone')
    window.dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(16)
    expect(wrapper.querySelector('.ticker-clone')).toBe(clone)
    content.querySelector('button')!.textContent = 'Sale'
    refresh()
    vi.advanceTimersByTime(16)
    expect(wrapper.querySelector('.ticker-clone button')?.textContent).toBe('Sale')
    unmount()
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(0)
    expect(wrapper.dataset.playing).toBe('false')
    window.dispatchEvent(new Event('resize'))
    vi.advanceTimersByTime(16)
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(0)
  })

  it('retries measurement after a zero-width ticker becomes measurable', async () => {
    const { wrapper, dimensions } = await createTicker()
    dimensions.wrapper = 0
    resize()
    expect(wrapper.dataset.ready).toBe('false')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(0)
    dimensions.wrapper = 160
    intersect(true)
    expect(wrapper.dataset.ready).toBe('true')
    expect(wrapper.querySelectorAll('.ticker-clone')).toHaveLength(2)
  })
})
