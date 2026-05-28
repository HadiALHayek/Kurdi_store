import { Check, Copy, FileText, Hash, MessageCircle, Printer, Share2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { useBuildCodesStore, buildCodeShareUrl } from '../../store/buildCodesStore'
import { useSettingsStore } from '../../store/settingsStore'
import { formatBuildListText, whatsAppOrderUrl } from '../../utils/buildExport'
import { buildShareUrl } from '../../utils/buildShare'
import { printBuildSheet } from '../../utils/printBuild'
import { formatQuoteRequestText, printQuoteSheet } from '../../utils/quoteRequest'
import { trackEvent } from '../../store/analyticsStore'

export function BuildActions() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const buildTotal = useBuilderStore((s) => s.totalPrice())
  const settings = useSettingsStore((s) => s.settings)
  const registerBuild = useBuildCodesStore((s) => s.registerBuild)
  const [copied, setCopied] = useState<'list' | 'link' | 'code' | null>(null)

  const copyText = async (text: string, kind: 'list' | 'link' | 'code') => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  const listText = formatBuildListText(build, buildTotal)
  const shareUrl = buildShareUrl(build)
  const buildCode = Object.keys(build).length > 0 ? registerBuild(build) : ''
  const codeUrl = buildCode ? buildCodeShareUrl(buildCode) : ''

  const storeMeta = {
    name: 'Kurdi Store',
    address: settings.address,
    phone: settings.phone,
    hours: settings.workingHours,
  }

  const quoteText = formatQuoteRequestText(build, buildTotal, storeMeta, buildCode || undefined)

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          className="btn-ghost button-pop inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
          onClick={() => copyText(listText, 'list')}
        >
          {copied === 'list' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          {copied === 'list' ? t('buildCopied') : t('copyBuild')}
        </button>
        <button
          type="button"
          className="btn-ghost button-pop inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
          onClick={() => copyText(shareUrl, 'link')}
        >
          {copied === 'link' ? <Check size={16} className="text-success" /> : <Share2 size={16} />}
          {copied === 'link' ? t('buildCopied') : t('shareBuild')}
        </button>
      </div>

      {buildCode && (
        <div className="rounded-xl border border-brand/30 bg-surface-2/80 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">{t('buildCode')}</p>
          <p className="font-mono text-lg font-bold tracking-widest text-brand-light">{buildCode}</p>
          <button
            type="button"
            className="btn-ghost mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
            onClick={() => copyText(codeUrl, 'code')}
          >
            {copied === 'code' ? <Check size={16} /> : <Hash size={16} />}
            {copied === 'code' ? t('buildCopied') : t('copyBuildCodeLink')}
          </button>
        </div>
      )}

      <button
        type="button"
        className="button-pop btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
        onClick={() => {
          trackEvent('quote_request', { parts: String(Object.keys(build).length) })
          if (settings.phone) {
            window.open(whatsAppOrderUrl(settings.phone, quoteText), '_blank', 'noreferrer')
          } else {
            void copyText(quoteText, 'list')
          }
        }}
      >
        <FileText size={18} />
        {t('requestQuote')}
      </button>

      <button
        type="button"
        className="btn-ghost button-pop inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
        onClick={() => {
          printQuoteSheet(build, buildTotal, storeMeta, buildCode || undefined)
          trackEvent('quote_request', { action: 'print' })
        }}
      >
        <Printer size={18} />
        {t('printQuote')}
      </button>

      <button
        type="button"
        className="btn-ghost button-pop inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
        onClick={() => {
          printBuildSheet(build, buildTotal, 'Kurdi Store', settings.address)
          trackEvent('print_build', { parts: String(Object.keys(build).length) })
        }}
      >
        <Printer size={18} />
        {t('printBuild')}
      </button>

      {settings.phone && (
        <a
          href={whatsAppOrderUrl(settings.phone, quoteText)}
          target="_blank"
          rel="noreferrer"
          className="button-pop btn-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          onClick={() => trackEvent('quote_request', { channel: 'whatsapp' })}
        >
          <MessageCircle size={18} />
          {t('orderWhatsApp')}
        </a>
      )}
    </div>
  )
}
