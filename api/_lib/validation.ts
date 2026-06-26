export const SYRIAN_PHONE_REGEX = /^09\d{8}$/

export interface LeadInput {
  name: string
  phone: string
  partsSummary: string
  partCount: number
  total: number
  buildCode?: string
  source?: string
}

export function validateLeadBody(body: unknown): { ok: true; data: LeadInput } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid request body' }
  }

  const record = body as Record<string, unknown>
  const name = typeof record.name === 'string' ? record.name.trim() : ''
  const phone = typeof record.phone === 'string' ? record.phone.replace(/\D/g, '') : ''
  const partsSummary = typeof record.partsSummary === 'string' ? record.partsSummary.trim() : ''
  const partCount = typeof record.partCount === 'number' ? record.partCount : Number(record.partCount)
  const total = typeof record.total === 'number' ? record.total : Number(record.total)
  const buildCode = typeof record.buildCode === 'string' && record.buildCode.trim() ? record.buildCode.trim() : undefined
  const source = typeof record.source === 'string' && record.source.trim() ? record.source.trim() : 'builder'

  if (!name) return { ok: false, error: 'Name is required' }
  if (!SYRIAN_PHONE_REGEX.test(phone)) return { ok: false, error: 'Phone must be 10 digits starting with 09' }
  if (!partsSummary) return { ok: false, error: 'Parts summary is required' }
  if (!Number.isFinite(partCount) || partCount < 0) return { ok: false, error: 'Invalid part count' }
  if (!Number.isFinite(total) || total < 0) return { ok: false, error: 'Invalid total' }

  return {
    ok: true,
    data: { name, phone, partsSummary, partCount, total, buildCode, source },
  }
}
