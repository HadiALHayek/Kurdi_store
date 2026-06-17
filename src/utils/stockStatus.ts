import type { Product } from '../types'

export type StockLabelKey = 'inStock' | 'lowStock' | 'outOfStock' | 'backorderAvailable'

export function getStockLabelKey(product: Product, lowThreshold: number): StockLabelKey | null {
  if (product.discontinued) return null
  if (product.stock > lowThreshold) return 'inStock'
  if (product.stock > 0) return 'lowStock'
  if (product.allowBackorder) return 'backorderAvailable'
  return 'outOfStock'
}

/** Storefront label — no unit counts and no low-stock quantity hints. */
export function getCustomerStockLabelKey(product: Product, lowThreshold: number): StockLabelKey | null {
  const key = getStockLabelKey(product, lowThreshold)
  if (key === 'lowStock') return 'inStock'
  return key
}

export function formatCustomerStockStatus(product: Product): string {
  if (product.discontinued) return 'Unavailable'
  if (product.stock > 0) return 'Available'
  if (product.allowBackorder) return 'Backorder available'
  return 'Out of stock'
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
