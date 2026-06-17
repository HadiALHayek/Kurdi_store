import { create } from 'zustand'
import type { Category, Product } from '../types'
import { StorageQuotaError } from '../utils/imageUpload'

const STORAGE_KEY = 'kurdi_products_v1'

/** Shown only when the browser has no saved catalog yet. */
const seededProducts: Product[] = []

const loadProducts = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seededProducts
  try {
    return JSON.parse(raw) as Product[]
  } catch {
    return seededProducts
  }
}

const persist = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new StorageQuotaError()
    }
    throw error
  }
}

interface ProductsState {
  products: Product[]
  addProduct: (payload: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, payload: Omit<Product, 'id' | 'createdAt'>) => void
  deleteProduct: (id: string) => void
  duplicateProduct: (id: string) => void
  importProducts: (items: Product[]) => void
  clearAllProducts: () => void
  exportProducts: () => Product[]
  getByCategory: (category: Category | 'All') => Product[]
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: loadProducts(),
  addProduct: (payload) =>
    set((state) => {
      const next = [
        {
          ...payload,
          id: `prd-${crypto.randomUUID()}`,
          createdAt: Date.now(),
        },
        ...state.products,
      ]
      persist(next)
      return { products: next }
    }),
  updateProduct: (id, payload) =>
    set((state) => {
      const next = state.products.map((product) =>
        product.id === id ? { ...product, ...payload } : product,
      )
      persist(next)
      return { products: next }
    }),
  deleteProduct: (id) =>
    set((state) => {
      const next = state.products.filter((product) => product.id !== id)
      persist(next)
      return { products: next }
    }),
  duplicateProduct: (id) =>
    set((state) => {
      const source = state.products.find((p) => p.id === id)
      if (!source) return state
      const copy: Product = {
        ...source,
        id: `prd-${crypto.randomUUID()}`,
        name: `${source.name} (copy)`,
        createdAt: Date.now(),
      }
      const next = [copy, ...state.products]
      persist(next)
      return { products: next }
    }),
  importProducts: (items) =>
    set(() => {
      persist(items)
      return { products: items }
    }),
  clearAllProducts: () =>
    set(() => {
      persist([])
      return { products: [] }
    }),
  exportProducts: () => get().products,
  getByCategory: (category) =>
    category === 'All' ? get().products : get().products.filter((product) => product.category === category),
}))
