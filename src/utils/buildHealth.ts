import { getIncompatibilityReason } from '../data/compatibilityRules'
import type { Category, Product } from '../types'

export interface BuildHealthResult {
  score: number
  labelKey: 'healthExcellent' | 'healthGood' | 'healthFair' | 'healthPoor'
  issues: string[]
  checks: { id: string; ok: boolean; label: string }[]
}

export function computeBuildHealth(
  build: Partial<Record<Category, Product>>,
  slotsOrder: Category[],
): BuildHealthResult {
  const checks: BuildHealthResult['checks'] = []
  const issues: string[] = []

  const filled = slotsOrder.filter((s) => build[s]).length
  const complete = filled === slotsOrder.length
  checks.push({
    id: 'slots',
    ok: complete,
    label: `${filled}/${slotsOrder.length} parts selected`,
  })
  if (!complete) issues.push('incompleteBuild')

  let compatOk = true
  for (const slot of slotsOrder) {
    const part = build[slot]
    if (!part) continue
    for (const otherSlot of slotsOrder) {
      const other = build[otherSlot]
      if (!other || otherSlot === slot) continue
      const testBuild = { ...build, [slot]: part }
      const reason = getIncompatibilityReason(part, testBuild)
      if (reason) {
        compatOk = false
        issues.push(`conflict_${slot}`)
        break
      }
    }
  }
  checks.push({ id: 'compat', ok: compatOk, label: compatOk ? 'All parts compatible' : 'Compatibility issues' })

  const cpu = build.CPU
  const gpu = build.GPU
  const psu = build.PSU
  const requiredW = (Number.parseInt(cpu?.specs.tdp ?? '0', 10) || 0) + (Number.parseInt(gpu?.specs.tdp ?? '0', 10) || 0) + 100
  const psuW = Number.parseInt(psu?.specs.wattage ?? '0', 10) || 0
  const psuOk = !cpu || !gpu || psuW >= requiredW
  checks.push({
    id: 'psu',
    ok: psuOk,
    label: psuOk ? `PSU headroom OK (${psuW}W)` : `PSU low (${psuW}W / ${requiredW}W needed)`,
  })
  if (!psuOk) issues.push('psuLow')

  let stockOk = true
  for (const slot of slotsOrder) {
    const p = build[slot]
    if (p && (p.stock <= 0 || p.discontinued)) {
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
