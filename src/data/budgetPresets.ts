import type { Category } from '../types'

export interface BudgetPreset {
  id: string
  nameKey: 'presetEntry' | 'presetGaming' | 'presetCreator'
  descriptionKey: 'presetEntryDesc' | 'presetGamingDesc' | 'presetCreatorDesc'
  parts: Partial<Record<Category, string>>
}

export const budgetPresets: BudgetPreset[] = [
  {
    id: 'entry-1080p',
    nameKey: 'presetEntry',
    descriptionKey: 'presetEntryDesc',
    parts: {
      CPU: 'cpu-7800x3d',
      Motherboard: 'mb-b650',
      RAM: 'ram-ddr5-32',
      GPU: 'gpu-rx7600',
      Storage: 'ssd-990pro',
      PSU: 'psu-650',
      Case: 'case-atx',
      Cooling: 'cool-darkrock',
    },
  },
  {
    id: 'gaming-1440p',
    nameKey: 'presetGaming',
    descriptionKey: 'presetGamingDesc',
    parts: {
      CPU: 'cpu-7800x3d',
      Motherboard: 'mb-b650',
      RAM: 'ram-ddr5-32',
      GPU: 'gpu-rtx4070',
      Storage: 'ssd-990pro',
      PSU: 'psu-850',
      Case: 'case-atx',
      Cooling: 'cool-darkrock',
    },
  },
  {
    id: 'creator-intel',
    nameKey: 'presetCreator',
    descriptionKey: 'presetCreatorDesc',
    parts: {
      CPU: 'cpu-13700k',
      Motherboard: 'mb-b760',
      RAM: 'ram-ddr4-32',
      GPU: 'gpu-rtx4070',
      Storage: 'ssd-990pro',
      PSU: 'psu-850',
      Case: 'case-atx',
      Cooling: 'cool-darkrock',
    },
  },
]
