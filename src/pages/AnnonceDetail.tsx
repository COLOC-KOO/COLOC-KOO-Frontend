import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BedDouble, Calendar, Check, ChevronDown, Eye, Heart, MessageSquare, MapPin, Send, Share2, Shield, Users, Building2, X } from 'lucide-react'
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
  const [ownerCandidates, setOwnerCandidates] = useState<Array<{ id_candidature: number; id_utilisateur: number; statut: string; message: string | null; nom?: string; prenom?: string; email?: string; telephone?: string; profession?: string | null; age?: number | null; profile_picture?: string | null; ville_actuelle?: string | null; ville_origine?: string | null; bio?: string | null }>>([])
  const [candidateActionLoading, setCandidateActionLoading] = useState<number | null>(null)
  const [expandedCandidateId, setExpandedCandidateId] = useState<number | null>(null)
  const [launchLoading, setLaunchLoading] = useState(false)
  const [launchMessage, setLaunchMessage] = useState('')
  const [showMyCandidature, setShowMyCandidature] = useState(false)
  const [messageToCandidate, setMessageToCandidate] = useState<Record<number, string>>({})
  const [messageModalCandidate, setMessageModalCandidate] = useState<null | { id: number; userId: number; name: string }>(null)

  useEffect(() => {
    if (!id) return
    const loadAnnonce = async () => {
      try {
        const annonce = await api.annonce(id)
        if (annonce.statut !== 'active') {
          setNotFound(true)
          return
        }
        const mappedListing = annonceToListing(annonce)
        setListing(mappedListing)
        const [applied, candidates] = await Promise.all([
          user?.id ? api.checkUserApplied(id, user.id) : Promise.resolve({ hasApplied: false }),
          api.getCandidaturesByAnnonce(id).catch(() => []),
        ])
        setOwnerCandidates(candidates)
        if (user?.id) {
          setHasApplied(Boolean(applied?.hasApplied))
          setMyCandidature(applied?.hasApplied ? (candidates.find((item) => Number(item.id_utilisateur) === Number(user.id)) || null) as any : null)
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

  const handleSendMessageToCandidate = async (candidateId: number, candidateUserId: number) => {
    if (!id || !user) {
      navigate(`/auth?mode=signin&redirect=/annonces/${id}`)
      return
    }
    const messageText = (messageToCandidate[candidateId] || '').trim()
    if (!messageText) {
      setContactError('Le message est requis pour contacter ce colocataire.')
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactSuccess('')
    try {
      await api.sendMessage({
        id_destinataire: candidateUserId,
        id_annonce: Number(id),
        sujet: `Contact à propos de l'annonce ${id}`,
        contenu: messageText,
      })
      setContactSuccess('Message envoyé au colocataire.')
      setMessageToCandidate((prev) => ({ ...prev, [candidateId]: '' }))
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Impossible d’envoyer le message au colocataire.')
    } finally {
      setContactSubmitting(false)
    }
  }

  const handleSendMessageToOwner = async (candidateId: number) => {
    if (!id || !listing?.owner?.id || !user) {
      navigate(`/auth?mode=signin&redirect=/annonces/${id}`)
      return
    }
    const messageText = (messageToCandidate[candidateId] || '').trim()
    if (!messageText) {
      setContactError('Le message est requis pour contacter le propriétaire.')
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactSuccess('')
    try {
      await api.sendMessage({
        id_destinataire: listing.owner.id,
        id_annonce: Number(id),
        sujet: `Message depuis votre profil pour l'annonce ${id}`,
        contenu: messageText,
      })
      setContactSuccess('Message envoyé au propriétaire.')
      setMessageToCandidate((prev) => ({ ...prev, [candidateId]: '' }))
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Impossible d’envoyer le message au propriétaire.')
    } finally {
      setContactSubmitting(false)
    }
  }

  const openMessageModal = (candidate: { id_candidature: number; id_utilisateur: number; prenom?: string; nom?: string }) => {
    const fullName = [candidate.prenom, candidate.nom].filter(Boolean).join(' ').trim() || 'Candidat'
    setMessageModalCandidate({
      id: candidate.id_candidature,
      userId: Number(candidate.id_utilisateur),
      name: fullName,
    })
  }

  const toggleCandidateCard = (candidateId: number) => {
    setExpandedCandidateId((current) => (current === candidateId ? null : candidateId))
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

      {messageModalCandidate ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-foreground">Message à {messageModalCandidate.name}</div>
                <p className="mt-1 text-sm text-muted-foreground">Écris un message court et clair pour cette personne.</p>
              </div>
              <button
                type="button"
                onClick={() => setMessageModalCandidate(null)}
                className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              <textarea
                rows={5}
                value={messageToCandidate[messageModalCandidate.id] || ''}
                onChange={(event) => setMessageToCandidate((prev) => ({ ...prev, [messageModalCandidate.id]: event.target.value }))}
                placeholder={`Écris un message à ${messageModalCandidate.name}...`}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              />
              {contactError ? <p className="text-sm text-red-600">{contactError}</p> : null}
              {contactSuccess ? <p className="text-sm text-brand-cyan-dark">{contactSuccess}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMessageModalCandidate(null)}>
                Annuler
              </Button>
              <Button
                type="button"
                className="bg-brand-cyan text-white hover:bg-brand-cyan-dark"
                onClick={() => {
                  void handleSendMessageToCandidate(messageModalCandidate.id, messageModalCandidate.userId)
                  setMessageModalCandidate(null)
                }}
                disabled={contactSubmitting}
              >
                <Send className="mr-2 h-4 w-4" /> Envoyer
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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

          <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-900">
              <Building2 className="h-5 w-5" />
              <h2 className="bebas text-2xl">Colocataires liés à cette annonce</h2>
            </div>
            <p className="mt-2 text-sm text-cyan-800">
              Cette section affiche les candidatures réellement enregistrées dans la base pour cette annonce.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-sm text-cyan-700">
                {ownerCandidates.length} candidature{ownerCandidates.length > 1 ? 's' : ''} enregistrée{ownerCandidates.length > 1 ? 's' : ''}
              </span>
            </div>
            {ownerCandidates.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {ownerCandidates.map((candidate) => {
                  const fullName = [candidate.prenom, candidate.nom].filter(Boolean).join(' ').trim() || 'Candidat'
                  const isCurrentUserCard = Boolean(user?.id && Number(candidate.id_utilisateur) === Number(user.id))
                  const initials = `${(candidate.prenom || '').charAt(0)}${(candidate.nom || '').charAt(0)}`.toUpperCase() || 'C'
                  const isExpanded = expandedCandidateId === candidate.id_candidature
                  return (
                    <article key={candidate.id_candidature} className={`overflow-hidden rounded-2xl border border-cyan-200 bg-white/95 p-3 shadow-sm transition-all duration-200 ${isExpanded ? 'shadow-lg ring-1 ring-cyan-200' : 'shadow-sm'}`}>
                      <div className="flex items-start gap-3">
                        <button type="button" onClick={() => toggleCandidateCard(candidate.id_candidature)} className="flex-1 text-left">
                          <div className="flex items-start gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50">
                              {candidate.profile_picture ? (
                                <img src={candidate.profile_picture} alt={fullName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-cyan to-brand-green text-sm font-semibold text-white">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="truncate text-sm font-semibold text-slate-900">{fullName}</h3>
                                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-700">
                                  {candidate.statut || 'en_attente'}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-slate-600">
                                {candidate.profession || 'Profil à compléter'}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {typeof candidate.age === 'number' ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{candidate.age} ans</span>
                                ) : null}
                                {candidate.ville_actuelle ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{candidate.ville_actuelle}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>{isExpanded ? 'Réduire le profil' : 'Voir le profil complet'}</span>
                            <ChevronDown className={`h-4 w-4 text-cyan-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {!isCurrentUserCard ? (
                          <button
                            type="button"
                            onClick={() => openMessageModal(candidate as any)}
                            title={`Envoyer un message à ${fullName}`}
                            className="rounded-full border border-cyan-200 bg-cyan-50 p-2 text-cyan-700 transition hover:bg-cyan-100"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-3 border-t border-cyan-100 pt-3">
                          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                            {candidate.message || 'Aucun message supplémentaire fourni.'}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.profession ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{candidate.profession}</span>
                            ) : null}
                            {candidate.ville_actuelle ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">Ville actuelle : {candidate.ville_actuelle}</span>
                            ) : null}
                            {candidate.ville_origine ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">Origine : {candidate.ville_origine}</span>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.email ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{candidate.email}</span>
                            ) : null}
                            {candidate.telephone ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{candidate.telephone}</span>
                            ) : null}
                          </div>
                          {candidate.bio ? (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                              {candidate.bio}
                            </div>
                          ) : null}
                          {isCurrentUserCard ? (
                            <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan-light/50 p-3">
                              <div className="text-sm font-semibold text-brand-cyan-dark">Vous êtes déjà dans cette liste de colocataires.</div>
                              <p className="mt-1 text-sm text-cyan-800">Vous pouvez discuter de votre place dans cette annonce directement depuis votre espace de candidature ou votre messagerie.</p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-cyan-200 bg-white/70 p-6 text-center text-sm text-cyan-700">
                Aucune candidature n’est encore enregistrée pour cette annonce.
              </div>
            )}
          </section>

          {listing.typeBail && (
            <section className="mt-8">
              <h2 className="bebas text-2xl">Type de bail</h2>
              <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-brand-cyan-dark">
                  {listing.typeBail === 'collectif' ? 'Contrat collectif' : 'Bail individuel'}
                  {listing.clauseSolidarite ? ` ${listing.clauseSolidarite === 'avec' ? 'avec' : 'sans'} clause de solidarité` : ''}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {listing.typeBail === 'collectif'
                    ? 'Un seul contrat signé par tous.'
                    : 'Chaque colocataire signe son propre contrat avec le propriétaire.'}
                  {listing.clauseSolidarite === 'avec'
                    ? ' Tous les colocataires sont solidaires du loyer.'
                    : listing.clauseSolidarite === 'sans'
                      ? ' Chaque colocataire reste responsable de sa part.'
                      : ''}
                </div>
              </div>
            </section>
          )}
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
