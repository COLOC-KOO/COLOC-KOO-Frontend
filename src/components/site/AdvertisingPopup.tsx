import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Megaphone, X } from 'lucide-react'

const DISPLAY_INTERVAL_MS = 3 * 60 * 1000

const ADVERTISEMENTS = [
  {
    title: 'Découvrez nos partenaires',
    description: 'Profitez de services utiles pour votre installation, votre déménagement et votre nouvelle colocation.',
    label: 'Voir les partenaires',
    to: '/partenaires',
  },
  {
    title: 'Simplifiez votre installation',
    description: 'Retrouvez les services Coloc-Koo pensés pour vous accompagner dans votre quotidien.',
    label: 'Découvrir les services',
    to: '/services',
  },
  {
    title: 'Votre futur logement vous attend',
    description: 'Parcourez les nouvelles annonces et trouvez une colocation adaptée à vos besoins.',
    label: 'Voir les annonces',
    to: '/annonces',
  },
]

/**
 * Pop-up publicitaire du MVP : une nouvelle publicité est affichée toutes les
 * 3 minutes. Son contenu alterne à chaque affichage et elle reste fermable.
 */
export default function AdvertisingPopup() {
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [advertisementIndex, setAdvertisementIndex] = useState(0)

  useEffect(() => {
    // Ne pas afficher de publicité pendant la connexion ni dans le back-office.
    if (pathname.startsWith('/admin') || pathname === '/auth') {
      setIsOpen(false)
      return
    }

    const interval = window.setInterval(() => {
      setAdvertisementIndex((current) => (current + 1) % ADVERTISEMENTS.length)
      setIsOpen(true)
    }, DISPLAY_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [pathname])

  const close = () => {
    setIsOpen(false)
  }

  if (!isOpen) return null

  const advertisement = ADVERTISEMENTS[advertisementIndex]

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 p-4 sm:items-center" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="advertising-popup-title" className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-gradient-to-r from-brand-cyan to-brand-green px-6 pb-12 pt-6 text-white">
          <Megaphone className="h-7 w-7" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/80">Publicité</p>
          <h2 id="advertising-popup-title" className="mt-1 text-2xl font-bold">{advertisement.title}</h2>
        </div>
        <button type="button" onClick={close} aria-label="Fermer la publicité" className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25">
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pb-6 pt-5">
          <p className="text-sm leading-6 text-muted-foreground">{advertisement.description}</p>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={close} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted">Plus tard</button>
            <Link to={advertisement.to} onClick={close} className="rounded-xl bg-brand-cyan px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-cyan-dark">{advertisement.label}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
