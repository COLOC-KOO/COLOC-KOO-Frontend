import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BedDouble, Calendar, Check, Eye, Heart, MessageSquare, MapPin, Send, Share2, Shield, Users } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { annonceToListing, api } from '../lib/api'
import { roleLevel, useAuth } from '../lib/auth'
import { Listing } from '../types'
import { formatAr } from '../lib/utils'
import NotFound from './NotFound'

function StatItem({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-brand-cyan-light text-brand-cyan-dark flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <div>
        <div className="font-semibold text-sm">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

export default function AnnonceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [contactSubject, setContactSubject] = useState('Demande a propos de votre annonce')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactSuccess, setContactSuccess] = useState('')
  const [hasApplied, setHasApplied] = useState(false)
  const [myCandidature, setMyCandidature] = useState<null | { id_candidature: number; statut: string; message: string | null }>(null)
  const [ownerCandidates, setOwnerCandidates] = useState<Array<{ id_candidature: number; id_utilisateur: number; statut: string; message: string | null; nom?: string; prenom?: string; email?: string; telephone?: string }>>([])
  const [candidateActionLoading, setCandidateActionLoading] = useState<number | null>(null)
  const [launchLoading, setLaunchLoading] = useState(false)
  const [launchMessage, setLaunchMessage] = useState('')
  const [showMyCandidature, setShowMyCandidature] = useState(false)

  useEffect(() => {
    if (!id) return
    const loadAnnonce = async () => {
      try {
        const annonce = await api.annonce(id)
        if (annonce.statut !== 'active') {
          setNotFound(true)
          return
        }
        setListing(annonceToListing(annonce))
        if (user?.id) {
          const [applied, candidates] = await Promise.all([
            api.checkUserApplied(id, user.id),
            api.getCandidaturesByAnnonce(id),
          ])
          setHasApplied(Boolean(applied?.hasApplied))
          setMyCandidature(applied?.hasApplied ? (candidates.find((item) => Number(item.id_utilisateur) === Number(user.id)) || null) as any : null)
          setOwnerCandidates(candidates)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }

    loadAnnonce()
  }, [id, user?.id])

  const handleApply = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!id) return
    if (!user) {
      navigate(`/auth?mode=signin&redirect=/annonces/${id}`)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await api.createCandidature({
        id_annonce: Number(id),
        message: message.trim() || undefined,
        statut: 'en_attente',
      })
      setHasApplied(true)
      setMyCandidature({ id_candidature: 0, statut: 'en_attente', message: message.trim() || null })
      setShowMyCandidature(true)
      const refreshed = await api.getCandidaturesByAnnonce(id)
      setOwnerCandidates(refreshed)
      setMessage('')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible d’envoyer la candidature.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCandidateAction = async (candidateId: number, action: 'accept' | 'refuse' | 'discuss') => {
    if (!id) return
    setCandidateActionLoading(candidateId)
    try {
      await api.decideCandidature(candidateId, action)
      if (action === 'discuss') {
        setContactSuccess('Conversation ouverte avec le candidat.')
      } else {
        setContactSuccess(action === 'accept' ? 'Candidature acceptée.' : 'Candidature refusée.')
      }
      const refreshed = await api.getCandidaturesByAnnonce(id)
      setOwnerCandidates(refreshed)
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Impossible de traiter la candidature.')
    } finally {
      setCandidateActionLoading(null)
    }
  }

  const handleLaunchColocation = async () => {
    if (!id) return
    setLaunchLoading(true)
    setLaunchMessage('')
    try {
      await api.launchColocation(id)
      setLaunchMessage('La colocation a été lancée avec succès.')
    } catch (error) {
      setLaunchMessage(error instanceof Error ? error.message : 'Impossible de lancer la colocation.')
    } finally {
      setLaunchLoading(false)
    }
  }

  const isCapacityFull = Number(listing?.rooms || 0) >= 3
  const isOwnerOrAdmin = user
    ? roleLevel(user.poste) >= 2 || Number(listing?.owner.id) === Number(user.id)
    : false
  const canViewCandidatures = Boolean(user) && (isOwnerOrAdmin || hasApplied || Boolean(myCandidature))

  const handleViewMyCandidature = () => {
    if (!user) {
      navigate(`/auth?mode=signin&redirect=/annonces/${id}`)
      return
    }
    if (!id) return
    if (!canViewCandidatures) return
    navigate(`/candidatures?annonceId=${id}`)
  }

  const handleContactOwner = async () => {
    if (!id || !listing?.owner?.id) return
    if (!user) {
      navigate(`/auth?mode=signin&redirect=/annonces/${id}`)
      return
    }
    if (user.id === listing.owner.id) {
      setContactError('Vous ne pouvez pas vous envoyer un message à vous-même.')
      return
    }
    if (!contactMessage.trim()) {
      setContactError('Le message est requis.')
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactSuccess('')
    try {
      await api.sendMessage({
        id_destinataire: listing.owner.id,
        id_annonce: Number(id),
        sujet: contactSubject.trim(),
        contenu: contactMessage.trim(),
      })
      setContactSuccess('Message envoyé au propriétaire.')
      setContactMessage('')
    } catch (error) {
      setContactError(error instanceof Error ? error.message : "Impossible d'envoyer le message.")
    } finally {
      setContactSubmitting(false)
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="max-w-7xl mx-auto px-6 py-20 text-muted-foreground">Chargement...</div>
      </SiteLayout>
    )
  }

  if (notFound || !listing) return <NotFound />

  return (
    <SiteLayout>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/annonces" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Retour aux annonces
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-[2fr_1fr] gap-3 aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden">
          <img src={listing.gallery[0]} alt={listing.title} className="w-full h-full object-cover" />
          <div className="hidden md:grid grid-rows-2 gap-3">
            {listing.gallery.slice(1, 3).map((g, i) => (
              <img key={i} src={g} alt="" className="w-full h-full object-cover" />
            ))}
            {listing.gallery.length < 3 && <div className="bg-muted" />}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" /> {listing.district}, {listing.city}
          </div>
          <h1 className="bebas text-4xl mt-2">{listing.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-brand-green-light text-brand-green-dark px-3 py-1 rounded-full border border-brand-green/30">
              <Shield className="w-3 h-3" /> Annonce validee
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-3 py-1 rounded-full">
              {listing.type}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 border-y border-border py-6">
            <StatItem icon={<BedDouble />} value={`${listing.surface || '-'} m2`} label="Surface" />
            <StatItem icon={<Users />} value={`${listing.rooms}`} label="Colocataires" />
            <StatItem icon={<Shield />} value={
              listing.candidatureCount && listing.candidatureCount > 0
                ? 'Existants'
                : 'À créer'
            } label="Colocs" />
            <StatItem
              icon={<Check />}
              value={
                listing.candidatureCount && listing.candidatureCount > 0
                  ? String(listing.candidatureCount)
                  : 'Aucune'
              }
              label="Candidatures"
            />
          </div>

          <section className="mt-8">
            <h2 className="bebas text-2xl">Description</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{listing.description || 'Aucune description.'}</p>
          </section>

          <section className="mt-8">
            <h2 className="bebas text-2xl">Equipements</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {(listing.amenities.length ? listing.amenities : ['A preciser']).map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-green-dark" /> {a}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-baseline gap-2">
              <div className="bebas text-4xl text-brand-cyan-dark">{formatAr(listing.price)}</div>
              <div className="text-sm text-muted-foreground">/ mois</div>
            </div>
            <div className="mt-5 space-y-2">
              {user ? (
                <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan-light/50 p-3 text-sm">
                  <div className="font-semibold text-brand-cyan-dark">Connecté en tant que {user.prenom || user.name || user.email}</div>
                  <div className="text-muted-foreground mt-1">Tu peux envoyer ta candidature directement depuis cette page.</div>
                </div>
              ) : null}
              {user ? (
                Number(listing.owner.id) === Number(user.id) ? (
                  <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                    <div className="font-semibold text-foreground">Gestion des candidatures</div>
                    <p className="mt-2">La gestion des candidatures se fait depuis la page dédiée.</p>
                  </div>
                ) : hasApplied ? (
                  <div className="rounded-xl border border-brand-green/20 bg-brand-green-light/50 p-3 text-sm text-brand-green-dark">
                    <div className="font-semibold">Votre candidature a bien été enregistrée.</div>
                    <div className="mt-1 text-muted-foreground">Vous pouvez suivre l’avancement et voir les autres candidats de cette annonce.</div>
                    <Button type="button" size="sm" className="mt-3 w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white" onClick={handleViewMyCandidature}>
                      <Eye className="w-4 h-4" /> Voir ma candidature
                    </Button>
                    {showMyCandidature ? (
                      <div className="mt-3 space-y-3 text-left">
                        <div className="rounded-lg border border-brand-green/20 bg-background p-3">
                          <div className="font-semibold text-foreground">Ma candidature</div>
                          <div className="mt-2 text-xs text-muted-foreground">Statut actuel : {myCandidature?.statut || 'en_attente'}</div>
                          {myCandidature?.message ? <div className="mt-2 text-sm text-foreground">{myCandidature.message}</div> : <div className="mt-2 text-sm text-muted-foreground">Aucun message ajouté.</div>}
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="font-semibold text-foreground">Autres candidats</div>
                          <div className="mt-2 space-y-2">
                            {ownerCandidates.filter((candidate) => Number(candidate.id_utilisateur) !== Number(user.id)).length === 0 ? (
                              <div className="text-sm text-muted-foreground">Aucun autre candidat pour l’instant.</div>
                            ) : ownerCandidates
                              .filter((candidate) => Number(candidate.id_utilisateur) !== Number(user.id))
                              .map((candidate) => (
                                <div key={candidate.id_candidature} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{candidate.prenom || candidate.nom || 'Candidat'}</div>
                                    <div className="text-xs text-muted-foreground">{candidate.statut || 'en_attente'}</div>
                                  </div>
                                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">En attente</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="space-y-2">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      rows={4}
                      placeholder="Présentez-vous et ajoutez un message pour le propriétaire..."
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
                    />
                    <Button type="submit" className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11" disabled={submitting}>
                      {submitting ? 'Envoi en cours...' : 'Postuler a cette coloc'}
                    </Button>
                    {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
                  </form>
                )
              ) : (
                <Link to={`/auth?mode=signin&redirect=/annonces/${id}`}>
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11">
                    Se connecter pour postuler
                  </Button>
                </Link>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewCandidatures}
                  onClick={handleViewMyCandidature}
                >
                  <Eye className="w-4 h-4" /> Voir ma candidature
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" /> Partager
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Proprietaire</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center font-bold text-brand-green-dark">
                  {listing.owner.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    {listing.owner.name}
                    <Shield className="w-3.5 h-3.5 text-brand-cyan-dark" />
                  </div>
                  <div className="text-xs text-muted-foreground">Annonce verifiee par moderation</div>
                </div>
              </div>

              {user ? (
                listing.owner.id ? (
                  user.id === listing.owner.id ? (
                    <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                      Vous êtes le propriétaire de cette annonce.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Sujet
                      </label>
                      <input
                        value={contactSubject}
                        onChange={(event) => setContactSubject(event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
                        placeholder="Sujet du message"
                      />
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Message
                      </label>
                      <textarea
                        value={contactMessage}
                        onChange={(event) => setContactMessage(event.target.value)}
                        rows={4}
                        placeholder="Ecris ton message pour le propriétaire..."
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
                      />
                      {contactError ? <p className="text-sm text-red-600">{contactError}</p> : null}
                      {contactSuccess ? <p className="text-sm text-green-600">{contactSuccess}</p> : null}
                      <Button
                        type="button"
                        className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11"
                        disabled={contactSubmitting}
                        onClick={handleContactOwner}
                      >
                        {contactSubmitting ? 'Envoi en cours...' : 'Contacter le propriétaire'}
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                    Le propriétaire n'est pas disponible pour le moment.
                  </div>
                )
              ) : (
                <Link to={`/auth?mode=signin&redirect=/annonces/${id}`}>
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11">
                    Se connecter pour envoyer un message
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </SiteLayout>
  )
}
