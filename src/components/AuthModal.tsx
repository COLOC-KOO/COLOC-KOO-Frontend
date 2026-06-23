import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authModalTab, setAuthModalTab, login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'coloc' | 'proprio'>('coloc');
  const [step, setStep] = useState<'form' | 'demo'>('form');

  if (!showAuthModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('demo');
  };

  const handleDemoLogin = (r: 'coloc' | 'proprio' | 'admin' | 'moderator') => {
    login(r);
    setShowAuthModal(false);
    setStep('form');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[999] flex items-start justify-center py-8 px-3.5 overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) setShowAuthModal(false); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] p-6 relative animate-fadeIn">
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 border-none flex items-center justify-center cursor-pointer text-sm text-sc-dark hover:bg-gray-200 transition-colors"
        >
          <i className="ti ti-x" />
        </button>

        {step === 'form' ? (
          <>
            {/* Tabs */}
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
                >
                  {tab === 'login' ? 'Se connecter' : 'S\'inscrire'}
                </button>
              ))}
            </div>

            {/* Demo selector */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700 font-bold mb-2 flex items-center gap-1">
                <i className="ti ti-info-circle" />
                Mode démo — connexion rapide
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: 'coloc' as const, label: 'Colocataire', icon: 'ti-user', color: 'bg-sc-cy-lt text-[#2a7a90]' },
                  { role: 'proprio' as const, label: 'Propriétaire', icon: 'ti-home', color: 'bg-sc-g-lt text-[#4a7020]' },
                  { role: 'admin' as const, label: 'Super Admin', icon: 'ti-shield', color: 'bg-purple-50 text-purple-700' },
                  { role: 'moderator' as const, label: 'Modérateur', icon: 'ti-eye', color: 'bg-orange-50 text-orange-700' },
                ].map(d => (
                  <button
                    key={d.role}
                    onClick={() => handleDemoLogin(d.role)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer border-none ${d.color} hover:opacity-80 transition-opacity`}
                  >
                    <i className={`ti ${d.icon} text-sm`} />
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {authModalTab === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-sc-dark mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Rakoto Andriamahefa"
                    className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="mon@email.mg"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy transition-colors"
                  required
                />
              </div>
              {authModalTab === 'register' && (
                <div className="flex gap-2">
                  {[
                    { v: 'coloc', label: 'Je cherche une coloc', icon: 'ti-search' },
                    { v: 'proprio', label: 'Je propose un logement', icon: 'ti-home' },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setRole(opt.v as 'coloc' | 'proprio')}
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
              <button
                type="submit"
                className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
              >
                {authModalTab === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </button>
              {authModalTab === 'login' && (
                <p className="text-center text-xs text-sc-gr2">
                  <button type="button" className="text-sc-cy font-bold bg-none border-none cursor-pointer">
                    Mot de passe oublié ?
                  </button>
                </p>
              )}
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-sc-g-lt flex items-center justify-center mx-auto mb-4">
              <i className="ti ti-circle-check text-3xl text-sc-y2" />
            </div>
            <h3 className="font-bebas text-2xl text-sc-dark mb-2">Bienvenue !</h3>
            <p className="text-sm text-sc-gr1">Votre compte a été créé avec succès.</p>
            <button
              onClick={() => { login(role); setStep('form'); }}
              className="mt-4 bg-sc-cy text-white border-none rounded-xl px-6 py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
            >
              Accéder à mon compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
