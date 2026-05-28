import { create } from 'zustand'
import type { ProductBundle } from '../types'

const STORAGE_KEY = 'kurdi_product_bundles_v1'

const load = (): ProductBundle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProductBundle[]) : []
  } catch {
    return []
  }
}

const persist = (items: ProductBundle[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

interface BundlesState {
  bundles: ProductBundle[]
  add: (payload: Omit<ProductBundle, 'id'>) => void
  update: (id: string, payload: Partial<Omit<ProductBundle, 'id'>>) => void
  remove: (id: string) => void
}

export const useBundlesStore = create<BundlesState>((set) => ({
  bundles: load(),
  add: (payload) =>
    set((state) => {
      const next = [{ ...payload, id: `bnd-${crypto.randomUUID()}` }, ...state.bundles]
      persist(next)
      return { bundles: next }
    }),
  update: (id, payload) =>
    set((state) => {
      const next = state.bundles.map((b) => (b.id === id ? { ...b, ...payload } : b))
      persist(next)
      return { bundles: next }
    }),
  remove: (id) =>
    set((state) => {
      const next = state.bundles.filter((b) => b.id !== id)
      persist(next)
      return { bundles: next }
    }),
}))
