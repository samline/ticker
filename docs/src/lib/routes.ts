export function href(id: string) {
  const route = id.replace(/(^|\/)index$/, '$1').replace(/\/$/, '')
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${route ? `${route}/` : ''}`
}
