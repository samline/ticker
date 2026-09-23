import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi
    .fn()
    .mockImplementation((query) => ({
      matches: false,
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
});

describe('browser registry', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="news"><span>News</span></div>';
  });
  afterEach(async () => {
    (await import('../src/browser/registry')).browser.destroyTickers();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('shares one namespace and registers tickers by id', async () => {
    const { browser, Ticker } = await import('../src/browser/registry');
    expect(browser).toBe(Ticker);
    const wrapper = browser.newTicker({
      id: 'news',
      options: { duration: 12 },
    });
    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(browser.available.news).toBe(wrapper);
    expect(browser.getTicker('news')).toBe(wrapper);
    expect(browser.getTickers().news).toBe(wrapper);
  });

  it('replaces the same id without nesting wrappers', async () => {
    const { browser } = await import('../src/browser/registry');
    browser.newTicker({ id: 'news' });
    const replacement = browser.newTicker({
      id: 'news',
      options: { direction: 'right' },
    });
    expect(document.querySelectorAll('.ticker-wrapper')).toHaveLength(1);
    expect(replacement?.dataset.direction).toBe('right');
  });

  it('clears the registry and restores the source DOM', async () => {
    const { browser } = await import('../src/browser/registry');
    const source = document.getElementById('news');
    browser.newTicker({ id: 'news' });
    browser.destroyTicker('news');
    expect(browser.getTicker('news')).toBeNull();
    expect(browser.available.news).toBeUndefined();
    expect(document.getElementById('news')).toBe(source);
    expect(document.querySelector('.ticker-wrapper')).toBeNull();
  });

  it('validates ids and missing elements', async () => {
    const { browser } = await import('../src/browser/registry');
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(browser.newTicker({ id: '' })).toBeNull();
    expect(browser.newTicker({ id: 'missing' })).toBeNull();
    expect(error).toHaveBeenCalledWith('Ticker ID is required');
    expect(warn).toHaveBeenCalledWith('Ticker with ID missing not found');
  });
});
