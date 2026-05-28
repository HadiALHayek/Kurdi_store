export type QuizUse = 'gaming' | 'office' | 'creator' | 'streaming'
export type QuizBudget = 'budget' | 'mid' | 'high'

export function resolveQuizPresetId(use: QuizUse, budget: QuizBudget): string {
  if (use === 'office') return 'entry-1080p'
  if (use === 'creator') return 'creator-intel'
  if (use === 'streaming') return 'gaming-1440p'
  if (budget === 'budget') return 'entry-1080p'
  if (budget === 'high') return 'gaming-1440p'
  return 'gaming-1440p'
}
