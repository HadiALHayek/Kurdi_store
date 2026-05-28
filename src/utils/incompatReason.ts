import type { IncompatReasonKey } from '../data/compatibilityRules'
import type { TranslationKey } from '../i18n'

const reasonToKey: Record<IncompatReasonKey, TranslationKey> = {
  socketMotherboard: 'incompatSocketMotherboard',
  memoryType: 'incompatMemoryType',
  psuWattage: 'incompatPsuWattage',
  caseFormFactor: 'incompatCaseFormFactor',
  coolerTdp: 'incompatCoolerTdp',
  gpuPsu: 'incompatGpuPsu',
  cpuSocket: 'incompatCpuSocket',
  generic: 'incompatGeneric',
}

export function incompatReasonTranslationKey(key: IncompatReasonKey): TranslationKey {
  return reasonToKey[key]
}
