import type { CustomerQuoteRequest, LeadSource } from '../types'

export type NewCustomerQuoteRequest = Omit<CustomerQuoteRequest, 'id' | 'createdAt' | 'synced'>

export function isLeadsApiConfigured(): boolean {
  return import.meta.env.VITE_LEADS_API_ENABLED !== 'false'
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string }
    return data.error ?? `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

export async function apiSubmitLead(request: NewCustomerQuoteRequest): Promise<CustomerQuoteRequest> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: request.name,
      phone: request.phone,
      partsSummary: request.partsSummary,
      partCount: request.partCount,
      total: request.total,
      buildCode: request.buildCode,
      source: request.source ?? 'builder',
      website: '',
    }),
  })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { lead: CustomerQuoteRequest }
  return data.lead
}

export async function apiFetchLeads(): Promise<CustomerQuoteRequest[]> {
  const res = await fetch('/api/leads', { credentials: 'include' })
  if (!res.ok) throw new Error(await parseError(res))
  const data = (await res.json()) as { leads: CustomerQuoteRequest[] }
  return data.leads
}

export async function apiDeleteLead(id: string): Promise<void> {
  const res = await fetch(`/api/leads/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function apiClearLeads(): Promise<void> {
  const res = await fetch('/api/leads', { method: 'DELETE', credentials: 'include' })
  if (!res.ok) throw new Error(await parseError(res))
}

export async function establishApiSession(password: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password }),
  })
  return res.ok
}

export async function clearApiSession(): Promise<void> {
  try {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
  } catch {
    // ignore network errors on logout
  }
}

export type { LeadSource }
