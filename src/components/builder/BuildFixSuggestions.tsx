import { Wrench } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { useProductsStore } from '../../store/productsStore'
import { formatPrice } from '../../utils/compatibility'
import { getBuildFixSuggestions } from '../../utils/buildFixSuggestions'
import { incompatReasonTranslationKey } from '../../utils/incompatReason'

export function BuildFixSuggestions() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const selectPart = useBuilderStore((s) => s.selectPart)
  const products = useProductsStore((s) => s.products)

  const suggestions = useMemo(() => getBuildFixSuggestions(build, products), [build, products])
  if (suggestions.length === 0) return null

  return (
    <div className="rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 p-4">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan">
        <Wrench size={16} />
        {t('fixMyBuild')}
      </p>
      <ul className="space-y-2">
        {suggestions.map((s) => (
          <li key={`${s.slot}-${s.product.id}`} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="min-w-0">
              <p className="text-xs text-text-muted">{t(incompatReasonTranslationKey(s.reasonKey))}</p>
              <p className="font-medium text-white">{s.label}</p>
              <p className="text-xs text-brand-cyan">{formatPrice(s.product.price)}</p>
            </div>
            <button
              type="button"
              className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
              onClick={() => selectPart(s.slot, s.product)}
            >
              {t('applyFix')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
