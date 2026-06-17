import { useMemo } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { getWattageBreakdown } from '../../utils/wattageBreakdown'
import { getNumericSpecMax } from '../../utils/productSpecs'

export function WattageBreakdown() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const psuWatts = getNumericSpecMax(build.PSU?.specs ?? {}, 'wattage')

  const { segments, required, psuWatts: psu, headroom } = useMemo(
    () => getWattageBreakdown(build, psuWatts),
    [build, psuWatts],
  )

  const totalBar = Math.max(psu, required, 1)

  if (required === 0 && psu === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">{t('wattageBreakdown')}</p>
      <div className="flex h-3 overflow-hidden rounded-full bg-black/50">
        {segments.map((seg) => (
          <div
            key={seg.key}
            title={`${t(seg.labelKey)}: ${seg.watts}W`}
            style={{ width: `${(seg.watts / totalBar) * 100}%`, backgroundColor: seg.color }}
          />
        ))}
      </div>
      <ul className="mt-2 space-y-1 text-xs text-text-muted">
        {segments.map((seg) => (
          <li key={seg.key} className="flex justify-between">
            <span>{t(seg.labelKey)}</span>
            <span className="font-medium text-text">{seg.watts}W</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-text-muted">
        {t('required')}: {required}W · PSU: {psu}W
        {headroom > 0 && ` · ${t('wattHeadroom')}: ${headroom}W`}
      </p>
    </div>
  )
}
