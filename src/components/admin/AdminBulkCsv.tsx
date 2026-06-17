import { Download, ImagePlus, Upload } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { useI18n } from '../../i18n'
import { useProductsStore } from '../../store/productsStore'
import { useSettingsStore } from '../../store/settingsStore'
import type { Product } from '../../types'
import {
  downloadCsv,
  parseProductsCsv,
  productsCsvTemplate,
  productsMissingImages,
  productsToCsv,
} from '../../utils/productCsv'
import { compressImageFile, isStorageQuotaError } from '../../utils/imageUpload'

interface AdminBulkCsvProps {
  onToast: (message: string) => void
}

export function AdminBulkCsv({ onToast }: AdminBulkCsvProps) {
  const { t } = useI18n()
  const products = useProductsStore((s) => s.products)
  const departments = useSettingsStore((s) => s.settings.departments)
  const importProducts = useProductsStore((s) => s.importProducts)
  const updateProduct = useProductsStore((s) => s.updateProduct)
  const csvInputRef = useRef<HTMLInputElement>(null)

  const needsImage = useMemo(() => productsMissingImages(products), [products])

  const handleImportCsv = async (file: File, replace: boolean) => {
    try {
      const text = await file.text()
      const result = parseProductsCsv(text, products, replace ? 'replace' : 'merge', departments)
      importProducts(result.products)
      onToast(
        t('csvImportSummary')
          .replace('{created}', String(result.created))
          .replace('{updated}', String(result.updated))
          .replace('{skipped}', String(result.skipped)),
      )
    } catch (error) {
      onToast(error instanceof Error ? error.message : t('csvImportError'))
    }
  }

  const attachImage = async (product: Product, file: File) => {
    try {
      const imageUrl = await compressImageFile(file)
      const { id, createdAt: _createdAt, ...fields } = product
      updateProduct(id, { ...fields, imageUrl })
      onToast(t('productImageAttached').replace('{name}', product.name))
    } catch (error) {
      if (isStorageQuotaError(error)) {
        onToast(t('imageStorageQuotaError'))
        return
      }
      onToast(error instanceof Error ? error.message : t('imageUploadFailed'))
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-brand/25 bg-brand/5 p-4">
      <div>
        <p className="font-semibold text-white">{t('bulkCsvTitle')}</p>
        <p className="mt-1 text-sm text-text-muted">{t('bulkCsvDesc')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="button-pop inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold"
          onClick={() => downloadCsv('kurdi-products.csv', productsToCsv(products))}
        >
          <Download size={16} />
          {t('exportAllCsv')}
        </button>
        <button
          type="button"
          className="button-pop inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold"
          onClick={() => downloadCsv('kurdi-products-template.csv', productsCsvTemplate())}
        >
          <Download size={16} />
          {t('downloadCsvTemplate')}
        </button>
        <button
          type="button"
          className="button-pop btn-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold"
          onClick={() => csvInputRef.current?.click()}
        >
          <Upload size={16} />
          {t('importCsvMerge')}
        </button>
        <label className="button-pop inline-flex cursor-pointer items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/20">
          <Upload size={16} />
          {t('importCsvReplace')}
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              if (!window.confirm(t('confirmCsvReplace'))) return
              await handleImportCsv(file, true)
            }}
          />
        </label>
        <input
          ref={csvInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            if (!file) return
            await handleImportCsv(file, false)
          }}
        />
      </div>

      <p className="text-xs text-text-muted">{t('bulkCsvSpecsHint')}</p>

      {needsImage.length > 0 && (
        <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/5 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <ImagePlus size={16} />
            {t('attachProductImages')} ({needsImage.length})
          </p>
          <p className="text-xs text-text-muted">{t('attachProductImagesHint')}</p>
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {needsImage.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-2/60 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{product.name}</p>
                  <p className="text-xs text-text-muted">
                    {product.sku ? `SKU: ${product.sku}` : product.id}
                    {' · '}
                    {product.category}
                  </p>
                </div>
                <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-brand/40 bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-light hover:bg-brand/20">
                  <ImagePlus size={14} />
                  {t('uploadImage')}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (!file) return
                      await attachImage(product, file)
                    }}
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
