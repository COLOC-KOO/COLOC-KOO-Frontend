import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Megaphone, X } from 'lucide-react'
import { useAuth } from '../../lib/auth'

const FIRST_DISPLAY_DELAY_MS = 30 * 1000
const DISPLAY_INTERVAL_MS = 3 * 60 * 1000
// Fermeture valable pour la visite en cours : en quittant la plateforme puis en
// revenant (ou en se reconnectant), les publicités réapparaissent.
const DISMISS_STORAGE_KEY = 'colockoo_ads_dismissed'

function readSession(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function writeSession(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value)
  } catch {
    // stockage indisponible : la publicité pourra simplement réapparaître
  }
}

function isDismissedForVisit(): boolean {
  return readSession(DISMISS_STORAGE_KEY) === '1'
}

/**
 * Pop-up publicitaire du MVP : une nouvelle publicité est affichée toutes les
 * 3 minutes. Son contenu alterne à chaque affichage et elle reste fermable.
 */
export default function AdvertisingPopup() {
  const { t } = useTranslation('home')
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [advertisementIndex, setAdvertisementIndex] = useState(0)
  // Le chemin courant est lu au déclenchement : le minuteur ne doit plus être
  // relancé à chaque navigation (sinon il n'atteignait jamais son échéance).
  const pathnameRef = useRef(pathname)
  pathnameRef.current = pathname

  // Une (re)connexion relance le cycle des publicités.
  useEffect(() => {
    if (!user) return
    writeSession(DISMISS_STORAGE_KEY, '0')
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const show = () => {
      // Ne pas afficher de publicité pendant la connexion ni dans le back-office.
      if (pathnameRef.current.startsWith('/admin') || pathnameRef.current === '/auth') return
      if (isDismissedForVisit()) return
      setAdvertisementIndex((current) => (current + 1) % 3)
      setIsOpen(true)
    }

    const firstTimer = window.setTimeout(show, FIRST_DISPLAY_DELAY_MS)
    const interval = window.setInterval(show, DISPLAY_INTERVAL_MS)

    return () => {
      window.clearTimeout(firstTimer)
      window.clearInterval(interval)
    }
  }, [])

  // La publicité disparaît si l'on arrive sur la connexion ou le back-office.
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname === '/auth') setIsOpen(false)
  }, [pathname])

  const close = () => {
    setIsOpen(false)
    writeSession(DISMISS_STORAGE_KEY, '1')
  }

  if (!isOpen) return null

  const advertisements = [
    { title: t('popup.ads.partners.title'), description: t('popup.ads.partners.description'), label: t('popup.ads.partners.label'), to: '/partenaires' },
    { title: t('popup.ads.services.title'), description: t('popup.ads.services.description'), label: t('popup.ads.services.label'), to: '/services' },
    { title: t('popup.ads.listings.title'), description: t('popup.ads.listings.description'), label: t('popup.ads.listings.label'), to: '/annonces' },
  ]
  const advertisement = advertisements[advertisementIndex]

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="advertising-popup-title" className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-brand-cyan to-brand-green px-6 pb-12 pt-6 text-white">
          <Megaphone className="h-7 w-7" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">{t('popup.advertising')}</p>
          <h2 id="advertising-popup-title" className="mt-1 text-2xl font-bold">{advertisement.title}</h2>
        </div>
        <button type="button" onClick={close} aria-label={t('popup.close')} className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25">
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pb-6 pt-5">
          <p className="text-sm leading-6 text-muted-foreground">{advertisement.description}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted">{t('popup.later')}</button>
            <Link to={advertisement.to} onClick={close} className="rounded-xl bg-brand-cyan px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-cyan-dark">{advertisement.label}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
