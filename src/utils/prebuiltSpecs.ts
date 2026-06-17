import type { Category, Product } from '../types'
import { getSpecValues, type ProductSpecs } from './productSpecs'

export const PREBUILT_PART_SPEC_KEYS = [
  'cpu',
  'gpu',
  'ram',
  'storage',
  'motherboard',
  'psu',
  'cooling',
] as const

export const PREBUILT_META_SPEC_KEYS = ['resolutionTarget', 'performanceTier', 'os'] as const

export type PrebuiltPartSpecKey = (typeof PREBUILT_PART_SPEC_KEYS)[number]
export type PrebuiltMetaSpecKey = (typeof PREBUILT_META_SPEC_KEYS)[number]

export const PREBUILT_SPEC_TO_CATEGORY: Record<PrebuiltPartSpecKey, Category> = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'Storage',
  motherboard: 'Motherboard',
  psu: 'PSU',
  cooling: 'Cooling',
}

const STORE_PART_PREFIX = 'product:'

export function isPrebuiltPartSpecKey(key: string): key is PrebuiltPartSpecKey {
  return (PREBUILT_PART_SPEC_KEYS as readonly string[]).includes(key)
}

export function isPrebuiltMetaSpecKey(key: string): key is PrebuiltMetaSpecKey {
  return (PREBUILT_META_SPEC_KEYS as readonly string[]).includes(key)
}

export function encodeStorePartRef(productId: string): string {
  return `${STORE_PART_PREFIX}${productId}`
}

export function decodeStorePartRef(value: string): string | null {
  return value.startsWith(STORE_PART_PREFIX) ? value.slice(STORE_PART_PREFIX.length) : null
}

export function formatPrebuiltSpecValue(value: string, products: Product[]): string {
  const productId = decodeStorePartRef(value)
  if (!productId) return value
  const product = products.find((item) => item.id === productId)
  return product?.name ?? value
}

export function formatPrebuiltSpecDisplay(
  specs: ProductSpecs,
  key: string,
  products: Product[],
): string {
  return getSpecValues(specs, key)
    .map((value) => formatPrebuiltSpecValue(value, products))
    .join(', ')
}

export function getStorePartsForPrebuiltSpec(
  products: Product[],
  specKey: PrebuiltPartSpecKey,
  excludeProductId?: string,
): Product[] {
  const category = PREBUILT_SPEC_TO_CATEGORY[specKey]
  return products
    .filter(
      (product) =>
        product.id !== excludeProductId &&
        product.category === category &&
        product.category !== 'Prebuilt PC',
    )
    .sort((a, b) => a.name.localeCompare(b.name))
}
