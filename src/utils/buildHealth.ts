import { getIncompatibilityReason } from '../data/compatibilityRules'
import type { BuildMap, BuilderSlotId } from '../types'
import { getNumericSpecMax } from './productSpecs'
import { getSelectedBuildEntries, isPcPartBuilderSlot } from './builderSlots'

export interface BuildHealthResult {
  score: number
  labelKey: 'healthExcellent' | 'healthGood' | 'healthFair' | 'healthPoor'
  issues: string[]
  checks: { id: string; ok: boolean; label: string }[]
}

export function computeBuildHealth(build: BuildMap, slotsOrder: BuilderSlotId[]): BuildHealthResult {
  const checks: BuildHealthResult['checks'] = []
  const issues: string[] = []

  const selected = getSelectedBuildEntries(build)
  const filled = selected.length
  checks.push({
    id: 'slots',
    ok: filled > 0,
    label: filled > 0 ? `${filled} part(s) selected` : 'No parts selected',
  })
  if (filled === 0) issues.push('incompleteBuild')

  let compatOk = true
  const pcSlots = slotsOrder.filter(isPcPartBuilderSlot)
  for (const slot of pcSlots) {
    const part = build[slot]
    if (!part) continue
    const reason = getIncompatibilityReason(part, build)
    if (reason) {
      compatOk = false
      issues.push(`conflict_${slot}`)
    }
  }
  checks.push({
    id: 'compat',
    ok: compatOk,
    label: compatOk ? 'All parts compatible' : 'Compatibility issues',
  })

  const cpu = build.CPU
  const gpu = build.GPU
  const psu = build.PSU
  const requiredW =
    getNumericSpecMax(cpu?.specs ?? {}, 'tdp') + getNumericSpecMax(gpu?.specs ?? {}, 'tdp') + 100
  const psuW = getNumericSpecMax(psu?.specs ?? {}, 'wattage')
  const psuOk = !cpu || !gpu || psuW >= requiredW
  checks.push({
    id: 'psu',
    ok: psuOk,
    label: psuOk ? `PSU headroom OK (${psuW}W)` : `PSU low (${psuW}W / ${requiredW}W needed)`,
  })
  if (!psuOk) issues.push('psuLow')

  let stockOk = true
  for (const { product } of selected) {
    if (product.stock <= 0 || product.discontinued) {
      stockOk = false
      issues.push('outOfStock')
      break
    }
  }
  checks.push({ id: 'stock', ok: stockOk, label: stockOk ? 'All parts in stock' : 'Some parts unavailable' })

  const okCount = checks.filter((c) => c.ok).length
  const score = Math.round((okCount / checks.length) * 100)

  let labelKey: BuildHealthResult['labelKey'] = 'healthPoor'
  if (score >= 90) labelKey = 'healthExcellent'
  else if (score >= 70) labelKey = 'healthGood'
  else if (score >= 50) labelKey = 'healthFair'

  return { score, labelKey, issues: [...new Set(issues)], checks }
}
