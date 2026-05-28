import { ArrowRight, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buildGuides } from '../data/buildGuides'
import { useI18n } from '../i18n'
import { usePageMeta } from '../hooks/usePageMeta'
import { useBuilderStore } from '../store/builderStore'
import { useProductsStore } from '../store/productsStore'
import { trackEvent } from '../store/analyticsStore'
import { formatPrice } from '../utils/compatibility'

export function GuidesPage() {
  const { t } = useI18n()
  const applyPreset = useBuilderStore((s) => s.applyPreset)
  const products = useProductsStore((s) => s.products)

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
      </div>
    </div>
  )
}
