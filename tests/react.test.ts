import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeTickerRoot, splitClassNameTokens } from '../src/react/Ticker';

describe('ticker react', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div
        class="ticker-wrapper"
        data-ticker=""
        data-duration="20"
        data-direction="left"
        data-pause-on-hover="false"
        data-ready="false"
        data-active="true"
        style="--ticker-duration: 20s"
      >
        <div class="ticker-track" data-ticker-track="">
          <div class="ticker-content" data-ticker-content="">
            <span>Alpha</span>
            <span>Beta</span>
          </div>
        </div>
      </div>
    `;

    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('filters empty class tokens before DOMTokenList usage', () => {
    expect(splitClassNameTokens('')).toEqual([]);
    expect(splitClassNameTokens('   featured   highlight  ')).toEqual([
      'featured',
      'highlight',
    ]);
  });

  it('initializes the rendered ticker without detaching its children', () => {
    const wrapper = document.querySelector<HTMLElement>('[data-ticker]');
    const content = wrapper?.querySelector<HTMLElement>('[data-ticker-content]');

    expect(wrapper).toBeInstanceOf(HTMLElement);
    expect(content?.children).toHaveLength(2);

    const cleanup = initializeTickerRoot(wrapper as HTMLElement);

    expect(content?.children).toHaveLength(2);
    cleanup();
  });
});