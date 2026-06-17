import type { Product } from '../types'

export type ProductSpecs = Record<string, string | string[]>

/** All values for a spec key (supports string, string[], or comma-separated legacy text). */
export function getSpecValues(specs: ProductSpecs, key: string): string[] {
  const raw = specs[key]
  if (raw == null) return []

  const values = Array.isArray(raw) ? raw : [raw]
  return values
    .flatMap((entry) => entry.split(/[,;|]/).map((s) => s.trim()))
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
}

export function formatSpecDisplay(specs: ProductSpecs, key: string): string {
  return getSpecValues(specs, key).join(', ')
}

export function hasSpecKey(specs: ProductSpecs, key: string): boolean {
  return getSpecValues(specs, key).length > 0
}

export function getSpecKeys(specs: ProductSpecs): string[] {
  return Object.keys(specs).filter((key) => hasSpecKey(specs, key))
}

export function getNumericSpecMax(specs: ProductSpecs, key: string): number {
  const nums = getSpecValues(specs, key)
    .map((v) => Number.parseInt(v, 10))
    .filter((n) => !Number.isNaN(n))
  return nums.length ? Math.max(...nums) : 0
}

export function specValuesOverlap(
  a: ProductSpecs,
  keyA: string,
  b: ProductSpecs,
  keyB: string = keyA,
): boolean {
  const va = getSpecValues(a, keyA)
  const vb = getSpecValues(b, keyB)
  if (!va.length || !vb.length) return false
  return va.some((v) => vb.includes(v))
}

export function specMatchesAny(specs: ProductSpecs, key: string, allowed: string[]): boolean {
  return getSpecValues(specs, key).some((v) => allowed.includes(v))
}

export function addSpecValue(specs: ProductSpecs, key: string, value: string): ProductSpecs {
  const trimmed = value.trim()
  if (!trimmed) return specs

  const existing = getSpecValues(specs, key)
  if (existing.includes(trimmed)) return specs

  const next = [...existing, trimmed]
  return { ...specs, [key]: next.length === 1 ? next[0] : next }
}

export function removeSpecValue(specs: ProductSpecs, key: string, value: string): ProductSpecs {
  const next = getSpecValues(specs, key).filter((v) => v !== value)
  const updated = { ...specs }
  if (next.length === 0) {
    delete updated[key]
  } else {
    updated[key] = next.length === 1 ? next[0] : next
  }
  return updated
}

export function flattenSpecsForSearch(specs: ProductSpecs): string[] {
  return getSpecKeys(specs).flatMap((key) => [key, ...getSpecValues(specs, key)])
}

export function collectSpecValuesAcrossProducts(
  products: Product[],
  key: string,
): string[] {
  const values = new Set<string>()
  for (const product of products) {
    for (const value of getSpecValues(product.specs, key)) {
      values.add(value)
    }
  }
  return [...values].sort()
}

export function productMatchesSpecFilter(
  specs: ProductSpecs,
  key: string,
  selected: string[],
): boolean {
  if (selected.length === 0) return true
  const values = getSpecValues(specs, key)
  if (!values.length) return false
  return values.some((v) => selected.includes(v))
}
