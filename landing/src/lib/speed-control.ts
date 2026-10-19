export const syncSpeedControl = (element: HTMLElement | null, duration?: number) => {
  const input = element?.querySelector<HTMLInputElement>('input')
  const output = element?.querySelector<HTMLOutputElement>('output')
  if (!element || !input || !output) return
  input.id ||= `speed-${crypto.randomUUID()}`
  output.htmlFor = input.id
  if (duration !== undefined) input.value = String(duration)
  input.disabled = duration === undefined
  output.value = (element.dataset.displayTemplate ?? '').replace('{seconds}', input.value)
  input.setAttribute(
    'aria-valuetext',
    (element.dataset.descriptionTemplate ?? '').replace('{seconds}', input.value)
  )
}
