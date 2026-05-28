import { useEffect } from 'react'

interface PageMeta {
  title?: string
  description?: string
  image?: string
  url?: string
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, image, url }: PageMeta) {
  useEffect(() => {
    if (title) document.title = title
    if (description) setMetaTag('name', 'description', description)
    if (title) setMetaTag('property', 'og:title', title)
    if (description) setMetaTag('property', 'og:description', description)
    if (image) setMetaTag('property', 'og:image', image)
    if (url) setMetaTag('property', 'og:url', url)
    return () => {
      document.title = 'Kurdi Store'
    }
  }, [title, description, image, url])
}

export function injectProductJsonLd(product: {
  name: string
  description: string
  imageUrl: string
  price: number
  id: string
  stock: number
}) {
  const scriptId = 'product-jsonld'
  document.getElementById(scriptId)?.remove()
  const script = document.createElement('script')
  script.id = scriptId
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
  })
  document.head.appendChild(script)
  return () => document.getElementById(scriptId)?.remove()
}
