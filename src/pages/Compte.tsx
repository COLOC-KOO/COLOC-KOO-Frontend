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
import { api, ApiAnnonce, AuthUser, getWebSocketUrl, Langue } from '../lib/api'
import { useAuth } from '../lib/auth'
import TabProfil from './compte/TabProfil'
import TabMesAnnonces from './compte/TabMesAnnonces'
import TabPreference from './compte/TabPreference'
import TabMessagesV2 from './compte/TabMessagesV2'
import ConversationsPage from './compte/ConversationsPage'
import TabMesFavoris from './compte/TabMesFavoris'
import TabAlertes, { ALERTES_MOCK } from './compte/TabAlertes'
import TabCompteDonnees from './compte/TabCompteDonnees'

/* ------------------------------------------------------------------ */
/*  Couleurs / tokens repris de la maquette (mappés sur les classes    */
/*  tailwind déjà existantes dans le projet : brand-cyan / brand-green */
/* ------------------------------------------------------------------ */
// --cy   -> brand-cyan
// --g2   -> brand-green
// --dark -> #2C2C2C

/* ------------------------------------------------------------------ */
/*  Switch style maquette (pilule verte), utilisé pour 2FA + RGPD      */
/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/*  PAGE COMPTE — header sombre + sidebar iconée, façon maquette       */
/* ------------------------------------------------------------------ */
export default function Compte() {
  const { t } = useTranslation('compte')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const [counters, setCounters] = useState({ favoris: 0, notifications: 0, messages: 0 })
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

  const initials = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()
  const profileImageUrl = user?.profilePicture || (user as any)?.profile_picture || null
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || t('userProfile')
  const roleLabel = user?.poste === 'proprietaire' ? t('proprietaire') : user?.poste === 'colocataire' ? t('colocataire') : user?.poste || t('member')

  // "Membre depuis" — statique en attendant que le champ date_inscription soit exposé par l'API
  const membreDepuis = user?.date_inscription
    ? new Date(user.date_inscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : 'mars 2026'

  const badgeCountFor = (id: string) => {
    if (id === 'favoris') return counters.favoris
    if (id === 'notif') return counters.notifications
    if (id === 'paiements') return counters.messages
    if (id === 'alertes') return ALERTES_MOCK.length
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
            {tab === 'alertes' && <TabAlertes />}
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