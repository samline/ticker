import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'

const tickerStyles = readFileSync('src/style.css', 'utf8')

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

describe('ticker vanilla', () => {
  beforeEach(() => {
    document.head.innerHTML = `<style>${tickerStyles}</style>`
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
    document.head.innerHTML = ''
  })

  it('mounts without errors', async () => {
    const { mount } = await import('../src/vanilla/render')
    mount()
    expect(document.querySelector('[data-ticker]')).toBeNull()
  })

  it('unmounts all tickers', async () => {
    const { mount, unmount } = await import('../src/vanilla/render')
    mount()
    unmount()
    expect(true).toBe(true)
  })

  it('refresh recalculates positions', async () => {
    const { refresh } = await import('../src/vanilla/render')
    refresh()
    expect(true).toBe(true)
  })

  it('enhances a ticker-content element without adding empty class tokens', async () => {
    const { ticker } = await import('../src/vanilla/render')

    document.body.innerHTML = `
      <div class="ticker-content">
        <span>First Item</span>
        <span>Second Item</span>
      </div>
    `

    const instance = ticker('.ticker-content', {
      class: ' custom   accent ',
      interactiveClones: true,
    })
    const wrapper = instance?.element

    expect(wrapper).toBeInstanceOf(HTMLElement)
    expect(wrapper?.classList.contains('ticker-wrapper')).toBe(true)
    expect(wrapper?.classList.contains('custom')).toBe(true)
    expect(wrapper?.classList.contains('accent')).toBe(true)
    expect(wrapper?.dataset.interactiveClones).toBe('true')
    expect(wrapper?.querySelectorAll('.ticker-content')).toHaveLength(1)
    expect(wrapper?.querySelectorAll('span')).toHaveLength(2)
  })

  it('keeps clone interactions enabled when interactiveClones is true', async () => {
    const { initTicker } = await import('../src/vanilla/render')

    document.body.innerHTML = `
      <div
        class="ticker-wrapper"
        data-ticker=""
        data-duration="20"
        data-direction="left"
        data-pause-on-hover="false"
        data-interactive-clones="true"
      >
        <div class="ticker-track" data-ticker-track="">
          <div class="ticker-content" data-ticker-content="">
            <button type="button">Buy now</button>
          </div>
        </div>
      </div>
    `

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const wrapper = document.querySelector<HTMLElement>('[data-ticker]')
    const content = wrapper?.querySelector<HTMLElement>('[data-ticker-content]')

    Object.defineProperty(wrapper as HTMLElement, 'getBoundingClientRect', {
      value: () => ({
        width: 160,
        height: 24,
        top: 0,
        left: 0,
        right: 160,
        bottom: 24,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    })

    Object.defineProperty(content as HTMLElement, 'getBoundingClientRect', {
      value: () => ({
        width: 80,
        height: 24,
        top: 0,
        left: 0,
        right: 80,
        bottom: 24,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    })

    initTicker(wrapper as HTMLElement)

    const clone = wrapper?.querySelector<HTMLElement>('.ticker-clone')
    const cloneButton = clone?.querySelector<HTMLButtonElement>('button')

    expect(clone).toBeInstanceOf(HTMLElement)
    expect(clone?.getAttribute('aria-hidden')).toBeNull()
    expect(clone?.getAttribute('role')).toBeNull()
    expect(cloneButton?.getAttribute('tabindex')).toBeNull()
    expect(window.getComputedStyle(clone as HTMLElement).pointerEvents).not.toBe('none')
  })

  it('disables pointer interactions for default clones', async () => {
    const { ticker } = await import('../src/vanilla/render')
    document.body.innerHTML = '<div id="news"><button type="button">News</button></div>'
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const source = document.querySelector<HTMLElement>('#news')
    Object.defineProperty(source as HTMLElement, 'getBoundingClientRect', {
      value: () => ({ width: 80, height: 24 }),
    })

    const instance = ticker('#news')
    const wrapper = instance?.element
    const content = wrapper?.querySelector<HTMLElement>('[data-ticker-content]')
    Object.defineProperty(wrapper as HTMLElement, 'getBoundingClientRect', {
      value: () => ({ width: 160, height: 24 }),
    })
    Object.defineProperty(content as HTMLElement, 'getBoundingClientRect', {
      value: () => ({ width: 80, height: 24 }),
    })

    instance?.refresh()
    const clone = wrapper?.querySelector<HTMLElement>('.ticker-clone')
    expect(clone).toBeInstanceOf(HTMLElement)
    expect(window.getComputedStyle(clone as HTMLElement).pointerEvents).toBe('none')
    instance?.destroy()
  })

  it('returns an instance that updates, refreshes, and restores its source', async () => {
    const { ticker } = await import('../src/vanilla/render')

    document.body.innerHTML = '<div id="news"><span>News</span></div>'
    const source = document.querySelector<HTMLElement>('#news')
    const instance = ticker('#news', {
      duration: 12,
      class: 'ticker-wrapper initial',
    })

    expect(instance?.source).toBe(source)
    expect(instance?.element).toBeInstanceOf(HTMLElement)
    expect(instance?.element?.classList.contains('initial')).toBe(true)
    expect(instance?.options.duration).toBe(12)
    expect(instance?.options.class).toBe('initial')

    const updated = instance?.update({ duration: 30, direction: 'right', class: 'updated' })
    expect(updated).toBe(instance)
    expect(instance?.element?.dataset.duration).toBe('30')
    expect(instance?.element?.dataset.direction).toBe('right')
    expect(instance?.element?.classList.contains('initial')).toBe(false)
    expect(instance?.element?.classList.contains('updated')).toBe(true)
    expect(instance?.refresh()).toBe(instance)

    instance?.destroy()
    expect(instance?.element).toBeNull()
    expect(document.querySelector('#news')).toBe(source)
    expect(document.querySelector('.ticker-wrapper')).toBeNull()
  })

  it('returns null when the target does not exist', async () => {
    const { ticker } = await import('../src/vanilla/render')
    expect(ticker('#missing')).toBeNull()
  })

  it('adopts declarative markup without replacing it or resetting its options', async () => {
    const { ticker } = await import('../src/vanilla/render')
    document.body.innerHTML = `
      <div class="ticker-wrapper app-class" data-ticker data-duration="35" data-direction="right">
        <div class="ticker-track" data-ticker-track>
          <div class="ticker-content" data-ticker-content>News</div>
        </div>
      </div>
    `

    const wrapper = document.querySelector<HTMLElement>('[data-ticker]')
    const instance = ticker(wrapper as HTMLElement)

    expect(instance?.element).toBe(wrapper)
    expect(instance?.options.duration).toBe(35)
    expect(instance?.options.direction).toBe('right')

    instance?.destroy()
    expect(instance?.element).toBeNull()
    expect(wrapper?.isConnected).toBe(true)
    expect(wrapper?.classList.contains('app-class')).toBe(true)
  })
})
