export const isServer = typeof window === 'undefined';

export const isBrowser = typeof window !== 'undefined';

export const isElement = (value: unknown): value is Element => {
  return value instanceof Element;
};

export const isHTMLElement = (value: unknown): value is HTMLElement => {
  return value instanceof HTMLElement;
};

export const generateId = (prefix = 'ticker'): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

export const parseStyleValue = (value: string | number | undefined, unit = ''): string => {
  if (value === undefined || value === null) return '';
  return typeof value === 'number' ? `${value}${unit}` : value;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

export const raf = (callback: () => void): number => {
  return requestAnimationFrame(callback);
};

export const cancelRaf = (id: number): void => {
  cancelAnimationFrame(id);
};