import {
  mount,
  unmount,
  refresh,
  createTicker,
  enhance,
  initTicker,
  destroyTicker,
  rebuildTicker,
} from '../vanilla/render';
import type { TickerOptions, TickerController } from '../core/types';

const Ticker = {
  mount,
  unmount,
  refresh,
  createTicker,
  enhance,
  initTicker,
  destroyTicker,
  rebuildTicker,
};

declare global {
  interface Window {
    Ticker?: typeof Ticker;
  }
}

if (typeof window !== 'undefined') {
  window.Ticker = Ticker;
}

export default Ticker;
export { mount, unmount, refresh, createTicker, enhance, initTicker, destroyTicker, rebuildTicker };
export type { TickerOptions, TickerController } from '../core/types';