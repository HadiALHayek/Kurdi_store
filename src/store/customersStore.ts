import { create } from 'zustand'
import type { CustomerQuoteRequest } from '../types'

const STORAGE_KEY = 'kurdi_customers_v1'
const MAX_REQUESTS = 500

const load = (): CustomerQuoteRequest[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CustomerQuoteRequest[]) : []
  } catch {
    return []
  }
}

const persist = (requests: CustomerQuoteRequest[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.slice(-MAX_REQUESTS)))
}

type NewCustomerQuoteRequest = Omit<CustomerQuoteRequest, 'id' | 'createdAt'>

interface CustomersState {
  requests: CustomerQuoteRequest[]
  addRequest: (request: NewCustomerQuoteRequest) => string
  removeRequest: (id: string) => void
  clearAll: () => void
  exportCsv: () => string
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  requests: load(),
  addRequest: (request) => {
    const entry: CustomerQuoteRequest = {
      ...request,
      id: `cust-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    }
    set((state) => {
      const next = [...state.requests, entry]
      persist(next)
      return { requests: next }
    })
    return entry.id
  },
  removeRequest: (id) =>
    set((state) => {
      const next = state.requests.filter((request) => request.id !== id)
      persist(next)
      return { requests: next }
    }),
  clearAll: () => {
    persist([])
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
