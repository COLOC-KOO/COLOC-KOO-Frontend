import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Globe, Menu, User, X } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

const navItems = [
  { to: '/annonces', label: 'Annonces' },
  { to: '/deposer', label: 'Déposer' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/contact', label: 'Contact' }
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname.startsWith(item.to)
                  ? 'text-brand-cyan-dark bg-brand-cyan-light'
                  : 'text-foreground/70 hover:text-foreground hover:bg-muted'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="hidden md:flex items-center gap-2">
          <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-border hover:bg-muted">
            <Globe className="w-3.5 h-3.5" /> FR
          </button>
          <Link to="/auth">
            <Button variant="outline" size="sm">
              Se connecter
            </Button>
          </Link>
          <Link to="/compte">
            <Button size="sm" className="bg-brand-cyan hover:bg-brand-cyan-dark text-white">
              <User className="w-4 h-4" /> Mon compte
            </Button>
          </Link>
        </div>
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex gap-2">
            <Link to="/auth" className="flex-1" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full" size="sm">
                Se connecter
              </Button>
            </Link>
            <Link to="/compte" className="flex-1" onClick={() => setOpen(false)}>
              <Button className="w-full bg-brand-cyan text-white" size="sm">
                Mon compte
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
