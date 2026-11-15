import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'

const tickerStyles = readFileSync('src/style.css', 'utf8')

type PointerInit = {
  clientX?: number
  clientY?: number
  pointerId?: number
  button?: number
  isPrimary?: boolean
  pointerType?: string
  timeStamp?: number
}

/** jsdom has no PointerEvent: a plain Event carries the pointer fields. */
const pointer = (target: EventTarget, type: string, init: PointerInit = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const { timeStamp, ...rest } = init
  Object.assign(event, {
    clientX: 0,
    clientY: 0,
    pointerId: 1,
    button: 0,
    isPrimary: true,
    pointerType: 'touch',
    ...rest,
  })
  if (timeStamp !== undefined) Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  target.dispatchEvent(event)
  return event
}

describe('ticker gestures, inertia and native scroll', () => {
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

  const createTicker = async (
    options: Record<string, unknown> = {},
    html = '<a href="#one">One</a><a href="#two">Two</a>'
  ) => {
    const { ticker } = await import('../src/vanilla/render')
    const wrapper = document.createElement('div')
    wrapper.innerHTML = `<div data-ticker-content>${html}</div>`
    document.body.append(wrapper)
    const source = wrapper.firstElementChild as HTMLElement
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement
    ) {
      const width = this.matches('[data-ticker-content], .ticker-content') ? 100 : 300
      return {
        width,
        height: 20,
        left: 0,
        right: width,
        top: 0,
        bottom: 20,
      } as DOMRect
    })
    const instance = ticker(source, { navigation: true, ...options })!
    vi.advanceTimersByTime(16)
    return { instance, wrapper: instance.element!, source }
  }

  it('glides after a fast release and resumes the requested playback when it ends', async () => {
    const { instance, wrapper } = await createTicker({
      inertia: true,
      resumeAfterDrag: true,
      inertiaDeceleration: 3000,
      inertiaMaxVelocity: 3000,
    })
    const events: string[] = []
    instance.on('navigate', value => events.push(value.navigationSource!))
    pointer(wrapper, 'pointerdown', { clientX: 200, timeStamp: 0 })
    pointer(wrapper, 'pointermove', { clientX: 190, timeStamp: 10 })
    pointer(wrapper, 'pointermove', { clientX: 150, timeStamp: 30 })
    expect(wrapper.dataset.dragging).toBe('true')
    expect(instance.state.requested).toBe(false)
    pointer(wrapper, 'pointerup', { clientX: 150, timeStamp: 40 })
    expect(wrapper.dataset.gliding).toBe('true')
    expect(instance.state.reasons).toContain('navigation')
    const during = instance.state.position
    vi.advanceTimersByTime(2000)
    expect(wrapper.dataset.gliding).toBeUndefined()
    expect(instance.state.position).not.toBe(during)
    expect(instance.state.requested).toBe(true)
    expect(events.filter(source => source === 'drag').length).toBeGreaterThan(1)
  })

  it('a new touch during a glide keeps the interrupted drag intent', async () => {
    const { instance, wrapper } = await createTicker({
      inertia: true,
      resumeAfterDrag: true,
      inertiaDeceleration: 500,
    })
    pointer(wrapper, 'pointerdown', { clientX: 200, timeStamp: 0 })
    pointer(wrapper, 'pointermove', { clientX: 180, timeStamp: 10 })
    pointer(wrapper, 'pointermove', { clientX: 120, timeStamp: 20 })
    pointer(wrapper, 'pointerup', { clientX: 120, timeStamp: 30 })
    expect(wrapper.dataset.gliding).toBe('true')
    // Touch again: the glide stops, the old intent (playing) is inherited.
    pointer(wrapper, 'pointerdown', { clientX: 100, timeStamp: 40 })
    expect(wrapper.dataset.gliding).toBeUndefined()
    pointer(wrapper, 'pointermove', { clientX: 80, timeStamp: 50 })
    pointer(wrapper, 'pointerup', { clientX: 80, timeStamp: 400 })
    // The release is too late for velocity: no glide, playback resumes at once.
    expect(wrapper.dataset.gliding).toBeUndefined()
    expect(instance.state.requested).toBe(true)
  })

  it('does not glide slow releases, cancelled pointers or reduced motion', async () => {
    const { instance, wrapper } = await createTicker({ inertia: true })
    pointer(wrapper, 'pointerdown', { clientX: 200, timeStamp: 0 })
    pointer(wrapper, 'pointermove', { clientX: 199, timeStamp: 0 })
    pointer(wrapper, 'pointermove', { clientX: 192, timeStamp: 90 })
    pointer(wrapper, 'pointerup', { clientX: 192, timeStamp: 95 })
    expect(wrapper.dataset.gliding).toBeUndefined()

    pointer(wrapper, 'pointerdown', { clientX: 200, timeStamp: 100 })
    pointer(wrapper, 'pointermove', { clientX: 120, timeStamp: 110 })
    pointer(wrapper, 'pointercancel', { clientX: 120, timeStamp: 115 })
    expect(wrapper.dataset.gliding).toBeUndefined()

    media.matches = true
    pointer(wrapper, 'pointerdown', { clientX: 200, timeStamp: 200 })
    pointer(wrapper, 'pointermove', { clientX: 100, timeStamp: 210 })
    pointer(wrapper, 'pointerup', { clientX: 100, timeStamp: 215 })
    expect(wrapper.dataset.gliding).toBeUndefined()
    expect(instance.state.destroyed).toBe(false)
  })

  it('uses coalesced samples and ignores drags across the axis or from other pointers', async () => {
    const { instance, wrapper } = await createTicker()
    pointer(wrapper, 'pointerdown', { clientX: 100, clientY: 0 })
    pointer(wrapper, 'pointermove', { clientX: 102, clientY: 40 })
    expect(wrapper.dataset.dragging).toBeUndefined()

    pointer(wrapper, 'pointerdown', { clientX: 100 })
    pointer(wrapper, 'pointermove', { clientX: 103 })
    expect(wrapper.dataset.dragging).toBeUndefined()
    pointer(wrapper, 'pointermove', { clientX: 140, pointerId: 2 })
    expect(wrapper.dataset.dragging).toBeUndefined()

    const move = new Event('pointermove', { bubbles: true, cancelable: true })
    Object.assign(move, {
      clientX: 60,
      clientY: 0,
      pointerId: 1,
      getCoalescedEvents: () => [
        { clientX: 80, clientY: 0, timeStamp: 1 },
        { clientX: 60, clientY: 0, timeStamp: 2 },
      ],
    })
    wrapper.dispatchEvent(move)
    expect(wrapper.dataset.dragging).toBe('true')
    expect(instance.state.position).toBeCloseTo(40)
    pointer(wrapper, 'pointerup', { clientX: 60, pointerId: 9 })
    expect(wrapper.dataset.dragging).toBe('true')
    const lost = new Event('lostpointercapture', { bubbles: true })
    Object.assign(lost, { pointerId: 1 })
    wrapper.firstElementChild!.dispatchEvent(lost)
    expect(wrapper.dataset.dragging).toBe('true')
    wrapper.dispatchEvent(lost)
    expect(wrapper.dataset.dragging).toBeUndefined()
  })

  it('suppresses the click after a drag only once and blocks native dragging meanwhile', async () => {
    const { wrapper } = await createTicker()
    const link = wrapper.querySelector('a')!
    const clicks = vi.fn()
    link.addEventListener('click', clicks)
    expect(wrapper.dispatchEvent(new Event('dragstart', { cancelable: true }))).toBe(true)
    pointer(link, 'pointerdown', { clientX: 100 })
    expect(link.dispatchEvent(new Event('dragstart', { bubbles: true, cancelable: true }))).toBe(
      false
    )
    pointer(link, 'pointermove', { clientX: 60 })
    pointer(link, 'pointerup', { clientX: 60 })
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicks).not.toHaveBeenCalled()
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    expect(clicks).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1)
  })

  it('ignores secondary buttons, form fields and featured items, and keeps mouse focus', async () => {
    const { wrapper } = await createTicker(
      { resumeAfterDrag: true },
      '<input aria-label="Search" /><a href="#x">X</a><a href="#f" data-featured>F</a>'
    )
    pointer(wrapper, 'pointerdown', { button: 2 })
    pointer(wrapper, 'pointerdown', { isPrimary: false })
    pointer(wrapper.querySelector('input')!, 'pointerdown', { clientX: 100 })
    pointer(wrapper, 'pointermove', { clientX: 40 })
    expect(wrapper.dataset.dragging).toBeUndefined()
    const featured = wrapper.querySelector<HTMLElement>('[data-featured]')!
    const down = pointer(featured, 'pointerdown', { clientX: 100, pointerType: 'mouse' })
    expect(down.defaultPrevented).toBe(true)
    pointer(wrapper, 'pointermove', { clientX: 40 })
    expect(wrapper.dataset.dragging).toBeUndefined()
  })

  it('turns native scroll of the clipping wrapper into a logical seek', async () => {
    const { instance, wrapper } = await createTicker()
    wrapper.dispatchEvent(new Event('scroll'))
    expect(instance.state.position).toBe(0)
    wrapper.scrollLeft = 25
    wrapper.dispatchEvent(new Event('scroll'))
    expect(wrapper.scrollLeft).toBe(0)
    expect(instance.state.position).toBeCloseTo(25)
  })

  it('keeps native scroll for a static reduced-motion row', async () => {
    media.matches = true
    const { instance, wrapper } = await createTicker({ navigation: false })
    wrapper.scrollLeft = 25
    wrapper.dispatchEvent(new Event('scroll'))
    expect(wrapper.scrollLeft).toBe(25)
    expect(instance.state.position).toBe(0)
  })

  it('reports failing listeners and keeps dispatching', async () => {
    const { instance } = await createTicker()
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const after = vi.fn()
    instance.on('navigate', () => {
      throw new Error('listener')
    })
    instance.on('navigate', after)
    instance.scrollTo(10)
    expect(error).toHaveBeenCalledWith('[ticker] Event listener failed', expect.any(Error))
    expect(after).toHaveBeenCalled()
  })
})
