import { HelpCircle } from 'lucide-react'
import type { Category } from '../../types'
import { useI18n } from '../../i18n'
import type { StoreFiltersState } from '../../utils/productFilters'

interface ProductFiltersProps {
  category: Category | 'All'
  filters: StoreFiltersState
  options: { sockets: string[]; memoryTypes: string[]; formFactors: string[] }
  hasBuildParts: boolean
  onChange: (next: StoreFiltersState) => void
  getCount?: (apply: (base: StoreFiltersState) => StoreFiltersState) => number
}

function FilterTip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <HelpCircle size={14} className="text-text-muted" aria-hidden />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-48 -translate-x-1/2 rounded-lg border border-border bg-surface-3 px-2 py-1.5 text-[10px] leading-snug text-text group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function ProductFilters({
  category,
  filters,
  options,
  hasBuildParts,
  onChange,
  getCount,
}: ProductFiltersProps) {
  const { t } = useI18n()

  const showSocket = category === 'All' || ['CPU', 'Motherboard'].includes(category)
  const showMemory = category === 'All' || ['RAM', 'Motherboard'].includes(category)
  const showForm = category === 'All' || ['Case', 'Motherboard'].includes(category)
  const showWattage = category === 'All' || category === 'PSU'
  const showVram = category === 'All' || category === 'GPU'

  return (
    <div className="mt-4 space-y-4 border-t border-border pt-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t('filtersTitle')}</p>

      <div>
        <p className="mb-2 text-xs text-text-muted">{t('priceRange')}</p>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder={t('minPrice')}
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="input-field w-full rounded-lg px-2 py-1.5 text-sm"
          />
          <input
            type="number"
            min={0}
            placeholder={t('maxPrice')}
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="input-field w-full rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
          className="accent-brand"
        />
        {t('inStockOnly')}
      </label>

      {hasBuildParts && (
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.hideIncompatible}
            onChange={(e) => onChange({ ...filters, hideIncompatible: e.target.checked })}
            className="accent-brand"
          />
          {t('hideIncompatible')}
        </label>
      )}

      {showSocket && options.sockets.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {t('socketFilter')}
            <FilterTip text={t('filterTipSocket')} />
          </p>
          <div className="flex flex-wrap gap-1.5">
            {options.sockets.map((socket) => {
              const count = getCount?.((base) => ({
                ...base,
                sockets: toggleInList(
                  base.sockets.includes(socket) ? base.sockets : [...base.sockets, socket],
                  socket,
                ),
              }))
              return (
                <button
                  key={socket}
                  type="button"
                  onClick={() => onChange({ ...filters, sockets: toggleInList(filters.sockets, socket) })}
                  className={`chip px-2 py-1 text-xs ${filters.sockets.includes(socket) ? 'chip-active' : ''}`}
                >
                  {socket}
                  {count !== undefined ? ` (${count})` : ''}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {showMemory && options.memoryTypes.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {t('memoryFilter')}
            <FilterTip text={t('filterTipMemory')} />
          </p>
          <div className="flex flex-wrap gap-1.5">
            {options.memoryTypes.map((mem) => (
              <button
                key={mem}
                type="button"
                onClick={() => onChange({ ...filters, memoryTypes: toggleInList(filters.memoryTypes, mem) })}
                className={`chip px-2 py-1 text-xs ${filters.memoryTypes.includes(mem) ? 'chip-active' : ''}`}
              >
                {mem}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && options.formFactors.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {t('formFactorFilter')}
            <FilterTip text={t('filterTipFormFactor')} />
          </p>
          <div className="flex flex-wrap gap-1.5">
            {options.formFactors.map((ff) => (
              <button
                key={ff}
                type="button"
                onClick={() => onChange({ ...filters, formFactors: toggleInList(filters.formFactors, ff) })}
                className={`chip px-2 py-1 text-xs ${filters.formFactors.includes(ff) ? 'chip-active' : ''}`}
              >
                {ff}
              </button>
            ))}
          </div>
        </div>
      )}

      {showWattage && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {t('minWattage')}
            <FilterTip text={t('filterTipWattage')} />
          </p>
          <input
            type="number"
            min={0}
            value={filters.minWattage}
            onChange={(e) => onChange({ ...filters, minWattage: e.target.value })}
            className="input-field w-full rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      )}

      {showVram && (
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs text-text-muted">
            {t('minVram')}
            <FilterTip text={t('filterTipVram')} />
          </p>
          <input
            type="number"
            min={0}
            value={filters.minVram}
            onChange={(e) => onChange({ ...filters, minVram: e.target.value })}
            className="input-field w-full rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
      )}
    </div>
  )
}
