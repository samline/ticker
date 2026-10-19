import type { TickerInstance } from '@samline/ticker'

// The site owns one package controller per demo root.
export const demoControllers = new WeakMap<HTMLElement, TickerInstance>()

export const getDemoController = (element: HTMLElement | null | undefined) =>
  element ? demoControllers.get(element) : undefined
