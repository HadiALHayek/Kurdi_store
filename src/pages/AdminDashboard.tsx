import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Navigate } from 'react-router-dom'
import { AdminBulkCsv } from '../components/admin/AdminBulkCsv'
import { AdminDepartmentImages } from '../components/admin/AdminDepartmentImages'
import { AdminChangePassword } from '../components/admin/AdminChangePassword'
import { AdminCustomers } from '../components/admin/AdminCustomers'
import { PrebuiltSpecsEditor } from '../components/admin/PrebuiltSpecsEditor'
import { AdminLayout } from '../components/layout/AdminLayout'
import { isAdminSessionValid } from '../utils/adminAuth'
import { Modal } from '../components/ui/Modal'
import { useI18n } from '../i18n'
import { useAnalyticsStore } from '../store/analyticsStore'
import { useBundlesStore } from '../store/bundlesStore'
import { useBuildTemplatesStore } from '../store/buildTemplatesStore'
import { useProductsStore } from '../store/productsStore'
import { useSettingsStore } from '../store/settingsStore'
import type { Category, Product, ShopDepartment } from '../types'
import { formatPrice } from '../utils/compatibility'
import { downloadCsv, parseProductsCsv, productsToCsv } from '../utils/productCsv'
import { compressImageFile } from '../utils/imageUpload'
import { addSpecValue, getSpecKeys, getSpecValues, removeSpecValue } from '../utils/productSpecs'
import {
  categoriesForDepartment,
  defaultCategoryForDepartment,
  getAdminSpecConfig,
  inferDepartmentFromProduct,
} from '../utils/adminDepartmentSpecs'
import { SHOP_DEPARTMENTS } from '../utils/shopDepartments'

type View = 'products' | 'add' | 'analytics' | 'customers' | 'settings'

const DEPT_LABEL_KEY: Record<
  ShopDepartment,
  'deptPrebuilt' | 'deptPcParts' | 'deptMonitors' | 'deptLaptops' | 'deptAccessories'
> = {
  prebuilt: 'deptPrebuilt',
  'pc-parts': 'deptPcParts',
  monitors: 'deptMonitors',
  laptops: 'deptLaptops',
  accessories: 'deptAccessories',
}

const DEPT_SPECS_HINT_KEY: Record<
  ShopDepartment,
  'specsHintPrebuilt' | 'specsHintPcParts' | 'specsHintMonitors' | 'specsHintLaptops' | 'specsHintAccessories'
> = {
  prebuilt: 'specsHintPrebuilt',
  'pc-parts': 'specsHintPcParts',
  monitors: 'specsHintMonitors',
  laptops: 'specsHintLaptops',
  accessories: 'specsHintAccessories',
}

const emptyDraft = {
  name: '',
  description: '',
  price: 0,
  previousPrice: undefined as number | undefined,
  category: 'CPU' as Category,
  department: 'pc-parts' as ShopDepartment,
  imageUrl: '',
  imageUrls: [] as string[],
  stock: 0,
  sku: '',
  staffPick: false,
  discontinued: false,
  allowBackorder: false,
  staffNotes: '',
  instagramPostUrl: '',
  seoTitle: '',
  seoDescription: '',
  useCaseTags: [] as Product['useCaseTags'],
  specs: {} as Record<string, string>,
}

