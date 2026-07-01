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
  X
} from 'lucide-react'
import { Logo } from '../Logo'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/annonces', label: 'Annonces', icon: House },
  { to: '/admin/candidatures', label: 'Candidatures', icon: FileText, badge: 12 },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { to: '/admin/partenaires', label: 'Partenaires', icon: Building2 },
  { to: '/admin/paiements', label: 'Paiements', icon: Wallet },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: 3 },
  { to: '/admin/parametres', label: 'Paramètres', icon: Settings }
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState('admin')
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[oklch(0.18_0.005_260)] text-white/90">
      <div className="bg-black border-b border-white/10 px-4 py-2 flex items-center gap-4 flex-wrap text-xs sticky top-0 z-40">
        <span className="font-bold text-brand-olive tracking-wider">DÉMO</span>
        <span className="text-white/50">Vue en tant que :</span>
        <div className="flex gap-1">
          {['admin', 'proprio', 'locataire'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2.5 py-1 rounded border text-[11px] uppercase tracking-wider font-semibold ${
                view === v
                  ? 'bg-brand-cyan border-brand-cyan text-[oklch(0.15_0_0)]'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <Link to="/" className="ml-auto text-white/60 hover:text-white">
          ← Retour site public
        </Link>
      </div>

      <div className="flex">
        <aside
          className={`${
            open ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:sticky top-0 lg:top-[41px] left-0 h-screen lg:h-[calc(100vh-41px)] w-64 bg-[oklch(0.22_0.005_260)] border-r border-white/10 z-50 transition-transform flex flex-col`}
        >
          <div className="p-4 border-b border-white/10">
            <div className="[&_span]:!text-white [&_.text-brand-cyan]:!text-brand-cyan">
              <Logo />
            </div>
          </div>
          <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                    active ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-white/20' : 'bg-brand-magenta text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t border-white/10">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:bg-white/5">
              <LogOut className="w-4 h-4" /> Déconnexion
            </Link>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="h-14 border-b border-white/10 bg-[oklch(0.22_0.005_260)] flex items-center px-4 gap-3 sticky top-[41px] z-30">
            <button className="lg:hidden" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex-1 max-w-md flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <Search className="w-4 h-4 text-white/40" />
              <input
                placeholder="Rechercher..."
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-white/40"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-white/5">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-magenta" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-sm font-bold">
              A
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
