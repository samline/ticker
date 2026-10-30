import { createFeatured, featuredViewport, normalizeFeaturedPosition } from './featured'
import type {
  NormalizedTickerOptions,
  TickerInstance,
  TickerManagerState,
  TickerOptions,
  TickerState,
  TickerTarget,
  TickerSnapshot,
  TickerEventMap,
  TickerControls,
  TickerNavigationOptions,
  TickerPauseReason,
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
  revealingFocus: boolean
  featured: ReturnType<typeof createFeatured>
  itemRoot: HTMLElement
  navigationFrame: number
  navigationTimer: number
  navigating: boolean
  navigationRevision: number
  stepNavigation?: { forward: boolean; position: number; target: number } | undefined
  forceRebuild: boolean
  requested: boolean
  manualOverride: boolean
  intentRevision: number
  hovered: boolean
  destroyed: boolean
  position: number
  duration: number
  direction: 'left' | 'right' | 'up' | 'down'
  vertical: boolean
  rtl: boolean
  listeners: Map<keyof TickerEventMap, Set<(value: TickerSnapshot) => void>>
  cleanup: Array<() => void>
  playbackKey: string
  initialized: boolean
  configured?: NormalizedTickerOptions
  rules: Array<{ media: MediaQueryList; options: TickerOptions }>
  measurement: {
    contentExtent: number
    wrapperExtent: number
    interactiveClones: boolean
    reducedMotion: boolean
    vertical: boolean
  } | null
}

const tickersState = new Map<HTMLElement, RuntimeTickerState>()
let managerState: TickerManagerState = createEmptyManagerState()

const modulo = (value: number, period: number): number =>
  period > 0 ? ((value % period) + period) % period : 0
const backwards = (state: RuntimeTickerState): boolean =>
  state.direction === 'right' || state.direction === 'down'
const animation = (state: RuntimeTickerState): Animation | undefined =>
  state.track
    .getAnimations?.()
    .find(
      item =>
        'animationName' in item &&
        String((item as CSSAnimation).animationName).startsWith('ticker-')
    )

const readPosition = (state: RuntimeTickerState): number => {
  const distance = state.measurement?.contentExtent ?? 0
  const time = animation(state)?.currentTime
  if (typeof time === 'number' && distance && state.duration) {
    const phase = modulo(time / (state.duration * 1000), 1)
    const physical = (backwards(state) ? 1 - phase : phase) * distance
    state.position = modulo(state.rtl && !state.vertical ? -physical : physical, distance)
  }
  return state.position
}

const seek = (state: RuntimeTickerState, position: number): void => {
  const distance = state.measurement?.contentExtent ?? 0
  state.position = modulo(position, distance)
  const physical = modulo(state.rtl && !state.vertical ? -state.position : state.position, distance)
  const phase = distance ? physical / distance : 0
  // Force style resolution after changing ready/direction/duration, then restore
  // the current CSS animation's time instead of restarting from its first frame.
  const current = animation(state)
  if (current) current.currentTime = (backwards(state) ? 1 - phase : phase) * state.duration * 1000
  state.wrapper.style.setProperty('--ticker-position', `${-physical}px`)
}

const snapshot = (state: RuntimeTickerState): TickerSnapshot => {
  const reasons: TickerPauseReason[] = []
  if (!state.requested) reasons.push('manual')
  if (state.navigating) reasons.push('navigation')
  if (state.hovered && state.wrapper.dataset.pauseOnHover === 'true') reasons.push('hover')
  if (
    state.wrapper.dataset.pauseOnFocus === 'true' &&
    state.wrapper.contains(document.activeElement)
  )
    reasons.push('focus')
  if (document.hidden) reasons.push('hidden')
  if (state.wrapper.dataset.active !== 'true') reasons.push('offscreen')
  if (getReducedMotionMedia()?.matches) reasons.push('reduced-motion')
  const ready = !state.destroyed && state.wrapper.dataset.ready === 'true'
  return Object.freeze({
    ready,
    destroyed: state.destroyed,
    requested: state.requested,
    playing: ready && reasons.length === 0,
    reasons: Object.freeze(reasons),
    position: readPosition(state),
    distance: state.measurement?.contentExtent ?? 0,
    duration: state.duration,
    direction: state.direction,
  })
}

const emit = (
  state: RuntimeTickerState,
  event: keyof TickerEventMap,
  navigationSource?: TickerSnapshot['navigationSource']
): void => {
  if (state.destroyed && event !== 'destroy') return
  const value = navigationSource
    ? Object.freeze({ ...snapshot(state), navigationSource })
    : snapshot(state)
  // Snapshot iteration: newly registered listeners wait until the next event;
  // cancellation/destruction during dispatch prevents subsequent callbacks.
  for (const listener of [...(state.listeners.get(event) ?? [])]) {
    if (!state.listeners.get(event)?.has(listener)) continue
    try {
      listener(value)
    } catch (error) {
      console.error('[ticker] Event listener failed', error)
    }
    if (state.destroyed && event !== 'destroy') break
  }
}

