import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Briefcase,
  Building2,
  CalendarClock,
  Heart,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  Users,
  X,
  Send
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiProfilRechercheLogement } from '../lib/api'
import { useAuth } from '../lib/auth'
import { LazyImage } from '../components/ui/LazyImage'

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80'

function uniqueProfiles(profiles: ApiProfilRechercheLogement[]) {
  return Array.from(new Map(profiles.map((profile) => [Number(profile.id_utilisateur), profile])).values())
}

export default function ProfilsRechercheLogement() {
  const { t, i18n } = useTranslation('profilsRecherche')
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
  
  // Modals state
  const [selectedProfile, setSelectedProfile] = useState<ApiProfilRechercheLogement | null>(null)
  const [contactTarget, setContactTarget] = useState<ApiProfilRechercheLogement | null>(null)
  
  // Formulaire de message
  const [messageSubject, setMessageSubject] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [messageStatus, setMessageStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const [currentUserProfile, setCurrentUserProfile] = useState<ApiProfilRechercheLogement | null>(null)

  const normalizedCity = city.trim()

  function formatDate(value: string | null | undefined) {
    if (!value) return t('messages.date_not_specified')
    return new Date(value).toLocaleDateString(i18n.language || 'fr-FR')
  }

  function profileName(profile: ApiProfilRechercheLogement) {
    return `${profile.prenom || ''} ${profile.nom || ''}`.trim() || t('modal.candidate_role')
  }

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
      roles: 'colocataire,proprietaire,agent',
      includeAllRoles: true,
    })
      .then((data) => {
        const unique = uniqueProfiles(data.profiles).filter((profile) => !user?.id || Number(profile.id_utilisateur) !== Number(user.id))
        setProfiles(unique)
        setTotal(data.total)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('messages.error_load'))
        setProfiles([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [normalizedCity, q, profession, maxAge, user?.id, t])

  useEffect(() => {
    if (!user) return
    api.me()
      .then((u) => {
        setCurrentUserProfile({
          id_utilisateur: u.id,
          nom: u.nom || '',
          prenom: u.prenom || '',
          age: u.age ?? null,
          bio: u.bio ?? null,
          profile_picture: u.profilePicture ?? null,
          profession: u.profession ?? null,
          est_verifie: false,
          date_inscription: u.createdAt ?? '',
          ville_actuelle: u.villeActuelle ?? null,
          ville_origine: u.villeOrigine ?? null,
          ville_recherchee: normalizedCity,
          demandes_count: 0,
          derniere_demande: '',
          annonces_demandees: [],
          email: u.email ?? null,
          telephone: u.telephone ?? null,
          poste: u.poste,
          role: u.role,
        })
      })
      .catch(() => {})
  }, [user, normalizedCity])

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

  // Ouverture de la modal pour rédiger un message
  function openContactModal(profile: ApiProfilRechercheLogement) {
    if (!user) {
      navigate(`/auth?mode=signin&redirect=${encodeURIComponent(`/profils-recherche-logement?ville=${normalizedCity}`)}`)
      return
    }
    setContactTarget(profile)
    setMessageSubject(t('messages.subject', { city: normalizedCity }))
    setMessageBody(t('messages.body', { name: profile.prenom || '', city: normalizedCity }))
    setMessageStatus(null)
  }

  // Soumission du message personnalisé
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!contactTarget) return

    setSendingMessage(true)
    setMessageStatus(null)
    try {
      await api.sendMessage({
        id_destinataire: contactTarget.id_utilisateur,
        sujet: messageSubject,
        contenu: messageBody,
      })
      setMessageStatus({ type: 'success', text: t('messages.success') })
      setTimeout(() => {
        setContactTarget(null)
        setMessageStatus(null)
      }, 1500)
    } catch (err) {
      setMessageStatus({
        type: 'error',
        text: err instanceof Error ? err.message : t('messages.error_send')
      })
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <SiteLayout>
      <section className="bg-white border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-8">
          <div className="flex flex-col items-center justify-center text-center gap-5">
            <div>
              <p className="text-sm font-semibold text-brand-cyan-dark">{t('banners.roommates_title')}</p>
              <h1 className="bebas text-3xl md:text-5xl text-foreground mt-1">
                {normalizedCity ? t('search.title_with_city', { city: normalizedCity }) : t('search.title_default')}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-2xl mx-auto">
                {loading
                  ? t('search.loading')
                  : t('search.subtitle', { count: total })}
              </p>
            </div>

            <div className="flex justify-center w-full my-2">
              <button
                type="button"
                onClick={() => navigate(`/depot_annonce${normalizedCity ? `?ville=${encodeURIComponent(normalizedCity)}` : ''}`)}
                className="flex items-center justify-center gap-4 bg-white border border-gray-200 hover:border-gray-300 rounded-lg px-8 py-4 shadow-sm hover:shadow transition-all text-center max-w-xl w-full"
              >
                <Pencil className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium text-gray-800 leading-tight">
                  {t('search.cta_banner_title')}<br />
                  {t('search.cta_banner_subtitle')}
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={submitSearch} className="mt-8 grid lg:grid-cols-[1.3fr_1fr_180px_140px] gap-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('search.placeholder_city')}
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('search.placeholder_query')}
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
            </div>
            <input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder={t('search.placeholder_profession')}
              className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                value={maxAge || ''}
                onChange={(e) => setMaxAge(Number(e.target.value || 0))}
                placeholder={t('search.placeholder_max_age')}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
              <Button type="submit" className="rounded-xl bg-brand-cyan text-white px-4">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {activeFilterCount > 0 && (
            <div className="text-center">
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
                {t('search.reset_filters')}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-6">
        <div className="mb-5 border border-brand-cyan/25 bg-brand-cyan/5 px-4 py-3 text-sm text-foreground flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Users className="w-4 h-4 text-brand-cyan-dark" />
            {t('banners.roommates_title')}
          </div>
          <p className="text-muted-foreground md:ml-auto">
            {t('banners.roommates_desc')}
          </p>
        </div>

        <div className="mb-4 rounded-xl bg-brand-green/5 border border-brand-green/20 px-4 py-3 text-sm text-foreground flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="w-4 h-4 text-brand-green-dark" />
            {t('banners.agencies_title')}
          </div>
          <p className="text-muted-foreground md:ml-auto">
            {t('banners.agencies_desc')}
          </p>
        </div>

        {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {!loading && normalizedCity && profiles.length === 0 && !error && (
          <div className="text-center py-16 border border-dashed border-border bg-white">
            <UserRound className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h2 className="bebas text-2xl text-foreground">{t('empty.no_profiles', { city: normalizedCity })}</h2>
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
            {currentUserProfile && (
              <div 
                onClick={() => setSelectedProfile(currentUserProfile)}
                className="group text-left bg-brand-cyan-light/30 border-2 border-brand-cyan/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  <LazyImage
                    src={currentUserProfile.profile_picture || FALLBACK_AVATAR}
                    alt={profileName(currentUserProfile)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-brand-cyan text-white text-xs font-semibold px-2 py-1 inline-flex items-center gap-1">
                    <UserRound className="w-3 h-3" />
                    {t('card.my_profile')}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight">{profileName(currentUserProfile)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUserProfile.age ? t('modal.age_value', { age: currentUserProfile.age }) : t('card.age_not_specified')}
                    {currentUserProfile.profession ? ` - ${currentUserProfile.profession}` : ''}
                  </p>
                  <p className="mt-2 text-sm line-clamp-3 text-foreground">
                    {currentUserProfile.bio || t('card.default_bio')}
                  </p>
                  {currentUserProfile.telephone && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-cyan-dark font-semibold">
                      <Phone className="w-3 h-3" />
                      {currentUserProfile.telephone}
                    </div>
                  )}
                </div>
              </div>
            )}
            {profiles.map((profile) => (
              <button
                key={profile.id_utilisateur}
                type="button"
                onClick={() => setSelectedProfile(profile)}
                className="group text-left bg-card border border-border overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all w-full"
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
                      {t('card.verified')}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg leading-tight">{profileName(profile)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.age ? t('modal.age_value', { age: profile.age }) : t('card.age_not_specified')}
                    {profile.profession ? ` - ${profile.profession}` : ''}
                  </p>
                  <p className="mt-2 text-sm line-clamp-3 text-foreground">
                    {profile.bio || t('card.default_bio')}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t('card.requests_count', { count: profile.demandes_count })}</span>
                    <span>{t('card.since', { date: formatDate(profile.derniere_demande) })}</span>
                  </div>
                  {profile.sources?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {profile.sources.map((source) => (
                        <span key={source} className="rounded-full bg-brand-cyan-light px-2 py-0.5 text-[10px] font-semibold text-brand-cyan-dark">
                          {source === 'annonce' ? t('card.source_listing') : source === 'recherche' ? t('card.source_search') : t('card.source_applied')}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {profile.telephone && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-brand-cyan-dark font-semibold">
                      <Phone className="w-3 h-3" />
                      {profile.telephone}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* MODAL 1: Détails du profil sélectionné */}
      {selectedProfile && (
        <div className="fixed inset-0 z-[70] bg-black/60 p-4 grid place-items-center" onClick={() => setSelectedProfile(null)}>
          <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden grid lg:grid-cols-[0.9fr_1.1fr] shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="bg-black">
              <LazyImage
                src={selectedProfile.profile_picture || FALLBACK_AVATAR}
                alt={profileName(selectedProfile)}
                className="w-full h-full min-h-[360px] object-cover"
              />
            </div>
            <div className="p-6 overflow-y-auto flex flex-col justify-between">
              <div>
                <button onClick={() => setSelectedProfile(null)} className="float-right text-muted-foreground hover:text-foreground">
                  <X className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">{profileName(selectedProfile)}</h2>
                <p className="text-muted-foreground">
                  {selectedProfile.profession || selectedProfile.poste || t('modal.candidate_role')}{selectedProfile.age ? `, ${t('modal.age_value', { age: selectedProfile.age })}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                    <MapPin className="w-3 h-3" />
                    {t('modal.searching_in', { city: selectedProfile.ville_recherchee || normalizedCity })}
                  </span>
                  <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                    <CalendarClock className="w-3 h-3" />
                    {t('modal.last_request', { date: formatDate(selectedProfile.derniere_demande) })}
                  </span>
                  {selectedProfile.ville_actuelle && (
                    <span className="inline-flex items-center gap-1 border border-border px-2 py-1">
                      <Briefcase className="w-3 h-3" />
                      {t('modal.current_city', { city: selectedProfile.ville_actuelle })}
                    </span>
                  )}
                </div>

                <div className="mt-6 border-t border-border pt-5">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-brand-cyan" />
                    {t('modal.candidate_profile')}
                  </h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-7">
                    {selectedProfile.bio || t('modal.no_bio')}
                  </p>
                  {selectedProfile.profession && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('modal.profession_label')} <span className="text-foreground font-medium">{selectedProfile.profession}</span>
                    </p>
                  )}
                  {(selectedProfile.poste || selectedProfile.role) && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {t('modal.profile_type_label')} <span className="text-foreground font-medium">{selectedProfile.poste || selectedProfile.role}</span>
                    </p>
                  )}
                  {selectedProfile.age && (
                    <p className="text-sm text-muted-foreground">
                      {t('modal.age_label')} <span className="text-foreground font-medium">{t('modal.age_value', { age: selectedProfile.age })}</span>
                    </p>
                  )}
                </div>

                <div className="mt-6 border-t border-border pt-5 grid sm:grid-cols-2 gap-3">
                  {user ? (
                    <>
                      <a href={selectedProfile.telephone ? `tel:${selectedProfile.telephone}` : undefined} className="inline-flex items-center justify-center gap-2 bg-brand-green text-white px-4 py-3 font-semibold hover:opacity-90 transition">
                        <Phone className="w-4 h-4" />
                        {selectedProfile.telephone || t('modal.phone_not_provided')}
                      </a>
                      <Button onClick={() => openContactModal(selectedProfile)} className="rounded-none bg-brand-cyan text-white hover:bg-brand-cyan-dark">
                        <Mail className="w-4 h-4 mr-2" />
                        {t('modal.send_message')}
                      </Button>
                    </>
                  ) : (
                    <Link to={`/auth?mode=signin&redirect=${encodeURIComponent(`/profils-recherche-logement?ville=${normalizedCity}`)}`} className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-brand-cyan text-white px-4 py-3 font-semibold hover:bg-brand-cyan-dark transition">
                      <MessageCircle className="w-4 h-4" />
                      {t('modal.login_to_contact')}
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => navigate(`/deposer${normalizedCity ? `?ville=${encodeURIComponent(normalizedCity)}` : ''}`)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-cyan-dark hover:underline"
                >
                  <Heart className="w-4 h-4" />
                  {t('modal.post_ad_for_profile')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Écrire et envoyer un message */}
      {contactTarget && (
        <div className="fixed inset-0 z-[80] bg-black/60 p-4 grid place-items-center" onClick={() => setContactTarget(null)}>
          <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">
                Contacter {profileName(contactTarget)}
              </h3>
              <button onClick={() => setContactTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Sujet
                </label>
                <input
                  type="text"
                  required
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/40"
                  placeholder="Objet du message..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={5}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="w-full rounded-lg border border-border p-3 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/40 resize-none"
                  placeholder="Rédigez votre message ici..."
                />
              </div>

              {messageStatus && (
                <p className={`text-sm font-medium ${messageStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {messageStatus.text}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setContactTarget(null)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={sendingMessage}
                  className="bg-brand-cyan text-white hover:bg-brand-cyan-dark flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {sendingMessage ? 'Envoi...' : 'Envoyer le message'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SiteLayout>
  )
}