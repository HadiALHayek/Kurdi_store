import type { Category } from '../types'

export interface BudgetPreset {
  id: string
  nameKey: 'presetEntry' | 'presetGaming' | 'presetCreator'
  descriptionKey: 'presetEntryDesc' | 'presetGamingDesc' | 'presetCreatorDesc'
  parts: Partial<Record<Category, string>>
}

/** No bundled demo parts — add templates in Admin or presets here when you have real product IDs. */
export const budgetPresets: BudgetPreset[] = []