const syncPlayback = (state: RuntimeTickerState): void => {
  const value = snapshot(state)
  state.wrapper.dataset.playing = String(value.playing)
  const key = JSON.stringify([value.requested, value.playing, value.reasons])
  if (key !== state.playbackKey) {
    state.playbackKey = key
    emit(state, 'playback')
  }
}

const handleVisibilityChange = (): void => tickersState.forEach(syncPlayback)

const handleMotionChange = (): void => {
  tickersState.forEach(state => {
    cancelNavigation(state)
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

const syncConfig = (state: RuntimeTickerState): void => {
  const { wrapper, track } = state
  const duration = validateDuration(wrapper.dataset.duration)
  const configuredDirection = validateDirection(wrapper.dataset.direction)
  const writingDirection = window.getComputedStyle(wrapper).direction
  state.rtl = writingDirection
    ? writingDirection === 'rtl'
    : wrapper.closest('[dir]')?.getAttribute('dir') === 'rtl'
  const direction =
    configuredDirection === 'auto' ? (state.rtl ? 'right' : 'left') : configuredDirection
  state.direction = direction
  state.vertical = direction === 'up' || direction === 'down'
  wrapper.dataset.axis = state.vertical ? 'vertical' : 'horizontal'
  wrapper.dataset.writingDirection = state.rtl ? 'rtl' : 'ltr'
  wrapper.dataset.motionDirection = direction
  const pauseOnHover = validatePauseOnHover(wrapper.dataset.pauseOnHover === 'true')
  const interactiveClones = validateInteractiveClones(wrapper.dataset.interactiveClones === 'true')

  const newInteractiveClones = interactiveClones ? 'true' : 'false'
  if (wrapper.dataset.interactiveClones !== newInteractiveClones) {
    wrapper.dataset.interactiveClones = newInteractiveClones
  }

  const speed = Number(wrapper.dataset.speed)
  state.duration =
    Number.isFinite(speed) && speed > 0 && state.measurement
      ? state.measurement.contentExtent / speed
      : duration
  const newDuration = `${state.duration}s`
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

  const position = readPosition(state)
  syncConfig(state)
  force = state.featured.sync() || force
  const contentRect = content.getBoundingClientRect()
  const wrapperRect = wrapper.getBoundingClientRect()

  const trackStyles = window.getComputedStyle(track)
  const gap =
    parseFloat((state.vertical ? trackStyles.rowGap : trackStyles.columnGap) || trackStyles.gap) ||
    0

  // The animation must travel exactly one content-and-gap period. Rounding
  // fractional layout widths introduces a visible offset when the loop resets.
  const hasItems =
    !state.featured.element ||
    Array.from(state.itemRoot.childNodes).some(
      node =>
        node instanceof Element || (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim())
    )
  const measuredExtent = hasItems ? (state.vertical ? contentRect.height : contentRect.width) : 0
  const contentExtent = measuredExtent > 0 ? measuredExtent + gap : 0
  const wrapperExtent = Math.ceil(state.vertical ? wrapperRect.height : wrapperRect.width)

  const reducedMotion = getReducedMotionMedia()?.matches ?? false
  const interactiveClones = wrapper.dataset.interactiveClones === 'true'
  const previous = state.measurement

  if (
    !force &&
    wrapper.dataset.ready === 'true' &&
    previous?.contentExtent === contentExtent &&
    previous.wrapperExtent === wrapperExtent &&
    previous.interactiveClones === interactiveClones &&
    previous.reducedMotion === reducedMotion &&
    previous.vertical === state.vertical
  ) {
    return
  }

  const wasNavigating = state.navigating
  cancelNavigation(state)
  if (wasNavigating) syncPlayback(state)
  if (state.destroyed) return
  wrapper.dataset.ready = 'false'
  removeClones(state)
  state.measurement = null
  if (!contentExtent || !wrapperExtent) {
    // A gap is not a sequence. Keep empty sources clone-free and let a later
    // refresh/resize recover when original content becomes measurable again.
    if (!contentExtent) state.position = 0
    wrapper.style.setProperty('--ticker-distance', '0px')
    syncPlayback(state)
    return
  }

  state.measurement = {
    contentExtent,
    wrapperExtent,
    interactiveClones,
    reducedMotion,
    vertical: state.vertical,
  }
  syncConfig(state)

  if (reducedMotion && wrapper.dataset.navigation !== 'true') {
    wrapper.style.setProperty('--ticker-distance', '0px')
    wrapper.dataset.ready = 'true'
    finishMeasurement(state, position)
    return
  }

  const clonesNeeded = Math.max(1, Math.ceil(wrapperExtent / contentExtent))
  const fragment = document.createDocumentFragment()

  for (let index = 0; index < clonesNeeded; index += 1) {
    const clone = content.cloneNode(true) as HTMLElement
    makeCloneAccessible(clone, interactiveClones)
    state.clones.push(clone)
    fragment.appendChild(clone)
  }

  track.appendChild(fragment)
  wrapper.style.setProperty('--ticker-distance', `${contentExtent}px`)
  wrapper.dataset.ready = 'true'
  finishMeasurement(state, previous?.vertical !== state.vertical ? 0 : position)
}

const finishMeasurement = (state: RuntimeTickerState, position: number): void => {
  seek(state, position)
  // A rebuild removes repeated slots; keep any focused original exposed after resize.
  revealFocused(state)
  if (!state.initialized) {
    state.initialized = true
    emit(state, 'ready')
  }
  emit(state, 'measure')
  syncPlayback(state)
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

const parseResponsive = (value?: string): NonNullable<TickerOptions['responsive']> => {
  if (!value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter(
          rule =>
            rule &&
            typeof rule.query === 'string' &&
            rule.options &&
            typeof rule.options === 'object'
        )
      : []
  } catch {
    return []
  }
}

const cancelNavigation = (state: RuntimeTickerState): void => {
  state.navigationRevision++
  cancelFrame(state.navigationFrame)
  window.clearTimeout(state.navigationTimer)
  state.navigationTimer = 0
  state.navigationFrame = 0
  state.navigating = false
  state.stepNavigation = undefined
}

const navigate = (
  state: RuntimeTickerState,
  position: number,
  fromDrag = false,
  options: TickerNavigationOptions = {},
  source: TickerSnapshot['navigationSource'] = fromDrag ? 'drag' : 'api',
  forward?: boolean
): void => {
  const previousPosition = readPosition(state)
  cancelNavigation(state)
  if (!fromDrag) state.intentRevision++
  if (!options.preservePlayback || fromDrag) {
    state.requested = false
    state.manualOverride = true
  }
  if (getReducedMotionMedia()?.matches && state.wrapper.dataset.navigation !== 'true') {
    state.wrapper.dataset.navigation = 'true'
    rebuildTickerState(state, true)
  }
  const duration = options.duration === undefined ? 300 : options.duration
  const resumeDelay =
    options.preservePlayback &&
    Number.isFinite(options.resumeDelay) &&
    Number(options.resumeDelay) > 0
      ? Math.min(Number(options.resumeDelay), 2147483647)
      : 0
  const smooth =
    !fromDrag &&
    options.behavior === 'smooth' &&
    Number.isFinite(duration) &&
    duration > 0 &&
    !getReducedMotionMedia()?.matches &&
    typeof window.requestAnimationFrame === 'function' &&
    (state.measurement?.contentExtent ?? 0) > 0 &&
    position !== previousPosition
  state.navigating = smooth || resumeDelay > 0
  if (smooth && forward !== undefined)
    state.stepNavigation = { forward, position: previousPosition, target: position }
  const revision = state.navigationRevision
  syncPlayback(state)
  if (state.destroyed || revision !== state.navigationRevision) return
  const complete = () => {
    state.navigationFrame = 0
    state.stepNavigation = undefined
    if (resumeDelay > 0) {
      state.navigationTimer = window.setTimeout(() => {
        if (state.destroyed || revision !== state.navigationRevision) return
        state.navigationTimer = 0
        state.navigating = false
        syncPlayback(state)
      }, resumeDelay)
    } else {
      state.navigating = false
      syncPlayback(state)
    }
    if (
      !state.destroyed &&
      revision === state.navigationRevision &&
      (smooth || Math.abs(state.position - previousPosition) > 0.000001)
    )
      emit(state, 'navigate', source)
  }
  if (!smooth) {
    seek(state, position)
    complete()
    return
  }
  let started: number | undefined
  const frame = (time: number) => {
    if (state.destroyed || revision !== state.navigationRevision) return
    started ??= time
    const progress = Math.min(1, Math.max(0, (time - started) / duration))
    const current = previousPosition + (position - previousPosition) * (1 - (1 - progress) ** 3)
    if (state.stepNavigation) state.stepNavigation.position = current
    seek(state, current)
    if (progress < 1) {
      state.navigationFrame = requestFrame(frame)
      return
    }
    complete()
  }
  state.navigationFrame = requestFrame(frame)
}

const revealFocused = (state: RuntimeTickerState): void => {
  const target = document.activeElement
  if (
    state.revealingFocus ||
    !state.featured.element ||
    !(target instanceof HTMLElement) ||
    !state.itemRoot.contains(target)
  )
    return
  const rect = target.getBoundingClientRect()
  const viewport = state.wrapper.getBoundingClientRect()
  const [start, end] = featuredViewport(
    state.featured.element,
    state.vertical,
    state.vertical ? viewport.top : viewport.left,
    state.vertical ? viewport.bottom : viewport.right,
    rect
  )
  const from = state.vertical ? rect.top : rect.left
  const size = state.vertical ? rect.height : rect.width
  const desired = Math.max(start, Math.min(from, end - size))
  const distance = (from - desired) * (state.rtl && !state.vertical ? -1 : 1)
  if (distance) navigate(state, readPosition(state) + distance, false, { preservePlayback: true })
  // Seeking wraps modulo a period. Move the original sequence into the
  // equivalent repeated slot so the focused ORIGINAL (not a hidden clone)
  // occupies the uncovered area, including across a cycle boundary.
  const period = state.measurement?.contentExtent ?? 0
  if (period > 0) {
    const after = target.getBoundingClientRect()
    const actual = state.vertical ? after.top : after.left
    const sequences = Array.from(state.track.children)
    const current = sequences.indexOf(state.content)
    const next = Math.max(
      0,
      Math.min(sequences.length - 1, current + Math.round((desired - actual) / period))
    )
    if (next !== current) {
      sequences.splice(current, 1)
      sequences.splice(next, 0, state.content)
      state.revealingFocus = true
      state.track.insertBefore(state.content, sequences[next + 1] ?? null)
      target.focus({ preventScroll: true })
      state.revealingFocus = false
    }
  }
}

const setupInteraction = (state: RuntimeTickerState): void => {
  const { wrapper, content } = state
  const abort = new AbortController()
  const { signal } = abort
  state.cleanup.push(() => abort.abort())
  wrapper.addEventListener(
    'mouseenter',
    () => {
      state.hovered = true
      syncPlayback(state)
    },
    { signal }
  )
  wrapper.addEventListener(
    'mouseleave',
    () => {
      state.hovered = false
      syncPlayback(state)
    },
    { signal }
  )
  wrapper.addEventListener(
    'focusin',
    () => {
      syncPlayback(state)
      revealFocused(state)
    },
    { signal }
  )
  wrapper.addEventListener(
    'focusout',
    event => {
      if (event.relatedTarget instanceof Node && wrapper.contains(event.relatedTarget)) return
      // focusout precedes activeElement being set to the new outside target.
      queueMicrotask(() => {
        if (!state.destroyed) syncPlayback(state)
      })
    },
    { signal }
  )
  // Captured load also catches images inserted after initialization.
  content.addEventListener('load', () => scheduleRebuild(state), { capture: true, signal })
  document.fonts?.ready
    .then(() => {
      if (!state.destroyed) scheduleRebuild(state)
    })
    .catch(() => {})
  let pointer:
    | {
        id: number
        x: number
        y: number
        start: number
        dragging: boolean
        requested: boolean
        manualOverride: boolean
        revision: number
      }
    | undefined
  let suppressClick = false
  wrapper.addEventListener(
    'pointerdown',
    event => {
      if (wrapper.dataset.navigation !== 'true' || event.isPrimary === false || event.button !== 0)
        return
      suppressClick = false
      if ((event.target as Element).closest('input, textarea, select, [contenteditable]')) return
      // Preserve focus for opt-in mouse actions on both moving and fixed items.
      // Fixed content stays clickable, but must not begin a drag controller.
      if (event.pointerType === 'mouse' && wrapper.dataset.resumeAfterDrag === 'true')
        event.preventDefault()
      if ((event.target as Element).closest('[data-ticker-featured]')) return
      cancelNavigation(state)
      syncPlayback(state)
      pointer = {
        id: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        start: readPosition(state),
        dragging: false,
        requested: state.requested,
        manualOverride: state.manualOverride,
        revision: state.intentRevision,
      }
    },
    { signal }
  )
  wrapper.addEventListener(
    'pointermove',
    event => {
      if (!pointer || pointer.id !== event.pointerId) return
      const primary = state.vertical ? event.clientY - pointer.y : event.clientX - pointer.x
      const perpendicular = state.vertical ? event.clientX - pointer.x : event.clientY - pointer.y
      if (!pointer.dragging) {
        if (Math.abs(perpendicular) > Math.max(6, Math.abs(primary))) {
          pointer = undefined
          return
        }
        if (Math.abs(primary) < 6) return
        pointer.requested = state.requested
        pointer.manualOverride = state.manualOverride
        pointer.revision = state.intentRevision
        pointer.dragging = true
        wrapper.setPointerCapture?.(event.pointerId)
      }
      event.preventDefault()
      suppressClick = true
      navigate(state, pointer.start - primary * (state.rtl && !state.vertical ? -1 : 1), true)
    },
    { signal }
  )
  const release = (event: PointerEvent) => {
    if (pointer?.id !== event.pointerId) return
    const finished = pointer
    pointer = undefined
    if (wrapper.hasPointerCapture?.(event.pointerId)) wrapper.releasePointerCapture(event.pointerId)
    if (
      !state.destroyed &&
      finished.dragging &&
      finished.requested &&
      finished.revision === state.intentRevision &&
      wrapper.dataset.resumeAfterDrag === 'true'
    ) {
      state.requested = true
      state.manualOverride = finished.manualOverride
      syncPlayback(state)
    }
  }
  wrapper.addEventListener(
    'dragstart',
    event => {
      // Native HTML link/image dragging must not cancel an active ticker gesture.
      if (pointer) event.preventDefault()
    },
    { signal }
  )
  wrapper.addEventListener('pointerup', release, { signal })
  wrapper.addEventListener('pointercancel', release, { signal })
  wrapper.addEventListener(
    'lostpointercapture',
    event => {
      // Touch starts with implicit capture on the original target. Transferring
      // it to the wrapper bubbles a lost event from that child.
      if (event.target === wrapper) release(event)
    },
    { signal }
  )
  wrapper.addEventListener(
    'click',
    event => {
      if (suppressClick) {
        event.preventDefault()
        event.stopPropagation()
        suppressClick = false
      }
    },
    { capture: true, signal }
  )
  state.cleanup.push(() => {
    if (pointer && wrapper.hasPointerCapture?.(pointer.id))
      wrapper.releasePointerCapture(pointer.id)
    pointer = undefined
  })
}

// Read original item geometry once per command, then project repeated copies
// mathematically. This also finds preceding copies at the cyclic boundary.
const itemStep = (
  state: RuntimeTickerState,
  forward: boolean,
  count: number,
  offset = 0
): number => {
  const period = state.measurement?.contentExtent ?? 0
  if (!period || state.wrapper.dataset.ready !== 'true') return 0
  const viewport = state.wrapper.getBoundingClientRect()
  const styles = window.getComputedStyle(state.wrapper)
  const vertical = state.vertical
  const rtl = state.rtl && !vertical
  const leadingBorder = parseFloat(vertical ? styles.borderTopWidth : styles.borderLeftWidth) || 0
  const trailingBorder =
    parseFloat(vertical ? styles.borderBottomWidth : styles.borderRightWidth) || 0
  const clipExtent = (vertical ? viewport.height : viewport.width) - leadingBorder - trailingBorder
  const padding = (value: string): number => {
    const number = parseFloat(value) || 0
    return Math.max(
      0,
      Math.min(clipExtent / 2, value.endsWith('%') ? (number * clipExtent) / 100 : number)
    )
  }
  let leading = padding(vertical ? styles.scrollPaddingTop : styles.scrollPaddingLeft)
  let trailing = padding(vertical ? styles.scrollPaddingBottom : styles.scrollPaddingRight)
  // Ignore an empty requested viewing area rather than trapping the controls.
  if (leading + trailing >= clipExtent) leading = trailing = 0
  const [startEdge, endEdge] = featuredViewport(
    state.featured.element,
    vertical,
    (vertical ? viewport.top : viewport.left) + leadingBorder + leading,
    (vertical ? viewport.bottom : viewport.right) - trailingBorder - trailing
  )
  const extent = endEdge - startEdge
  if (extent <= 0) return 0
  const candidates = Array.from(state.itemRoot.children)
    .flatMap(item => {
      if (item.getAttribute('aria-hidden') === 'true') return []
      const rect = item.getBoundingClientRect()
      if (!(state.vertical ? rect.height : rect.width)) return []
      let start = state.vertical
        ? rect.top - startEdge
        : rtl
          ? endEdge - rect.right
          : rect.left - startEdge
      let end = state.vertical
        ? rect.bottom - startEdge
        : rtl
          ? endEdge - rect.left
          : rect.right - startEdge
      // Measure at the pending destination without seeking or changing the DOM.
      start -= offset
      end -= offset
      if (!forward) [start, end] = [extent - end, extent - start]
      // A tiny tolerance excludes floating-point noise at an aligned boundary.
      const cycle = Math.floor((extent - end + 0.001) / period) + 1
      return [{ start: start + cycle * period, end: end + cycle * period }]
    })
    .sort((a, b) => a.end - b.end)
  if (!candidates.length) return 0
  const first = candidates[0]!
  const index = count - 1
  const target =
    candidates[index % candidates.length]!.end +
    Math.floor(index / candidates.length) * period -
    extent
  // Keep the first incoming item fully visible. Oversized items cannot fit:
  // reveal their trailing edge and do not advance additional items this time.
  const limit = Math.max(first.start, first.end - extent)
  return (forward ? 1 : -1) * Math.min(target, limit)
}

const connectControls = (state: RuntimeTickerState, controls: TickerControls): (() => void) => {
  if (state.destroyed) return () => {}
  const abort = new AbortController()
  const { signal } = abort
  const { previous, next, rail } = controls
  const originalRail = rail
    ? ['min', 'max', 'step', 'value', 'aria-controls', 'aria-orientation'].map(
        name => [name, rail.getAttribute(name)] as const
      )
    : []
  const pixelStep = Number.isFinite(controls.step) && Number(controls.step) > 0
  const navigationOptions: TickerNavigationOptions = {
    ...controls,
    behavior: controls.behavior ?? (pixelStep ? 'instant' : 'smooth'),
  }
  const distance = (forward: boolean, offset = 0) =>
    pixelStep
      ? (forward ? 1 : -1) * Number(controls.step)
      : itemStep(
          state,
          forward,
          Number.isSafeInteger(controls.itemsPerStep) && Number(controls.itemsPerStep) > 0
            ? Number(controls.itemsPerStep)
            : 1,
          offset
        )
  const step = (forward: boolean, source: 'control' | 'keyboard') => {
    const position = readPosition(state)
    const pending = state.stepNavigation
    // Continue same-direction clicks from the intended destination, even over
    // multiple cycles. Reversals start at the visible position immediately.
    const remaining = pending?.forward === forward ? pending.target - pending.position : 0
    navigate(
      state,
      position + remaining + distance(forward, remaining),
      false,
      navigationOptions,
      source,
      forward
    )
  }
  previous?.addEventListener('click', () => step(false, 'control'), {
    signal,
  })
  next?.addEventListener('click', () => step(true, 'control'), {
    signal,
  })
  const sync = () => {
    if (!rail) return
    rail.min = '0'
    rail.max = String(state.measurement?.contentExtent ?? 0)
    rail.step = 'any'
    rail.value = String(readPosition(state))
    // The supplied range may remain horizontal for a vertical ticker. ARIA
    // describes the control's rendered orientation, not the content axis.
    rail.setAttribute(
      'aria-orientation',
      window.getComputedStyle(rail).writingMode.startsWith('vertical') ? 'vertical' : 'horizontal'
    )
    if (state.wrapper.id) rail.setAttribute('aria-controls', state.wrapper.id)
  }
  rail?.addEventListener(
    'input',
    () =>
      navigate(
        state,
        Number(rail.value),
        false,
        { preservePlayback: controls.preservePlayback ?? false },
        'rail'
      ),
    { signal }
  )
  // Native range keyboard behavior differs across browser RTL/vertical modes;
  // make logical previous/next explicit, without intercepting content inputs.
  rail?.addEventListener(
    'keydown',
    event => {
      const forward = state.vertical
        ? event.key === 'ArrowDown'
        : event.key === (state.rtl ? 'ArrowLeft' : 'ArrowRight')
      const backward = state.vertical
        ? event.key === 'ArrowUp'
        : event.key === (state.rtl ? 'ArrowRight' : 'ArrowLeft')
      if (!forward && !backward && event.key !== 'Home' && event.key !== 'End') return
      event.preventDefault()
      if (forward || backward) {
        step(forward, 'keyboard')
        return
      }
      const period = state.measurement?.contentExtent ?? 0
      const target = event.key === 'Home' ? 0 : Math.max(0, period - 0.001)
      navigate(state, target, false, navigationOptions, 'keyboard')
    },
    { signal }
  )
  const events = ['measure', 'navigate', 'playback'] as const
  events.forEach(event => {
    let listeners = state.listeners.get(event)
    if (!listeners) state.listeners.set(event, (listeners = new Set()))
    listeners.add(sync)
  })
  // A connected rail reflects animation without emitting public frame events.
  const timer = rail
    ? window.setInterval(() => {
        if (state.wrapper.dataset.playing === 'true') sync()
      }, 100)
    : 0
  let disconnected = false
  const disconnect = () => {
    if (disconnected) return
    disconnected = true
    abort.abort()
    if (timer) window.clearInterval(timer)
    events.forEach(event => state.listeners.get(event)?.delete(sync))
    originalRail.forEach(([name, value]) =>
      value === null ? rail?.removeAttribute(name) : rail?.setAttribute(name, value)
    )
    const index = state.cleanup.indexOf(disconnect)
    if (index >= 0) state.cleanup.splice(index, 1)
  }
  state.cleanup.push(disconnect)
  sync()
  return disconnect
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

  state.position = readPosition(state)
  cancelNavigation(state)
  state.destroyed = true
  state.cleanup.splice(0).forEach(cleanup => cleanup())
  state.resizeObserver?.disconnect()
  state.intersectionObserver?.disconnect()
  removeClones(state)
  state.featured.destroy()

  tickersState.delete(wrapper)
  wrapper.dataset.active = 'false'
  wrapper.dataset.playing = 'false'
  wrapper.dataset.ready = 'false'
  emit(state, 'destroy')
  state.listeners.clear()
  if (!tickersState.size) removePlaybackListeners()
}

const initTicker = (wrapper: HTMLElement, itemRoot?: HTMLElement): void => {
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
    itemRoot: itemRoot ?? content,
    featured: createFeatured(itemRoot ?? content, wrapper),
    revealingFocus: false,
    ...createEmptyTickerState(),
    navigationFrame: 0,
    navigationTimer: 0,
    navigating: false,
    navigationRevision: 0,
    forceRebuild: false,
    measurement: null,
    requested: wrapper.dataset.autoplay !== 'false',
    manualOverride: false,
    intentRevision: 0,
    hovered: false,
    destroyed: false,
    position: 0,
    duration: 20,
    direction: 'left',
    vertical: false,
    rtl: false,
    listeners: new Map(),
    cleanup: [],
    playbackKey: '',
    initialized: false,
    rules: [],
  }

  tickersState.set(wrapper, state)
  if (tickersState.size === 1) addPlaybackListeners()

  wrapper.dataset.ready = 'false'
  wrapper.dataset.active = String(typeof window.IntersectionObserver !== 'function')
  syncPlayback(state)

  syncConfig(state)
  setupInteraction(state)
  setupObservers(state)
  scheduleRebuild(state)
}

const initAll = (root: ParentNode): void =>
  getTickerElements(root).forEach(element => {
    if (!tickersState.has(element)) ticker(element)
  })
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
  featuredPosition: normalizeFeaturedPosition(options.featuredPosition),
  speed: Number.isFinite(options.speed) && Number(options.speed) > 0 ? Number(options.speed) : 0,
  autoplay: options.autoplay !== false,
  pauseOnFocus: options.pauseOnFocus !== false,
  navigation: options.navigation === true,
  resumeAfterDrag: options.resumeAfterDrag === true,
  responsive: (Array.isArray(options.responsive) ? options.responsive : []).map(rule => ({
    query: String(rule.query),
    options: { ...rule.options },
  })),
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

  wrapper.dataset.featuredPosition = next.featuredPosition
  wrapper.dataset.speed = String(next.speed)
  wrapper.dataset.autoplay = String(next.autoplay)
  wrapper.dataset.pauseOnFocus = String(next.pauseOnFocus)
  wrapper.dataset.navigation = String(next.navigation)
  wrapper.dataset.resumeAfterDrag = String(next.resumeAfterDrag)
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
  if (element.hasAttribute('dir')) wrapper.setAttribute('dir', element.getAttribute('dir')!)
  if (element.style.direction) wrapper.style.direction = element.style.direction
  const tickerContent = isTickerContentElement(content) ? content : document.createElement('div')

  tickerContent.classList.add('ticker-content')
  tickerContent.dataset.tickerContent = ''
  if (tickerContent !== content) tickerContent.appendChild(content)
  track.appendChild(tickerContent)

  if (parent) parent.insertBefore(wrapper, nextSibling)
  if (element !== content && element.isConnected) element.remove()

  initTicker(wrapper, content)
  return wrapper
}

export const ticker = (
  target: TickerTarget,
  initialOptions: TickerOptions = {}
): TickerInstance | null => {
  const source = resolveTarget(target)
  if (!source) return null

  const ownsWrapper = !source.matches(TICKER_SELECTOR)
  const originalContent = ownsWrapper
    ? source.querySelector<HTMLElement>('[data-ticker-content], .ticker-content')
    : null
  const contentParent = originalContent?.parentNode
  const contentNext = originalContent?.nextSibling
  const markedContent = ownsWrapper
    ? isTickerContentElement(source)
      ? source
      : originalContent
    : null
  const hadContentClass = markedContent?.classList.contains('ticker-content') ?? false
  const contentMarker = markedContent?.getAttribute('data-ticker-content') ?? null
  const markupOptions: TickerOptions = ownsWrapper
    ? { featuredPosition: normalizeFeaturedPosition(source.dataset.featuredPosition) }
    : {
        duration: validateDuration(source.dataset.duration),
        featuredPosition: normalizeFeaturedPosition(source.dataset.featuredPosition),
        speed: Number(source.dataset.speed),
        autoplay: source.dataset.autoplay !== 'false',
        pauseOnFocus: source.dataset.pauseOnFocus !== 'false',
        navigation: source.dataset.navigation === 'true',
        resumeAfterDrag: source.dataset.resumeAfterDrag === 'true',
        responsive: parseResponsive(source.dataset.responsive),
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

  const runtime = tickersState.get(wrapper)
  if (!runtime) return null
  let ruleCleanup = () => {}
  const resolveOptions = () => {
    if (!wrapper || runtime.destroyed) return
    const position = readPosition(runtime)
    const effective = runtime.rules.reduce(
      (value, rule) => (rule.media.matches ? { ...value, ...rule.options } : value),
      { ...currentOptions }
    )
    const next = normalizeOptions(effective)
    applyOptions(wrapper, runtime.configured ?? {}, next)
    if (!runtime.manualOverride) runtime.requested = next.autoplay
    const changed = JSON.stringify(runtime.configured) !== JSON.stringify(next)
    runtime.configured = next
    syncConfig(runtime)
    seek(runtime, position)
    syncPlayback(runtime)
    refreshTicker(wrapper)
    if (changed) emit(runtime, 'update')
  }
  const configureRules = () => {
    ruleCleanup()
    runtime.rules =
      typeof window.matchMedia === 'function'
        ? currentOptions.responsive.map(rule => ({
            media: window.matchMedia(rule.query),
            options: { ...rule.options },
          }))
        : []
    const removals = runtime.rules.map(({ media }) => {
      if (media.addEventListener) {
        media.addEventListener('change', resolveOptions)
        return () => media.removeEventListener('change', resolveOptions)
      }
      media.addListener?.(resolveOptions)
      return () => media.removeListener?.(resolveOptions)
    })
    ruleCleanup = () => removals.forEach(remove => remove())
    resolveOptions()
  }
  runtime.cleanup.push(() => ruleCleanup())
  configureRules()

  const instance: TickerInstance = {
    get element() {
      return wrapper
    },
    source,
    get featured() {
      return runtime.destroyed ? null : runtime.featured.element
    },
    setFeatured(element) {
      if (runtime.destroyed) return instance
      runtime.featured.set(element)
      rebuildTickerState(runtime, true)
      emit(runtime, 'update')
      return instance
    },
    get options() {
      return {
        ...currentOptions,
        responsive: currentOptions.responsive.map(rule => ({
          ...rule,
          options: { ...rule.options },
        })),
      }
    },
    get state() {
      return snapshot(runtime)
    },
    play() {
      if (!runtime.destroyed) {
        cancelNavigation(runtime)
        runtime.intentRevision++
        runtime.requested = true
        runtime.manualOverride = true
        syncPlayback(runtime)
      }
      return instance
    },
    pause() {
      if (!runtime.destroyed) {
        cancelNavigation(runtime)
        runtime.intentRevision++
        runtime.requested = false
        runtime.manualOverride = true
        syncPlayback(runtime)
      }
      return instance
    },
    scrollTo(position, options) {
      if (!runtime.destroyed && Number.isFinite(position))
        navigate(runtime, position, false, options)
      return instance
    },
    scrollBy(distance, options) {
      if (!runtime.destroyed && Number.isFinite(distance))
        navigate(runtime, readPosition(runtime) + distance, false, options)
      return instance
    },
    connectControls(controls) {
      return connectControls(runtime, controls)
    },
    on(event, listener) {
      if (runtime.destroyed) return () => {}
      let listeners = runtime.listeners.get(event)
      if (!listeners) runtime.listeners.set(event, (listeners = new Set()))
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    update(options = {}) {
      if (!wrapper) return instance
      if (runtime.destroyed) return instance
      cancelNavigation(runtime)
      const nextOptions = normalizeOptions({ ...currentOptions, ...options })
      if ('autoplay' in options) {
        cancelNavigation(runtime)
        runtime.intentRevision++
        runtime.requested = nextOptions.autoplay
        runtime.manualOverride = false
      }
      currentOptions = nextOptions
      configureRules()
      return instance
    },
    refresh() {
      if (wrapper) refreshTicker(wrapper)
      return instance
    },
    destroy() {
      if (!wrapper) return
      destroyTicker(wrapper)
      if (ownsWrapper) {
        if (originalContent && contentParent)
          contentParent.insertBefore(originalContent, contentNext ?? null)
        if (markedContent) {
          if (!hadContentClass) markedContent.classList.remove('ticker-content')
          if (contentMarker === null) markedContent.removeAttribute('data-ticker-content')
          else markedContent.setAttribute('data-ticker-content', contentMarker)
        }
        if (wrapper.parentNode) wrapper.replaceWith(source)
      }
      wrapper = null
    },
  }

  return instance
}

export { destroyTicker, initTicker }
