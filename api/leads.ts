import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAdminSession } from './_lib/auth.js'
import { generateLeadId, getSupabase, rowToDto, type QuoteRequestRow } from './_lib/db.js'
import { validateLeadBody } from './_lib/validation.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      if (!verifyAdminSession(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('quote_requests')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('GET /api/leads error:', error)
        return res.status(500).json({ error: 'Failed to fetch leads' })
      }

      const leads = (data as QuoteRequestRow[]).map(rowToDto)
      return res.status(200).json({ leads })
    }

    if (req.method === 'DELETE') {
      if (!verifyAdminSession(req)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      const supabase = getSupabase()
      const { error } = await supabase.from('quote_requests').delete().gte('created_at', 0)

      if (error) {
        console.error('DELETE /api/leads error:', error)
        return res.status(500).json({ error: 'Failed to clear leads' })
      }

      return res.status(200).json({ ok: true })
    }

    if (req.method === 'POST') {
      const body = req.body as Record<string, unknown> | undefined
      if (body && typeof body.website === 'string' && body.website.trim()) {
        return res.status(400).json({ error: 'Invalid request' })
      }

      const parsed = validateLeadBody(req.body)
      if (!parsed.ok) {
        return res.status(400).json({ error: parsed.error })
      }

      const { data: lead } = parsed
      const id = generateLeadId()
      const createdAt = Date.now()

      const supabase = getSupabase()
      const { error } = await supabase.from('quote_requests').insert({
        id,
        created_at: createdAt,
        name: lead.name,
        phone: lead.phone,
        parts_summary: lead.partsSummary,
        part_count: lead.partCount,
        total: lead.total,
        build_code: lead.buildCode ?? null,
        source: lead.source ?? 'builder',
      })

      if (error) {
        console.error('POST /api/leads error:', error)
        return res.status(500).json({ error: 'Failed to save lead' })
      }

      return res.status(201).json({
        lead: rowToDto({
          id,
          created_at: createdAt,
          name: lead.name,
          phone: lead.phone,
          parts_summary: lead.partsSummary,
          part_count: lead.partCount,
          total: lead.total,
          build_code: lead.buildCode ?? null,
          source: lead.source ?? 'builder',
        }),
      })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('api/leads error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
