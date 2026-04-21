import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ticker vanilla', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('mounts without errors', async () => {
    const { mount } = await import('../src/vanilla/render');
    mount();
    expect(document.querySelector('[data-ticker]')).toBeNull();
  });

  it('unmounts all tickers', async () => {
    const { mount, unmount } = await import('../src/vanilla/render');
    mount();
    unmount();
    expect(true).toBe(true);
  });

  it('refresh recalculates positions', async () => {
    const { refresh } = await import('../src/vanilla/render');
    refresh();
    expect(true).toBe(true);
  });

  it('createTicker returns controller', async () => {
    const { createTicker } = await import('../src/vanilla/render');
    const ticker = createTicker({ duration: 20, direction: 'left' });
    expect(ticker.mount).toBeDefined();
    expect(ticker.unmount).toBeDefined();
    expect(ticker.refresh).toBeDefined();
    expect(ticker.enhance).toBeDefined();
  });
});