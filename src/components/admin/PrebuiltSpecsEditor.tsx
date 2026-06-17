import { useMemo, useState } from 'react'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/compatibility'
import { useI18n } from '../../i18n'
import { getAdminSpecValueOptions } from '../../utils/adminDepartmentSpecs'
import {
  encodeStorePartRef,
  formatPrebuiltSpecValue,
  getStorePartsForPrebuiltSpec,
  isPrebuiltPartSpecKey,
  PREBUILT_META_SPEC_KEYS,
  PREBUILT_PART_SPEC_KEYS,
  type PrebuiltMetaSpecKey,
  type PrebuiltPartSpecKey,
} from '../../utils/prebuiltSpecs'
import { addSpecValue, getSpecKeys, getSpecValues, removeSpecValue, type ProductSpecs } from '../../utils/productSpecs'

interface PrebuiltSpecsEditorProps {
  specs: ProductSpecs
  onChange: (specs: ProductSpecs) => void
  storeProducts: Product[]
  excludeProductId?: string
}

const SPEC_KEY_LABELS: Record<string, string> = {
  cpu: 'CPU',
  gpu: 'GPU',
  ram: 'RAM',
  storage: 'Storage',
  motherboard: 'Motherboard',
  psu: 'PSU',
  cooling: 'Cooling',
  resolutionTarget: 'Resolution target',
  performanceTier: 'Performance tier',
  os: 'OS',
}

export function PrebuiltSpecsEditor({
  specs,
  onChange,
  storeProducts,
  excludeProductId,
}: PrebuiltSpecsEditorProps) {
  const { t } = useI18n()
  const [partKey, setPartKey] = useState<PrebuiltPartSpecKey>('cpu')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [customPartName, setCustomPartName] = useState('')
  const [metaKey, setMetaKey] = useState<PrebuiltMetaSpecKey>('resolutionTarget')
  const [metaValue, setMetaValue] = useState(getAdminSpecValueOptions('resolutionTarget')[0] ?? '')

  const storeParts = useMemo(
    () => getStorePartsForPrebuiltSpec(storeProducts, partKey, excludeProductId),
    [storeProducts, partKey, excludeProductId],
  )

  const metaOptions = getAdminSpecValueOptions(metaKey)
  const safeMetaValue = metaOptions.includes(metaValue) ? metaValue : metaOptions[0] ?? ''

  const addPartSpec = () => {
    const value = customPartName.trim()
      ? customPartName.trim()
      : selectedProductId
        ? encodeStorePartRef(selectedProductId)
        : ''
    if (!value) return
    onChange(addSpecValue(specs, partKey, value))
    setCustomPartName('')
    setSelectedProductId(storeParts[0]?.id ?? '')
  }

  const addMetaSpec = () => {
    if (!safeMetaValue) return
    onChange(addSpecValue(specs, metaKey, safeMetaValue))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/80 bg-surface/40 p-4">
        <p className="mb-3 text-sm font-semibold text-white">{t('prebuiltPartsFromStore')}</p>
        <p className="mb-3 text-xs text-text-muted">{t('prebuiltPartsFromStoreHint')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={partKey}
            onChange={(event) => {
              const nextKey = event.target.value as PrebuiltPartSpecKey
              setPartKey(nextKey)
              const nextParts = getStorePartsForPrebuiltSpec(storeProducts, nextKey, excludeProductId)
              setSelectedProductId(nextParts[0]?.id ?? '')
              setCustomPartName('')
            }}
            className="input-field min-w-0 flex-1 rounded-xl px-3 py-2.5"
          >
            {PREBUILT_PART_SPEC_KEYS.map((key) => (
              <option key={key} value={key}>
                {SPEC_KEY_LABELS[key] ?? key}
              </option>
            ))}
          </select>
          <select
            value={selectedProductId}
            onChange={(event) => {
              setSelectedProductId(event.target.value)
              if (event.target.value) setCustomPartName('')
            }}
            disabled={storeParts.length === 0}
            className="input-field min-w-0 flex-[2] rounded-xl px-3 py-2.5 disabled:opacity-50"
          >
            {storeParts.length === 0 ? (
              <option value="">{t('prebuiltNoPartsInStore')}</option>
            ) : (
              storeParts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} — {formatPrice(product.price)}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={customPartName}
            onChange={(event) => {
              setCustomPartName(event.target.value)
              if (event.target.value.trim()) setSelectedProductId('')
            }}
            placeholder={t('prebuiltCustomPartPlaceholder')}
            className="input-field min-w-0 flex-1 rounded-xl px-3 py-2.5"
          />
          <button
            type="button"
            onClick={addPartSpec}
            className="button-pop shrink-0 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold"
          >
            {t('addSpec')}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-surface/40 p-4">
        <p className="mb-3 text-sm font-semibold text-white">{t('prebuiltMetaSpecs')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={metaKey}
            onChange={(event) => {
              const nextKey = event.target.value as PrebuiltMetaSpecKey
              setMetaKey(nextKey)
              setMetaValue(getAdminSpecValueOptions(nextKey)[0] ?? '')
            }}
            className="input-field min-w-0 flex-1 rounded-xl px-3 py-2.5"
          >
            {PREBUILT_META_SPEC_KEYS.map((key) => (
              <option key={key} value={key}>
                {SPEC_KEY_LABELS[key] ?? key}
              </option>
            ))}
          </select>
          <select
            value={safeMetaValue}
            onChange={(event) => setMetaValue(event.target.value)}
            className="input-field min-w-0 flex-1 rounded-xl px-3 py-2.5"
          >
            {metaOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={addMetaSpec}
            className="button-pop shrink-0 rounded-xl bg-surface-2 px-4 py-2.5 text-sm font-semibold"
          >
            {t('addSpec')}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm text-text-muted">{t('selectedSpecs')}</p>
        <ul className="space-y-1 text-sm text-text-muted">
          {getSpecKeys(specs).length === 0 && <li>{t('noSpecsYet')}</li>}
          {getSpecKeys(specs).flatMap((key) =>
            getSpecValues(specs, key).map((value) => (
              <li
                key={`${key}-${value}`}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-2 py-1"
              >
                <span>
                  <span className="font-medium text-text">{SPEC_KEY_LABELS[key] ?? key}</span>
                  {' = '}
                  {isPrebuiltPartSpecKey(key)
                    ? formatPrebuiltSpecValue(value, storeProducts)
                    : value}
                </span>
                <button
                  type="button"
                  className="text-danger hover:underline"
                  onClick={() => onChange(removeSpecValue(specs, key, value))}
                >
                  ×
                </button>
              </li>
            )),
          )}
        </ul>
      </div>
    </div>
  )
}
