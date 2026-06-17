import type { Category, ShopDepartment, StoreDepartmentConfig } from '../types'
import { findDepartmentById, getActiveDepartments, inferDepartmentFromProduct } from './shopDepartments'

const prebuiltSpecKeys = [
  'cpu',
  'gpu',
  'ram',
  'storage',
  'motherboard',
  'psu',
  'cooling',
  'resolutionTarget',
  'performanceTier',
  'os',
] as const

const compatibilitySpecKeys = ['socket', 'tdp', 'memoryType', 'wattage', 'formFactor', 'tdpSupport'] as const

const monitorSpecKeys = [
  'screenSize',
  'resolution',
  'refreshRate',
  'panelType',
  'responseTime',
  'aspectRatio',
  'hdr',
] as const

const laptopSpecKeys = [
  'cpu',
  'ram',
  'storage',
  'gpu',
  'screenSize',
  'screenResolution',
  'refreshRate',
  'battery',
  'weight',
  'os',
] as const

const keyboardSpecKeys = ['switchType', 'layout', 'connectivity', 'backlight', 'color'] as const
const mouseSpecKeys = ['dpi', 'connectivity', 'sensor', 'grip', 'color'] as const
const headsetSpecKeys = ['connectivity', 'microphone', 'surround', 'driverSize', 'color'] as const
const webcamSpecKeys = ['resolution', 'fps', 'microphone', 'connectivity'] as const
const cableSpecKeys = ['length', 'connectorType', 'linkSpeed'] as const
const otherAccessorySpecKeys = ['type', 'connectivity', 'color'] as const

const pcPartCategorySpecKeys: Partial<Record<Category, readonly string[]>> = {
  CPU: ['socket', 'tdp', 'cores'],
  Motherboard: ['socket', 'memoryType', 'formFactor', 'chipset'],
  RAM: ['memoryType', 'capacity', 'speed'],
  GPU: ['vram', 'tdp', 'memoryType'],
  Storage: ['capacity', 'interface', 'formFactor'],
  PSU: ['wattage', 'efficiency', 'modular'],
  Case: ['formFactor', 'color'],
  Cooling: ['tdpSupport', 'coolerType', 'radiatorSize'],
}

const accessoryCategorySpecKeys: Partial<Record<Category, readonly string[]>> = {
  Keyboard: keyboardSpecKeys,
  Mouse: mouseSpecKeys,
  Headset: headsetSpecKeys,
  Webcam: webcamSpecKeys,
  Cable: cableSpecKeys,
  'Other Accessory': otherAccessorySpecKeys,
}

export const PC_PART_CATEGORIES: Category[] = [
  'CPU',
  'Motherboard',
  'RAM',
  'GPU',
  'Storage',
  'PSU',
  'Case',
  'Cooling',
]

export const PREBUILT_CATEGORIES: Category[] = ['Prebuilt PC']

export const MONITOR_CATEGORIES: Category[] = ['Monitor']
export const LAPTOP_CATEGORIES: Category[] = ['Laptop']
export const ACCESSORY_CATEGORIES: Category[] = [
  'Keyboard',
  'Mouse',
  'Headset',
  'Webcam',
  'Cable',
  'Other Accessory',
]

export const DEPARTMENT_CATEGORIES: Record<ShopDepartment, Category[]> = {
  'pc-parts': PC_PART_CATEGORIES,
  prebuilt: PREBUILT_CATEGORIES,
  monitors: MONITOR_CATEGORIES,
  laptops: LAPTOP_CATEGORIES,
  accessories: ACCESSORY_CATEGORIES,
}

export const ALL_STORE_FILTER_CATEGORIES: Category[] = [
  ...PREBUILT_CATEGORIES,
  ...PC_PART_CATEGORIES,
  ...MONITOR_CATEGORIES,
  ...LAPTOP_CATEGORIES,
  ...ACCESSORY_CATEGORIES,
]

export function getStoreCategoryFilterOptions(
  department: ShopDepartment | null,
  departments?: StoreDepartmentConfig[],
): Array<Category | 'All'> {
  if (!department) return ['All', ...ALL_STORE_FILTER_CATEGORIES]
  const dept = findDepartmentById(department, getActiveDepartments(departments))
  return ['All', ...(dept?.categories ?? ALL_STORE_FILTER_CATEGORIES)]
}

export function categoriesForDepartment(
  department: ShopDepartment,
  departments?: StoreDepartmentConfig[],
): Category[] {
  return findDepartmentById(department, getActiveDepartments(departments))?.categories ?? []
}

export function defaultCategoryForDepartment(
  department: ShopDepartment,
  departments?: StoreDepartmentConfig[],
): Category {
  const cats = categoriesForDepartment(department, departments)
  return cats[0] ?? 'CPU'
}

