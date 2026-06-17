import { ACCESSORY_CATEGORIES } from './adminDepartmentSpecs'
import type { BuildMap, BuilderSlotId, Category, Product } from '../types'

export const PC_PART_BUILDER_SLOTS = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
] as const satisfies readonly Category[]

export const BUILDER_SLOTS_ORDER: BuilderSlotId[] = [
  ...PC_PART_BUILDER_SLOTS,
  'Monitor',
  'Accessory',
]

export type PcPartBuilderSlot = (typeof PC_PART_BUILDER_SLOTS)[number]

export function isPcPartBuilderSlot(slot: BuilderSlotId): slot is PcPartBuilderSlot {
  return (PC_PART_BUILDER_SLOTS as readonly BuilderSlotId[]).includes(slot)
}

export function getBuilderSlotForCategory(category: Category): BuilderSlotId | null {
  if (category === 'Monitor') return 'Monitor'
  if (ACCESSORY_CATEGORIES.includes(category)) return 'Accessory'
  if ((PC_PART_BUILDER_SLOTS as readonly string[]).includes(category)) {
    return category as PcPartBuilderSlot
  }
  return null
}

export function canAddCategoryToBuilder(category: Category): boolean {
  return getBuilderSlotForCategory(category) !== null
}

export function isSlotUnlocked(): boolean {
  return true
}

export function getNextEmptySlot(build: BuildMap): BuilderSlotId | null {
  for (const slot of BUILDER_SLOTS_ORDER) {
    if (!build[slot]) return slot
  }
  return null
}

/** @deprecated Use getNextEmptySlot — all slots are always unlocked. */
export function getNextEmptyUnlockedSlot(build: BuildMap): BuilderSlotId | null {
  return getNextEmptySlot(build)
}

export function normalizeBuildMap(build: BuildMap): BuildMap {
  const normalized: BuildMap = {}
  for (const slot of BUILDER_SLOTS_ORDER) {
    const product = build[slot]
    if (product?.id && product?.name) {
      normalized[slot] = product
    }
  }
  return normalized
}

export function getSelectedBuildEntries(build: BuildMap): Array<{ slot: BuilderSlotId; product: Product }> {
  const normalized = normalizeBuildMap(build)
  return BUILDER_SLOTS_ORDER.filter((slot) => normalized[slot]).map((slot) => ({
    slot,
    product: normalized[slot]!,
  }))
}

export function getSelectedBuildTotal(build: BuildMap): number {
  return getSelectedBuildEntries(build).reduce((sum, { product }) => sum + product.price, 0)
}

export function slotAcceptsProduct(slot: BuilderSlotId, product: Product): boolean {
  if (slot === 'Accessory') return ACCESSORY_CATEGORIES.includes(product.category)
  if (slot === 'Monitor') return product.category === 'Monitor'
  return product.category === slot
}

export function getProductsForBuilderSlot(slot: BuilderSlotId, products: Product[]): Product[] {
  return products.filter(
    (product) =>
      !product.discontinued &&
      (product.stock > 0 || product.allowBackorder) &&
      slotAcceptsProduct(slot, product),
  )
}

export function getSlotLabelKey(slot: BuilderSlotId): 'builderSlotAccessory' | null {
  return slot === 'Accessory' ? 'builderSlotAccessory' : null
}

export function formatBuildPartsSummary(build: BuildMap): string {
  return getSelectedBuildEntries(build)
    .map(({ slot, product }) => `${slot}: ${product.name}`)
    .join('; ')
}
