import { Ticker, type TickerApi } from './registry';

declare global {
  interface Window {
    Ticker?: TickerApi;
  }
}

if (typeof window !== 'undefined') {
  window.Ticker = Ticker;
}

export default Ticker;
export { browser, Ticker } from './registry';
export {
  createTicker,
  enhance,
  initTicker,
  mount,
  rebuildTicker,
  refresh,
  unmount,
} from '../vanilla/render';
export type { NewTickerInput, TickerApi, TickerAvailable } from './registry';
export type { TickerOptions, TickerController } from '../core/types';
