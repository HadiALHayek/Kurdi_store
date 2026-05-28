import { ArrowLeft, Bell, ExternalLink, Camera, MessageCircle, PackageCheck, ShoppingCart, Sparkles, Tag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { RelatedProducts } from '../components/product/RelatedProducts'
import { ProductBundles } from '../components/product/ProductBundles'
import { CompatibilityBadge } from '../components/ui/CompatibilityBadge'
import { injectProductJsonLd, usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'
import { trackEvent } from '../store/analyticsStore'
import { useBuilderStore } from '../store/builderStore'
import { useBundlesStore } from '../store/bundlesStore'
import { useProductsStore } from '../store/productsStore'
import { useSettingsStore } from '../store/settingsStore'
import { formatPrice } from '../utils/compatibility'
import { getProductCompatState } from '../utils/productFilters'
import { pushRecentlyViewed } from '../utils/recentlyViewed'
import { getRelatedProducts, getBundlesForProduct } from '../utils/relatedProducts'
import { shouldShowStockNotify, stockNotifyWhatsAppUrl } from '../utils/stockNotify'
import { isProductPurchasable, getStockLabelKey } from '../utils/stockStatus'
import { getProductUseCaseTags } from '../utils/useCaseTags'

export function ProductDetailsPage() {
  const { t } = useI18n()
  const { productId } = useParams<{ productId: string }>()
  const products = useProductsStore((state) => state.products)
  const allBundles = useBundlesStore((s) => s.bundles)
  const settings = useSettingsStore((s) => s.settings)
  const build = useBuilderStore((state) => state.build)
  const selectPart = useBuilderStore((state) => state.selectPart)

  const product = products.find((item) => item.id === productId)
  const gallery = useMemo(() => {
    if (!product) return []
    return product.imageUrls?.length ? product.imageUrls : [product.imageUrl]
  }, [product])
  const [activeImage, setActiveImage] = useState(0)

  usePageMeta({
    title: product ? `${product.seoTitle || product.name} | Kurdi Store` : 'Kurdi Store',
    description: product?.seoDescription || product?.description,
    image: product?.imageUrl,
    url: product ? `${window.location.origin}/product/${product.id}` : undefined,
  })

  useEffect(() => {
    if (!product) return
    pushRecentlyViewed(product.id)
    return injectProductJsonLd(product)
  }, [product])

  const related = useMemo(
    () => (product ? getRelatedProducts(product, products, build) : []),
    [product, products, build],
  )

  const bundles = useMemo(
    () => (product ? getBundlesForProduct(product.id, allBundles) : []),
    [product, allBundles],
  )

  if (!product) return <Navigate to="/" replace />

  const useCaseTags = getProductUseCaseTags(product)
  const compat = getProductCompatState(product, build)
  const canAdd = isProductPurchasable(product, compat.compatible)
  const stockKey = getStockLabelKey(product, settings.lowStockThreshold)
  const showWasPrice = product.previousPrice != null && product.previousPrice > product.price
  const showStockNotify = shouldShowStockNotify(product)
  const stockNotifyUrl =
    showStockNotify && settings.phone
      ? stockNotifyWhatsAppUrl(settings.phone, product)
      : null

  const addBundle = (items: typeof products) => {
    for (const item of items) {
      if (item.category !== 'Prebuilt PC') selectPart(item.category, item)
    }
    trackEvent('add_to_builder', { from: 'bundle', count: String(items.length) })
  }

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 pb-28 sm:py-8 md:px-8">
      <nav className="section-enter mb-6 flex flex-wrap items-center gap-2 text-sm">
        <Link to="/" className="btn-ghost button-pop inline-flex items-center gap-2 rounded-lg px-3 py-2">
          <ArrowLeft size={16} />
          {t('navStore')}
        </Link>
        <span className="text-text-muted">/</span>
        <span className="chip px-3 py-1 text-xs font-medium text-text-muted">{product.category}</span>
      </nav>

      <section className="section-enter grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-card overflow-hidden rounded-2xl p-4 shadow-glow sm:p-5">
          <div className="group relative overflow-hidden rounded-xl border border-border bg-surface-2">
            <img
              src={gallery[activeImage]}
              alt={product.name}
              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute bottom-4 right-4 rounded-full border border-brand/50 bg-brand/40 px-3 py-1.5 text-xs font-semibold text-brand-light backdrop-blur-md">
              {activeImage + 1} / {gallery.length}
            </div>
          </div>
          {gallery.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`overflow-hidden rounded-lg border-2 transition duration-200 ${
                    activeImage === index
                      ? 'border-brand shadow-glow ring-2 ring-brand-cyan/40'
                      : 'border-transparent opacity-70 hover:border-brand-cyan/60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </article>

        <article className="glass-card rounded-2xl p-6 lg:sticky lg:top-24 lg:h-fit lg:shadow-glow">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="badge-glow inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <Tag size={14} />
              {product.category}
            </span>
            {product.sku && (
              <span className="chip px-2 py-0.5 font-mono text-xs text-text-muted">SKU: {product.sku}</span>
            )}
            {product.staffPick && (
              <span className="rounded-full border border-brand-cyan/40 bg-brand-cyan/15 px-3 py-1 text-xs font-semibold text-brand-cyan">
                {t('staffPick')}
              </span>
            )}
            {stockKey === 'lowStock' && (
              <span className="rounded-full border border-danger/40 bg-danger/15 px-3 py-1 text-xs font-semibold text-danger">
                {t('lowStockUrgency')}
              </span>
            )}
            {stockKey === 'backorderAvailable' && (
              <span className="rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                {t('backorderAvailable')} ({settings.backorderLeadDays} {t('days')})
              </span>
            )}
            {useCaseTags.map((tag) => (
              <span key={tag} className="chip px-2 py-0.5 text-xs capitalize">
                {t(`useCase_${tag}` as 'useCase_gaming')}
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-text-muted">
              <PackageCheck size={14} />
              {stockKey === 'inStock' && t('inStock')}
              {stockKey === 'lowStock' && t('lowStockUrgency')}
              {stockKey === 'outOfStock' && t('outOfStock')}
              {stockKey === 'backorderAvailable' && t('backorderAvailable')}
              {!stockKey && `${t('stock')}: ${product.stock}`}
            </span>
            {Object.keys(build).length > 0 && product.category !== 'Prebuilt PC' && (
              <CompatibilityBadge compatible={compat.compatible} reasonKey={compat.reasonKey} expandable={!compat.compatible} />
            )}
          </div>

          <h1 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{product.name}</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{product.description}</p>

          {product.instagramPostUrl && (
            <a
              href={product.instagramPostUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan hover:underline"
            >
              <Camera size={16} />
              {t('viewOnInstagram')}
              <ExternalLink size={14} />
            </a>
          )}

          <div className="mt-6 rounded-2xl border border-brand/30 bg-gradient-brand-soft p-5 shadow-glow">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">{t('price')}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-3">
              <p className="text-gradient-brand font-display text-4xl font-bold">{formatPrice(product.price)}</p>
              {showWasPrice && (
                <p className="text-lg text-text-muted line-through">{formatPrice(product.previousPrice!)}</p>
              )}
            </div>
          </div>

          {showStockNotify && stockNotifyUrl && (
            <a
              href={stockNotifyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('quote_request', { action: 'stock_notify', productId: product.id })}
              className="button-pop mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 px-4 py-3 text-sm font-semibold text-brand-cyan hover:bg-brand-cyan/20"
            >
              <Bell size={18} />
              {t('notifyWhenInStock')}
            </a>
          )}

          <div className="mt-5 hidden grid-cols-1 gap-3 sm:grid sm:grid-cols-2">
            {canAdd ? (
              <button
                type="button"
                onClick={() => {
                  selectPart(product.category, product)
                  trackEvent('add_to_builder', { from: 'pdp', productId: product.id })
                }}
                className="button-pop btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <ShoppingCart size={18} />
                {product.category === 'Prebuilt PC' ? 'Prebuilt System' : t('addToBuilder')}
              </button>
            ) : showStockNotify && stockNotifyUrl ? (
              <a
                href={stockNotifyUrl}
                target="_blank"
                rel="noreferrer"
                className="button-pop btn-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                onClick={() => trackEvent('quote_request', { action: 'stock_notify', productId: product.id })}
              >
                <MessageCircle size={18} />
                {t('notifyWhenInStock')}
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="button-pop btn-primary inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold opacity-50"
              >
                <ShoppingCart size={18} />
                {t('outOfStock')}
              </button>
            )}
            <Link
              to="/builder"
              className="btn-ghost button-pop inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
            >
              <Sparkles size={18} />
              {t('pcBuilder')}
            </Link>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface-2/50 p-4">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">{t('fieldSpecs')}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <li
                  key={key}
                  className="rounded-lg border border-border/80 bg-surface/80 px-3 py-2.5 transition hover:border-brand/30"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{key}</p>
                  <p className="mt-0.5 font-medium text-text">{value}</p>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </section>

      <ProductBundles bundles={bundles} products={products} onAddBundle={addBundle} />
      <RelatedProducts
        products={related}
        onSelect={(p) => {
          selectPart(p.category, p)
        }}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-brand/30 bg-surface/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{product.name}</p>
            <p className="text-lg font-bold text-brand-cyan">{formatPrice(product.price)}</p>
          </div>
          {canAdd ? (
            <button
              type="button"
              onClick={() => {
                selectPart(product.category, product)
                trackEvent('add_to_builder', { from: 'pdp_mobile', productId: product.id })
              }}
              className="button-pop btn-primary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold"
            >
              <ShoppingCart size={18} className="inline" /> {t('addToBuilder')}
            </button>
          ) : stockNotifyUrl ? (
            <a
              href={stockNotifyUrl}
              target="_blank"
              rel="noreferrer"
              className="button-pop btn-primary shrink-0 rounded-xl px-4 py-3 text-sm font-semibold"
              onClick={() => trackEvent('quote_request', { action: 'stock_notify', productId: product.id })}
            >
              <Bell size={18} className="inline" /> {t('notifyWhenInStock')}
            </a>
          ) : (
            <button type="button" disabled className="shrink-0 rounded-xl px-4 py-3 text-sm font-semibold opacity-50">
              {t('outOfStock')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
