import { AtSign, Camera, ExternalLink } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '../../i18n'
import { instagramEmbedUrl, instagramProfileUrl, parseInstagramUsername } from '../../utils/instagram'

interface InstagramFeedProps {
  handle: string
  profileUrl: string
}

const EMBED_TIMEOUT_MS = 6000

function InstagramPreviewGrid({ openUrl }: { openUrl: string }) {
  const { t } = useI18n()
  return (
    <div className="space-y-3">
      <p className="text-sm text-text-muted">{t('instagramPreviewNote')}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <a
            key={index}
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#833ab4]/40 via-[#fd1d1d]/30 to-[#fcb045]/35 transition duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-glow"
          >
            <Camera size={22} className="text-white/90 transition group-hover:scale-110" />
            <span className="mt-2 px-2 text-center text-[10px] text-white/80 sm:text-xs">
              {t('viewOnInstagram')}
            </span>
          </a>
        ))}
      </div>
      <a
        href={openUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:underline"
      >
        <ExternalLink size={14} />
        {t('openInstagramProfile')}
      </a>
    </div>
  )
}

function InstagramProfileEmbed({ embedSrc, openUrl }: { embedSrc: string; openUrl: string }) {
  const { t } = useI18n()
  const [loaded, setLoaded] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setTimedOut(true), EMBED_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [])

  if (timedOut) {
    return <InstagramPreviewGrid openUrl={openUrl} />
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-black">
      {!loaded && (
        <div className="absolute inset-0 z-10 grid place-content-center bg-surface/95 p-4 text-center text-sm text-text-muted">
          <div className="mb-2 h-8 w-8 animate-pulse rounded-full bg-accent/20" />
          {t('instagramLoading')}
        </div>
      )}
      <iframe
        title={t('instagramFeed')}
        src={embedSrc}
        className="h-[420px] w-full border-0 sm:h-[480px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

export function InstagramFeed({ handle, profileUrl }: InstagramFeedProps) {
  const { t } = useI18n()
  const username = useMemo(() => parseInstagramUsername(handle, profileUrl), [handle, profileUrl])
  const openUrl = profileUrl.trim() || (username ? instagramProfileUrl(username) : 'https://www.instagram.com/')
  const embedSrc = username ? instagramEmbedUrl(username) : null

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-text-muted">{handle || (username ? `@${username}` : '')}</p>

      <a
        href={openUrl}
        target="_blank"
        rel="noreferrer"
        className="button-pop btn-primary inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
      >
        <AtSign size={16} />
        {t('followOnInstagram')}
      </a>

      {embedSrc ? (
        <InstagramProfileEmbed key={embedSrc} embedSrc={embedSrc} openUrl={openUrl} />
      ) : (
        <InstagramPreviewGrid openUrl={openUrl} />
      )}
    </div>
  )
}
