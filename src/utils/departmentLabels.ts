import type { StoreDepartmentConfig } from '../types'

export function getDepartmentName(dept: StoreDepartmentConfig, isArabic: boolean): string {
  if (isArabic && dept.nameAr.trim()) return dept.nameAr.trim()
  return dept.nameEn.trim() || dept.id
}

export function getDepartmentDescription(dept: StoreDepartmentConfig, isArabic: boolean): string {
  if (isArabic && dept.descriptionAr.trim()) return dept.descriptionAr.trim()
  return dept.descriptionEn.trim()
}
