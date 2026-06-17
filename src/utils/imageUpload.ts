/** Resize and compress product images before storing in localStorage (base64). */
export async function compressImageFile(
  file: File,
  maxDimension = 1280,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file)
  }

  const objectUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(objectUrl)
    const longest = Math.max(image.width, image.height)
    const scale = longest > maxDimension ? maxDimension / longest : 1
    const width = Math.round(image.width * scale)
    const height = Math.round(image.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return readFileAsDataUrl(file)

    ctx.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load image'))
    image.src = src
  })
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

export class StorageQuotaError extends Error {
  constructor() {
    super('STORAGE_QUOTA_EXCEEDED')
    this.name = 'StorageQuotaError'
  }
}

export function isStorageQuotaError(error: unknown): boolean {
  if (error instanceof StorageQuotaError) return true
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return true
  return error instanceof Error && error.message === 'STORAGE_QUOTA_EXCEEDED'
}
