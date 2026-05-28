import { Link, useNavigate } from 'react-router-dom'
import { Monitor, Wrench } from 'lucide-react'
import { useI18n } from '../../i18n'

interface StartBuildCTAProps {
  onStartPrebuilt?: () => void
}

export function StartBuildCTA({ onStartPrebuilt }: StartBuildCTAProps) {
  const { t } = useI18n()
  const navigate = useNavigate()

  const handlePrebuilt = () => {
    if (onStartPrebuilt) {
      onStartPrebuilt()
      return
    }
    navigate({ pathname: '/', search: '?category=Prebuilt+PC', hash: 'store-catalog' })
  }

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={handlePrebuilt}
        className="button-pop glass-card relative z-10 flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-brand/30 p-4 text-left transition hover:border-brand/50 hover:shadow-glow"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/25 text-brand-light">
          <Monitor size={24} />
        </span>
        <div>
          <p className="font-display font-semibold text-white">{t('ctaPrebuiltTitle')}</p>
          <p className="text-sm text-text-muted">{t('ctaPrebuiltDesc')}</p>
        </div>
      </button>
      <Link
        to="/builder"
        className="button-pop glass-card flex items-center gap-4 rounded-2xl border border-brand-cyan/30 p-4 transition hover:border-brand-cyan/50 hover:shadow-glow"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-cyan/20 text-brand-cyan">
          <Wrench size={24} />
        </span>
        <div>
          <p className="font-display font-semibold text-white">{t('ctaCustomTitle')}</p>
          <p className="text-sm text-text-muted">{t('ctaCustomDesc')}</p>
        </div>
      </Link>
    </div>
  )
}
