import { ProductCard } from '../ui/ProductCard'
import type { Product } from '../../types'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { trackEvent } from '../../store/analyticsStore'
import { isProductPurchasable } from '../../utils/stockStatus'
import { getProductCompatState } from '../../utils/productFilters'

interface RelatedProductsProps {
  products: Product[]
  onSelect: (product: Product) => void
}

export function RelatedProducts({ products, onSelect }: RelatedProductsProps) {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)

  if (products.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-xl font-semibold text-white">{t('pairsWellWith')}</h2>
      <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => {
          const compat = getProductCompatState(product, build)
          return (
            <ProductCard
              key={product.id}
              product={product}
              compatible={compat.compatible}
              incompatibilityReason={compat.reasonKey}
              showCompatibilityBadge={Object.keys(build).length > 0}
              disabled={!isProductPurchasable(product, compat.compatible)}
              actionLabel={t('addToBuilder')}
              onAction={() => {
                onSelect(product)
                trackEvent('add_to_builder', { from: 'related', productId: product.id })
              }}
            />
          )
        })}
      </div>
    </section>
  )
}
