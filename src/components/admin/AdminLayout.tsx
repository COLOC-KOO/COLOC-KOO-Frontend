import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
  Code
} from 'lucide-react'
import { Logo } from '../Logo'
import { roleLevel, useAuth } from '../../lib/auth'

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
        badge: 5, 
        minRole: 1,
        description: 'Annonces en attente de modération'
      },
      { 
        to: '/admin/signalements-conversations', 
        label: 'Signalements conversations', 
        icon: MessageCircleWarning, 
        badge: 2, 
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
        badge: 3, 
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
  const { user, logout } = useAuth()
  const viewRole = roleLevel(user?.poste)
  const location = useLocation()

  // Filtrer les éléments de navigation selon le rôle
  const filteredNav = navItems
    .filter(section => section.minRole === undefined || viewRole >= section.minRole)
    .map(section => ({
      ...section,
      items: section.items.filter(item => viewRole >= (item.minRole || 1))
    }))
    .filter(section => section.items.length > 0)

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
            <div className="flex-1 max-w-md flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 ml-auto">
              <Search className="w-4 h-4 text-white/40 flex-shrink-0" />
              <input
                placeholder="Rechercher un utilisateur..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
              />
              <button className="text-white/40 hover:text-white/70 text-xs p-1">
                ✕
              </button>
            </div>

            {/* Notifications - comme dans la maquette */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-magenta" />
            </button>

            {/* Avatar - comme dans la maquette */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-sm font-bold flex-shrink-0">
              {user?.initials || 'A'}
            </div>
          </header>

          {/* Children */}
          <main className="p-6">{children}</main>
        </div>
      </div>

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
