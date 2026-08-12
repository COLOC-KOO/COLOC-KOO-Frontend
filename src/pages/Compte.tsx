import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft, Bell, Check, FileText, Lock, MessageSquare, Send, Upload, User,
  Edit, Trash, AlertTriangle, X, Camera, Home, MapPin, DollarSign, Ruler,
  Calendar, Bed, Building2, Users, Image as ImageIcon, Heart, Search,
  Menu, ChevronLeft, UserPlus, Flag, Settings, ShieldCheck, ShieldOff, Eye,
  Archive, RefreshCw, ChevronDown, Download, Smartphone, Laptop, Fingerprint,
  LogOut, Key, EyeOff
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiAnnonce, AuthUser, AppareilConnecte, getWebSocketUrl, Langue } from '../lib/api'
import { useAuth } from '../lib/auth'
import TabProfil from './compte/TabProfil'
import TabMesAnnonces from './compte/TabMesAnnonces'
import TabPreference from './compte/TabPreference'
import TabMessagesV2 from './compte/TabMessagesV2'
import ConversationsPage from './compte/ConversationsPage'
import TabMesFavoris from './compte/TabMesFavoris'
<<<<<<< HEAD
import TabAlertes from './compte/TabAlertes'  // ✅ CORRECTION 1 : suppression de { ALERTES_MOCK }

import TabCompteDonnees from './compte/TabCompteDonnees'

