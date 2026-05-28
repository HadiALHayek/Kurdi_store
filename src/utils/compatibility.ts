import type { Category, Product } from '../types'
import { getCompatibleProducts, getIncompatibilityReason } from '../data/compatibilityRules'

export const isProductCompatible = (
  product: Product,
  currentBuild: Partial<Record<Category, Product>>,
): boolean => {
  return !getIncompatibilityReason(product, currentBuild)
}

export const splitProductsByCompatibility = (
  products: Product[],
  category: Category,
  currentBuild: Partial<Record<Category, Product>>,
) => {
  const compatible = getCompatibleProducts(products, category, currentBuild)
  const compatibleIds = new Set(compatible.map((product) => product.id))
  const incompatible = products.filter(
    (product) => product.category === category && !compatibleIds.has(product.id),
  )

  return { compatible, incompatible }
}

export const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
