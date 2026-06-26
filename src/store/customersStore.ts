import { create } from 'zustand'
import type { CustomerQuoteRequest } from '../types'

const UNSYNCED_KEY = 'kurdi_customers_unsynced_v1'
const MAX_UNSYNCED = 50

type NewCustomerQuoteRequest = Omit<CustomerQuoteRequest, 'id' | 'createdAt'>

const loadUnsynced = (): CustomerQuoteRequest[] => {
  try {
    const raw = localStorage.getItem(UNSYNCED_KEY)
    return raw ? (JSON.parse(raw) as CustomerQuoteRequest[]) : []
  } catch {
    return []
  }
}

const persistUnsynced = (requests: CustomerQuoteRequest[]) => {
  localStorage.setItem(UNSYNCED_KEY, JSON.stringify(requests.slice(-MAX_UNSYNCED)))
}

const saveUnsynced = (request: NewCustomerQuoteRequest) => {
  const entry: CustomerQuoteRequest = {
    ...request,
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: Date.now(),
    synced: false,
  }
  persistUnsynced([...loadUnsynced(), entry])
  return entry
}

interface CustomersState {
  requests: CustomerQuoteRequest[]
  loading: boolean
  error: string | null
  fetchLeads: () => Promise<void>
  submitLead: (
    request: NewCustomerQuoteRequest,
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>
  removeRequest: (id: string) => Promise<void>
  clearAll: () => Promise<void>
  exportCsv: () => string
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  requests: [],
  loading: false,
  error: null,

  fetchLeads: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('/api/leads', { credentials: 'include' })
      if (res.status === 401) {
        set({ requests: [], loading: false, error: 'unauthorized' })
        return
      }
      if (!res.ok) {
        throw new Error('fetch_failed')
      }
      const data = (await res.json()) as { leads: CustomerQuoteRequest[] }
      set({ requests: data.leads, loading: false, error: null })
    } catch {
      const unsynced = loadUnsynced()
      set({
        requests: unsynced,
        loading: false,
        error: unsynced.length > 0 ? 'offline_unsynced' : 'fetch_failed',
      })
    }
  },

  submitLead: async (request) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...request, website: '' }),
      })
      const data = (await res.json().catch(() => ({}))) as { error?: string; lead?: CustomerQuoteRequest }

      if (!res.ok) {
        saveUnsynced(request)
        return { ok: false, error: data.error ?? 'Failed to submit request' }
      }

      return { ok: true, id: data.lead?.id ?? '' }
    } catch {
      saveUnsynced(request)
      return { ok: false, error: 'Network error' }
    }
  },

  removeRequest: async (id) => {
    if (id.startsWith('local-')) {
      const next = loadUnsynced().filter((request) => request.id !== id)
      persistUnsynced(next)
      set((state) => ({ requests: state.requests.filter((request) => request.id !== id) }))
      return
    }

    const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error('delete_failed')
    set((state) => ({ requests: state.requests.filter((request) => request.id !== id) }))
  },

  clearAll: async () => {
    const res = await fetch('/api/leads', { method: 'DELETE', credentials: 'include' })
    if (!res.ok && res.status !== 401) throw new Error('clear_failed')
    persistUnsynced([])
    set({ requests: [] })
  },

  exportCsv: () => {
    const rows = [
      ['time', 'name', 'phone', 'parts', 'partCount', 'total', 'buildCode'],
      ...get().requests.map((request) => [
        new Date(request.createdAt).toISOString(),
        request.name,
        request.phone,
        request.partsSummary,
        String(request.partCount),
        String(request.total),
        request.buildCode ?? '',
      ]),
    ]
    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
  },
}))
