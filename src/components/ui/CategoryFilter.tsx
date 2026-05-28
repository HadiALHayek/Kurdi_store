import type { Category } from '../../types'
import { useI18n } from '../../i18n'

const categories: Array<Category | 'All'> = [
  'All',
  'Prebuilt PC',
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

interface CategoryFilterProps {
  value: Category | 'All'
  onChange: (value: Category | 'All') => void
  vertical?: boolean
  responsive?: boolean
}

export function CategoryFilter({
  value,
  onChange,
  vertical = false,
  responsive = false,
}: CategoryFilterProps) {
  const { t } = useI18n()

  const layoutClass = responsive
    ? 'no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0'
    : vertical
      ? 'flex flex-col gap-2'
      : 'no-scrollbar flex gap-2 overflow-x-auto pb-1'

  return (
    <div className={layoutClass}>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`chip shrink-0 px-4 py-2 text-sm font-medium ${
            value === category ? 'chip-active text-brand-light' : 'text-text-muted hover:text-brand-light'
          }`}
        >
          {category === 'All' ? t('all') : category}
        </button>
      ))}
    </div>
  )
}
