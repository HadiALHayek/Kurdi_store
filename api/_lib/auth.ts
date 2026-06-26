import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

export const SESSION_COOKIE = 'kurdi_admin_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

function base64UrlEncode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function createSessionToken(secret: string): string {
  const expiresAt = Date.now() + SESSION_DURATION_MS
  const payload = base64UrlEncode(JSON.stringify({ exp: expiresAt }))
  const signature = signPayload(payload, secret)
  return `${payload}.${signature}`
}

export function verifySessionToken(token: string, secret: string): boolean {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return false

  const expected = signPayload(payload, secret)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (sigBuf.length !== expectedBuf.length) return false

  try {
    if (!timingSafeEqual(sigBuf, expectedBuf)) return false
  } catch {
    return false
  }

  try {
    const data = JSON.parse(base64UrlDecode(payload)) as { exp?: number }
    return typeof data.exp === 'number' && data.exp > Date.now()
  } catch {
    return false
  }
}

function parseCookies(req: VercelRequest): Record<string, string> {
  const header = req.headers.cookie
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, decodeURIComponent(rest.join('='))]
    }),
  )
}

export function getSessionToken(req: VercelRequest): string | null {
  const cookies = parseCookies(req)
  return cookies[SESSION_COOKIE] ?? null
}

export function verifyAdminSession(req: VercelRequest): boolean {
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  const token = getSessionToken(req)
  if (!token) return false
  return verifySessionToken(token, secret)
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected || !password) return false

  const passBuf = Buffer.from(password)
  const expectedBuf = Buffer.from(expected)
  if (passBuf.length !== expectedBuf.length) return false

  try {
    return timingSafeEqual(passBuf, expectedBuf)
  } catch {
    return false
  }
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const isProd = process.env.VERCEL_ENV === 'production'
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${Math.floor(SESSION_DURATION_MS / 1000)}`,
    'SameSite=Lax',
  ]
  if (isProd) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(res: VercelResponse) {
  const isProd = process.env.VERCEL_ENV === 'production'
  const parts = [`${SESSION_COOKIE}=`, 'HttpOnly', 'Path=/', 'Max-Age=0', 'SameSite=Lax']
  if (isProd) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}
