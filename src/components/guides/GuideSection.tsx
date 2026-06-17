import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { PcGuideSection } from '../../data/pcGuideContent'
import { useI18n } from '../../i18n'

interface GuideSectionProps {
  section: PcGuideSection
  defaultOpen?: boolean
}

export function GuideSection({ section, defaultOpen = false }: GuideSectionProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(defaultOpen)

  return (
    <article
      id={section.id}
      className="glass-card scroll-mt-28 overflow-hidden rounded-2xl border-brand/15"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 p-5 text-left transition hover:bg-surface-2/40"
        aria-expanded={open}
      >
        <h2 className="font-display text-lg font-bold text-white sm:text-xl">{t(section.titleKey)}</h2>
        <ChevronDown
          size={20}
          className={`shrink-0 text-brand-cyan transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-border/60 px-5 pb-5 pt-4">
          <p className="text-sm leading-relaxed text-text-muted">{t(section.bodyKey)}</p>

          {section.tipKeys.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-cyan">
                {t('guideTipsLabel')}
              </p>
              <ul className="space-y-2 text-sm text-text-muted">
                {section.tipKeys.map((key) => (
                  <li key={key} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                    <span>{t(key)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {section.shopLinks && section.shopLinks.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {section.shopLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="button-pop chip px-4 py-2 text-sm font-semibold text-brand-cyan hover:text-brand-light"
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
