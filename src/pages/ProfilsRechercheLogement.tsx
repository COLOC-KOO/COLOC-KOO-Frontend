import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Briefcase, CalendarClock, Heart, Mail, MapPin, MessageCircle, Phone, Search, ShieldCheck, SlidersHorizontal, UserRound, Users } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiProfilRechercheLogement } from '../lib/api'
import { useAuth } from '../lib/auth'
import { LazyImage } from '../components/ui/LazyImage'

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'

function formatDate(value: string | null | undefined) {
  if (!value) return 'date non precisee'
  return new Date(value).toLocaleDateString('fr-FR')
}

function profileName(profile: ApiProfilRechercheLogement) {
  return `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Colocataire candidat'
}

export default function ProfilsRechercheLogement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const initialCity = searchParams.get('ville') || ''
  const [city, setCity] = useState(initialCity)
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [profession, setProfession] = useState(searchParams.get('profession') || '')
  const [maxAge, setMaxAge] = useState(Number(searchParams.get('maxAge') || 0))
  const [profiles, setProfiles] = useState<ApiProfilRechercheLogement[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedProfile, setSelectedProfile] = useState<ApiProfilRechercheLogement | null>(null)
  const [messageStatus, setMessageStatus] = useState('')

  const normalizedCity = city.trim()

  useEffect(() => {
    const ville = searchParams.get('ville') || ''
    setCity(ville)
    setQ(searchParams.get('q') || '')
    setProfession(searchParams.get('profession') || '')
    setMaxAge(Number(searchParams.get('maxAge') || 0))
  }, [searchParams])

  useEffect(() => {
    if (!normalizedCity) {
      setProfiles([])
      setTotal(0)
      return
    }

    setLoading(true)
    setError('')
    api.profilsRechercheLogement({
      ville: normalizedCity,
      q: q.trim() || undefined,
      profession: profession.trim() || undefined,
      maxAge: maxAge || undefined,
      months: 3,
    })
      .then((data) => {
        setProfiles(data.profiles)
        setTotal(data.total)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Impossible de charger les profils.')
        setProfiles([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [normalizedCity, q, profession, maxAge])

  const activeFilterCount = useMemo(() => {
    return [q.trim(), profession.trim(), maxAge > 0 ? String(maxAge) : ''].filter(Boolean).length
  }, [q, profession, maxAge])

  function submitSearch(event: React.FormEvent) {
    event.preventDefault()
    const next = new URLSearchParams()
    if (city.trim()) next.set('ville', city.trim())
    if (q.trim()) next.set('q', q.trim())
    if (profession.trim()) next.set('profession', profession.trim())
    if (maxAge > 0) next.set('maxAge', String(maxAge))
    setSearchParams(next)
  }

  async function sendMessage(profile: ApiProfilRechercheLogement) {
    if (!user) {
      navigate(`/auth?mode=signin&redirect=${encodeURIComponent(`/profils-recherche-logement?ville=${normalizedCity}`)}`)
      return
    }

    setMessageStatus('')
    try {
      await api.sendMessage({
        id_destinataire: profile.id_utilisateur,
        sujet: `Votre recherche de colocation a ${normalizedCity}`,
        contenu: `Bonjour ${profile.prenom || ''}, je propose un logement a ${normalizedCity} et votre profil m'interesse.`,
      })
      setMessageStatus('Message envoye avec succes.')
    } catch (err) {
      setMessageStatus(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    }
  }

  return (
    <SiteLayout>
      <section className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-brand-cyan-dark">Profils candidats</p>
              <h1 className="bebas text-3xl md:text-5xl text-foreground mt-1">
                {normalizedCity ? `Colocataires qui cherchent a ${normalizedCity}` : 'Trouver vos prochains locataires'}
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                {loading ? 'Chargement...' : `${total} personne${total > 1 ? 's' : ''} recherche${total > 1 ? 'nt' : ''} actuellement un logement dans cette ville, sur les 3 derniers mois.`}
              </p>
            </div>
            <Button
              onClick={() => navigate(`/deposer${normalizedCity ? `?ville=${encodeURIComponent(normalizedCity)}` : ''}`)}
              className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white"
            >
              Cliquer ici pour deposer une annonce et trouver gratuitement vos prochains locataires
            </Button>
          </div>

          <form onSubmit={submitSearch} className="mt-6 grid lg:grid-cols-[1.3fr_1fr_180px_140px] gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ville recherchee"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nom, bio, mot-cle"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
            </div>
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Profession"
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={maxAge || ''}
                onChange={(e) => setMaxAge(Number(e.target.value || 0))}
                placeholder="Age max"
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
              <Button type="submit" className="rounded-xl bg-brand-cyan text-white px-4">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setQ('')
                setProfession('')
                setMaxAge(0)
                const next = new URLSearchParams()
                if (normalizedCity) next.set('ville', normalizedCity)
                setSearchParams(next)
              }}
              className="mt-3 text-sm font-medium text-brand-cyan-dark hover:underline"
            >
              Reinitialiser les filtres
            </button>
          )}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-6">
        <div className="mb-5 border border-brand-cyan/25 bg-brand-cyan/5 px-4 py-3 text-sm text-foreground flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="w-4 h-4 text-brand-cyan-dark" />
            Mise en relation entre colocataires candidats
          </div>
          <p className="text-muted-foreground md:ml-auto">
            Ces profils peuvent aussi se regrouper pour creer leur propre colocation.
          </p>
        </div>

        {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {!loading && normalizedCity && profiles.length === 0 && !error && (
          <div className="text-center py-16 border border-dashed border-border bg-white">
            <UserRound className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="bebas text-2xl text-foreground">Aucun profil disponible pour {normalizedCity}</h2>
          </div>
        )}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => (
              <button
                key={profile.id_utilisateur}
                type="button"
                onClick={() => {
                  setSelectedProfile(profile)
                  setMessageStatus('')
                }}
                className="group text-left bg-card border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <LazyImage
                    src={profile.profile_picture || FALLBACK_AVATAR}
                    alt={profileName(profile)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {profile.est_verifie && (
                    <span className="absolute top-3 right-3 bg-white text-brand-green-dark text-xs font-semibold px-2 py-1 inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verifie
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight">{profileName(profile)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.age ? `${profile.age} ans` : 'Age non precise'}
                    {profile.profession ? ` - ${profile.profession}` : ''}
                  </p>
                  <p className="mt-2 text-sm line-clamp-3 text-foreground">
                    {profile.bio || 'Ce profil cherche une colocation dans cette ville.'}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{profile.demandes_count} demande{profile.demandes_count > 1 ? 's' : ''}</span>
                    <span>Depuis {formatDate(profile.derniere_demande)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedProfile && (
        <div className="fixed inset-0 z-[70] bg-black/60 p-4 grid place-items-center" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden grid lg:grid-cols-[0.9fr_1.1fr] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-black">
              <LazyImage
                src={selectedProfile.profile_picture || FALLBACK_AVATAR}
                alt={profileName(selectedProfile)}
                className="w-full h-full min-h-[360px] object-cover"
              />
            </div>
            <div className="p-6 overflow-y-auto">
              <button onClick={() => setSelectedProfile(null)} className="float-right text-2xl leading-none text-muted-foreground hover:text-foreground">
                x
              </button>
              <h2 className="text-2xl font-bold">{profileName(selectedProfile)}</h2>
              <p className="text-muted-foreground">
                {selectedProfile.profession || 'Colocataire candidat'}{selectedProfile.age ? `, ${selectedProfile.age} ans` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                  <MapPin className="w-3 h-3" />
                  Recherche a {selectedProfile.ville_recherchee || normalizedCity}
                </span>
                <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                  <CalendarClock className="w-3 h-3" />
                  Derniere demande le {formatDate(selectedProfile.derniere_demande)}
                </span>
                {selectedProfile.ville_actuelle && (
                  <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                    <Briefcase className="w-3 h-3" />
                    Ville actuelle : {selectedProfile.ville_actuelle}
                  </span>
                )}
              </div>
              <p className="mt-6 whitespace-pre-line text-sm leading-7">
                {selectedProfile.bio || 'Ce candidat n a pas encore complete sa presentation.'}
              </p>

              <div className="mt-6 border-t border-border pt-5 grid sm:grid-cols-2 gap-3">
                {user ? (
                  <>
                    <a href={selectedProfile.telephone ? `tel:${selectedProfile.telephone}` : undefined} className="inline-flex items-center justify-center gap-2 bg-brand-green text-white px-4 py-3 font-semibold">
                      <Phone className="w-4 h-4" />
                      {selectedProfile.telephone || 'Numero non renseigne'}
                    </a>
                    <Button onClick={() => sendMessage(selectedProfile)} className="rounded-none bg-brand-cyan text-white">
                      <Mail className="w-4 h-4 mr-2" />
                      Envoyer un message
                    </Button>
                  </>
                ) : (
                  <Link to={`/auth?mode=signin&redirect=${encodeURIComponent(`/profils-recherche-logement?ville=${normalizedCity}`)}`} className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-brand-cyan text-white px-4 py-3 font-semibold">
                    <MessageCircle className="w-4 h-4" />
                    Connectez-vous pour contacter cette personne
                  </Link>
                )}
              </div>
              {messageStatus && <p className="mt-3 text-sm font-medium text-brand-cyan-dark">{messageStatus}</p>}
              <button
                type="button"
                onClick={() => navigate(`/deposer${normalizedCity ? `?ville=${encodeURIComponent(normalizedCity)}` : ''}`)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan-dark hover:underline"
              >
                <Heart className="w-4 h-4" />
                Deposer une annonce pour ce profil
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}
