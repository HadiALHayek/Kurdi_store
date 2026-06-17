import { ArrowUpRight, GitCompare, ShoppingCart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { IncompatReasonKey } from '../../data/compatibilityRules'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/compatibility'
import { CompatibilityBadge } from './CompatibilityBadge'
import { useI18n } from '../../i18n'
import { incompatReasonTranslationKey } from '../../utils/incompatReason'
import { getProductUseCaseTags } from '../../utils/useCaseTags'
import { trackEvent } from '../../store/analyticsStore'
import { useCompareStore, MAX_COMPARE_ITEMS } from '../../store/compareStore'
import { useSettingsStore } from '../../store/settingsStore'
import { formatSpecDisplay, hasSpecKey } from '../../utils/productSpecs'
import { getCustomerStockLabelKey } from '../../utils/stockStatus'

const SPEC_PRIORITY_KEYS = [
  'socket',
  'memoryType',
  'tdp',
  'wattage',
  'formFactor',
  'vram',
  'capacity',
  'speed',
  'screenSize',
  'resolution',
  'refreshRate',
  'panelType',
  'cpu',
  'ram',
  'storage',
  'gpu',
] as const

interface ProductCardProps {
  product: Product
  onAction?: () => void
  actionLabel?: string
  compatible?: boolean
  incompatibilityReason?: IncompatReasonKey | null
  disabled?: boolean
  showCompatibilityBadge?: boolean
  showCompare?: boolean
  blockIncompatibleAdd?: boolean
}

export function ProductCard({
  product,
  onAction,
  actionLabel,
  compatible = true,
  incompatibilityReason = null,
  disabled = false,
  showCompatibilityBadge = true,
  showCompare = false,
  blockIncompatibleAdd = false,
}: ProductCardProps) {
  const { t } = useI18n()
  const addBlocked = blockIncompatibleAdd && !compatible && showCompatibilityBadge
  const navigate = useNavigate()
  const compareIds = useCompareStore((s) => s.ids)
  const toggleCompare = useCompareStore((s) => s.toggle)
  const isCompared = compareIds.includes(product.id)
  const compareFull = compareIds.length >= MAX_COMPARE_ITEMS && !isCompared
  const useCaseTags = getProductUseCaseTags(product).slice(0, 3)
  const lowThreshold = useSettingsStore((s) => s.settings.lowStockThreshold)
  const stockKey = getCustomerStockLabelKey(product, lowThreshold)
  const showWasPrice = product.previousPrice != null && product.previousPrice > product.price

  const selectedSpecEntries = SPEC_PRIORITY_KEYS.filter((key) => hasSpecKey(product.specs, key))
    .slice(0, 3)
    .map((key) => [key, formatSpecDisplay(product.specs, key)] as const)
  const specRows = selectedSpecEntries.slice(0, 4)

  const prettifySpecKey = (key: string) => {
    if (key === 'tdp') return 'TDP'
    if (key === 'memoryType') return 'Memory'
    if (key === 'formFactor') return 'Form Factor'
    return key.charAt(0).toUpperCase() + key.slice(1)
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/product/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          navigate(`/product/${product.id}`)
        }
      }}
      className={`group glass-card card-enter flex h-full flex-col overflow-hidden rounded-xl border-brand/15 hover:border-brand/40 ${
        disabled ? 'opacity-60 grayscale' : 'cursor-pointer'
      } ${!compatible && showCompatibilityBadge ? 'border-danger/25' : ''}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {product.staffPick && (
          <span className="absolute left-3 top-3 rounded-full border border-brand-cyan/50 bg-brand/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-light backdrop-blur-sm">
            {t('staffPick')}
          </span>
        )}
        {stockKey === 'outOfStock' && (
          <span className="absolute left-3 top-10 rounded-full border border-danger/50 bg-danger/40 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            {t('outOfStock')}
          </span>
        )}
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-brand/40 bg-brand/30 text-brand-light opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:opacity-100">
          <ArrowUpRight size={16} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="badge-glow rounded-full px-2.5 py-0.5 text-xs font-semibold">
            {product.category}
          </span>
          {showCompatibilityBadge && (
            <CompatibilityBadge
              compatible={compatible}
              reasonKey={incompatibilityReason}
              expandable={!compatible}
            />
          )}
        </div>
        {!compatible && showCompatibilityBadge && incompatibilityReason && (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-2.5 py-2 text-xs leading-snug text-danger">
            {t(incompatReasonTranslationKey(incompatibilityReason))}
          </p>
        )}
        <h3 className="line-clamp-2 min-h-[2.75rem] font-display text-base font-semibold leading-snug text-white sm:text-lg">
          {product.name}
        </h3>
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-text-muted">{product.description}</p>
        {useCaseTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {useCaseTags.map((tag) => (
              <span key={tag} className="rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-2 py-0.5 text-[10px] capitalize text-brand-cyan">
                {t(`useCase_${tag}` as 'useCase_gaming')}
              </span>
            ))}
          </div>
        )}
        <ul className="grid h-[96px] grid-cols-1 gap-1 rounded-lg border border-border bg-surface-2/50 p-2 text-xs">
          {specRows.map(([key, value]) => (
            <li key={key} className="flex items-center justify-between gap-2 px-1 py-0.5">
              <span className="text-text-muted">{prettifySpecKey(key)}</span>
              <span className="truncate font-medium text-text">{value}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <p className="font-display text-2xl font-bold text-brand-cyan">{formatPrice(product.price)}</p>
          {showWasPrice && (
            <p className="text-sm text-text-muted line-through">{formatPrice(product.previousPrice!)}</p>
          )}
        </div>
        <div className="flex gap-2">
          {showCompare && product.category !== 'Prebuilt PC' && (
            <button
              type="button"
              disabled={compareFull}
              title={compareFull ? t('compareMax') : t('compare')}
              onClick={(event) => {
                event.stopPropagation()
                toggleCompare(product.id)
                trackEvent('compare_add', { productId: product.id })
              }}
              className={`button-pop btn-ghost inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg px-3 ${
                isCompared ? 'border-brand text-brand-light' : ''
              }`}
            >
              <GitCompare size={16} />
            </button>
          )}
          {onAction && (
            <button
              type="button"
              disabled={disabled || addBlocked}
              title={addBlocked ? t('addIncompatibleDisabled') : undefined}
              onClick={(event) => {
                event.stopPropagation()
                onAction()
                trackEvent('add_to_builder', { from: 'store', productId: product.id })
              }}
              className="button-pop btn-primary inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              <ShoppingCart size={16} />
              {addBlocked ? t('wontFit') : (actionLabel ?? t('addToBuilder'))}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
