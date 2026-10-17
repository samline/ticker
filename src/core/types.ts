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
  'manual' | 'hover' | 'focus' | 'hidden' | 'offscreen' | 'reduced-motion'

export interface TickerSnapshot {
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

export interface TickerControls {
  previous?: HTMLButtonElement
  next?: HTMLButtonElement
  rail?: HTMLInputElement
  /** CSS pixels per button press; defaults to the visible extent. */
  step?: number
}

export interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
  readonly state: Readonly<TickerSnapshot>
  play: () => TickerInstance
  pause: () => TickerInstance
  scrollTo: (position: number) => TickerInstance
  scrollBy: (distance: number) => TickerInstance
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
