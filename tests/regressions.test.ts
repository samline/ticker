import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import type { TickerOptions } from '../src/core/types'

const tickerStyles = readFileSync('src/style.css', 'utf8')
let intersections: IntersectionObserverCallback[]

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers()
  intersections = []
  vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: false }))
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) =>
    window.setTimeout(() => callback(0), 16)
  )
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => window.clearTimeout(id))
  )
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = vi.fn()
      disconnect = vi.fn()
      constructor(callback: IntersectionObserverCallback) {
        intersections.push(callback)
      }
    }
  )
  vi.stubGlobal('ResizeObserver', undefined)
  document.head.innerHTML = `<style>${tickerStyles}</style>`
  document.body.innerHTML =
    '<div id="source"><a id="story" href="#story">Story</a><span aria-labelledby="story">Label</span></div>'
})

afterEach(async () => {
  ;(await import('../src/browser/registry')).destroyTickers()
  ;(await import('../src/vanilla/render')).unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
})

const measure = (element: HTMLElement) => {
  const content = element.querySelector<HTMLElement>('.ticker-content')!
  vi.spyOn(content, 'getBoundingClientRect').mockReturnValue({
    width: 100,
    height: 40,
    left: 0,
    right: 100,
    top: 0,
    bottom: 40,
  } as DOMRect)
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    width: 250,
    height: 40,
    left: 0,
    right: 250,
    top: 0,
    bottom: 40,
  } as DOMRect)
}

const create = async (options: TickerOptions = {}) => {
  const { ticker } = await import('../src/vanilla/render')
  const controller = ticker('#source', options)!
  measure(controller.element!)
  vi.advanceTimersByTime(16)
  return controller
}

const pointer = (type: string, { clientX, clientY }: { clientX: number; clientY: number }) =>
  Object.assign(
    new MouseEvent(type, { bubbles: true, cancelable: true, button: 0, clientX, clientY }),
    { pointerId: 1, isPrimary: true, pointerType: 'touch' }
  )

