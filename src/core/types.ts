export type TickerDirection = 'left' | 'right'

export interface TickerOptions {
  duration?: number
  direction?: TickerDirection
  pauseOnHover?: boolean
  interactiveClones?: boolean
  class?: string
}

export type NormalizedTickerOptions = Required<TickerOptions>

export type TickerTarget = string | HTMLElement

export interface TickerInstance {
  readonly element: HTMLElement | null
  readonly source: HTMLElement
  readonly options: Readonly<NormalizedTickerOptions>
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
