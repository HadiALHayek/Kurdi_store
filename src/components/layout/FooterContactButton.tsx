import { useState } from 'react'
import { Phone } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCustomersStore } from '../../store/customersStore'
import { QuoteRequestModal } from '../builder/QuoteRequestModal'

export function FooterContactButton() {
  const { t } = useI18n()
  const submitLead = useCustomersStore((s) => s.submitLead)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (name: string, phone: string) => {
    setError('')
    const result = await submitLead({
      name,
      phone,
      partsSummary: t('contactRequestSummary'),
      partCount: 0,
      total: 0,
      source: 'contact',
    })
    if (!result.ok) {
      setError(t('customerQuoteFailed'))
      return
    }
    setOpen(false)
    setMessage(t('contactRequestSaved'))
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setMessage('')
          setError('')
          setOpen(true)
        }}
        className="inline-flex items-center gap-1.5 text-text-muted transition hover:text-brand-cyan"
      >
        <Phone size={14} />
        {t('contactCallback')}
      </button>
      {message && <p className="mt-2 text-xs text-success">{message}</p>}
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <QuoteRequestModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={(name, phone) => void handleSubmit(name, phone)}
      />
    </>
  )
}
