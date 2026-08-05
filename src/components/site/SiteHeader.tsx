// components/SiteHeader.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, User, X, ChevronDown, Home, Search, Plus, Users, Phone, LogOut, UserCircle, Leaf, Bell } from 'lucide-react'
import { Logo, LogoMark } from '../Logo'
import { Button } from '../ui/Button'
import { FlagIcon } from '../ui/FlagIcon'
import { useAuth } from '../../lib/auth'
import { useConfig } from '../../lib/config'
import { api } from '../../lib/api'
import { cn } from '../../lib/utils'

const LANGUAGE_STORAGE_KEY = 'colockoo_language'
const LITE_MODE_STORAGE_KEY = 'colockoo_lite_mode'

const navItems = [
  { to: '/annonces', label: 'announcements', icon: Search },
  { to: '/depot_annonce', label: 'post', icon: Plus },
  { to: '/partenaires', label: 'partners', icon: Users },
  { to: '/contact', label: 'contact', icon: Phone },
  { to: '/services', label: 'services', icon: Bell }
]

const languageOptions = [
  { code: 'FR' as const, label: 'Français', nativeName: 'Français', flagCode: 'fr' },
  { code: 'MG' as const, label: 'Malagasy', nativeName: 'Malagasy', flagCode: 'mg' },
  { code: 'EN' as const, label: 'English', nativeName: 'English', flagCode: 'us' }
]

type AppNotification = {
  id_notification: number
  titre: string
  texte: string
  est_lue: number
  type_notification: string
  date_creation: string
  lien: string | null
}

