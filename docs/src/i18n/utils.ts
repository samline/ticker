import en from './translations/en'
export const dictionaries = { en } as const satisfies Record<string, TranslationDictionary>
export type Locale = keyof typeof dictionaries
export const defaultLocale: Locale = 'en'
type TranslationShape<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly TranslationShape<Item>[]
    : T extends object
      ? { [Key in keyof T]: TranslationShape<T[Key]> }
      : T
export type TranslationDictionary = TranslationShape<typeof en>
export function getLocale(currentLocale?: string): Locale {
  const language = currentLocale?.toLowerCase().split('-')[0]
  return language && Object.hasOwn(dictionaries, language) ? (language as Locale) : defaultLocale
}
export function getI18n({ currentLocale }: { currentLocale?: string } = {}) {
  return dictionaries[getLocale(currentLocale)]
}
