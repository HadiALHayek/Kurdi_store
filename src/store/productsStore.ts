import { create } from 'zustand'
import type { Category, Product } from '../types'

const STORAGE_KEY = 'kurdi_products_v1'

const now = Date.now()

const seededProducts: Product[] = [
  {
    id: 'prebuilt-1080p',
    name: 'Kurdi Falcon 1080p',
    description: 'Entry gaming prebuilt for competitive 1080p with high FPS and clean airflow.',
    price: 999.99,
    category: 'Prebuilt PC',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
    specs: {
      cpu: 'Ryzen 5 7600',
      gpu: 'RTX 4060 8GB',
      ram: '16GB DDR5',
      storage: '1TB NVMe',
      motherboard: 'B650 mATX',
      psu: '650W Gold',
      cooling: 'Tower Air Cooler',
      resolutionTarget: '1080p',
      performanceTier: 'Entry',
    },
    stock: 5,
    createdAt: now - 130000,
  },
  {
    id: 'prebuilt-1440p',
    name: 'Kurdi Titan 1440p',
    description: 'Mid-range prebuilt tuned for 1440p ultra settings and streaming-ready performance.',
    price: 1699.99,
    category: 'Prebuilt PC',
    imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=900&q=80',
    specs: {
      cpu: 'Ryzen 7 9700X',
      gpu: 'RTX 5070 12GB',
      ram: '32GB DDR5',
      storage: '2TB NVMe',
      motherboard: 'X870 ATX',
      psu: '850W Gold',
      cooling: '360mm AIO',
      resolutionTarget: '1440p',
      performanceTier: 'Mainstream',
    },
    stock: 3,
    createdAt: now - 120000,
  },
  {
    id: 'cpu-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    description: '8-core gaming CPU with top-tier efficiency and AM5 support.',
    price: 399.99,
    category: 'CPU',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    specs: { socket: 'AM5', tdp: '120' },
    stock: 14,
    createdAt: now - 100000,
  },
  {
    id: 'cpu-13700k',
    name: 'Intel Core i7-13700K',
    description: '16-core hybrid desktop processor for productivity and gaming.',
    price: 369.99,
    category: 'CPU',
    imageUrl: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=80',
    specs: { socket: 'LGA1700', tdp: '125' },
    stock: 10,
    createdAt: now - 90000,
  },
  {
    id: 'mb-b650',
    name: 'MSI MAG B650 Tomahawk',
    description: 'AM5 board with DDR5 support and robust VRM thermals.',
    price: 219.99,
    category: 'Motherboard',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    specs: { socket: 'AM5', memoryType: 'DDR5', formFactor: 'ATX' },
    stock: 11,
    createdAt: now - 80000,
  },
  {
    id: 'mb-b760',
    name: 'ASUS Prime B760M-A',
    description: 'LGA1700 micro-ATX motherboard tuned for DDR4 builds.',
    price: 159.99,
    category: 'Motherboard',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
    specs: { socket: 'LGA1700', memoryType: 'DDR4', formFactor: 'mATX' },
    stock: 9,
    createdAt: now - 70000,
  },
  {
    id: 'ram-ddr5-32',
    name: 'Corsair Vengeance 32GB DDR5',
    description: 'Low-latency DDR5 kit optimized for modern gaming systems.',
    price: 129.99,
    category: 'RAM',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80',
    specs: { memoryType: 'DDR5', speed: '6000' },
    stock: 24,
    createdAt: now - 60000,
  },
  {
    id: 'ram-ddr4-32',
    name: 'Kingston Fury 32GB DDR4',
    description: 'Reliable DDR4 memory kit for Intel and legacy AMD rigs.',
    price: 89.99,
    category: 'RAM',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    specs: { memoryType: 'DDR4', speed: '3600' },
    stock: 18,
    createdAt: now - 50000,
  },
  {
    id: 'gpu-rtx4070',
    name: 'NVIDIA GeForce RTX 4070',
    description: 'Ray tracing-ready GPU for high FPS 1440p gaming.',
    price: 549.99,
    category: 'GPU',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    specs: { tdp: '200', vram: '12GB' },
    stock: 7,
    staffPick: true,
    useCaseTags: ['gaming', '1440p'],
    createdAt: now - 40000,
  },
  {
    id: 'gpu-rx7600',
    name: 'AMD Radeon RX 7600',
    description: 'Efficient 1080p/1440p card with excellent value.',
    price: 269.99,
    category: 'GPU',
    imageUrl: 'https://images.unsplash.com/photo-1587202372583-49330a15584d?auto=format&fit=crop&w=900&q=80',
    specs: { tdp: '165', vram: '8GB' },
    stock: 13,
    createdAt: now - 30000,
  },
  {
    id: 'ssd-990pro',
    name: 'Samsung 990 Pro NVMe 2TB',
    description: 'Ultra-fast PCIe 4.0 SSD with pro-grade endurance.',
    price: 179.99,
    category: 'Storage',
    imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
    specs: { interface: 'PCIe 4.0', capacity: '2TB' },
    stock: 30,
    createdAt: now - 20000,
  },
  {
    id: 'psu-650',
    name: 'Corsair RM650e 650W',
    description: '80+ Gold fully modular power supply for clean builds.',
    price: 99.99,
    category: 'PSU',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    specs: { wattage: '650' },
    stock: 15,
    createdAt: now - 15000,
  },
  {
    id: 'psu-850',
    name: 'Seasonic Focus GX-850 850W',
    description: 'High headroom PSU for upgraded GPUs and overclocking.',
    price: 149.99,
    category: 'PSU',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    specs: { wattage: '850' },
    stock: 8,
    createdAt: now - 10000,
  },
  {
    id: 'case-atx',
    name: 'NZXT H7 Flow Mid Tower',
    description: 'Airflow-focused ATX case with sleek tempered glass.',
    price: 129.99,
    category: 'Case',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
    specs: { formFactor: 'ATX' },
    stock: 6,
    createdAt: now - 5000,
  },
  {
    id: 'cool-darkrock',
    name: 'be quiet! Dark Rock Pro 4',
    description: 'Premium dual-tower air cooler for high-wattage CPUs.',
    price: 89.99,
    category: 'Cooling',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
    specs: { tdpSupport: '250' },
    stock: 12,
    createdAt: now - 2000,
  },
]

