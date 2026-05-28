import { Package } from 'lucide-react'
import type { Product, ProductBundle } from '../../types'
import { useI18n } from '../../i18n'
import { formatPrice } from '../../utils/compatibility'

interface ProductBundlesProps {
  bundles: ProductBundle[]
  products: Product[]
  onAddBundle: (items: Product[]) => void
}

export function ProductBundles({ bundles, products, onAddBundle }: ProductBundlesProps) {
  const { t } = useI18n()

  if (bundles.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="mb-3 font-display text-lg font-semibold text-white">{t('productBundles')}</h2>
      <div className="space-y-3">
        {bundles.map((bundle) => {
          const items = bundle.productIds
            .map((id) => products.find((p) => p.id === id))
            .filter((p): p is Product => Boolean(p))
          const total = items.reduce((sum, p) => sum + p.price, 0)

          return (
            <div key={bundle.id} className="rounded-xl border border-brand/30 bg-surface-2/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-2 font-semibold text-white">
                  <Package size={18} className="text-brand-cyan" />
                  {bundle.name}
                </p>
                {bundle.discountLabel && (
                  <span className="rounded-full bg-brand/25 px-2 py-0.5 text-xs font-semibold text-brand-light">
                    {bundle.discountLabel}
                  </span>
                )}
              </div>
              <ul className="mb-3 space-y-1 text-sm text-text-muted">
                {items.map((p) => (
                  <li key={p.id}>
                    {p.name} — {formatPrice(p.price)}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-brand-cyan">{formatPrice(total)}</span>
                <button
                  type="button"
                  className="btn-primary rounded-lg px-3 py-1.5 text-sm font-semibold"
                  disabled={items.length === 0}
                  onClick={() => onAddBundle(items)}
                >
                  {t('addBundleToBuilder')}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