export function AdminDashboard() {
  const { t } = useI18n()
  const [authReady, setAuthReady] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(isAdminSessionValid())
    setAuthReady(true)
  }, [])
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    importProducts,
    exportProducts,
    clearAllProducts,
  } = useProductsStore()
  const analyticsEvents = useAnalyticsStore((s) => s.events)
  const exportAnalyticsCsv = useAnalyticsStore((s) => s.exportCsv)
  const clearAnalytics = useAnalyticsStore((s) => s.clear)
  const [view, setView] = useState<View>('products')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name')
  const [editing, setEditing] = useState<Product | null>(null)
  const [draft, setDraft] = useState(emptyDraft)
  const [toast, setToast] = useState('')
  const settingsState = useSettingsStore((state) => state.settings)
  const updateSettings = useSettingsStore((state) => state.updateSettings)
  const resetSettings = useSettingsStore((state) => state.resetSettings)
  const [settingsDraft, setSettingsDraft] = useState(settingsState)
  const templates = useBuildTemplatesStore((s) => s.templates)
  const addTemplate = useBuildTemplatesStore((s) => s.add)
  const removeTemplate = useBuildTemplatesStore((s) => s.remove)
  const bundles = useBundlesStore((s) => s.bundles)
  const addBundle = useBundlesStore((s) => s.add)
  const removeBundle = useBundlesStore((s) => s.remove)
  const [tplName, setTplName] = useState('')
  const [tplDesc, setTplDesc] = useState('')
  const [tplParts, setTplParts] = useState('CPU: cpu-7800x3d\nGPU: gpu-4070')
  const [bndName, setBndName] = useState('')
  const [bndIds, setBndIds] = useState('')
  const [bndLabel, setBndLabel] = useState('')

  const filtered = useMemo(() => {
    const searched = products.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase()),
    )
    return [...searched].sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      return String(a[sortBy]).localeCompare(String(b[sortBy]))
    })
  }, [products, search, sortBy])

  const saveDraft = () => {
    if (!draft.name || !draft.description || !draft.imageUrl || draft.price <= 0 || draft.stock < 0) return
    addProduct(draft)
    setDraft(emptyDraft)
    setToast(t('productSaved'))
    setTimeout(() => setToast(''), 1800)
    setView('products')
  }

  const inventoryValue = products.reduce((acc, item) => acc + item.price * item.stock, 0)

  if (!authReady) return null
  if (!authed) return <Navigate to="/admin" replace />

  return (
    <>
      <AdminLayout active={view} onNavigate={setView}>
        {view === 'products' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input-field rounded-xl px-3 py-2.5"
                placeholder={t('searchByNameCategory')}
              />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as 'name' | 'price' | 'category')}
                className="input-field rounded-xl px-3 py-2.5"
              >
                <option value="name">{t('sortByName')}</option>
                <option value="price">{t('sortByPrice')}</option>
                <option value="category">{t('sortByCategory')}</option>
              </select>
              <button
                type="button"
                className="chip px-3 py-2 text-sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(exportProducts(), null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'kurdi-products.json'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                {t('exportJson')}
              </button>
              <label className="chip cursor-pointer px-3 py-2 text-sm">
                {t('importJson')}
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const text = await file.text()
                    const parsed = JSON.parse(text) as Product[]
                    if (Array.isArray(parsed)) importProducts(parsed)
                  }}
                />
              </label>
              <button
                type="button"
                className="chip px-3 py-2 text-sm"
                onClick={() => downloadCsv('kurdi-products.csv', productsToCsv(products))}
              >
                {t('exportCsv')}
              </button>
              <label className="chip cursor-pointer px-3 py-2 text-sm">
                {t('importCsv')}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      const text = await file.text()
                      const result = parseProductsCsv(text, products, 'merge')
                      importProducts(result.products)
                      setToast(
                        t('csvImportSummary')
                          .replace('{created}', String(result.created))
                          .replace('{updated}', String(result.updated))
                          .replace('{skipped}', String(result.skipped)),
                      )
                    } catch {
                      setToast('CSV error')
                    }
                    setTimeout(() => setToast(''), 2000)
                  }}
                />
              </label>
              <button
                type="button"
                className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger hover:bg-danger/20"
                onClick={() => {
                  if (window.confirm(t('confirmClearAllProducts'))) {
                    clearAllProducts()
                    setToast(t('allProductsCleared'))
                    setTimeout(() => setToast(''), 2000)
                  }
                }}
              >
                {t('clearAllProducts')}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-text-muted">
                  <tr>
                    <th className="py-2">{t('image')}</th>
                    <th>{t('name')}</th>
                    <th>{t('category')}</th>
                    <th>{t('price')}</th>
                    <th>{t('stock')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="table-row-enter border-t border-border/60 transition-colors hover:bg-accent/5"
                    >
                      <td className="py-2">
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-16 rounded object-cover" />
                      </td>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>{formatPrice(product.price)}</td>
                      <td>
                        <span className={product.stock <= settingsDraft.lowStockThreshold ? 'font-semibold text-danger' : ''}>
                          {product.stock}
                          {product.stock <= settingsDraft.lowStockThreshold && product.stock > 0 && (
                            <span className="ml-1 text-xs">({t('lowStockAlert')})</span>
                          )}
                        </span>
                      </td>
                      <td className="space-x-2">
                        <button
                          type="button"
                          className="button-pop text-accent"
                          onClick={() =>
                            setEditing({
                              ...product,
                              department: inferDepartmentFromProduct(product),
                            })
                          }
                        >
                          {t('edit')}
                        </button>
                        <button type="button" className="button-pop text-brand-cyan" onClick={() => duplicateProduct(product.id)}>
                          {t('duplicate')}
                        </button>
                        <button
                          type="button"
                          className="button-pop text-danger"
                          onClick={() => window.confirm(t('confirmDelete')) && deleteProduct(product.id)}
                        >
                          {t('delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'add' && (
          <div className="space-y-6">
            <AdminBulkCsv onToast={(message) => {
              setToast(message)
              setTimeout(() => setToast(''), 2800)
            }} />
            <ProductForm
              draft={draft}
              setDraft={setDraft}
              onSubmit={saveDraft}
              submitLabel={t('saveProduct')}
            />
          </div>
        )}

        {view === 'customers' && (
          <AdminCustomers
            onToast={(message) => {
              setToast(message)
              setTimeout(() => setToast(''), 2200)
            }}
          />
        )}

        {view === 'analytics' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="panel-elevated rounded-xl p-4">
                <p className="text-sm text-text-muted">{t('totalProducts')}</p>
                <p className="font-display text-2xl text-white">{products.length}</p>
              </div>
              <div className="panel-elevated rounded-xl p-4">
                <p className="text-sm text-text-muted">{t('inventoryValue')}</p>
                <p className="font-display text-2xl text-white">{formatPrice(inventoryValue)}</p>
              </div>
              <div className="panel-elevated rounded-xl p-4">
                <p className="text-sm text-text-muted">{t('analyticsEvents')}</p>
                <p className="font-display text-2xl text-white">{analyticsEvents.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary rounded-lg px-4 py-2 text-sm"
                onClick={() => {
                  const blob = new Blob([exportAnalyticsCsv()], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'kurdi-analytics.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                {t('exportAnalytics')}
              </button>
              <button type="button" className="chip px-4 py-2 text-sm" onClick={clearAnalytics}>
                {t('clearAnalytics')}
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted">
                    <th className="p-2">{t('eventTime')}</th>
                    <th className="p-2">{t('eventType')}</th>
                    <th className="p-2">payload</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analyticsEvents].reverse().slice(0, 100).map((evt) => (
                    <tr key={evt.id} className="border-b border-border/40">
                      <td className="p-2 whitespace-nowrap">{new Date(evt.at).toLocaleString()}</td>
                      <td className="p-2">{evt.type}</td>
                      <td className="p-2 text-text-muted">{JSON.stringify(evt.payload)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="space-y-3">
            <AdminChangePassword
              onSuccess={(message) => {
                setToast(message)
                setTimeout(() => setToast(''), 2200)
              }}
            />

            <input
              value={settingsDraft.instagramHandle}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, instagramHandle: event.target.value }))
              }
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder={t('instagramHandle')}
            />
            <input
              value={settingsDraft.instagramUrl}
              onChange={(event) => setSettingsDraft((prev) => ({ ...prev, instagramUrl: event.target.value }))}
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder={t('instagramProfileUrl')}
            />
            <div className="space-y-1">
              <label className="text-sm text-text-muted">{t('googleMapsEmbedUrl')}</label>
              <textarea
                value={settingsDraft.googleMapsEmbedUrl}
                onChange={(event) =>
                  setSettingsDraft((prev) => ({ ...prev, googleMapsEmbedUrl: event.target.value }))
                }
                className="input-field min-h-24 w-full rounded-xl px-3 py-2.5"
                placeholder="https://www.google.com/maps/place/... or https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-text-muted">{t('googleMapsEmbedHint')}</p>
            </div>
            <input
              value={settingsDraft.address}
              onChange={(event) => setSettingsDraft((prev) => ({ ...prev, address: event.target.value }))}
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder={t('storeAddress')}
            />
            <input
              value={settingsDraft.workingHours}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, workingHours: event.target.value }))
              }
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder={t('workingHours')}
            />
            <input
              value={settingsDraft.phone}
              onChange={(event) => setSettingsDraft((prev) => ({ ...prev, phone: event.target.value }))}
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder={t('phoneNumber')}
            />
            <label className="text-sm text-text-muted">{t('lowStockThreshold')}</label>
            <input
              type="number"
              min={0}
              value={settingsDraft.lowStockThreshold}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, lowStockThreshold: Number(event.target.value) }))
              }
              className="input-field w-full rounded-xl px-3 py-2.5"
            />
            <label className="text-sm text-text-muted">{t('assemblyNote')}</label>
            <input
              value={settingsDraft.assemblyNote}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, assemblyNote: event.target.value }))
              }
              className="input-field w-full rounded-xl px-3 py-2.5"
            />
            <label className="text-sm text-text-muted">{t('backorderLeadDays')}</label>
            <input
              value={settingsDraft.backorderLeadDays}
              onChange={(event) =>
                setSettingsDraft((prev) => ({ ...prev, backorderLeadDays: event.target.value }))
              }
              className="input-field w-full rounded-xl px-3 py-2.5"
              placeholder="2-3"
            />

            <AdminDepartmentImages
              images={settingsDraft.departmentImages ?? {}}
              onChange={(departmentImages) => setSettingsDraft((prev) => ({ ...prev, departmentImages }))}
              onToast={(message) => {
                setToast(message)
                setTimeout(() => setToast(''), 2200)
              }}
            />

            <div className="mt-6 rounded-xl border border-border p-4">
              <p className="mb-3 font-semibold text-white">{t('buildTemplatesAdmin')}</p>
              <input
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t('templateName')}
              />
              <input
                value={tplDesc}
                onChange={(e) => setTplDesc(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t('templateDesc')}
              />
              <textarea
                value={tplParts}
                onChange={(e) => setTplParts(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 font-mono text-xs"
                rows={4}
                placeholder="CPU: cpu-id"
              />
              <button
                type="button"
                className="btn-primary mb-3 rounded-lg px-3 py-1.5 text-sm"
                onClick={() => {
                  const parts: Partial<Record<Category, string>> = {}
                  for (const line of tplParts.split('\n')) {
                    const [slot, id] = line.split(':').map((s) => s.trim())
                    if (slot && id) parts[slot as Category] = id
                  }
                  addTemplate({ name: tplName || 'Template', description: tplDesc, parts })
                  setTplName('')
                  setTplDesc('')
                }}
              >
                {t('addTemplate')}
              </button>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">
                {templates.map((tpl) => (
                  <li key={tpl.id} className="flex justify-between gap-2 rounded bg-surface-2 px-2 py-1">
                    <span>{tpl.name}</span>
                    <button type="button" className="text-danger" onClick={() => removeTemplate(tpl.id)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border p-4">
              <p className="mb-3 font-semibold text-white">{t('bundlesAdmin')}</p>
              <input
                value={bndName}
                onChange={(e) => setBndName(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t('bundleName')}
              />
              <input
                value={bndIds}
                onChange={(e) => setBndIds(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
                placeholder="cpu-id, mb-id, ram-id"
              />
              <input
                value={bndLabel}
                onChange={(e) => setBndLabel(e.target.value)}
                className="input-field mb-2 w-full rounded-lg px-3 py-2 text-sm"
                placeholder={t('bundleDiscount')}
              />
              <button
                type="button"
                className="btn-primary mb-3 rounded-lg px-3 py-1.5 text-sm"
                onClick={() => {
                  addBundle({
                    name: bndName || 'Bundle',
                    productIds: bndIds.split(',').map((s) => s.trim()).filter(Boolean),
                    discountLabel: bndLabel || undefined,
                  })
                  setBndName('')
                  setBndIds('')
                  setBndLabel('')
                }}
              >
                {t('addBundle')}
              </button>
              <ul className="max-h-32 space-y-1 overflow-y-auto text-sm">
                {bundles.map((b) => (
                  <li key={b.id} className="flex justify-between gap-2 rounded bg-surface-2 px-2 py-1">
                    <span>{b.name}</span>
                    <button type="button" className="text-danger" onClick={() => removeBundle(b.id)}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-text-muted">{t('instagramApiNote')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="button-pop btn-primary rounded-xl px-4 py-2.5 font-semibold"
                onClick={() => {
                  updateSettings(settingsDraft)
                  setToast(t('settingsSaved'))
                  setTimeout(() => setToast(''), 1800)
                }}
              >
                {t('saveSettings')}
              </button>
              <button
                type="button"
                className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20"
                onClick={() => {
                  if (window.confirm(t('confirmResetStoreSettings'))) {
                    resetSettings()
                    setSettingsDraft(useSettingsStore.getState().settings)
                    setToast(t('settingsResetDone'))
                    setTimeout(() => setToast(''), 2000)
                  }
                }}
              >
                {t('resetStoreSettings')}
              </button>
            </div>
          </div>
        )}
      </AdminLayout>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={t('editProduct')}>
        {editing && (
          <ProductForm
            draft={editing}
            setDraft={(next) => setEditing((current) => (current ? { ...current, ...next } : current))}
            submitLabel={t('updateProduct')}
            excludeProductId={editing.id}
            onSubmit={() => {
              updateProduct(editing.id, {
                name: editing.name,
                description: editing.description,
                price: editing.price,
                previousPrice: editing.previousPrice,
                category: editing.category,
                department: editing.department,
                imageUrl: editing.imageUrl,
                imageUrls: editing.imageUrls,
                specs: editing.specs,
                stock: editing.stock,
                sku: editing.sku,
                staffPick: editing.staffPick,
                discontinued: editing.discontinued,
                allowBackorder: editing.allowBackorder,
                staffNotes: editing.staffNotes,
                instagramPostUrl: editing.instagramPostUrl,
                seoTitle: editing.seoTitle,
                seoDescription: editing.seoDescription,
                useCaseTags: editing.useCaseTags,
              })
              setToast(t('productUpdated'))
              setEditing(null)
            }}
          />
        )}
      </Modal>
      {toast && (
        <div className="fixed bottom-4 right-4 rounded-xl border border-success/40 bg-success px-4 py-2.5 font-semibold text-[#041210] shadow-glow animate-fade-up">
          {toast}
        </div>
      )}
    </>
  )
}

interface ProductFormProps<T extends { specs: Product['specs'] }> {
  draft: T
  setDraft: (next: T) => void
  onSubmit: () => void
  submitLabel: string
  excludeProductId?: string
}

function FormFieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  const { t } = useI18n()
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-sm text-text-muted">
      {children}
      {required && (
        <span className="rounded-md border border-danger/35 bg-danger/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-danger">
          {t('required')}
        </span>
      )}
    </span>
  )
}

function ProductForm<T extends Omit<Product, 'id' | 'createdAt'>>({
  draft,
  setDraft,
  onSubmit,
  submitLabel,
  excludeProductId,
}: ProductFormProps<T>) {
  const { t } = useI18n()
  const storeProducts = useProductsStore((state) => state.products)
  const department = draft.department ?? 'pc-parts'
  const departmentCategories = categoriesForDepartment(department)
  const safeCategory = departmentCategories.includes(draft.category)
    ? draft.category
    : departmentCategories[0]
  const specConfig = getAdminSpecConfig(department, safeCategory)
  const [specKey, setSpecKey] = useState(specConfig.specKeys[0] ?? 'socket')
  const [specValue, setSpecValue] = useState(specConfig.valueOptionsByKey[specKey]?.[0] ?? '')
  const activeSpecKeys = [...specConfig.specKeys]
  const safeSpecKey = activeSpecKeys.includes(specKey) ? specKey : activeSpecKeys[0]
  const valueOptions = specConfig.valueOptionsByKey[safeSpecKey] ?? []
  const safeSpecValue = valueOptions.includes(specValue) ? specValue : valueOptions[0] ?? ''

  const changeDepartment = (nextDepartment: ShopDepartment) => {
    const nextCategory = defaultCategoryForDepartment(nextDepartment)
    const nextConfig = getAdminSpecConfig(nextDepartment, nextCategory)
    const nextKey = nextConfig.specKeys[0] ?? ''
    setDraft({ ...draft, department: nextDepartment, category: nextCategory, specs: {} })
    setSpecKey(nextKey)
    setSpecValue(nextConfig.valueOptionsByKey[nextKey]?.[0] ?? '')
  }

  const changeCategory = (nextCategory: Category) => {
    const nextConfig = getAdminSpecConfig(department, nextCategory)
    const nextKey = nextConfig.specKeys[0] ?? ''
    setDraft({ ...draft, category: nextCategory })
    setSpecKey(nextKey)
    setSpecValue(nextConfig.valueOptionsByKey[nextKey]?.[0] ?? '')
  }

  const toBase64 = async (file: File) => compressImageFile(file)

  return (
    <div className="space-y-3">
      <p className="rounded-md border border-accent/25 bg-accent/10 px-3 py-2 text-sm text-text-muted">
        {t('productFormIntro')}
      </p>

      <div className="space-y-1">
        <label className="block">
          <FormFieldLabel required>{t('productName')}</FormFieldLabel>
        </label>
        <input
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
          className="input-field w-full rounded-xl px-3 py-2.5"
          placeholder={t('productName')}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block">
          <FormFieldLabel required>{t('fieldDepartment')}</FormFieldLabel>
        </label>
        <select
          value={department}
          onChange={(event) => changeDepartment(event.target.value as ShopDepartment)}
          className="input-field w-full rounded-xl px-3 py-2.5"
          required
        >
          {SHOP_DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>
              {t(DEPT_LABEL_KEY[dept])}
            </option>
          ))}
        </select>
        <p className="text-xs text-text-muted">{t('fieldDepartmentAddHint')}</p>
      </div>

      <div className="space-y-1">
        <label className="block">
          <FormFieldLabel required>{t('fieldCategory')}</FormFieldLabel>
        </label>
        <DropdownSelect
          options={departmentCategories}
          value={safeCategory}
          onChange={(value) => changeCategory(value as Category)}
        />
        <p className="text-xs text-text-muted">{t('fieldCategoryHint')}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block">
            <FormFieldLabel required>{t('fieldPriceUsd')}</FormFieldLabel>
          </label>
          <input
            type="number"
            value={draft.price}
            onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })}
            className="input-field w-full rounded-xl px-3 py-2.5"
            placeholder={t('price')}
            min={0.01}
            step="0.01"
            required
          />
          <p className="text-xs text-text-muted">{t('fieldPriceHint')}</p>
        </div>
        <div className="space-y-1">
          <label className="block">
            <FormFieldLabel required>{t('fieldStockQty')}</FormFieldLabel>
          </label>
          <input
            type="number"
            value={draft.stock}
            onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })}
            className="input-field w-full rounded-xl px-3 py-2.5"
            placeholder={t('stock')}
            min={0}
            step="1"
            required
          />
          <p className="text-xs text-text-muted">{t('fieldStockHint')}</p>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean(draft.staffPick)}
          onChange={(event) => setDraft({ ...draft, staffPick: event.target.checked })}
          className="accent-brand"
        />
        {t('staffPick')}
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean((draft as unknown as Product).discontinued)}
          onChange={(event) => setDraft({ ...draft, discontinued: event.target.checked } as T)}
        />
        {t('discontinued')}
      </label>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={Boolean((draft as unknown as Product).allowBackorder)}
          onChange={(event) => setDraft({ ...draft, allowBackorder: event.target.checked } as T)}
        />
        {t('allowBackorder')}
      </label>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm text-text-muted">{t('fieldSku')}</label>
          <input
            value={(draft as unknown as Product).sku ?? ''}
            onChange={(event) => setDraft({ ...draft, sku: event.target.value } as T)}
            className="input-field w-full rounded-xl px-3 py-2.5"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-text-muted">{t('fieldPreviousPrice')}</label>
          <input
            type="number"
            min={0}
            value={(draft as unknown as Product).previousPrice ?? ''}
            onChange={(event) =>
              setDraft({
                ...draft,
                previousPrice: event.target.value ? Number(event.target.value) : undefined,
              } as T)
            }
            className="input-field w-full rounded-xl px-3 py-2.5"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted">{t('fieldInstagramPost')}</label>
        <input
          value={(draft as unknown as Product).instagramPostUrl ?? ''}
          onChange={(event) => setDraft({ ...draft, instagramPostUrl: event.target.value } as T)}
          className="input-field w-full rounded-xl px-3 py-2.5"
          placeholder="https://www.instagram.com/p/..."
        />
      </div>

      <div className="space-y-1 rounded-xl border border-dashed border-warning/40 bg-warning/5 p-3">
        <label className="text-sm text-text-muted">{t('staffNotesInternal')}</label>
        <textarea
          value={(draft as unknown as Product).staffNotes ?? ''}
          onChange={(event) => setDraft({ ...draft, staffNotes: event.target.value } as T)}
          className="input-field w-full rounded-xl px-3 py-2.5 text-sm"
          rows={2}
        />
        <p className="text-xs text-text-muted">{t('staffNotesHint')}</p>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-text-muted">{t('fieldSeoTitle')}</label>
        <input
          value={(draft as unknown as Product).seoTitle ?? ''}
          onChange={(event) => setDraft({ ...draft, seoTitle: event.target.value } as T)}
          className="input-field w-full rounded-xl px-3 py-2.5"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-text-muted">{t('fieldSeoDescription')}</label>
        <textarea
          value={(draft as unknown as Product).seoDescription ?? ''}
          onChange={(event) => setDraft({ ...draft, seoDescription: event.target.value } as T)}
          className="input-field w-full rounded-xl px-3 py-2.5"
          rows={2}
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-text-muted">{t('fieldUseCaseTags')}</label>
        <input
          value={((draft as unknown as Product).useCaseTags ?? []).join(', ')}
          onChange={(event) =>
            setDraft({
              ...draft,
              useCaseTags: event.target.value.split(',').map((s) => s.trim()).filter(Boolean) as Product['useCaseTags'],
            } as T)
          }
          className="input-field w-full rounded-xl px-3 py-2.5"
          placeholder="gaming, 1080p, office"
        />
      </div>

      <div className="space-y-1">
        <label className="block">
          <FormFieldLabel required>{t('description')}</FormFieldLabel>
        </label>
        <textarea
          value={draft.description}
          onChange={(event) => setDraft({ ...draft, description: event.target.value })}
          className="input-field w-full rounded-xl px-3 py-2.5"
          placeholder={t('description')}
          required
        />
        <p className="text-xs text-text-muted">{t('fieldDescriptionHint')}</p>
      </div>

      <div className="space-y-1">
        <FormFieldLabel required>{t('fieldImage')}</FormFieldLabel>
        <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-accent/40 bg-surface-2 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10">
          Browse Image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const imageUrl = await toBase64(file)
              setDraft({ ...draft, imageUrl })
            }}
          />
        </label>
        <p className="text-xs text-text-muted">{t('fieldImageHint')}</p>
      </div>

      {draft.imageUrl ? (
        <p className="text-xs text-success">{t('imageSelected')}</p>
      ) : (
        <p className="text-xs text-danger/90">{t('imageRequiredHint')}</p>
      )}

      <div className="space-y-1">
        <label className="text-sm text-text-muted">{t('fieldExtraImages')}</label>
        <label className="inline-flex cursor-pointer items-center rounded-md border border-accent/40 bg-surface-2 px-3 py-1.5 text-xs font-semibold text-accent">
          {t('addGalleryImage')}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              const url = await toBase64(file)
              const current = (draft as unknown as Product).imageUrls ?? []
              setDraft({ ...draft, imageUrls: [...current, url] } as T)
            }}
          />
        </label>
        <textarea
          value={((draft as unknown as Product).imageUrls ?? []).join('\n')}
          onChange={(event) =>
            setDraft({
              ...draft,
              imageUrls: event.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
            } as T)
          }
          className="input-field min-h-20 w-full rounded-xl px-3 py-2 font-mono text-xs"
          placeholder="One image URL per line"
        />
      </div>
      <div className="space-y-2 rounded-xl border border-border bg-surface-2/40 p-4">
        <FormFieldLabel required>
          <span className="text-sm text-white">{t('fieldSpecs')}</span>
        </FormFieldLabel>
        <p className="text-sm text-text-muted">{t(DEPT_SPECS_HINT_KEY[department])}</p>
        <p className="text-xs text-text-muted">{t('fieldSpecsHint')}</p>
        {department === 'prebuilt' ? (
          <PrebuiltSpecsEditor
            specs={draft.specs}
            onChange={(specs) => setDraft({ ...draft, specs })}
            storeProducts={storeProducts}
            excludeProductId={excludeProductId}
          />
        ) : (
          <>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <DropdownSelect
                  options={activeSpecKeys}
                  value={safeSpecKey}
                  onChange={(value) => {
                    const nextKey = value
                    setSpecKey(nextKey)
                    setSpecValue(specConfig.valueOptionsByKey[nextKey]?.[0] ?? '')
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <DropdownSelect options={valueOptions} value={safeSpecValue} onChange={setSpecValue} />
              </div>
            </div>
            <button
              type="button"
              className="rounded-md bg-surface-2 px-3 py-1.5"
              onClick={() => {
                if (!safeSpecValue) return
                setDraft({ ...draft, specs: addSpecValue(draft.specs, safeSpecKey, safeSpecValue) })
                setSpecValue(valueOptions[0])
              }}
            >
              {t('addSpec')}
            </button>
            <p className="text-sm text-text-muted">{t('selectedSpecs')}</p>
            <ul className="space-y-1 text-sm text-text-muted">
              {getSpecKeys(draft.specs).length === 0 && <li>{t('noSpecsYet')}</li>}
              {getSpecKeys(draft.specs).flatMap((key) =>
                getSpecValues(draft.specs, key).map((value) => (
                  <li
                    key={`${key}-${value}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-surface-2/50 px-2 py-1"
                  >
                    <span>
                      <span className="font-medium text-text">{key}</span> = {value}
                    </span>
                    <button
                      type="button"
                      className="text-danger hover:underline"
                      onClick={() => setDraft({ ...draft, specs: removeSpecValue(draft.specs, key, value) })}
                    >
                      ×
                    </button>
                  </li>
                )),
              )}
            </ul>
          </>
        )}
      </div>
      <p className="text-xs text-text-muted">{t('requiredFieldsLegend')}</p>
      <button
        type="button"
        onClick={onSubmit}
        className="button-pop btn-primary rounded-xl px-4 py-2.5 font-semibold"
      >
        {submitLabel}
      </button>
    </div>
  )
}

interface DropdownSelectProps {
  options: string[]
  value: string
  onChange: (value: string) => void
}

function DropdownSelect({ options, value, onChange }: DropdownSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={`relative ${open ? 'z-[200]' : 'z-10'}`}
      tabIndex={0}
      onBlur={() => setTimeout(() => setOpen(false), 120)}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`input-field flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-text backdrop-blur-md ${
          open ? 'border-brand/50 shadow-glow' : ''
        }`}
      >
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className={`shrink-0 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="dropdown-panel absolute left-0 right-0 top-full z-[210] mt-1 max-h-56 overflow-auto rounded-xl">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option)
                setOpen(false)
              }}
              className={`dropdown-panel-item ${option === value ? 'is-selected' : ''}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
