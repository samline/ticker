export type { TickerOptions } from '../core/types';

export const Ticker = {} as {
  new (): {
    $set: (props: Record<string, unknown>) => void;
  };
};

export default Ticker;