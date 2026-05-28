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

const defaultSettings: StoreSettings = {
  instagramHandle: '@kurdi.store.syria',
  instagramUrl:
    'https://www.instagram.com/kurdi.store.syria?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
  googleMapsEmbedUrl: '',
  address: 'Erbil, Kurdistan Region, Iraq',
  workingHours: 'Mon-Sat: 10:00 - 20:00',
  phone: '+964 750 000 0000',
  lowStockThreshold: 3,
  assemblyNote: 'In-store assembly & pickup available.',
  backorderLeadDays: '2-3',
}

const loadSettings = (): StoreSettings => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultSettings
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<StoreSettings>) }
  } catch {
    return defaultSettings
  }
}

const persist = (settings: StoreSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

interface SettingsState {
  settings: StoreSettings
  updateSettings: (updates: Partial<StoreSettings>) => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadSettings(),
  updateSettings: (updates) =>
    set(() => {
      const next = { ...get().settings, ...updates }
      persist(next)
      return { settings: next }
    }),
}))
