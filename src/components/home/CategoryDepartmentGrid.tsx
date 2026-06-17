import { Link } from 'react-router-dom'
import { useI18n } from '../../i18n'
import type { ShopDepartment } from '../../types'
import { SHOP_DEPARTMENTS, getDepartmentImage } from '../../utils/shopDepartments'
import { useSettingsStore } from '../../store/settingsStore'

const DEPARTMENT_TITLE_KEYS: Record<
  ShopDepartment,
  'deptPrebuilt' | 'deptPcParts' | 'deptMonitors' | 'deptLaptops' | 'deptAccessories'
> = {
  prebuilt: 'deptPrebuilt',
  'pc-parts': 'deptPcParts',
  monitors: 'deptMonitors',
  laptops: 'deptLaptops',
  accessories: 'deptAccessories',
}

const DEPARTMENT_DESC_KEYS: Record<
  ShopDepartment,
  | 'deptPrebuiltDesc'
  | 'deptPcPartsDesc'
  | 'deptMonitorsDesc'
  | 'deptLaptopsDesc'
  | 'deptAccessoriesDesc'
> = {
  prebuilt: 'deptPrebuiltDesc',
  'pc-parts': 'deptPcPartsDesc',
  monitors: 'deptMonitorsDesc',
  laptops: 'deptLaptopsDesc',
  accessories: 'deptAccessoriesDesc',
}

export function CategoryDepartmentGrid() {
  const { t } = useI18n()
  const departmentImages = useSettingsStore((s) => s.settings.departmentImages)

  return (
    <section className="section-enter">
      <h2 className="mb-4 font-display text-2xl font-bold text-white sm:text-3xl">{t('shopByCategory')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {SHOP_DEPARTMENTS.map((dept) => (
          <Link
            key={dept}
            to={`/products?department=${dept}`}
            className="group glass-card card-enter overflow-hidden rounded-2xl border-brand/15 transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-glow"
          >
            <div className="relative h-40 overflow-hidden sm:h-44">
              <img
                src={getDepartmentImage(dept, departmentImages)}
                alt={t(DEPARTMENT_TITLE_KEYS[dept])}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <h3 className="absolute bottom-3 left-3 right-3 font-display text-lg font-bold text-white">
                {t(DEPARTMENT_TITLE_KEYS[dept])}
              </h3>
            </div>
            <p className="px-4 py-3 text-sm text-text-muted">{t(DEPARTMENT_DESC_KEYS[dept])}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
