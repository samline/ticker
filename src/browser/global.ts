import { Ticker } from './registry'
import type { TickerApi } from './registry'

declare global {
  interface Window {
    Ticker: TickerApi
  }
}

if (typeof globalThis !== 'undefined') {
  ;(globalThis as typeof globalThis & { Ticker: TickerApi }).Ticker = Ticker
}

export const browser = Ticker
export const ticker = Ticker.ticker
export const newTicker = Ticker.newTicker
export const getTicker = Ticker.getTicker
export const getTickers = Ticker.getTickers
export const destroyTicker = Ticker.destroyTicker
export const destroyTickers = Ticker.destroyTickers
export const available = Ticker.available
export default Ticker
