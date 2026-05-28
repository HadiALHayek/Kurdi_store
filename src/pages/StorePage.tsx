import { AtSign, GitCompare, MapPin, Phone, Search } from 'lucide-react'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { MobileFilterDrawer } from '../components/store/MobileFilterDrawer'
import { PickupInfoBar } from '../components/store/PickupInfoBar'
import { ProductFilters } from '../components/store/ProductFilters'
import { PrebuiltCarousel } from '../components/store/PrebuiltCarousel'
import { RecentlyViewedStrip } from '../components/store/RecentlyViewedStrip'
import { StartBuildCTA } from '../components/store/StartBuildCTA'
import { UseCaseFilter } from '../components/store/UseCaseFilter'
import { useCompareStore, MAX_COMPARE_ITEMS } from '../store/compareStore'
import { trackEvent } from '../store/analyticsStore'

import { useBuilderStore } from '../store/builderStore'

import { useProductsStore } from '../store/productsStore'

import { hasInstagramInfo, hasStoreLocationInfo, useSettingsStore } from '../store/settingsStore'

import type { Category } from '../types'

import { CategoryFilter } from '../components/ui/CategoryFilter'

import { InstagramFeed } from '../components/ui/InstagramFeed'

import { ProductCard } from '../components/ui/ProductCard'

import { useI18n } from '../i18n'

import { countProductsForFilterValue } from '../utils/filterCounts'
import { normalizeGoogleMapsEmbedUrl, toGoogleMapsOpenUrl } from '../utils/maps'

import {

  applyFiltersToSearchParams,

  collectFilterOptions,
  defaultStoreFilters,
  getProductCompatState,

  hasActiveStoreFilters,

  matchesStoreFilters,

  parseFiltersFromSearchParams,

  sortProducts,

  type SortOption,

  type StoreFiltersState,

} from '../utils/productFilters'
import { describeActiveFilters } from '../utils/zeroResultsHints'
import { productMatchesSearchQuery } from '../utils/productSearch'
import { isProductPurchasable } from '../utils/stockStatus'



const categoryOptions: Array<Category | 'All'> = [

  'All',

  'Prebuilt PC',

  'CPU',

  'Motherboard',

  'RAM',

  'GPU',

  'Storage',

  'PSU',

  'Case',

  'Cooling',

]

const sortOptions: SortOption[] = [
  'recommended',
  'compatible-first',
  'in-stock',
  'price-asc',
  'price-desc',
  'newest',
  'name-asc',
]

function parseCategoryFromParams(params: URLSearchParams): Category | 'All' {
  const fromQuery = params.get('category')
  if (!fromQuery) return 'All'
  return categoryOptions.includes(fromQuery as Category | 'All') ? (fromQuery as Category | 'All') : 'All'
}

