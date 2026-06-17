import { GitCompare, Search } from 'lucide-react'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { MobileFilterDrawer } from '../components/store/MobileFilterDrawer'
import { ProductFilters } from '../components/store/ProductFilters'
import { PrebuiltCarousel } from '../components/store/PrebuiltCarousel'
import { RecentlyViewedStrip } from '../components/store/RecentlyViewedStrip'
import { StartBuildCTA } from '../components/store/StartBuildCTA'
import { UseCaseFilter } from '../components/store/UseCaseFilter'
import { useCompareStore, MAX_COMPARE_ITEMS } from '../store/compareStore'
import { trackEvent } from '../store/analyticsStore'

import { useBuilderStore } from '../store/builderStore'

import { useProductsStore } from '../store/productsStore'

import type { Category, ShopDepartment } from '../types'

import { CategoryFilter } from '../components/ui/CategoryFilter'
import { ProductCard } from '../components/ui/ProductCard'

import { useI18n } from '../i18n'

import { countProductsForFilterValue } from '../utils/filterCounts'
import { isStorefrontProduct } from '../utils/productCsv'
import { filterProductsByDepartment, isShopDepartment } from '../utils/shopDepartments'
import { getStoreCategoryFilterOptions, isBuilderCategory } from '../utils/adminDepartmentSpecs'

import {

  applyFiltersToSearchParams,

  collectFilterOptions,
  defaultStoreFilters,
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
import { getBuilderSlotForCategory } from '../utils/builderSlots'



const storeSortOptions: SortOption[] = [
  'recommended',
  'in-stock',
  'price-asc',
  'price-desc',
  'newest',
  'name-asc',
]

const emptyBuild = {}

function parseCategoryFromParams(
  params: URLSearchParams,
  options: Array<Category | 'All'>,
): Category | 'All' {
  const fromQuery = params.get('category')
  if (!fromQuery) return 'All'
  return options.includes(fromQuery as Category | 'All') ? (fromQuery as Category | 'All') : 'All'
}

export function StorePage() {

  const { t } = useI18n()

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const allProducts = useProductsStore((state) => state.products)
  const products = useMemo(() => allProducts.filter(isStorefrontProduct), [allProducts])

  const department = useMemo((): ShopDepartment | null => {
    const value = searchParams.get('department')
    return isShopDepartment(value) ? value : null
  }, [searchParams])

  const catalogProducts = useMemo(
    () => filterProductsByDepartment(products, department),
    [products, department],
  )

  const categoryFilterOptions = useMemo(
    () => getStoreCategoryFilterOptions(department),
    [department],
  )

  const selectPart = useBuilderStore((state) => state.selectPart)
  const setCompareIds = useCompareStore((s) => s.setIds)

  const category = useMemo(
    () => parseCategoryFromParams(searchParams, categoryFilterOptions),
    [searchParams, categoryFilterOptions],
  )

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

    return fromQuery && storeSortOptions.includes(fromQuery) ? fromQuery : 'recommended'

  })

  const [filters, setFilters] = useState<StoreFiltersState>(() => parseFiltersFromSearchParams(searchParams))

  const startPrebuilt = useCallback(() => {
    setSearch('')
    setSortBy('recommended')
    setFilters(defaultStoreFilters())
    navigate({ pathname: '/products', search: '?category=Prebuilt+PC', hash: 'store-catalog' })
  }, [navigate])

  useEffect(() => {
    if (location.hash !== '#store-catalog') return
    const timer = window.setTimeout(() => {
      document.getElementById('store-catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [location.hash, category])

  const prebuiltProducts = useMemo(

    () => catalogProducts.filter((product) => product.category === 'Prebuilt PC'),

    [catalogProducts],

  )

  const filterOptions = useMemo(() => collectFilterOptions(catalogProducts), [catalogProducts])

  const getFilterCount = useCallback(
    (apply: (base: StoreFiltersState) => StoreFiltersState) =>
      countProductsForFilterValue(catalogProducts, category, search, filters, emptyBuild, apply),
    [catalogProducts, category, search, filters],
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
    const matchingProducts = catalogProducts.filter((product) => {
      const byCategory = category === 'All' || product.category === category
      const bySearch = productMatchesSearchQuery(product, search)
      if (!byCategory || !bySearch) return false
      return matchesStoreFilters(product, filters, emptyBuild)
    })
    return sortProducts(matchingProducts, sortBy, emptyBuild)
  }, [catalogProducts, category, search, sortBy, filters])

  const relaxedCount = useMemo(() => {
    if (filtered.length > 0) return null
    const withoutStock = { ...filters, inStockOnly: false }
    const count = catalogProducts.filter((product) => {
      const byCategory = category === 'All' || product.category === category
      const bySearch = productMatchesSearchQuery(product, search)
      return byCategory && bySearch && matchesStoreFilters(product, withoutStock, emptyBuild)
    }).length
    return count > 0 ? count : null
  }, [filtered.length, catalogProducts, category, search, filters])



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

      <section className="hero-panel section-enter mb-6 rounded-2xl p-6 sm:p-8">
        <div className="relative z-[1]">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-cyan">{t('navProducts')}</p>
          <h1 className="text-gradient-brand font-display text-3xl font-bold sm:text-4xl">{t('productsPageTitle')}</h1>
          <p className="mt-2 max-w-xl text-base text-text-muted">
            {department === 'prebuilt' && t('deptPrebuiltDesc')}
            {department === 'pc-parts' && t('deptPcPartsDesc')}
            {department === 'monitors' && t('deptMonitorsDesc')}
            {department === 'laptops' && t('deptLaptopsDesc')}
            {department === 'accessories' && t('deptAccessoriesDesc')}
            {!department && t('productsPageDesc')}
          </p>
        </div>
      </section>

      <div className="relative z-10">
        <StartBuildCTA onStartPrebuilt={startPrebuilt} />
      </div>

      <div dir="ltr" className="section-enter stagger-1 flex flex-col gap-5 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">

        <aside className="glass-card h-fit rounded-2xl p-4 lg:sticky lg:top-24 lg:self-start">

          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">{t('category')}</p>

          <CategoryFilter
            value={category}
            onChange={setCategoryFilter}
            categories={categoryFilterOptions}
            responsive
          />

          <ProductFilters

            category={category}

            filters={filters}

            options={filterOptions}

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
                const showAddToBuilder =
                  product.category === 'Prebuilt PC' || isBuilderCategory(product.category)

                return (
                  <div key={product.id} style={{ animationDelay: `${index * 45}ms` }}>

                    <ProductCard

                      product={product}

                      showCompatibilityBadge={false}

                      showCompare

                      disabled={!isProductPurchasable(product, true)}

                      actionLabel={product.category === 'Prebuilt PC' ? 'Prebuilt System' : undefined}

                      onAction={
                        showAddToBuilder
                          ? () => {
                              const slot = getBuilderSlotForCategory(product.category)
                              if (slot) selectPart(slot, product)
                            }
                          : undefined
                      }

                    />

                  </div>
                )
              })}

            </div>

          )}

        </section>

      </div>

    </div>

  )

}


