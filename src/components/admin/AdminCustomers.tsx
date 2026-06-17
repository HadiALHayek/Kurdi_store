import { Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useCustomersStore } from '../../store/customersStore'
import { formatPrice } from '../../utils/compatibility'

interface AdminCustomersProps {
  onToast: (message: string) => void
}

export function AdminCustomers({ onToast }: AdminCustomersProps) {
  const { t } = useI18n()
  const requests = useCustomersStore((s) => s.requests)
  const removeRequest = useCustomersStore((s) => s.removeRequest)
  const clearAll = useCustomersStore((s) => s.clearAll)
  const exportCsv = useCustomersStore((s) => s.exportCsv)

  const sorted = [...requests].reverse()

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

      <div className="flex flex-wrap gap-2">
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
              clearAll()
              onToast(t('customersCleared'))
            }
          }}
        >
          {t('clearCustomers')}
        </button>
      </div>

      {sorted.length === 0 ? (
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
                      className="text-text-muted transition hover:text-danger"
                      title={t('delete')}
                      onClick={() => {
                        if (window.confirm(t('confirmDeleteCustomer'))) {
                          removeRequest(request.id)
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
