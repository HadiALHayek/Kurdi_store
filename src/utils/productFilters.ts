import type { Category, Product, UseCaseTag } from '../types'
import { getIncompatibilityReason } from '../data/compatibilityRules'
import type { IncompatReasonKey } from '../data/compatibilityRules'
import { collectSpecValuesAcrossProducts, getNumericSpecMax, getSpecValues, hasSpecKey, productMatchesSpecFilter } from './productSpecs'
import { productMatchesUseCaseFilter } from './useCaseTags'

export interface StoreFiltersState {
  minPrice: string
  maxPrice: string
  inStockOnly: boolean
  sockets: string[]
  memoryTypes: string[]
  formFactors: string[]
  minWattage: string
  minVram: string
  hideIncompatible: boolean
  useCaseTags: UseCaseTag[]
}

export const defaultStoreFilters = (): StoreFiltersState => ({
  minPrice: '',
  maxPrice: '',
  inStockOnly: false,
  sockets: [],
  memoryTypes: [],
  formFactors: [],
  minWattage: '',
  minVram: '',
  hideIncompatible: false,
  useCaseTags: [],
})

export function collectFilterOptions(products: Product[]) {
  return {
    sockets: collectSpecValuesAcrossProducts(products, 'socket'),
    memoryTypes: collectSpecValuesAcrossProducts(products, 'memoryType'),
    formFactors: collectSpecValuesAcrossProducts(products, 'formFactor'),
  }
}

