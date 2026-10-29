export type TickerDirection = 'left' | 'right' | 'up' | 'down' | 'auto'

export interface TickerResponsiveRule {
  query: string
  options: Omit<TickerOptions, 'responsive' | 'class'>
}

export interface TickerOptions {
  /** Seconds per cycle; speed takes precedence when positive. */
  duration?: number
  speed?: number
  autoplay?: boolean
  pauseOnFocus?: boolean
  navigation?: boolean
  /** Restore prior playback intent after pointer dragging; defaults to false. */
  resumeAfterDrag?: boolean
  /** Viewport media queries, merged in array order after base options. */
  responsive?: readonly TickerResponsiveRule[]
  direction?: TickerDirection
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}

export type NormalizedTickerOptions = Required<TickerOptions>

export type TickerTarget = string | HTMLElement

export type TickerPauseReason =
  'manual' | 'hover' | 'focus' | 'hidden' | 'offscreen' | 'reduced-motion' | 'navigation'

export interface TickerSnapshot {
  /** Present on navigate events; distinguishes pointer gestures from controls. */
  readonly navigationSource?: 'api' | 'control' | 'rail' | 'keyboard' | 'drag'
  readonly ready: boolean
  readonly destroyed: boolean
  readonly requested: boolean
  readonly playing: boolean
  readonly reasons: readonly TickerPauseReason[]
  /** Logical distance into the repeated sequence, in CSS pixels. */
  readonly position: number
  readonly distance: number
  readonly duration: number
  readonly direction: Exclude<TickerDirection, 'auto'>
}

export interface TickerEventMap {
  ready: TickerSnapshot
  playback: TickerSnapshot
  update: TickerSnapshot
  measure: TickerSnapshot
  navigate: TickerSnapshot
  destroy: TickerSnapshot
}

export interface TickerNavigationOptions {
  /** Pixel seeks default to instant; item controls default to smooth cubic ease-out. */
  behavior?: 'instant' | 'smooth'
  /** Smooth step duration in milliseconds; defaults to 300. */
  duration?: number
  /** Retain requested playback, including a manual pause; defaults to false. */
  preservePlayback?: boolean
}

export interface TickerControls extends TickerNavigationOptions {
  previous?: HTMLButtonElement
  next?: HTMLButtonElement
  rail?: HTMLInputElement
  /** Items to reveal per arrow/keyboard step; positive integer, defaults to 1. */
  itemsPerStep?: number
  /** Positive CSS pixels per step; overrides item navigation when supplied. */
  step?: number
}

export interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  readonly state: Readonly<TickerSnapshot>
  play: () => TickerInstance
  pause: () => TickerInstance
  scrollTo: (position: number, options?: TickerNavigationOptions) => TickerInstance
  scrollBy: (distance: number, options?: TickerNavigationOptions) => TickerInstance
  connectControls: (controls: TickerControls) => () => void
  on: <K extends keyof TickerEventMap>(
    event: K,
    listener: (state: TickerEventMap[K]) => void
  ) => () => void
  update: (options?: TickerOptions) => TickerInstance
  refresh: () => TickerInstance
  destroy: () => void
}

export interface TickerState {
  wrapper: HTMLElement
  track: HTMLElement
  content: HTMLElement
  clones: HTMLElement[]
  frameId: number
  resizeTimeout: number | null
  resizeObserver: ResizeObserver | null
  intersectionObserver: IntersectionObserver | null
}

export interface TickerManagerState {
  isMounted: boolean
  mutationObserver: MutationObserver | null
}

export const DEFAULT_OPTIONS: Required<
  Pick<TickerOptions, 'duration' | 'direction' | 'pauseOnHover' | 'interactiveClones'>
> = {
  duration: 20,
  direction: 'left',
  pauseOnHover: false,
  interactiveClones: false,
}
