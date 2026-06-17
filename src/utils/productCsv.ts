import type { Category, Product, ShopDepartment, UseCaseTag } from '../types'
import { addSpecValue, getSpecKeys, getSpecValues } from './productSpecs'
import { isShopDepartment } from './shopDepartments'

import {
  ACCESSORY_CATEGORIES,
  LAPTOP_CATEGORIES,
  MONITOR_CATEGORIES,
  PC_PART_CATEGORIES,
  PREBUILT_CATEGORIES,
} from './adminDepartmentSpecs'

const CATEGORIES: Category[] = [
  ...PREBUILT_CATEGORIES,
  ...PC_PART_CATEGORIES,
  ...MONITOR_CATEGORIES,
  ...LAPTOP_CATEGORIES,
  ...ACCESSORY_CATEGORIES,
]

export const CSV_HEADERS = [
  'id',
  'sku',
  'name',
  'category',
  'department',
  'description',
  'price',
  'previousPrice',
  'stock',
  'specs',
  'useCaseTags',
  'discontinued',
  'allowBackorder',
  'staffPick',
  'seoTitle',
  'seoDescription',
  'instagramPostUrl',
] as const

export type CsvImportMode = 'merge' | 'replace'

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else current += ch
  }
  result.push(current)
  return result
}

function parseBool(value: string | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase()
  return v === '1' || v === 'true' || v === 'yes'
}

function parseOptionalNumber(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined
  const n = Number.parseFloat(value)
  return Number.isNaN(n) ? undefined : n
}

function parseCategory(value: string | undefined): Category {
  const trimmed = (value ?? '').trim() as Category
  return CATEGORIES.includes(trimmed) ? trimmed : 'CPU'
}

function parseUseCaseTags(value: string | undefined): UseCaseTag[] | undefined {
  if (!value?.trim()) return undefined
  const tags = value
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean) as UseCaseTag[]
  return tags.length ? tags : undefined
}

export function formatSpecsForCsv(specs: Product['specs']): string {
  return getSpecKeys(specs)
    .flatMap((key) => getSpecValues(specs, key).map((value) => `${key}:${value}`))
    .join(';')
}

export function parseSpecsFromCsv(raw: string): Product['specs'] {
  let specs: Product['specs'] = {}
  const text = raw.trim()
  if (!text) return specs

  for (const part of text.split(';')) {
    const colon = part.indexOf(':')
    if (colon <= 0) continue
    const key = part.slice(0, colon).trim()
    const value = part.slice(colon + 1).trim()
    if (key && value) specs = addSpecValue(specs, key, value)
  }
  return specs
}

function productToCsvRow(product: Product): string {
  return [
    product.id,
    escapeCsv(product.sku ?? ''),
    escapeCsv(product.name),
    product.category,
    product.department ?? '',
    escapeCsv(product.description),
    String(product.price),
    product.previousPrice != null ? String(product.previousPrice) : '',
    String(product.stock),
    escapeCsv(formatSpecsForCsv(product.specs)),
    escapeCsv((product.useCaseTags ?? []).join(',')),
    product.discontinued ? '1' : '0',
    product.allowBackorder ? '1' : '0',
    product.staffPick ? '1' : '0',
    escapeCsv(product.seoTitle ?? ''),
    escapeCsv(product.seoDescription ?? ''),
    escapeCsv(product.instagramPostUrl ?? ''),
  ].join(',')
}

export function productsToCsv(products: Product[]): string {
  const rows = [CSV_HEADERS.join(',')]
  for (const product of products) {
    rows.push(productToCsvRow(product))
  }
  return rows.join('\n')
}

/** Empty template — no images; upload each image in admin after import. */
export function productsCsvTemplate(): string {
  const example = [
    '',
    'SKU-001',
    'Example CPU',
    'CPU',
    'pc-parts',
    'Short product description',
    '199.99',
    '',
    '5',
    'socket:AM5;tdp:120',
    'gaming,1080p',
    '0',
    '0',
    '0',
    '',
    '',
    '',
  ]
  return [CSV_HEADERS.join(','), example.join(',')].join('\n')
}

