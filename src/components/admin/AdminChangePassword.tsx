import { useState } from 'react'
import { useI18n } from '../../i18n'
import { changeAdminPassword, type ChangePasswordError } from '../../utils/adminAuth'

interface AdminChangePasswordProps {
  onSuccess: (message: string) => void
}

export function AdminChangePassword({ onSuccess }: AdminChangePasswordProps) {
  const { t } = useI18n()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const errorMessage = (code: ChangePasswordError) => {
    if (code === 'weak') return t('passwordTooWeak')
    if (code === 'mismatch') return t('passwordMismatch')
    return t('wrongCurrentPassword')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await changeAdminPassword(currentPassword, newPassword, confirmPassword)
      if (result.ok) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        onSuccess(t('passwordChanged'))
        return
      }
      setError(errorMessage(result.error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-brand/25 bg-brand/5 p-4">
      <p className="font-semibold text-white">{t('changeAdminPassword')}</p>
      <p className="text-xs text-text-muted">{t('changePasswordHint')}</p>
      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="input-field w-full rounded-xl px-3 py-2.5"
        placeholder={t('currentPassword')}
        autoComplete="current-password"
        required
      />
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="input-field w-full rounded-xl px-3 py-2.5"
        placeholder={t('newPassword')}
        autoComplete="new-password"
        minLength={8}
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="input-field w-full rounded-xl px-3 py-2.5"
        placeholder={t('confirmPassword')}
        autoComplete="new-password"
        minLength={8}
        required
      />
      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="button-pop rounded-xl border border-brand/40 bg-surface-2 px-4 py-2.5 text-sm font-semibold text-brand-light hover:border-brand/60 disabled:opacity-50"
      >
        {loading ? '…' : t('changePassword')}
      </button>
    </form>
  )
}
