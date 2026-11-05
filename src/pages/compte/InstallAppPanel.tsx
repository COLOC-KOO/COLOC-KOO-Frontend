import { useState } from 'react'
import { Download, Monitor, Share, Smartphone, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { canPromptInstall, isAppInstalled, promptInstall } from '../../lib/pwaInstall'

export default function InstallAppPanel({ compact = false, buttonLabel }: { compact?: boolean; buttonLabel?: string }) {
  const { t } = useTranslation('preferences')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'installed' | 'dismissed'>('idle')

  const openInstructions = () => {
    setStatus(isAppInstalled() ? 'installed' : 'idle')
    setIsOpen(true)
  }

  const install = async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') setStatus('installed')
    else if (outcome === 'dismissed') setStatus('dismissed')
  }

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={openInstructions}
          className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
        >
          <Download className="h-4 w-4" /> {buttonLabel}
        </button>
      ) : (
        <section className="rounded-2xl border border-border bg-white p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-brand-cyan" />
            <h2 className="bebas text-2xl">{t('displayNetwork.installApp')}</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('displayNetwork.installAppDesc')}</p>
          <button
            type="button"
            onClick={openInstructions}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-cyan-dark"
          >
            <Download className="h-4 w-4" /> {t('displayNetwork.installButton')}
          </button>
        </section>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 py-8" onClick={() => setIsOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="install-app-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" onClick={() => setIsOpen(false)} aria-label={t('displayNetwork.installModal.close')} className="absolute right-4 top-4 rounded-full bg-muted p-1.5 hover:bg-muted/70">
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-cyan-light text-brand-cyan-dark">
              <Download className="h-6 w-6" />
            </div>
            <h3 id="install-app-title" className="bebas mb-1 text-center text-2xl">{t('displayNetwork.installApp')}</h3>
            {status === 'installed' ? (
              <p className="mt-2 text-center text-sm text-muted-foreground">{t('displayNetwork.installModal.alreadyInstalled')}</p>
            ) : (
              <>
                <p className="mb-4 text-center text-sm text-muted-foreground">{t('displayNetwork.installModal.intro')}</p>
                {canPromptInstall() && (
                  <button type="button" onClick={install} className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-cyan-dark">
                    <Download className="h-4 w-4" /> {t('displayNetwork.installModal.installNow')}
                  </button>
                )}
                <ul className="space-y-3 text-sm text-foreground/80">
                  <li className="flex items-start gap-3"><Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span>{t('displayNetwork.installModal.android')}</span></li>
                  <li className="flex items-start gap-3"><Share className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span>{t('displayNetwork.installModal.ios')}</span></li>
                  <li className="flex items-start gap-3"><Monitor className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span>{t('displayNetwork.installModal.desktop')}</span></li>
                </ul>
                {status === 'dismissed' && <p className="mt-4 text-center text-xs text-muted-foreground">{t('displayNetwork.installModal.dismissed')}</p>}
              </>
            )}
            <button type="button" onClick={() => setIsOpen(false)} className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-semibold hover:bg-muted">
              {t('displayNetwork.installModal.close')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
