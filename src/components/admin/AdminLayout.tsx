import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  FileText,
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  Users,
  Wallet,
  X,
  Gauge,
  ListChecks,
  MessageCircleWarning,
  History,
  BarChart3,
  Wrench,
  Store,
  Banknote,
  UserCog,
  Activity,
  BarChart,
  Code,
  Trash2,
  EyeOff
} from 'lucide-react'
import { Logo } from '../Logo'
import { roleLevel, useAuth } from '../../lib/auth'
import { api, type ApiPartenaireRequest, type BackofficeMember, type DemandeServiceStaffItem } from '../../lib/api'

interface ContactMessageItem {
  id_message: number
  nom: string
  email: string
  sujet: string
  message: string
  statut: string
  date_creation: string
}

// Interface pour les éléments de navigation
interface NavItem {
  to: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  minRole: number
  description: string
  exact?: boolean
}

interface NavSection {
  section: string
  minRole?: number
  items: NavItem[]
}

// Tous les éléments de navigation de la maquette
const navItems: NavSection[] = [
  {
    section: 'Modération',
    items: [
      { 
        to: '/admin', 
        label: 'Tableau de bord', 
        icon: Gauge, 
        exact: true, 
        minRole: 1,
        description: 'Vue d\'ensemble et objectifs'
      },
      { 
        to: '/admin/annonces', 
        label: 'File de validation des annonces', 
        icon: ListChecks, 
        // badge: 5, 
        minRole: 1,
        description: 'Annonces en attente de modération'
      },
      { 
        to: '/admin/signalements-conversations', 
        label: 'Signalements conversations', 
        icon: MessageCircleWarning, 
        // badge: 2, 
        minRole: 1,
        description: 'Conversations signalées'
      },
      { 
        to: '/admin/utilisateurs', 
        label: 'Utilisateurs', 
        icon: Users, 
        minRole: 1,
        description: 'Gestion des utilisateurs'
      },
      { 
        to: '/admin/messages', 
        label: 'Messages', 
        icon: MessageSquare, 
        minRole: 1,
        description: 'Modèles et historiques'
      },
      { 
        to: '/admin/journal-actions', 
        label: 'Journal d\'actions', 
        icon: History, 
        minRole: 1,
        description: 'Traçabilité des actions'
      },
    ]
  },
  {
    section: 'Gestion',
    minRole: 2,
    items: [
      { 
        to: '/admin/suivi-missions', 
        label: 'Suivi missions', 
        icon: BarChart3, 
        minRole: 2,
        description: 'Tableau de bord des missions'
      },
      { 
        to: '/admin/services-colockoo', 
        label: 'Services Coloc\'KOO', 
        icon: Wrench, 
        // badge: 3, 
        minRole: 2,
        description: 'Acquisition et offres'
      },
      { 
        to: '/admin/contrats-edl', 
        label: 'Contrats & EDL', 
        icon: FileText, 
        minRole: 2,
        description: 'Documents et états des lieux'
      },
      { 
        to: '/admin/partenaires', 
        label: 'Partenaires', 
        icon: Store, 
        minRole: 2,
        description: 'Comptes et campagnes'
      },
    ]
  },
  {
    section: 'Administration',
    minRole: 3,
    items: [
      { 
        to: '/admin/versements', 
        label: 'Versements', 
        icon: Banknote, 
        minRole: 3,
        description: 'Suivi des paiements'
      },
      { 
        to: '/admin/equipe-objectifs', 
        label: 'Équipe & objectifs', 
        icon: UserCog, 
        minRole: 3,
        description: 'Gestion des membres'
      },
      { 
        to: '/admin/configuration', 
        label: 'Configuration', 
        icon: Settings, 
        minRole: 3,
        description: 'Paramètres globaux'
      },
      { 
        to: '/admin/performances', 
        label: 'Performance', 
        icon: Activity, 
        minRole: 3,
        description: 'Qualité de service'
      },
      { 
        to: '/admin/statistiques-colocation', 
        label: 'Statistiques colocation', 
        icon: BarChart, 
        minRole: 3,
        description: 'Analyse des données'
      },
      { 
        to: '/admin/technique', 
        label: 'Technique (dév.)', 
        icon: Code, 
        minRole: 3,
        description: 'Indicateurs développeur'
      },
    ]
  }
]

