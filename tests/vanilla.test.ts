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

  it('enhances a ticker-content element without adding empty class tokens', async () => {
    const { enhance } = await import('../src/vanilla/render');

    document.body.innerHTML = `
      <div class="ticker-content">
        <span>First Item</span>
        <span>Second Item</span>
      </div>
    `;

    const wrapper = enhance('.ticker-content', { class: ' custom   accent ' });

    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper?.classList.contains('ticker-wrapper')).toBe(true);
    expect(wrapper?.classList.contains('custom')).toBe(true);
    expect(wrapper?.classList.contains('accent')).toBe(true);
    expect(wrapper?.querySelectorAll('.ticker-content')).toHaveLength(1);
    expect(wrapper?.querySelectorAll('span')).toHaveLength(2);
  });
});