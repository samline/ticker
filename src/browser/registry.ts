import {
  createTicker,
  destroyTicker as destroyTickerElement,
  enhance,
  initTicker,
  mount,
  rebuildTicker,
  refresh,
  unmount,
} from '../vanilla/render';
import type { TickerOptions } from '../core/types';

export interface NewTickerInput {
  id: string;
  options?: TickerOptions;
}
export interface TickerAvailable {
  [id: string]: HTMLElement;
}
interface RegisteredTicker {
  source: HTMLElement;
  content: HTMLElement;
  wrapper: HTMLElement;
}
export interface TickerApi {
  mount: typeof mount;
  unmount: typeof unmount;
  refresh: typeof refresh;
  refreshAll: typeof refresh;
  createTicker: typeof createTicker;
  enhance: typeof enhance;
  initTicker: typeof initTicker;
  rebuildTicker: typeof rebuildTicker;
  newTicker: (input: NewTickerInput) => HTMLElement | null;
  getTicker: (id: string) => HTMLElement | null;
  getTickers: () => Readonly<Record<string, HTMLElement>>;
  destroyTicker: (target: string | HTMLElement) => void;
  destroyTickers: () => void;
  available: TickerAvailable;
}

const available: TickerAvailable = {};
const registered = new Map<string, RegisteredTicker>();
const restoreSource = ({
  source,
  content,
  wrapper,
}: RegisteredTicker): void => {
  destroyTickerElement(wrapper);
  if (content !== source) source.appendChild(content);
  if (wrapper.isConnected) wrapper.replaceWith(source);
};
const removeRegistration = (id: string): void => {
  const entry = registered.get(id);
  if (!entry) return;
  restoreSource(entry);
  registered.delete(id);
  delete available[id];
};
const newTicker = ({
  id,
  options = {},
}: NewTickerInput): HTMLElement | null => {
  if (!id) {
    console.error('Ticker ID is required');
    return null;
  }
  const previous = registered.get(id);
  const source = previous?.source ?? document.getElementById(id);
  if (!(source instanceof HTMLElement)) {
    console.warn(`Ticker with ID ${id} not found`);
    return null;
  }
  if (previous) removeRegistration(id);
  const content =
    source.querySelector<HTMLElement>('[data-ticker-content]') ||
    source.querySelector<HTMLElement>('.ticker-content') ||
    source;
  const wrapper = enhance(source, options);
  if (!wrapper) return null;
  registered.set(id, { source, content, wrapper });
  available[id] = wrapper;
  return wrapper;
};
const getTicker = (id: string): HTMLElement | null => available[id] ?? null;
const getTickers = (): Readonly<Record<string, HTMLElement>> => ({
  ...available,
});
const destroyTicker = (target: string | HTMLElement): void => {
  if (typeof target === 'string') return removeRegistration(target);
  const entry = Array.from(registered.entries()).find(
    ([, value]) => value.wrapper === target,
  );
  if (entry) return removeRegistration(entry[0]);
  destroyTickerElement(target);
};
const destroyTickers = (): void =>
  Array.from(registered.keys()).forEach(removeRegistration);
export const Ticker: TickerApi = {
  mount,
  unmount,
  refresh,
  refreshAll: refresh,
  createTicker,
  enhance,
  initTicker,
  rebuildTicker,
  newTicker,
  getTicker,
  getTickers,
  destroyTicker,
  destroyTickers,
  available,
};
export const browser = Ticker;
