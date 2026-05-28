import type { Category, Product } from '../types'

export const BUILDER_SLOTS_ORDER: Category[] = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

const getRequiredForUnlock = (category: Category): Category[] => {
  if (category === 'Motherboard') return ['CPU']
  if (category === 'RAM') return ['CPU', 'Motherboard']
  if (['GPU', 'Storage', 'PSU', 'Case', 'Cooling'].includes(category)) {
    return ['CPU', 'Motherboard', 'RAM']
  }
  return []
}

export function isSlotUnlocked(build: Partial<Record<Category, Product>>, category: Category): boolean {
  return getRequiredForUnlock(category).every((needed) => Boolean(build[needed]))
}

/** First empty slot that is unlocked (ready to pick). */
export function getNextEmptyUnlockedSlot(build: Partial<Record<Category, Product>>): Category | null {
  for (const slot of BUILDER_SLOTS_ORDER) {
    if (build[slot]) continue
    if (isSlotUnlocked(build, slot)) return slot
  }
  return null
}
