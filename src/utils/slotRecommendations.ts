import type { Category, Product, UseCaseTag } from '../types'
import { getIncompatibilityReason } from '../data/compatibilityRules'
import { inferBuildUseCaseSummary } from './useCaseTags'

export function getSlotRecommendations(
  category: Category,
  products: Product[],
  build: Partial<Record<Category, Product>>,
  limit = 3,
): Product[] {
  if (build[category]) return []

  const available = products.filter(
    (p) =>
      p.category === category &&
      !p.discontinued &&
      (p.stock > 0 || p.allowBackorder) &&
      !getIncompatibilityReason(p, build),
  )

  const useCase = inferBuildUseCaseSummary(build)

  const score = (p: Product) => {
    let s = 0
    if (p.staffPick) s += 3
    if (p.stock > 5) s += 1
    if (useCase && p.useCaseTags?.includes(useCase as UseCaseTag)) s += 2
    return s
  }

  return [...available].sort((a, b) => score(b) - score(a) || b.stock - a.stock).slice(0, limit)
}
