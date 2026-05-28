import { create } from 'zustand'
import type { AnalyticsEvent, AnalyticsEventType } from '../types'

const STORAGE_KEY = 'kurdi_analytics_v1'
const MAX_EVENTS = 500

const load = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []
  } catch {
    return []
  }
}

const persist = (events: AnalyticsEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)))
}

interface AnalyticsState {
  events: AnalyticsEvent[]
  track: (type: AnalyticsEventType, payload?: Record<string, string>) => void
  clear: () => void
  exportCsv: () => string
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  events: load(),
  track: (type, payload = {}) => {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      payload,
      at: Date.now(),
    }
    set((state) => {
      const next = [...state.events, event]
      persist(next)
      return { events: next }
    })
  },
  clear: () => {
    persist([])
    set({ events: [] })
  },
  exportCsv: () => {
    const rows = [['time', 'type', 'payload'], ...get().events.map((e) => [new Date(e.at).toISOString(), e.type, JSON.stringify(e.payload)])]
    return rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  },
}))

export function trackEvent(type: AnalyticsEventType, payload?: Record<string, string>) {
  useAnalyticsStore.getState().track(type, payload)
}
