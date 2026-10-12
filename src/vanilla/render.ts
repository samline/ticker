import type {
  NormalizedTickerOptions,
  TickerInstance,
  TickerManagerState,
  TickerOptions,
  TickerState,
  TickerTarget,
} from '../core/types'
import {
  validateDuration,
  validateDirection,
  validatePauseOnHover,
  validateInteractiveClones,
  createEmptyTickerState,
  createEmptyManagerState,
} from '../core/state'
import {
  TICKER_SELECTOR,
  TICKER_CLONE_CLASS,
  REDUCED_MOTION_QUERY,
  FOCUSABLE_SELECTOR,
  RESIZE_DEBOUNCE_MS,
  INTERSECTION_ROOT_MARGIN,
} from '../constants'

type ReducedMotionMedia = MediaQueryList & {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void
}

let reducedMotionMedia: ReducedMotionMedia | null = null

const canUseDOM = (): boolean => typeof window !== 'undefined' && typeof document !== 'undefined'

const requestFrame = (callback: FrameRequestCallback): number => {
  if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
    return window.requestAnimationFrame(callback)
  }

  callback(0)
  return 0
}

const cancelFrame = (frameId: number): void => {
  if (typeof window !== 'undefined' && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(frameId)
  }
}

const getReducedMotionMedia = (): ReducedMotionMedia | null => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }

  if (!reducedMotionMedia) {
    reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY) as ReducedMotionMedia
  }

  return reducedMotionMedia
}

interface RuntimeTickerState extends TickerState {
  forceRebuild: boolean
  measurement: {
    contentWidth: number
    wrapperWidth: number
    interactiveClones: boolean
    reducedMotion: boolean
  } | null
}

const tickersState = new Map<HTMLElement, RuntimeTickerState>()
let managerState: TickerManagerState = createEmptyManagerState()

const syncPlayback = ({ wrapper }: TickerState): void => {
  wrapper.dataset.playing = String(
    wrapper.dataset.active === 'true' && !document.hidden && !getReducedMotionMedia()?.matches
  )
}

const handleVisibilityChange = (): void => tickersState.forEach(syncPlayback)

const handleMotionChange = (): void => {
  tickersState.forEach(state => {
    syncPlayback(state)
    scheduleRebuild(state)
  })
}

const addPlaybackListeners = (): void => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  const media = getReducedMotionMedia()
  if (typeof media?.addEventListener === 'function') {
    media.addEventListener('change', handleMotionChange)
  } else if (typeof media?.addListener === 'function') {
    media.addListener(handleMotionChange)
  }
}

const removePlaybackListeners = (): void => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  const media = getReducedMotionMedia()
  if (typeof media?.removeEventListener === 'function') {
    media.removeEventListener('change', handleMotionChange)
  } else if (typeof media?.removeListener === 'function') {
    media.removeListener(handleMotionChange)
  }
}

const isSearchableRoot = (value: unknown): value is Element | Document | DocumentFragment => {
  if (!value || typeof value !== 'object') return false
  const node = value as { nodeType?: number }
  return node.nodeType === 1 || node.nodeType === 9 || node.nodeType === 11
}

const getTickerElements = (root: ParentNode): HTMLElement[] => {
  if (!isSearchableRoot(root) || !('querySelectorAll' in root)) return []

  const elements: HTMLElement[] = []
  if ('matches' in root && root.matches(TICKER_SELECTOR)) {
    elements.push(root as HTMLElement)
  }
  root.querySelectorAll<HTMLElement>(TICKER_SELECTOR).forEach(el => elements.push(el))
  return elements
}

const isTickerContentElement = (element: HTMLElement): boolean =>
  element.matches('[data-ticker-content], .ticker-content')

const makeCloneAccessible = (clone: Element, interactiveClones: boolean): void => {
  clone.classList.add(TICKER_CLONE_CLASS)

  if (interactiveClones) return

  clone.setAttribute('aria-hidden', 'true')
  clone.setAttribute('role', 'presentation')

  if ('inert' in clone) {
    ;(clone as HTMLElement & { inert: boolean }).inert = true
    return
  }

  clone
    .querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    .forEach(el => el.setAttribute('tabindex', '-1'))
}

const removeClones = (state: TickerState): void => {
  state.clones.forEach(clone => clone.remove())
  state.clones = []
}

