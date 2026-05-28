const STORAGE_KEY = 'kurdi_recently_viewed'
const MAX = 6

export function pushRecentlyViewed(productId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const list: string[] = raw ? (JSON.parse(raw) as string[]) : []
    const next = [productId, ...list.filter((id) => id !== productId)].slice(0, MAX)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([productId]))
  }
}

export function getRecentlyViewedIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
