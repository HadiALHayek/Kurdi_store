import type { Category, Product } from '../types'
import type { StoreFiltersState } from './productFilters'
import { matchesStoreFilters } from './productFilters'
import { productMatchesSearchQuery } from './productSearch'

export function countProductsForFilterValue(
  products: Product[],
  category: Category | 'All',
  search: string,
  baseFilters: StoreFiltersState,
  build: Partial<Record<Category, Product>>,
  apply: (filters: StoreFiltersState) => StoreFiltersState,
): number {
  const filters = apply({ ...baseFilters })
  return products.filter((product) => {
    const byCategory = category === 'All' || product.category === category
    const bySearch = productMatchesSearchQuery(product, search)
    if (!byCategory || !bySearch) return false
    return matchesStoreFilters(product, filters, build)
  }).length
}
