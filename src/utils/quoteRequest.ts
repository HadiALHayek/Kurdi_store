import type { Category, Product } from '../types'
import { formatPrice } from './compatibility'
import { formatBuildListText } from './buildExport'

const slotsOrder: Category[] = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

export function formatQuoteRequestText(
  build: Partial<Record<Category, Product>>,
  total: number,
  store: { name: string; address: string; phone: string; hours: string },
  buildCode?: string,
): string {
  const lines = [
    `${store.name} — Quote Request`,
    '',
    `Address: ${store.address}`,
    `Hours: ${store.hours}`,
    `Phone: ${store.phone}`,
    '',
  ]
  if (buildCode) lines.push(`Build code: ${buildCode}`, '')

  for (const slot of slotsOrder) {
    const part = build[slot]
    if (!part) {
      lines.push(`${slot}: —`)
      continue
    }
    const sku = part.sku ? ` [SKU: ${part.sku}]` : ''
    const stock =
      part.stock > 0 ? `In stock: ${part.stock}` : part.allowBackorder ? 'Backorder OK' : 'Out of stock'
    lines.push(`${slot}: ${part.name}${sku}`)
    lines.push(`  ${formatPrice(part.price)} · ${stock}`)
  }

  lines.push('', `Estimated total: ${formatPrice(total)}`, '', 'Please confirm availability and pickup time. Thank you!')
  return lines.join('\n')
}

export function formatQuoteFromBuildList(build: Partial<Record<Category, Product>>, total: number) {
  return formatBuildListText(build, total)
}

export function printQuoteSheet(
  build: Partial<Record<Category, Product>>,
  total: number,
  store: { name: string; address: string; phone: string; hours: string },
  buildCode?: string,
) {
  const text = formatQuoteRequestText(build, total, store, buildCode)
  const win = window.open('', '_blank', 'width=720,height=900')
  if (!win) return
  const body = text
    .split('\n')
    .map((line) => `<p style="margin:4px 0;font-family:system-ui;font-size:14px">${line || '&nbsp;'}</p>`)
    .join('')
  win.document.write(`<!DOCTYPE html><html><head><title>Quote — ${store.name}</title></head><body style="padding:24px">${body}</body></html>`)
  win.document.close()
  win.focus()
  win.print()
}
