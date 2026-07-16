// components/SiteHeader.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, User, X, ChevronDown, Home, Search, Plus, Users, Phone, Globe, LogOut, UserCircle, Settings, HelpCircle, ConciergeBell } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { FlagIcon } from '../ui/FlagIcon'
import { useAuth } from '../../lib/auth'
import { useConfig } from '../../lib/config'
import { cn } from '../../lib/utils'

const LANGUAGE_STORAGE_KEY = 'colockoo_language'

const navItems = [
  { to: '/annonces', label: 'Annonces', icon: Search },
  { to: '/deposer', label: 'Déposer', icon: Plus },
  { to: '/partenaires', label: 'Partenaires', icon: Users },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/services', label: 'Service', icon: ConciergeBell }
]

const languageOptions = [
  { code: 'FR' as const, label: 'Français', visible: true },
  { code: 'MG' as const, label: 'Malagasy', visible: false },
  { code: 'EN' as const, label: 'English', visible: false }
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'FR' | 'MG' | 'EN'>('FR')
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()
  const { config } = useConfig()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)

  const partnerEnabled = config?.PARTENAIRE_VISIBILITY !== false

  const availableLanguages = useMemo(() => {
    return languageOptions
      .map((item) => {
        let visible = false
        if (item.code === 'FR') {
          visible = true
        } else if (item.code === 'MG') {
          visible = config?.I18N_MG === true
        } else if (item.code === 'EN') {
          visible = config?.I18N_EN === true
        }
        return { ...item, visible }
      })
      .filter((item) => item.visible)
  }, [config])

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as 'FR' | 'MG' | 'EN' | null
    if (stored && availableLanguages.some((item) => item.code === stored)) {
      setSelectedLanguage(stored)
      return
    }

    if (availableLanguages.length > 0 && !availableLanguages.some((item) => item.code === selectedLanguage)) {
      setSelectedLanguage(availableLanguages[0]?.code ?? 'FR')
    }
  }, [availableLanguages, selectedLanguage])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setLanguageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLanguageChange = (code: 'FR' | 'MG' | 'EN') => {
    setSelectedLanguage(code)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    setLanguageMenuOpen(false)
  }

  const selectedLanguageOption = availableLanguages.find(
    (item) => item.code === selectedLanguage
  ) ?? availableLanguages[0]

  const visibleNavItems = navItems.filter(
    (item) => item.to !== '/partenaires' || partnerEnabled
  )

  const handleLanguageMenuClose = () => {
    setLanguageMenuOpen(false)
  }

  const getUserInitials = () => {
    if (user?.prenom && user?.nom) {
      return `${user.prenom[0]}${user.nom[0]}`.toUpperCase()
    }
    if (user?.prenom) return user.prenom[0].toUpperCase()
    if (user?.name) return user.name[0].toUpperCase()
    return 'U'
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300 w-full',
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-border/50' 
        : 'bg-white/90 backdrop-blur-sm border-b border-border'
    )}>
      {/* Changement: w-full au lieu de max-w-7xl, padding responsive */}
      <div className="w-full px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>
        
        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 group',
                  isActive
                    ? 'text-brand-cyan-dark bg-brand-cyan-light/80'
                    : 'text-foreground/70 hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isActive ? 'text-brand-cyan' : 'opacity-60 group-hover:opacity-100',
                  'group-hover:scale-110'
                )} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-cyan rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1" />

        {/* Actions Desktop */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Language Selector */}
          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-xl border border-border/50 hover:border-brand-cyan/30 hover:bg-muted/80 transition-all duration-200 group"
              onClick={() => setLanguageMenuOpen((prev) => !prev)}
              aria-expanded={languageMenuOpen}
              aria-haspopup="true"
            >
              <FlagIcon code={selectedLanguageOption?.code || 'FR'} size="md" />
              <span className="font-semibold text-sm">{selectedLanguageOption?.code || 'FR'}</span>
              <ChevronDown className={cn(
                "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                languageMenuOpen && "rotate-180"
              )} />
            </button>

            {languageMenuOpen && availableLanguages.length > 0 && (
              <div className="absolute right-0 top-full mt-2 min-w-[200px] rounded-2xl border border-border/50 bg-white shadow-xl overflow-hidden z-20 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="p-1">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-3 rounded-xl hover:bg-muted',
                        language.code === selectedLanguage
                          ? 'bg-brand-cyan/10 text-brand-cyan-dark font-semibold'
                          : 'text-foreground/80 hover:text-foreground'
                      )}
                    >
                      <FlagIcon 
                        code={language.code} 
                        size="md"
                        className={cn(
                          "transition-transform duration-200",
                          language.code === selectedLanguage && "scale-110"
                        )}
                      />
                      <span className="flex-1">{language.label}</span>
                      {language.code === selectedLanguage && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Actions */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {getUserInitials()}
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
                  userMenuOpen && "rotate-180"
                )} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[240px] rounded-2xl border border-border/50 bg-white shadow-xl overflow-hidden z-20 animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.name || 'Utilisateur'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/compte?tab=dossier"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-muted-foreground" />
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      to="/compte?tab=dossier"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                    >
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span>Mes annonces</span>
                    </Link>
               
                    
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-1 border-t border-border/50 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="rounded-xl border-2 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all duration-200">
                  Se connecter
                </Button>
              </Link>
              <Link to="/compte?tab=dossier">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green hover:from-brand-cyan-dark hover:to-brand-green-dark text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <User className="w-4 h-4 mr-1" /> S'inscrire
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 hover:bg-muted/80 rounded-xl transition-colors relative"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          {user && !open && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-green rounded-full border-2 border-white animate-pulse" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden border-t border-border/50 bg-white/98 backdrop-blur-lg px-4 py-4 flex flex-col gap-1 animate-in slide-in-from-top-5 duration-200">
          {/* Navigation Mobile */}
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-cyan-light text-brand-cyan-dark'
                    : 'hover:bg-muted text-foreground/70 hover:text-foreground'
                )}
              >
                <item.icon className={cn(
                  'w-4 h-4',
                  isActive ? 'text-brand-cyan' : 'opacity-60'
                )} />
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                )}
              </Link>
            )
          })}
          
          <div className="border-t border-border/50 mt-3 pt-3 flex flex-col gap-3">
            {/* Mobile Language Selector */}
            <div className="grid grid-cols-3 gap-2">
              {availableLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => {
                    handleLanguageChange(language.code)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl border-2 transition-all duration-150',
                    language.code === selectedLanguage
                      ? 'border-brand-cyan bg-brand-cyan/10 shadow-sm'
                      : 'border-border/50 bg-white text-foreground/70 hover:border-brand-cyan/30 hover:bg-muted'
                  )}
                >
                  <FlagIcon code={language.code} size="lg" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {language.code}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile User Actions */}
            {user ? (
              <>
                <Link to="/compte?tab=dossier" className="w-full" onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                      {getUserInitials()}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">
                        {user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.name || 'Mon compte'}
                      </div>
                      <div className="text-xs opacity-80 truncate">{user.email}</div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => { 
                    logout(); 
                    setOpen(false); 
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="w-full" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl border-2" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/compte?tab=dossier" className="w-full" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green hover:from-brand-cyan-dark hover:to-brand-green-dark text-white shadow-md hover:shadow-lg transition-all duration-200" size="sm">
                    <User className="w-4 h-4 mr-1" /> S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}