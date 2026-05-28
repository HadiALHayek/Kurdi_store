import type { Product } from '../types'

const CSV_HEADERS = ['id', 'name', 'category', 'price', 'previousPrice', 'stock', 'sku', 'imageUrl', 'discontinued', 'allowBackorder', 'staffPick'] as const

export function productsToCsv(products: Product[]): string {
  const rows = [CSV_HEADERS.join(',')]
  for (const p of products) {
    rows.push(
      [
        p.id,
        escapeCsv(p.name),
        p.category,
        String(p.price),
        p.previousPrice != null ? String(p.previousPrice) : '',
        String(p.stock),
        p.sku ?? '',
        escapeCsv(p.imageUrl),
        p.discontinued ? '1' : '0',
        p.allowBackorder ? '1' : '0',
        p.staffPick ? '1' : '0',
      ].join(','),
    )
  }
  return rows.join('\n')
}

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

export function parseProductsCsv(text: string, existing: Product[]): Product[] {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return existing

  const header = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)

  const idI = idx('id')
  const nameI = idx('name')
  const catI = idx('category')
  const priceI = idx('price')
  const prevI = idx('previousprice')
  const stockI = idx('stock')
  const skuI = idx('sku')

  if (nameI < 0 || priceI < 0 || stockI < 0) {
    throw new Error('CSV must include name, price, and stock columns')
  }

  const byId = new Map(existing.map((p) => [p.id, p]))

  for (let li = 1; li < lines.length; li++) {
    const cols = parseCsvLine(lines[li])
    const id = idI >= 0 ? cols[idI]?.trim() : ''
    const name = cols[nameI]?.trim()
    if (!name) continue

    const price = Number.parseFloat(cols[priceI] ?? '0')
    const stock = Number.parseInt(cols[stockI] ?? '0', 10)
    const previousPrice = prevI >= 0 && cols[prevI] ? Number.parseFloat(cols[prevI]) : undefined

    const existingProduct = id ? byId.get(id) : undefined
    if (existingProduct) {
      byId.set(id, {
        ...existingProduct,
        name,
        price: Number.isNaN(price) ? existingProduct.price : price,
        stock: Number.isNaN(stock) ? existingProduct.stock : stock,
        previousPrice: previousPrice && !Number.isNaN(previousPrice) ? previousPrice : existingProduct.previousPrice,
        sku: skuI >= 0 && cols[skuI] ? cols[skuI].trim() : existingProduct.sku,
        category: catI >= 0 && cols[catI] ? (cols[catI].trim() as Product['category']) : existingProduct.category,
      })
    }
  }

  return [...byId.values()]
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
