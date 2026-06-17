import { getIncompatibilityReason } from '../data/compatibilityRules'
import type { IncompatReasonKey } from '../data/compatibilityRules'
import type { BuildMap, BuilderSlotId, Product } from '../types'
import { getNumericSpecMax } from './productSpecs'
import { isPcPartBuilderSlot } from './builderSlots'

export interface FixSuggestion {
  slot: BuilderSlotId
  reasonKey: IncompatReasonKey
  product: Product
  label: string
}

export function getBuildFixSuggestions(
  build: BuildMap,
  products: Product[],
  limit = 4,
): FixSuggestion[] {
  const suggestions: FixSuggestion[] = []
  const slots = Object.keys(build) as BuilderSlotId[]

  for (const slot of slots) {
    if (!isPcPartBuilderSlot(slot)) continue
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
      getNumericSpecMax(build.CPU?.specs ?? {}, 'tdp') +
      getNumericSpecMax(build.GPU?.specs ?? {}, 'tdp') +
      100
    const psu = products
      .filter(
        (p) =>
          p.category === 'PSU' &&
          p.stock > 0 &&
          !p.discontinued &&
          getNumericSpecMax(p.specs, 'wattage') >= required,
      )
      .sort((a, b) => a.price - b.price)[0]
    if (psu) {
      suggestions.push({ slot: 'PSU', reasonKey: 'psuWattage', product: psu, label: psu.name })
    }
  }

  return suggestions.slice(0, limit)
}

function reasonNeedsPsu(build: BuildMap) {
  const psu = build.PSU
  if (!psu) return Boolean(build.CPU && build.GPU)
  const required =
    getNumericSpecMax(build.CPU?.specs ?? {}, 'tdp') +
    getNumericSpecMax(build.GPU?.specs ?? {}, 'tdp') +
    100
  return getNumericSpecMax(psu.specs, 'wattage') < required
}

export function getBuildConflicts(
  build: BuildMap,
  slotsOrder: BuilderSlotId[],
): Array<{ slot: BuilderSlotId; part: Product; reasonKey: IncompatReasonKey }> {
  const conflicts: Array<{ slot: BuilderSlotId; part: Product; reasonKey: IncompatReasonKey }> = []
  for (const slot of slotsOrder) {
    if (!isPcPartBuilderSlot(slot)) continue
    const part = build[slot]
    if (!part) continue
    const reason = getIncompatibilityReason(part, build)
    if (reason) conflicts.push({ slot, part, reasonKey: reason })
  }
  return conflicts
}
