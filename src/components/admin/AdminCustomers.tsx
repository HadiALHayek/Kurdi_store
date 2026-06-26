import { useEffect, useState } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCustomersStore } from '../../store/customersStore'
import { formatPrice } from '../../utils/compatibility'

interface AdminCustomersProps {
  onToast: (message: string) => void
}

export function AdminCustomers({ onToast }: AdminCustomersProps) {
  const { t } = useI18n()
  const requests = useCustomersStore((s) => s.requests)
  const loading = useCustomersStore((s) => s.loading)
  const error = useCustomersStore((s) => s.error)
  const fetchLeads = useCustomersStore((s) => s.fetchLeads)
  const removeRequest = useCustomersStore((s) => s.removeRequest)
  const clearAll = useCustomersStore((s) => s.clearAll)
  const exportCsv = useCustomersStore((s) => s.exportCsv)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    void fetchLeads()
  }, [fetchLeads])

  const sorted = [...requests].reverse()

  const errorMessage =
    error === 'unauthorized'
      ? t('customersAuthRequired')
      : error === 'offline_unsynced'
        ? t('customersOfflineUnsynced')
        : error
          ? t('customersFetchFailed')
          : null

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{t('customers')}</h3>
          <p className="mt-1 text-sm text-text-muted">{t('customersSubtitle')}</p>
        </div>
        <div className="panel-elevated rounded-xl px-4 py-3">
          <p className="text-xs text-text-muted">{t('customerRequestsCount')}</p>
          <p className="font-display text-2xl text-white">{requests.length}</p>
        </div>
      </div>

      {errorMessage && (
        <p className="rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          {errorMessage}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="chip inline-flex items-center gap-2 px-4 py-2 text-sm"
          disabled={loading}
          onClick={() => void fetchLeads()}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? t('loadingCustomers') : t('refreshCustomers')}
        </button>
        <button
          type="button"
          className="btn-primary rounded-lg px-4 py-2 text-sm"
          disabled={requests.length === 0}
          onClick={() => {
            const blob = new Blob([exportCsv()], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'kurdi-customers.csv'
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          {t('exportCustomers')}
        </button>
        <button
          type="button"
          className="chip px-4 py-2 text-sm"
          disabled={requests.length === 0}
          onClick={() => {
            if (window.confirm(t('confirmClearCustomers'))) {
              void clearAll().then(() => onToast(t('customersCleared')))
            }
          }}
        >
          {t('clearCustomers')}
        </button>
      </div>

      {loading && requests.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-2/60 p-6 text-center text-sm text-text-muted">
          {t('loadingCustomers')}
        </p>
      ) : sorted.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface-2/60 p-6 text-center text-sm text-text-muted">
          {t('noCustomers')}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-text-muted">
              <tr>
                <th className="p-3">{t('customerRequestedAt')}</th>
                <th className="p-3">{t('customerName')}</th>
                <th className="p-3">{t('customerPhone')}</th>
                <th className="p-3">{t('customerParts')}</th>
                <th className="p-3">{t('total')}</th>
                <th className="p-3">{t('buildCode')}</th>
                <th className="p-3">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((request) => (
                <tr key={request.id} className="border-b border-border/40 align-top">
                  <td className="p-3 whitespace-nowrap text-text-muted">
                    {new Date(request.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium text-white">{request.name}</td>
                  <td className="p-3">
                    <a href={`tel:${request.phone}`} className="text-brand-cyan hover:underline">
                      {request.phone}
                    </a>
                  </td>
                  <td className="p-3 max-w-xs text-text-muted">{request.partsSummary}</td>
                  <td className="p-3 whitespace-nowrap font-semibold text-brand-light">
                    {formatPrice(request.total)}
                  </td>
                  <td className="p-3 font-mono text-xs text-text-muted">{request.buildCode ?? '—'}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="text-text-muted transition hover:text-danger disabled:opacity-50"
                      title={t('delete')}
                      disabled={deletingId === request.id}
                      onClick={() => {
                        if (window.confirm(t('confirmDeleteCustomer'))) {
                          setDeletingId(request.id)
                          void removeRequest(request.id)
                            .catch(() => onToast(t('customersDeleteFailed')))
                            .finally(() => setDeletingId(null))
                        }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
