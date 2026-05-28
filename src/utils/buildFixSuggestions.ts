import { getIncompatibilityReason } from '../data/compatibilityRules'
import type { IncompatReasonKey } from '../data/compatibilityRules'
import type { Category, Product } from '../types'

export interface FixSuggestion {
  slot: Category
  reasonKey: IncompatReasonKey
  product: Product
  label: string
}

export function getBuildFixSuggestions(
  build: Partial<Record<Category, Product>>,
  products: Product[],
  limit = 4,
): FixSuggestion[] {
  const suggestions: FixSuggestion[] = []
  const slots = Object.keys(build) as Category[]

  for (const slot of slots) {
    const current = build[slot]
    if (!current) continue
    const reason = getIncompatibilityReason(current, build)
    if (!reason) continue

    const alternatives = products
      .filter((p) => {
        if (p.id === current.id || p.category !== slot || p.stock <= 0 || p.discontinued) return false
        return !getIncompatibilityReason(p, build)
      })
      .sort((a, b) => a.price - b.price)

    const pick = alternatives[0]
    if (pick) {
      suggestions.push({
        slot,
        reasonKey: reason,
        product: pick,
        label: pick.name,
      })
    }
  }

  if (reasonNeedsPsu(build) && !suggestions.some((s) => s.slot === 'PSU')) {
    const required =
      (Number.parseInt(build.CPU?.specs.tdp ?? '0', 10) || 0) +
      (Number.parseInt(build.GPU?.specs.tdp ?? '0', 10) || 0) +
      100
    const psu = products
      .filter(
        (p) =>
          p.category === 'PSU' &&
          p.stock > 0 &&
          !p.discontinued &&
          (Number.parseInt(p.specs.wattage ?? '0', 10) || 0) >= required,
      )
      .sort((a, b) => a.price - b.price)[0]
    if (psu) {
      suggestions.push({ slot: 'PSU', reasonKey: 'psuWattage', product: psu, label: psu.name })
    }
  }

  return suggestions.slice(0, limit)
}

function reasonNeedsPsu(build: Partial<Record<Category, Product>>) {
  const psu = build.PSU
  if (!psu) return Boolean(build.CPU && build.GPU)
  const required =
    (Number.parseInt(build.CPU?.specs.tdp ?? '0', 10) || 0) +
    (Number.parseInt(build.GPU?.specs.tdp ?? '0', 10) || 0) +
    100
  return (Number.parseInt(psu.specs.wattage ?? '0', 10) || 0) < required
}

export function getBuildConflicts(
  build: Partial<Record<Category, Product>>,
  slotsOrder: Category[],
): Array<{ slot: Category; part: Product; reasonKey: IncompatReasonKey }> {
  const conflicts: Array<{ slot: Category; part: Product; reasonKey: IncompatReasonKey }> = []
  for (const slot of slotsOrder) {
    const part = build[slot]
    if (!part) continue
    const reason = getIncompatibilityReason(part, build)
    if (reason) conflicts.push({ slot, part, reasonKey: reason })
  }
  return conflicts
}
