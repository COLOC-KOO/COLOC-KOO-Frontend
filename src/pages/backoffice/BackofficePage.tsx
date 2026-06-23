import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogoSVG } from '../../components/Logo';
import { useApp } from '../../context/AppContext';
import BackofficeDashboard from './BackofficeDashboard';
import BackofficeAnnonces from './BackofficeAnnonces';
import BackofficeMembers from './BackofficeMembers';
import BackofficeStats from './BackofficeStats';

const SECTIONS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-layout-dashboard', admin: false },
  { id: 'annonces', label: 'File d\'annonces', icon: 'ti-stack-2', badge: 12, admin: false },
  { id: 'signalements', label: 'Signalements', icon: 'ti-flag', badge: 3, admin: false },
  { id: 'membres', label: 'Membres', icon: 'ti-users', admin: true },
  { id: 'statistiques', label: 'Statistiques', icon: 'ti-chart-bar', admin: true },
  { id: 'partenaires_bo', label: 'Partenaires', icon: 'ti-building', admin: true },
  { id: 'parametres', label: 'Paramètres', icon: 'ti-settings', admin: true },
];

export default function BackofficePage() {
  const { auth, user, login } = useApp();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [demoRole, setDemoRole] = useState<'moderator' | 'admin'>(
    auth === 'admin' ? 'admin' : 'moderator'
  );

  if (auth !== 'admin' && auth !== 'moderator') {
    return (
      <div className="min-h-screen bg-bo-bg flex items-center justify-center">
        <div className="bg-bo-panel border border-bo-line rounded-2xl p-8 max-w-md w-full text-center">
          <i className="ti ti-lock text-4xl text-[#E0604E] block mb-4" />
          <h2 className="font-bebas text-2xl text-bo-txt mb-2">Accès restreint</h2>
          <p className="text-sm text-bo-muted mb-5">Cette zone est réservée aux modérateurs et administrateurs.</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => login('moderator')} className="px-4 py-2 bg-sc-cy text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors">
              Démo Modérateur
            </button>
            <button onClick={() => login('admin')} className="px-4 py-2 bg-sc-y2 text-white border-none rounded-xl text-sm font-bold cursor-pointer">
              Démo Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = auth === 'admin';
  const visibleSections = SECTIONS.filter(s => !s.admin || isAdmin);

  return (
    <div className="min-h-screen bg-bo-bg text-bo-txt font-sans">
      {/* Demo bar */}
      <div className="sticky top-0 z-50 bg-black border-b border-bo-line px-4 py-2 flex items-center gap-3 flex-wrap text-xs">
        <span className="text-sc-y1 font-bold tracking-wider uppercase">Back-office</span>
        <div className="flex gap-1.5">
          {(['moderator', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => { setDemoRole(r); login(r); }}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                demoRole === r
                  ? 'bg-sc-cy border-sc-cy text-[#06343d]'
                  : 'bg-bo-panel border-bo-line text-bo-muted hover:border-bo-muted'
              }`}
            >
              {r === 'moderator' ? 'Modérateur' : 'Super Admin'}
            </button>
          ))}
        </div>
        <div className="ml-auto text-bo-muted">
          Connecté en tant que <strong className="text-bo-txt">{user?.name}</strong>
        </div>
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-bo-muted hover:text-bo-txt transition-colors">
          <i className="ti ti-home text-sm" />
          <span className="hidden sm:inline">Retour au site</span>
        </button>
      </div>

      <div className="flex min-h-[calc(100vh-39px)]">
        {/* Sidebar */}
        <aside className="w-60 bg-bo-panel border-r border-bo-line p-3 sticky top-[39px] h-[calc(100vh-39px)] overflow-y-auto flex-shrink-0">
          {/* Brand */}
          <div className="flex items-center gap-2.5 px-1.5 pb-4 mb-2 border-b border-bo-line">
            <LogoSVG height={30} />
            <div>
              <p className="font-bebas text-[17px] leading-tight">
                <span style={{ color: '#46BDD6' }}>Sarintany'</span>
                <span style={{ color: '#99CC33' }}>COLOC</span>
              </p>
              <p className="text-[9px] text-bo-muted uppercase tracking-widest">Back-office</p>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <div className="mt-3">
              <p className="text-[10px] font-bold text-bo-muted uppercase tracking-widest px-2 pb-1.5">
                Modération
              </p>
              {visibleSections.filter(s => !s.admin).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  className={`bo-nav-link w-full ${section === s.id ? 'active' : ''}`}
                >
                  <i className={`ti ${s.icon} text-lg`} />
                  <span className="text-sm flex-1 text-left">{s.label}</span>
                  {s.badge && (
                    <span className="bg-[#E0604E] text-white text-[10px] font-bold px-1.5 rounded-full min-w-[20px] text-center">
                      {s.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {isAdmin && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-bo-muted uppercase tracking-widest px-2 pb-1.5">
                  Administration
                </p>
                {visibleSections.filter(s => s.admin).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={`bo-nav-link w-full ${section === s.id ? 'active' : ''}`}
                  >
                    <i className={`ti ${s.icon} text-lg`} />
                    <span className="text-sm flex-1 text-left">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 max-w-[1180px] overflow-x-hidden">
          {section === 'dashboard' && <BackofficeDashboard />}
          {section === 'annonces' && <BackofficeAnnonces />}
          {section === 'membres' && <BackofficeMembers />}
          {section === 'statistiques' && <BackofficeStats />}
          {(section === 'signalements' || section === 'partenaires_bo' || section === 'parametres') && (
            <div className="text-center py-16 text-bo-muted">
              <i className="ti ti-tools text-5xl block mb-4" />
              <h3 className="font-bebas text-2xl text-bo-txt mb-2">Section en développement</h3>
              <p>Cette section sera disponible prochainement.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
