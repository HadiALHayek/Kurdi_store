import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import { useSettingsStore } from '../../store/settingsStore'
import { getDepartmentDescription, getDepartmentName } from '../../utils/departmentLabels'
import { getDepartmentImage } from '../../utils/shopDepartments'

export function CategoryDepartmentGrid() {
  const { t, isArabic } = useI18n()
  const departments = useSettingsStore((s) => s.settings.departments)

  if (departments.length === 0) return null

  return (
    <section className="section-enter">
      <h2 className="mb-4 font-display text-2xl font-bold text-white sm:text-3xl">{t('shopByCategory')}</h2>
      <div
        className={`grid gap-4 sm:grid-cols-2 ${
          departments.length >= 4 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-2'
        }`}
      >
        {departments.map((dept) => (
          <Link
            key={dept.id}
            to={`/products?department=${encodeURIComponent(dept.id)}`}
            className="group glass-card card-enter overflow-hidden rounded-2xl border-brand/15 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow"
          >
            <div className="relative h-40 overflow-hidden sm:h-44">
              <img
                src={getDepartmentImage(dept)}
                alt={getDepartmentName(dept, isArabic)}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <h3 className="absolute bottom-3 left-3 right-3 font-display text-lg font-bold text-white">
                {getDepartmentName(dept, isArabic)}
              </h3>
            </div>
            <p className="px-4 py-3 text-sm text-text-muted">
              {getDepartmentDescription(dept, isArabic)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}
