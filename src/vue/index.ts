export type { TickerOptions } from '../core/types';

export const Ticker = {} as {
  new (): {
    $props: Record<string, unknown>;
  };
};

export default Ticker;