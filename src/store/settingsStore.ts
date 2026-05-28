import { create } from 'zustand'

export interface StoreSettings {
  instagramHandle: string
  instagramUrl: string
  googleMapsEmbedUrl: string
  address: string
  workingHours: string
  phone: string
  lowStockThreshold: number
  assemblyNote: string
  backorderLeadDays: string
}

const STORAGE_KEY = 'kurdi_store_settings'

export const defaultStoreSettings = (): StoreSettings => ({
  instagramHandle: '',
  instagramUrl: '',
  googleMapsEmbedUrl: '',
  address: '',
  workingHours: '',
  phone: '',
  lowStockThreshold: 3,
  assemblyNote: '',
  backorderLeadDays: '2-3',
})

const loadSettings = (): StoreSettings => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultStoreSettings()
  try {
    return { ...defaultStoreSettings(), ...(JSON.parse(raw) as Partial<StoreSettings>) }
  } catch {
    return defaultStoreSettings()
  }
}

const persist = (settings: StoreSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function hasStoreLocationInfo(settings: StoreSettings): boolean {
  return Boolean(
    settings.address.trim() ||
      settings.workingHours.trim() ||
      settings.phone.trim() ||
      settings.googleMapsEmbedUrl.trim() ||
      settings.assemblyNote.trim(),
  )
}

export function hasInstagramInfo(settings: StoreSettings): boolean {
  return Boolean(settings.instagramHandle.trim() || settings.instagramUrl.trim())
}

interface SettingsState {
  settings: StoreSettings
  updateSettings: (updates: Partial<StoreSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadSettings(),
  updateSettings: (updates) =>
    set(() => {
      const next = { ...get().settings, ...updates }
      persist(next)
      return { settings: next }
    }),
  resetSettings: () =>
    set(() => {
      const next = defaultStoreSettings()
      persist(next)
      return { settings: next }
    }),
}))
