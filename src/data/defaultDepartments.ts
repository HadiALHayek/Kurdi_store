import type { Category, StoreDepartmentConfig } from '../types'
import { ACCESSORY_CATEGORIES, LAPTOP_CATEGORIES, MONITOR_CATEGORIES, PC_PART_CATEGORIES, PREBUILT_CATEGORIES } from '../utils/adminDepartmentSpecs'

export function defaultDepartments(): StoreDepartmentConfig[] {
  return [
    {
      id: 'prebuilt',
      nameEn: 'Prebuilt PCs',
      nameAr: 'أجهزة جاهزة',
      descriptionEn: 'Ready-to-play gaming and workstation systems — plug in and go.',
      descriptionAr: 'أنظمة ألعاب وعمل جاهزة — وصّلها وابدأ.',
      image: '/categories/prebuilt.svg',
      categories: [...PREBUILT_CATEGORIES],
    },
    {
      id: 'pc-parts',
      nameEn: 'PC Parts',
      nameAr: 'قطع الكمبيوتر',
      descriptionEn: 'CPUs, GPUs, RAM, motherboards, storage, PSUs, cases, and cooling.',
      descriptionAr: 'معالجات، كروت شاشة، رام، لوحات أم، تخزين، مزودات طاقة، صناديق، وتبريد.',
      image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
      categories: [...PC_PART_CATEGORIES],
    },
    {
      id: 'monitors',
      nameEn: 'Monitors',
      nameAr: 'شاشات',
      descriptionEn: 'Gaming and office displays for every setup.',
      descriptionAr: 'شاشات ألعاب ومكتب لكل إعداد.',
      image: '/categories/monitors.svg',
      categories: [...MONITOR_CATEGORIES],
    },
    {
      id: 'laptops',
      nameEn: 'Laptops',
      nameAr: 'لابتوبات',
      descriptionEn: 'Portable power for work, study, and gaming.',
      descriptionAr: 'قوة محمولة للعمل والدراسة والألعاب.',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80',
      categories: [...LAPTOP_CATEGORIES],
    },
    {
      id: 'accessories',
      nameEn: 'Accessories',
      nameAr: 'إكسسوارات',
      descriptionEn: 'Keyboards, mice, headsets, cables, and more.',
      descriptionAr: 'لوحات مفاتيح، فأرة، سماعات، كابلات، والمزيد.',
      image: '/categories/accessories.svg',
      categories: [...ACCESSORY_CATEGORIES],
    },
  ]
}

export function slugifyDepartmentId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export function isValidDepartmentId(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)
}

export function uniqueDepartmentId(base: string, existing: string[]): string {
  let id = base || 'category'
  let n = 2
  while (existing.includes(id)) {
    id = `${base}-${n}`
    n += 1
  }
  return id
}

export function emptyDepartmentDraft(categories: Category[] = []): StoreDepartmentConfig {
  return {
    id: '',
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    image: '/categories/accessories.svg',
    categories,
  }
}
