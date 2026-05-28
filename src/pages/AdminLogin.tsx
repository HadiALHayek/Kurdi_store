import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n'

const ADMIN_PASSWORD = 'admin123'

export function AdminLogin() {
  const { t, lang, setLang } = useI18n()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('kurdi_admin_session', '1')
      navigate('/admin/dashboard')
      return
    }
    setError(t('invalidPassword'))
  }

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
          />
        </div>
        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
        <button type="submit" className="button-pop btn-primary w-full rounded-xl py-3 font-semibold">
          {t('login')}
        </button>
      </form>
    </main>
  )
}