const parseVramGb = (value?: string) => {
  if (!value) return 0
  const match = value.match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

export function matchesStoreFilters(
  product: Product,
  filters: StoreFiltersState,
  build: Partial<Record<Category, Product>>,
): boolean {
  if (product.discontinued) return false
  if (filters.inStockOnly && product.stock <= 0) return false
  if (!productMatchesUseCaseFilter(product, filters.useCaseTags)) return false

  const minPrice = filters.minPrice ? Number.parseFloat(filters.minPrice) : NaN
  const maxPrice = filters.maxPrice ? Number.parseFloat(filters.maxPrice) : NaN
  if (!Number.isNaN(minPrice) && product.price < minPrice) return false
  if (!Number.isNaN(maxPrice) && product.price > maxPrice) return false

  if (!productMatchesSpecFilter(product.specs, 'socket', filters.sockets)) return false
  if (!productMatchesSpecFilter(product.specs, 'memoryType', filters.memoryTypes)) return false
  if (!productMatchesSpecFilter(product.specs, 'formFactor', filters.formFactors)) return false

  const minWattage = filters.minWattage ? Number.parseInt(filters.minWattage, 10) : NaN
  if (!Number.isNaN(minWattage) && hasSpecKey(product.specs, 'wattage')) {
    if (getNumericSpecMax(product.specs, 'wattage') < minWattage) return false
  }

  const minVram = filters.minVram ? Number.parseInt(filters.minVram, 10) : NaN
  if (!Number.isNaN(minVram)) {
    const maxVram = Math.max(
      0,
      ...getSpecValues(product.specs, 'vram').map((v) => parseVramGb(v)),
    )
    if (maxVram > 0 && maxVram < minVram) return false
  }

  const hasBuildParts = Object.keys(build).length > 0
  if (filters.hideIncompatible && hasBuildParts && product.category !== 'Prebuilt PC') {
    if (getIncompatibilityReason(product, build)) return false
  }

  return true
}

export function parseFiltersFromSearchParams(params: URLSearchParams): StoreFiltersState {
  const base = defaultStoreFilters()
  const minPrice = params.get('minPrice')
  const maxPrice = params.get('maxPrice')
  if (minPrice) base.minPrice = minPrice
  if (maxPrice) base.maxPrice = maxPrice
  if (params.get('inStock') === '1') base.inStockOnly = true
  if (params.get('hideIncompat') === '1') base.hideIncompatible = true
  const useCase = params.get('useCase')
  if (useCase) base.useCaseTags = useCase.split(',').filter(Boolean) as UseCaseTag[]
  const socket = params.get('socket')
  if (socket) base.sockets = socket.split(',').filter(Boolean)
  const memory = params.get('memory')
  if (memory) base.memoryTypes = memory.split(',').filter(Boolean)
  const form = params.get('form')
  if (form) base.formFactors = form.split(',').filter(Boolean)
  const minWattage = params.get('minWattage')
  if (minWattage) base.minWattage = minWattage
  const minVram = params.get('minVram')
  if (minVram) base.minVram = minVram
  return base
}

export function applyFiltersToSearchParams(
  params: URLSearchParams,
  filters: StoreFiltersState,
): URLSearchParams {
  const next = new URLSearchParams(params)
  if (filters.minPrice) next.set('minPrice', filters.minPrice)
  else next.delete('minPrice')
  if (filters.maxPrice) next.set('maxPrice', filters.maxPrice)
  else next.delete('maxPrice')
  if (filters.inStockOnly) next.set('inStock', '1')
  else next.delete('inStock')
  if (filters.hideIncompatible) next.set('hideIncompat', '1')
  else next.delete('hideIncompat')
  if (filters.sockets.length) next.set('socket', filters.sockets.join(','))
  else next.delete('socket')
  if (filters.memoryTypes.length) next.set('memory', filters.memoryTypes.join(','))
  else next.delete('memory')
  if (filters.formFactors.length) next.set('form', filters.formFactors.join(','))
  else next.delete('form')
  if (filters.minWattage) next.set('minWattage', filters.minWattage)
  else next.delete('minWattage')
  if (filters.minVram) next.set('minVram', filters.minVram)
  else next.delete('minVram')
  if (filters.useCaseTags.length) next.set('useCase', filters.useCaseTags.join(','))
  else next.delete('useCase')
  return next
}

export function hasActiveStoreFilters(filters: StoreFiltersState): boolean {
  return (
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.inStockOnly ||
    filters.hideIncompatible ||
    filters.sockets.length > 0 ||
    filters.memoryTypes.length > 0 ||
    filters.formFactors.length > 0 ||
    Boolean(filters.minWattage) ||
    Boolean(filters.minVram) ||
    filters.useCaseTags.length > 0
  )
}

export type SortOption =
  | 'recommended'
  | 'compatible-first'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'name-asc'
  | 'in-stock'

type BuildMap = Partial<Record<Category, Product>>

const compatSortKey = (product: Product, build: BuildMap) => {
  if (product.category === 'Prebuilt PC' || Object.keys(build).length === 0) return 0
  return getProductCompatState(product, build).compatible ? 0 : 1
}

export function countCompatInList(products: Product[], build: BuildMap) {
  let compatible = 0
  let incompatible = 0
  for (const product of products) {
    if (product.category === 'Prebuilt PC' || Object.keys(build).length === 0) continue
    const { compatible: isCompat } = getProductCompatState(product, build)
    if (isCompat) compatible++
    else incompatible++
  }
  return { compatible, incompatible }
}

export function sortProducts(products: Product[], sortBy: SortOption, build: BuildMap = {}): Product[] {
  const list = [...products]
  const hasBuild = Object.keys(build).length > 0

  if (sortBy === 'compatible-first' && hasBuild) {
    return list.sort((a, b) => {
      const compatDiff = compatSortKey(a, build) - compatSortKey(b, build)
      if (compatDiff !== 0) return compatDiff
      const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)
      if (stockDiff !== 0) return stockDiff
      return a.price - b.price
    })
  }

  if (sortBy === 'recommended') {
    return list.sort((a, b) => {
      if (hasBuild) {
        const compatDiff = compatSortKey(a, build) - compatSortKey(b, build)
        if (compatDiff !== 0) return compatDiff
      }
      const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)
      if (stockDiff !== 0) return stockDiff
      return b.createdAt - a.createdAt
    })
  }
  if (sortBy === 'in-stock') {
    return list.sort((a, b) => {
      const stockDiff = (b.stock > 0 ? 1 : 0) - (a.stock > 0 ? 1 : 0)
      if (stockDiff !== 0) return stockDiff
      return a.price - b.price
    })
  }
  if (sortBy === 'price-asc') return list.sort((a, b) => a.price - b.price)
  if (sortBy === 'price-desc') return list.sort((a, b) => b.price - a.price)
  if (sortBy === 'newest') return list.sort((a, b) => b.createdAt - a.createdAt)
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export function getProductCompatState(
  product: Product,
  build: Partial<Record<Category, Product>>,
): { compatible: boolean; reasonKey: IncompatReasonKey | null } {
  if (product.category === 'Prebuilt PC' || Object.keys(build).length === 0) {
    return { compatible: true, reasonKey: null }
  }
  const reasonKey = getIncompatibilityReason(product, build)
  return { compatible: !reasonKey, reasonKey }
}
