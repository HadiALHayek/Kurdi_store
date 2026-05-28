import { Clock, MapPin, Phone, Wrench } from 'lucide-react'
import { useI18n } from '../../i18n'
import { useSettingsStore } from '../../store/settingsStore'
import { toGoogleMapsOpenUrl } from '../../utils/maps'

export function PickupInfoBar() {
  const { t } = useI18n()
  const settings = useSettingsStore((s) => s.settings)
  const mapUrl = toGoogleMapsOpenUrl(settings.googleMapsEmbedUrl, settings.address)

  return (
    <section className="section-enter mb-6 rounded-2xl border border-brand/25 bg-gradient-brand-soft p-4 sm:p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-cyan">{t('pickupTitle')}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-2 text-sm text-text">
          <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
          {mapUrl ? (
            <a href={mapUrl} target="_blank" rel="noreferrer" className="hover:text-brand-light">
              {settings.address}
            </a>
          ) : (
            <span>{settings.address}</span>
          )}
        </div>
        <div className="flex items-start gap-2 text-sm text-text">
          <Clock size={16} className="mt-0.5 shrink-0 text-brand" />
          <span>{settings.workingHours}</span>
        </div>
        {settings.phone && (
          <div className="flex items-start gap-2 text-sm text-text">
            <Phone size={16} className="mt-0.5 shrink-0 text-brand" />
            <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-brand-light">
              {settings.phone}
            </a>
          </div>
        )}
        {settings.assemblyNote && (
          <div className="flex items-start gap-2 text-sm text-text sm:col-span-2 lg:col-span-1">
            <Wrench size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
            <span>{settings.assemblyNote}</span>
          </div>
        )}
      </div>
    </section>
  )
}
