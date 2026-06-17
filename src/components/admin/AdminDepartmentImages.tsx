import { useRef } from 'react'
import { ImagePlus, RotateCcw } from 'lucide-react'
import { useI18n } from '../../i18n'
import type { ShopDepartment } from '../../types'
import {
  DEFAULT_DEPARTMENT_IMAGES,
  SHOP_DEPARTMENTS,
  getDepartmentImage,
} from '../../utils/shopDepartments'
import { compressImageFile, isStorageQuotaError } from '../../utils/imageUpload'

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

interface AdminDepartmentImagesProps {
  images: Partial<Record<ShopDepartment, string>>
  onChange: (images: Partial<Record<ShopDepartment, string>>) => void
  onToast: (message: string) => void
}

export function AdminDepartmentImages({ images, onChange, onToast }: AdminDepartmentImagesProps) {
  const { t } = useI18n()
  const fileInputs = useRef<Partial<Record<ShopDepartment, HTMLInputElement | null>>>({})

  const setImage = (department: ShopDepartment, url: string) => {
    onChange({ ...images, [department]: url })
  }

  const resetImage = (department: ShopDepartment) => {
    const next = { ...images }
    delete next[department]
    onChange(next)
  }

  const handleFile = async (department: ShopDepartment, file: File | undefined) => {
    if (!file) return
    try {
      const url = await compressImageFile(file, 960, 0.85)
      setImage(department, url)
      onToast(t('categoryImageUpdated'))
    } catch (error) {
      if (isStorageQuotaError(error)) {
        onToast(t('imageStorageQuotaError'))
      } else {
        onToast(t('categoryImageUploadFailed'))
      }
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-border p-4">
      <p className="mb-1 font-semibold text-white">{t('categoryImages')}</p>
      <p className="mb-4 text-sm text-text-muted">{t('categoryImagesHint')}</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SHOP_DEPARTMENTS.map((department) => {
          const preview = getDepartmentImage(department, images)
          const isCustom = Boolean(images[department]?.trim())
          return (
            <div key={department} className="overflow-hidden rounded-xl border border-border bg-surface-2/60">
              <div className="relative h-32 overflow-hidden">
                <img src={preview} alt={t(DEPARTMENT_TITLE_KEYS[department])} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-transparent" />
                <p className="absolute bottom-2 left-3 text-sm font-semibold text-white">
                  {t(DEPARTMENT_TITLE_KEYS[department])}
                </p>
              </div>
              <div className="space-y-2 p-3">
                <input
                  value={images[department] ?? ''}
                  onChange={(event) => setImage(department, event.target.value)}
                  className="input-field w-full rounded-lg px-2.5 py-2 text-xs"
                  placeholder={DEFAULT_DEPARTMENT_IMAGES[department]}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                    onClick={() => fileInputs.current[department]?.click()}
                  >
                    <ImagePlus size={14} />
                    {t('uploadCategoryImage')}
                  </button>
                  {isCustom && (
                    <button
                      type="button"
                      className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-muted"
                      onClick={() => resetImage(department)}
                    >
                      <RotateCcw size={14} />
                      {t('resetCategoryImage')}
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileInputs.current[department] = el
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    void handleFile(department, event.target.files?.[0])
                    event.target.value = ''
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
