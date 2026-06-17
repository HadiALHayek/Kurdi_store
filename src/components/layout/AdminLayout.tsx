import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useI18n } from '../../i18n'
import { adminLogout } from '../../utils/adminAuth'

type AdminView = 'products' | 'add' | 'analytics' | 'customers' | 'settings'

interface AdminLayoutProps {
  active: AdminView
  onNavigate: (view: AdminView) => void
  children: ReactNode
}

export function AdminLayout({ active, onNavigate, children }: AdminLayoutProps) {
  const { t, lang, setLang } = useI18n()
  const navigate = useNavigate()

  const items: Array<{ key: AdminView; label: string }> = [
    { key: 'products', label: t('products') },
    { key: 'add', label: t('addProduct') },
    { key: 'customers', label: t('customers') },
    { key: 'analytics', label: t('analytics') },
    { key: 'settings', label: t('storeSettings') },
  ]

  return (
    <div className="page-enter mx-auto flex max-w-7xl flex-col gap-5 overflow-x-hidden px-4 py-6 sm:gap-6 md:grid md:grid-cols-[240px_1fr] md:px-8">
      <aside className="glass-card rounded-2xl p-5 shadow-glow">
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border pb-4">
          <h2 className="font-display text-xl font-bold text-white">{t('admin')}</h2>
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-ghost shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold"
          >
            {t('switchLang')}
          </button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition md:w-full ${
                active === item.key
                  ? 'bg-gradient-brand text-white shadow-glow'
                  : 'bg-surface-2/80 text-text-muted hover:bg-surface-3 hover:text-brand-light'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            adminLogout()
            navigate('/admin', { replace: true })
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20 md:mt-6"
        >
          <LogOut size={16} />
          {t('logout')}
        </button>
      </aside>
      <section className="glass-card min-w-0 rounded-2xl p-5 md:p-7">{children}</section>
    </div>
  )
}
