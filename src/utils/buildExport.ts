import type { BuildMap } from '../types'
import { formatPrice } from './compatibility'
import { getSelectedBuildEntries } from './builderSlots'

export function formatBuildListText(build: BuildMap, _total: number, storeName = 'Kurdi Store'): string {
  const lines = [`${storeName} — PC Build`, '']
  const selected = getSelectedBuildEntries(build)
  if (selected.length === 0) {
    lines.push('No parts selected.')
  } else {
    for (const { slot, product } of selected) {
      lines.push(`${slot}: ${product.name} (${formatPrice(product.price)})`)
    }
  }
  const quoteTotal = selected.reduce((sum, { product }) => sum + product.price, 0)
  lines.push('', `Total: ${formatPrice(quoteTotal)}`)
  return lines.join('\n')
}

export function whatsAppOrderUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
