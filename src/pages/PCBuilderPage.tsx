import { AlertTriangle, CheckCircle2, Cpu, GitCompare, RotateCcw, Search, X, Zap } from 'lucide-react'

import { useEffect, useMemo, useState } from 'react'

import { Modal } from '../components/ui/Modal'

import { ProductCard } from '../components/ui/ProductCard'

import { BuildActions } from '../components/builder/BuildActions'

import { BuildFixSuggestions } from '../components/builder/BuildFixSuggestions'

import { BuildHealthScore } from '../components/builder/BuildHealthScore'

import { ConflictPanel } from '../components/builder/ConflictPanel'

import { SavedBuildsPanel } from '../components/builder/SavedBuildsPanel'

import { SlotRecommendations } from '../components/builder/SlotRecommendations'

import { WattageBreakdown } from '../components/builder/WattageBreakdown'

import { useBuildTemplatesStore } from '../store/buildTemplatesStore'

import { getSlotRecommendations } from '../utils/slotRecommendations'

import { getIncompatibilityReason } from '../data/compatibilityRules'

import { budgetPresets } from '../data/budgetPresets'

import { getNumericSpecMax } from '../utils/productSpecs'

import { isStorefrontProduct } from '../utils/productCsv'

import { usePageMeta } from '../hooks/usePageMeta'

import { useI18n } from '../i18n'

import { trackEvent } from '../store/analyticsStore'

import { useCompareStore } from '../store/compareStore'

import { useBuilderStore } from '../store/builderStore'

import { useProductsStore } from '../store/productsStore'

import { formatPrice } from '../utils/compatibility'

import { getProductCompatState } from '../utils/productFilters'

import { productMatchesSearchQuery } from '../utils/productSearch'

import { inferBuildUseCaseSummary } from '../utils/useCaseTags'

import { BuilderQuiz, BuilderQuizTrigger } from '../components/builder/BuilderQuiz'

import {
  getProductsForBuilderSlot,
  getSelectedBuildEntries,
  getSlotLabelKey,
  isPcPartBuilderSlot,
} from '../utils/builderSlots'

