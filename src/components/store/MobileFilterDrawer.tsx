import { SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import type { Category } from '../../types'
import { useI18n } from '../../i18n'
import { ProductFilters } from './ProductFilters'
import { UseCaseFilter } from './UseCaseFilter'
import type { StoreFiltersState } from '../../utils/productFilters'
import { deleteFilterPreset, loadFilterPresets, saveFilterPreset } from '../../utils/filterPresets'

interface MobileFilterDrawerProps {
  category: Category | 'All'
  filters: StoreFiltersState
  options: { sockets: string[]; memoryTypes: string[]; formFactors: string[] }
  hasBuildParts: boolean
  onChange: (next: StoreFiltersState) => void
  getCount?: (apply: (base: StoreFiltersState) => StoreFiltersState) => number
}

export function MobileFilterDrawer(props: MobileFilterDrawerProps) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState(loadFilterPresets)
  const [presetName, setPresetName] = useState('')

  return (
    <>
      <button
        type="button"
        className="btn-ghost inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold lg:hidden"
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={18} />
        {t('filtersTitle')}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} aria-label="Close" />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-brand/30 bg-surface p-5 shadow-glow-strong">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-white">{t('filtersTitle')}</h2>
              <button type="button" className="btn-ghost rounded-lg p-2" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <ProductFilters {...props} getCount={props.getCount} />
            <UseCaseFilter
              selected={props.filters.useCaseTags}
              onChange={(useCaseTags) => props.onChange({ ...props.filters, useCaseTags })}
            />
            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-2 text-xs font-semibold text-text-muted">{t('filterPresets')}</p>
              <div className="mb-2 flex gap-2">
                <input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder={t('presetName')}
                  className="input-field flex-1 rounded-lg px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  className="chip px-3 py-1.5 text-xs"
                  onClick={() => {
                    setPresets(saveFilterPreset(presetName || 'Preset', props.filters))
                    setPresetName('')
                  }}
                >
                  {t('savePreset')}
                </button>
              </div>
              <ul className="space-y-1">
                {presets.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-sm text-brand-light hover:underline"
                      onClick={() => {
                        props.onChange(p.filters)
                        setOpen(false)
                      }}
                    >
                      {p.name}
                    </button>
                    <button type="button" className="text-xs text-danger" onClick={() => setPresets(deleteFilterPreset(p.id))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button type="button" className="btn-primary mt-4 w-full rounded-xl py-3 font-semibold" onClick={() => setOpen(false)}>
              {t('applyFilters')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
