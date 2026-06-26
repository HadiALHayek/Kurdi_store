import { Check, Copy, FileText, Hash, MessageCircle, Printer, Share2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { useBuildCodesStore, buildCodeShareUrl } from '../../store/buildCodesStore'
import { useCustomersStore } from '../../store/customersStore'
import { useSettingsStore } from '../../store/settingsStore'
import { formatBuildListText, whatsAppOrderUrl } from '../../utils/buildExport'
import { buildShareUrl } from '../../utils/buildShare'
import { printBuildSheet } from '../../utils/printBuild'
import { formatQuoteRequestText, printQuoteSheet } from '../../utils/quoteRequest'
import { trackEvent } from '../../store/analyticsStore'
import { formatBuildPartsSummary, getSelectedBuildTotal, normalizeBuildMap } from '../../utils/builderSlots'
import { QuoteRequestModal } from './QuoteRequestModal'

export function BuildActions() {
  const { t } = useI18n()
  const build = useBuilderStore((s) => s.build)
  const settings = useSettingsStore((s) => s.settings)
  const registerBuild = useBuildCodesStore((s) => s.registerBuild)
  const submitLead = useCustomersStore((s) => s.submitLead)
  const [copied, setCopied] = useState<'list' | 'link' | 'code' | null>(null)
  const [buildCode, setBuildCode] = useState('')
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [quoteSavedMessage, setQuoteSavedMessage] = useState('')
  const [quoteErrorMessage, setQuoteErrorMessage] = useState('')
  const [quoteSubmitting, setQuoteSubmitting] = useState(false)

  const selectedBuild = useMemo(() => normalizeBuildMap(build), [build])
  const buildTotal = useMemo(() => getSelectedBuildTotal(selectedBuild), [selectedBuild])
  const hasParts = Object.keys(selectedBuild).length > 0
  const selectionKey = useMemo(
    () =>
      Object.entries(selectedBuild)
        .map(([slot, product]) => `${slot}:${product.id}`)
        .join('|'),
    [selectedBuild],
  )

  useEffect(() => {
    setBuildCode('')
    setQuoteSavedMessage('')
    setQuoteErrorMessage('')
  }, [selectionKey])

  const copyText = async (text: string, kind: 'list' | 'link' | 'code') => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setTimeout(() => setCopied(null), 2000)
  }

  const listText = formatBuildListText(selectedBuild, buildTotal)
  const shareUrl = buildShareUrl(selectedBuild)
  const codeUrl = buildCode ? buildCodeShareUrl(buildCode) : ''

  const storeMeta = {
    name: 'Kurdi Store',
    address: settings.address,
    phone: settings.phone,
    hours: settings.workingHours,
  }

  const handleQuoteSubmit = async (name: string, phone: string) => {
    const code = registerBuild(selectedBuild)
    setBuildCode(code)
    setQuoteErrorMessage('')
    setQuoteSubmitting(true)

    const result = await submitLead({
      name,
      phone,
      partsSummary: formatBuildPartsSummary(selectedBuild),
      partCount: Object.keys(selectedBuild).length,
      total: buildTotal,
      buildCode: code || undefined,
      source: 'builder',
    })

    setQuoteSubmitting(false)

    if (!result.ok) {
      setQuoteErrorMessage(t('customerQuoteFailed'))
      return
    }

    trackEvent('quote_request', {
      parts: String(Object.keys(selectedBuild).length),
      channel: 'admin',
    })

    setQuoteModalOpen(false)
    setQuoteSavedMessage(t('customerQuoteSaved'))
  }

  const openWhatsApp = () => {
    const code = registerBuild(selectedBuild)
    setBuildCode(code)
    const quoteText = formatQuoteRequestText(selectedBuild, buildTotal, storeMeta, code || undefined)
    trackEvent('quote_request', { channel: 'whatsapp', parts: String(Object.keys(selectedBuild).length) })
    window.open(whatsAppOrderUrl(settings.phone, quoteText), '_blank', 'noreferrer')
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {quoteSavedMessage && (
          <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
            {quoteSavedMessage}
          </p>
        )}
        {quoteErrorMessage && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {quoteErrorMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="btn-ghost button-pop inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
            disabled={!hasParts}
            onClick={() => copyText(listText, 'list')}
          >
            {copied === 'list' ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            {copied === 'list' ? t('buildCopied') : t('copyBuild')}
          </button>
          <button
            type="button"
            className="btn-ghost button-pop inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
            disabled={!hasParts}
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
          disabled={!hasParts}
          onClick={() => setQuoteModalOpen(true)}
        >
          <FileText size={18} />
          {t('requestQuote')}
        </button>

        {settings.phone && (
          <button
            type="button"
            className="btn-ghost button-pop inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-3 text-sm font-semibold text-brand-cyan hover:bg-brand-cyan/20"
            disabled={!hasParts}
            onClick={openWhatsApp}
          >
            <MessageCircle size={18} />
            {t('sendViaWhatsApp')}
          </button>
        )}

        <button
          type="button"
          className="btn-ghost button-pop inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
          disabled={!hasParts}
          onClick={() => {
            const code = registerBuild(selectedBuild)
            setBuildCode(code)
            printQuoteSheet(selectedBuild, buildTotal, storeMeta, code || undefined)
            trackEvent('quote_request', { action: 'print' })
          }}
        >
          <Printer size={18} />
          {t('printQuote')}
        </button>

        <button
          type="button"
          className="btn-ghost button-pop inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold"
          disabled={!hasParts}
          onClick={() => {
            printBuildSheet(selectedBuild, buildTotal, 'Kurdi Store', settings.address)
            trackEvent('print_build', { parts: String(Object.keys(selectedBuild).length) })
          }}
        >
          <Printer size={18} />
          {t('printBuild')}
        </button>
      </div>

      <QuoteRequestModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        onSubmit={handleQuoteSubmit}
        submitting={quoteSubmitting}
      />
    </>
  )
}
