/** Extract Instagram username from handle (@name) or profile URL. */
export function parseInstagramUsername(handle: string, profileUrl: string): string | null {
  const fromHandle = handle.trim().replace(/^@/, '')
  if (/^[a-zA-Z0-9._]+$/.test(fromHandle)) return fromHandle

  const url = profileUrl.trim()
  if (!url) return fromHandle || null

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const username = parts[0]
    if (username && /^[a-zA-Z0-9._]+$/.test(username)) return username
  } catch {
    // ignore invalid URL
  }

  return fromHandle || null
}

export function instagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`
}

export function instagramEmbedUrl(username: string): string {
  return `https://www.instagram.com/${username}/embed`
}
