import { Check, Share2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Modal } from './Modal'
import { useI18n } from '../../i18n'
import { useCompareStore } from '../../store/compareStore'
import { useProductsStore } from '../../store/productsStore'
import { useState } from 'react'
import { trackEvent } from '../../store/analyticsStore'

export function CompareTray() {
  const { t } = useI18n()
  const ids = useCompareStore((s) => s.ids)
  const clear = useCompareStore((s) => s.clear)
  const remove = useCompareStore((s) => s.remove)
  const shareUrl = useCompareStore((s) => s.shareUrl)
  const products = useProductsStore((s) => s.products)
  const [open, setOpen] = useState(false)
  const [diffOnly, setDiffOnly] = useState(true)
  const [copied, setCopied] = useState(false)

  const compared = products.filter((p) => ids.includes(p.id))
  if (ids.length === 0) return null

  const specKeys = Array.from(new Set(compared.flatMap((p) => Object.keys(p.specs)))).slice(0, 16)

  const visibleSpecKeys = diffOnly
    ? specKeys.filter((key) => {
        const values = compared.map((p) => p.specs[key] ?? '—')
        return new Set(values).size > 1
      })
    : specKeys

  const copyShare = async () => {
    await navigator.clipboard.writeText(shareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    trackEvent('compare_add', { action: 'share_link' })
  }

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 z-40 px-4 lg:bottom-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-xl border border-brand/30 bg-surface/95 px-4 py-3 shadow-glow backdrop-blur-xl">
          <p className="text-sm font-semibold text-white">
            {t('compareTray')} ({ids.length}/3)
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-primary rounded-lg px-3 py-1.5 text-sm font-semibold" onClick={() => setOpen(true)}>
              {t('compare')}
            </button>
            <button type="button" className="chip px-3 py-1.5 text-sm" onClick={clear}>
              {t('compareClear')}
            </button>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t('compareTray')}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={diffOnly} onChange={(e) => setDiffOnly(e.target.checked)} className="accent-brand" />
            {t('compareShowDiff')}
          </label>
          <button type="button" className="btn-ghost inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm" onClick={copyShare}>
            {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
            {copied ? t('buildCopied') : t('compareShare')}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left text-text-muted">Spec</th>
                {compared.map((p) => (
                  <th key={p.id} className="max-w-[140px] p-2 text-left">
                    <div className="flex items-start justify-between gap-1">
                      <Link to={`/product/${p.id}`} className="font-semibold text-brand-light hover:underline" onClick={() => setOpen(false)}>
                        {p.name}
                      </Link>
                      <button type="button" className="text-text-muted hover:text-danger" onClick={() => remove(p.id)} aria-label="Remove">
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="p-2 text-text-muted">{t('price')}</td>
                {compared.map((p) => {
                  const prices = compared.map((x) => x.price)
                  const diff = new Set(prices).size > 1
                  return (
                    <td key={p.id} className={`p-2 font-semibold ${diff ? 'bg-brand/15 text-brand-cyan' : 'text-brand-cyan'}`}>
                      ${p.price.toFixed(2)}
                    </td>
                  )
                })}
              </tr>
              {visibleSpecKeys.map((key) => {
                const values = compared.map((p) => p.specs[key] ?? '—')
                const isDiff = new Set(values).size > 1
                return (
                  <tr key={key} className={`border-b border-border/40 ${isDiff ? 'bg-brand/10' : ''}`}>
                    <td className="p-2 capitalize text-text-muted">{key}</td>
                    {compared.map((p) => (
                      <td key={p.id} className={`p-2 ${isDiff ? 'font-medium text-white' : 'text-text'}`}>
                        {p.specs[key] ?? '—'}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {diffOnly && visibleSpecKeys.length === 0 && (
          <p className="mt-3 text-sm text-text-muted">{t('compatible')}</p>
        )}
      </Modal>
    </>
  )
}
