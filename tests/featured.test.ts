import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ticker, unmount } from '../src/vanilla/render'
import { featuredViewport, normalizeFeaturedPosition } from '../src/vanilla/featured'

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal('requestAnimationFrame', (fn: FrameRequestCallback) =>
    window.setTimeout(() => fn(0), 16)
  )
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
  document.body.innerHTML =
    '<div id="source"><button data-featured>A</button><button data-featured>B</button><button>C</button></div>'
})
afterEach(() => {
  unmount()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
const create = () => {
  const original = document.querySelector<HTMLElement>('#source')!
  const items = [...original.children] as HTMLElement[]
  const c = ticker(original, { autoplay: false, speed: 30 })!
  vi.spyOn(c.element!, 'getBoundingClientRect').mockReturnValue({
    width: 300,
    height: 80,
  } as DOMRect)
  vi.spyOn(
    c.element!.querySelector('.ticker-content')!,
    'getBoundingClientRect'
  ).mockImplementation(
    () =>
      ({ width: original.children.length * 80, height: original.children.length * 30 }) as DOMRect
  )
  vi.advanceTimersByTime(16)
  return { c, original, items }
}

it('uses only the first marked original; clones the remaining items; restores identity and exact order', () => {
  const { c, original, items } = create()
  expect(c.featured).toBe(items[0])
  expect(c.element!.querySelectorAll('.ticker-featured')).toHaveLength(1)
  expect(c.element!.querySelector('.ticker-clone')!.textContent).toBe('BC')
  expect(c.state.distance).toBe(160)
  c.refresh()
  vi.advanceTimersByTime(16)
  expect(c.featured).toBe(items[0])
  c.destroy()
  expect([...original.children]).toEqual(items)
  expect(original.innerHTML).toBe(
    '<button data-featured="">A</button><button data-featured="">B</button><button>C</button>'
  )
  expect(c.featured).toBeNull()
  expect(c.setFeatured(items[1]!)).toBe(c)
})

it('replaces the current item synchronously, preserves focus/events/intent, and null suppresses authored markers', () => {
  const { c, original, items } = create()
  const listener = vi.fn()
  items[1]!.addEventListener('click', listener)
  items[1]!.focus()
  c.setFeatured(items[1]!)
  expect(c.featured).toBe(items[1])
  expect(document.activeElement).toBe(items[1])
  items[1]!.click()
  expect(listener).toHaveBeenCalledOnce()
  expect(c.element!.querySelector('.ticker-clone')!.textContent).toBe('AC')
  expect(c.state.requested).toBe(false)
  expect(() => c.setFeatured(document.body)).toThrow(RangeError)
  expect(c.featured).toBe(items[1])
  c.setFeatured(null).refresh()
  vi.advanceTimersByTime(16)
  expect(c.featured).toBeNull()
  expect([...original.children]).toEqual(items)
  c.play().setFeatured(items[2]!)
  expect(c.state.requested).toBe(true)
})

it('refreshes authored selection in original order and does not resurrect removed featured content', () => {
  const { c, original, items } = create()
  items[0]!.removeAttribute('data-featured')
  c.refresh()
  vi.advanceTimersByTime(16)
  expect(c.featured).toBe(items[1])
  items[1]!.remove()
  c.refresh()
  vi.advanceTimersByTime(16)
  expect(c.featured).toBeNull()
  expect(original.textContent).toBe('AC')
  c.destroy()
  expect(original.textContent).toBe('AC')
})

it('keeps a featured-only sequence clone-free and recovers when an original is added', () => {
  const { c, original, items } = create()
  items[1]!.remove()
  items[2]!.remove()
  c.refresh()
  vi.advanceTimersByTime(16)
  expect(c.featured).toBe(items[0])
  expect(c.state).toMatchObject({ ready: false, distance: 0 })
  expect(c.element!.querySelectorAll('.ticker-clone')).toHaveLength(0)
  original.append(items[2]!)
  c.refresh()
  vi.advanceTimersByTime(16)
  expect(c.state.ready).toBe(true)
  c.update({ direction: 'up', featuredPosition: 'bottom' })
  vi.advanceTimersByTime(16)
  expect(c.element!.dataset.featuredPosition).toBe('bottom')
  expect(c.state.distance).toBe(30)
})

it('supports explicit track/content markup and isolates nested/foreign candidates', () => {
  document.body.innerHTML =
    '<div data-ticker id="outer" data-featured-position="right"><div class="ticker-track"><div class="ticker-content"><span><b data-featured>Nested</b></span><span data-featured>Direct</span></div></div></div>'
  const c = ticker('#outer')!
  vi.advanceTimersByTime(16)
  expect(c.featured!.textContent).toBe('Direct')
  expect(c.options.featuredPosition).toBe('right')
  expect(() => c.setFeatured(c.element!.querySelector('b')!)).toThrow(RangeError)
  c.destroy()
  expect(document.querySelector('.ticker-content')!.textContent).toBe('NestedDirect')
})

it('normalizes positions and chooses readable segments for navigation and focused items', () => {
  expect(normalizeFeaturedPosition('wrong')).toBe('center')
  expect(normalizeFeaturedPosition('start')).toBe('start')
  const element = document.createElement('span')
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    right: 180,
    top: 100,
    bottom: 180,
  } as DOMRect)
  expect(featuredViewport(null, false, 0, 300)).toEqual([0, 300])
  expect(featuredViewport(element, false, 0, 300)).toEqual([180, 300])
  expect(featuredViewport(element, true, 0, 300, { top: 50, height: 40 } as DOMRect)).toEqual([
    0, 100,
  ])
  expect(featuredViewport(element, false, 0, 300, { left: 200, width: 40 } as DOMRect)).toEqual([
    180, 300,
  ])
  expect(featuredViewport(element, false, 200, 300)).toEqual([200, 300])
  expect(featuredViewport(element, false, 0, 300, { left: 0, width: 200 } as DOMRect)).toEqual([
    180, 300,
  ])
})

it('preserves mouse focus on fixed actions only when opted in, without starting a drag or intercepting inputs', () => {
  const { c, items, original } = create()
  c.update({ navigation: true, resumeAfterDrag: true })
  vi.advanceTimersByTime(16)
  const press = (target: Element, pointerType = 'mouse') => {
    const event = Object.assign(new Event('pointerdown', { bubbles: true, cancelable: true }), {
      pointerType,
      button: 0,
      isPrimary: true,
    })
    target.dispatchEvent(event)
    return event.defaultPrevented
  }
  expect(press(items[0]!)).toBe(true)
  expect(press(items[0]!, 'touch')).toBe(false)
  c.update({ resumeAfterDrag: false })
  expect(press(items[0]!)).toBe(false)
  const content = document.createElement('span')
  const input = document.createElement('input')
  content.append(input)
  original.append(content)
  c.update({ resumeAfterDrag: true }).setFeatured(content)
  expect(press(input)).toBe(false)
})
