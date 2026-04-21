export type TickerDirection = 'left' | 'right';

export interface TickerOptions {
  duration?: number;
  direction?: TickerDirection;
  pauseOnHover?: boolean;
  class?: string;
}

export interface TickerState {
  wrapper: HTMLElement;
  track: HTMLElement;
  content: HTMLElement;
  clones: HTMLElement[];
  frameId: number;
  resizeTimeout: number | null;
  resizeObserver: ResizeObserver | null;
  intersectionObserver: IntersectionObserver | null;
}

export interface TickerManagerState {
  isMounted: boolean;
  mutationObserver: MutationObserver | null;
}

export interface TickerController {
  mount: () => void;
  unmount: () => void;
  refresh: () => void;
  enhance?: (element: HTMLElement) => HTMLElement;
}

export type TickerEventCallback = (element: HTMLElement) => void;

export type CreateTickerOptions = TickerOptions & {
  element?: HTMLElement | string;
};

export const DEFAULT_OPTIONS: Required<Pick<TickerOptions, 'duration' | 'direction' | 'pauseOnHover'>> = {
  duration: 20,
  direction: 'left',
  pauseOnHover: false,
};