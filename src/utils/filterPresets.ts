import type { StoreFiltersState } from './productFilters'

const STORAGE_KEY = 'kurdi_filter_presets_v1'

export interface FilterPreset {
  id: string
  name: string
  filters: StoreFiltersState
}

export function loadFilterPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as FilterPreset[]) : []
  } catch {
    return []
  }
}

export function saveFilterPreset(name: string, filters: StoreFiltersState): FilterPreset[] {
  const presets = loadFilterPresets()
  const entry: FilterPreset = {
    id: `fp-${Date.now()}`,
    name,
    filters: { ...filters },
  }
  const next = [entry, ...presets].slice(0, 8)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function deleteFilterPreset(id: string): FilterPreset[] {
  const next = loadFilterPresets().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
