import { Copy, FolderOpen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '../../i18n'
import { useBuilderStore } from '../../store/builderStore'
import { useProductsStore } from '../../store/productsStore'
import { useSavedBuildsStore } from '../../store/savedBuildsStore'
import { trackEvent } from '../../store/analyticsStore'

export function SavedBuildsPanel() {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const builds = useSavedBuildsStore((s) => s.builds)
  const save = useSavedBuildsStore((s) => s.save)
  const duplicate = useSavedBuildsStore((s) => s.duplicate)
  const remove = useSavedBuildsStore((s) => s.remove)
  const loadIntoBuilder = useSavedBuildsStore((s) => s.loadIntoBuilder)
  const build = useBuilderStore((s) => s.build)
  const loadBuild = useBuilderStore((s) => s.loadBuild)
  const products = useProductsStore((s) => s.products)

  return (
    <div className="rounded-xl border border-border bg-surface-2/60 p-4">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-white">
        <FolderOpen size={16} />
        {t('savedBuilds')}
      </p>
      <div className="mb-2 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('savedBuildName')}
          className="input-field flex-1 rounded-lg px-2 py-1.5 text-sm"
        />
        <button
          type="button"
          className="btn-primary rounded-lg px-3 py-1.5 text-xs font-semibold"
          disabled={Object.keys(build).length === 0}
          onClick={() => {
            save(name, build)
            setName('')
            trackEvent('builder_dropoff', { action: 'save_build' })
          }}
        >
          {t('saveBuild')}
        </button>
      </div>
      {builds.length === 0 ? (
        <p className="text-xs text-text-muted">{t('noSavedBuilds')}</p>
      ) : (
        <ul className="max-h-32 space-y-1 overflow-y-auto">
          {builds.map((sb) => (
            <li key={sb.id} className="flex items-center justify-between gap-2 rounded-lg bg-surface/80 px-2 py-1.5">
              <button
                type="button"
                className="truncate text-left text-xs font-medium text-brand-light hover:underline"
                onClick={() => {
                  const loaded = loadIntoBuilder(sb.id, products)
                  if (loaded) loadBuild(loaded)
                }}
              >
                {sb.name}
              </button>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  className="text-text-muted hover:text-brand-cyan"
                  title={t('duplicateBuild')}
                  onClick={() => duplicate(sb.id)}
                >
                  <Copy size={14} />
                </button>
                <button type="button" className="text-text-muted hover:text-danger" onClick={() => remove(sb.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
