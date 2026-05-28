import type { Category, Product } from '../types'
import { formatPrice } from './compatibility'

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

export function formatBuildListText(
  build: Partial<Record<Category, Product>>,
  total: number,
  storeName = 'Kurdi Store',
): string {
  const lines = [`${storeName} — PC Build`, '']
  for (const slot of slotsOrder) {
    const part = build[slot]
    lines.push(`${slot}: ${part ? `${part.name} (${formatPrice(part.price)})` : '—'}`)
  }
  lines.push('', `Total: ${formatPrice(total)}`)
  return lines.join('\n')
}

export function whatsAppOrderUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
