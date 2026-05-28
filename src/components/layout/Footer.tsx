import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="mt-auto border-t border-brand/25 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <Link to="/" className="text-gradient-brand font-display text-lg font-bold transition hover:opacity-90">
              Kurdi Store
            </Link>
            <p className="mt-1 max-w-sm text-sm text-text-muted">{t('brandTagline')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm sm:justify-end">
            <Link to="/" className="text-text-muted transition hover:text-brand-cyan">
              {t('navStore')}
            </Link>
            <Link to="/builder" className="text-text-muted transition hover:text-brand-cyan">
              {t('navBuilder')}
            </Link>
            <Link to="/admin" className="text-text-muted transition hover:text-brand-cyan">
              {t('navAdmin')}
            </Link>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-text-muted sm:text-left">
          <p>
            {new Date().getFullYear()} Kurdi Store · {t('allRights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
