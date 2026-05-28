import type { Category, Product } from '../types'

type CurrentBuild = Partial<Record<Category, Product>>

const caseFormFactorMatrix: Record<string, string[]> = {
  ATX: ['ATX', 'mATX', 'ITX'],
  mATX: ['mATX', 'ITX'],
  ITX: ['ITX'],
}

const cpuSocketToRamTypes: Record<string, string[]> = {
  AM5: ['DDR5'],
  AM4: ['DDR4'],
  LGA1700: ['DDR4', 'DDR5'],
  LGA1851: ['DDR5'],
}

const toNumber = (value?: string) => Number.parseInt(value ?? '0', 10) || 0

const isCompatibleByCategory = (candidate: Product, build: CurrentBuild): boolean => {
  const cpu = build.CPU
  const motherboard = build.Motherboard
  const ram = build.RAM
  const gpu = build.GPU
  const psu = build.PSU
  const pcCase = build.Case

  if (candidate.category === 'Motherboard' && cpu) {
    return candidate.specs.socket === cpu.specs.socket
  }

  if (candidate.category === 'RAM') {
    if (motherboard) {
      return candidate.specs.memoryType === motherboard.specs.memoryType
    }
    if (cpu) {
      const allowed = cpuSocketToRamTypes[cpu.specs.socket] ?? ['DDR4', 'DDR5']
      return allowed.includes(candidate.specs.memoryType)
    }
  }

  if (candidate.category === 'PSU') {
    const cpuTdp = toNumber(cpu?.specs.tdp)
    const gpuTdp = toNumber(gpu?.specs.tdp)
    const required = cpuTdp + gpuTdp + 100
    return toNumber(candidate.specs.wattage) >= required
  }

  if (candidate.category === 'Case' && motherboard) {
    const accepted = caseFormFactorMatrix[candidate.specs.formFactor] ?? []
    return accepted.includes(motherboard.specs.formFactor)
  }

  if (candidate.category === 'Cooling' && cpu) {
    return toNumber(cpu.specs.tdp) <= toNumber(candidate.specs.tdpSupport)
  }

  if (candidate.category === 'CPU' && motherboard) {
    return motherboard.specs.socket === candidate.specs.socket
  }

  if (candidate.category === 'GPU' && psu) {
    const required = toNumber(cpu?.specs.tdp) + toNumber(candidate.specs.tdp) + 100
    return toNumber(psu.specs.wattage) >= required
  }

  if (candidate.category === 'Motherboard' && pcCase) {
    const accepted = caseFormFactorMatrix[pcCase.specs.formFactor] ?? []
    return accepted.includes(candidate.specs.formFactor)
  }

  if (candidate.category === 'Motherboard' && ram) {
    return candidate.specs.memoryType === ram.specs.memoryType
  }

  return true
}

export function getCompatibleProducts(
  products: Product[],
  category: Category,
  currentBuild: CurrentBuild,
): Product[] {
  return products.filter((product) => {
    if (product.category !== category || product.stock <= 0) return false
    return isCompatibleByCategory(product, currentBuild)
  })
}

export type IncompatReasonKey =
  | 'socketMotherboard'
  | 'memoryType'
  | 'psuWattage'
  | 'caseFormFactor'
  | 'coolerTdp'
  | 'gpuPsu'
  | 'cpuSocket'
  | 'generic'

export function getIncompatibilityReason(product: Product, build: CurrentBuild): IncompatReasonKey | null {
  if (isCompatibleByCategory(product, build)) return null

  switch (product.category) {
    case 'Motherboard':
      return 'socketMotherboard'
    case 'RAM':
      return 'memoryType'
    case 'PSU':
      return 'psuWattage'
    case 'Case':
      return 'caseFormFactor'
    case 'Cooling':
      return 'coolerTdp'
    case 'GPU':
      return 'gpuPsu'
    case 'CPU':
      return 'cpuSocket'
    default:
      return 'generic'
  }
}
