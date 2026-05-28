import { AlertTriangle } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { incompatReasonTranslationKey } from '../../utils/incompatReason'
import { getBuildConflicts } from '../../utils/buildFixSuggestions'

export function ConflictPanel() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const slotsOrder = useBuilderStore((s) => s.slotsOrder)
  const setActiveCategory = useBuilderStore((s) => s.setActiveCategory)

  const conflicts = useMemo(() => getBuildConflicts(build, slotsOrder), [build, slotsOrder])
  if (conflicts.length === 0) return null

  return (
    <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 p-4">
      <p className="mb-2 inline-flex items-center gap-2 font-semibold text-danger">
        <AlertTriangle size={18} />
        {t('conflictPanelTitle')} ({conflicts.length})
      </p>
      <ul className="space-y-2">
        {conflicts.map(({ slot, part, reasonKey }) => (
          <li key={slot} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-surface/80 px-3 py-2 text-sm">
            <div className="min-w-0">
              <span className="font-medium text-white">{slot}:</span>{' '}
              <span className="text-text-muted">{part.name}</span>
              <p className="text-xs text-danger">{t(incompatReasonTranslationKey(reasonKey))}</p>
            </div>
            <button
              type="button"
              className="chip shrink-0 px-2 py-1 text-xs"
              onClick={() => setActiveCategory(slot)}
            >
              {t('fixSlot')}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
