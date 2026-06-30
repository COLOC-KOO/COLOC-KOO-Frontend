import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { showAuthModal, setShowAuthModal, authModalTab, setAuthModalTab, login, loginWithCredentials, registerWithCredentials } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'coloc' | 'proprio'>('coloc');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

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
        await registerWithCredentials({
          email,
          mot_de_passe: password,
          nom,
          prenom,
          id_role: role === 'proprio' ? 1 : 1,
        });
      }
      setShowAuthModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connexion impossible');
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
              placeholder="********"
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
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors disabled:opacity-60"
          >
            {loading ? 'Chargement...' : authModalTab === 'login' ? 'Se connecter' : 'Creer mon compte'}
          </button>
          {authModalTab === 'login' && (
            <p className="text-center text-xs text-sc-gr2">
              <button type="button" className="text-sc-cy font-bold bg-none border-none cursor-pointer">
                Mot de passe oublie ?
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}


