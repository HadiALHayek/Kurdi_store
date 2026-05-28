import type { Category } from '../types'
import type { StoreFiltersState } from './productFilters'

export interface ZeroResultsHint {
  messageKey: 'zeroHintSocket' | 'zeroHintPrice' | 'zeroHintStock' | 'zeroHintSearch' | 'zeroHintGeneric'
  actionKey?: 'relaxSockets' | 'relaxInStock' | 'relaxMaxPrice' | 'relaxSearch' | 'relaxAll'
}

export function getZeroResultsHints(
  category: Category | 'All',
  search: string,
  filters: StoreFiltersState,
): ZeroResultsHint[] {
  const hints: ZeroResultsHint[] = []

  if (search.trim()) {
    hints.push({ messageKey: 'zeroHintSearch', actionKey: 'relaxSearch' })
  }
  if (filters.sockets.length > 0) {
    hints.push({ messageKey: 'zeroHintSocket', actionKey: 'relaxSockets' })
  }
  if (filters.inStockOnly) {
    hints.push({ messageKey: 'zeroHintStock', actionKey: 'relaxInStock' })
  }
  if (filters.maxPrice) {
    hints.push({ messageKey: 'zeroHintPrice', actionKey: 'relaxMaxPrice' })
  }
  if (category !== 'All') {
    hints.push({ messageKey: 'zeroHintGeneric', actionKey: 'relaxAll' })
  }

  if (hints.length === 0) {
    hints.push({ messageKey: 'zeroHintGeneric', actionKey: 'relaxAll' })
  }

  return hints
}

export function describeActiveFilters(
  category: Category | 'All',
  search: string,
  filters: StoreFiltersState,
): string {
  const parts: string[] = []
  if (category !== 'All') parts.push(category)
  if (search.trim()) parts.push(`"${search.trim()}"`)
  if (filters.sockets.length) parts.push(filters.sockets.join(', '))
  if (filters.maxPrice) parts.push(`≤ $${filters.maxPrice}`)
  if (filters.inStockOnly) parts.push('in stock')
  return parts.join(' · ') || 'filters'
}
