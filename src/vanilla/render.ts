import type { TickerState, TickerManagerState, TickerOptions } from '../core/types';
import {
  validateDuration,
  validateDirection,
  validatePauseOnHover,
  createEmptyTickerState,
  createEmptyManagerState,
} from '../core/state';
import {
  TICKER_SELECTOR,
  TICKER_CLONE_CLASS,
  REDUCED_MOTION_QUERY,
  FOCUSABLE_SELECTOR,
} from '../constants';

const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY) as MediaQueryList & {
  addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
};

const tickersState = new Map<HTMLElement, TickerState>();
let managerState: TickerManagerState = createEmptyManagerState();

const isSearchableRoot = (
  value: unknown,
): value is Element | Document | DocumentFragment => {
  if (!value || typeof value !== 'object') return false;
  const node = value as { nodeType?: number };
  return (
    node.nodeType === Node.ELEMENT_NODE ||
    node.nodeType === Node.DOCUMENT_NODE ||
    node.nodeType === Node.DOCUMENT_FRAGMENT_NODE
  );
};

const getTickerElements = (root: ParentNode): HTMLElement[] => {
  if (!isSearchableRoot(root) || !('querySelectorAll' in root)) return [];

  const elements: HTMLElement[] = [];
  if ('matches' in root && root.matches(TICKER_SELECTOR)) {
    elements.push(root as HTMLElement);
  }
  root.querySelectorAll<HTMLElement>(TICKER_SELECTOR).forEach((el) => elements.push(el));
  return elements;
};

const makeCloneAccessible = (clone: Element): void => {
  clone.classList.add(TICKER_CLONE_CLASS);
  clone.setAttribute('aria-hidden', 'true');
  clone.setAttribute('role', 'presentation');

  if ('inert' in clone) {
    (clone as HTMLElement & { inert: boolean }).inert = true;
    return;
  }

  clone.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR).forEach((el) =>
    el.setAttribute('tabindex', '-1'),
  );
};

const removeClones = (state: TickerState): void => {
  state.clones.forEach((clone) => clone.remove());
  state.clones = [];
};

const syncConfig = (state: TickerState): void => {
  const { wrapper, track } = state;
  const duration = validateDuration(wrapper.dataset.duration);
  const direction = validateDirection(wrapper.dataset.direction);
  const pauseOnHover = validatePauseOnHover(wrapper.dataset.pauseOnHover === 'true');

  if (wrapper.dataset.direction !== direction) {
    wrapper.dataset.direction = direction;
  }

  const newDuration = `${duration}s`;
  const currentDuration = wrapper.style.getPropertyValue('--ticker-duration');
  if (currentDuration !== newDuration) {
    wrapper.style.setProperty('--ticker-duration', newDuration);
  }

  const hasPauseClass = track.classList.contains('ticker-pause-on-hover');
  if (hasPauseClass !== pauseOnHover) {
    track.classList.toggle('ticker-pause-on-hover', pauseOnHover);
  }
};

const rebuildTicker = (state: TickerState): void => {
  const { wrapper, track, content } = state;
  if (!track || !content || !wrapper.isConnected) return;

  syncConfig(state);
  wrapper.dataset.ready = 'false';
  removeClones(state);

  const contentRect = content.getBoundingClientRect();
  const wrapperRect = wrapper.getBoundingClientRect();

  const trackStyles = window.getComputedStyle(track);
  const gap = parseFloat(trackStyles.gap) || 0;

  const contentWidth = Math.ceil(contentRect.width + gap);
  const wrapperWidth = Math.ceil(wrapperRect.width);

  if (!contentWidth || !wrapperWidth) return;

  if (reducedMotionMedia.matches) {
    wrapper.style.setProperty('--ticker-distance', '0px');
    wrapper.dataset.ready = 'true';
    return;
  }

  const clonesNeeded = Math.max(1, Math.ceil(wrapperWidth / contentWidth));
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < clonesNeeded; index += 1) {
    const clone = content.cloneNode(true) as HTMLElement;
    makeCloneAccessible(clone);
    state.clones.push(clone);
    fragment.appendChild(clone);
  }

  track.appendChild(fragment);
  wrapper.style.setProperty('--ticker-distance', `${contentWidth}px`);
  wrapper.dataset.ready = 'true';
};

const scheduleRebuild = (state: TickerState): void => {
  if (!state.track || !state.content) return;
  if (state.frameId) cancelAnimationFrame(state.frameId);

  state.frameId = requestAnimationFrame(() => {
    state.frameId = 0;
    rebuildTicker(state);
  });
};

const setupObservers = (state: TickerState): void => {
  const { wrapper, content } = state;

  if ('ResizeObserver' in window) {
    state.resizeObserver = new ResizeObserver(() => {
      if (state.resizeTimeout) clearTimeout(state.resizeTimeout);
      state.resizeTimeout = window.setTimeout(() => scheduleRebuild(state), 150);
    });
    state.resizeObserver.observe(wrapper);
    state.resizeObserver.observe(content);
  }

  if ('IntersectionObserver' in window) {
    state.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const isActive = entry?.isIntersecting ?? true;
        if (wrapper.dataset.active !== String(isActive)) {
          wrapper.dataset.active = isActive ? 'true' : 'false';
        }
        if (isActive) scheduleRebuild(state);
      },
      { rootMargin: '120px 0px' },
    );
    state.intersectionObserver.observe(wrapper);
  }
};

const destroyTicker = (wrapper: HTMLElement): void => {
  const state = tickersState.get(wrapper);
  if (!state) return;

  if (state.frameId) cancelAnimationFrame(state.frameId);
  if (state.resizeTimeout) clearTimeout(state.resizeTimeout);

  state.resizeObserver?.disconnect();
  state.intersectionObserver?.disconnect();
  removeClones(state);

  tickersState.delete(wrapper);
};

