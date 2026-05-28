import { Cpu, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { formatPrice } from '../../utils/compatibility'

export function BuildSummaryBar() {
  const { t } = useI18n()
  const selectedCount = useBuilderStore((s) => s.selectedCount())
  const buildTotal = useBuilderStore((s) => s.totalPrice())
  const requiredWatts = useBuilderStore((s) => s.totalRequiredWattage())

  if (selectedCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand/30 bg-surface/95 px-4 py-3 shadow-[0_-8px_32px_rgba(134,59,255,0.2)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand">
            <Cpu size={18} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {selectedCount} {t('buildBarParts')} · {formatPrice(buildTotal)}
            </p>
            <p className="text-xs text-text-muted">
              {t('buildBarWattage')}: {requiredWatts}W
            </p>
          </div>
        </div>
        <Link
          to="/builder"
          className="button-pop btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
        >
          <Sparkles size={16} />
          {t('buildBarOpen')}
        </Link>
      </div>
    </div>
  )
}
