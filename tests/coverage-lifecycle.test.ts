import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sizes = () =>
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    const width = this.matches('[data-ticker-content], .ticker-content') ? 100 : 300
    return { width, height: 20, left: 0, right: width, top: 0, bottom: 20 } as DOMRect
  })

describe('ticker lifecycle, controls and options', () => {
  let media: EventTarget & { matches: boolean }

  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    media = Object.assign(new EventTarget(), { matches: false })
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => media)
    )
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
      window.setTimeout(() => callback(Date.now()), 16)
    )
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
    document.body.innerHTML = ''
    sizes()
  })

  afterEach(async () => {
    ;(await import('../src/vanilla/render')).unmount()
    vi.useRealTimers()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
  })

  const create = async (options = {}, html = '<span>One</span><span>Two</span>') => {
    const { ticker } = await import('../src/vanilla/render')
    const source = document.createElement('div')
    source.innerHTML = html
    document.body.append(source)
    const instance = ticker(source, options)!
    vi.advanceTimersByTime(16)
    return { instance, source, wrapper: instance.element! }
  }

  it('turns every command into a no-op after destroy', async () => {
    const { instance } = await create({ navigation: true })
    instance.destroy()
    instance.destroy()
    expect(instance.on('update', () => {})()).toBeUndefined()
    expect(instance.play()).toBe(instance)
    expect(instance.pause()).toBe(instance)
    expect(instance.update({ duration: 5 })).toBe(instance)
    expect(instance.setFeatured(null)).toBe(instance)
    expect(instance.refresh()).toBe(instance)
    expect(instance.featured).toBeNull()
    expect(instance.connectControls({})()).toBeUndefined()
  })

  it('ignores non-finite seeks and keeps a destroyed runtime quiet', async () => {
    const { instance } = await create({ navigation: true })
    instance.scrollTo(Number.NaN)
    instance.scrollBy(Number.POSITIVE_INFINITY)
    expect(instance.state.position).toBe(0)
    instance.scrollBy(30)
    expect(instance.state.position).toBeCloseTo(30)
  })

  it('drives a connected rail from the keyboard on both axes and in RTL', async () => {
    const { instance, wrapper } = await create({ navigation: true })
    wrapper.id = 'news'
    const rail = document.createElement('input')
    rail.type = 'range'
    rail.setAttribute('aria-label', 'Position')
    document.body.append(rail)
    const disconnect = instance.connectControls({ rail, step: 10 })
    expect(rail.getAttribute('aria-controls')).toBe('news')
    const key = (name: string) =>
      rail.dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }))
    expect(key('a')).toBe(true)
    key('ArrowRight')
    expect(instance.state.position).toBeCloseTo(10)
    key('ArrowLeft')
    expect(instance.state.position).toBeCloseTo(0)
    key('End')
    expect(instance.state.position).toBeCloseTo(100 - 0.001)
    key('Home')
    expect(instance.state.position).toBe(0)
    rail.value = '42'
    rail.dispatchEvent(new Event('input'))
    expect(instance.state.position).toBeCloseTo(42)
    // The rail follows playback while it runs.
    instance.play()
    vi.advanceTimersByTime(250)
    disconnect()
    disconnect()
    expect(rail.hasAttribute('aria-controls')).toBe(false)

    instance.update({ direction: 'down' })
    vi.advanceTimersByTime(16)
    const vertical = instance.connectControls({ rail, step: 10 })
    key('ArrowDown')
    expect(instance.state.position).toBeCloseTo(10)
    key('ArrowUp')
    expect(instance.state.position).toBeCloseTo(0)
    vertical()
  })

  it('steps by measured items when no pixel step is set', async () => {
    const { instance } = await create({ navigation: true })
    const next = document.createElement('button')
    const previous = document.createElement('button')
    const disconnect = instance.connectControls({ next, previous, behavior: 'instant' })
    next.click()
    previous.click()
    expect(Number.isFinite(instance.state.position)).toBe(true)
    disconnect()
  })

  it('applies responsive rules from markup, ignoring invalid JSON, with legacy listeners', async () => {
    const { ticker } = await import('../src/vanilla/render')
    const legacy = { matches: true, addListener: vi.fn(), removeListener: vi.fn() }
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => legacy)
    )
    const wrapper = document.createElement('div')
    wrapper.dataset.ticker = ''
    wrapper.dataset.responsive = JSON.stringify([
      { query: '(max-width: 1px)', options: { duration: 7 } },
      { query: 3 },
    ])
    wrapper.innerHTML =
      '<div data-ticker-track><div data-ticker-content><span>One</span></div></div>'
    document.body.append(wrapper)
    const instance = ticker(wrapper)!
    expect(legacy.addListener).toHaveBeenCalled()
    expect(wrapper.dataset.duration).toBe('7')
    instance.destroy()
    expect(legacy.removeListener).toHaveBeenCalled()

    const broken = document.createElement('div')
    broken.dataset.ticker = ''
    broken.dataset.responsive = '{not json'
    broken.innerHTML =
      '<div class="ticker-track"><div class="ticker-content"><span>One</span></div></div>'
    document.body.append(broken)
    expect(ticker(broken)!.options.responsive).toEqual([])
  })

  it('keeps writing direction and restores a marked content element on destroy', async () => {
    const { ticker } = await import('../src/vanilla/render')
    const source = document.createElement('div')
    source.setAttribute('dir', 'rtl')
    source.style.direction = 'rtl'
    source.innerHTML = '<div data-ticker-content="kept"><span>One</span></div>'
    document.body.append(source)
    const instance = ticker(source)!
    expect(instance.element!.getAttribute('dir')).toBe('rtl')
    expect(instance.element!.style.direction).toBe('rtl')
    instance.destroy()
    expect(source.querySelector('[data-ticker-content]')!.getAttribute('data-ticker-content')).toBe(
      'kept'
    )
    expect(ticker('#missing')).toBeNull()
  })

  it('initializes, refreshes and removes tickers through the document manager', async () => {
    const { mount, unmount, refresh } = await import('../src/vanilla/render')
    vi.stubGlobal('ResizeObserver', undefined)
    const ready = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    mount()
    const markup =
      '<div data-ticker><div data-ticker-track><div data-ticker-content><span>A</span></div></div></div>'
    document.body.insertAdjacentHTML('beforeend', markup)
    ready.mockReturnValue('complete')
    document.dispatchEvent(new Event('DOMContentLoaded'))
    const first = document.querySelector<HTMLElement>('[data-ticker]')!
    expect(first.dataset.ready).toBe('false')
    vi.advanceTimersByTime(16)
    expect(first.dataset.ready).toBe('true')

    const holder = document.createElement('section')
    holder.innerHTML = markup
    document.body.append(holder)
    holder.append(document.createTextNode('text'))
    await Promise.resolve()
    vi.advanceTimersByTime(16)
    expect(holder.querySelector<HTMLElement>('[data-ticker]')!.dataset.ready).toBe('true')

    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('load'))
    refresh()
    vi.advanceTimersByTime(16)

    holder.remove()
    await Promise.resolve()
    expect(holder.querySelector<HTMLElement>('[data-ticker]')!.dataset.active).toBe('false')
    unmount()
    window.dispatchEvent(new Event('resize'))
    expect(first.dataset.ready).toBe('false')
  })

  it('falls back to synchronous frames and reads position from a running CSS animation', async () => {
    vi.stubGlobal('requestAnimationFrame', undefined)
    vi.stubGlobal('cancelAnimationFrame', undefined)
    const { ticker } = await import('../src/vanilla/render')
    const source = document.createElement('div')
    source.innerHTML = '<span>One</span>'
    document.body.append(source)
    const instance = ticker(source, { duration: 10, direction: 'right' })!
    const track = instance.element!.querySelector<HTMLElement>('[data-ticker-track]')!
    const animation = { animationName: 'ticker-scroll', currentTime: 2500 }
    Object.assign(track, { getAnimations: () => [animation] })
    expect(instance.state.position).toBeCloseTo(75)
    instance.scrollTo(40)
    expect(animation.currentTime).toBeCloseTo(6000)
    instance.destroy()
  })
})

