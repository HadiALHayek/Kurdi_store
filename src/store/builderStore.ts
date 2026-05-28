import { create } from 'zustand'
import type { Category, Product } from '../types'
import { budgetPresets } from '../data/budgetPresets'
import type { BuildTemplate } from '../types'
import { getNextEmptyUnlockedSlot } from '../utils/builderSlots'

const TEMPLATES_KEY = 'kurdi_build_templates_v1'

const loadTemplates = (): BuildTemplate[] => {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY)
    return raw ? (JSON.parse(raw) as BuildTemplate[]) : []
  } catch {
    return []
  }
}

const STORAGE_KEY = 'kurdi_builder_v1'
const HISTORY_KEY = 'kurdi_builder_history_v1'

const slotsOrder: Category[] = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

type BuildMap = Partial<Record<Category, Product>>
type HistoryMap = Partial<Record<Category, Product[]>>

const loadBuild = (): BuildMap => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as BuildMap
  } catch {
    return {}
  }
}

const loadHistory = (): HistoryMap => {
  const raw = localStorage.getItem(HISTORY_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as HistoryMap
  } catch {
    return {}
  }
}

const persist = (build: BuildMap) => localStorage.setItem(STORAGE_KEY, JSON.stringify(build))
const persistHistory = (history: HistoryMap) => localStorage.setItem(HISTORY_KEY, JSON.stringify(history))

const getRequiredForUnlock = (category: Category): Category[] => {
  if (category === 'Motherboard') return ['CPU']
  if (category === 'RAM') return ['CPU', 'Motherboard']
  if (['GPU', 'Storage', 'PSU', 'Case', 'Cooling'].includes(category)) {
    return ['CPU', 'Motherboard', 'RAM']
  }
  return []
}

const pushHistory = (history: HistoryMap, category: Category, previous: Product | undefined): HistoryMap => {
  if (!previous) return history
  const list = history[category] ?? []
  if (list[0]?.id === previous.id) return history
  const next = [previous, ...list.filter((p) => p.id !== previous.id)].slice(0, 3)
  return { ...history, [category]: next }
}

interface BuilderState {
  slotsOrder: Category[]
  activeCategory: Category
  build: BuildMap
  partHistory: HistoryMap
  showAllParts: boolean
  setActiveCategory: (category: Category) => void
  setShowAllParts: (value: boolean) => void
  selectPart: (category: Category, product: Product) => void
  restoreFromHistory: (category: Category, product: Product) => void
  removePart: (category: Category) => void
  resetBuild: () => void
  loadBuild: (next: BuildMap) => void
  applyPreset: (presetId: string, products: Product[]) => boolean
  applyTemplate: (templateId: string, products: Product[]) => boolean
  isUnlocked: (category: Category) => boolean
  selectedCount: () => number
  totalPrice: () => number
  totalRequiredWattage: () => number
  isComplete: () => boolean
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  slotsOrder,
  activeCategory: 'CPU',
  build: loadBuild(),
  partHistory: loadHistory(),
  showAllParts: false,
  setActiveCategory: (category) => set({ activeCategory: category }),
  setShowAllParts: (value) => set({ showAllParts: value }),
  selectPart: (category, product) =>
    set((state) => {
      const previous = state.build[category]
      const nextHistory = pushHistory(state.partHistory, category, previous)
      persistHistory(nextHistory)
      const nextBuild = { ...state.build, [category]: product }
      persist(nextBuild)
      const nextSlot = getNextEmptyUnlockedSlot(nextBuild)
      return {
        build: nextBuild,
        partHistory: nextHistory,
        activeCategory: nextSlot ?? category,
      }
    }),
  restoreFromHistory: (category, product) => {
    get().selectPart(category, product)
  },
  removePart: (category) =>
    set((state) => {
      const nextBuild = { ...state.build, [category]: undefined }
      persist(nextBuild)
      return { build: nextBuild }
    }),
  resetBuild: () => {
    persist({})
    persistHistory({})
    set({ build: {}, partHistory: {}, activeCategory: 'CPU' })
  },
  loadBuild: (next) => {
    persist(next)
    set({ build: next })
  },
  applyPreset: (presetId, products) => {
    const preset = budgetPresets.find((p) => p.id === presetId)
    if (!preset) return false
    const nextBuild: BuildMap = {}
    for (const [slot, productId] of Object.entries(preset.parts)) {
      const product = products.find((p) => p.id === productId)
      if (product) nextBuild[slot as Category] = product
    }
    persist(nextBuild)
    set({ build: nextBuild, activeCategory: getNextEmptyUnlockedSlot(nextBuild) ?? 'CPU' })
    return true
  },
  applyTemplate: (templateId, products) => {
    const template = loadTemplates().find((t) => t.id === templateId)
    if (!template) return false
    const nextBuild: BuildMap = {}
    for (const [slot, productId] of Object.entries(template.parts)) {
      const product = products.find((p) => p.id === productId)
      if (product) nextBuild[slot as Category] = product
    }
    persist(nextBuild)
    set({ build: nextBuild, activeCategory: getNextEmptyUnlockedSlot(nextBuild) ?? 'CPU' })
    return true
  },
  isUnlocked: (category) => getRequiredForUnlock(category).every((needed) => Boolean(get().build[needed])),
  selectedCount: () => get().slotsOrder.filter((slot) => Boolean(get().build[slot])).length,
  totalPrice: () =>
    get()
      .slotsOrder.map((slot) => get().build[slot]?.price ?? 0)
      .reduce((acc, value) => acc + value, 0),
  totalRequiredWattage: () => {
    const cpu = get().build.CPU
    const gpu = get().build.GPU
    const cpuTdp = Number.parseInt(cpu?.specs.tdp ?? '0', 10) || 0
    const gpuTdp = Number.parseInt(gpu?.specs.tdp ?? '0', 10) || 0
    return cpuTdp + gpuTdp + 100
  },
  isComplete: () => get().slotsOrder.every((slot) => Boolean(get().build[slot])),
}))
