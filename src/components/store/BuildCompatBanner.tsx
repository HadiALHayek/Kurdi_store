import { ChevronRight, Cpu, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { formatPrice } from '../../utils/compatibility'
import type { StoreFiltersState } from '../../utils/productFilters'

interface BuildCompatBannerProps {
  compatibleCount: number
  incompatibleCount: number
  filters: StoreFiltersState
  onFiltersChange: (next: StoreFiltersState) => void
}

export function BuildCompatBanner({
  compatibleCount,
  incompatibleCount,
  filters,
  onFiltersChange,
}: BuildCompatBannerProps) {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const slotsOrder = useBuilderStore((s) => s.slotsOrder)
  const buildTotal = useBuilderStore((s) => s.totalPrice())

  const selectedParts = slotsOrder
    .map((slot) => build[slot])
    .filter((part): part is Product => Boolean(part))

  if (selectedParts.length === 0) return null

  return (
    <div className="mb-4 rounded-2xl border border-brand/35 bg-gradient-brand-soft p-4 shadow-glow sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/30 text-brand-light">
              <Cpu size={16} />
            </span>
            <p className="font-display text-sm font-bold text-white sm:text-base">{t('buildCompatMode')}</p>
          </div>
          <p className="text-sm text-text-muted">
            {t('buildCompatSummary')
              .replace('{compatible}', String(compatibleCount))
              .replace('{incompatible}', String(incompatibleCount))}
            {' · '}
            {formatPrice(buildTotal)}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {selectedParts.map((part) => (
              <span
                key={part.id}
                className="max-w-[160px] truncate rounded-full border border-brand/30 bg-surface/80 px-2.5 py-1 text-xs text-brand-light"
                title={part.name}
              >
                {part.category}: {part.name}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={filters.hideIncompatible}
              onChange={(e) => onFiltersChange({ ...filters, hideIncompatible: e.target.checked })}
              className="accent-brand"
            />
            <Filter size={14} className="text-brand-cyan" />
            {t('hideIncompatible')}
          </label>
          <Link
            to="/builder"
            className="button-pop inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan hover:text-brand-light"
          >
            {t('buildBarOpen')}
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
