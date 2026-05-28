import { Lock, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useI18n } from '../../i18n'

export function Navbar() {
  const { lang, setLang, t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)

  const navItems = [
    ['/', t('navStore')],
    ['/guides', t('navGuides')],
    ['/builder', t('navBuilder')],
  ] as const

  return (
    <header className="sticky top-0 z-50 border-b border-brand/20 bg-surface/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(134,59,255,0.12)]">
      <nav className="mx-auto max-w-7xl px-4 py-3 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <img
              src="/kurdi-logo.png"
              alt="Kurdi Store logo"
              className="logo-glow h-9 w-auto shrink-0 sm:h-10"
            />
            <span className="text-gradient-brand truncate font-display text-base font-bold sm:text-xl">
              Kurdi Store
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link relative rounded-lg px-4 py-2 text-sm font-medium transition-colors md:text-base ${
                    isActive
                      ? 'nav-link-active bg-gradient-brand-soft text-brand-light shadow-glow'
                      : 'text-text-muted hover:bg-surface-2 hover:text-brand-light'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="btn-ghost button-pop hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-text-muted hover:text-brand-light sm:inline-flex"
              title={t('navAdmin')}
            >
              <Lock size={14} />
              <span>{t('navAdmin')}</span>
            </Link>
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="btn-ghost button-pop rounded-lg px-3 py-1.5 text-xs font-semibold"
            >
              {t('switchLang')}
            </button>
            <button
              type="button"
              aria-label="Toggle menu"
              className="btn-ghost rounded-lg p-2 lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3 lg:hidden">
            {navItems.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? 'nav-link-active bg-gradient-brand-soft text-brand-light shadow-glow'
                      : 'bg-surface-2/80 text-text hover:text-brand-light'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-lg bg-surface-2/80 px-3 py-2.5 text-sm font-medium text-text-muted hover:text-brand-light"
            >
              <Lock size={16} />
              {t('navAdmin')}
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
