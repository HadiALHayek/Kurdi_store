import type { Category, Product } from '../types'

const slotsOrder: Category[] = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

export function encodeBuildToParam(build: Partial<Record<Category, Product>>): string {
  const ids = slotsOrder.map((slot) => build[slot]?.id ?? '').join('.')
  return ids.replace(/^\.+|\.+$/g, '') || ''
}

export function decodeBuildFromParam(
  param: string,
  products: Product[],
): Partial<Record<Category, Product>> {
  if (!param.trim()) return {}
  const ids = param.split('.').filter(Boolean)
  const result: Partial<Record<Category, Product>> = {}
  let slotIndex = 0
  for (const id of ids) {
    const product = products.find((p) => p.id === id)
    if (!product) continue
    while (slotIndex < slotsOrder.length && slotsOrder[slotIndex] !== product.category) {
      slotIndex++
    }
    if (slotIndex < slotsOrder.length) {
      result[product.category] = product
      slotIndex++
    }
  }
  return result
}

export function buildShareUrl(build: Partial<Record<Category, Product>>): string {
  const encoded = encodeBuildToParam(build)
  if (!encoded) return `${window.location.origin}/builder`
  return `${window.location.origin}/builder?build=${encodeURIComponent(encoded)}`
}
