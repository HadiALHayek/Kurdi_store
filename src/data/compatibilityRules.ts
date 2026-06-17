import type { Category, Product } from '../types'
import {
  getNumericSpecMax,
  getSpecValues,
  specValuesOverlap,
} from '../utils/productSpecs'

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

function allowedRamTypesForCpu(cpu: Product): string[] {
  const types = new Set<string>()
  for (const socket of getSpecValues(cpu.specs, 'socket')) {
    for (const mem of cpuSocketToRamTypes[socket] ?? ['DDR4', 'DDR5']) {
      types.add(mem)
    }
  }
  return [...types]
}

function acceptedMbFormFactorsForCase(pcCase: Product): string[] {
  const accepted = new Set<string>()
  for (const formFactor of getSpecValues(pcCase.specs, 'formFactor')) {
    for (const mb of caseFormFactorMatrix[formFactor] ?? []) {
      accepted.add(mb)
    }
  }
  return [...accepted]
}

function motherboardFitsCase(motherboard: Product, pcCase: Product): boolean {
  const accepted = acceptedMbFormFactorsForCase(pcCase)
  return getSpecValues(motherboard.specs, 'formFactor').some((ff) => accepted.includes(ff))
}

function ramMatchesMemoryTypes(ram: Product, memoryTypes: string[]): boolean {
  return getSpecValues(ram.specs, 'memoryType').some((mem) => memoryTypes.includes(mem))
}

const isCompatibleByCategory = (candidate: Product, build: CurrentBuild): boolean => {
  const cpu = build.CPU
  const motherboard = build.Motherboard
  const ram = build.RAM
  const gpu = build.GPU
  const psu = build.PSU
  const pcCase = build.Case

  if (candidate.category === 'Motherboard' && cpu) {
    return specValuesOverlap(candidate.specs, 'socket', cpu.specs, 'socket')
  }

  if (candidate.category === 'RAM') {
    if (motherboard) {
      return specValuesOverlap(candidate.specs, 'memoryType', motherboard.specs, 'memoryType')
    }
    if (cpu) {
      return ramMatchesMemoryTypes(candidate, allowedRamTypesForCpu(cpu))
    }
  }

  if (candidate.category === 'PSU') {
    const cpuTdp = getNumericSpecMax(cpu?.specs ?? {}, 'tdp')
    const gpuTdp = getNumericSpecMax(gpu?.specs ?? {}, 'tdp')
    const required = cpuTdp + gpuTdp + 100
    return getNumericSpecMax(candidate.specs, 'wattage') >= required
  }

  if (candidate.category === 'Case' && motherboard) {
    return motherboardFitsCase(motherboard, candidate)
  }

  if (candidate.category === 'Cooling' && cpu) {
    return getNumericSpecMax(cpu.specs, 'tdp') <= getNumericSpecMax(candidate.specs, 'tdpSupport')
  }

  if (candidate.category === 'CPU' && motherboard) {
    return specValuesOverlap(candidate.specs, 'socket', motherboard.specs, 'socket')
  }

  if (candidate.category === 'GPU' && psu) {
    const required =
      getNumericSpecMax(cpu?.specs ?? {}, 'tdp') + getNumericSpecMax(candidate.specs, 'tdp') + 100
    return getNumericSpecMax(psu.specs, 'wattage') >= required
  }

  if (candidate.category === 'Motherboard' && pcCase) {
    return motherboardFitsCase(candidate, pcCase)
  }

  if (candidate.category === 'Motherboard' && ram) {
    return specValuesOverlap(candidate.specs, 'memoryType', ram.specs, 'memoryType')
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
