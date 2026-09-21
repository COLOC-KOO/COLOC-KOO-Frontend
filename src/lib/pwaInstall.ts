// Installation de la plateforme sur l'écran d'accueil (PWA).
// Chrome / Edge / Android émettent `beforeinstallprompt` une seule fois, très
// tôt : on le capte dès le chargement (import dans main.tsx) pour pouvoir
// déclencher l'installation plus tard depuis l'onglet Préférences.

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
  })
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
  })
}

export function isAppInstalled() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function canPromptInstall() {
  return deferredPrompt !== null
}

// Ouvre la fenêtre d'installation native quand le navigateur la propose.
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable'
  const promptEvent = deferredPrompt
  deferredPrompt = null
  await promptEvent.prompt()
  const { outcome } = await promptEvent.userChoice
  return outcome
}