const sharedValueOptions: Record<string, string[]> = {
  socket: ['AM4', 'AM5', 'LGA1700', 'LGA1851'],
  tdp: ['65', '95', '105', '120', '125', '165', '170', '200', '220', '253', '300'],
  memoryType: ['DDR4', 'DDR5'],
  wattage: ['450', '550', '650', '750', '850', '1000', '1200'],
  formFactor: ['ATX', 'mATX', 'ITX', '2.5"', 'M.2'],
  tdpSupport: ['95', '125', '170', '180', '220', '250', '280', '300'],
  cores: ['6', '8', '10', '12', '14', '16', '24'],
  chipset: ['B650', 'X670', 'B760', 'Z790', 'X870', 'Z890', 'H610', 'A620'],
  capacity: ['8GB', '16GB', '32GB', '64GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
  speed: ['DDR4-3200', 'DDR4-3600', 'DDR5-5200', 'DDR5-5600', 'DDR5-6000', 'DDR5-6400'],
  vram: ['4GB', '6GB', '8GB', '12GB', '16GB', '20GB', '24GB'],
  interface: ['NVMe Gen3', 'NVMe Gen4', 'NVMe Gen5', 'SATA III'],
  efficiency: ['80+ Bronze', '80+ Gold', '80+ Platinum', '80+ Titanium'],
  modular: ['Non-modular', 'Semi-modular', 'Fully modular'],
  coolerType: ['Tower Air', 'Low Profile Air', '120mm AIO', '240mm AIO', '360mm AIO'],
  radiatorSize: ['120mm', '240mm', '280mm', '360mm', '420mm'],
  color: ['Black', 'White', 'Silver', 'RGB'],
  cpu: [
    'Ryzen 5 7600',
    'Ryzen 7 9700X',
    'Ryzen 7 9800X3D',
    'Core i5-14600K',
    'Core i7-14700K',
    'Core Ultra 7 265KF',
    'Apple M3',
    'Apple M4',
  ],
  gpu: [
    'Integrated',
    'RTX 4050 6GB',
    'RTX 4060 8GB',
    'RTX 4070 12GB',
    'RTX 5070 12GB',
    'RTX 5080 16GB',
    'RX 7600 8GB',
    'RX 7900 XTX 24GB',
  ],
  ram: ['8GB DDR4', '16GB DDR4', '16GB DDR5', '32GB DDR5', '64GB DDR5'],
  storage: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB NVMe + 2TB HDD'],
  motherboard: ['B650 mATX', 'B760 ATX', 'X870 ATX', 'Z890 ATX'],
  psu: ['650W Gold', '750W Gold', '850W Gold', '1000W Gold', '1200W Platinum'],
  cooling: ['Tower Air Cooler', 'Dual Tower Air Cooler', '240mm AIO', '360mm AIO'],
  resolutionTarget: ['1080p', '1440p', '4K'],
  performanceTier: ['Entry', 'Mainstream', 'High-End', 'Extreme'],
  os: ['Windows 11 Home', 'Windows 11 Pro', 'No OS', 'FreeDOS'],
  screenSize: ['13.3"', '14"', '15.6"', '16"', '17.3"', '24"', '27"', '32"', '34"', '49"'],
  resolution: ['1920x1080', '2560x1440', '3840x2160', '3440x1440', '5120x1440'],
  screenResolution: ['1920x1080', '2560x1440', '3840x2160'],
  refreshRate: ['60Hz', '75Hz', '120Hz', '144Hz', '165Hz', '240Hz', '360Hz'],
  panelType: ['IPS', 'VA', 'OLED', 'TN', 'Mini-LED'],
  responseTime: ['0.5ms', '1ms', '4ms', '5ms'],
  aspectRatio: ['16:9', '16:10', '21:9', '32:9'],
  hdr: ['None', 'HDR400', 'HDR600', 'HDR1000', 'DisplayHDR True Black'],
  battery: ['50Wh', '60Wh', '70Wh', '80Wh', '99Wh'],
  weight: ['Under 1.5kg', '1.5–2kg', '2–2.5kg', 'Over 2.5kg'],
  switchType: ['Linear', 'Tactile', 'Clicky', 'Optical', 'Magnetic'],
  layout: ['60%', '65%', '75%', 'TKL', 'Full-size'],
  connectivity: ['Wired USB', 'Bluetooth', '2.4GHz Wireless', 'USB-C', 'Multi-device'],
  backlight: ['None', 'Single color', 'RGB'],
  dpi: ['800–3200', '3200–8000', '8000–16000', '16000+'],
  sensor: ['Optical', 'Laser', 'Hero', 'Focus Pro'],
  grip: ['Palm', 'Claw', 'Fingertip', 'Ambidextrous'],
  microphone: ['None', 'Built-in', 'Detachable', 'Noise cancelling'],
  surround: ['Stereo', '7.1 Virtual', '7.1 Physical'],
  driverSize: ['40mm', '50mm', '53mm'],
  fps: ['30fps', '60fps', '90fps'],
  length: ['0.5m', '1m', '1.5m', '2m', '3m'],
  connectorType: ['USB-A', 'USB-C', 'HDMI', 'DisplayPort', 'USB-C to HDMI'],
  linkSpeed: ['USB 2.0', 'USB 3.0', 'USB 3.2', 'Thunderbolt 4', 'HDMI 2.1'],
  type: ['Stand', 'Mouse pad', 'Hub', 'Adapter', 'Bag', 'Other'],
}

export { inferDepartmentFromProduct }

export function getAdminSpecKeys(department: ShopDepartment, category: Category): readonly string[] {
  if (category === 'Prebuilt PC' || department === 'prebuilt') return prebuiltSpecKeys
  if (PC_PART_CATEGORIES.includes(category) || department === 'pc-parts') {
    return pcPartCategorySpecKeys[category] ?? [...compatibilitySpecKeys]
  }
  if (category === 'Monitor' || department === 'monitors') return monitorSpecKeys
  if (category === 'Laptop' || department === 'laptops') return laptopSpecKeys
  return accessoryCategorySpecKeys[category] ?? otherAccessorySpecKeys
}

export function getAdminSpecValueOptions(key: string): string[] {
  return sharedValueOptions[key] ?? []
}

export function getAdminSpecConfig(department: ShopDepartment, category: Category) {
  const specKeys = getAdminSpecKeys(department, category)
  const valueOptionsByKey = Object.fromEntries(
    specKeys.map((key) => [key, getAdminSpecValueOptions(key)]),
  ) as Record<string, string[]>
  return { specKeys, valueOptionsByKey }
}

export function isBuilderCategory(category: Category): boolean {
  return PC_PART_CATEGORIES.includes(category) || category === 'Monitor'
}