export function PCBuilderPage() {

  const { t } = useI18n()

  const allProducts = useProductsStore((state) => state.products)

  const products = useMemo(() => allProducts.filter(isStorefrontProduct), [allProducts])

  const {

    build,

    slotsOrder,

    activeCategory,

    setActiveCategory,

    selectPart,

    totalPrice,

    totalRequiredWattage,

    hasSelection,

    showAllParts,

    setShowAllParts,

    partHistory,

    restoreFromHistory,

    applyPreset,

    applyTemplate,

    removePart,

    resetBuild,

  } = useBuilderStore()

  const adminTemplates = useBuildTemplatesStore((s) => s.templates)

  const [openSummary, setOpenSummary] = useState(false)

  const [openQuiz, setOpenQuiz] = useState(false)

  const [slotSearch, setSlotSearch] = useState('')

  const setCompareIds = useCompareStore((s) => s.setIds)



  usePageMeta({ title: `${t('pcBuilder')} | Kurdi Store`, description: t('guidedFlow') })



  useEffect(() => {

    trackEvent('builder_slot_view', { slot: activeCategory })

  }, [activeCategory])



  const isPcSlot = isPcPartBuilderSlot(activeCategory)



  const categoryProducts = useMemo(

    () => getProductsForBuilderSlot(activeCategory, products),

    [products, activeCategory],

  )



  const activeProducts = useMemo(() => {

    const base =

      isPcSlot && !showAllParts

        ? categoryProducts.filter((product) => !getIncompatibilityReason(product, build))

        : categoryProducts

    const q = slotSearch.trim().toLowerCase()

    if (!q) return base

    return base.filter((p) => productMatchesSearchQuery(p, q))

  }, [categoryProducts, build, showAllParts, slotSearch, isPcSlot])



  const useCaseHint = inferBuildUseCaseSummary(build)

  const selectedEntries = useMemo(() => getSelectedBuildEntries(build), [build])



  const psuWattage = getNumericSpecMax(build.PSU?.specs ?? {}, 'wattage')

  const requiredWattage = totalRequiredWattage()

  const coverage = requiredWattage === 0 ? 0 : Math.min(100, Math.round((psuWattage / requiredWattage) * 100))

  const recentForSlot = partHistory[activeCategory] ?? []

  const slotRecs = useMemo(

    () => getSlotRecommendations(activeCategory, products, build),

    [activeCategory, products, build],

  )



  return (

    <div className="page-enter mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 pb-28 sm:py-8 lg:grid lg:grid-cols-[minmax(0,360px)_1fr] lg:px-8">

      <aside className="glass-card space-y-4 rounded-2xl p-5 lg:sticky lg:top-24 lg:h-fit lg:shadow-glow">

        <div className="flex items-center gap-4 border-b border-border pb-4">

          <img src="/kurdi-logo.png" alt="Kurdi Store logo" className="logo-glow h-11 w-auto" />

          <div className="min-w-0">

            <p className="font-display text-xl font-bold text-white">{t('pcBuilder')}</p>

            <p className="text-sm text-text-muted">{t('guidedFlow')}</p>

          </div>

        </div>



        <BuilderQuizTrigger onOpen={() => setOpenQuiz(true)} />



        {(budgetPresets.length > 0 || adminTemplates.length > 0) && (

        <div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">{t('budgetPresets')}</p>

          <div className="space-y-2">

            {budgetPresets.map((preset) => (

              <button

                key={preset.id}

                type="button"

                onClick={() => applyPreset(preset.id, products)}

                className="w-full rounded-xl border border-border bg-surface-2/60 p-3 text-left transition hover:border-brand/40 hover:bg-surface-2"

              >

                <p className="font-semibold text-white">{t(preset.nameKey)}</p>

                <p className="mt-0.5 text-xs text-text-muted">{t(preset.descriptionKey)}</p>

              </button>

            ))}

            {adminTemplates.map((tpl) => (

              <button

                key={tpl.id}

                type="button"

                onClick={() => applyTemplate(tpl.id, products)}

                className="w-full rounded-xl border border-brand-cyan/25 bg-brand-cyan/5 p-3 text-left transition hover:border-brand-cyan/40"

              >

                <p className="font-semibold text-white">{tpl.name}</p>

                {tpl.description && <p className="mt-0.5 text-xs text-text-muted">{tpl.description}</p>}

              </button>

            ))}

          </div>

        </div>

        )}



        <div className="space-y-2">

          {slotsOrder.map((slot) => {

            const selected = build[slot]

            const isActive = activeCategory === slot

            return (

              <div key={slot} className="flex items-stretch gap-2">

                <button

                  type="button"

                  onClick={() => setActiveCategory(slot)}

                  className={`min-w-0 flex-1 rounded-xl border p-3.5 text-left transition duration-200 hover:-translate-y-0.5 ${

                    isActive

                      ? 'border-brand bg-gradient-brand-soft shadow-glow animate-pulseGlow'

                      : 'border-border bg-surface-2/60 hover:border-brand-cyan/40'

                  }`}

                >

                  <div className="flex items-center justify-between gap-2">

                    <p className="font-semibold text-white">

                      {getSlotLabelKey(slot) ? t(getSlotLabelKey(slot)!) : slot}

                    </p>

                  </div>

                  <p className="mt-1 truncate text-sm text-text-muted">

                    {selected ? selected.name : t('selectPart')}

                  </p>

                </button>

                {selected && (

                  <button

                    type="button"

                    onClick={() => removePart(slot)}

                    className="btn-ghost shrink-0 rounded-xl border border-border px-3 text-text-muted hover:border-danger/40 hover:text-danger"

                    title={t('clearSlot')}

                    aria-label={t('clearSlot')}

                  >

                    <X size={16} />

                  </button>

                )}

              </div>

            )

          })}

          {hasSelection() && (

            <button

              type="button"

              onClick={() => resetBuild()}

              className="btn-ghost inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-text-muted hover:border-danger/40 hover:text-danger"

            >

              <RotateCcw size={16} />

              {t('resetBuild')}

            </button>

          )}

        </div>



        <div className="rounded-xl border border-border bg-surface-2/60 p-4">

          <div className="mb-2 flex items-center justify-between text-sm">

            <span className="inline-flex items-center gap-1.5 font-medium text-text">

              <Zap size={16} className="text-brand-cyan" />

              {t('psuCoverage')}

            </span>

            <span className="font-semibold text-brand-light">{coverage}%</span>

          </div>

          <div className="h-2.5 overflow-hidden rounded-full bg-black/50">

            <div

              className="h-full rounded-full bg-gradient-to-r from-brand via-brand-cyan to-brand-magenta bg-[length:200%_100%] transition-all duration-500 animate-gradient-flow"

              style={{ width: `${coverage}%` }}

            />

          </div>

          <p className="mt-2 text-xs text-text-muted">

            {t('required')}: {requiredWattage}W · PSU: {psuWattage}W

          </p>

        </div>



        <WattageBreakdown />



        <div className="flex items-center justify-between rounded-xl border border-brand/30 bg-gradient-brand-soft p-4">

          <span className="font-medium text-text">{t('total')}</span>

          <span className="text-gradient-brand font-display text-2xl font-bold">{formatPrice(totalPrice())}</span>

        </div>



        {useCaseHint && (

          <p className="text-center text-xs text-brand-cyan">

            {t('buildUseCaseSummary')} {t(`useCase_${useCaseHint}` as 'useCase_gaming')}

          </p>

        )}



        <BuildHealthScore />

        <BuildFixSuggestions />

        <SavedBuildsPanel />

        <BuildActions />



        {hasSelection() && (

          <button

            type="button"

            className="button-pop btn-primary w-full rounded-xl px-4 py-3 font-semibold"

            onClick={() => setOpenSummary(true)}

          >

            {t('completeBuild')}

          </button>

        )}

      </aside>



      <section className="section-enter min-w-0">

        <ConflictPanel />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">

          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface/50 px-4 py-3">

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand shadow-glow">

              <Cpu size={20} />

            </span>

            <h2 className="truncate font-display text-2xl font-bold text-white">

              {t('choose')} {getSlotLabelKey(activeCategory) ? t(getSlotLabelKey(activeCategory)!) : activeCategory}

            </h2>

          </div>

          {isPcSlot && (

            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-muted">

              <input

                type="checkbox"

                checked={showAllParts}

                onChange={(e) => setShowAllParts(e.target.checked)}

                className="accent-brand"

              />

              {showAllParts ? t('showAllParts') : t('compatibleOnly')}

            </label>

          )}

        </div>



        <div className="mb-4 flex flex-col gap-2 sm:flex-row">

          <div className="input-field flex flex-1 items-center gap-2 rounded-xl px-3 py-2">

            <Search size={16} className="text-brand" />

            <input

              value={slotSearch}

              onChange={(e) => setSlotSearch(e.target.value)}

              placeholder={t('searchProductsHint')}

              className="w-full bg-transparent text-sm outline-none"

            />

          </div>

          {activeProducts.length >= 2 && (

            <button

              type="button"

              className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold"

              onClick={() => setCompareIds(activeProducts.slice(0, 3).map((p) => p.id))}

            >

              <GitCompare size={16} />

              {t('compareFromBuilder')}

            </button>

          )}

        </div>



        <SlotRecommendations

          slot={activeCategory}

          recommendations={slotRecs}

          onSelect={(product) => selectPart(activeCategory, product)}

        />



        {recentForSlot.length > 0 && (

          <div className="mb-4 rounded-xl border border-border bg-surface-2/50 p-3">

            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{t('recentParts')}</p>

            <div className="flex flex-wrap gap-2">

              {recentForSlot.map((part) => (

                <button

                  key={part.id}

                  type="button"

                  onClick={() => restoreFromHistory(activeCategory, part)}

                  className="chip max-w-[200px] truncate px-3 py-1 text-xs"

                >

                  {part.name}

                </button>

              ))}

            </div>

          </div>

        )}



        {activeProducts.length === 0 ? (

          <div className="glass-card rounded-2xl p-10 text-center">

            <p className="font-display text-lg text-white">{t('noCompatibleOptions')}</p>

            <p className="mt-2 text-sm text-text-muted">{t('guidedFlow')}</p>

            {isPcSlot && !showAllParts && (

              <button

                type="button"

                className="btn-primary mt-4 rounded-lg px-4 py-2 text-sm font-semibold"

                onClick={() => setShowAllParts(true)}

              >

                {t('showAllParts')}

              </button>

            )}

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 xl:grid-cols-3">

            {activeProducts.map((product, index) => {

              const compat = isPcSlot ? getProductCompatState(product, build) : { compatible: true, reasonKey: undefined }

              return (

                <div key={product.id} style={{ animationDelay: `${index * 50}ms` }}>

                  <ProductCard

                    product={product}

                    compatible={compat.compatible}

                    incompatibilityReason={compat.reasonKey}

                    showCompatibilityBadge={isPcSlot && showAllParts}

                    actionLabel={t('selectPart')}

                    onAction={() => selectPart(activeCategory, product)}

                  />

                </div>

              )

            })}

          </div>

        )}

      </section>



      <BuilderQuiz open={openQuiz} onClose={() => setOpenQuiz(false)} />



      <Modal open={openSummary} onClose={() => setOpenSummary(false)} title={t('buildSummary')}>

        <ul className="space-y-2">

          {selectedEntries.map(({ slot, product }) => (

            <li

              key={slot}

              className="flex items-center justify-between rounded-lg border border-border bg-surface-2/80 px-3 py-2.5"

            >

              <span className="font-medium text-white">
                {getSlotLabelKey(slot) ? t(getSlotLabelKey(slot)!) : slot}
              </span>

              <span className="max-w-[60%] truncate text-sm text-text-muted">{product.name}</span>

            </li>

          ))}

        </ul>

        <div className="mt-5 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-4">

          <span className="inline-flex items-center gap-2 font-medium text-success">

            <CheckCircle2 size={18} />

            {t('compatibleBuild')}

          </span>

          <span className="text-gradient-brand font-display text-2xl font-bold">{formatPrice(totalPrice())}</span>

        </div>

        {psuWattage < requiredWattage && requiredWattage > 0 && (

          <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">

            <AlertTriangle size={16} />

            {t('psuLow')}

          </p>

        )}

        <div className="mt-5">

          <BuildActions />

        </div>

      </Modal>

    </div>

  )

}


