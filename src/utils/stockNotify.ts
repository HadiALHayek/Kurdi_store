import type { Product } from '../types'
import { whatsAppOrderUrl } from './buildExport'

export function formatStockNotifyMessage(product: Product, storeName = 'Kurdi Store'): string {
  const sku = product.sku ? `\nSKU: ${product.sku}` : ''
  return [
    `Hi ${storeName},`,
    '',
    `Please notify me when this item is back in stock:`,
    '',
    product.name,
    `Category: ${product.category}`,
    `Product ID: ${product.id}${sku}`,
    '',
    'Thank you!',
  ].join('\n')
}

export function stockNotifyWhatsAppUrl(phone: string, product: Product, storeName?: string) {
  return whatsAppOrderUrl(phone, formatStockNotifyMessage(product, storeName))
}

export function shouldShowStockNotify(product: Product): boolean {
  if (product.discontinued) return false
  if (product.category === 'Prebuilt PC') return false
  return product.stock <= 0 && !product.allowBackorder
}