const syncConfig = (state: TickerState): void => {
  const { wrapper, track } = state
  const duration = validateDuration(wrapper.dataset.duration)
  const direction = validateDirection(wrapper.dataset.direction)
  const pauseOnHover = validatePauseOnHover(wrapper.dataset.pauseOnHover === 'true')
  const interactiveClones = validateInteractiveClones(wrapper.dataset.interactiveClones === 'true')

  if (wrapper.dataset.direction !== direction) {
    wrapper.dataset.direction = direction
  }

  const newInteractiveClones = interactiveClones ? 'true' : 'false'
  if (wrapper.dataset.interactiveClones !== newInteractiveClones) {
    wrapper.dataset.interactiveClones = newInteractiveClones
  }

  const newDuration = `${duration}s`
  if (wrapper.dataset.duration !== String(duration)) {
    wrapper.dataset.duration = String(duration)
  }
  const currentDuration = wrapper.style.getPropertyValue('--ticker-duration')
  if (currentDuration !== newDuration) {
    wrapper.style.setProperty('--ticker-duration', newDuration)
  }

  const hasPauseClass = track.classList.contains('ticker-pause-on-hover')
  wrapper.dataset.pauseOnHover = pauseOnHover ? 'true' : 'false'
  if (hasPauseClass !== pauseOnHover) {
    track.classList.toggle('ticker-pause-on-hover', pauseOnHover)
  }
}

const rebuildTickerState = (state: RuntimeTickerState, force: boolean): void => {
  const { wrapper, track, content } = state
  if (!track || !content || !wrapper.isConnected) return

  syncConfig(state)
  const contentRect = content.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()

  const trackStyles = window.getComputedStyle(track)
  const gap = parseFloat(trackStyles.gap) || 0

  const contentWidth = Math.ceil(contentRect.width + gap)
  const wrapperWidth = Math.ceil(wrapperRect.width)

  const reducedMotion = getReducedMotionMedia()?.matches ?? false
  const interactiveClones = wrapper.dataset.interactiveClones === 'true'
  const previous = state.measurement

  if (
    !force &&
    wrapper.dataset.ready === 'true' &&
    previous?.contentWidth === contentWidth &&
    previous.wrapperWidth === wrapperWidth &&
    previous.interactiveClones === interactiveClones &&
    previous.reducedMotion === reducedMotion
  ) {
    return
  }

  wrapper.dataset.ready = 'false'
  removeClones(state)
  state.measurement = null
  if (!contentWidth || !wrapperWidth) return

  state.measurement = { contentWidth, wrapperWidth, interactiveClones, reducedMotion }

  if (reducedMotion) {
    wrapper.style.setProperty('--ticker-distance', '0px')
    wrapper.dataset.ready = 'true'
    return
  }

  const clonesNeeded = Math.max(1, Math.ceil(wrapperWidth / contentWidth))
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < clonesNeeded; index += 1) {
    const clone = content.cloneNode(true) as HTMLElement
    makeCloneAccessible(clone, interactiveClones)
    state.clones.push(clone)
    fragment.appendChild(clone)
  }

  track.appendChild(fragment)
  wrapper.style.setProperty('--ticker-distance', `${contentWidth}px`)
  wrapper.dataset.ready = 'true'
}

const scheduleRebuild = (state: RuntimeTickerState, force = false): void => {
  if (!state.track || !state.content) return
  state.forceRebuild ||= force
  if (state.frameId) cancelFrame(state.frameId)

  state.frameId = requestFrame(() => {
    state.frameId = 0
    const forceRebuild = state.forceRebuild
    state.forceRebuild = false
    rebuildTickerState(state, forceRebuild)
  })
}

const setupObservers = (state: RuntimeTickerState): void => {
  const { wrapper, content } = state

  if (typeof window.ResizeObserver === 'function') {
    state.resizeObserver = new ResizeObserver(() => {
      if (state.resizeTimeout) clearTimeout(state.resizeTimeout)
      state.resizeTimeout = window.setTimeout(() => scheduleRebuild(state), RESIZE_DEBOUNCE_MS)
    })
    state.resizeObserver.observe(wrapper)
    state.resizeObserver.observe(content)
  }

  if (typeof window.IntersectionObserver === 'function') {
    state.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const isActive = entry?.isIntersecting ?? true
        if (wrapper.dataset.active !== String(isActive)) {
          wrapper.dataset.active = isActive ? 'true' : 'false'
        }
        syncPlayback(state)
        if (isActive) scheduleRebuild(state)
      },
      { rootMargin: INTERSECTION_ROOT_MARGIN }
    )
    state.intersectionObserver.observe(wrapper)
  }
}

