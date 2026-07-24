// AnnonceDetail.tsx - Version modifiée
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, BedDouble, Calendar, Check, ChevronDown, Eye, Heart, 
  MessageSquare, MapPin, Send, Share2, Shield, Users, Building2, X,
  User, Phone, Mail, Briefcase, MapPin as MapPinIcon, Calendar as CalendarIcon,
  Award, Star, ExternalLink
} from 'lucide-react'
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

// =============================================
// MODAL PROFIL UTILISATEUR
// =============================================
interface UserProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userData: {
    name: string
    age?: number
    budget?: string
    memberSince?: string
    avatar?: string
    bio?: string
    email?: string
    phone?: string
    profession?: string
    city?: string
    origin?: string
    status?: string
  }
}

function UserProfileModal({ isOpen, onClose, userData }: UserProfileModalProps) {
  if (!isOpen) return null

  const initials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-cyan to-brand-green">
              {userData.avatar ? (
                <img src={userData.avatar} alt={userData.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-foreground">{userData.name}</div>
              {userData.status && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Award className="w-3 h-3 text-brand-cyan" />
                  {userData.status}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {userData.budget && (
            <span className="rounded-full bg-brand-cyan-light px-3 py-1 text-sm font-semibold text-brand-cyan-dark">
              Budget max de {userData.budget}
            </span>
          )}
          {userData.memberSince && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Membre depuis {userData.memberSince}
            </span>
          )}
          <button className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-600 hover:bg-red-100 transition-colors">
            Signaler un problème
          </button>
        </div>

        {/* Bio */}
        {userData.bio && (
          <div className="mt-4 rounded-xl bg-muted/50 p-4">
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {userData.bio}
            </p>
          </div>
        )}

        {/* Informations de contact */}
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {userData.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{userData.email}</span>
            </div>
          )}
          {userData.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{userData.phone}</span>
            </div>
          )}
          {userData.profession && (
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{userData.profession}</span>
            </div>
          )}
          {userData.city && (
            <div className="flex items-center gap-3 text-sm">
              <MapPinIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{userData.city}</span>
            </div>
          )}
          {userData.origin && (
            <div className="flex items-center gap-3 text-sm">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Originaire de {userData.origin}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex flex-col gap-2">
          <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white">
            <Eye className="w-4 h-4 mr-2" /> Voir le profil
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <MessageSquare className="w-4 h-4 mr-2" /> Message
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" /> Lien
            </Button>
          </div>
        </div>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          <a href="#" className="hover:underline">https://lcrf.fr/77zz1b</a>
        </p>
      </div>
    </div>
  )
}

export default function AnnonceDetail() {
  const { t } = useTranslation(['annonceDetail', 'common'])
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [contactSubject, setContactSubject] = useState(t('annonceDetail:contact.defaultSubject'))
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

  // Modal profil utilisateur
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    userData: {
      name: string
      age?: number
      budget?: string
      memberSince?: string
      avatar?: string
      bio?: string
      email?: string
      phone?: string
      profession?: string
      city?: string
      origin?: string
      status?: string
    }
  }>({
    isOpen: false,
    userData: {
      name: '',
      age: 0,
      budget: '',
      memberSince: '',
      avatar: '',
      bio: '',
      email: '',
      phone: '',
      profession: '',
      city: '',
      origin: '',
      status: ''
    }
  })

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

  // Ouvrir le modal profil d'un utilisateur
  const openProfileModal = (userData: {
    name: string
    age?: number
    budget?: string
    memberSince?: string
    avatar?: string
    bio?: string
    email?: string
    phone?: string
    profession?: string
    city?: string
    origin?: string
    status?: string
  }) => {
    setProfileModal({
      isOpen: true,
      userData
    })
  }

  const closeProfileModal = () => {
    setProfileModal(prev => ({ ...prev, isOpen: false }))
  }

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
      setSubmitError(error instanceof Error ? error.message : t('annonceDetail:apply.error'))
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
        setContactSuccess(t('annonceDetail:candidates.discussSuccess'))
      } else {
        setContactSuccess(action === 'accept' ? t('annonceDetail:candidates.acceptSuccess') : t('annonceDetail:candidates.refuseSuccess'))
      }
      const refreshed = await api.getCandidaturesByAnnonce(id)
      setOwnerCandidates(refreshed)
    } catch (error) {
      setContactError(error instanceof Error ? error.message : t('annonceDetail:candidates.actionError'))
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
      setLaunchMessage(t('annonceDetail:launch.success'))
    } catch (error) {
      setLaunchMessage(error instanceof Error ? error.message : t('annonceDetail:launch.error'))
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
      setContactError(t('annonceDetail:contact.selfError'))
      return
    }
    if (!contactMessage.trim()) {
      setContactError(t('annonceDetail:contact.messageRequired'))
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
      setContactSuccess(t('annonceDetail:contact.success'))
      setContactMessage('')
    } catch (error) {
      setContactError(error instanceof Error ? error.message : t('annonceDetail:contact.error'))
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
      setContactError(t('annonceDetail:contact.messageRequired'))
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactSuccess('')
    try {
      await api.sendMessage({
        id_destinataire: candidateUserId,
        id_annonce: Number(id),
        sujet: t('annonceDetail:contact.candidateSubject', { id }),
        contenu: messageText,
      })
      setContactSuccess(t('annonceDetail:contact.success'))
      setMessageToCandidate((prev) => ({ ...prev, [candidateId]: '' }))
    } catch (error) {
      setContactError(error instanceof Error ? error.message : t('annonceDetail:contact.error'))
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
      setContactError(t('annonceDetail:contact.messageRequired'))
      return
    }

    setContactSubmitting(true)
    setContactError('')
    setContactSuccess('')
    try {
      await api.sendMessage({
        id_destinataire: listing.owner.id,
        id_annonce: Number(id),
        sujet: t('annonceDetail:contact.ownerSubject', { id }),
        contenu: messageText,
      })
      setContactSuccess(t('annonceDetail:contact.success'))
      setMessageToCandidate((prev) => ({ ...prev, [candidateId]: '' }))
    } catch (error) {
      setContactError(error instanceof Error ? error.message : t('annonceDetail:contact.error'))
    } finally {
      setContactSubmitting(false)
    }
  }

  const openMessageModal = (candidate: { id_candidature: number; id_utilisateur: number; prenom?: string; nom?: string }) => {
    const fullName = [candidate.prenom, candidate.nom].filter(Boolean).join(' ').trim() || t('annonceDetail:candidates.defaultName')
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
        <div className="max-w-7xl mx-auto px-6 py-20 text-muted-foreground">{t('common:common.loading')}</div>
      </SiteLayout>
    )
  }

  if (notFound || !listing) return <NotFound />

  return (
    <SiteLayout>
      {/* Modal Profil Utilisateur */}
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={closeProfileModal}
        userData={profileModal.userData}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/annonces" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> {t('annonceDetail:back')}
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
                <div className="text-lg font-semibold text-foreground">{t('annonceDetail:modal.title', { name: messageModalCandidate.name })}</div>
                <p className="mt-1 text-sm text-muted-foreground">{t('annonceDetail:modal.subtitle')}</p>
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
                placeholder={t('annonceDetail:modal.placeholder', { name: messageModalCandidate.name })}
                className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
              />
              {contactError ? <p className="text-sm text-red-600">{contactError}</p> : null}
              {contactSuccess ? <p className="text-sm text-brand-cyan-dark">{contactSuccess}</p> : null}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMessageModalCandidate(null)}>
                {t('common:common.cancel')}
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
                <Send className="mr-2 h-4 w-4" /> {t('common:common.send')}
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
              <Shield className="w-3 h-3" /> {t('annonceDetail:verified')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-muted px-3 py-1 rounded-full">
              {listing.type}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 border-y border-border py-6">
            <StatItem icon={<BedDouble />} value={`${listing.surface || '-'} m2`} label={t('annonceDetail:stats.surface')} />
            <StatItem icon={<Users />} value={`${listing.rooms}`} label={t('annonceDetail:stats.housemates')} />
            <StatItem icon={<Shield />} value={
              listing.candidatureCount && listing.candidatureCount > 0
                ? t('annonceDetail:stats.existing')
                : t('annonceDetail:stats.toCreate')
            } label={t('annonceDetail:stats.colocs')} />
            <StatItem
              icon={<Check />}
              value={
                listing.candidatureCount && listing.candidatureCount > 0
                  ? String(listing.candidatureCount)
                  : t('annonceDetail:stats.none')
              }
              label={t('annonceDetail:stats.applications')}
            />
          </div>

          <section className="mt-8">
            <h2 className="bebas text-2xl">{t('annonceDetail:sections.description')}</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">{listing.description || t('annonceDetail:noDescription')}</p>
          </section>

          <section className="mt-8">
            <h2 className="bebas text-2xl">{t('annonceDetail:sections.amenities')}</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {(listing.amenities.length ? listing.amenities : [t('annonceDetail:noAmenities')]).map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-brand-green-dark" /> {a}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-cyan-900">
              <Building2 className="h-5 w-5" />
              <h2 className="bebas text-2xl">{t('annonceDetail:sections.candidatesTitle')}</h2>
            </div>
            <p className="mt-2 text-sm text-cyan-800">
              {t('annonceDetail:sections.candidatesSubtitle')}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-sm text-cyan-700">
                {ownerCandidates.length} {ownerCandidates.length > 1 ? t('annonceDetail:sections.candidatesPlural') : t('annonceDetail:sections.candidatesSingular')}
              </span>
            </div>
            {ownerCandidates.length > 0 ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {ownerCandidates.map((candidate) => {
                  const fullName = [candidate.prenom, candidate.nom].filter(Boolean).join(' ').trim() || t('annonceDetail:candidates.defaultName')
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
                                  {candidate.statut || t('annonceDetail:candidates.statusPending')}
                                </span>
                              </div>
                              <p className="mt-1 truncate text-sm text-slate-600">
                                {candidate.profession || t('annonceDetail:candidates.noProfession')}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {typeof candidate.age === 'number' ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{candidate.age} {t('annonceDetail:candidates.age')}</span>
                                ) : null}
                                {candidate.ville_actuelle ? (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">{candidate.ville_actuelle}</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>{isExpanded ? t('annonceDetail:candidates.collapse') : t('annonceDetail:candidates.expand')}</span>
                            <ChevronDown className={`h-4 w-4 text-cyan-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        {/* Bouton Détails utilisateur pour chaque candidat */}
                        <button
                          type="button"
                          onClick={() => openProfileModal({
                            name: fullName,
                            age: candidate.age || undefined,
                            budget: '850 €',
                            memberSince: '3 mois',
                            avatar: candidate.profile_picture || undefined,
                            bio: candidate.bio || t('annonceDetail:profile.bio', { 
                              name: fullName, 
                              age: candidate.age || 27, 
                              city: candidate.ville_actuelle || 'Paris',
                              origin: candidate.ville_origine || 'Lyon'
                            }),
                            email: candidate.email || 'contact@email.com',
                            phone: candidate.telephone || '+33 6 12 34 56 78',
                            profession: candidate.profession || t('annonceDetail:profile.profession'),
                            city: candidate.ville_actuelle || 'Paris',
                            origin: candidate.ville_origine || 'Lyon',
                            status: 'Salariée, 26 ans'
                          })}
                          className="rounded-full border border-cyan-200 bg-cyan-50 p-2 text-cyan-700 transition hover:bg-cyan-100 flex-shrink-0"
                          title={t('annonceDetail:candidates.viewProfile')}
                        >
                          <User className="h-4 w-4" />
                        </button>
                      </div>
                      {isExpanded ? (
                        <div className="mt-3 space-y-3 border-t border-cyan-100 pt-3">
                          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                            {candidate.message || t('annonceDetail:candidates.noMessage')}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.profession ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{candidate.profession}</span>
                            ) : null}
                            {candidate.ville_actuelle ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{t('annonceDetail:candidates.currentCity')} {candidate.ville_actuelle}</span>
                            ) : null}
                            {candidate.ville_origine ? (
                              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{t('annonceDetail:candidates.originCity')} {candidate.ville_origine}</span>
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
                              <div className="text-sm font-semibold text-brand-cyan-dark">{t('annonceDetail:candidates.youAreCandidate')}</div>
                              <p className="mt-1 text-sm text-cyan-800">{t('annonceDetail:candidates.youAreCandidateDesc')}</p>
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
                {t('annonceDetail:sections.noCandidates')}
              </div>
            )}
          </section>

          {listing.typeBail && (
            <section className="mt-8">
              <h2 className="bebas text-2xl">{t('annonceDetail:sections.leaseType')}</h2>
              <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                <div className="font-semibold text-brand-cyan-dark">
                  {listing.typeBail === 'collectif' ? t('annonceDetail:lease.collective') : t('annonceDetail:lease.individual')}
                  {listing.clauseSolidarite ? ` ${listing.clauseSolidarite === 'avec' ? t('annonceDetail:lease.withSolidarity') : t('annonceDetail:lease.withoutSolidarity')}` : ''}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {listing.typeBail === 'collectif'
                    ? t('annonceDetail:lease.collectiveDesc')
                    : t('annonceDetail:lease.individualDesc')}
                  {listing.clauseSolidarite === 'avec'
                    ? t('annonceDetail:lease.withSolidarityDesc')
                    : listing.clauseSolidarite === 'sans'
                      ? t('annonceDetail:lease.withoutSolidarityDesc')
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
              <div className="text-sm text-muted-foreground">{t('annonceDetail:perMonth')}</div>
            </div>
            <div className="mt-5 space-y-2">
              {user ? (
                <div className="rounded-xl border border-brand-cyan/20 bg-brand-cyan-light/50 p-3 text-sm">
                  <div className="font-semibold text-brand-cyan-dark">{t('annonceDetail:user.connected', { name: user.prenom || user.name || user.email })}</div>
                  <div className="text-muted-foreground mt-1">{t('annonceDetail:user.connectedDesc')}</div>
                </div>
              ) : null}
              {user ? (
                Number(listing.owner.id) === Number(user.id) ? (
                  <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
                    <div className="font-semibold text-foreground">{t('annonceDetail:user.ownerTitle')}</div>
                    <p className="mt-2">{t('annonceDetail:user.ownerDesc')}</p>
                  </div>
                ) : hasApplied ? (
                  <div className="rounded-xl border border-brand-green/20 bg-brand-green-light/50 p-3 text-sm text-brand-green-dark">
                    <div className="font-semibold">{t('annonceDetail:user.applied')}</div>
                    <div className="mt-1 text-muted-foreground">{t('annonceDetail:user.appliedDesc')}</div>
                    <Button type="button" size="sm" className="mt-3 w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white" onClick={handleViewMyCandidature}>
                      <Eye className="w-4 h-4" /> {t('annonceDetail:user.viewApplication')}
                    </Button>
                    {showMyCandidature ? (
                      <div className="mt-3 space-y-3 text-left">
                        <div className="rounded-lg border border-brand-green/20 bg-background p-3">
                          <div className="font-semibold text-foreground">{t('annonceDetail:user.myApplication')}</div>
                          <div className="mt-2 text-xs text-muted-foreground">{t('annonceDetail:user.status')} {myCandidature?.statut || t('annonceDetail:user.statusPending')}</div>
                          {myCandidature?.message ? <div className="mt-2 text-sm text-foreground">{myCandidature.message}</div> : <div className="mt-2 text-sm text-muted-foreground">{t('annonceDetail:user.noMessage')}</div>}
                        </div>
                        <div className="rounded-lg border border-border bg-background p-3">
                          <div className="font-semibold text-foreground">{t('annonceDetail:user.otherCandidates')}</div>
                          <div className="mt-2 space-y-2">
                            {ownerCandidates.filter((candidate) => Number(candidate.id_utilisateur) !== Number(user.id)).length === 0 ? (
                              <div className="text-sm text-muted-foreground">{t('annonceDetail:user.noOtherCandidates')}</div>
                            ) : ownerCandidates
                              .filter((candidate) => Number(candidate.id_utilisateur) !== Number(user.id))
                              .map((candidate) => (
                                <div key={candidate.id_candidature} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                                  <div>
                                    <div className="text-sm font-semibold text-foreground">{candidate.prenom || candidate.nom || t('annonceDetail:candidates.defaultName')}</div>
                                    <div className="text-xs text-muted-foreground">{candidate.statut || t('annonceDetail:user.statusPending')}</div>
                                  </div>
                                  <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground">{t('annonceDetail:user.statusPending')}</span>
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
                      placeholder={t('annonceDetail:apply.placeholder')}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
                    />
                    <Button type="submit" className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11" disabled={submitting}>
                      {submitting ? t('common:common.loading') : t('annonceDetail:apply.submit')}
                    </Button>
                    {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
                  </form>
                )
              ) : (
                <Link to={`/auth?mode=signin&redirect=/annonces/${id}`}>
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11">
                    {t('annonceDetail:apply.loginToApply')}
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
                  <Eye className="w-4 h-4" /> {t('annonceDetail:actions.viewApplication')}
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" /> {t('annonceDetail:actions.share')}
                </Button>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{t('annonceDetail:owner.title')}</div>
                {/* Bouton Détails utilisateur pour le déposant */}
                <button
                  type="button"
                  onClick={() => openProfileModal({
                    name: listing.owner.name,
                    age: 35,
                    budget: '850 €',
                    memberSince: '1 an',
                    avatar: listing.owner.profilePicture || undefined,
                    bio: t('annonceDetail:profile.ownerBio', { name: listing.owner.name }),
                    email: 'proprietaire@email.com',
                    phone: '+33 6 98 76 54 32',
                    profession: t('annonceDetail:profile.ownerProfession'),
                    city: listing.city,
                    origin: 'Antananarivo',
                    status: 'Propriétaire'
                  })}
                  className="flex items-center gap-1 text-xs text-brand-cyan hover:text-brand-cyan-dark transition-colors"
                >
                  <User className="w-3 h-3" /> {t('annonceDetail:owner.viewProfile')}
                </button>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center font-bold text-brand-green-dark">
                  {listing.owner.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    {listing.owner.name}
                    <Shield className="w-3.5 h-3.5 text-brand-cyan-dark" />
                  </div>
                  <div className="text-xs text-muted-foreground">{t('annonceDetail:owner.verified')}</div>
                </div>
              </div>

              {user ? (
                listing.owner.id ? (
                  user.id === listing.owner.id ? (
                    <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground mt-4">
                      {t('annonceDetail:owner.self')}
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t('annonceDetail:contact.subject')}
                      </label>
                      <input
                        value={contactSubject}
                        onChange={(event) => setContactSubject(event.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-cyan"
                        placeholder={t('annonceDetail:contact.subjectPlaceholder')}
                      />
                      <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {t('annonceDetail:contact.message')}
                      </label>
                      <textarea
                        value={contactMessage}
                        onChange={(event) => setContactMessage(event.target.value)}
                        rows={4}
                        placeholder={t('annonceDetail:contact.messagePlaceholder')}
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
                        {contactSubmitting ? t('common:common.loading') : t('annonceDetail:contact.submit')}
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground mt-4">
                    {t('annonceDetail:owner.unavailable')}
                  </div>
                )
              ) : (
                <Link to={`/auth?mode=signin&redirect=/annonces/${id}`} className="mt-4 block">
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white h-11">
                    {t('annonceDetail:contact.loginToContact')}
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