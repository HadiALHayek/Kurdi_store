import type { UseCaseTag } from '../../types'
import { USE_CASE_OPTIONS } from '../../utils/useCaseTags'
import { useI18n } from '../../i18n'

interface UseCaseFilterProps {
  selected: UseCaseTag[]
  onChange: (tags: UseCaseTag[]) => void
}

export function UseCaseFilter({ selected, onChange }: UseCaseFilterProps) {
  const { t } = useI18n()

  const toggle = (tag: UseCaseTag) => {
    onChange(selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag])
  }

  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand">{t('useCaseFilter')}</p>
      <div className="flex flex-wrap gap-1.5">
        {USE_CASE_OPTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`chip px-2 py-1 text-xs capitalize ${selected.includes(tag) ? 'chip-active' : ''}`}
          >
            {t(`useCase_${tag}` as 'useCase_gaming')}
          </button>
        ))}
      </div>
    </div>
  )
}