const destroyTicker = (wrapper: HTMLElement): void => {
  const state = tickersState.get(wrapper)
  if (!state) return

  if (state.frameId) cancelFrame(state.frameId)
  if (state.resizeTimeout) clearTimeout(state.resizeTimeout)

  state.resizeObserver?.disconnect()
  state.intersectionObserver?.disconnect()
  removeClones(state)

  tickersState.delete(wrapper)
  wrapper.dataset.active = 'false'
  wrapper.dataset.playing = 'false'
  wrapper.dataset.ready = 'false'
  if (!tickersState.size) removePlaybackListeners()
}

const initTicker = (wrapper: HTMLElement): void => {
  if (tickersState.has(wrapper)) return

  const track =
    wrapper.querySelector<HTMLElement>('[data-ticker-track]') ||
    wrapper.querySelector<HTMLElement>('.ticker-track')
  const content =
    wrapper.querySelector<HTMLElement>('[data-ticker-content]') ||
    wrapper.querySelector<HTMLElement>('.ticker-content')

  if (!track || !content) return

  const state: RuntimeTickerState = {
    wrapper,
    track,
    content,
    ...createEmptyTickerState(),
    forceRebuild: false,
    measurement: null,
  }

  tickersState.set(wrapper, state)
  if (tickersState.size === 1) addPlaybackListeners()

  wrapper.dataset.ready = 'false'
  wrapper.dataset.active = String(typeof window.IntersectionObserver !== 'function')
  syncPlayback(state)

  syncConfig(state)
  setupObservers(state)
  scheduleRebuild(state)
}

const initAll = (root: ParentNode): void => getTickerElements(root).forEach(initTicker)
const destroyAll = (root: ParentNode): void => getTickerElements(root).forEach(destroyTicker)
const refreshAll = (): void => tickersState.forEach(state => scheduleRebuild(state, true))

const refreshTicker = (wrapper: HTMLElement): void => {
  const state = tickersState.get(wrapper)
  if (state) scheduleRebuild(state, true)
}

const handleMutations = (mutations: MutationRecord[]): void => {
  if (!managerState.isMounted) return
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (isSearchableRoot(node)) initAll(node)
    })
    mutation.removedNodes.forEach(node => {
      if (isSearchableRoot(node)) destroyAll(node)
    })
  })
}

const handleReady = (): void => {
  if (!managerState.isMounted) return
  initAll(document)

  if ('MutationObserver' in window && document.body && !managerState.mutationObserver) {
    managerState.mutationObserver = new MutationObserver(handleMutations)
    managerState.mutationObserver.observe(document.body, { childList: true, subtree: true })
  }
}

const handleEventUpdate = (): void => {
  if (managerState.isMounted) refreshAll()
}

const handleWindowResize = (): void => {
  if (managerState.isMounted) tickersState.forEach(state => scheduleRebuild(state))
}

export const mountManager = (): void => {
  if (!canUseDOM()) return

  managerState.isMounted = true

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleReady, { once: true })
  } else {
    handleReady()
  }

  if ('fonts' in document) {
    document.fonts.ready.then(handleEventUpdate).catch(() => {})
  }

  window.addEventListener('load', handleEventUpdate, { once: true })
  if (typeof window.ResizeObserver === 'undefined') {
    window.addEventListener('resize', handleWindowResize, { passive: true })
  }
}

export const unmountManager = (): void => {
  if (!canUseDOM()) return

  managerState.isMounted = false

  document.removeEventListener('DOMContentLoaded', handleReady)
  window.removeEventListener('load', handleEventUpdate)
  window.removeEventListener('resize', handleWindowResize)

  managerState.mutationObserver?.disconnect()
  managerState.mutationObserver = null

  Array.from(tickersState.keys()).forEach(destroyTicker)
}

export const mount = (): void => mountManager()
export const unmount = (): void => unmountManager()
export const refresh = (): void => refreshAll()

const resolveTarget = (target: TickerTarget): HTMLElement | null => {
  if (typeof target !== 'string') return target
  if (typeof document === 'undefined') return null
  return document.querySelector<HTMLElement>(target)
}

