import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { useI18n } from '../../i18n'
import { formatPrice } from '../../utils/compatibility'

function shuffleProducts(products: Product[], count: number): Product[] {
  const copy = [...products]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

interface RandomProductsStripProps {
  products: Product[]
  count?: number
}

export function RandomProductsStrip({ products, count = 10 }: RandomProductsStripProps) {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const picks = useMemo(() => shuffleProducts(products, count), [products, count])

  const scrollBy = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.random-product-slide')
    const amount = (card?.offsetWidth ?? 260) + 16
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el || picks.length < 2) return
    const id = window.setInterval(() => {
      if (el.matches(':hover')) return
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8
      if (atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
      else scrollBy(1)
    }, 4500)
    return () => window.clearInterval(id)
  }, [picks.length])

  if (picks.length === 0) return null

  return (
    <section className="section-enter panel-elevated overflow-hidden rounded-2xl p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-xl font-semibold text-white sm:text-2xl">{t('featuredProducts')}</h2>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-cyan">{t('randomPicks')}</p>
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label="Previous" onClick={() => scrollBy(-1)} className="btn-ghost rounded-lg p-2">
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Next" onClick={() => scrollBy(1)} className="btn-ghost rounded-lg p-2">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {picks.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="random-product-slide glass-card flex w-[min(100%,260px)] shrink-0 flex-col overflow-hidden rounded-xl border-brand/10 transition hover:-translate-y-1 hover:border-brand/35 hover:shadow-glow"
          >
            <img src={product.imageUrl} alt={product.name} className="h-36 w-full object-cover" loading="lazy" />
            <div className="p-3">
              <p className="line-clamp-2 font-display text-sm font-semibold text-white">{product.name}</p>
              <p className="mt-1 text-base font-bold text-brand-cyan">{formatPrice(product.price)}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-3 text-center">
        <Link to="/products" className="text-sm font-semibold text-brand-cyan hover:underline">
          {t('viewAllProducts')} →
        </Link>
      </div>
    </section>
  )
}
