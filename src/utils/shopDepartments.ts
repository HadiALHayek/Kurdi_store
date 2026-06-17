import type { Category, Product } from '../types'
import {
  ACCESSORY_CATEGORIES,
  LAPTOP_CATEGORIES,
  MONITOR_CATEGORIES,
  PC_PART_CATEGORIES,
  PREBUILT_CATEGORIES,
} from './adminDepartmentSpecs'

export type ShopDepartment = 'pc-parts' | 'prebuilt' | 'monitors' | 'laptops' | 'accessories'

export const SHOP_DEPARTMENTS: ShopDepartment[] = [
  'prebuilt',
  'pc-parts',
  'monitors',
  'laptops',
  'accessories',
]

export { PC_PART_CATEGORIES, PREBUILT_CATEGORIES }

const PC_PART_CATEGORIES_SET = new Set<Category>(PC_PART_CATEGORIES)

export function isShopDepartment(value: string | null): value is ShopDepartment {
  return value != null && SHOP_DEPARTMENTS.includes(value as ShopDepartment)
}

export function productBelongsToDepartment(product: Product, department: ShopDepartment): boolean {
  if (product.department) return product.department === department
  if (department === 'prebuilt') return product.category === 'Prebuilt PC'
  if (department === 'pc-parts') return PC_PART_CATEGORIES_SET.has(product.category)
  if (department === 'monitors') return MONITOR_CATEGORIES.includes(product.category)
  if (department === 'laptops') return LAPTOP_CATEGORIES.includes(product.category)
  if (department === 'accessories') return ACCESSORY_CATEGORIES.includes(product.category)
  return false
}

export function filterProductsByDepartment(products: Product[], department: ShopDepartment | null): Product[] {
  if (!department) return products
  return products.filter((product) => productBelongsToDepartment(product, department))
}

export const DEPARTMENT_IMAGES: Record<ShopDepartment, string> = {
  prebuilt: '/categories/prebuilt.svg',
  'pc-parts':
    'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
  monitors: '/categories/monitors.svg',
  laptops:
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
  accessories: '/categories/accessories.svg',
}
