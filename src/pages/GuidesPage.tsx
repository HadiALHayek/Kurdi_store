import { ArrowRight, BookOpen, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildGuides } from '../data/buildGuides'
import { BUILDER_SLOTS_ORDER } from '../utils/builderSlots'
import { useI18n } from '../i18n'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBuilderStore } from '../store/builderStore'
import { useBuildTemplatesStore } from '../store/buildTemplatesStore'
import { useProductsStore } from '../store/productsStore'
import { trackEvent } from '../store/analyticsStore'
import { formatPrice } from '../utils/compatibility'
import type { BuildTemplate, Product } from '../types'

function templateBudget(template: BuildTemplate, products: Product[]): number {
  let total = 0
  for (const slot of BUILDER_SLOTS_ORDER) {
    const productId = template.parts[slot]
    if (!productId) continue
    const product = products.find((p) => p.id === productId)
    if (product) total += product.price
  }
  return total
}

function templateCoverImage(template: BuildTemplate, products: Product[]): string | null {
  for (const slot of BUILDER_SLOTS_ORDER) {
    const productId = template.parts[slot]
    if (!productId) continue
    const product = products.find((p) => p.id === productId)
    if (product?.imageUrl) return product.imageUrl
  }
  return null
}

export function GuidesPage() {
  const { t } = useI18n()
  const applyPreset = useBuilderStore((s) => s.applyPreset)
  const applyTemplate = useBuilderStore((s) => s.applyTemplate)
  const products = useProductsStore((s) => s.products)
  const templates = useBuildTemplatesStore((s) => s.templates)

  const hasContent = buildGuides.length > 0 || templates.length > 0

  usePageMeta({
    title: `${t('guidesTitle')} | Kurdi Store`,
    description: t('guidesSubtitle'),
    url: `${window.location.origin}/guides`,
  })

  return (
    <div className="page-enter mx-auto w-full max-w-7xl px-4 py-6 pb-28 md:px-8">
      <header className="section-enter mb-8">
        <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
          <BookOpen size={14} />
          {t('guidesTitle')}
        </p>
        <h1 className="text-gradient-brand font-display text-3xl font-bold sm:text-4xl">{t('guidesTitle')}</h1>
        <p className="mt-2 max-w-2xl text-text-muted">{t('guidesSubtitle')}</p>
      </header>

      {!hasContent ? (
        <div className="glass-card section-enter rounded-2xl border-dashed border-brand/25 p-10 text-center">
          <Wrench size={40} className="mx-auto text-brand/60" />
          <p className="mt-4 font-display text-lg font-semibold text-white">{t('guidesEmpty')}</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">{t('guidesEmptyHint')}</p>
          <Link
            to="/builder"
            className="button-pop btn-primary mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
          >
            {t('openBuilder')}
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {buildGuides.map((guide) => (
            <article key={guide.id} className="glass-card card-enter overflow-hidden rounded-2xl border-brand/15">
              <img src={guide.imageUrl} alt="" className="h-44 w-full object-cover" loading="lazy" />
              <div className="p-5">
                <div className="mb-2 flex flex-wrap gap-1">
                  {guide.useCaseTags.map((tag) => (
                    <span key={tag} className="chip px-2 py-0.5 text-[10px] capitalize">
                      {t(`useCase_${tag}` as 'useCase_gaming')}
                    </span>
                  ))}
                </div>
                <h2 className="font-display text-xl font-bold text-white">{t(guide.titleKey)}</h2>
                <p className="mt-2 text-sm text-text-muted">{t(guide.descKey)}</p>
                <p className="mt-3 font-semibold text-brand-cyan">
                  {t('guideBudget')}: {formatPrice(guide.budget)}
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {guide.presetId && (
                    <button
                      type="button"
                      className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold"
                      onClick={() => {
                        applyPreset(guide.presetId!, products)
                        trackEvent('guide_view', { guide: guide.id, action: 'load_preset' })
                      }}
                    >
                      {t('loadIntoBuilder')}
                    </button>
                  )}
                  <Link
                    to="/builder"
                    className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                    onClick={() => trackEvent('guide_view', { guide: guide.id })}
                  >
                    {t('openBuilder')}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </article>
          ))}

          {templates.map((template) => {
            const cover = templateCoverImage(template, products)
            const budget = templateBudget(template, products)
            return (
              <article
                key={template.id}
                className="glass-card card-enter overflow-hidden rounded-2xl border-brand/15"
              >
                {cover ? (
                  <img src={cover} alt="" className="h-44 w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-gradient-brand-soft">
                    <Wrench size={36} className="text-brand/50" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-display text-xl font-bold text-white">{template.name}</h2>
                  {template.description && (
                    <p className="mt-2 text-sm text-text-muted">{template.description}</p>
                  )}
                  {budget > 0 && (
                    <p className="mt-3 font-semibold text-brand-cyan">
                      {t('guideBudget')}: {formatPrice(budget)}
                    </p>
                  )}
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      type="button"
                      className="btn-primary w-full rounded-xl py-2.5 text-sm font-semibold"
                      onClick={() => {
                        applyTemplate(template.id, products)
                        trackEvent('guide_view', { guide: template.id, action: 'load_template' })
                      }}
                    >
                      {t('loadIntoBuilder')}
                    </button>
                    <Link
                      to="/builder"
                      className="btn-ghost inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold"
                      onClick={() => trackEvent('guide_view', { guide: template.id })}
                    >
                      {t('openBuilder')}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
