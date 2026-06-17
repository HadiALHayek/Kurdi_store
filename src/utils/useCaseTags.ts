import type { Product, UseCaseTag } from '../types'
import { getNumericSpecMax, getSpecValues } from './productSpecs'

const RESOLUTION_TAGS: Record<string, UseCaseTag> = {
  '1080p': '1080p',
  '1440p': '1440p',
  '4K': '4K',
}

const TIER_TAGS: Record<string, UseCaseTag> = {
  Entry: 'entry',
  Mainstream: 'gaming',
  'High-End': 'high-end',
  Extreme: 'high-end',
}

export function getProductUseCaseTags(product: Product): UseCaseTag[] {
  if (product.useCaseTags?.length) return product.useCaseTags
  const tags = new Set<UseCaseTag>()
  const resValues = getSpecValues(product.specs, 'resolutionTarget')
  for (const res of resValues) {
    if (RESOLUTION_TAGS[res]) tags.add(RESOLUTION_TAGS[res])
  }
  const tierValues = getSpecValues(product.specs, 'performanceTier')
  for (const tier of tierValues) {
    if (TIER_TAGS[tier]) tags.add(TIER_TAGS[tier])
  }
  if (product.category === 'GPU') tags.add('gaming')
  if (product.category === 'CPU' && tierValues.length === 0) tags.add('office')
  return [...tags]
}

export function productMatchesUseCaseFilter(product: Product, selected: UseCaseTag[]): boolean {
  if (selected.length === 0) return true
  const tags = getProductUseCaseTags(product)
  return selected.some((t) => tags.includes(t))
}

export const USE_CASE_OPTIONS: UseCaseTag[] = [
  '1080p',
  '1440p',
  '4K',
  'gaming',
  'office',
  'streaming',
  'creator',
  'entry',
  'high-end',
]

export function inferBuildUseCaseSummary(build: Partial<Record<string, Product>>): string | null {
  const gpu = build.GPU
  const cpu = build.CPU
  if (getSpecValues(gpu?.specs ?? {}, 'vram').length > 0) {
    const vram = getNumericSpecMax(gpu?.specs ?? {}, 'vram')
    if (vram >= 12) return '1440p'
    if (vram >= 8) return '1080p'
  }
  if (getNumericSpecMax(cpu?.specs ?? {}, 'tdp') > 0) {
    const tdp = getNumericSpecMax(cpu?.specs ?? {}, 'tdp')
    if (tdp >= 125) return 'creator'
  }
  return null
}