const loadProducts = () => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return seededProducts
  try {
    return JSON.parse(raw) as Product[]
  } catch {
    return seededProducts
  }
}

const persist = (products: Product[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
}

interface ProductsState {
  products: Product[]
  addProduct: (payload: Omit<Product, 'id' | 'createdAt'>) => void
  updateProduct: (id: string, payload: Omit<Product, 'id' | 'createdAt'>) => void
  deleteProduct: (id: string) => void
  duplicateProduct: (id: string) => void
  importProducts: (items: Product[]) => void
  exportProducts: () => Product[]
  getByCategory: (category: Category | 'All') => Product[]
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: loadProducts(),
  addProduct: (payload) =>
    set((state) => {
      const next = [
        {
          ...payload,
          id: `prd-${crypto.randomUUID()}`,
          createdAt: Date.now(),
        },
        ...state.products,
      ]
      persist(next)
      return { products: next }
    }),
  updateProduct: (id, payload) =>
    set((state) => {
      const next = state.products.map((product) =>
        product.id === id ? { ...product, ...payload } : product,
      )
      persist(next)
      return { products: next }
    }),
  deleteProduct: (id) =>
    set((state) => {
      const next = state.products.filter((product) => product.id !== id)
      persist(next)
      return { products: next }
    }),
  duplicateProduct: (id) =>
    set((state) => {
      const source = state.products.find((p) => p.id === id)
      if (!source) return state
      const copy: Product = {
        ...source,
        id: `prd-${crypto.randomUUID()}`,
        name: `${source.name} (copy)`,
        createdAt: Date.now(),
      }
      const next = [copy, ...state.products]
      persist(next)
      return { products: next }
    }),
  importProducts: (items) =>
    set(() => {
      persist(items)
      return { products: items }
    }),
  exportProducts: () => get().products,
  getByCategory: (category) =>
    category === 'All' ? get().products : get().products.filter((product) => product.category === category),
}))
