// components/SiteHeader.tsx
import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, User, X, ChevronDown, Home, Search, Plus, Users, Phone, Globe, LogOut, UserCircle, Settings, HelpCircle, ConciergeBell } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { FlagIcon } from '../ui/FlagIcon'
import { useAuth } from '../../lib/auth'
import { useConfig } from '../../lib/config'
import { cn } from '../../lib/utils'

const LANGUAGE_STORAGE_KEY = 'colockoo_language'

const navItems = [
  { to: '/annonces', label: 'announcements', icon: Search },
  { to: '/deposer', label: 'post', icon: Plus },
  { to: '/partenaires', label: 'partners', icon: Users },
  { to: '/contact', label: 'contact', icon: Phone },
  { to: '/services', label: 'services', icon: ConciergeBell }
]

// Langues avec leurs informations complètes
// 🇺🇸 Drapeau américain pour l'anglais
const languageOptions = [
  { code: 'FR' as const, label: 'Français', nativeName: 'Français', flagCode: 'fr' },
  { code: 'MG' as const, label: 'Malagasy', nativeName: 'Malagasy', flagCode: 'mg' },
  { code: 'EN' as const, label: 'English', nativeName: 'English', flagCode: 'us' } // Changé de 'gb' à 'us'
]

export function SiteHeader() {
  const { t, i18n } = useTranslation(['header', 'common'])
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

  // TOUJOURS afficher les 3 langues
  const availableLanguages = useMemo(() => {
    return languageOptions
  }, [])

  // INITIALISER la langue depuis localStorage ou i18n
  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as 'FR' | 'MG' | 'EN' | null
    if (stored && availableLanguages.some((item) => item.code === stored)) {
      setSelectedLanguage(stored)
      i18n.changeLanguage(stored.toLowerCase())
      return
    }

    if (availableLanguages.length > 0 && !availableLanguages.some((item) => item.code === selectedLanguage)) {
      const defaultLang = availableLanguages[0]?.code ?? 'FR'
      setSelectedLanguage(defaultLang)
      i18n.changeLanguage(defaultLang.toLowerCase())
    }
  }, [availableLanguages, i18n, selectedLanguage])

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

  // CHANGER LA LANGUE
  const handleLanguageChange = (code: 'FR' | 'MG' | 'EN') => {
    setSelectedLanguage(code)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    i18n.changeLanguage(code.toLowerCase())
    setLanguageMenuOpen(false)
  }

  // Récupérer la langue actuelle pour l'affichage
  const currentLanguage = availableLanguages.find(
    (item) => item.code.toLowerCase() === i18n.language
  ) ?? availableLanguages[0]

  const selectedLanguageOption = currentLanguage

  const isColocataire = user?.poste === 'colocataire'

  const visibleNavItems = navItems.filter((item) => {
    if (item.to === '/deposer' && isColocataire) {
      return false
    }
    return item.to !== '/partenaires' || partnerEnabled
  })

  const getUserInitials = () => {
    const firstName = user?.prenom || user?.name?.split(' ')[0] || ''
    const lastName = user?.nom || user?.name?.split(' ').slice(1).join(' ') || ''
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) return firstName[0].toUpperCase()
    if (user?.name) return user.name[0].toUpperCase()
    return 'U'
  }

  const getUserDisplayName = () => {
    if (user?.prenom && user?.nom) return `${user.prenom} ${user.nom}`.trim()
    if (user?.prenom) return user.prenom
    if (user?.name) return user.name
    return t('user', { ns: 'common' })
  }

  const profileImageUrl = user?.profilePicture || user?.avatar || null

  const getAccountMenuTarget = () => (isColocataire ? '/compte?tab=favoris' : '/compte?tab=dossier')
  const getAccountMenuLabel = () => (isColocataire ? t('myFavorites', { ns: 'header' }) : t('myAnnouncements', { ns: 'header' }))

  // Fonction pour obtenir le label traduit d'un item de navigation
  const getNavLabel = (labelKey: string): string => {
    return t(labelKey, { ns: 'header' })
  }

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300 w-full',
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-lg border-b border-border/50' 
        : 'bg-white/90 backdrop-blur-sm border-b border-border'
    )}>
      <div className="w-full px-4 md:px-6 lg:px-8 h-16 md:h-20 flex items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>
        
        {/* Navigation Desktop */}
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to)
            const label = getNavLabel(item.label)
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
                <span>{label}</span>
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
          {/* Language Selector avec les 3 langues */}
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

            {/* Menu avec les 3 langues */}
            {languageMenuOpen && availableLanguages.length > 0 && (
              <div className="absolute right-0 top-full mt-2 min-w-[220px] rounded-2xl border border-border/50 bg-white shadow-xl overflow-hidden z-20 animate-in fade-in-0 zoom-in-95 duration-150">
                <div className="p-1">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-3 rounded-xl hover:bg-muted',
                        language.code.toLowerCase() === i18n.language
                          ? 'bg-brand-cyan/10 text-brand-cyan-dark font-semibold'
                          : 'text-foreground/80 hover:text-foreground'
                      )}
                    >
                      <FlagIcon 
                        code={language.code} 
                        size="md"
                        className={cn(
                          "transition-transform duration-200",
                          language.code.toLowerCase() === i18n.language && "scale-110"
                        )}
                      />
                      <span className="flex-1">
                        <span className="font-medium">{language.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {language.nativeName}
                        </span>
                      </span>
                      {language.code.toLowerCase() === i18n.language && (
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
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                  {profileImageUrl ? (
                    <img src={profileImageUrl} alt={getUserDisplayName()} className="w-full h-full object-cover" />
                  ) : (
                    getUserInitials()
                  )}
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
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden">
                        {profileImageUrl ? (
                          <img src={profileImageUrl} alt={getUserDisplayName()} className="w-full h-full object-cover" />
                        ) : (
                          getUserInitials()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">
                          {getUserDisplayName()}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <Link
                      to="/compte?tab=profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                    >
                      <UserCircle className="w-4 h-4 text-muted-foreground" />
                      <span>{t('myProfile', { ns: 'header' })}</span>
                    </Link>
                    <Link
                      to={getAccountMenuTarget()}
                      onClick={() => setUserMenuOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-muted transition-colors"
                    >
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <span>{getAccountMenuLabel()}</span>
                    </Link>
               
                    
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-1 border-t border-border/50 pt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout', { ns: 'header' })}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="rounded-xl border-2 hover:border-brand-cyan hover:bg-brand-cyan/5 transition-all duration-200">
                  {t('signin', { ns: 'header' })}
                </Button>
              </Link>
              <Link to="/compte?tab=dossier">
                <Button size="sm" className="rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green hover:from-brand-cyan-dark hover:to-brand-green-dark text-white shadow-md hover:shadow-lg transition-all duration-200">
                  <User className="w-4 h-4 mr-1" /> {t('signup', { ns: 'header' })}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden p-2 hover:bg-muted/80 rounded-xl transition-colors relative"
          onClick={() => setOpen(!open)}
          aria-label={open ? t('closeMenu', { ns: 'header' }) : t('openMenu', { ns: 'header' })}
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
            const label = getNavLabel(item.label)
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
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                )}
              </Link>
            )
          })}
          
          <div className="border-t border-border/50 mt-3 pt-3 flex flex-col gap-3">
            {/* Mobile Language Selector avec les 3 langues */}
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
                    'flex flex-col items-center justify-center gap-1.5 px-3 py-3 rounded-xl border-2 transition-all duration-150',
                    language.code.toLowerCase() === i18n.language
                      ? 'border-brand-cyan bg-brand-cyan/10 shadow-sm'
                      : 'border-border/50 bg-white text-foreground/70 hover:border-brand-cyan/30 hover:bg-muted'
                  )}
                >
                  <FlagIcon code={language.code} size="lg" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {language.code}
                  </span>
                  <span className="text-[8px] text-muted-foreground truncate max-w-full">
                    {language.nativeName}
                  </span>
                </button>
              ))}
            </div>

            {/* Mobile User Actions */}
            {user ? (
              <>
                <Link to={getAccountMenuTarget()} className="w-full" onClick={() => setOpen(false)}>
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green text-white shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt={getUserDisplayName()} className="w-full h-full object-cover" />
                      ) : (
                        getUserInitials()
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-semibold">
                        {getUserDisplayName()}
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
                  {t('logout', { ns: 'header' })}
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" className="w-full" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl border-2" size="sm">
                    {t('signin', { ns: 'header' })}
                  </Button>
                </Link>
                <Link to="/compte?tab=dossier" className="w-full" onClick={() => setOpen(false)}>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green hover:from-brand-cyan-dark hover:to-brand-green-dark text-white shadow-md hover:shadow-lg transition-all duration-200" size="sm">
                    <User className="w-4 h-4 mr-1" /> {t('signup', { ns: 'header' })}
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