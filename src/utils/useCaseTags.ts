import type { Product, UseCaseTag } from '../types'

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
  const res = product.specs.resolutionTarget
  if (res && RESOLUTION_TAGS[res]) tags.add(RESOLUTION_TAGS[res])
  const tier = product.specs.performanceTier
  if (tier && TIER_TAGS[tier]) tags.add(TIER_TAGS[tier])
  if (product.category === 'GPU') tags.add('gaming')
  if (product.category === 'CPU' && !tier) tags.add('office')
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
  if (gpu?.specs.vram) {
    const vram = Number.parseInt(gpu.specs.vram, 10) || 0
    if (vram >= 12) return '1440p'
    if (vram >= 8) return '1080p'
  }
  if (cpu?.specs.tdp) {
    const tdp = Number.parseInt(cpu.specs.tdp, 10) || 0
    if (tdp >= 125) return 'creator'
  }
  return null
}
