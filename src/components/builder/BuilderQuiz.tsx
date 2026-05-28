import { Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { resolveQuizPresetId, type QuizBudget, type QuizUse } from '../../data/builderQuiz'
import { useI18n } from '../../i18n'
import { trackEvent } from '../../store/analyticsStore'
import { useBuilderStore } from '../../store/builderStore'
import { useProductsStore } from '../../store/productsStore'
import { budgetPresets } from '../../data/budgetPresets'

interface BuilderQuizProps {
  open: boolean
  onClose: () => void
}

export function BuilderQuiz({ open, onClose }: BuilderQuizProps) {
  const { t } = useI18n()
  const products = useProductsStore((s) => s.products)
  const applyPreset = useBuilderStore((s) => s.applyPreset)
  const [step, setStep] = useState(0)
  const [use, setUse] = useState<QuizUse | null>(null)
  const [budget, setBudget] = useState<QuizBudget | null>(null)

  const reset = () => {
    setStep(0)
    setUse(null)
    setBudget(null)
  }

  const close = () => {
    reset()
    onClose()
  }

  const needsBudgetStep = use === 'gaming'
  const totalSteps = needsBudgetStep ? 2 : 1

  const finish = (selectedUse: QuizUse, selectedBudget: QuizBudget) => {
    const presetId = resolveQuizPresetId(selectedUse, selectedBudget)
    const preset = budgetPresets.find((p) => p.id === presetId)
    if (!preset) {
      trackEvent('builder_dropoff', { action: 'quiz_no_preset', use: selectedUse })
      return
    }
    const ok = applyPreset(presetId, products)
    trackEvent('builder_dropoff', {
      action: 'quiz_complete',
      preset: presetId,
      use: selectedUse,
    })
    if (ok) close()
  }

  const handleUseSelect = (value: QuizUse) => {
    setUse(value)
    if (value === 'gaming') {
      setStep(1)
    } else {
      finish(value, 'mid')
    }
  }

  return (
    <Modal open={open} onClose={close} title={t('builderQuizTitle')}>
      <p className="mb-4 text-sm text-text-muted">{t('builderQuizIntro')}</p>

      {step === 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t('quizStepUse')}</p>
          {(['gaming', 'office', 'creator', 'streaming'] as QuizUse[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleUseSelect(option)}
              className={`w-full rounded-xl border p-3 text-left transition hover:border-brand/50 ${
                use === option ? 'border-brand bg-brand/15' : 'border-border bg-surface-2/60'
              }`}
            >
              <p className="font-semibold text-white">{t(`quizUse_${option}`)}</p>
              <p className="mt-0.5 text-xs text-text-muted">{t(`quizUse_${option}Desc`)}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && use === 'gaming' && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">{t('quizStepBudget')}</p>
          {(['budget', 'mid', 'high'] as QuizBudget[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setBudget(option)
                finish('gaming', option)
              }}
              className={`w-full rounded-xl border p-3 text-left transition hover:border-brand/50 ${
                budget === option ? 'border-brand bg-brand/15' : 'border-border bg-surface-2/60'
              }`}
            >
              <p className="font-semibold text-white">{t(`quizBudget_${option}`)}</p>
              <p className="mt-0.5 text-xs text-text-muted">{t(`quizBudget_${option}Desc`)}</p>
            </button>
          ))}
          <button type="button" className="mt-2 text-sm text-brand-cyan hover:underline" onClick={() => setStep(0)}>
            ← {t('quizBack')}
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-text-muted">
        {t('quizProgress')
          .replace('{current}', String(step + 1))
          .replace('{total}', String(totalSteps))}
      </p>
    </Modal>
  )
}

export function BuilderQuizTrigger({ onOpen }: { onOpen: () => void }) {
  const { t } = useI18n()
  if (budgetPresets.length === 0) return null
  return (
    <button
      type="button"
      onClick={onOpen}
      className="button-pop w-full rounded-xl border border-brand-cyan/40 bg-brand-cyan/10 p-3 text-left transition hover:border-brand-cyan/60 hover:bg-brand-cyan/15"
    >
      <span className="inline-flex items-center gap-2 font-semibold text-brand-cyan">
        <Sparkles size={18} />
        {t('builderQuizCta')}
      </span>
      <p className="mt-1 text-xs text-text-muted">{t('builderQuizCtaDesc')}</p>
    </button>
  )
}