describe('audit regressions', () => {
  it('returns the live controller for a repeated source instead of nesting wrappers', async () => {
    const { ticker } = await import('../src/vanilla/render')
    const first = await create()
    const source = document.getElementById('source')!
    expect(ticker(source)).toBe(first)
    expect(ticker(first.element!)).toBe(first)
    expect(ticker('#source', { direction: 'right' })).toBe(first)
    expect(first.element!.dataset.direction).toBe('right')
    expect(document.querySelectorAll('.ticker-wrapper')).toHaveLength(1)
    first.destroy()
    const second = ticker('#source')!
    expect(second).not.toBe(first)
    expect(document.querySelectorAll('.ticker-wrapper')).toHaveLength(1)
    second.destroy()
    expect(document.querySelector('.ticker-wrapper')).toBeNull()
  })

  it('drops registry entries when a registered controller is destroyed elsewhere', async () => {
    const { mount } = await import('../src/vanilla/render')
    const registry = await import('../src/browser/registry')
    const instance = registry.newTicker({ id: 'source' })!
    expect(registry.getTicker('source')).toBe(instance.element)
    instance.destroy()
    expect(registry.getTicker('source')).toBeNull()
    expect(registry.available.source).toBeUndefined()

    mount()
    const again = registry.newTicker({ id: 'source' })!
    const wrapper = again.element!
    wrapper.remove()
    await Promise.resolve()
    expect(again.state.destroyed).toBe(true)
    expect(registry.getTicker('source')).toBeNull()
    expect(registry.getTickers()).toEqual({})
  })

  it('uses the latest intersection entry of a batched observer callback', async () => {
    const controller = await create()
    const wrapper = controller.element!
    intersections[0]!(
      [{ isIntersecting: true }, { isIntersecting: false }] as IntersectionObserverEntry[],
      {} as IntersectionObserver
    )
    expect(wrapper.dataset.active).toBe('false')
    expect(controller.state.reasons).toContain('offscreen')
    intersections[0]!(
      [{ isIntersecting: false }, { isIntersecting: true }] as IntersectionObserverEntry[],
      {} as IntersectionObserver
    )
    expect(wrapper.dataset.active).toBe('true')
    expect(controller.state.playing).toBe(true)
  })

  it.each([
    ['left', 'ltr', 'scrollLeft', 30, 30],
    ['auto', 'rtl', 'scrollLeft', -30, 30],
    ['up', 'ltr', 'scrollTop', 20, 20],
  ] as const)(
    'converts a native %s/%s wrapper scroll into a logical seek',
    async (direction, dir, axis, scrolled, expected) => {
      document.getElementById('source')!.setAttribute('dir', dir)
      const controller = await create({ direction, autoplay: false })
      const wrapper = controller.element!
      const offsets = { scrollLeft: 0, scrollTop: 0 }
      for (const name of ['scrollLeft', 'scrollTop'] as const)
        Object.defineProperty(wrapper, name, {
          configurable: true,
          get: () => offsets[name],
          set: (value: number) => (offsets[name] = value),
        })
      offsets[axis] = scrolled
      wrapper.dispatchEvent(new Event('scroll'))
      expect(offsets).toEqual({ scrollLeft: 0, scrollTop: 0 })
      expect(controller.state.position).toBeCloseTo(expected, 5)
      expect(controller.state.requested).toBe(false)
      wrapper.dispatchEvent(new Event('scroll'))
      expect(controller.state.position).toBeCloseTo(expected, 5)
    }
  )

  it('does not swallow a later activation after a touch drag that produced no click', async () => {
    const controller = await create({ navigation: true })
    const wrapper = controller.element!
    const link = wrapper.querySelector<HTMLAnchorElement>('.ticker-content:not(.ticker-clone) a')!
    link.dispatchEvent(pointer('pointerdown', { clientX: 80, clientY: 10 }))
    link.dispatchEvent(pointer('pointermove', { clientX: 40, clientY: 10 }))
    link.dispatchEvent(pointer('pointerup', { clientX: 40, clientY: 10 }))
    // A mouse drag's click arrives in the same task and remains suppressed.
    const dragged = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(dragged)
    expect(dragged.defaultPrevented).toBe(true)

    link.dispatchEvent(pointer('pointerdown', { clientX: 80, clientY: 10 }))
    link.dispatchEvent(pointer('pointermove', { clientX: 40, clientY: 10 }))
    link.dispatchEvent(pointer('pointerup', { clientX: 40, clientY: 10 }))
    vi.advanceTimersByTime(0)
    const activation = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(activation)
    expect(activation.defaultPrevented).toBe(false)
  })

  it('cancels a pending throttled drag frame on destroy', async () => {
    const controller = await create({ navigation: true })
    const wrapper = controller.element!
    const navigate = vi.fn()
    controller.on('navigate', navigate)
    wrapper.dispatchEvent(pointer('pointerdown', { clientX: 80, clientY: 10 }))
    wrapper.dispatchEvent(pointer('pointermove', { clientX: 40, clientY: 10 }))
    const cancel = vi.mocked(window.cancelAnimationFrame)
    cancel.mockClear()
    controller.destroy()
    expect(cancel).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    vi.advanceTimersByTime(32)
    expect(navigate).not.toHaveBeenCalled()
  })

  it('scopes featured layer styles to ticker wrappers', async () => {
    document.body.insertAdjacentHTML('beforeend', '<div class="ticker-featured">App card</div>')
    const card = document.body.lastElementChild!
    expect(getComputedStyle(card).position).not.toBe('relative')
    expect(getComputedStyle(card).zIndex).not.toBe('1')
  })

  it('strips form control names from clones so radio groups and submissions stay original', async () => {
    document.getElementById('source')!.innerHTML =
      '<label><input type="radio" name="plan" value="basic" checked> Basic</label>' +
      '<input type="text" name="nickname" value="Rowan">'
    const controller = await create()
    const wrapper = controller.element!
    const original = wrapper.querySelector<HTMLInputElement>(
      '.ticker-content:not(.ticker-clone) input[type="radio"]'
    )!
    expect(wrapper.querySelectorAll('.ticker-clone').length).toBeGreaterThan(0)
    expect(original.checked).toBe(true)
    expect(original.name).toBe('plan')
    expect(wrapper.querySelectorAll('.ticker-clone [name]')).toHaveLength(0)
    const form = document.createElement('form')
    wrapper.before(form)
    form.appendChild(wrapper)
    expect([...new FormData(form).entries()]).toEqual([
      ['plan', 'basic'],
      ['nickname', 'Rowan'],
    ])
  })

  it('removes runtime classes and custom properties from an adopted wrapper on destroy', async () => {
    document.body.innerHTML =
      '<div id="adopted" class="ticker-wrapper authored" data-ticker>' +
      '<div class="ticker-track" data-ticker-track><div class="ticker-content" data-ticker-content>' +
      '<span>One</span></div></div></div>'
    const { ticker } = await import('../src/vanilla/render')
    const controller = ticker('#adopted', { class: 'authored added extra', pauseOnHover: true })!
    const wrapper = controller.element!
    measure(wrapper)
    vi.advanceTimersByTime(16)
    expect(wrapper.classList.contains('added')).toBe(true)
    expect(wrapper.style.getPropertyValue('--ticker-distance')).not.toBe('')
    controller.destroy()
    expect([...wrapper.classList]).toEqual(['ticker-wrapper', 'authored'])
    expect(
      wrapper.querySelector('.ticker-track')!.classList.contains('ticker-pause-on-hover')
    ).toBe(false)
    for (const property of ['--ticker-position', '--ticker-duration', '--ticker-distance'])
      expect(wrapper.style.getPropertyValue(property)).toBe('')
  })
})
