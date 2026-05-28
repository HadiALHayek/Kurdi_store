import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useProductsStore } from '../../store/productsStore'
import { getRecentlyViewedIds } from '../../utils/recentlyViewed'
import { formatPrice } from '../../utils/compatibility'

export function RecentlyViewedStrip() {
  const { t } = useI18n()
  const products = useProductsStore((s) => s.products)
  const ids = getRecentlyViewedIds()

  const items = useMemo(
    () => ids.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [ids, products],
  )

  if (items.length === 0) return null

  return (
    <section className="mb-6">
      <h2 className="mb-3 font-display text-lg font-semibold text-white">{t('recentlyViewed')}</h2>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((product) => (
          <Link
            key={product!.id}
            to={`/product/${product!.id}`}
            className="glass-card flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 transition hover:border-brand/40"
          >
            <img src={product!.imageUrl} alt={product!.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            <div className="p-2">
              <p className="line-clamp-2 text-xs font-medium text-white">{product!.name}</p>
              <p className="mt-1 text-sm font-bold text-brand-cyan">{formatPrice(product!.price)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
