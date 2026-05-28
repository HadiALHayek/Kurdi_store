import type { TranslationKey } from '../i18n'
import type { BuildGuide } from '../types'

type GuideKeys = {
  titleKey: Extract<
    TranslationKey,
    'guideEntryTitle' | 'guideGamingTitle' | 'guideCreatorTitle'
  >
  descKey: Extract<TranslationKey, 'guideEntryDesc' | 'guideGamingDesc' | 'guideCreatorDesc'>
}

export type StoreBuildGuide = BuildGuide & GuideKeys

/** No bundled demo guides — staff templates from Admin appear on the Guides page. */
export const buildGuides: StoreBuildGuide[] = []
