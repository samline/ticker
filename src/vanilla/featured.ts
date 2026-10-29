import type { TickerFeaturedPosition } from '../core/types'

export const normalizeFeaturedPosition = (value: unknown): TickerFeaturedPosition =>
  typeof value === 'string' &&
  ['start', 'center', 'end', 'left', 'right', 'top', 'bottom'].includes(value)
    ? (value as TickerFeaturedPosition)
    : 'center'

// One original node, outside the cloned track. The comment retains its authored
// position without contributing a gap or an item to navigation measurements.
export const createFeatured = (root: HTMLElement, wrapper: HTMLElement) => {
  let element: HTMLElement | null = null
  let anchor: Comment | null = null
  let layer: HTMLElement | null = null
  let selected: HTMLElement | null | undefined
  const move = (action: () => void) => {
    const focused = document.activeElement
    const retainFocus = focused instanceof HTMLElement && element?.contains(focused)
    action()
    if (retainFocus && focused instanceof HTMLElement && focused.isConnected)
      focused.focus({ preventScroll: true })
  }
  const restore = () => {
    move(() => {
      // Do not resurrect content the application removed or moved elsewhere.
      if (element?.parentNode === layer && anchor?.parentNode === root) anchor.replaceWith(element)
      else anchor?.remove()
      layer?.remove()
    })
    element = null
    anchor = null
    layer = null
  }
  const sync = (): boolean => {
    const previous = element
    // Reconstitute DOM order, including the current node's comment position.
    const candidates = Array.from(root.childNodes).flatMap(node =>
      node === anchor && element?.parentNode === layer
        ? [element]
        : node instanceof HTMLElement
          ? [node]
          : []
    )
    const next =
      selected === undefined
        ? (candidates.find(item => item.hasAttribute('data-featured')) ?? null)
        : candidates.includes(selected!)
          ? selected
          : null
    if (next === element && (!element || element.parentNode === layer)) return false
    restore()
    if (next) {
      element = next
      anchor = document.createComment('ticker-featured')
      layer = document.createElement('div')
      layer.className = 'ticker-featured'
      layer.dataset.tickerFeatured = ''
      move(() => {
        next.before(anchor!)
        layer!.append(next)
        wrapper.append(layer!)
      })
    }
    return previous !== element
  }
  return {
    get element() {
      return element
    },
    sync,
    set: (next: HTMLElement | null) => {
      if (next !== null && next !== element && next.parentElement !== root)
        throw new RangeError('[ticker] Featured must be a direct original item of this ticker')
      selected = next
      sync()
    },
    destroy: restore,
  }
}

// Select a contiguous readable segment; a centered overlay splits the viewport.
// Prefer a segment that fits the focused item, then the nearest such segment.
export const featuredViewport = (
  element: HTMLElement | null,
  vertical: boolean,
  start: number,
  end: number,
  target?: DOMRect
): [number, number] => {
  if (!element) return [start, end]
  const rect = element.getBoundingClientRect()
  const from = vertical ? rect.top : rect.left
  const to = vertical ? rect.bottom : rect.right
  if (to <= start || from >= end) return [start, end]
  const segments: [number, number][] = [
    [start, Math.max(start, from)],
    [Math.min(end, to), end],
  ]
  if (target) {
    const targetStart = vertical ? target.top : target.left
    const size = vertical ? target.height : target.width
    const fitting = segments.filter(([a, b]) => b - a >= size)
    if (fitting.length)
      return fitting.sort(
        ([a, b], [c, d]) =>
          Math.abs(Math.max(a, Math.min(targetStart, b - size)) - targetStart) -
          Math.abs(Math.max(c, Math.min(targetStart, d - size)) - targetStart)
      )[0]!
  }
  return segments.sort(([a, b], [c, d]) => d - c - (b - a))[0]!
}
