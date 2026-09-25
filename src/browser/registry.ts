import { ticker } from '../vanilla/render'
import type { TickerInstance, TickerOptions } from '../core/types'

export interface NewTickerInput {
  id: string
  options?: TickerOptions
}
export interface TickerAvailable {
  [id: string]: HTMLElement
}
export interface TickerApi {
  ticker: typeof ticker
  newTicker: (input: NewTickerInput) => TickerInstance | null
  getTicker: (id: string) => HTMLElement | null
  getTickers: () => Readonly<Record<string, HTMLElement>>
  destroyTicker: (target: string | HTMLElement) => void
  destroyTickers: () => void
  available: TickerAvailable
}

export const available: TickerAvailable = {}
const registered = new Map<string, TickerInstance>()
const removeRegistration = (id: string): void => {
  const entry = registered.get(id)
  if (!entry) return
  entry.destroy()
  registered.delete(id)
  delete available[id]
}
export const newTicker = ({ id, options = {} }: NewTickerInput): TickerInstance | null => {
  if (!id) {
    console.error('Ticker ID is required')
    return null
  }
  const previous = registered.get(id)
  const source = previous?.source ?? document.getElementById(id)
  if (!(source instanceof HTMLElement)) {
    console.warn(`Ticker with ID ${id} not found`)
    return null
  }
  if (previous) removeRegistration(id)
  const instance = ticker(source, options)
  if (!instance?.element) return null
  registered.set(id, instance)
  available[id] = instance.element
  return instance
}
export const getTicker = (id: string): HTMLElement | null => available[id] ?? null
export const getTickers = (): Readonly<Record<string, HTMLElement>> => ({
  ...available,
})
export const destroyTicker = (target: string | HTMLElement): void => {
  if (typeof target === 'string') return removeRegistration(target)
  const entry = Array.from(registered.entries()).find(([, value]) => value.element === target)
  if (entry) return removeRegistration(entry[0])
}
export const destroyTickers = (): void => Array.from(registered.keys()).forEach(removeRegistration)
export const Ticker: TickerApi = {
  ticker,
  newTicker,
  getTicker,
  getTickers,
  destroyTicker,
  destroyTickers,
  available,
}
export const browser = Ticker
