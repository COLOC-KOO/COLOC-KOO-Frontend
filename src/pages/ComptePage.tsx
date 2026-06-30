// src/pages/ComptePage.tsx - Version simplifiée sans langues
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api, { type ApiUser } from '../services/api';

export default function ComptePage() {
  const { user, auth, logout, setShowAuthModal, setAuthModalTab, token } = useApp();
  const [activeTab, setActiveTab] = useState('profil');
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [profileForm, setProfileForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    profession: '',
    age: '',
    bio: '',
    profile_picture: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Charger les données du profil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || auth === 'guest') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await api.users.me(token);
        
        if (data) {
          setProfileForm({
            nom: data.nom || '',
            prenom: data.prenom || '',
            email: data.email || '',
            telephone: data.telephone || '',
            profession: data.profession || '',
            age: data.age?.toString() || '',
            bio: data.bio || '',
            profile_picture: data.profile_picture || '',
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        setError('Impossible de charger votre profil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [auth, token]);

  // Calculer le pourcentage de complétion du profil
  const calculateCompletion = () => {
    const fields = ['nom', 'prenom', 'telephone', 'profession', 'age', 'bio'];
    const filled = fields.filter(f => {
      const value = profileForm[f as keyof typeof profileForm];
      return value && value.toString().trim().length > 0;
    });
    return Math.round((filled.length / fields.length) * 100);
  };

  const PROFIL_COMPLETION = calculateCompletion();

  // Sauvegarder le profil
  const handleSaveProfile = async () => {
    if (!token) {
      setError('Vous devez être connecté pour modifier votre profil.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updateData: Partial<ApiUser> = {
        nom: profileForm.nom,
        prenom: profileForm.prenom,
        telephone: profileForm.telephone,
        profession: profileForm.profession,
        age: profileForm.age ? parseInt(profileForm.age) : undefined,
        bio: profileForm.bio,
        profile_picture: profileForm.profile_picture,
      };

      const updatedUser = await api.users.updateMe(updateData, token);
      
      setSuccess('Profil mis à jour avec succès !');
      setEditMode(false);
      
      if (updatedUser) {
        setProfileForm({
          nom: updatedUser.nom || '',
          prenom: updatedUser.prenom || '',
          email: updatedUser.email || '',
          telephone: updatedUser.telephone || '',
          profession: updatedUser.profession || '',
          age: updatedUser.age?.toString() || '',
          bio: updatedUser.bio || '',
          profile_picture: updatedUser.profile_picture || '',
        });
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde du profil.');
    } finally {
      setSaving(false);
    }
  };

  // Changer le mot de passe
  const handleChangePassword = async () => {
    if (!token) {
      setError('Vous devez être connecté pour changer votre mot de passe.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (!passwordForm.currentPassword) {
      setError('Veuillez entrer votre mot de passe actuel.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await api.auth.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      }, token);
      
      setSuccess('Mot de passe changé avec succès !');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.');
    } finally {
      setSaving(false);
    }
  };

  // Si l'utilisateur n'est pas connecté
  if (auth === 'guest') {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd shadow-sc">
          <i className="ti ti-user-circle text-5xl text-sc-cy block mb-4" />
          <h2 className="font-bebas text-2xl text-sc-dark mb-2">Mon compte</h2>
          <p className="text-sm text-sc-gr1 mb-5">Connectez-vous pour accéder à votre espace personnel.</p>
          <button 
            onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }} 
            className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
          >
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

  // Rendu du contenu des onglets
  const renderContent = () => {
    switch (activeTab) {
      case 'profil':
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bebas text-xl text-sc-dark">Mon profil</h2>
              <div className="flex gap-2">
                {editMode && (
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setError(null);
                      setSuccess(null);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold border border-sc-bd bg-white text-sc-dark hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Annuler
                  </button>
                )}
                <button
                  onClick={() => {
                    if (editMode) {
                      handleSaveProfile();
                    } else {
                      setEditMode(true);
                      setError(null);
                      setSuccess(null);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                    editMode 
                      ? 'bg-sc-y2 text-white border-sc-y2 hover:bg-[#7faa28]' 
                      : 'bg-white text-sc-dark border-sc-bd hover:border-sc-cy'
                  }`}
                  disabled={saving}
                >
                  <i className={`ti ${editMode ? 'ti-check' : 'ti-edit'} text-sm`} />
                  {editMode ? (saving ? 'Enregistrement...' : 'Sauvegarder') : 'Modifier'}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <i className="ti ti-check-circle" />
                {success}
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-sc-cy border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-sc-gr2">Chargement du profil...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Nom', field: 'nom', type: 'text' },
                  { label: 'Prénom', field: 'prenom', type: 'text' },
                  { label: 'Email', field: 'email', type: 'email', disabled: true },
                  { label: 'Téléphone', field: 'telephone', type: 'tel' },
                  { label: 'Profession', field: 'profession', type: 'text' },
                  { label: 'Âge', field: 'age', type: 'number' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-bold text-sc-gr2 mb-1">{f.label}</label>
                    {editMode ? (
                      <input
                        type={f.type}
                        value={profileForm[f.field as keyof typeof profileForm]}
                        onChange={e => setProfileForm(prev => ({ ...prev, [f.field]: e.target.value }))}
                        disabled={f.disabled}
                        className={`w-full border border-sc-bd rounded-xl px-3 py-2 text-sm outline-none focus:border-sc-cy transition-colors ${f.disabled ? 'bg-gray-50 text-sc-gr2' : ''}`}
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
                      className="w-full border border-sc-bd rounded-xl px-3 py-2 text-sm outline-none focus:border-sc-cy resize-none transition-colors"
                      placeholder="Parlez de vous..."
                    />
                  ) : (
                    <p className="text-sm text-sc-dark">{profileForm.bio || '—'}</p>
                  )}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-sc-bg rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-sc-dark">Profil complété</span>
                <span className="text-xs font-bold text-sc-cy">{PROFIL_COMPLETION}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-sc-y1 to-sc-y2 transition-all duration-500" 
                  style={{ width: `${PROFIL_COMPLETION}%` }} 
                />
              </div>
              {PROFIL_COMPLETION < 100 && (
                <p className="text-xs text-sc-gr2 mt-2 flex items-center gap-1">
                  <i className="ti ti-info-circle" />
                  Complétez votre profil pour augmenter vos chances d'être accepté
                </p>
              )}
            </div>
          </div>
        );

      case 'annonces':
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bebas text-xl text-sc-dark">Mes annonces</h2>
              <Link to="/deposer" className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-cy text-white rounded-xl text-xs font-bold no-underline hover:bg-sc-cy-d transition-colors">
                <i className="ti ti-plus text-sm" />
                Nouvelle annonce
              </Link>
            </div>
            {(auth === 'proprio' || auth === 'agent' || auth === 'admin') ? (
              <div className="space-y-3">
                <div className="p-4 bg-sc-bg rounded-xl border border-sc-bd text-center text-sm text-sc-gr2">
                  <i className="ti ti-info-circle mr-1" />
                  Fonctionnalité en développement
                </div>
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
        );

      case 'favoris':
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
            <h2 className="font-bebas text-xl text-sc-dark mb-4">Mes favoris</h2>
            <div className="text-center py-8 text-sc-gr2">
              <i className="ti ti-heart text-4xl mb-3 block text-sc-gr2" />
              <p className="text-sm">Aucun favori pour l'instant.</p>
              <Link to="/recherche" className="inline-flex items-center gap-1 mt-2 text-sc-cy text-xs font-bold no-underline hover:underline">
                Explorer les annonces <i className="ti ti-arrow-right text-xs" />
              </Link>
            </div>
          </div>
        );

      case 'securite':
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
            <h2 className="font-bebas text-xl text-sc-dark mb-4">Sécurité du compte</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                <i className="ti ti-alert-circle" />
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                <i className="ti ti-check-circle" />
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Mot de passe actuel</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy transition-colors"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy transition-colors"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy transition-colors"
                  disabled={saving}
                />
              </div>
              <button
                onClick={handleChangePassword}
                disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                className="px-4 py-2 bg-sc-cy text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Changement en cours...' : 'Changer le mot de passe'}
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
                <p className="text-sm font-bold text-red-600 mb-1">Zone de danger</p>
                <button 
                  className="px-4 py-2 border border-red-500 text-red-500 bg-transparent rounded-xl text-sm font-bold cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                      // Logique de suppression
                    }
                  }}
                >
                  Supprimer mon compte
                </button>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
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
        );

      default:
        return (
          <div className="bg-white rounded-2xl border border-sc-bd p-5 shadow-sc">
            <h2 className="font-bebas text-xl text-sc-dark mb-4">
              {TABS.find(t => t.id === activeTab)?.label}
            </h2>
            <div className="text-center py-8 text-sc-gr2">
              <i className="ti ti-construction text-4xl mb-3 block" />
              <p className="text-sm">Cette section est en cours de développement.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-sc-bg">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header card */}
        <div className="bg-white rounded-2xl border border-sc-bd p-5 mb-4 flex items-start gap-4 flex-wrap shadow-sc">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sc-y1 to-sc-y2 text-white font-bold text-xl flex items-center justify-center flex-shrink-0">
              {profileForm.prenom?.[0]}{profileForm.nom?.[0] || user?.initials || '?'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-sc-cy text-white border-2 border-white flex items-center justify-center cursor-pointer hover:bg-sc-cy-d transition-colors">
              <i className="ti ti-camera text-[10px]" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-sc-dark">
              {profileForm.prenom} {profileForm.nom}
            </h1>
            <p className="text-sm text-sc-gr2">{profileForm.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs bg-sc-cy-lt text-[#2a7a90] font-bold px-2 py-0.5 rounded-lg capitalize flex items-center gap-1">
                <i className="ti ti-user text-xs" />
                {auth === 'coloc' ? 'Colocataire' : 
                 auth === 'proprio' ? 'Propriétaire' : 
                 auth === 'admin' ? 'Super Admin' : 
                 auth === 'moderator' ? 'Modérateur' : 
                 auth === 'agent' ? 'Agent' : 'Membre'}
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
          <div className="bg-white rounded-2xl border border-sc-bd p-2 h-fit shadow-sc">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                  setSuccess(null);
                }}
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
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold cursor-pointer border-none bg-transparent text-red-500 hover:bg-red-50 transition-colors text-left"
            >
              <i className="ti ti-logout text-base" />
              Déconnexion
            </button>
          </div>

          {/* Content */}
          <div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}