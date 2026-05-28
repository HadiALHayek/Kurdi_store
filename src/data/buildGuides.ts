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

export const buildGuides: StoreBuildGuide[] = [
  {
    id: 'guide-entry-1080p',
    titleKey: 'guideEntryTitle',
    descKey: 'guideEntryDesc',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
    budget: 999,
    useCaseTags: ['1080p', 'gaming', 'entry'],
    presetId: 'entry-1080p',
  },
  {
    id: 'guide-gaming-1440p',
    titleKey: 'guideGamingTitle',
    descKey: 'guideGamingDesc',
    imageUrl: 'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=900&q=80',
    budget: 1699,
    useCaseTags: ['1440p', 'gaming', 'high-end'],
    presetId: 'gaming-1440p',
  },
  {
    id: 'guide-creator',
    titleKey: 'guideCreatorTitle',
    descKey: 'guideCreatorDesc',
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80',
    budget: 1899,
    useCaseTags: ['creator', 'office', '1440p'],
    presetId: 'creator-intel',
  },
]