function findExistingProduct(existing: Product[], id: string, sku: string): Product | undefined {
  if (id) {
    const byId = existing.find((p) => p.id === id)
    if (byId) return byId
  }
  if (sku) {
    const bySku = existing.find((p) => p.sku && p.sku === sku)
    if (bySku) return bySku
  }
  return undefined
}

function parseDepartment(value: string | undefined, existing?: ShopDepartment): ShopDepartment | undefined {
  const trimmed = (value ?? '').trim()
  if (isShopDepartment(trimmed)) return trimmed
  return existing
}

function rowToProduct(cols: string[], header: string[], existing?: Product): Product {
  const get = (name: string) => {
    const index = header.indexOf(name)
    return index >= 0 ? (cols[index] ?? '').trim() : ''
  }

  const id = get('id') || existing?.id || `prd-${crypto.randomUUID()}`
  const sku = get('sku') || existing?.sku
  const name = get('name')
  const price = Number.parseFloat(get('price')) || existing?.price || 0
  const stock = Number.parseInt(get('stock'), 10)
  const previousPrice = parseOptionalNumber(get('previousprice'))
  const description = get('description') || existing?.description || ''
  const specsRaw = get('specs')
  const specs = specsRaw ? parseSpecsFromCsv(specsRaw) : existing?.specs ?? {}

  return {
    id,
    sku: sku || undefined,
    name,
    description,
    category: parseCategory(get('category') || existing?.category),
    department: parseDepartment(get('department'), existing?.department),
    price: Number.isNaN(price) ? 0 : price,
    previousPrice: previousPrice ?? existing?.previousPrice,
    stock: Number.isNaN(stock) ? existing?.stock ?? 0 : stock,
    imageUrl: existing?.imageUrl ?? '',
    imageUrls: existing?.imageUrls,
    specs,
    createdAt: existing?.createdAt ?? Date.now(),
    staffPick: header.includes('staffpick') ? parseBool(get('staffpick')) : Boolean(existing?.staffPick),
    discontinued: header.includes('discontinued')
      ? parseBool(get('discontinued'))
      : Boolean(existing?.discontinued),
    allowBackorder: header.includes('allowbackorder')
      ? parseBool(get('allowbackorder'))
      : Boolean(existing?.allowBackorder),
    staffNotes: existing?.staffNotes,
    useCaseTags: parseUseCaseTags(get('usecasetags')) ?? existing?.useCaseTags,
    seoTitle: get('seotitle') || existing?.seoTitle,
    seoDescription: get('seodescription') || existing?.seoDescription,
    instagramPostUrl: get('instagramposturl') || existing?.instagramPostUrl,
  }
}

export interface CsvImportResult {
  products: Product[]
  created: number
  updated: number
  skipped: number
}

export function parseProductsCsv(
  text: string,
  existing: Product[],
  mode: CsvImportMode = 'merge',
): CsvImportResult {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one product row')
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  if (!header.includes('name') || !header.includes('price') || !header.includes('stock')) {
    throw new Error('CSV must include name, price, and stock columns')
  }

  const base = mode === 'replace' ? [] : [...existing]
  const byId = new Map(base.map((p) => [p.id, p]))
  let created = 0
  let updated = 0
  let skipped = 0

  for (let li = 1; li < lines.length; li++) {
    const cols = parseCsvLine(lines[li])
    const name = cols[header.indexOf('name')]?.trim()
    if (!name) {
      skipped++
      continue
    }

    const id = header.includes('id') ? cols[header.indexOf('id')]?.trim() : ''
    const sku = header.includes('sku') ? cols[header.indexOf('sku')]?.trim() : ''
    const match = findExistingProduct([...byId.values()], id, sku)

    if (match) {
      const next = rowToProduct(cols, header, match)
      byId.set(match.id, next)
      updated++
    } else {
      const next = rowToProduct(cols, header)
      byId.set(next.id, next)
      created++
    }
  }

  return {
    products: [...byId.values()],
    created,
    updated,
    skipped,
  }
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function productsMissingImages(products: Product[]): Product[] {
  return products.filter((p) => !p.imageUrl?.trim())
}

/** Products without an image stay in admin only until an image is uploaded. */
export function isStorefrontProduct(product: Product): boolean {
  return Boolean(product.imageUrl?.trim())
}
