import { ArrowRight, BookOpen, Cpu, Wrench } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GuideSection } from '../components/guides/GuideSection'
import {
  PC_GUIDE_COMPATIBILITY_SECTION,
  PC_GUIDE_NAV_SECTIONS,
  PC_GUIDE_PART_SECTIONS,
} from '../data/pcGuideContent'
import { usePageMeta } from '../hooks/usePageMeta'
import { useI18n } from '../i18n'

export function GuidesPage() {
  const { t } = useI18n()

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

      <div className="section-enter flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
        <nav
          aria-label={t('guideJumpTo')}
          className="glass-card hidden shrink-0 rounded-2xl p-4 lg:sticky lg:top-24 lg:block lg:w-52"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand">{t('guideJumpTo')}</p>
          <ul className="space-y-1">
            {PC_GUIDE_NAV_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-text-muted transition hover:bg-surface-2 hover:text-brand-light"
                >
                  {t(section.titleKey)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {PC_GUIDE_NAV_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="chip shrink-0 px-3 py-1.5 text-xs font-medium"
              >
                {t(section.titleKey)}
              </a>
            ))}
          </div>

          {PC_GUIDE_PART_SECTIONS.map((section, index) => (
            <GuideSection key={section.id} section={section} defaultOpen={index === 0} />
          ))}

          <GuideSection section={PC_GUIDE_COMPATIBILITY_SECTION} />
        </div>
      </div>

      <section className="section-enter mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/builder"
          className="glass-card group flex flex-col rounded-2xl border-brand/20 p-6 transition hover:border-brand/40 hover:shadow-glow"
        >
          <Wrench size={28} className="text-brand-cyan" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">{t('guideCtaBuilder')}</h2>
          <p className="mt-1 flex-1 text-sm text-text-muted">{t('guideCtaBuilderDesc')}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan group-hover:underline">
            {t('openBuilder')}
            <ArrowRight size={16} />
          </span>
        </Link>

        <Link
          to="/products?department=pc-parts"
          className="glass-card group flex flex-col rounded-2xl border-brand/20 p-6 transition hover:border-brand/40 hover:shadow-glow"
        >
          <Cpu size={28} className="text-brand-cyan" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">{t('guideCtaParts')}</h2>
          <p className="mt-1 flex-1 text-sm text-text-muted">{t('deptPcPartsDesc')}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan group-hover:underline">
            {t('browseProducts')}
            <ArrowRight size={16} />
          </span>
        </Link>

        <Link
          to="/products?department=prebuilt"
          className="glass-card group flex flex-col rounded-2xl border-brand/20 p-6 transition hover:border-brand/40 hover:shadow-glow sm:col-span-2 lg:col-span-1"
        >
          <BookOpen size={28} className="text-brand-cyan" />
          <h2 className="mt-3 font-display text-lg font-bold text-white">{t('guideCtaPrebuilt')}</h2>
          <p className="mt-1 flex-1 text-sm text-text-muted">{t('deptPrebuiltDesc')}</p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan group-hover:underline">
            {t('browseProducts')}
            <ArrowRight size={16} />
          </span>
        </Link>
      </section>
    </div>
  )
}
