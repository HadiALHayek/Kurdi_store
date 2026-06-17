import type { BuildMap } from '../types'
import { formatPrice } from './compatibility'
import { getSelectedBuildEntries } from './builderSlots'

export function printBuildSheet(
  build: BuildMap,
  total: number,
  storeName = 'Kurdi Store',
  address?: string,
) {
  const selected = getSelectedBuildEntries(build)
  const rows =
    selected.length === 0
      ? '<tr><td colspan="3">No parts selected</td></tr>'
      : selected
          .map(({ slot, product }) => {
            return `<tr><td>${slot}</td><td>${product.name}</td><td>${formatPrice(product.price)}</td></tr>`
          })
          .join('')

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${storeName} Build</title>
<style>
body{font-family:system-ui,sans-serif;padding:24px;color:#111}
h1{font-size:20px} table{width:100%;border-collapse:collapse;margin:16px 0}
td,th{border:1px solid #ccc;padding:8px;text-align:left}
.total{font-size:18px;font-weight:bold}
@media print{button{display:none}}
</style></head><body>
<h1>${storeName} — PC Build List</h1>
${address ? `<p>${address}</p>` : ''}
<table><thead><tr><th>Slot</th><th>Part</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>
<p class="total">Total: ${formatPrice(total)}</p>
<button onclick="window.print()">Print</button>
</body></html>`

  const win = window.open('', '_blank', 'width=720,height=900')
  if (!win) return
  win.document.write(html)
  win.document.close()
}
