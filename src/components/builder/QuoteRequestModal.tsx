import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { useI18n } from '../../i18n'

const SYRIAN_MOBILE_REGEX = /^09\d{8}$/

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

interface QuoteRequestModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (name: string, phone: string) => void | Promise<void>
  submitting?: boolean
}

export function QuoteRequestModal({ open, onClose, onSubmit, submitting = false }: QuoteRequestModalProps) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setName('')
      setPhone('')
      setError('')
    }
  }, [open])

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handlePhoneChange = (value: string) => {
    setPhone(digitsOnly(value).slice(0, 10))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedName = name.trim()
    const normalizedPhone = digitsOnly(phone)
    if (!trimmedName) {
      setError(t('customerNameRequired'))
      return
    }
    if (!normalizedPhone) {
      setError(t('customerPhoneRequired'))
      return
    }
    if (!SYRIAN_MOBILE_REGEX.test(normalizedPhone)) {
      setError(t('customerPhoneInvalid'))
      return
    }
    setError('')
    await onSubmit(trimmedName, normalizedPhone)
  }

  return (
    <Modal open={open} title={t('quoteRequestTitle')} onClose={handleClose} size="md">
      <p className="mb-4 text-sm text-text-muted">{t('quoteRequestHint')}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            {t('customerName')} <span className="text-danger">*</span>
          </label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="input-field w-full rounded-xl px-3 py-2.5"
            placeholder={t('customerName')}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text">
            {t('customerPhone')} <span className="text-danger">*</span>
          </label>
          <input
            value={phone}
            onChange={(event) => handlePhoneChange(event.target.value)}
            className="input-field w-full rounded-xl px-3 py-2.5"
            placeholder={t('customerPhonePlaceholder')}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            pattern="09[0-9]{8}"
            maxLength={10}
          />
          <p className="mt-1 text-xs text-text-muted">{t('customerPhoneHint')}</p>
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn-ghost rounded-xl px-4 py-2.5 text-sm font-semibold"
            onClick={handleClose}
            disabled={submitting}
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? '…' : t('quoteRequestSubmit')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
