import type { Product, StoreDepartmentConfig } from '../types'
import { defaultDepartments } from '../data/defaultDepartments'
import {
  ACCESSORY_CATEGORIES,
  LAPTOP_CATEGORIES,
  MONITOR_CATEGORIES,
  PC_PART_CATEGORIES,
} from './adminDepartmentSpecs'

export type ShopDepartment = string

export const SHOP_DEPARTMENTS: ShopDepartment[] = defaultDepartments().map((d) => d.id)

export { PC_PART_CATEGORIES, PREBUILT_CATEGORIES } from './adminDepartmentSpecs'

export const DEFAULT_DEPARTMENT_IMAGES = Object.fromEntries(
  defaultDepartments().map((d) => [d.id, d.image]),
) as Record<string, string>

/** @deprecated Use department.image from settings */
export const DEPARTMENT_IMAGES = DEFAULT_DEPARTMENT_IMAGES

export function getActiveDepartments(departments?: StoreDepartmentConfig[]): StoreDepartmentConfig[] {
  if (departments && departments.length > 0) return departments
  return defaultDepartments()
}

export function findDepartmentById(
  id: string,
  departments: StoreDepartmentConfig[],
): StoreDepartmentConfig | undefined {
  return departments.find((dept) => dept.id === id)
}

export function isShopDepartment(value: string | null, departments?: StoreDepartmentConfig[]): value is ShopDepartment {
  if (value == null) return false
  return getActiveDepartments(departments).some((dept) => dept.id === value)
}

export function productBelongsToDepartment(product: Product, department: StoreDepartmentConfig): boolean {
  if (product.department) return product.department === department.id
  return department.categories.includes(product.category)
}

export function filterProductsByDepartment(
  products: Product[],
  departmentId: ShopDepartment | null,
  departments?: StoreDepartmentConfig[],
): Product[] {
  if (!departmentId) return products
  const dept = findDepartmentById(departmentId, getActiveDepartments(departments))
  if (!dept) return products
  return products.filter((product) => productBelongsToDepartment(product, dept))
}

export function getDepartmentImage(department: StoreDepartmentConfig): string {
  return department.image.trim() || DEFAULT_DEPARTMENT_IMAGES[department.id] || '/categories/accessories.svg'
}

export function inferDepartmentFromProduct(
  product: Pick<Product, 'category' | 'department'>,
  departments?: StoreDepartmentConfig[],
): ShopDepartment {
  const active = getActiveDepartments(departments)
  if (product.department && active.some((d) => d.id === product.department)) {
    return product.department
  }
  const byCategory = active.find((d) => d.categories.includes(product.category))
  if (byCategory) return byCategory.id
  if (product.category === 'Prebuilt PC') return 'prebuilt'
  if (PC_PART_CATEGORIES.includes(product.category)) return 'pc-parts'
  if (MONITOR_CATEGORIES.includes(product.category)) return 'monitors'
  if (LAPTOP_CATEGORIES.includes(product.category)) return 'laptops'
  if (ACCESSORY_CATEGORIES.includes(product.category)) return 'accessories'
  return active[0]?.id ?? 'accessories'
}
