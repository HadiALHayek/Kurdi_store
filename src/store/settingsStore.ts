import { create } from 'zustand'
import type { ShopDepartment } from '../types'

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
  departmentImages: Partial<Record<ShopDepartment, string>>
}

const STORAGE_KEY = 'kurdi_store_settings'

export const defaultStoreSettings = (): StoreSettings => ({
  instagramHandle: 'kurdi.store.syria',
  instagramUrl: 'https://www.instagram.com/kurdi.store.syria/',
  googleMapsEmbedUrl: 'https://maps.app.goo.gl/Hbj8ChuBYshXxneh9',
  address: 'Al Bahsa, Damascus, Syria',
  workingHours: 'Sat - Thu: 10 AM - 8 PM',
  phone: '0949624524',
  lowStockThreshold: 3,
  assemblyNote: '',
  backorderLeadDays: '2-3',
  departmentImages: {},
})

const isEmptyStoreProfile = (parsed: Partial<StoreSettings>) =>
  !String(parsed.instagramHandle ?? '').trim() &&
  !String(parsed.instagramUrl ?? '').trim() &&
  !String(parsed.address ?? '').trim() &&
  !String(parsed.workingHours ?? '').trim() &&
  !String(parsed.phone ?? '').trim() &&
  !String(parsed.googleMapsEmbedUrl ?? '').trim()

const loadSettings = (): StoreSettings => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultStoreSettings()
  try {
    const parsed = JSON.parse(raw) as Partial<StoreSettings>
    if (isEmptyStoreProfile(parsed)) {
      const next = defaultStoreSettings()
      persist(next)
      return next
    }
    return { ...defaultStoreSettings(), ...parsed, departmentImages: { ...defaultStoreSettings().departmentImages, ...parsed.departmentImages } }
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
