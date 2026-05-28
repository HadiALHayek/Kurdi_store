import { create } from 'zustand'

const MAX_COMPARE = 3

interface CompareState {
  ids: string[]
  toggle: (id: string) => void
  setIds: (ids: string[]) => void
  remove: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
  shareUrl: () => string
}

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  toggle: (id) =>
    set((state) => {
      if (state.ids.includes(id)) {
        return { ids: state.ids.filter((item) => item !== id) }
      }
      if (state.ids.length >= MAX_COMPARE) return state
      return { ids: [...state.ids, id] }
    }),
  setIds: (ids) => set({ ids: ids.slice(0, MAX_COMPARE) }),
  remove: (id) => set((state) => ({ ids: state.ids.filter((item) => item !== id) })),
  clear: () => set({ ids: [] }),
  isSelected: (id) => get().ids.includes(id),
  shareUrl: () => {
    const ids = get().ids
    if (!ids.length) return `${window.location.origin}/`
    return `${window.location.origin}/?compare=${ids.join(',')}`
  },
}))

export const MAX_COMPARE_ITEMS = MAX_COMPARE
