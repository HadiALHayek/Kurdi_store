import type { Product } from '../types'

/** Search product name, description, category, SKU, and all spec values. */
export function productMatchesSearchQuery(product: Product, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const haystack = [
    product.name,
    product.description,
    product.category,
    product.sku ?? '',
    ...Object.entries(product.specs).flatMap(([key, value]) => [key, value]),
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}
