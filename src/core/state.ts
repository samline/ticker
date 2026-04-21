import type { TickerState, TickerManagerState, TickerDirection } from './types';

export const DEFAULT_TICKER_DIRECTION: TickerDirection = 'left';
export const DEFAULT_DURATION = 20;

export const createEmptyTickerState = (): Omit<TickerState, 'wrapper' | 'track' | 'content'> => ({
  clones: [],
  frameId: 0,
  resizeTimeout: null,
  resizeObserver: null,
  intersectionObserver: null,
});

export const createEmptyManagerState = (): TickerManagerState => ({
  isMounted: false,
  mutationObserver: null,
});

export const validateDuration = (duration: unknown): number => {
  const parsed = typeof duration === 'number' ? duration : parseFloat(String(duration));
  const valid = Number.isFinite(parsed) && parsed > 0;
  return valid ? parsed : DEFAULT_DURATION;
};

export const validateDirection = (direction: unknown): TickerDirection => {
  return direction === 'right' ? 'right' : 'left';
};

export const validatePauseOnHover = (pauseOnHover: unknown): boolean => {
  return pauseOnHover === true;
};