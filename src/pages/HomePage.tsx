import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { CategoryDepartmentGrid } from '../components/home/CategoryDepartmentGrid'
import { RandomProductsStrip } from '../components/home/RandomProductsStrip'
import { StoreSocialSection } from '../components/home/StoreSocialSection'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'
import { useProductsStore } from '../store/productsStore'
import { isStorefrontProduct } from '../utils/productCsv'
import { useMemo } from 'react'

export function HomePage() {
  const { t } = useI18n()
  const allProducts = useProductsStore((s) => s.products)
  const products = useMemo(() => allProducts.filter(isStorefrontProduct), [allProducts])

  usePageMeta({
    title: `Kurdi Store | ${t('navHome')}`,
    description: t('homeMetaDesc'),
    url: `${window.location.origin}/`,
  })

  return (
    <div className="page-enter mx-auto w-full max-w-7xl space-y-10 px-4 py-6 pb-28 md:px-8">
      <section className="hero-panel section-enter rounded-2xl p-6 sm:p-10 md:p-12">
        <div className="relative z-[1] flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">
              {t('homeWelcome')}
            </p>
            <h1 className="text-gradient-brand font-display text-4xl font-bold sm:text-5xl md:text-6xl">
              Kurdi Store
            </h1>
            <p className="mt-3 text-base text-text-muted sm:text-lg">{t('homeHeroDesc')}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="button-pop btn-primary inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold"
              >
                {t('browseProducts')}
              </Link>
              <Link
                to="/builder"
                className="button-pop btn-ghost inline-flex items-center gap-2 rounded-xl border border-brand-cyan/40 px-5 py-2.5 text-sm font-semibold text-brand-cyan"
              >
                <Wrench size={18} />
                {t('navBuilder')}
              </Link>
            </div>
          </div>
          <img
            src="/kurdi-logo.png"
            alt="Kurdi Store"
            className="logo-glow mx-auto h-28 w-auto lg:mx-0 lg:h-36"
          />
        </div>
      </section>

      <CategoryDepartmentGrid />
      <RandomProductsStrip products={products} />
      <StoreSocialSection />
    </div>
  )
}
