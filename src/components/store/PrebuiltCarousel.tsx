import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useProductsStore } from '../../store/productsStore'
import type { Product } from '../../types'
import { formatPrice } from '../../utils/compatibility'
import { formatPrebuiltSpecDisplay, isPrebuiltPartSpecKey } from '../../utils/prebuiltSpecs'
import { formatSpecDisplay, getSpecKeys } from '../../utils/productSpecs'

interface PrebuiltCarouselProps {
  products: Product[]
}

export function PrebuiltCarousel({ products }: PrebuiltCarouselProps) {
  const storeProducts = useProductsStore((state) => state.products)
  const trackRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const onChange = () => setPaused(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const scrollBy = (direction: -1 | 1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>('.prebuilt-slide')
    const amount = (card?.offsetWidth ?? 280) + 16
    el.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="panel-elevated mb-6 overflow-hidden rounded-2xl p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-xl font-semibold text-white sm:text-2xl">Prebuilt PCs</h3>
          <span className="text-xs font-medium uppercase tracking-wide text-brand-cyan">Featured</span>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="btn-ghost rounded-lg p-2"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="btn-ghost rounded-lg p-2"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        className={`prebuilt-scroll flex gap-4 overflow-x-auto scroll-smooth pb-2 ${paused ? '' : 'sm:animate-none'}`}
        style={{ scrollbarWidth: 'thin' }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="prebuilt-slide glass-card flex w-[min(100%,280px)] shrink-0 flex-col rounded-xl border-brand/10 p-3 transition hover:-translate-y-1 hover:border-brand/35 hover:shadow-glow"
          >
            <img src={product.imageUrl} alt={product.name} className="mb-3 h-36 w-full rounded-md object-cover" />
            <div className="mb-1 flex items-center justify-between gap-2">
              <h4 className="font-display text-base text-white">{product.name}</h4>
              <span className="shrink-0 text-base font-semibold text-brand-cyan">{formatPrice(product.price)}</span>
            </div>
            <ul className="space-y-0.5 text-xs text-text-muted">
              {getSpecKeys(product.specs)
                .slice(0, 5)
                .map((key) => (
                  <li key={key}>
                    <span className="text-text">{key}:</span>{' '}
                    {isPrebuiltPartSpecKey(key)
                      ? formatPrebuiltSpecDisplay(product.specs, key, storeProducts)
                      : formatSpecDisplay(product.specs, key)}
                  </li>
                ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  )
}
