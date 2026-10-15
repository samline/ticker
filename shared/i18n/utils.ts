import common from './translations/en/common'
import controls from './translations/en/controls'
const dictionaries = { en: { common, controls } } as const
export function getI18n({ currentLocale }: { currentLocale?: string } = {}) {
  const language = currentLocale?.toLowerCase().split('-')[0]
  return language && Object.hasOwn(dictionaries, language)
    ? dictionaries[language as keyof typeof dictionaries]
    : dictionaries.en
}
