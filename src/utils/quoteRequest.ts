import type { BuildMap } from '../types'
import { formatPrice } from './compatibility'
import { formatCustomerStockStatus } from './stockStatus'
import { formatBuildListText } from './buildExport'
import { getSelectedBuildEntries } from './builderSlots'

export function formatQuoteRequestText(
  build: BuildMap,
  _total: number,
  store: { name: string; address: string; phone: string; hours: string },
  buildCode?: string,
  customer?: { name: string; phone: string },
): string {
  const lines = [
    `${store.name} — Quote Request`,
    '',
    `Address: ${store.address}`,
    `Hours: ${store.hours}`,
    `Phone: ${store.phone}`,
    '',
  ]
  if (customer) {
    lines.push(`Customer: ${customer.name}`, `Customer phone: ${customer.phone}`, '')
  }
  if (buildCode) lines.push(`Build code: ${buildCode}`, '')

  const selected = getSelectedBuildEntries(build)
  if (selected.length === 0) {
    lines.push('No parts selected.')
  } else {
    for (const { slot, product } of selected) {
      const sku = product.sku ? ` [SKU: ${product.sku}]` : ''
      const stock = formatCustomerStockStatus(product)
      lines.push(`${slot}: ${product.name}${sku}`)
      lines.push(`  ${formatPrice(product.price)} · ${stock}`)
    }
  }

  const quoteTotal = selected.reduce((sum, { product }) => sum + product.price, 0)

  lines.push('', `Estimated total: ${formatPrice(quoteTotal)}`, '', 'Please confirm availability and pickup time. Thank you!')
  return lines.join('\n')
}

export function formatQuoteFromBuildList(build: BuildMap, total: number) {
  return formatBuildListText(build, total)
}

export function printQuoteSheet(
  build: BuildMap,
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
