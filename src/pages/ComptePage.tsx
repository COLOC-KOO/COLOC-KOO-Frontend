import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ComptePage() {
  const { user, auth, logout, setShowAuthModal, setAuthModalTab } = useApp();
  const [activeTab, setActiveTab] = useState('profil');
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nom: user?.name || '',
    email: user?.email || '',
    tel: '+261 34 00 000 00',
    ville: 'Antananarivo',
    profession: 'Développeur web',
    bio: 'Je suis calme, ordonné et respectueux. Je cherche une colocation sérieuse dans un cadre agréable.',
    age: '26',
  });

  if (auth === 'guest') {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd">
          <i className="ti ti-user-circle text-5xl text-sc-cy block mb-4" />
          <h2 className="font-bebas text-2xl text-sc-dark mb-2">Mon compte</h2>
          <p className="text-sm text-sc-gr1 mb-5">Connectez-vous pour accéder à votre espace personnel.</p>
          <button onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }} className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d">
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'profil', label: 'Mon profil', icon: 'ti-user' },
    { id: 'annonces', label: 'Mes annonces', icon: 'ti-home' },
    { id: 'favoris', label: 'Favoris', icon: 'ti-heart' },
    { id: 'securite', label: 'Sécurité', icon: 'ti-lock' },
    { id: 'notifications', label: 'Notifications', icon: 'ti-bell' },
  ];

  const PROFIL_COMPLETION = 75;

  return (
    <div className="min-h-screen bg-sc-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-sc-bd p-5 mb-4 flex items-start gap-4 flex-wrap">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-sc-y2 text-white font-bold text-xl flex items-center justify-center flex-shrink-0">
              {user?.initials}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sc-cy text-white border-2 border-white flex items-center justify-center cursor-pointer">
              <i className="ti ti-camera text-[10px]" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-sc-dark">{user?.name}</h1>
            <p className="text-sm text-sc-gr2">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-sc-cy-lt text-[#2a7a90] font-bold px-2 py-0.5 rounded-lg capitalize flex items-center gap-1">
                <i className="ti ti-user text-xs" />
                {auth === 'coloc' ? 'Colocataire' : auth === 'proprio' ? 'Propriétaire' : auth === 'admin' ? 'Super Admin' : 'Modérateur'}
              </span>
              <span className="text-xs bg-sc-g-lt text-[#4a7020] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                <i className="ti ti-shield-check text-xs" />
                Email vérifié
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-sc-gr2 mb-1">Profil complété à {PROFIL_COMPLETION}%</p>
            <div className="h-2 bg-gray-100 rounded-full w-32 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-sc-y1 to-sc-y2" style={{ width: `${PROFIL_COMPLETION}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
          {/* Sidebar nav */}
          <div className="bg-white rounded-2xl border border-sc-bd p-2 h-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none transition-colors text-left ${
                  activeTab === tab.id ? 'bg-sc-cy-lt text-sc-cy' : 'bg-transparent text-sc-gr1 hover:bg-gray-50 hover:text-sc-dark'
                }`}
              >
                <i className={`ti ${tab.icon} text-base`} />
                {tab.label}
              </button>
            ))}
            <div className="h-px bg-sc-bd my-2" />
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none bg-transparent text-[#E55555] hover:bg-red-50 transition-colors text-left"
            >
              <i className="ti ti-logout text-base" />
              Déconnexion
            </button>
          </div>

          {/* Content */}
          <div>
            {/* Profil tab */}
            {activeTab === 'profil' && (
              <div className="bg-white rounded-2xl border border-sc-bd p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bebas text-xl text-sc-dark">Mon profil</h2>
                  <button
                    onClick={() => setEditMode(v => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                      editMode ? 'bg-sc-y2 text-white border-sc-y2' : 'bg-white text-sc-dark border-sc-bd hover:border-sc-cy'
                    }`}
                  >
                    <i className={`ti ${editMode ? 'ti-check' : 'ti-edit'} text-sm`} />
                    {editMode ? 'Sauvegarder' : 'Modifier'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nom complet', field: 'nom', type: 'text' },
                    { label: 'Email', field: 'email', type: 'email' },
                    { label: 'Téléphone', field: 'tel', type: 'tel' },
                    { label: 'Ville', field: 'ville', type: 'text' },
                    { label: 'Âge', field: 'age', type: 'number' },
                    { label: 'Profession', field: 'profession', type: 'text' },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="block text-xs font-bold text-sc-gr2 mb-1">{f.label}</label>
                      {editMode ? (
                        <input
                          type={f.type}
                          value={profileForm[f.field as keyof typeof profileForm]}
                          onChange={e => setProfileForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                          className="w-full border border-sc-bd rounded-xl px-3 py-2 text-sm outline-none focus:border-sc-cy"
                        />
                      ) : (
                        <p className="text-sm text-sc-dark">{profileForm[f.field as keyof typeof profileForm] || '—'}</p>
                      )}
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-sc-gr2 mb-1">Bio / Présentation</label>
                    {editMode ? (
                      <textarea
                        value={profileForm.bio}
                        onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                        rows={3}
                        className="w-full border border-sc-bd rounded-xl px-3 py-2 text-sm outline-none focus:border-sc-cy resize-none"
                      />
                    ) : (
                      <p className="text-sm text-sc-dark">{profileForm.bio || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Incomplete profile tip */}
                {PROFIL_COMPLETION < 100 && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex gap-2">
                    <i className="ti ti-bulb text-amber-500 text-base flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-0.5">Complétez votre profil</p>
                      <p className="text-xs text-amber-600">Un profil complet augmente vos chances d'être accepté en colocation.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Annonces tab */}
            {activeTab === 'annonces' && (
              <div className="bg-white rounded-2xl border border-sc-bd p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bebas text-xl text-sc-dark">Mes annonces</h2>
                  <Link to="/deposer" className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-cy text-white rounded-xl text-xs font-bold no-underline hover:bg-sc-cy-d transition-colors">
                    <i className="ti ti-plus text-sm" />
                    Nouvelle annonce
                  </Link>
                </div>
                {auth === 'proprio' || auth === 'agent' ? (
                  <div className="space-y-3">
                    {[
                      { titre: 'Villa Iavoloha — 4 chambres', statut: 'Publiée', views: 145, candidatures: 8 },
                      { titre: 'Appart Ivandry — 3 chambres', statut: 'En modération', views: 0, candidatures: 0 },
                    ].map(a => (
                      <div key={a.titre} className="flex items-center gap-3 p-3 bg-sc-bg rounded-xl border border-sc-bd">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-sc-dark truncate">{a.titre}</p>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.statut === 'Publiée' ? 'bg-sc-g-lt text-[#4a7020]' : 'bg-amber-50 text-amber-700'}`}>
                              {a.statut}
                            </span>
                            <span className="text-[10px] text-sc-gr2">{a.views} vues · {a.candidatures} candidatures</span>
                          </div>
                        </div>
                        <button className="text-xs text-sc-cy font-bold border border-sc-cy rounded-lg px-2.5 py-1 bg-sc-cy-lt hover:bg-sc-cy hover:text-white transition-colors cursor-pointer">
                          Gérer
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-sc-gr2">
                    <i className="ti ti-home text-4xl mb-3 block" />
                    <p className="text-sm">Vous n'avez pas encore d'annonces.</p>
                    <Link to="/deposer" className="inline-flex items-center gap-1 mt-2 text-sc-cy text-xs font-bold no-underline hover:underline">
                      Déposer ma première annonce <i className="ti ti-arrow-right text-xs" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Favoris tab */}
            {activeTab === 'favoris' && (
              <div className="bg-white rounded-2xl border border-sc-bd p-5">
                <h2 className="font-bebas text-xl text-sc-dark mb-4">Mes favoris</h2>
                <div className="text-center py-8 text-sc-gr2">
                  <i className="ti ti-heart text-4xl mb-3 block text-sc-gr2" />
                  <p className="text-sm">Aucun favori pour l'instant.</p>
                  <Link to="/recherche" className="inline-flex items-center gap-1 mt-2 text-sc-cy text-xs font-bold no-underline hover:underline">
                    Explorer les annonces <i className="ti ti-arrow-right text-xs" />
                  </Link>
                </div>
              </div>
            )}

            {/* Securite tab */}
            {activeTab === 'securite' && (
              <div className="bg-white rounded-2xl border border-sc-bd p-5">
                <h2 className="font-bebas text-xl text-sc-dark mb-4">Sécurité du compte</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Mot de passe actuel</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-sc-dark mb-1">Nouveau mot de passe</label>
                    <input type="password" placeholder="••••••••" className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy" />
                  </div>
                  <button className="px-4 py-2 bg-sc-cy text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors">
                    Changer le mot de passe
                  </button>
                  <div className="h-px bg-sc-bd" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-sc-dark">Authentification à deux facteurs</p>
                      <p className="text-xs text-sc-gr2">Sécurisez votre compte avec un code SMS</p>
                    </div>
                    <div className="w-10 h-6 bg-gray-200 rounded-full cursor-pointer relative">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow transition-transform" />
                    </div>
                  </div>
                  <div className="h-px bg-sc-bd" />
                  <div>
                    <p className="text-sm font-bold text-sc-danger mb-1">Zone de danger</p>
                    <button className="px-4 py-2 border border-sc-danger text-sc-danger bg-transparent rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-danger hover:text-white transition-colors">
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl border border-sc-bd p-5">
                <h2 className="font-bebas text-xl text-sc-dark mb-4">Préférences de notifications</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Nouvelles candidatures', desc: 'Quand quelqu\'un postule sur votre annonce', enabled: true },
                    { label: 'Messages', desc: 'Quand vous recevez un nouveau message', enabled: true },
                    { label: 'Alertes de recherche', desc: 'Nouvelles annonces correspondant à vos critères', enabled: false },
                    { label: 'Actualités Sarintany\'COLOC', desc: 'Newsletter mensuelle et mises à jour', enabled: false },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-sc-bd last:border-none">
                      <div>
                        <p className="text-sm font-bold text-sc-dark">{n.label}</p>
                        <p className="text-xs text-sc-gr2">{n.desc}</p>
                      </div>
                      <div className={`w-10 h-6 rounded-full cursor-pointer relative transition-colors ${n.enabled ? 'bg-sc-cy' : 'bg-gray-200'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-transform ${n.enabled ? 'right-0.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
