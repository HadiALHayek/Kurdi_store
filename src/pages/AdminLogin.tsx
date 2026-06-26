import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'
import {
  adminLogin,
  formatLockoutMinutes,
  getLockoutStatus,
  isAdminSessionValid,
} from '../utils/adminAuth'
import { establishApiSession } from '../utils/leadsApi'

export function AdminLogin() {
  const { t, lang, setLang } = useI18n()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lockoutRemainingMs, setLockoutRemainingMs] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdminSessionValid()) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    const tick = () => {
      const status = getLockoutStatus()
      setLockoutRemainingMs(status.locked ? status.remainingMs : 0)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [error])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const lockout = getLockoutStatus()
    if (lockout.locked) {
      setError(
        t('loginLockedHint').replace('{minutes}', String(formatLockoutMinutes(lockout.remainingMs))),
      )
      return
    }

    setLoading(true)
    try {
      const result = await adminLogin(password)
      if (result.ok) {
        await establishApiSession(password)
        navigate('/admin/dashboard')
        return
      }
      if (result.error === 'locked') {
        setError(
          t('loginLockedHint').replace('{minutes}', String(formatLockoutMinutes(getLockoutStatus().remainingMs))),
        )
      } else {
        const status = getLockoutStatus()
        setError(
          status.attemptsLeft > 0
            ? `${t('invalidPassword')} (${status.attemptsLeft} ${t('attemptsRemaining')})`
            : t('invalidPassword'),
        )
      }
    } finally {
      setLoading(false)
      setPassword('')
    }
  }

  const locked = lockoutRemainingMs > 0

  return (
    <main className="page-enter grid min-h-[85vh] place-content-center px-4">
      <form
        onSubmit={handleSubmit}
        className="glass-card w-full max-w-md space-y-5 rounded-2xl p-8 shadow-glow-strong"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-ghost rounded-lg px-3 py-1 text-xs font-semibold"
          >
            {t('switchLang')}
          </button>
        </div>
        <img src="/kurdi-logo.png" alt="Kurdi Store logo" className="logo-glow mx-auto h-24 w-auto" />
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">{t('admin')}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-white">{t('adminLogin')}</h1>
        </div>
        <div className="input-field rounded-xl px-4 py-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('enterAdminPassword')}
            className="w-full bg-transparent outline-none"
            autoComplete="current-password"
            disabled={locked || loading}
            required
          />
        </div>
        {locked && (
          <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            {t('loginLockedHint').replace('{minutes}', String(formatLockoutMinutes(lockoutRemainingMs)))}
          </p>
        )}
        {error && !locked && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <button
          type="submit"
          disabled={locked || loading}
          className="button-pop btn-primary w-full rounded-xl py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '…' : t('login')}
        </button>
        <p className="text-center text-xs text-text-muted">{t('adminSecurityNote')}</p>
        <Link to="/" className="block text-center text-sm text-text-muted hover:text-brand-cyan">
          ← {t('backToStore')}
        </Link>
      </form>
    </main>
  )
}
