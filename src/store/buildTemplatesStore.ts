import { create } from 'zustand'
import type { BuildTemplate } from '../types'

const STORAGE_KEY = 'kurdi_build_templates_v1'

const load = (): BuildTemplate[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BuildTemplate[]) : []
  } catch {
    return []
  }
}

const persist = (items: BuildTemplate[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items))

interface BuildTemplatesState {
  templates: BuildTemplate[]
  add: (payload: Omit<BuildTemplate, 'id'>) => void
  update: (id: string, payload: Partial<Omit<BuildTemplate, 'id'>>) => void
  remove: (id: string) => void
  importAll: (items: BuildTemplate[]) => void
}

export const useBuildTemplatesStore = create<BuildTemplatesState>((set) => ({
  templates: load(),
  add: (payload) =>
    set((state) => {
      const next = [{ ...payload, id: `tpl-${crypto.randomUUID()}` }, ...state.templates]
      persist(next)
      return { templates: next }
    }),
  update: (id, payload) =>
    set((state) => {
      const next = state.templates.map((t) => (t.id === id ? { ...t, ...payload } : t))
      persist(next)
      return { templates: next }
    }),
  remove: (id) =>
    set((state) => {
      const next = state.templates.filter((t) => t.id !== id)
      persist(next)
      return { templates: next }
    }),
  importAll: (items) => {
    persist(items)
    set({ templates: items })
  },
}))
