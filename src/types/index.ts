export type Category =
  | 'Prebuilt PC'
  | 'CPU'
  | 'Motherboard'
  | 'RAM'
  | 'GPU'
  | 'Storage'
  | 'PSU'
  | 'Case'
  | 'Cooling'
  | 'Monitor'
  | 'Laptop'
  | 'Keyboard'
  | 'Mouse'
  | 'Headset'
  | 'Webcam'
  | 'Cable'
  | 'Other Accessory'

export type ShopDepartment = 'pc-parts' | 'prebuilt' | 'monitors' | 'laptops' | 'accessories'

export type BuilderSlotId =
  | 'CPU'
  | 'Motherboard'
  | 'RAM'
  | 'GPU'
  | 'Storage'
  | 'PSU'
  | 'Case'
  | 'Cooling'
  | 'Monitor'
  | 'Accessory'

export type UseCaseTag =
  | '1080p'
  | '1440p'
  | '4K'
  | 'gaming'
  | 'office'
  | 'streaming'
  | 'creator'
  | 'entry'
  | 'high-end'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  previousPrice?: number
  category: Category
  department?: ShopDepartment
  imageUrl: string
  imageUrls?: string[]
  specs: Record<string, string | string[]>
  stock: number
  createdAt: number
  sku?: string
  staffPick?: boolean
  discontinued?: boolean
  allowBackorder?: boolean
  staffNotes?: string
  useCaseTags?: UseCaseTag[]
  seoTitle?: string
  seoDescription?: string
  instagramPostUrl?: string
  bundleIds?: string[]
}

export type BuildMap = Partial<Record<BuilderSlotId, Product>>

export interface ProductBundle {
  id: string
  name: string
  productIds: string[]
  discountLabel?: string
}

export interface BuildTemplate {
  id: string
  name: string
  description?: string
  parts: Partial<Record<Category, string>>
}

export interface BuildSlot {
  category: Category
  label: string
  selected: Product | null
  compatibleWith?: string[]
}

export interface SavedBuild {
  id: string
  name: string
  parts: Partial<Record<Category, string>>
  updatedAt: number
}

export interface BuildGuide {
  id: string
  titleKey: string
  descKey: string
  imageUrl: string
  budget: number
  useCaseTags: UseCaseTag[]
  presetId?: string
  featuredProductIds?: string[]
}

export type AnalyticsEventType =
  | 'filter_apply'
  | 'builder_slot_view'
  | 'builder_dropoff'
  | 'add_to_builder'
  | 'compare_add'
  | 'guide_view'
  | 'print_build'
  | 'quote_request'

export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  payload: Record<string, string>
  at: number
}

export type LeadSource = 'builder' | 'contact' | 'product'

export interface CustomerQuoteRequest {
  id: string
  name: string
  phone: string
  partsSummary: string
  partCount: number
  total: number
  buildCode?: string
  source?: LeadSource
  createdAt: number
  /** Local-only: saved when API was unavailable */
  synced?: boolean
}