export function SiteHeader() {
  const { t, i18n } = useTranslation(['header', 'common'])
  const [open, setOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'FR' | 'MG' | 'EN'>('FR')
  const [search, setSearch] = useState('')
  const [liteMode, setLiteMode] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [showNotif, setShowNotif] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { config } = useConfig()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const languageMenuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const partnerEnabled = config?.PARTENAIRE_VISIBILITY !== false

  const availableLanguages = useMemo(() => languageOptions, [])

  useEffect(() => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as 'FR' | 'MG' | 'EN' | null
    if (stored && availableLanguages.some((item) => item.code === stored)) {
      setSelectedLanguage(stored)
      i18n.changeLanguage(stored.toLowerCase())
      return
    }

    const code = i18n.language.toUpperCase() as 'FR' | 'MG' | 'EN'
    if (availableLanguages.some((item) => item.code === code)) {
      setSelectedLanguage(code)
      return
    }

    const defaultLang = availableLanguages[0]?.code ?? 'FR'
    setSelectedLanguage(defaultLang)
    i18n.changeLanguage(defaultLang.toLowerCase())
  }, [availableLanguages, i18n])

  useEffect(() => {
    const stored = localStorage.getItem(LITE_MODE_STORAGE_KEY)
    if (stored === 'true') {
      setLiteMode(true)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotif(false)
      }
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

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    api.notifications()
      .then((data) => {
        setNotifications(data)
      })
      .catch(() => setNotifications([]))
  }, [user])

  useEffect(() => {
    setUnreadCount(notifications.filter((item) => item.est_lue === 0).length)
  }, [notifications])

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = search.trim()
    if (query) {
      navigate(`/profils-recherche-logement?ville=${encodeURIComponent(query)}`)
    } else {
      navigate('/profils-recherche-logement')
    }
    setOpen(false)
  }

  const handleLanguageChange = (code: 'FR' | 'MG' | 'EN') => {
    setSelectedLanguage(code)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    i18n.changeLanguage(code.toLowerCase())
    setLanguageMenuOpen(false)
  }

  const handleToggleLiteMode = () => {
    setLiteMode((prev) => {
      const next = !prev
      localStorage.setItem(LITE_MODE_STORAGE_KEY, String(next))
      window.dispatchEvent(new CustomEvent('litemodechange', { detail: { liteMode: next } }))
      return next
    })
  }

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

  const profileImageUrl = user?.profilePicture || null

  const getAccountMenuTarget = () => (isColocataire ? '/compte?tab=favoris' : '/compte?tab=dossier')
  const getAccountMenuLabel = () => (isColocataire ? t('myFavorites', { ns: 'header' }) : t('myAnnouncements', { ns: 'header' }))

  const getNavLabel = (labelKey: string): string => {
    return t(labelKey, { ns: 'header' })
  }

  const markAllRead = async () => {
    try {
      await api.markNotificationsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, est_lue: 1 })))
    } catch {
      // silent
    }
  }

  const handleNotificationClick = async (notification: AppNotification) => {
    setShowNotif(false)
    if (!notification.lien) return
    try {
      if (notification.est_lue === 0) {
        await api.markNotificationRead(notification.id_notification)
        setNotifications((prev) => prev.map((item) => item.id_notification === notification.id_notification ? { ...item, est_lue: 1 } : item))
      }
    } catch {
      // silent
    }
    navigate(notification.lien)
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-full bg-white border-b border-border">
      <div className="w-full px-3 sm:px-5 h-14 flex items-center justify-between gap-1.5 sm:gap-2.5">
        <div className="flex-shrink-0">
          <Link to="/" className="sm:hidden flex items-center gap-1" aria-label="Accueil">
            <LogoMark className="h-8 w-8" />
            <span className="bebas flex flex-col whitespace-nowrap text-[13px] leading-[0.85]">
              <span className="text-[--brand-cyan-dark]">Coloc’KOO</span>
              <span className="text-[--brand-green-dark]">Miara-Trano</span>
            </span>
          </Link>
          <div className="hidden sm:block">
          <Logo small />
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleToggleLiteMode}
            aria-pressed={liteMode}
            aria-label={liteMode ? 'Désactiver le mode Lite' : 'Activer le mode Lite'}
            className={cn(
              'inline-flex items-center gap-1 px-1.5 sm:px-2 py-1.5 border rounded-lg text-xs font-bold transition-colors',
              liteMode
                ? 'border-brand-green/40 bg-brand-green/10 text-brand-green-dark'
                : 'border-border/50 hover:border-brand-cyan/30 hover:bg-muted/80 text-foreground/70'
            )}
          >
            <Leaf className={cn('w-3.5 h-3.5', liteMode ? 'text-brand-green' : 'opacity-60')} />
            <span className="hidden lg:inline">Lite</span>
            <span
              className={cn(
                'px-1 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide transition-colors duration-200',
                liteMode ? 'bg-brand-green text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              {liteMode ? 'ON' : 'OFF'}
            </span>
          </button>

          <div className="relative" ref={languageMenuRef}>
            <button
              type="button"
              className="flex items-center gap-1 px-2 py-1.5 border border-border rounded-lg bg-white hover:bg-muted transition-colors"
              onClick={() => setLanguageMenuOpen((prev) => !prev)}
              aria-expanded={languageMenuOpen}
              aria-haspopup="true"
            >
              <FlagIcon code={selectedLanguageOption?.code || 'FR'} size="sm" />
              <span className="text-xs font-bold text-foreground">{selectedLanguageOption?.code || 'FR'}</span>
              <ChevronDown className={cn(
                'hidden sm:block w-3.5 h-3.5 opacity-60 transition-transform duration-200',
                languageMenuOpen && 'rotate-180'
              )} />
            </button>

            {languageMenuOpen && availableLanguages.length > 0 && (
              <div className="absolute right-0 top-[calc(100%+6px)] min-w-[180px] rounded-xl border border-border bg-white shadow-xl overflow-hidden z-20">
                <div className="p-1">
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      onClick={() => handleLanguageChange(language.code)}
                      className={cn(
                        'w-full text-left px-3.5 py-2.5 text-sm transition-colors flex items-center gap-3 hover:bg-muted',
                        language.code.toLowerCase() === i18n.language
                          ? 'bg-brand-cyan/10 text-brand-cyan-dark font-semibold'
                          : 'text-foreground/80 hover:text-foreground'
                      )}
                    >
                      <FlagIcon 
                        code={language.code} 
                        size="md"
                        className={cn(
                          'transition-transform duration-200',
                          language.code.toLowerCase() === i18n.language && 'scale-110'
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

          {user ? (
            <div className="flex items-center gap-2">
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotif((prev) => !prev)}
                  className="relative w-9 h-9 border border-border rounded-lg bg-white flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute top-[calc(100%+8px)] right-0 w-80 max-w-[90vw] bg-white border border-border rounded-xl shadow-xl z-30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                      <span className="font-semibold text-sm text-foreground">{t('notifications', { ns: 'header' })}</span>
                      <button
                        type="button"
                        onClick={markAllRead}
                        className="text-xs font-semibold text-brand-cyan hover:text-brand-cyan-dark transition-colors"
                      >
                        {t('markAllRead', { ns: 'header' })}
                      </button>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">{t('noNotifications', { ns: 'header' })}</div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id_notification}
                            type="button"
                            onClick={() => handleNotificationClick(notification)}
                            className={cn(
                              'w-full text-left px-4 py-3 border-b border-border/50 transition-colors',
                              notification.est_lue === 0 ? 'bg-brand-cyan/10 hover:bg-brand-cyan/20' : 'hover:bg-muted'
                            )}
                          >
                            <div className="text-sm font-medium text-foreground">
                              {notification.titre}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{notification.texte}</p>
                            <div className="text-[10px] text-muted-foreground mt-2">{notification.date_creation}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 py-1 pl-1 pr-2 border border-border rounded-2xl bg-white hover:bg-muted transition-colors"
                >
                  <div className="w-[30px] h-[30px] rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center overflow-hidden">
                    {profileImageUrl ? (
                      <img src={profileImageUrl} alt={getUserDisplayName()} className="w-full h-full object-cover" />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 opacity-60 transition-transform duration-200',
                    userMenuOpen && 'rotate-180'
                  )} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-[calc(100%+8px)] min-w-[224px] rounded-xl border border-border bg-white shadow-xl overflow-hidden z-20">
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm overflow-hidden">
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
                        onClick={() => { logout(); setUserMenuOpen(false) }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-xl hover:bg-red-50 text-red-600 transition-colors mt-1 border-t border-border/50 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('logout', { ns: 'header' })}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="h-8 px-2 sm:h-9 sm:px-3 rounded-lg border-border hover:bg-muted transition-colors">
                  {t('signin', { ns: 'header' })}
                </Button>
              </Link>
              <Link to="/compte?tab=dossier" className="hidden sm:block">
                <Button size="sm" className="rounded-lg bg-brand-cyan hover:bg-brand-cyan-dark text-white transition-colors">
                  <User className="w-4 h-4 mr-1" /> {t('signup', { ns: 'header' })}
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>

      {open && (
        <div className="sm:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-3">
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
                <item.icon className={cn('w-4 h-4', isActive ? 'text-brand-cyan' : 'opacity-60')} />
                {label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                )}
              </Link>
            )
          })}

          <div className="border-t border-border/50 mt-3 pt-3 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleToggleLiteMode}
              aria-pressed={liteMode}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border-2 transition-all duration-150 w-full justify-center',
                liteMode
                  ? 'border-brand-green bg-brand-green/10 text-brand-green-dark'
                  : 'border-border/50 bg-white text-foreground/70'
              )}
            >
              <Leaf className="w-4 h-4" />
              <span className="font-semibold">Mode Lite</span>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                liteMode ? 'bg-brand-green text-white' : 'bg-muted text-muted-foreground'
              )}>
                {liteMode ? 'ON' : 'OFF'}
              </span>
            </button>

            <div className="grid grid-cols-3 gap-2 mt-3">
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

            <div className="mt-4 space-y-3">
              {user ? (
                <>
                  <Link to={getAccountMenuTarget()} className="w-full block" onClick={() => setOpen(false)}>
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
                    onClick={() => { logout(); setOpen(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 text-red-600 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                    {t('logout', { ns: 'header' })}
                </>
              ) : (
                <>
                  <Link to="/auth" className="w-full block" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl border-2" size="sm">
                      {t('signin', { ns: 'header' })}
                    </Button>
                  </Link>
                  <Link to="/compte?tab=dossier" className="w-full block" onClick={() => setOpen(false)}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-brand-cyan to-brand-green hover:from-brand-cyan-dark hover:to-brand-green-dark text-white shadow-md hover:shadow-lg transition-all duration-200" size="sm">
                      <User className="w-4 h-4 mr-1" /> {t('signup', { ns: 'header' })}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
