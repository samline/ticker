export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export const isFirefox = (): boolean => {
  if (typeof window === 'undefined') return false;
  return navigator.userAgent.toLowerCase().includes('firefox');
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.platform) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getComputedStyle = (element: Element): CSSStyleDeclaration => {
  return window.getComputedStyle(element);
};

export const matchesMediaQuery = (query: string): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
};

export const supportsReducedMotion = (): boolean => {
  return matchesMediaQuery('(prefers-reduced-motion: reduce)');
};

export const supportsIntersectionObserver = (): boolean => {
  return typeof IntersectionObserver !== 'undefined';
};

export const supportsResizeObserver = (): boolean => {
  return typeof ResizeObserver !== 'undefined';
};