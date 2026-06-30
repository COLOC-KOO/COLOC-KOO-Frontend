// AuthModal.tsx
import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    authModalTab, 
    setAuthModalTab, 
    login, 
    loginWithCredentials, 
    registerWithCredentials 
  } = useApp();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'coloc' | 'proprio'>('coloc');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAuthModal) {
        setShowAuthModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal, setShowAuthModal]);

  // Bloquer le scroll du body et focus sur le premier input
  useEffect(() => {
    if (showAuthModal) {
      document.body.style.overflow = 'hidden';
      // Focus sur le premier input après un court délai
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAuthModal]);

  // Réinitialiser l'erreur quand on change d'onglet
  useEffect(() => {
    setError('');
  }, [authModalTab]);

  if (!showAuthModal) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Fermer uniquement si on clique sur l'overlay, pas sur le modal
    if (e.target === e.currentTarget) {
      setShowAuthModal(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (authModalTab === 'login') {
        await loginWithCredentials(email, password);
      } else {
        const parts = name.trim().split(/\s+/);
        const prenom = parts.shift() || '';
        const nom = parts.join(' ') || prenom;
        
        // Vérifier que le nom complet est rempli
        if (!name.trim()) {
          throw new Error('Veuillez entrer votre nom complet');
        }
        
        await registerWithCredentials({
          email,
          mot_de_passe: password,
          nom,
          prenom,
          // Le rôle sera géré par le backend en fonction du type d'utilisateur
          id_role: role === 'proprio' ? 2 : 1, // 1 = coloc, 2 = proprio
        });
      }
      // Fermer le modal après connexion réussie
      setShowAuthModal(false);
    } catch (err) {
      // Afficher un message d'erreur plus clair
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (r: 'coloc' | 'proprio' | 'admin' | 'moderator') => {
    login(r);
    setShowAuthModal(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
      style={{
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-[480px] p-6 relative max-h-[90vh] overflow-y-auto"
        style={{
          animation: 'slideUp 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()} // Empêcher la fermeture si on clique à l'intérieur
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Bouton de fermeture */}
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 border-none flex items-center justify-center cursor-pointer text-sc-dark hover:bg-gray-200 transition-colors"
          aria-label="Fermer le modal"
        >
          <i className="ti ti-x text-lg" />
        </button>

        {/* Titre */}
        <h2 id="auth-modal-title" className="text-xl font-bold text-sc-dark mb-1 text-center">
          {authModalTab === 'login' ? 'Bienvenue' : 'Rejoins la communauté'}
        </h2>
        <p className="text-sm text-sc-gr1 text-center mb-5">
          {authModalTab === 'login' 
            ? 'Connecte-toi pour accéder à ton compte' 
            : 'Crée ton compte et trouve ta colocation idéale'}
        </p>

        {/* Onglets */}
        <div className="flex mb-5 border-b border-sc-bd">
          {(['login', 'register'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setAuthModalTab(tab)}
              className={`flex-1 py-2.5 text-sm font-bold border-none bg-transparent cursor-pointer transition-colors ${
                authModalTab === tab
                  ? 'text-sc-cy border-b-2 border-sc-cy -mb-px'
                  : 'text-sc-gr1 hover:text-sc-dark'
              }`}
              aria-selected={authModalTab === tab}
              role="tab"
            >
              {tab === 'login' ? 'Se connecter' : 'S\'inscrire'}
            </button>
          ))}
        </div>

        {/* Mode demo */}
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs text-amber-700 font-bold mb-2 flex items-center gap-1">
            <i className="ti ti-info-circle" />
            Mode demo - connexion rapide
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { role: 'coloc' as const, label: 'Colocataire', icon: 'ti-user', color: 'bg-sc-cy-lt text-[#2a7a90]' },
              { role: 'proprio' as const, label: 'Proprietaire', icon: 'ti-home', color: 'bg-sc-g-lt text-[#4a7020]' },
              { role: 'admin' as const, label: 'Super Admin', icon: 'ti-shield', color: 'bg-purple-50 text-purple-700' },
              { role: 'moderator' as const, label: 'Moderateur', icon: 'ti-eye', color: 'bg-orange-50 text-orange-700' },
            ].map(d => (
              <button
                key={d.role}
                onClick={() => handleDemoLogin(d.role)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer border-none ${d.color} hover:opacity-80 transition-opacity`}
                type="button"
              >
                <i className={`ti ${d.icon} text-sm`} />
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-amber-600 mt-2 text-center">
            Les comptes demo sont préconfigurés pour tester l'application
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {authModalTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-sc-dark mb-1">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="Rakoto Andriamahefa"
                className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
                required
                autoComplete="name"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-sc-dark mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              ref={!authModalTab || authModalTab === 'login' ? firstInputRef : undefined}
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="mon@email.mg"
              className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
              required
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-sc-dark mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
              required
              minLength={6}
              autoComplete={authModalTab === 'login' ? 'current-password' : 'new-password'}
            />
            {authModalTab === 'register' && (
              <p className="text-xs text-sc-gr2 mt-1">Minimum 6 caractères</p>
            )}
          </div>
          
          {authModalTab === 'register' && (
            <div className="flex gap-2">
              {[
                { v: 'coloc' as const, label: 'Je cherche une coloc', icon: 'ti-search' },
                { v: 'proprio' as const, label: 'Je propose un logement', icon: 'ti-home' },
              ].map(opt => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRole(opt.v)}
                  className={`flex-1 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                    role === opt.v
                      ? 'border-sc-cy bg-sc-cy-lt text-[#2a7a90]'
                      : 'border-sc-bd bg-white text-sc-gr1 hover:border-sc-cy'
                  }`}
                >
                  <i className={`ti ${opt.icon} text-sm`} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
          
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 flex items-start gap-2">
              <i className="ti ti-alert-circle text-lg flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Chargement...
              </span>
            ) : (
              authModalTab === 'login' ? 'Se connecter' : 'Créer mon compte'
            )}
          </button>
          
          {authModalTab === 'login' && (
            <p className="text-center text-xs text-sc-gr2">
              <button 
                type="button" 
                className="text-sc-cy font-bold bg-none border-none cursor-pointer hover:underline"
                onClick={() => {
                  // Logique pour le mot de passe oublié
                  alert('Fonctionnalité à venir : réinitialisation du mot de passe');
                }}
              >
                Mot de passe oublié ?
              </button>
            </p>
          )}
        </form>

        {/* Pied de page */}
        <div className="mt-4 pt-4 border-t border-sc-bd text-center">
          <p className="text-xs text-sc-gr2">
            En continuant, vous acceptez les 
            <button type="button" className="text-sc-cy font-bold bg-none border-none cursor-pointer hover:underline mx-1">
              Conditions d'utilisation
            </button>
            et la 
            <button type="button" className="text-sc-cy font-bold bg-none border-none cursor-pointer hover:underline mx-1">
              Politique de confidentialité
            </button>
          </p>
        </div>
      </div>

      {/* Styles d'animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
