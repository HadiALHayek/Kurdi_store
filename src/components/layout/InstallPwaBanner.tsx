import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useI18n } from '../../i18n'

const DISMISS_KEY = 'kurdi_pwa_dismiss'

export function InstallPwaBanner() {
  const { t } = useI18n()
  const [deferred, setDeferred] = useState<{ prompt: () => Promise<void> } | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred({ prompt: () => (e as BeforeInstallPromptEvent).prompt() })
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed || isStandalone) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-brand/40 bg-surface/95 p-3 shadow-glow backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-6">
      <Download size={20} className="shrink-0 text-brand-cyan" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{t('pwaInstallTitle')}</p>
        <p className="text-xs text-text-muted">{t('pwaInstallDesc')}</p>
      </div>
      {deferred ? (
        <button
          type="button"
          className="btn-primary shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold"
          onClick={() => void deferred.prompt()}
        >
          {t('pwaInstall')}
        </button>
      ) : (
        <span className="text-xs text-text-muted">{t('pwaInstallHint')}</span>
      )}
      <button
        type="button"
        className="shrink-0 text-text-muted hover:text-white"
        aria-label="Dismiss"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1')
          setDismissed(true)
        }}
      >
        <X size={18} />
      </button>
    </div>
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}
