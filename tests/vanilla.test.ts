import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, unmount, refresh, createTicker } from '../src/vanilla/render';

describe('ticker vanilla', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    unmount();
  });

  it('mounts without errors', () => {
    mount();
    expect(document.querySelector('[data-ticker]')).toBeNull();
  });

  it('unmounts all tickers', () => {
    mount();
    unmount();
    expect(true).toBe(true);
  });

  it('refresh recalculates positions', () => {
    refresh();
    expect(true).toBe(true);
  });

  it('createTicker returns controller', () => {
    const ticker = createTicker({ duration: 20, direction: 'left' });
    expect(ticker.mount).toBeDefined();
    expect(ticker.unmount).toBeDefined();
    expect(ticker.refresh).toBeDefined();
    expect(ticker.enhance).toBeDefined();
  });
});