const normalizeClassName = (className = ''): string =>
  className
    .split(/\s+/)
    .filter(token => token && token !== 'ticker-wrapper')
    .join(' ')

const normalizeOptions = (options: TickerOptions = {}): NormalizedTickerOptions => ({
  duration: validateDuration(options.duration),
  direction: validateDirection(options.direction),
  pauseOnHover: validatePauseOnHover(options.pauseOnHover),
  interactiveClones: validateInteractiveClones(options.interactiveClones),
  class: normalizeClassName(options.class),
})

const applyOptions = (
  wrapper: HTMLElement,
  previous: Partial<NormalizedTickerOptions>,
  next: NormalizedTickerOptions
): void => {
  const previousClasses = previous.class?.split(/\s+/).filter(Boolean) ?? []
  const nextClasses = next.class?.split(/\s+/).filter(Boolean) ?? []

  if (previousClasses.length) wrapper.classList.remove(...previousClasses)
  if (nextClasses.length) wrapper.classList.add(...nextClasses)

  wrapper.dataset.duration = String(next.duration)
  wrapper.dataset.direction = next.direction
  wrapper.dataset.pauseOnHover = next.pauseOnHover ? 'true' : 'false'
  wrapper.dataset.interactiveClones = next.interactiveClones ? 'true' : 'false'
}

const createWrapper = (
  options: NormalizedTickerOptions
): { wrapper: HTMLElement; track: HTMLElement } => {
  const wrapper = document.createElement('div')

  wrapper.classList.add('ticker-wrapper')
  wrapper.dataset.ticker = ''
  wrapper.dataset.ready = 'false'
  applyOptions(wrapper, {}, options)

  const track = document.createElement('div')
  track.classList.add('ticker-track')
  track.dataset.tickerTrack = ''
  wrapper.appendChild(track)

  return { wrapper, track }
}

const enhanceElement = (element: HTMLElement, options: NormalizedTickerOptions): HTMLElement => {
  const content =
    element.querySelector<HTMLElement>('[data-ticker-content]') ||
    element.querySelector<HTMLElement>('.ticker-content') ||
    element
  const parent = element.parentNode
  const nextSibling = element.nextSibling
  const { wrapper, track } = createWrapper(options)
  const tickerContent = isTickerContentElement(content) ? content : document.createElement('div')

  tickerContent.classList.add('ticker-content')
  tickerContent.dataset.tickerContent = ''
  if (tickerContent !== content) tickerContent.appendChild(content)
  track.appendChild(tickerContent)

  if (parent) parent.insertBefore(wrapper, nextSibling)
  if (element !== content && element.isConnected) element.remove()

  initTicker(wrapper)
  return wrapper
}

export const ticker = (
  target: TickerTarget,
  initialOptions: TickerOptions = {}
): TickerInstance | null => {
  const source = resolveTarget(target)
  if (!source) return null

  const ownsWrapper = !source.matches(TICKER_SELECTOR)
  const markupOptions: TickerOptions = ownsWrapper
    ? {}
    : {
        duration: validateDuration(source.dataset.duration),
        direction: validateDirection(source.dataset.direction),
        pauseOnHover: source.dataset.pauseOnHover === 'true',
        interactiveClones: source.dataset.interactiveClones === 'true',
      }
  let currentOptions = normalizeOptions({ ...markupOptions, ...initialOptions })
  let wrapper: HTMLElement | null

  if (ownsWrapper) {
    wrapper = enhanceElement(source, currentOptions)
  } else {
    wrapper = source
    applyOptions(wrapper, {}, currentOptions)
    initTicker(wrapper)
  }

  const instance: TickerInstance = {
    get element() {
      return wrapper
    },
    source,
    get options() {
      return { ...currentOptions }
    },
    update(options = {}) {
      if (!wrapper) return instance
      const nextOptions = normalizeOptions({ ...currentOptions, ...options })
      applyOptions(wrapper, currentOptions, nextOptions)
      currentOptions = nextOptions
      refreshTicker(wrapper)
      return instance
    },
    refresh() {
      if (wrapper) refreshTicker(wrapper)
      return instance
    },
    destroy() {
      if (!wrapper) return
      destroyTicker(wrapper)
      if (ownsWrapper && wrapper.isConnected) wrapper.replaceWith(source)
      wrapper = null
    },
  }

  return instance
}

export { destroyTicker, initTicker }
