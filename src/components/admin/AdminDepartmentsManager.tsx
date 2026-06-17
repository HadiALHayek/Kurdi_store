import { useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2 } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { Category, StoreDepartmentConfig } from '../../types'
import { useProductsStore } from '../../store/productsStore'
import { emptyDepartmentDraft, isValidDepartmentId, slugifyDepartmentId, uniqueDepartmentId } from '../../data/defaultDepartments'
import { ALL_STORE_FILTER_CATEGORIES } from '../../utils/adminDepartmentSpecs'
import { productBelongsToDepartment } from '../../utils/shopDepartments'
import { compressImageFile, isStorageQuotaError } from '../../utils/imageUpload'

interface AdminDepartmentsManagerProps {
  departments: StoreDepartmentConfig[]
  onChange: (departments: StoreDepartmentConfig[]) => void
  onToast: (message: string) => void
}

export function AdminDepartmentsManager({ departments, onChange, onToast }: AdminDepartmentsManagerProps) {
  const { t } = useI18n()
  const products = useProductsStore((s) => s.products)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<StoreDepartmentConfig>(() => emptyDepartmentDraft())

  const updateDepartment = (id: string, patch: Partial<StoreDepartmentConfig>) => {
    onChange(departments.map((dept) => (dept.id === id ? { ...dept, ...patch } : dept)))
  }

  const toggleCategory = (id: string, category: Category) => {
    const dept = departments.find((d) => d.id === id)
    if (!dept) return
    const has = dept.categories.includes(category)
    const categories = has ? dept.categories.filter((c) => c !== category) : [...dept.categories, category]
    updateDepartment(id, { categories })
  }

  const countProducts = (dept: StoreDepartmentConfig) =>
    products.filter((p) => productBelongsToDepartment(p, dept)).length

  const deleteDepartment = (dept: StoreDepartmentConfig) => {
    if (departments.length <= 1) {
      onToast(t('cannotDeleteLastCategory'))
      return
    }
    const count = countProducts(dept)
    const message =
      count > 0 ? t('confirmDeleteCategoryWithProducts').replace('{count}', String(count)) : t('confirmDeleteCategory')
    if (!window.confirm(message)) return
    onChange(departments.filter((d) => d.id !== dept.id))
    onToast(t('categoryDeleted'))
  }

  const handleImageUpload = async (id: string, file: File | undefined) => {
    if (!file) return
    try {
      const url = await compressImageFile(file, 960, 0.85)
      updateDepartment(id, { image: url })
      onToast(t('categoryImageUpdated'))
    } catch (error) {
      onToast(isStorageQuotaError(error) ? t('imageStorageQuotaError') : t('categoryImageUploadFailed'))
    }
  }

  const submitNewDepartment = () => {
    const nameEn = draft.nameEn.trim()
    if (!nameEn) {
      onToast(t('categoryNameRequired'))
      return
    }
    if (draft.categories.length === 0) {
      onToast(t('categoryProductsRequired'))
      return
    }
    const baseId = draft.id.trim() || slugifyDepartmentId(nameEn)
    const id = uniqueDepartmentId(baseId, departments.map((d) => d.id))
    if (!isValidDepartmentId(id)) {
      onToast(t('categoryIdInvalid'))
      return
    }
    onChange([
      ...departments,
      {
        ...draft,
        id,
        nameEn,
        nameAr: draft.nameAr.trim() || nameEn,
        descriptionEn: draft.descriptionEn.trim(),
        descriptionAr: draft.descriptionAr.trim(),
      },
    ])
    setDraft(emptyDepartmentDraft())
    setAdding(false)
    onToast(t('categoryAdded'))
  }

  const renderCategoryPicker = (selected: Category[], onToggle: (category: Category) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {ALL_STORE_FILTER_CATEGORIES.map((category) => {
        const active = selected.includes(category)
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              active
                ? 'border-brand bg-brand/20 text-brand-light'
                : 'border-border bg-surface/60 text-text-muted hover:border-brand/40'
            }`}
          >
            {category}
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="mt-6 rounded-xl border border-border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{t('manageCategories')}</p>
          <p className="mt-1 text-sm text-text-muted">{t('manageCategoriesHint')}</p>
        </div>
        <button
          type="button"
          className="btn-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          onClick={() => {
            setAdding((v) => !v)
            setDraft(emptyDepartmentDraft())
          }}
        >
          <Plus size={16} />
          {t('addCategory')}
        </button>
      </div>

      {adding && (
        <div className="mb-4 space-y-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <p className="text-sm font-semibold text-white">{t('newCategory')}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={draft.nameEn}
              onChange={(e) => setDraft({ ...draft, nameEn: e.target.value, id: slugifyDepartmentId(e.target.value) })}
              className="input-field rounded-lg px-3 py-2 text-sm"
              placeholder={t('categoryNameEn')}
            />
            <input
              value={draft.nameAr}
              onChange={(e) => setDraft({ ...draft, nameAr: e.target.value })}
              className="input-field rounded-lg px-3 py-2 text-sm"
              placeholder={t('categoryNameAr')}
            />
            <input
              value={draft.descriptionEn}
              onChange={(e) => setDraft({ ...draft, descriptionEn: e.target.value })}
              className="input-field rounded-lg px-3 py-2 text-sm"
              placeholder={t('categoryDescEn')}
            />
            <input
              value={draft.descriptionAr}
              onChange={(e) => setDraft({ ...draft, descriptionAr: e.target.value })}
              className="input-field rounded-lg px-3 py-2 text-sm"
              placeholder={t('categoryDescAr')}
            />
            <input
              value={draft.id}
              onChange={(e) => setDraft({ ...draft, id: slugifyDepartmentId(e.target.value) })}
              className="input-field rounded-lg px-3 py-2 text-sm sm:col-span-2"
              placeholder={t('categoryIdHint')}
            />
            <input
              value={draft.image}
              onChange={(e) => setDraft({ ...draft, image: e.target.value })}
              className="input-field rounded-lg px-3 py-2 text-sm sm:col-span-2"
              placeholder={t('categoryImageUrl')}
            />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{t('categoryProducts')}</p>
            {renderCategoryPicker(draft.categories, (category) => {
              const has = draft.categories.includes(category)
              setDraft({
                ...draft,
                categories: has
                  ? draft.categories.filter((c) => c !== category)
                  : [...draft.categories, category],
              })
            })}
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold" onClick={submitNewDepartment}>
              {t('addCategory')}
            </button>
            <button type="button" className="btn-ghost rounded-lg px-4 py-2 text-sm font-semibold" onClick={() => setAdding(false)}>
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.id} className="overflow-hidden rounded-xl border border-border bg-surface-2/60">
            <div className="relative h-32 overflow-hidden">
              <img src={dept.image} alt={dept.nameEn} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                <p className="text-sm font-semibold text-white">{dept.nameEn}</p>
                <span className="text-xs text-text-muted">{countProducts(dept)} {t('products').toLowerCase()}</span>
              </div>
            </div>
            <div className="space-y-3 p-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={dept.nameEn}
                  onChange={(e) => updateDepartment(dept.id, { nameEn: e.target.value })}
                  className="input-field rounded-lg px-2.5 py-2 text-xs"
                  placeholder={t('categoryNameEn')}
                />
                <input
                  value={dept.nameAr}
                  onChange={(e) => updateDepartment(dept.id, { nameAr: e.target.value })}
                  className="input-field rounded-lg px-2.5 py-2 text-xs"
                  placeholder={t('categoryNameAr')}
                />
                <input
                  value={dept.descriptionEn}
                  onChange={(e) => updateDepartment(dept.id, { descriptionEn: e.target.value })}
                  className="input-field rounded-lg px-2.5 py-2 text-xs"
                  placeholder={t('categoryDescEn')}
                />
                <input
                  value={dept.descriptionAr}
                  onChange={(e) => updateDepartment(dept.id, { descriptionAr: e.target.value })}
                  className="input-field rounded-lg px-2.5 py-2 text-xs"
                  placeholder={t('categoryDescAr')}
                />
                <input
                  value={dept.image}
                  onChange={(e) => updateDepartment(dept.id, { image: e.target.value })}
                  className="input-field rounded-lg px-2.5 py-2 text-xs sm:col-span-2"
                  placeholder={t('categoryImageUrl')}
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">{t('categoryProducts')}</p>
                {renderCategoryPicker(dept.categories, (category) => toggleCategory(dept.id, category))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  onClick={() => fileInputs.current[dept.id]?.click()}
                >
                  <ImagePlus size={14} />
                  {t('uploadCategoryImage')}
                </button>
                <button
                  type="button"
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-danger"
                  onClick={() => deleteDepartment(dept)}
                >
                  <Trash2 size={14} />
                  {t('deleteCategory')}
                </button>
                <input
                  ref={(el) => {
                    fileInputs.current[dept.id] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    void handleImageUpload(dept.id, e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
