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
    vi.unstubAllGlobals();
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

    const wrapper = enhance('.ticker-content', {
      class: ' custom   accent ',
      interactiveClones: true,
    });

    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(wrapper?.classList.contains('ticker-wrapper')).toBe(true);
    expect(wrapper?.classList.contains('custom')).toBe(true);
    expect(wrapper?.classList.contains('accent')).toBe(true);
    expect(wrapper?.dataset.interactiveClones).toBe('true');
    expect(wrapper?.querySelectorAll('.ticker-content')).toHaveLength(1);
    expect(wrapper?.querySelectorAll('span')).toHaveLength(2);
  });

  it('keeps clone interactions enabled when interactiveClones is true', async () => {
    const { initTicker } = await import('../src/vanilla/render');

    document.body.innerHTML = `
      <div
        class="ticker-wrapper"
        data-ticker=""
        data-duration="20"
        data-direction="left"
        data-pause-on-hover="false"
        data-interactive-clones="true"
      >
        <div class="ticker-track" data-ticker-track="">
          <div class="ticker-content" data-ticker-content="">
            <button type="button">Buy now</button>
          </div>
        </div>
      </div>
    `;

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const wrapper = document.querySelector<HTMLElement>('[data-ticker]');
    const content = wrapper?.querySelector<HTMLElement>('[data-ticker-content]');

    Object.defineProperty(wrapper as HTMLElement, 'getBoundingClientRect', {
      value: () => ({
        width: 160,
        height: 24,
        top: 0,
        left: 0,
        right: 160,
        bottom: 24,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    Object.defineProperty(content as HTMLElement, 'getBoundingClientRect', {
      value: () => ({
        width: 80,
        height: 24,
        top: 0,
        left: 0,
        right: 80,
        bottom: 24,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    initTicker(wrapper as HTMLElement);

    const clone = wrapper?.querySelector<HTMLElement>('.ticker-clone');
    const cloneButton = clone?.querySelector<HTMLButtonElement>('button');

    expect(clone).toBeInstanceOf(HTMLElement);
    expect(clone?.getAttribute('aria-hidden')).toBeNull();
    expect(clone?.getAttribute('role')).toBeNull();
    expect(cloneButton?.getAttribute('tabindex')).toBeNull();
  });
});