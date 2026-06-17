import type { BuildMap, Product } from '../types'
import { BUILDER_SLOTS_ORDER, slotAcceptsProduct } from './builderSlots'

export function encodeBuildToParam(build: BuildMap): string {
  const ids = BUILDER_SLOTS_ORDER.map((slot) => build[slot]?.id ?? '').join('.')
  return ids.replace(/^\.+|\.+$/g, '') || ''
}

export function decodeBuildFromParam(param: string, products: Product[]): BuildMap {
  if (!param.trim()) return {}
  const ids = param.split('.').filter(Boolean)
  const result: BuildMap = {}
  for (const id of ids) {
    const product = products.find((p) => p.id === id)
    if (!product) continue
    for (const slot of BUILDER_SLOTS_ORDER) {
      if (result[slot]) continue
      if (slotAcceptsProduct(slot, product)) {
        result[slot] = product
        break
      }
    }
  }
  return result
}

export function buildShareUrl(build: BuildMap): string {
  const encoded = encodeBuildToParam(build)
  if (!encoded) return `${window.location.origin}/builder`
  return `${window.location.origin}/builder?build=${encodeURIComponent(encoded)}`
}