/* ------------------------------------------------------------------ */
/*  Couleurs / tokens repris de la maquette (mappés sur les classes    */
/*  tailwind déjà existantes dans le projet : brand-cyan / brand-green */
/* ------------------------------------------------------------------ */
// --cy   -> brand-cyan
// --g2   -> brand-green
// --dark -> #2C2C2C
=======
import TabAlertes from './compte/TabAlertes'
>>>>>>> e1b237d (feat(compte): toggles RGPD/2FA, suppression compte et appareils connectes branches sur l'API)

/* ------------------------------------------------------------------ */
/*  Switch style maquette (pilule verte), utilisé pour 2FA + RGPD      */
/* ------------------------------------------------------------------ */
<<<<<<< HEAD
=======
function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? 'bg-brand-green' : 'bg-muted'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/*  SECURITE + DONNEES (RGPD, 2FA, suppression, appareils connectés)   */
/* ------------------------------------------------------------------ */
function TabSecu() {
  const { t } = useTranslation('compte')
  const { user, logout } = useAuth()
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // --- 2FA ---
  const [twoFA, setTwoFA] = useState(false)
  const [savingTwoFA, setSavingTwoFA] = useState(false)

  // --- RGPD ---
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false)
  const [partnerOptIn, setPartnerOptIn] = useState(false)

  // Synchroniser les toggles avec les données réelles de la base
  useEffect(() => {
    if (user) {
      setTwoFA(!!(user as any).two_fa_enabled)
      setAnalyticsOptIn(!!(user as any).rgpd_analytics)
      setPartnerOptIn(!!(user as any).rgpd_partenaires)
    }
  }, [user])

  const handleToggleTwoFA = async (value: boolean) => {
    setTwoFA(value)
    setSavingTwoFA(true)
    try {
      await api.updateSecuritySettings?.({ two_fa_enabled: value })
    } catch {
      setTwoFA(!value)
    } finally {
      setSavingTwoFA(false)
    }
  }

  // --- Appareils connectés (réels, via l'API) ---
  const [appareils, setAppareils] = useState<AppareilConnecte[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  // ✅ Charger les sessions depuis l'API
  const refreshSessions = async () => {
    setLoadingSessions(true)
    try {
      const sessions = await api.listSessions()
      setAppareils(sessions)
    } catch (err) {
      console.warn('Impossible de charger les sessions:', err)
      setAppareils([])
    } finally {
      setLoadingSessions(false)
    }
  }

  useEffect(() => {
    refreshSessions()
  }, [])

  const handleDisconnectOthers = async () => {
    setDisconnecting(true)
    try {
      await api.disconnectOtherDevices?.()
      // Recharge la liste pour ne garder que l'appareil actuel
      await refreshSessions()
    } catch {
      // silencieux
    } finally {
      setDisconnecting(false)
    }
  }

  // --- Vérification d'identité ---
  const identityVerified = false

  // Handlers RGPD qui appellent l'API
  const handleToggleAnalytics = async (value: boolean) => {
    setAnalyticsOptIn(value)
    try {
      await api.updateSecuritySettings?.({ rgpd_analytics: value })
    } catch {
      setAnalyticsOptIn(!value)
    }
  }

  const handleTogglePartners = async (value: boolean) => {
    setPartnerOptIn(value)
    try {
      await api.updateSecuritySettings?.({ rgpd_partenaires: value })
    } catch {
      setPartnerOptIn(!value)
    }
  }

  // --- Suppression de compte ---
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteAccount?.()
      setShowDeleteModal(false)
      logout()
    } catch {
      // on laisse le modal ouvert en cas d'erreur
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.current || !form.next || form.next.length < 8 || form.next !== form.confirm) {
      setMessage(t('passwordValidation'))
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage(t('passwordUpdateSuccess'))
      setForm({ current: form.current, next: '', confirm: '' })
      setShowPasswordModal(false)
    } catch {
      setMessage(t('passwordUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Key className="w-5 h-5 text-brand-green" />
        <h2 className="bebas text-2xl">Sécurité du compte</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Tes données sont chiffrées en transit (HTTPS) et au repos. Choisis un mot de passe solide pour protéger ton compte.
      </p>

      <div className="max-w-lg">
        <label className="block text-sm font-semibold text-foreground mb-1.5">Mot de passe actuel</label>
        <div className="relative">
          <input
            type={showCurrent ? 'text' : 'password'}
            value={form.current}
            onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))}
            className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm bg-muted/40"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {message && !showPasswordModal ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}

      <Button
        className="mt-6 bg-brand-green text-white hover:opacity-90"
        onClick={() => {
          setMessage('')
          setShowPasswordModal(true)
        }}
        disabled={!form.current}
      >
        Changer le mot de passe
      </Button>

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted hover:bg-muted/70"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-full bg-brand-green-light text-brand-green flex items-center justify-center mx-auto mb-3">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="bebas text-xl text-center mb-1">Changer le mot de passe</h3>
            <p className="text-sm text-muted-foreground text-center mb-5">
              Choisis un nouveau mot de passe, différent de l'ancien.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Nouveau mot de passe <span className="font-normal text-muted-foreground">— 8 caractères min.</span>
              </label>
              <div className="relative">
                <input
                  type={showNext ? 'text' : 'password'}
                  value={form.next}
                  onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2.5 pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {message ? <p className="mt-2 mb-2 text-sm text-brand-cyan-dark">{message}</p> : null}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-brand-green text-white rounded-lg py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {saving ? t('updating') : 'Valider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bloc 2FA + Appareils connectés */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Double authentification (2FA)</span>
              <span className="text-[10px] font-semibold bg-muted text-foreground/60 rounded-full px-2 py-0.5">recommandé</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              Reçois un code à la connexion pour sécuriser ton compte. Elle est <strong>obligatoire</strong> pour les comptes administrateurs.
            </p>
          </div>
          <Toggle checked={twoFA} onChange={handleToggleTwoFA} disabled={savingTwoFA} />
        </div>

        <div className="mt-5 pt-5 border-t border-border/60">
          <div className="text-sm font-bold mb-3">
            Appareils connectés
            {loadingSessions && <span className="ml-2 text-xs font-normal text-muted-foreground">Chargement...</span>}
          </div>
          {appareils.length === 0 && !loadingSessions ? (
            <p className="text-sm text-muted-foreground">Aucun appareil détecté.</p>
          ) : (
            <ul className="space-y-2">
              {appareils.map((a) => (
                <li key={a.id} className="flex items-center gap-2 text-sm text-foreground/80">
                  {a.type === 'mobile' ? (
                    <Smartphone className="w-4 h-4 text-brand-green" />
                  ) : (
                    <Laptop className="w-4 h-4 text-foreground/40" />
                  )}
                  <span>{a.label}</span>
                  <span className="text-muted-foreground">
                    · {a.courant ? 'cet appareil' : a.lieu}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={handleDisconnectOthers}
            disabled={disconnecting || appareils.length <= 1}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-muted disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" /> {disconnecting ? 'Déconnexion...' : 'Déconnecter les autres appareils'}
          </button>
        </div>
      </div>

      {/* Bloc Vérification d'identité */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <Fingerprint className="w-5 h-5 text-brand-cyan" />
          <h3 className="bebas text-xl">Vérification d'identité</h3>
          <span className="text-[10px] font-semibold bg-muted text-foreground/60 rounded-full px-2 py-0.5">à venir · v2.0</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4 max-w-lg">
          Optionnelle. Une fois confirmée, un badge <strong>« Identité confirmée »</strong> rassure tes futurs colocataires. La vérification se fera via ton opérateur mobile (USSD : Telma / Orange / Airtel), sans frais de SMS.
        </p>
        <div className="flex gap-2">
          <button disabled className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 text-foreground/60 opacity-70 cursor-not-allowed">
            <ShieldOff className="w-4 h-4" /> Identité non confirmée
          </button>
          <button disabled className="inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 text-foreground/40 opacity-60 cursor-not-allowed">
            <Lock className="w-4 h-4" /> Bientôt disponible
          </button>
        </div>
      </div>

      {/* Bloc "Données personnelles" (RGPD) */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-brand-cyan" />
          <h3 className="bebas text-xl">Données personnelles</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Tu contrôles l'usage de tes données, conformément au RGPD.</p>
        <div className="flex items-start justify-between gap-4 py-3 border-b border-border/60">
          <div>
            <div className="text-sm font-semibold">Usage des données à des fins d'analyse anonymisée</div>
            <div className="text-xs text-muted-foreground mt-0.5">Aide à comprendre le marché de la colocation à Madagascar. Données anonymisées, jamais revendues.</div>
          </div>
          <Toggle checked={analyticsOptIn} onChange={handleToggleAnalytics} />
        </div>
        <div className="flex items-start justify-between gap-4 py-3">
          <div>
            <div className="text-sm font-semibold">Recevoir des informations des partenaires</div>
            <div className="text-xs text-muted-foreground mt-0.5">Offres solidaires, logement, emploi étudiant. Aucun démarchage commercial intrusif.</div>
          </div>
          <Toggle checked={partnerOptIn} onChange={handleTogglePartners} />
        </div>

        <div className="bg-brand-green/5 border border-brand-green/20 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-1.5 text-sm font-bold text-brand-green">
            <RefreshCw className="w-4 h-4" /> Conservation de tes données
          </div>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 list-disc list-inside">
            <li>Annonces et textes : archivés 5 ans (invisibles publiquement), puis purge automatique.</li>
            <li>Photos : conservées 1 an maximum.</li>
            <li>Tu peux demander l'export ou la suppression de tes données à tout moment.</li>
          </ul>
        </div>

        <button className="mt-4 inline-flex items-center gap-2 text-sm font-semibold border border-border rounded-lg px-4 py-2 hover:bg-muted">
          <Download className="w-4 h-4" /> Télécharger mes données
        </button>
      </div>

      {/* Zone danger */}
      <div className="mt-8 border border-red-300 bg-red-50 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="bebas text-xl text-red-700">Supprimer mon compte</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Cette action est définitive : tes annonces, alertes et conversations seront supprimées.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-2 text-sm font-semibold border border-red-600 text-red-600 rounded-lg px-4 py-2 hover:bg-red-600 hover:text-white transition-colors"
        >
          <Trash className="w-4 h-4" /> Supprimer définitivement mon compte
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 relative text-center">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-muted hover:bg-muted/70"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="bebas text-xl mb-2">Supprimer ton compte ?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Toutes tes données (annonces, alertes, conversations) seront définitivement effacées. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border border-border rounded-lg py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-red-600 text-red-600 rounded-lg py-2.5 text-sm font-semibold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50"
              >
                <Trash className="w-4 h-4" /> {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

>>>>>>> e1b237d (feat(compte): toggles RGPD/2FA, suppression compte et appareils connectes branches sur l'API)
/* ------------------------------------------------------------------ */
/*  PAGE COMPTE — header sombre + sidebar iconée, façon maquette       */
/* ------------------------------------------------------------------ */
export default function Compte() {
  const { t } = useTranslation('compte')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const [counters, setCounters] = useState({ favoris: 0, notifications: 0, messages: 0 })
  const [alertCount, setAlertCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarUpdating, setAvatarUpdating] = useState(false)
  const [avatarMessage, setAvatarMessage] = useState('')
  const isColocataire = user?.poste === 'colocataire'

  const tabs = [
    { id: 'profil', label: t('profile'), icon: User },
    { id: isColocataire ? 'favoris' : 'dossier', label: isColocataire ? t('myFavoritesTab') : 'Mes annonces', icon: isColocataire ? Heart : Home },
    { id: 'alertes', label: 'Mes alertes', icon: Bell },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: 'notif', label: 'Préférences', icon: Settings },
    { id: 'secu', label: 'Compte & données', icon: ShieldCheck },
  ]

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get('tab')
    if (!requestedTab) return 'profil'
    if (requestedTab === 'paiements' || requestedTab === 'messages') return 'paiements'
    if (requestedTab === 'conversations') return 'conversations'
    if (requestedTab === 'alertes') return 'alertes'
    if (requestedTab === 'favoris') return 'favoris'
    if (requestedTab === 'dossier') return isColocataire ? 'favoris' : 'dossier'
    if (requestedTab === 'notif') return 'notif'
    if (requestedTab === 'secu') return 'secu'
    if (requestedTab === 'profil') return 'profil'
    return 'profil'
  }
  const [tab, setTab] = useState(getInitialTab)

  useEffect(() => {
    setTab(getInitialTab())
  }, [location.search, isColocataire])

  useEffect(() => {
    if (!user) {
      setCounters({ favoris: 0, notifications: 0, messages: 0 })
      return
    }
    const refreshCounters = () => {
      api.counters().then(setCounters).catch(() => setCounters({ favoris: 0, notifications: 0, messages: 0 }))
    }
    refreshCounters()
    window.addEventListener('colockoo:counters-refresh', refreshCounters)
    window.addEventListener('colockoo:favori-removed', refreshCounters)
    return () => {
      window.removeEventListener('colockoo:counters-refresh', refreshCounters)
      window.removeEventListener('colockoo:favori-removed', refreshCounters)
    }
  }, [user])

  useEffect(() => {
    const userId = (user as any)?.id_utilisateur ?? (user as any)?.id
    if (!userId) return

    const API = 'http://localhost:4000'

    fetch(`${API}/api/alertes/${userId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAlertCount(Array.isArray(data) ? data.length : 0))
      .catch(() => setAlertCount(0))
  }, [user])

  const initials = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()
  const profileImageUrl = user?.profilePicture || (user as any)?.profile_picture || null
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || t('userProfile')
  const roleLabel = user?.poste === 'proprietaire' ? t('proprietaire') : user?.poste === 'colocataire' ? t('colocataire') : user?.poste || t('member')

  const membreDepuis = user?.date_inscription
    ? new Date(user.date_inscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'mars 2026'

  const badgeCountFor = (id: string) => {
    if (id === 'favoris') return counters.favoris
    if (id === 'notif') return counters.notifications
    if (id === 'paiements') return counters.messages
    if (id === 'alertes') return alertCount
    return 0
  }

  const handleProfileImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setAvatarUpdating(true)
    setAvatarMessage('')
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const uploaded = await api.uploadProfilePicture(formData)
      await updateProfile({ profile_picture: uploaded.profilePicture || null })
      setAvatarMessage('Photo de profil mise à jour')
    } catch {
      setAvatarMessage('Impossible de mettre à jour la photo de profil')
    } finally {
      setAvatarUpdating(false)
      event.target.value = ''
    }
  }

  const currentUserId = (user as any)?.id_utilisateur ?? (user as any)?.id ?? null

  return (
    <SiteLayout>
      {/* ---------- HEADER SOMBRE (façon maquette .account-head) ---------- */}
      <div className="bg-gradient-to-r from-[#2C2C2C] to-[#3a3a3a] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white text-4xl font-bold border-4 border-white/20 overflow-hidden">
              {loading ? '...' : profileImageUrl ? (
                <img src={profileImageUrl} alt={fullName} className="h-full w-full object-cover" />
              ) : initials}
            </div>
            <label className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-brand-cyan border-2 border-[#2C2C2C] flex items-center justify-center cursor-pointer hover:bg-brand-cyan-dark transition-colors">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
            </label>
          </div>
          <div className="min-w-0">
            <h1 className="bebas text-2xl sm:text-3xl leading-tight truncate">
              {loading ? 'Chargement...' : `Compte personnel de ${user?.prenom || fullName}`}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="bg-brand-green/20 text-brand-green border border-brand-green/40 rounded-full px-3 py-1 font-bold">
                {roleLabel}
              </span>
              <button
                onClick={() => navigate('/compte?tab=secu')}
                className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1 font-bold transition-colors"
              >
                {user?.verification ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" /> Identité vérifiée
                  </>
                ) : (
                  <>
                    <ShieldOff className="w-3.5 h-3.5" /> Identité non vérifiée
                  </>
                )}
              </button>
              <span className="flex items-center gap-1 text-white/60">
                <Calendar className="w-3.5 h-3.5" /> Membre depuis {membreDepuis}
              </span>
              {user?.ville && (
                <span className="flex items-center gap-1 text-white/60">
                  <MapPin className="w-3.5 h-3.5" /> {user.ville}
                </span>
              )}
            </div>
            {avatarMessage ? (
              <p className={`mt-2 text-sm ${avatarUpdating ? 'text-white/70' : 'text-brand-green-light'}`}>
                {avatarUpdating ? 'Mise à jour de la photo...' : avatarMessage}
              </p>
            ) : null}
          </div>
          <div className="ml-auto hidden md:flex items-center gap-2">
            {user && isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Building2 className="w-4 h-4" /> Administration
              </Button>
            )}
            {user && (
              <Button variant="outline" onClick={() => logout()} className="gap-2 bg-white/10 text-red-300 border-red-300/30 hover:bg-red-500 hover:text-white">
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ---------- CORPS : sidebar iconée + contenu ---------- */}
      <div className="w-full px-4 sm:px-6 py-8 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[220px_1fr] gap-6 items-start">
          {/* Sidebar desktop */}
          <aside className="hidden md:flex md:flex-col gap-1 bg-white rounded-2xl border border-border p-2 sticky top-20">
            {tabs.map((tItem) => {
              const count = badgeCountFor(tItem.id)
              const isActive = tab === tItem.id
              return (
                <Link
                  key={tItem.id}
                  to={`/compte?tab=${tItem.id}`}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isActive ? 'bg-brand-cyan-light text-brand-cyan-dark' : 'text-foreground/70 hover:bg-muted'
                  }`}
                >
                  <tItem.icon className={`w-[18px] h-[18px] ${isActive ? 'text-brand-cyan' : 'text-foreground/40'}`} />
                  <span>{tItem.label}</span>
                  {count > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1.5 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </Link>
              )
            })}
          </aside>

          {/* Sidebar mobile (scroll horizontal, comme la maquette en <760px) */}
          <nav className="md:hidden flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map((tItem) => {
              const count = badgeCountFor(tItem.id)
              const isActive = tab === tItem.id
              return (
                <button
                  key={tItem.id}
                  onClick={() => navigate(`/compte?tab=${tItem.id}`)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    isActive ? 'bg-brand-cyan-light text-brand-cyan-dark border-brand-cyan/30' : 'bg-white text-foreground/70 border-border'
                  }`}
                >
                  <tItem.icon className="w-4 h-4" />
                  {tItem.label}
                  {count > 0 && <span className="bg-brand-cyan text-white text-[10px] rounded-full px-1.5">{count}</span>}
                </button>
              )
            })}
          </nav>

          {/* Contenu */}
          <div className={tab === 'paiements' ? 'bg-white border border-border rounded-2xl shadow-sm overflow-hidden' : 'bg-white border border-border rounded-2xl p-6 shadow-sm'}>
            {tab === 'profil' && <TabProfil user={user} onSave={updateProfile} />}
            {tab === 'conversations' && <ConversationsPage />}
            {tab === 'alertes' && currentUserId && <TabAlertes idUtilisateur={currentUserId} />}
            {tab === 'dossier' && <TabMesAnnonces />}
            {tab === 'favoris' && <TabMesFavoris />}
            {tab === 'notif' && <TabPreference />}
            {tab === 'paiements' && <TabMessagesV2 />}
            {tab === 'secu' && <TabCompteDonnees />}
          </div>
        </div>
      </div>

      {/* Mobile fixed icon nav (identique à l'existant) */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
        <div className="bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-lg px-3 py-3 flex items-center justify-between">
          {['profil', 'conversations', 'alertes', 'notif', 'secu'].map((id) => {
            const item = tabs.find((x) => x.id === id)
            if (!item) return null
            const IconComp = item.icon
            const isActive = tab === id
            const count = badgeCountFor(id)
            return (
              <button
                key={id}
                onClick={() => navigate(`/compte?tab=${id}`)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors ${isActive ? 'bg-brand-cyan text-white' : 'text-foreground/80 hover:bg-muted/40'}`}
                aria-label={item.label}
              >
                <div className="relative">
                  <IconComp className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  {count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                      {count}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </nav>
    </SiteLayout>
  )
}
