import type { TranslationKey } from '../i18n'
import type { Category } from '../types'

export type PcGuideSectionId =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case-cooling'
  | 'compatibility'

export interface PcGuideShopLink {
  to: string
  labelKey: TranslationKey
}

export interface PcGuideSection {
  id: PcGuideSectionId
  titleKey: TranslationKey
  bodyKey: TranslationKey
  tipKeys: TranslationKey[]
  shopLinks?: PcGuideShopLink[]
}

export const PC_GUIDE_PART_SECTIONS: PcGuideSection[] = [
  {
    id: 'cpu',
    titleKey: 'guideCpuTitle',
    bodyKey: 'guideCpuBody',
    tipKeys: ['guideCpuTip1', 'guideCpuTip2', 'guideCpuTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=CPU', labelKey: 'guideShopCpu' },
    ],
  },
  {
    id: 'gpu',
    titleKey: 'guideGpuTitle',
    bodyKey: 'guideGpuBody',
    tipKeys: ['guideGpuTip1', 'guideGpuTip2', 'guideGpuTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=GPU', labelKey: 'guideShopGpu' },
    ],
  },
  {
    id: 'motherboard',
    titleKey: 'guideMbTitle',
    bodyKey: 'guideMbBody',
    tipKeys: ['guideMbTip1', 'guideMbTip2', 'guideMbTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=Motherboard', labelKey: 'guideShopMb' },
    ],
  },
  {
    id: 'ram',
    titleKey: 'guideRamTitle',
    bodyKey: 'guideRamBody',
    tipKeys: ['guideRamTip1', 'guideRamTip2', 'guideRamTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=RAM', labelKey: 'guideShopRam' },
    ],
  },
  {
    id: 'storage',
    titleKey: 'guideStorageTitle',
    bodyKey: 'guideStorageBody',
    tipKeys: ['guideStorageTip1', 'guideStorageTip2', 'guideStorageTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=Storage', labelKey: 'guideShopStorage' },
    ],
  },
  {
    id: 'psu',
    titleKey: 'guidePsuTitle',
    bodyKey: 'guidePsuBody',
    tipKeys: ['guidePsuTip1', 'guidePsuTip2', 'guidePsuTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=PSU', labelKey: 'guideShopPsu' },
    ],
  },
  {
    id: 'case-cooling',
    titleKey: 'guideCaseCoolingTitle',
    bodyKey: 'guideCaseCoolingBody',
    tipKeys: ['guideCaseCoolingTip1', 'guideCaseCoolingTip2', 'guideCaseCoolingTip3'],
    shopLinks: [
      { to: '/products?department=pc-parts&category=Case', labelKey: 'guideShopCase' },
      { to: '/products?department=pc-parts&category=Cooling', labelKey: 'guideShopCooling' },
    ],
  },
]

export const PC_GUIDE_COMPATIBILITY_SECTION: PcGuideSection = {
  id: 'compatibility',
  titleKey: 'guideCompatTitle',
  bodyKey: 'guideCompatBody',
  tipKeys: ['guideCompatTip1', 'guideCompatTip2', 'guideCompatTip3', 'guideCompatTip4'],
}

export const PC_GUIDE_NAV_SECTIONS: PcGuideSection[] = [
  ...PC_GUIDE_PART_SECTIONS,
  PC_GUIDE_COMPATIBILITY_SECTION,
]

/** For type-safe category references in docs only */
export const GUIDE_CATEGORIES: Category[] = [
  'CPU',
  'GPU',
  'Motherboard',
  'RAM',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]
