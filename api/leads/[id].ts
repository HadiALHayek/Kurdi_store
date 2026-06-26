import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifyAdminSession } from '../_lib/auth.js'
import { getSupabase } from '../_lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!verifyAdminSession(req)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const id = typeof req.query.id === 'string' ? req.query.id : ''
  if (!id) {
    return res.status(400).json({ error: 'Missing lead id' })
  }

  try {
    const supabase = getSupabase()
    const { error } = await supabase.from('quote_requests').delete().eq('id', id)

    if (error) {
      console.error(`DELETE /api/leads/${id} error:`, error)
      return res.status(500).json({ error: 'Failed to delete lead' })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('api/leads/[id] error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
