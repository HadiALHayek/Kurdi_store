export interface LeadRow {
  id: string
  created_at: number
  name: string
  phone: string
  parts_summary: string
  part_count: number
  total: number
  build_code: string | null
  source: string
}

export interface LeadPayload {
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

export function rowToLead(row: LeadRow): LeadPayload {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    phone: row.phone,
    partsSummary: row.parts_summary,
    partCount: row.part_count,
    total: Number(row.total),
    buildCode: row.build_code ?? undefined,
    source: row.source,
  }
}
