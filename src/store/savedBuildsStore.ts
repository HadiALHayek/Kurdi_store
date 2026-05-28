import { create } from 'zustand'
import type { Category, Product, SavedBuild } from '../types'
import { encodeBuildToParam } from '../utils/buildShare'

const STORAGE_KEY = 'kurdi_saved_builds_v1'

const load = (): SavedBuild[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedBuild[]) : []
  } catch {
    return []
  }
}

const persist = (builds: SavedBuild[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(builds))

interface SavedBuildsState {
  builds: SavedBuild[]
  save: (name: string, build: Partial<Record<Category, Product>>) => void
  duplicate: (id: string) => void
  remove: (id: string) => void
  loadIntoBuilder: (id: string, products: Product[]) => Partial<Record<Category, Product>> | null
}

export const useSavedBuildsStore = create<SavedBuildsState>((set, get) => ({
  builds: load(),
  save: (name, build) => {
    const parts: Partial<Record<Category, string>> = {}
    for (const [slot, product] of Object.entries(build)) {
      if (product) parts[slot as Category] = product.id
    }
    const entry: SavedBuild = {
      id: `sb-${Date.now()}`,
      name: name.trim() || 'My build',
      parts,
      updatedAt: Date.now(),
    }
    set((state) => {
      const next = [entry, ...state.builds].slice(0, 12)
      persist(next)
      return { builds: next }
    })
  },
  duplicate: (id) =>
    set((state) => {
      const source = state.builds.find((b) => b.id === id)
      if (!source) return state
      const entry: SavedBuild = {
        ...source,
        id: `sb-${Date.now()}`,
        name: `${source.name} (copy)`,
        updatedAt: Date.now(),
      }
      const next = [entry, ...state.builds].slice(0, 12)
      persist(next)
      return { builds: next }
    }),
  remove: (id) =>
    set((state) => {
      const next = state.builds.filter((b) => b.id !== id)
      persist(next)
      return { builds: next }
    }),
  loadIntoBuilder: (id, products) => {
    const saved = get().builds.find((b) => b.id === id)
    if (!saved) return null
    const result: Partial<Record<Category, Product>> = {}
    for (const [slot, productId] of Object.entries(saved.parts)) {
      const product = products.find((p) => p.id === productId)
      if (product) result[slot as Category] = product
    }
    return result
  },
}))

export function savedBuildShareParam(build: Partial<Record<Category, Product>>) {
  return encodeBuildToParam(build)
}
