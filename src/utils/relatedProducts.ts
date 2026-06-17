import type { Category, Product, ProductBundle } from '../types'
import { getIncompatibilityReason } from '../data/compatibilityRules'
import { getNumericSpecMax, getSpecValues, specValuesOverlap } from './productSpecs'

export function getRelatedProducts(
  product: Product,
  products: Product[],
  build: Partial<Record<Category, Product>>,
  limit = 4,
): Product[] {
  const inStock = (p: Product) => p.stock > 0 || p.allowBackorder
  const notSelf = (p: Product) => p.id !== product.id && !p.discontinued && inStock(p)

  if (product.category === 'CPU') {
    return products
      .filter(
        (p) =>
          notSelf(p) &&
          p.category === 'Motherboard' &&
          specValuesOverlap(p.specs, 'socket', product.specs, 'socket') &&
          !getIncompatibilityReason(p, { ...build, CPU: product }),
      )
      .slice(0, limit)
  }

  if (product.category === 'Motherboard') {
    return products
      .filter(
        (p) =>
          notSelf(p) &&
          ((p.category === 'CPU' && specValuesOverlap(p.specs, 'socket', product.specs, 'socket')) ||
            (p.category === 'RAM' &&
              specValuesOverlap(p.specs, 'memoryType', product.specs, 'memoryType'))),
      )
      .slice(0, limit)
  }

  if (product.category === 'GPU') {
    const gpuTdp = getNumericSpecMax(product.specs, 'tdp')
    const cpuTdp = getNumericSpecMax(build.CPU?.specs ?? {}, 'tdp')
    const required = cpuTdp + gpuTdp + 100
    return products
      .filter((p) => notSelf(p) && p.category === 'PSU' && getNumericSpecMax(p.specs, 'wattage') >= required)
      .sort((a, b) => getNumericSpecMax(a.specs, 'wattage') - getNumericSpecMax(b.specs, 'wattage'))
      .slice(0, limit)
  }

  if (product.category === 'Case') {
    const accepted = new Set<string>()
    for (const formFactor of getSpecValues(product.specs, 'formFactor')) {
      if (formFactor === 'ATX') {
        accepted.add('ATX')
        accepted.add('mATX')
        accepted.add('ITX')
      } else if (formFactor === 'mATX') {
        accepted.add('mATX')
        accepted.add('ITX')
      } else if (formFactor === 'ITX') {
        accepted.add('ITX')
      }
    }
    return products
      .filter(
        (p) =>
          notSelf(p) &&
          p.category === 'Motherboard' &&
          getSpecValues(p.specs, 'formFactor').some((ff) => accepted.has(ff)),
      )
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
