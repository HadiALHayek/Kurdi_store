const CREDENTIALS_KEY = 'kurdi_admin_credentials_v1'
const SESSION_KEY = 'kurdi_admin_session_v1'
const LEGACY_SESSION_KEY = 'kurdi_admin_session'
const LOCKOUT_KEY = 'kurdi_admin_lockout_v1'

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000
const PBKDF2_ITERATIONS = 210_000
const SALT_BYTES = 16
const MIN_PASSWORD_LENGTH = 8

/** Only used when no password has been set yet (first visit / migration). */
const INITIAL_PASSWORD = 'admin123'

interface StoredCredentials {
  version: 1
  salt: string
  hash: string
}

interface AdminSession {
  token: string
  expiresAt: number
}

interface LockoutState {
  failedAttempts: number
  lockoutUntil: number | null
}

export type AdminLoginError = 'invalid' | 'locked'
export type ChangePasswordError = 'wrong_current' | 'mismatch' | 'weak'

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
}

function fromBase64(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  return new Uint8Array(bits)
}

async function hashPassword(
  password: string,
  saltBytes?: Uint8Array,
): Promise<{ salt: string; hash: string }> {
  const salt = saltBytes ?? crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const derived = await deriveKey(password, salt)
  return { salt: toBase64(salt), hash: toBase64(derived) }
}

function loadCredentials(): StoredCredentials | null {
  const raw = localStorage.getItem(CREDENTIALS_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StoredCredentials
    if (parsed.version === 1 && parsed.salt && parsed.hash) return parsed
  } catch {
    // ignore
  }
  return null
}

function saveCredentials(credentials: StoredCredentials) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials))
}

async function ensureCredentialsInitialized() {
  if (loadCredentials()) return
  const { salt, hash } = await hashPassword(INITIAL_PASSWORD)
  saveCredentials({ version: 1, salt, hash })
}

function loadLockout(): LockoutState {
  const raw = localStorage.getItem(LOCKOUT_KEY)
  if (!raw) return { failedAttempts: 0, lockoutUntil: null }
  try {
    return JSON.parse(raw) as LockoutState
  } catch {
    return { failedAttempts: 0, lockoutUntil: null }
  }
}

function saveLockout(state: LockoutState) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state))
}

export function getLockoutStatus(): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  const state = loadLockout()
  const now = Date.now()
  if (state.lockoutUntil && state.lockoutUntil > now) {
    return {
      locked: true,
      remainingMs: state.lockoutUntil - now,
      attemptsLeft: 0,
    }
  }
  if (state.lockoutUntil && state.lockoutUntil <= now) {
    saveLockout({ failedAttempts: 0, lockoutUntil: null })
  }
  return {
    locked: false,
    remainingMs: 0,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.failedAttempts),
  }
}

function recordFailedLogin() {
  const state = loadLockout()
  const failedAttempts = state.failedAttempts + 1
  if (failedAttempts >= MAX_ATTEMPTS) {
    saveLockout({ failedAttempts, lockoutUntil: Date.now() + LOCKOUT_MS })
  } else {
    saveLockout({ failedAttempts, lockoutUntil: null })
  }
}

function clearFailedLogins() {
  saveLockout({ failedAttempts: 0, lockoutUntil: null })
}

function createSession() {
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32)))
  const session: AdminSession = { token, expiresAt: Date.now() + SESSION_DURATION_MS }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

export function isAdminSessionValid(): boolean {
  const legacy = sessionStorage.getItem(LEGACY_SESSION_KEY)
  if (legacy === '1') {
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
    return false
  }

  const raw = sessionStorage.getItem(SESSION_KEY)
  if (!raw) return false

  try {
    const session = JSON.parse(raw) as AdminSession
    if (!session.token || session.token.length < 20) return false
    if (session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY)
      return false
    }
    return true
  } catch {
    sessionStorage.removeItem(SESSION_KEY)
    return false
  }
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(LEGACY_SESSION_KEY)
}

export async function adminLogin(password: string): Promise<{ ok: true } | { ok: false; error: AdminLoginError }> {
  const lockout = getLockoutStatus()
  if (lockout.locked) return { ok: false, error: 'locked' }

  await ensureCredentialsInitialized()
  const creds = loadCredentials()
  if (!creds) return { ok: false, error: 'invalid' }

  const { hash } = await hashPassword(password, fromBase64(creds.salt))
  if (hash !== creds.hash) {
    recordFailedLogin()
    return { ok: false, error: 'invalid' }
  }

  clearFailedLogins()
  createSession()
  return { ok: true }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<{ ok: true } | { ok: false; error: ChangePasswordError }> {
  if (newPassword.length < MIN_PASSWORD_LENGTH) return { ok: false, error: 'weak' }
  if (newPassword !== confirmPassword) return { ok: false, error: 'mismatch' }

  await ensureCredentialsInitialized()
  const creds = loadCredentials()
  if (!creds) return { ok: false, error: 'wrong_current' }

  const { hash: currentHash } = await hashPassword(currentPassword, fromBase64(creds.salt))
  if (currentHash !== creds.hash) return { ok: false, error: 'wrong_current' }

  const { salt, hash } = await hashPassword(newPassword)
  saveCredentials({ version: 1, salt, hash })
  createSession()
  return { ok: true }
}

export function formatLockoutMinutes(remainingMs: number): number {
  return Math.max(1, Math.ceil(remainingMs / 60_000))
}
