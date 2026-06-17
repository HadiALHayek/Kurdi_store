import type { BuildMap, BuilderSlotId, Product, UseCaseTag } from '../types'
import { getIncompatibilityReason } from '../data/compatibilityRules'
import { inferBuildUseCaseSummary } from './useCaseTags'
import { getProductsForBuilderSlot, isPcPartBuilderSlot } from './builderSlots'

export function getSlotRecommendations(
  slot: BuilderSlotId,
  products: Product[],
  build: BuildMap,
  limit = 3,
): Product[] {
  if (build[slot]) return []
  if (!isPcPartBuilderSlot(slot)) {
    return getProductsForBuilderSlot(slot, products).slice(0, limit)
  }

  const available = getProductsForBuilderSlot(slot, products).filter(
    (product) => !getIncompatibilityReason(product, build),
  )

  const useCase = inferBuildUseCaseSummary(build)

  const score = (p: Product) => {
    let s = 0
    if (p.staffPick) s += 3
    if (p.stock > 5) s += 1
    if (useCase && p.useCaseTags?.includes(useCase as UseCaseTag)) s += 2
    return s
  }

  return [...available].sort((a, b) => score(b) - score(a) || a.price - b.price).slice(0, limit)
}
