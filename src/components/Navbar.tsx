import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoSVG, LogoName } from './Logo';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const { auth, user, logout, liteMode, toggleLite, notifications, unreadCount, markAllRead, setShowAuthModal, setAuthModalTab, lang, setLang } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showProf, setShowProf] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profRef.current && !profRef.current.contains(e.target as Node)) setShowProf(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setShowLang(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/recherche?q=${encodeURIComponent(search)}`);
    else navigate('/recherche');
  };

  const LANG_OPTIONS = [
    { code: 'MG' as const, flag: 'mg', label: 'Malagasy' },
    { code: 'FR' as const, flag: 'fr', label: 'Français' },
    { code: 'ENG' as const, flag: 'gb', label: 'English' },
  ];

  return (
    <nav className="bg-white border-b border-sc-bd px-5 flex items-center justify-between h-14 sticky top-0 z-50 gap-2.5">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
        <LogoSVG height={36} />
        <div className="flex flex-col leading-tight">
          <LogoName size="md" />
          <span className="text-[9px] text-sc-gr2 whitespace-nowrap">par Coloc'KOO SARL · service gratuit</span>
        </div>
      </Link>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex-1 min-w-0 max-w-md hidden sm:block">
        <div className="bg-sc-bg border border-gray-200 rounded-xl py-1 px-3 pr-1 flex items-center gap-2">
          <i className="ti ti-search text-sc-gr2 text-base flex-shrink-0" />
          <input
            className="flex-1 min-w-0 border-none outline-none text-sm text-sc-dark bg-transparent font-sans"
            placeholder="Quartier, ville…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="bg-sc-y2 text-white border-none rounded-lg px-2.5 py-1.5 text-xs font-bold cursor-pointer flex-shrink-0 hover:bg-[#7faa28] transition-colors"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Right section */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Lite mode toggle */}
        <button
          onClick={toggleLite}
          className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-bold cursor-pointer transition-colors ${
            liteMode
              ? 'border-sc-y2 text-[#5a7a1a] bg-sc-g-lt'
              : 'border-sc-bd text-sc-gr1 bg-transparent hover:bg-gray-50'
          }`}
          title="Mode allégé — économie de données"
        >
          <i className={`ti ti-feather text-sm ${liteMode ? 'text-sc-y2' : 'text-sc-gr2'}`} />
          <span className="hidden lg:inline">Lite</span>
          <span className={`text-[10px] px-1 rounded ${liteMode ? 'bg-sc-y2 text-white' : 'bg-gray-100 text-sc-gr1'}`}>
            {liteMode ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Language selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setShowLang(v => !v)}
            className="flex items-center gap-1 px-2.5 py-1.5 border border-sc-bd rounded-lg bg-white cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <img
              src={`https://flagcdn.com/w20/${LANG_OPTIONS.find(l => l.code === lang)?.flag || 'fr'}.png`}
              alt={lang}
              className="w-5 h-3.5 object-cover rounded-sm"
            />
            <span className="text-xs font-bold text-sc-dark ml-1">{lang}</span>
            <i className="ti ti-chevron-down text-[10px] ml-0.5 text-sc-gr2" />
          </button>
          {showLang && (
            <div className="absolute top-[calc(100%+6px)] right-0 bg-white border border-gray-200 rounded-xl shadow-sc-lg z-[99999] overflow-hidden min-w-[140px]">
              {LANG_OPTIONS.map(opt => (
                <div
                  key={opt.code}
                  onClick={() => { setLang(opt.code); setShowLang(false); }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 cursor-pointer text-sm text-sc-dark hover:bg-gray-50 ${lang === opt.code ? 'bg-sc-cy-lt text-[#2a7a90] font-bold' : ''}`}
                >
                  <img src={`https://flagcdn.com/w20/${opt.flag}.png`} alt={opt.code} className="w-5 h-3.5 object-cover rounded-sm" />
                  <span>{opt.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Auth: Guest */}
        {auth === 'guest' && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setAuthModalTab('register'); setShowAuthModal(true); }}
              className="hidden sm:block px-3 py-1.5 border border-sc-bd rounded-lg bg-transparent text-xs text-sc-dark cursor-pointer hover:bg-gray-50 transition-colors"
            >
              S'inscrire
            </button>
            <button
              onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
              className="px-3.5 py-1.5 border-none rounded-lg bg-sc-cy text-white text-xs font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
            >
              Se connecter
            </button>
          </div>
        )}

        {/* Auth: Logged in */}
        {auth !== 'guest' && (
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(v => !v)}
                className="relative w-9 h-9 border border-sc-bd rounded-lg bg-white cursor-pointer flex items-center justify-center text-sc-dark text-lg hover:bg-gray-50 transition-colors"
              >
                <i className="ti ti-bell" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#E55555] text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-sc-lg z-[99999] overflow-hidden">
                  <div className="flex items-center justify-between px-3.5 py-3 border-b border-sc-bd">
                    <span className="font-bold text-sm text-sc-dark">Notifications</span>
                    <button onClick={markAllRead} className="bg-none border-none text-sc-cy text-xs font-bold cursor-pointer">
                      Tout marquer lu
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => { setShowNotif(false); if (n.lien) navigate(n.lien); }}
                        className={`flex gap-2.5 px-3.5 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                          n.lue ? 'hover:bg-gray-50' : 'bg-sc-cy-lt hover:bg-[#dcf0f5]'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base ${
                          n.type === 'message' ? 'bg-sc-cy' : n.type === 'candidature' ? 'bg-sc-y2' : 'bg-sc-y1'
                        }`}>
                          <i className={`ti ${n.type === 'message' ? 'ti-message-2' : n.type === 'candidature' ? 'ti-users' : 'ti-circle-check'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] leading-snug text-sc-dark">{n.texte}</p>
                          <p className="text-[10.5px] text-sc-gr2 mt-0.5">{n.temps}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowNotif(false)}
                    className="block w-full text-center py-2.5 text-xs font-bold text-sc-cy border-t border-sc-bd hover:bg-gray-50 transition-colors"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              )}
            </div>

            {/* Profile menu */}
            <div className="relative" ref={profRef}>
              <button
                onClick={() => setShowProf(v => !v)}
                className="flex items-center gap-1.5 py-1 pl-1 pr-2 border border-sc-bd rounded-2xl bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="w-[30px] h-[30px] rounded-full bg-sc-y2 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {user?.initials}
                </div>
                <i className="ti ti-chevron-down text-[10px] text-sc-gr2" />
              </button>
              {showProf && (
                <div className="absolute top-[calc(100%+8px)] right-0 w-56 bg-white border border-gray-200 rounded-xl shadow-sc-lg z-[99999] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-sc-bd">
                    <div className="w-10 h-10 rounded-full bg-sc-y2 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {user?.initials}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-sc-dark">{user?.name}</p>
                      <p className="text-xs text-sc-gr2">{user?.email}</p>
                    </div>
                  </div>
                  {[
                    { to: '/compte', icon: 'ti-user', label: 'Mon compte' },
                    { to: '/candidatures', icon: 'ti-file-text', label: 'Mes candidatures' },
                    { to: '/messagerie', icon: 'ti-message', label: 'Messagerie' },
                    { to: '/deposer', icon: 'ti-plus', label: 'Déposer une annonce' },
                  ].map(item => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setShowProf(false)}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-sc-dark hover:bg-gray-50 transition-colors no-underline"
                    >
                      <i className={`ti ${item.icon} text-base text-sc-gr1`} />
                      {item.label}
                    </Link>
                  ))}
                  {(auth === 'admin' || auth === 'moderator') && (
                    <>
                      <div className="h-px bg-sc-bd my-1" />
                      <Link
                        to="/backoffice"
                        onClick={() => setShowProf(false)}
                        className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-sc-cy hover:bg-gray-50 transition-colors no-underline font-bold"
                      >
                        <i className="ti ti-shield text-base" />
                        Back-office
                      </Link>
                    </>
                  )}
                  <div className="h-px bg-sc-bd my-1" />
                  <button
                    onClick={() => { logout(); setShowProf(false); }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-[#E55555] hover:bg-gray-50 transition-colors cursor-pointer border-none bg-transparent font-sans"
                  >
                    <i className="ti ti-logout text-base text-[#E55555]" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
