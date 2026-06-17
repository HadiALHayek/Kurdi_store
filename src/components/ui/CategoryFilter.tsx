import type { Category } from '../../types'
import { useI18n } from '../../i18n'
import { ALL_STORE_FILTER_CATEGORIES } from '../../utils/adminDepartmentSpecs'

const defaultCategories: Array<Category | 'All'> = ['All', ...ALL_STORE_FILTER_CATEGORIES]

interface CategoryFilterProps {
  value: Category | 'All'
  onChange: (value: Category | 'All') => void
  categories?: Array<Category | 'All'>
  vertical?: boolean
  responsive?: boolean
}

export function CategoryFilter({
  value,
  onChange,
  categories = defaultCategories,
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