export function StorePage() {

  const { t } = useI18n()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const products = useProductsStore((state) => state.products)

  const settings = useSettingsStore((state) => state.settings)

  const build = useBuilderStore((state) => state.build)

  const selectPart = useBuilderStore((state) => state.selectPart)
  const setCompareIds = useCompareStore((s) => s.setIds)

  const category = useMemo(() => parseCategoryFromParams(searchParams), [searchParams])

  const setCategoryFilter = useCallback(
    (value: Category | 'All') => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value === 'All') next.delete('category')
          else next.set('category', value)
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')

  const [sortBy, setSortBy] = useState<SortOption>(() => {

    const fromQuery = searchParams.get('sort') as SortOption | null

    return fromQuery && sortOptions.includes(fromQuery) ? fromQuery : 'recommended'

  })

  const [filters, setFilters] = useState<StoreFiltersState>(() => parseFiltersFromSearchParams(searchParams))

  const startPrebuilt = useCallback(() => {
    setSearch('')
    setSortBy('recommended')
    setFilters(defaultStoreFilters())
    navigate({ pathname: '/', search: '?category=Prebuilt+PC', hash: 'store-catalog' })
  }, [navigate])

  useEffect(() => {
    if (location.hash !== '#store-catalog') return
    const timer = window.setTimeout(() => {
      document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [location.hash, category])

  const prebuiltProducts = useMemo(

    () => products.filter((product) => product.category === 'Prebuilt PC'),

    [products],

  )

  const filterOptions = useMemo(() => collectFilterOptions(products), [products])

  const hasBuildParts = Object.keys(build).length > 0

  const getFilterCount = useCallback(
    (apply: (base: StoreFiltersState) => StoreFiltersState) =>
      countProductsForFilterValue(products, category, search, filters, build, apply),
    [products, category, search, filters, build],
  )

  const mapEmbedUrl = useMemo(

    () => normalizeGoogleMapsEmbedUrl(settings.googleMapsEmbedUrl, settings.address),

    [settings.googleMapsEmbedUrl, settings.address],

  )

  const mapOpenUrl = useMemo(

    () => toGoogleMapsOpenUrl(settings.googleMapsEmbedUrl, settings.address),

    [settings.googleMapsEmbedUrl, settings.address],

  )



  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const trimmedSearch = search.trim()
    if (trimmedSearch) next.set('search', trimmedSearch)
    else next.delete('search')
    if (sortBy === 'recommended') next.delete('sort')
    else next.set('sort', sortBy)
    const merged = applyFiltersToSearchParams(next, filters)
    if (merged.toString() !== searchParams.toString()) {
      setSearchParams(merged, { replace: true })
    }
  }, [search, sortBy, filters, searchParams, setSearchParams])



  const filtered = useMemo(() => {

    const matchingProducts = products.filter((product) => {

      const byCategory = category === 'All' || product.category === category

      const bySearch = productMatchesSearchQuery(product, search)

      if (!byCategory || !bySearch) return false

      return matchesStoreFilters(product, filters, build)

    })

    return sortProducts(matchingProducts, sortBy, build)

  }, [products, category, search, sortBy, filters, build])

  const relaxedCount = useMemo(() => {

    if (filtered.length > 0) return null

    const withoutStock = { ...filters, inStockOnly: false }

    const count = products.filter((product) => {

      const byCategory = category === 'All' || product.category === category

      const bySearch = productMatchesSearchQuery(product, search)

      return byCategory && bySearch && matchesStoreFilters(product, withoutStock, build)

    }).length

    return count > 0 ? count : null

  }, [filtered.length, products, category, search, filters, build])



  const hasSearch = search.trim().length > 0

  const hasCategory = category !== 'All'

  const hasTechFilters = hasActiveStoreFilters(filters)



  const resetFilters = () => {
    setCategoryFilter('All')
    setSearch('')
    setSortBy('recommended')
    setFilters(defaultStoreFilters())
  }



  return (

    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-4 pb-28 sm:py-6 md:px-8">

      <section className="hero-panel section-enter mb-6 rounded-2xl p-6 sm:p-8 md:p-10">

        <div className="relative z-[1] flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">

          <img src="/kurdi-logo.png" alt="Kurdi Store" className="logo-glow h-12 w-auto sm:h-14" />

          <div>

            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">PC Components</p>

            <h1 className="text-gradient-brand font-display text-3xl font-bold sm:text-4xl md:text-5xl">Kurdi Store</h1>

            <p className="mt-2 max-w-xl text-base text-text-muted">{t('brandTagline')}</p>

          </div>

        </div>

      </section>

      <PickupInfoBar />
      <div className="relative z-10">
        <StartBuildCTA onStartPrebuilt={startPrebuilt} />
      </div>

      <div dir="ltr" className="section-enter stagger-1 flex flex-col gap-5 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">

        <aside className="glass-card h-fit rounded-2xl p-4 lg:sticky lg:top-24 lg:self-start">

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">{t('category')}</p>

          <CategoryFilter value={category} onChange={setCategoryFilter} responsive />

          <ProductFilters

            category={category}

            filters={filters}

            options={filterOptions}

            hasBuildParts={hasBuildParts}

            onChange={(next) => {
              setFilters(next)
              trackEvent('filter_apply', { category })
            }}
            getCount={getFilterCount}
          />

          <div className="hidden lg:block">
            <UseCaseFilter
              selected={filters.useCaseTags}
              onChange={(useCaseTags) => setFilters({ ...filters, useCaseTags })}
            />
          </div>

        </aside>



        <section id="store-catalog" className="min-w-0 scroll-mt-24 lg:mx-auto lg:w-full lg:max-w-[980px]">

          <PrebuiltCarousel products={prebuiltProducts} />
          <RecentlyViewedStrip />

          <div className="mb-4 flex flex-col gap-3 sm:flex-row">

            <MobileFilterDrawer
              category={category}
              filters={filters}
              options={filterOptions}
              hasBuildParts={hasBuildParts}
              onChange={setFilters}
              getCount={getFilterCount}
            />

            <div className="input-field flex flex-1 items-center gap-2 rounded-xl px-4 py-2.5">

              <Search size={18} className="shrink-0 text-brand" />

              <input

                value={search}

                onChange={(event) => setSearch(event.target.value)}

                placeholder={t('searchProductsHint')}

                className="w-full bg-transparent outline-none"

              />

            </div>

            <label className="input-field flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-text-muted sm:w-[260px]">

              <span className="shrink-0">{t('sortBy')}</span>

              <select

                value={sortBy}

                onChange={(event) => setSortBy(event.target.value as SortOption)}

                className="w-full bg-transparent text-text outline-none"

              >

                <option value="recommended" className="bg-surface text-text">

                  {t('sortRecommended')}

                </option>

                {hasBuildParts && (
                  <option value="compatible-first" className="bg-surface text-text">
                    {t('sortCompatibleFirst')}
                  </option>
                )}

                <option value="in-stock" className="bg-surface text-text">

                  {t('sortInStock')}

                </option>

                <option value="price-asc" className="bg-surface text-text">

                  {t('sortPriceLowToHigh')}

                </option>

                <option value="price-desc" className="bg-surface text-text">

                  {t('sortPriceHighToLow')}

                </option>

                <option value="newest" className="bg-surface text-text">

                  {t('sortNewest')}

                </option>

                <option value="name-asc" className="bg-surface text-text">

                  {t('sortNameAZ')}

                </option>

              </select>

            </label>

          </div>



          <div className="mb-6 flex flex-wrap items-center gap-2">

            <span className="text-xs text-text-muted">

              {filtered.length} {t('resultsCount')}

            </span>

            {filtered.length >= 2 && (
              <button
                type="button"
                className="btn-ghost inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1 text-xs font-semibold"
                onClick={() =>
                  setCompareIds(filtered.slice(0, MAX_COMPARE_ITEMS).map((p) => p.id))
                }
              >
                <GitCompare size={14} />
                {t('compareTop3')}
              </button>
            )}

            {(hasSearch || hasCategory || hasTechFilters) && (

              <>

                <span className="ml-1 text-xs uppercase tracking-wide text-text-muted">{t('activeFilters')}:</span>

                {hasCategory && (

                  <button

                    type="button"

                    onClick={() => setCategoryFilter('All')}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    {t('category')}: {category} ×

                  </button>

                )}

                {hasSearch && (

                  <button

                    type="button"

                    onClick={() => setSearch('')}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    "{search.trim()}" ×

                  </button>

                )}

                {filters.inStockOnly && (

                  <button

                    type="button"

                    onClick={() => setFilters({ ...filters, inStockOnly: false })}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    {t('inStockOnly')} ×

                  </button>

                )}

                {filters.hideIncompatible && (

                  <button

                    type="button"

                    onClick={() => setFilters({ ...filters, hideIncompatible: false })}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    {t('hideIncompatible')} ×

                  </button>

                )}

                {filters.minPrice && (

                  <button

                    type="button"

                    onClick={() => setFilters({ ...filters, minPrice: '' })}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    min ${filters.minPrice} ×

                  </button>

                )}

                {filters.maxPrice && (

                  <button

                    type="button"

                    onClick={() => setFilters({ ...filters, maxPrice: '' })}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    max ${filters.maxPrice} ×

                  </button>

                )}

                {filters.sockets.map((s) => (

                  <button

                    key={s}

                    type="button"

                    onClick={() => setFilters({ ...filters, sockets: filters.sockets.filter((x) => x !== s) })}

                    className="chip chip-active px-3 py-1 text-xs font-medium"

                  >

                    {s} ×

                  </button>

                ))}

                <button

                  type="button"

                  onClick={resetFilters}

                  className="chip px-3 py-1 text-xs font-medium text-text-muted hover:text-text"

                >

                  {t('clearAll')}

                </button>

              </>

            )}

          </div>



          {filtered.length === 0 ? (

            <div className="glass-card grid min-h-[280px] place-content-center gap-4 rounded-2xl p-10 text-center">

              <p className="font-display text-2xl text-white">{t('noProductsFound')}</p>

              <p className="text-text-muted">{t('tryAnotherFilter')}</p>

              <p className="text-sm text-text-muted">{t('noResultsHelp')}</p>
              <p className="text-xs text-brand-light">
                {t('zeroResultsFor')}: {describeActiveFilters(category, search, filters)}
              </p>

              {relaxedCount !== null && (

                <p className="text-sm text-brand-cyan">

                  {relaxedCount} {t('resultsCount')} {t('relaxInStock').toLowerCase()}

                </p>

              )}

              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">

                {hasSearch && (

                  <button

                    type="button"

                    onClick={() => setSearch('')}

                    className="rounded-md border border-brand/40 bg-surface-2 px-3 py-1.5 text-sm font-semibold text-brand-light hover:bg-brand/10"

                  >

                    {t('relaxSearch')}

                  </button>

                )}

                {hasCategory && (

                  <button

                    type="button"

                    onClick={() => setCategoryFilter('All')}

                    className="rounded-md border border-brand/40 bg-surface-2 px-3 py-1.5 text-sm font-semibold text-brand-light hover:bg-brand/10"

                  >

                    {t('relaxCategory')}

                  </button>

                )}

                {filters.inStockOnly && (

                  <button

                    type="button"

                    onClick={() => setFilters({ ...filters, inStockOnly: false })}

                    className="rounded-md border border-brand/40 bg-surface-2 px-3 py-1.5 text-sm font-semibold text-brand-light hover:bg-brand/10"

                  >

                    {t('relaxInStock')}

                  </button>

                )}

                {filters.maxPrice && (

                  <button

                    type="button"

                    onClick={() => {

                      const bumped = Number.parseFloat(filters.maxPrice)

                      setFilters({

                        ...filters,

                        maxPrice: Number.isNaN(bumped) ? '' : String(Math.round(bumped + 50)),

                      })

                    }}

                    className="rounded-md border border-brand/40 bg-surface-2 px-3 py-1.5 text-sm font-semibold text-brand-light hover:bg-brand/10"

                  >

                    {t('relaxMaxPrice')}

                  </button>

                )}

                {filters.sockets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilters({ ...filters, sockets: [] })}
                    className="rounded-md border border-brand/40 bg-surface-2 px-3 py-1.5 text-sm font-semibold text-brand-light hover:bg-brand/10"
                  >
                    {t('relaxSockets')}
                  </button>
                )}

                <button

                  type="button"

                  onClick={resetFilters}

                  className="rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm font-semibold text-text hover:border-brand"

                >

                  {t('relaxAll')}

                </button>

              </div>

            </div>

          ) : (

            <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">

              {filtered.map((product, index) => {

                const compat = getProductCompatState(product, build)

                return (

                  <div key={product.id} style={{ animationDelay: `${index * 45}ms` }}>

                    <ProductCard

                      product={product}

                      compatible={compat.compatible}

                      incompatibilityReason={compat.reasonKey}

                      showCompatibilityBadge={hasBuildParts && product.category !== 'Prebuilt PC'}

                      blockIncompatibleAdd={hasBuildParts}

                      showCompare

                      disabled={!isProductPurchasable(product, compat.compatible)}

                      actionLabel={product.category === 'Prebuilt PC' ? 'Prebuilt System' : undefined}

                      onAction={() => selectPart(product.category, product)}

                    />

                  </div>

                )

              })}

            </div>

          )}

        </section>

      </div>



      {(hasInstagramInfo(settings) || hasStoreLocationInfo(settings)) && (
        <section
          className={`section-enter stagger-2 mt-10 grid gap-6 ${
            hasInstagramInfo(settings) && hasStoreLocationInfo(settings) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
          }`}
        >
          {hasInstagramInfo(settings) && (
            <article className="glass-card rounded-2xl p-6 shadow-glow">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand shadow-glow">
                  <AtSign size={20} />
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{t('instagramFeed')}</h3>
              </div>
              <InstagramFeed handle={settings.instagramHandle} profileUrl={settings.instagramUrl} />
            </article>
          )}

          {hasStoreLocationInfo(settings) && (
            <article className="glass-card rounded-2xl p-6 shadow-glow">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand-cyan shadow-glow-cyan">
                  <MapPin size={20} />
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{t('storeLocation')}</h3>
              </div>

              {mapEmbedUrl ? (
                <div className="space-y-3">
                  <iframe
                    title={t('storeLocation')}
                    src={mapEmbedUrl}
                    className="h-[220px] w-full rounded-lg border border-brand/40 sm:h-[300px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  {mapOpenUrl && (
                    <a
                      href={mapOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-pop btn-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                    >
                      <MapPin size={16} />
                      {t('openInGoogleMaps')}
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid min-h-[120px] place-content-center rounded-lg border border-brand/30 bg-surface-2/70 p-4 text-center">
                  <p className="text-sm text-text-muted">{t('mapPlaceholder')}</p>
                  {settings.address.trim() && mapOpenUrl && (
                    <a
                      href={mapOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                    >
                      <MapPin size={14} />
                      {t('openInGoogleMaps')}
                    </a>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-text-muted">
                {settings.address.trim() && <p className="text-white">{settings.address}</p>}
                {settings.workingHours.trim() && <p>{settings.workingHours}</p>}
                {settings.phone.trim() && (
                  <p className="inline-flex items-center gap-2">
                    <Phone size={14} />
                    {settings.phone}
                  </p>
                )}
              </div>
            </article>
          )}
        </section>
      )}

    </div>

  )

}