// Données simulées pour le header
interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BackofficeMember[]>([])
  const [partnerRequests, setPartnerRequests] = useState<ApiPartenaireRequest[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessageItem[]>([])
  const [serviceDemandes, setServiceDemandes] = useState<DemandeServiceStaffItem[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const { user, logout } = useAuth()
  const viewRole = roleLevel(user?.poste)
  const location = useLocation()
  const navigate = useNavigate()

  // Filtrer les éléments de navigation selon le rôle
  const filteredNav = navItems
    .filter(section => section.minRole === undefined || viewRole >= section.minRole)
    .map(section => ({
      ...section,
      items: section.items.filter(item => viewRole >= (item.minRole || 1))
    }))
    .filter(section => section.items.length > 0)

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      setLoadingNotifications(true)
      try {
        const [requests, messages] = await Promise.all([
          api.backofficePartenaireRequests(),
          api.backofficeContactMessages(),
        ])
        if (active) {
          setPartnerRequests(requests)
          setContactMessages(messages)
        }
      } catch {
        if (active) {
          setPartnerRequests([])
          setContactMessages([])
        }
      } finally {
        if (active) setLoadingNotifications(false)
      }
      // Demandes de service : chargées à part pour ne pas impacter les autres
      // sources si l'appel échoue (ex. rôle sans accès).
      try {
        const demandes = await api.backofficeDemandesService()
        if (active) setServiceDemandes(demandes)
      } catch {
        if (active) setServiceDemandes([])
      }
    }

    loadNotifications()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (notificationOpen) {
      void refreshNotifications()
    }
  }, [notificationOpen])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }

    const timer = window.setTimeout(async () => {
      setLoadingSearch(true)
      try {
        const results = await api.backofficeMembers({ q: searchQuery.trim() })
        setSearchResults(results.slice(0, 5))
        setSearchOpen(true)
      } catch {
        setSearchResults([])
        setSearchOpen(true)
      } finally {
        setLoadingSearch(false)
      }
    }, 250)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const pendingPartnerRequests = partnerRequests.filter((item) => item.statut === 'en_attente')
  const pendingServiceDemandes = serviceDemandes.filter((item) => item.statut === 'nouvelle')
  const notificationCount =
    pendingPartnerRequests.length +
    contactMessages.filter((item) => item.statut === 'new').length +
    pendingServiceDemandes.length

  const openPartnerRequestsModal = () => {
    setNotificationOpen(false)
    setShowPartnerModal(true)
  }

  const handleSignalementNavigation = () => {
    setNotificationOpen(false)
    navigate('/admin/signalements-conversations')
  }

  const refreshNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const [requests, messages] = await Promise.all([
        api.backofficePartenaireRequests(),
        api.backofficeContactMessages(),
      ])
      setPartnerRequests(requests)
      setContactMessages(messages)
    } catch {
      setPartnerRequests([])
      setContactMessages([])
    } finally {
      setLoadingNotifications(false)
    }
    try {
      setServiceDemandes(await api.backofficeDemandesService())
    } catch {
      setServiceDemandes([])
    }
  }

  const handleDeleteContactMessage = async (id: number) => {
    try {
      await api.deleteBackofficeContactMessage(id)
      await refreshNotifications()
    } catch {
      // ignore
    }
  }

  const handleDeletePartnerRequest = async (id: number) => {
    try {
      await api.deleteBackofficePartenaireRequest(id)
      await refreshNotifications()
    } catch {
      // ignore
    }
  }

  // Masquer une demande de service de la cloche : on la passe en « en-cours »
  // (prise en compte) — elle disparaît des notifications « à vérifier ».
  const handleHideServiceDemande = async (reference: string) => {
    setServiceDemandes((prev) =>
      prev.map((item) => (item.reference === reference ? { ...item, statut: 'en-cours' } : item)),
    )
    try {
      await api.updateDemandeServiceStatut(reference, 'en-cours')
    } catch {
      await refreshNotifications()
    }
  }

  // Obtenir le titre de la page active
  const getPageTitle = () => {
    for (const section of filteredNav) {
      for (const item of section.items) {
        if (item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)) {
          return item.label
        }
      }
    }
    return 'Tableau de bord'
  }

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.005_260)] text-white/90">
      <div className="bg-black border-b border-white/10 px-4 py-2 flex items-center gap-4 flex-wrap text-xs sticky top-0 z-50">
        <span className="font-bold text-brand-olive tracking-wider">BACK-OFFICE</span>
        <span className="px-3 py-1 rounded border text-[11px] uppercase tracking-wider font-semibold bg-brand-cyan border-brand-cyan text-[oklch(0.15_0_0)]">
          {user?.poste || 'admin'}
        </span>
        <span className="ml-auto text-white/50">
          Connecte : <b className="text-white">{user?.name}</b>
        </span>
        <Link to="/" className="text-white/60 hover:text-white transition">
          ← Retour site public
        </Link>
      </div>

      <div className="flex">
        {/* Sidebar - comme dans la maquette */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-[41px] left-0 h-[calc(100vh-41px)] w-64 bg-[oklch(0.22_0.005_260)] border-r border-white/10 z-50 transition-transform flex flex-col overflow-y-auto`}
        >
          {/* Brand - comme dans la maquette */}
          <div className="p-4 border-b border-white/10">
            <div className="[&_span]:!text-white [&_.text-brand-cyan]:!text-brand-cyan">
              <Logo />
            </div>
            <div className="text-[10px] text-white/40 mt-1 tracking-wider font-bold">
              BACK-OFFICE SARINTANY'COLOC
            </div>
          </div>

          {/* Navigation - comme dans la maquette avec sections */}
          <nav className="p-3 flex-1">
            {filteredNav.map((section) => (
              <div key={section.section} className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-white/40 font-bold px-3 pb-2">
                  {section.section}
                </div>
                {section.items.map((item) => {
                  const isActive = item.exact 
                    ? location.pathname === item.to 
                    : location.pathname.startsWith(item.to)
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition group ${
                        isActive 
                          ? 'bg-brand-cyan/15 text-brand-cyan font-semibold' 
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      }`}
                      title={item.description}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-cyan' : 'text-white/50'}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            isActive ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-brand-magenta text-white'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* Footer sidebar - comme dans la maquette */}
          <div className="p-3 border-t border-white/10">
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white w-full transition"
            >
              <LogOut className="w-4 h-4" /> Deconnexion
            </button>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          {/* Header - comme dans la maquette */}
          <header className="h-14 border-b border-white/10 bg-[oklch(0.22_0.005_260)] flex items-center px-4 gap-3 sticky top-[41px] z-30">
            <button 
              className="lg:hidden p-1 rounded hover:bg-white/5 transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Titre de la page */}
            <h1 className="text-lg font-semibold text-white/90 hidden sm:block">
              {getPageTitle()}
            </h1>

            {/* Barre de recherche - comme dans la maquette */}
            <div className="relative flex-1 max-w-md ml-auto">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setSearchOpen(true)}
                  onBlur={() => window.setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Rechercher un utilisateur..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setSearchOpen(false)
                    }}
                    className="text-white/40 hover:text-white/70 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-white/10 bg-[oklch(0.20_0.005_260)] shadow-2xl z-40 overflow-hidden">
                  {loadingSearch ? (
                    <div className="px-3 py-3 text-sm text-white/60">Recherche en cours...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto">
                      {searchResults.map((result) => {
                        const fullName = [result.prenom, result.nom].filter(Boolean).join(' ').trim() || result.email
                        return (
                          <div key={result.id} className="px-3 py-2.5 hover:bg-white/5 border-b border-white/5 last:border-0">
                            <div className="text-sm font-medium text-white">{fullName}</div>
                            <div className="text-xs text-white/50">{result.email}</div>
                            <div className="text-[11px] uppercase tracking-wider text-brand-cyan mt-1">{result.role}</div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="px-3 py-3 text-sm text-white/60">Aucun résultat pour “{searchQuery}”.</div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications - comme dans la maquette */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationOpen((value) => !value)}
                className="relative p-2 rounded-lg hover:bg-white/5 transition"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-brand-magenta text-[9px] font-bold flex items-center justify-center text-white">
                    {notificationCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-white/10 bg-[oklch(0.20_0.005_260)] shadow-2xl z-40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-white">Notifications</div>
                      <div className="text-xs text-white/50">{loadingNotifications ? 'Chargement...' : `${notificationCount} élément(s) à vérifier`}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={openPartnerRequestsModal} className="text-xs text-brand-cyan hover:text-brand-cyan/90">Demandes</button>
                      <button type="button" onClick={handleSignalementNavigation} className="text-xs text-white/60 hover:text-white">Signalements</button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-4 text-sm text-white/60">Chargement des notifications...</div>
                    ) : partnerRequests.length === 0 && contactMessages.length === 0 && pendingServiceDemandes.length === 0 ? (
                      <div className="px-4 py-4 text-sm text-white/60">Aucune notification pour le moment.</div>
                    ) : (
                      <>
                        {partnerRequests.map((item) => (
                          <div key={item.id_demande} className="w-full px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5">
                            <button type="button" onClick={openPartnerRequestsModal} className="w-full text-left">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-sm font-medium text-white">{item.nom_entreprise || item.nom_contact}</div>
                                  <div className="text-xs text-white/50 mt-1">{item.email}</div>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider text-brand-cyan">{item.niveau_souhaite || 'À définir'}</span>
                              </div>
                              <p className="mt-2 text-xs text-white/60 line-clamp-2">{item.message || 'Nouvelle demande de partenariat reçue.'}</p>
                              <div className="mt-2 text-[11px] text-white/40">{new Date(item.date_creation).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                            </button>
                            <div className="mt-2 flex justify-end">
                              <button type="button" onClick={() => handleDeletePartnerRequest(item.id_demande)} className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white" title="Supprimer la notification">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {contactMessages.map((item) => (
                          <div key={item.id_message} className="w-full px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-white">{item.sujet}</div>
                                <div className="text-xs text-white/50 mt-1">{item.nom} · {item.email}</div>
                                <p className="mt-2 text-xs text-white/60 line-clamp-3">{item.message}</p>
                              </div>
                              <button type="button" onClick={() => handleDeleteContactMessage(item.id_message)} className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white" title="Supprimer la notification">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-white/40">
                              <span>{new Date(item.date_creation).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              <span className={`rounded-full px-2 py-0.5 ${item.statut === 'new' ? 'bg-brand-cyan/15 text-brand-cyan' : 'bg-white/10 text-white/70'}`}>
                                {item.statut === 'new' ? 'Nouveau' : item.statut}
                              </span>
                            </div>
                          </div>
                        ))}
                        {pendingServiceDemandes.map((item) => (
                          <div key={item.reference} className="w-full px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5">
                            <button
                              type="button"
                              onClick={() => { handleHideServiceDemande(item.reference); setNotificationOpen(false); navigate('/admin/services-colockoo') }}
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-white">Demande de service · {item.demandeur}</div>
                                  <p className="mt-1 text-xs text-white/60 line-clamp-2">{item.services.join(', ')}</p>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider text-brand-green whitespace-nowrap">{item.total.toLocaleString('fr-FR')} Ar</span>
                              </div>
                              <div className="mt-2 text-[11px] text-white/40">
                                {new Date(item.date_creation).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </button>
                            <div className="mt-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleHideServiceDemande(item.reference)}
                                className="inline-flex items-center gap-1 rounded px-2 py-1 text-[11px] text-white/50 hover:bg-white/10 hover:text-white"
                                title="Masquer cette notification"
                              >
                                <EyeOff className="w-3.5 h-3.5" /> Masquer
                              </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar - comme dans la maquette */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-sm font-bold flex-shrink-0">
              {user?.initials || 'A'}
            </div>
          </header>

          {/* Children */}
          <main className="p-6">{children}</main>
        </div>
      </div>

      {showPartnerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[oklch(0.20_0.005_260)] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Demandes de partenariat</h3>
                <p className="text-sm text-white/60">Consultez toutes les demandes envoyées via le formulaire public.</p>
              </div>
              <button type="button" onClick={() => setShowPartnerModal(false)} className="rounded-lg p-2 hover:bg-white/5 text-white/70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
              {partnerRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-white/60">
                  Aucune demande de partenariat pour le moment.
                </div>
              ) : (
                partnerRequests.map((item) => (
                  <div key={item.id_demande} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">{item.nom_entreprise || item.nom_contact}</div>
                        <div className="text-xs text-white/50">{item.email}</div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider ${item.statut === 'en_attente' ? 'bg-brand-cyan/15 text-brand-cyan' : 'bg-white/10 text-white/70'}`}>
                        {item.statut === 'en_attente' ? 'En attente' : item.statut}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2">
                      <div><span className="text-white/40">Téléphone :</span> {item.telephone ? `${item.telephone_code || '+261'} ${item.telephone}` : 'Non renseigné'}</div>
                      <div><span className="text-white/40">Secteur :</span> {item.secteur || 'Non précisé'}</div>
                      <div><span className="text-white/40">Niveau :</span> {item.niveau_souhaite || 'À définir'}</div>
                      <div><span className="text-white/40">Rappel :</span> {item.souhaite_rappel ? 'Oui' : 'Non'}</div>
                    </div>
                    <p className="mt-3 text-sm text-white/70">{item.message || 'Aucun message détaillé.'}</p>
                    <div className="mt-3 text-[11px] text-white/40">Reçue le {new Date(item.date_creation).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
