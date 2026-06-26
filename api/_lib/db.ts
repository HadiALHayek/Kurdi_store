import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface QuoteRequestRow {
  id: string
  created_at: number
  name: string
  phone: string
  parts_summary: string
  part_count: number
  total: number
  build_code: string | null
  source: string | null
}

export interface QuoteRequestDto {
  id: string
  createdAt: number
  name: string
  phone: string
  partsSummary: string
  partCount: number
  total: number
  buildCode?: string
  source?: string
}

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (client) return client

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }

  client = createClient(url, key, { auth: { persistSession: false } })
  return client
}

export function rowToDto(row: QuoteRequestRow): QuoteRequestDto {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    partsSummary: row.parts_summary,
    partCount: row.part_count,
    total: Number(row.total),
    buildCode: row.build_code ?? undefined,
    source: row.source ?? undefined,
  }
}

export function generateLeadId(): string {
  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
