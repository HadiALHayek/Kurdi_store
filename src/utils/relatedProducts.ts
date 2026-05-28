import type { Category, Product, ProductBundle } from '../types'
import { getIncompatibilityReason } from '../data/compatibilityRules'

const toNumber = (value?: string) => Number.parseInt(value ?? '0', 10) || 0

export function getRelatedProducts(
  product: Product,
  products: Product[],
  build: Partial<Record<Category, Product>>,
  limit = 4,
): Product[] {
  const inStock = (p: Product) => p.stock > 0 || p.allowBackorder
  const notSelf = (p: Product) => p.id !== product.id && !p.discontinued && inStock(p)

  if (product.category === 'CPU') {
    const socket = product.specs.socket
    return products
      .filter(
        (p) =>
          notSelf(p) &&
          p.category === 'Motherboard' &&
          p.specs.socket === socket &&
          !getIncompatibilityReason(p, { ...build, CPU: product }),
      )
      .slice(0, limit)
  }

  if (product.category === 'Motherboard') {
    const socket = product.specs.socket
    const mem = product.specs.memoryType
    return products
      .filter(
        (p) =>
          notSelf(p) &&
          ((p.category === 'CPU' && p.specs.socket === socket) ||
            (p.category === 'RAM' && p.specs.memoryType === mem)),
      )
      .slice(0, limit)
  }

  if (product.category === 'GPU') {
    const gpuTdp = toNumber(product.specs.tdp)
    const cpuTdp = toNumber(build.CPU?.specs.tdp)
    const required = cpuTdp + gpuTdp + 100
    return products
      .filter((p) => notSelf(p) && p.category === 'PSU' && toNumber(p.specs.wattage) >= required)
      .sort((a, b) => toNumber(a.specs.wattage) - toNumber(b.specs.wattage))
      .slice(0, limit)
  }

  if (product.category === 'Case') {
    const ff = product.specs.formFactor
    return products
      .filter((p) => notSelf(p) && p.category === 'Motherboard' && p.specs.formFactor === ff)
      .slice(0, limit)
  }

  if (product.category === 'RAM' && build.Motherboard) {
    return products
      .filter((p) => notSelf(p) && p.category === 'Storage')
      .slice(0, limit)
  }

  return products
    .filter((p) => notSelf(p) && p.category === product.category && p.staffPick)
    .slice(0, limit)
}

export function getBundlesForProduct(productId: string, bundles: ProductBundle[]) {
  return bundles.filter((b) => b.productIds.includes(productId))
}
