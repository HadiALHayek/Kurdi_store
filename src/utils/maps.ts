/** Convert share/search links into an iframe-friendly Google Maps embed URL. */
export function normalizeGoogleMapsEmbedUrl(raw: string, address: string): string {
  const input = raw.trim()

  if (!input) {
    if (!address.trim()) return ''
    return buildEmbedFromQuery(address)
  }

  if (input.includes('/maps/embed')) {
    return input.replace(/^http:/i, 'https:')
  }

  const coordMatch = input.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
  if (coordMatch) {
    const [, lat, lng] = coordMatch
    return buildEmbedFromQuery(`${lat},${lng}`)
  }

  const placeMatch = input.match(/\/place\/([^/@?]+)/)
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    return buildEmbedFromQuery(place)
  }

  const queryMatch = input.match(/[?&]q=([^&]+)/)
  if (queryMatch) {
    return buildEmbedFromQuery(decodeURIComponent(queryMatch[1].replace(/\+/g, ' ')))
  }

  if (
    input.includes('google.com/maps') ||
    input.includes('goo.gl/maps') ||
    input.includes('maps.app.goo.gl')
  ) {
    if (address.trim()) return buildEmbedFromQuery(address)
    return ''
  }

  return buildEmbedFromQuery(input)
}

/** Link that always opens correctly in a new browser tab. */
export function toGoogleMapsOpenUrl(raw: string, address: string): string {
  const input = raw.trim()

  if (
    input &&
    (input.includes('google.com/maps') ||
      input.includes('goo.gl/maps') ||
      input.includes('maps.app.goo.gl'))
  ) {
    return input.replace(/^http:/i, 'https:')
  }

  const query = input || address.trim()
  if (!query) return 'https://www.google.com/maps'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function buildEmbedFromQuery(query: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`
}
