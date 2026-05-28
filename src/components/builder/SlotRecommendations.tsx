import type { Category, Product } from '../../types'
import { useI18n } from '../../i18n'
import { formatPrice } from '../../utils/compatibility'

interface SlotRecommendationsProps {
  category: Category
  recommendations: Product[]
  onSelect: (product: Product) => void
}

export function SlotRecommendations({ category, recommendations, onSelect }: SlotRecommendationsProps) {
  const { t } = useI18n()

  if (recommendations.length === 0) return null

  return (
    <div className="mb-4 rounded-xl border border-brand-cyan/25 bg-brand-cyan/5 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
        {t('slotRecommendations')} — {category}
      </p>
      <div className="flex flex-wrap gap-2">
        {recommendations.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => onSelect(product)}
            className="chip max-w-[220px] truncate px-3 py-2 text-left text-xs"
          >
            <span className="block truncate font-semibold text-white">{product.name}</span>
            <span className="text-brand-cyan">{formatPrice(product.price)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
