import { CheckCircle2, ChevronDown, XCircle } from 'lucide-react'
import { useState } from 'react'
import type { IncompatReasonKey } from '../../data/compatibilityRules'
import { useI18n } from '../../i18n'
import { incompatReasonTranslationKey } from '../../utils/incompatReason'

interface CompatibilityBadgeProps {
  compatible: boolean
  reasonKey?: IncompatReasonKey | null
  expandable?: boolean
}

export function CompatibilityBadge({ compatible, reasonKey, expandable = false }: CompatibilityBadgeProps) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(false)

  if (compatible) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
        <CheckCircle2 size={13} />
        {t('compatible')}
      </span>
    )
  }

  const reasonText = reasonKey ? t(incompatReasonTranslationKey(reasonKey)) : t('incompatible')
  const label = reasonKey ? t('wontFit') : t('incompatible')

  if (!expandable) {
    return (
      <span
        className="inline-flex max-w-full items-center gap-1 rounded-full border border-danger/30 bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger"
        title={reasonText}
      >
        <XCircle size={13} className="shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    )
  }

  return (
    <div className="relative max-w-full" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex max-w-full items-center gap-1 rounded-full border border-danger/30 bg-danger/15 px-2 py-0.5 text-xs font-medium text-danger transition hover:bg-danger/25"
        aria-expanded={expanded}
      >
        <XCircle size={13} className="shrink-0" />
        <span className="truncate">{label}</span>
        <ChevronDown size={12} className={`shrink-0 transition ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="absolute right-0 top-full z-10 mt-1 w-56 rounded-lg border border-danger/40 bg-surface-3 p-2.5 text-xs text-danger shadow-glow">
          <p className="font-semibold">{t('incompatWhy')}</p>
          <p className="mt-1 leading-snug text-text">{reasonText}</p>
        </div>
      )}
    </div>
  )
}
