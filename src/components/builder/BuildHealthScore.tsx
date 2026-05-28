import { Activity } from 'lucide-react'
import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { computeBuildHealth } from '../../utils/buildHealth'

export function BuildHealthScore() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const slotsOrder = useBuilderStore((s) => s.slotsOrder)

  const health = useMemo(() => computeBuildHealth(build, slotsOrder), [build, slotsOrder])
  if (health.score === 0 && Object.keys(build).length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-white">
          <Activity size={16} className="text-brand-cyan" />
          {t('buildHealth')}
        </span>
        <span className="font-display text-xl font-bold text-brand-light">{health.score}%</span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full bg-gradient-to-r from-danger via-brand to-success transition-all duration-500"
          style={{ width: `${health.score}%` }}
        />
      </div>
      <p className="mb-2 text-xs font-medium text-brand-cyan">{t(health.labelKey)}</p>
      <ul className="space-y-1 text-xs text-text-muted">
        {health.checks.map((c) => (
          <li key={c.id} className={c.ok ? 'text-success' : 'text-danger'}>
            {c.ok ? '✓' : '○'} {c.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
