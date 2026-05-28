import type { Product } from '../types'

export type StockLabelKey = 'inStock' | 'lowStock' | 'outOfStock' | 'backorderAvailable'

export function getStockLabelKey(product: Product, lowThreshold: number): StockLabelKey | null {
  if (product.discontinued) return null
  if (product.stock > lowThreshold) return 'inStock'
  if (product.stock > 0) return 'lowStock'
  if (product.allowBackorder) return 'backorderAvailable'
  return 'outOfStock'
}

export function isProductPurchasable(
  product: Product,
  compatible: boolean,
): boolean {
  if (product.category === 'Prebuilt PC') return false
  if (product.discontinued) return false
  if (!compatible) return false
  if (product.stock > 0) return true
  return Boolean(product.allowBackorder)
}
