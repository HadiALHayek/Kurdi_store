import { AtSign, MapPin, Phone } from 'lucide-react'
import { useMemo } from 'react'
import { PickupInfoBar } from '../store/PickupInfoBar'
import { InstagramFeed } from '../ui/InstagramFeed'
import { useI18n } from '../../i18n'
import { hasInstagramInfo, hasStoreLocationInfo, useSettingsStore } from '../../store/settingsStore'
import { normalizeGoogleMapsEmbedUrl, toGoogleMapsOpenUrl } from '../../utils/maps'

export function StoreSocialSection() {
  const { t } = useI18n()
  const settings = useSettingsStore((s) => s.settings)

  const mapEmbedUrl = useMemo(
    () => normalizeGoogleMapsEmbedUrl(settings.googleMapsEmbedUrl, settings.address),
    [settings.googleMapsEmbedUrl, settings.address],
  )

  const mapOpenUrl = useMemo(
    () => toGoogleMapsOpenUrl(settings.googleMapsEmbedUrl, settings.address),
    [settings.googleMapsEmbedUrl, settings.address],
  )

  const showSocial = hasInstagramInfo(settings) || hasStoreLocationInfo(settings)

  return (
    <div className="space-y-6">
      <PickupInfoBar />

      {showSocial && (
        <section
          className={`section-enter grid gap-6 ${
            hasInstagramInfo(settings) && hasStoreLocationInfo(settings) ? 'lg:grid-cols-2' : 'lg:grid-cols-1'
          }`}
        >
          {hasInstagramInfo(settings) && (
            <article className="glass-card rounded-2xl p-6 shadow-glow">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand shadow-glow">
                  <AtSign size={20} />
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{t('instagramFeed')}</h3>
              </div>
              <InstagramFeed handle={settings.instagramHandle} profileUrl={settings.instagramUrl} />
            </article>
          )}

          {hasStoreLocationInfo(settings) && (
            <article className="glass-card rounded-2xl p-6 shadow-glow">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand-soft text-brand-cyan shadow-glow-cyan">
                  <MapPin size={20} />
                </span>
                <h3 className="font-display text-xl font-semibold text-white">{t('storeLocation')}</h3>
              </div>

              {mapEmbedUrl ? (
                <div className="space-y-3">
                  <iframe
                    title={t('storeLocation')}
                    src={mapEmbedUrl}
                    className="h-[220px] w-full rounded-lg border border-brand/40 sm:h-[300px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  {mapOpenUrl && (
                    <a
                      href={mapOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="button-pop btn-ghost inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                    >
                      <MapPin size={16} />
                      {t('openInGoogleMaps')}
                    </a>
                  )}
                </div>
              ) : (
                <div className="grid min-h-[120px] place-content-center rounded-lg border border-brand/30 bg-surface-2/70 p-4 text-center">
                  <p className="text-sm text-text-muted">{t('mapPlaceholder')}</p>
                  {settings.address.trim() && mapOpenUrl && (
                    <a
                      href={mapOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand"
                    >
                      <MapPin size={14} />
                      {t('openInGoogleMaps')}
                    </a>
                  )}
                </div>
              )}

              <div className="mt-4 space-y-2 text-sm text-text-muted">
                {settings.address.trim() && <p className="text-white">{settings.address}</p>}
                {settings.workingHours.trim() && <p>{settings.workingHours}</p>}
                {settings.phone.trim() && (
                  <p className="inline-flex items-center gap-2">
                    <Phone size={14} />
                    {settings.phone}
                  </p>
                )}
              </div>
            </article>
          )}
        </section>
      )}
    </div>
  )
}
