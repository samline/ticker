import type { Recipe } from '../../i18n/translations/en/examples'
import type { getI18n } from '../../i18n/utils'

export interface RecipeContext {
  recipe: Recipe
  i18n: ReturnType<typeof getI18n>
}
