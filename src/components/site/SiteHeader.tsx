// components/SiteHeader.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, User, X, ChevronDown } from 'lucide-react'
import { Logo } from '../Logo'
import { Button } from '../ui/Button'
import { FlagIcon } from '../ui/FlagIcon'
import { useAuth } from '../../lib/auth'
import { useConfig } from '../../lib/config'
import { cn } from '../../lib/utils'

const LANGUAGE_STORAGE_KEY = 'colockoo_language'

const navItems = [
  { to: '/annonces', label: 'Annonces' },
  { to: '/deposer', label: 'Déposer' },
  { to: '/partenaires', label: 'Partenaires' },
  { to: '/contact', label: 'Contact' }
]

const languageOptions = [
  { code: 'FR' as const, label: 'Français', visible: true },
  { code: 'MG' as const, label: 'Malagasy', visible: false },
  { code: 'EN' as const, label: 'English', visible: false }
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<'FR' | 'MG' | 'EN'>('FR')
  const location = useLocation()
  const { user, logout } = useAuth()
  const { config } = useConfig()

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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        <Logo />
        
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {visibleNavItems.map((item) => (
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

        <div className="hidden md:flex items-center gap-2 relative">
          {/* Language Selector */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted/80 hover:border-brand-cyan/30 transition-all duration-200 group"
            onClick={() => setLanguageMenuOpen((prev) => !prev)}
            aria-expanded={languageMenuOpen}
            aria-haspopup="true"
          >
            <FlagIcon code={selectedLanguageOption?.code || 'FR'} size="md" />
            <span className="font-semibold">{selectedLanguageOption?.code || 'FR'}</span>
            <ChevronDown className={cn(
              "w-3.5 h-3.5 opacity-60 transition-transform duration-200",
              languageMenuOpen && "rotate-180"
            )} />
          </button>

          {languageMenuOpen && availableLanguages.length > 0 && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={handleLanguageMenuClose}
              />
              <div className="absolute right-0 top-full mt-2 min-w-[200px] rounded-xl border border-border bg-white shadow-lg overflow-hidden z-20 animate-in fade-in-0 zoom-in-95 duration-100">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-all duration-150 flex items-center gap-3 group hover:bg-muted',
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
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* User Actions */}
          {user ? (
            <>
              <Link to="/compte">
                <Button size="sm" className="bg-brand-cyan hover:bg-brand-cyan-dark text-white">
                  <User className="w-4 h-4 mr-1" /> {user.prenom || user.name || 'Mon compte'}
                </Button>
              </Link>
              <Button size="sm" variant="outline" onClick={logout}>
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  Se connecter
                </Button>
              </Link>
              <Link to="/compte">
                <Button size="sm" className="bg-brand-cyan hover:bg-brand-cyan-dark text-white">
                  <User className="w-4 h-4 mr-1" /> Mon compte
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors" 
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 flex flex-col gap-1 animate-in slide-in-from-top-5 duration-200">
          {visibleNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              {item.label}
            </Link>
          ))}
          
          <div className="border-t border-border mt-3 pt-3 flex flex-col gap-3">
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
                    'flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all duration-150',
                    language.code === selectedLanguage
                      ? 'border-brand-cyan bg-brand-cyan/10 ring-2 ring-brand-cyan/20 shadow-sm'
                      : 'border-border bg-white text-foreground/70 hover:bg-muted hover:border-brand-cyan/30'
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
                <Link to="/compte" className="w-full" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white" size="sm">
                    <User className="w-4 h-4 mr-1" /> {user.prenom || user.name || 'Mon compte'}
                  </Button>
                </Link>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => { 
                    logout(); 
                    setOpen(false); 
                  }}
                >
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="w-full" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Link to="/compte" className="w-full" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-brand-cyan hover:bg-brand-cyan-dark text-white" size="sm">
                    <User className="w-4 h-4 mr-1" /> Mon compte
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