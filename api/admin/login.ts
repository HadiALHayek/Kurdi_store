import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  createSessionToken,
  setSessionCookie,
  verifyAdminPassword,
} from '../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(503).json({ error: 'Server auth not configured' })
  }

  const body = req.body as { password?: string } | undefined
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  const token = createSessionToken(secret)
  setSessionCookie(res, token)
  return res.status(200).json({ ok: true })
}
