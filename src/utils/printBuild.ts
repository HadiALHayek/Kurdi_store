import type { Category, Product } from '../types'
import { formatPrice } from './compatibility'
import { buildShareUrl } from './buildShare'

const slotsOrder: Category[] = ['CPU', 'Motherboard', 'RAM', 'GPU', 'Storage', 'PSU', 'Case', 'Cooling']

export function printBuildSheet(
  build: Partial<Record<Category, Product>>,
  total: number,
  storeName = 'Kurdi Store',
  address?: string,
) {
  const shareUrl = buildShareUrl(build)
  const rows = slotsOrder
    .map((slot) => {
      const p = build[slot]
      return `<tr><td>${slot}</td><td>${p ? p.name : '—'}</td><td>${p ? formatPrice(p.price) : '—'}</td></tr>`
    })
    .join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${storeName} Build</title>
<style>
body{font-family:system-ui,sans-serif;padding:24px;color:#111}
h1{font-size:20px} table{width:100%;border-collapse:collapse;margin:16px 0}
td,th{border:1px solid #ccc;padding:8px;text-align:left}
.total{font-size:18px;font-weight:bold}
.qr{font-size:11px;color:#444;word-break:break-all}
@media print{button{display:none}}
</style></head><body>
<h1>${storeName} — PC Build List</h1>
${address ? `<p>${address}</p>` : ''}
<table><thead><tr><th>Slot</th><th>Part</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
<p class="total">Total: ${formatPrice(total)}</p>
<p class="qr">Build link: ${shareUrl}</p>
<button onclick="window.print()">Print</button>
</body></html>`

  const win = window.open('', '_blank', 'width=720,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