const initTicker = (wrapper: HTMLElement): void => {
  if (tickersState.has(wrapper)) return;

  const track =
    wrapper.querySelector<HTMLElement>('[data-ticker-track]') ||
    wrapper.querySelector<HTMLElement>('.ticker-track');
  const content =
    wrapper.querySelector<HTMLElement>('[data-ticker-content]') ||
    wrapper.querySelector<HTMLElement>('.ticker-content');

  if (!track || !content) return;

  const state: TickerState = {
    wrapper,
    track,
    content,
    ...createEmptyTickerState(),
  };

  tickersState.set(wrapper, state);

  wrapper.dataset.ready = 'false';
  wrapper.dataset.active = 'true';

  syncConfig(state);
  setupObservers(state);
  scheduleRebuild(state);
};

const initAll = (root: ParentNode): void => getTickerElements(root).forEach(initTicker);
const destroyAll = (root: ParentNode): void => getTickerElements(root).forEach(destroyTicker);
const refreshAll = (): void => tickersState.forEach((state) => scheduleRebuild(state));

const handleMutations = (mutations: MutationRecord[]): void => {
  if (!managerState.isMounted) return;
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (isSearchableRoot(node)) initAll(node);
    });
    mutation.removedNodes.forEach((node) => {
      if (isSearchableRoot(node)) destroyAll(node);
    });
  });
};

const handleReady = (): void => {
  if (!managerState.isMounted) return;
  initAll(document);

  if ('MutationObserver' in window && document.body && !managerState.mutationObserver) {
    managerState.mutationObserver = new MutationObserver(handleMutations);
    managerState.mutationObserver.observe(document.body, { childList: true, subtree: true });
  }
};

const handleEventUpdate = (): void => {
  if (managerState.isMounted) refreshAll();
};

export const mountManager = (): void => {
  managerState.isMounted = true;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleReady, { once: true });
  } else {
    handleReady();
  }

  if ('fonts' in document) {
    document.fonts.ready.then(handleEventUpdate).catch(() => {});
  }

  window.addEventListener('load', handleEventUpdate, { once: true });
  if (typeof window.ResizeObserver === 'undefined') {
    window.addEventListener('resize', handleEventUpdate, { passive: true });
  }

  if (typeof (reducedMotionMedia as MediaQueryList & { addEventListener?: unknown }).addEventListener === 'function') {
    reducedMotionMedia.addEventListener('change', handleEventUpdate);
  } else if (typeof reducedMotionMedia.addListener === 'function') {
    reducedMotionMedia.addListener(handleEventUpdate);
  }
};

export const unmountManager = (): void => {
  managerState.isMounted = false;

  document.removeEventListener('DOMContentLoaded', handleReady);
  window.removeEventListener('load', handleEventUpdate);
  window.removeEventListener('resize', handleEventUpdate);

  managerState.mutationObserver?.disconnect();
  managerState.mutationObserver = null;

  if (typeof (reducedMotionMedia as MediaQueryList & { removeEventListener?: unknown }).removeEventListener === 'function') {
    reducedMotionMedia.removeEventListener('change', handleEventUpdate);
  } else if (typeof reducedMotionMedia.removeListener === 'function') {
    reducedMotionMedia.removeListener(handleEventUpdate);
  }

  Array.from(tickersState.keys()).forEach(destroyTicker);
};

export const mount = (): void => mountManager();
export const unmount = (): void => unmountManager();
export const refresh = (): void => refreshAll();

export const createTicker = (options: TickerOptions = {}): { mount: () => void; unmount: () => void; refresh: () => void; enhance: (element: HTMLElement) => HTMLElement } => {
  const { duration = 20, direction = 'left', pauseOnHover = false, class: className = '' } = options;

  const createWrapper = (content: HTMLElement): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('ticker-wrapper', className);
    wrapper.setAttribute('data-ticker', '');
    wrapper.setAttribute('data-duration', String(duration));
    wrapper.setAttribute('data-direction', direction);
    wrapper.setAttribute('data-pause-on-hover', pauseOnHover ? 'true' : 'false');
    wrapper.setAttribute('data-ready', 'false');
    wrapper.style.setProperty('--ticker-duration', `${duration}s`);

    const track = document.createElement('div');
    track.classList.add('ticker-track');
    if (pauseOnHover) track.classList.add('ticker-pause-on-hover');
    track.setAttribute('data-ticker-track', '');

    const tickerContent = document.createElement('div');
    tickerContent.classList.add('ticker-content');
    tickerContent.setAttribute('data-ticker-content', '');

    tickerContent.appendChild(content);
    track.appendChild(tickerContent);
    wrapper.appendChild(track);

    return wrapper;
  };

  const enhanceElement = (element: HTMLElement): HTMLElement => {
    const content =
      element.querySelector<HTMLElement>('[data-ticker-content]') ||
      element.querySelector<HTMLElement>('.ticker-content') ||
      element;

    const wrapper = createWrapper(content);
    element.replaceWith(wrapper);
    initTicker(wrapper);

    return wrapper;
  };

  return {
    mount: () => {
      managerState.isMounted = true;
      handleReady();
    },
    unmount: () => {
      unmountManager();
    },
    refresh: () => {
      refreshAll();
    },
    enhance: enhanceElement,
  };
};

export const enhance = (selector: string | HTMLElement, tickerOptions: TickerOptions = {}): HTMLElement | null => {
  const element = typeof selector === 'string' ? document.querySelector<HTMLElement>(selector) : selector;
  if (!element) return null;

  const ticker = createTicker(tickerOptions);
  return ticker.enhance(element);
};

export { initTicker, destroyTicker, rebuildTicker };