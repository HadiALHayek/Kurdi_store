import { create } from 'zustand'
import { getNumericSpecMax } from '../utils/productSpecs'
import type { BuildMap, BuilderSlotId, Product } from '../types'
import { budgetPresets } from '../data/budgetPresets'
import type { BuildTemplate } from '../types'
import {
  BUILDER_SLOTS_ORDER,
  getNextEmptySlot,
  getSelectedBuildTotal,
  normalizeBuildMap,
  slotAcceptsProduct,
} from '../utils/builderSlots'

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

type HistoryMap = Partial<Record<BuilderSlotId, Product[]>>

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

const persist = (build: BuildMap) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeBuildMap(build)))
const persistHistory = (history: HistoryMap) => localStorage.setItem(HISTORY_KEY, JSON.stringify(history))

const pushHistory = (
  history: HistoryMap,
  slot: BuilderSlotId,
  previous: Product | undefined,
): HistoryMap => {
  if (!previous) return history
  const list = history[slot] ?? []
  if (list[0]?.id === previous.id) return history
  const next = [previous, ...list.filter((p) => p.id !== previous.id)].slice(0, 3)
  return { ...history, [slot]: next }
}

interface BuilderState {
  slotsOrder: BuilderSlotId[]
  activeCategory: BuilderSlotId
  build: BuildMap
  partHistory: HistoryMap
  showAllParts: boolean
  setActiveCategory: (slot: BuilderSlotId) => void
  setShowAllParts: (value: boolean) => void
  selectPart: (slot: BuilderSlotId, product: Product) => void
  restoreFromHistory: (slot: BuilderSlotId, product: Product) => void
  removePart: (slot: BuilderSlotId) => void
  resetBuild: () => void
  loadBuild: (next: BuildMap) => void
  applyPreset: (presetId: string, products: Product[]) => boolean
  applyTemplate: (templateId: string, products: Product[]) => boolean
  selectedCount: () => number
  totalPrice: () => number
  totalRequiredWattage: () => number
  hasSelection: () => boolean
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  slotsOrder: BUILDER_SLOTS_ORDER,
  activeCategory: 'CPU',
  build: loadBuild(),
  partHistory: loadHistory(),
  showAllParts: false,
  setActiveCategory: (slot) => set({ activeCategory: slot }),
  setShowAllParts: (value) => set({ showAllParts: value }),
  selectPart: (slot, product) =>
    set((state) => {
      if (!slotAcceptsProduct(slot, product)) return state
      const previous = state.build[slot]
      const nextHistory = pushHistory(state.partHistory, slot, previous)
      persistHistory(nextHistory)
      const nextBuild = { ...state.build, [slot]: product }
      persist(nextBuild)
      const nextSlot = getNextEmptySlot(nextBuild)
      return {
        build: nextBuild,
        partHistory: nextHistory,
        activeCategory: nextSlot ?? slot,
      }
    }),
  restoreFromHistory: (slot, product) => {
    get().selectPart(slot, product)
  },
  removePart: (slot) =>
    set((state) => {
      const nextBuild = normalizeBuildMap(state.build)
      delete nextBuild[slot]
      persist(nextBuild)
      return { build: nextBuild }
    }),
  resetBuild: () => {
    persist({})
    persistHistory({})
    set({ build: {}, partHistory: {}, activeCategory: 'CPU' })
  },
  loadBuild: (next) => {
    const normalized = normalizeBuildMap(next)
    persist(normalized)
    set({ build: normalized })
  },
  applyPreset: (presetId, products) => {
    const preset = budgetPresets.find((p) => p.id === presetId)
    if (!preset) return false
    const nextBuild: BuildMap = {}
    for (const [slot, productId] of Object.entries(preset.parts)) {
      const product = products.find((p) => p.id === productId)
      if (product) nextBuild[slot as BuilderSlotId] = product
    }
    persist(nextBuild)
    set({ build: nextBuild, activeCategory: getNextEmptySlot(nextBuild) ?? 'CPU' })
    return true
  },
  applyTemplate: (templateId, products) => {
    const template = loadTemplates().find((t) => t.id === templateId)
    if (!template) return false
    const nextBuild: BuildMap = {}
    for (const [slot, productId] of Object.entries(template.parts)) {
      const product = products.find((p) => p.id === productId)
      if (product) nextBuild[slot as BuilderSlotId] = product
    }
    persist(nextBuild)
    set({ build: nextBuild, activeCategory: getNextEmptySlot(nextBuild) ?? 'CPU' })
    return true
  },
  selectedCount: () => getSelectedCount(get().build),
  totalPrice: () => getSelectedBuildTotal(get().build),
  totalRequiredWattage: () => {
    const cpu = get().build.CPU
    const gpu = get().build.GPU
    const cpuTdp = getNumericSpecMax(cpu?.specs ?? {}, 'tdp')
    const gpuTdp = getNumericSpecMax(gpu?.specs ?? {}, 'tdp')
    return cpuTdp + gpuTdp + 100
  },
  hasSelection: () => getSelectedCount(get().build) > 0,
}))

function getSelectedCount(build: BuildMap): number {
  return BUILDER_SLOTS_ORDER.filter((slot) => Boolean(build[slot])).length
}