describe('browser registry', () => {
  afterEach(async () => {
    ;(await import('../src/browser/registry')).destroyTickers()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('validates ids, replaces registrations and destroys by element', async () => {
    const registry = await import('../src/browser/registry')
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(registry.newTicker({ id: '' })).toBeNull()
    expect(error).toHaveBeenCalled()
    expect(registry.newTicker({ id: 'nowhere' })).toBeNull()
    expect(warn).toHaveBeenCalled()

    document.body.innerHTML = '<div id="news"><span>One</span></div>'
    const first = registry.newTicker({ id: 'news' })!
    const second = registry.newTicker({ id: 'news', options: { duration: 9 } })!
    expect(second).not.toBe(first)
    expect(registry.getTicker('news')).toBe(second.element)
    first.destroy()
    expect(registry.getTicker('news')).toBe(second.element)

    registry.destroyTicker(document.createElement('div'))
    registry.destroyTicker(second.element!)
    expect(registry.getTickers()).toEqual({})
    registry.destroyTicker('news')
  })

  it('the classic script installs window.Ticker without a default export', async () => {
    const global = await import('../src/browser/global')
    expect(window.Ticker).toBe(global.browser)
    expect('default' in global).toBe(false)
    const { DEFAULT_OPTIONS } = await import('../src/core/types')
    expect(DEFAULT_OPTIONS.direction).toBe('left')
  })
})
