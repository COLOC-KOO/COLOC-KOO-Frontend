  import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogoSVG } from '../components/Logo';
import AnnonceCard from '../components/AnnonceCard';
import { ANNONCES, VILLES } from '../data/annonces';
import { useApp } from '../context/AppContext';

const HERO_BG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80';

export default function HomePage() {
  const [tab, setTab] = useState<'coloc' | 'proprio'>('coloc');
  const [searchVal, setSearchVal] = useState('');
  const [showSugg, setShowSugg] = useState(false);
  const { liteMode, setShowAuthModal, setAuthModalTab } = useApp();
  const navigate = useNavigate();

  const featured = ANNONCES.filter(a => a.featured).slice(0, 3);
  const recent = ANNONCES.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/recherche?q=${encodeURIComponent(searchVal)}&type=${tab}`);
  };

  return (
    <main className="flex flex-col min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[300px] bg-gray-900">
        {!liteMode && (
          <img
            src={HERO_BG}
            alt="Colocation Madagascar"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {liteMode && (
          <div className="absolute inset-0 bg-gradient-to-br from-sc-cy-lt to-sc-g-lt" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/55 to-black/10" />

        <div className="relative z-10 py-8 pb-7 flex flex-col items-center text-center px-4">
          <h1 className="font-bebas text-[40px] leading-tight text-white tracking-wide mb-1.5 px-4">
            Trouves ta coloc,{' '}
            <span style={{ color: '#CCCC33' }}>partout à Madagascar</span>
          </h1>
          <p className="text-[13px] text-white/65 mb-5 italic">
            Plateforme gratuite • Annonces vérifiées • Services inclus
          </p>

          {/* Tabs */}
          <div className="flex gap-2.5 mb-4">
            {[
              { v: 'coloc' as const, label: 'Rejoindre une coloc', icon: 'ti-users' },
              { v: 'proprio' as const, label: 'Proposer mon logement', icon: 'ti-home' },
            ].map(t => (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                className={`flex items-center gap-1.5 px-6 py-2.5 rounded-3xl text-sm font-bold cursor-pointer border-2 transition-all ${
                  tab === t.v
                    ? 'bg-sc-cy text-white border-sc-cy'
                    : 'bg-transparent text-white/85 border-white/50 hover:border-white hover:text-white'
                }`}
              >
                <i className={`ti ${t.icon} text-sm`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="w-[80%] max-w-[680px] relative">
            <form onSubmit={handleSearch}>
              <div className="bg-white rounded-xl py-1.5 px-3.5 pr-1.5 flex items-center gap-2 shadow-lg">
                <i className="ti ti-search text-sc-gr2 text-lg flex-shrink-0" />
                <input
                  className="flex-1 min-w-0 border-none outline-none text-sm text-sc-dark bg-transparent"
                  placeholder="Quartier, ville, commune…"
                  value={searchVal}
                  onChange={e => { setSearchVal(e.target.value); setShowSugg(true); }}
                  onFocus={() => setShowSugg(true)}
                  onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                />
                <button
                  type="submit"
                  className="bg-sc-y2 text-white border-none rounded-lg px-4 py-2 text-xs font-bold cursor-pointer hover:bg-[#7faa28] transition-colors flex-shrink-0"
                >
                  Rechercher
                </button>
              </div>
            </form>

            {/* Suggestions */}
            {showSugg && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-sc-lg text-left z-50">
                {VILLES.slice(0, 5).map(v => (
                  <button
                    key={v.code}
                    onMouseDown={() => navigate(`/recherche?q=${v.nom}&type=${tab}`)}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-sc-dark border-b border-gray-100 last:border-none cursor-pointer hover:bg-gray-50 transition-colors bg-none border-none text-left font-sans"
                  >
                    <i className="ti ti-map-pin text-sc-cy text-sm flex-shrink-0" />
                    <span className="flex-1">{v.nom}</span>
                    <span className="text-[10px] text-sc-gr2 bg-gray-100 rounded px-1.5 py-0.5">{v.count} annonces</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-5 bg-white/8 rounded-xl px-5 py-2.5">
            {[
              { n: '120+', l: 'Annonces actives' },
              { n: '12', l: 'Villes' },
              { n: '850+', l: 'Colocataires' },
            ].map((s, i) => (
              <div key={i} className={`text-center ${i > 0 ? 'border-l border-white/15 pl-4' : ''}`}>
                <div className="font-bebas text-2xl text-white tracking-wide">{s.n}</div>
                <div className="text-[10px] text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="py-6 px-5 bg-white">
        <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">
          Annonces à la une
        </h2>
        <p className="text-xs text-sc-gr2 mb-4 text-center">Sélectionnées par notre équipe</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {featured.map(a => (
            <AnnonceCard key={a.id} annonce={a} />
          ))}
        </div>
        <div className="text-center mt-4">
          <Link
            to="/recherche"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-sc-cy rounded-xl text-sm font-bold text-sc-cy bg-sc-cy-lt no-underline hover:bg-sc-cy hover:text-white transition-colors"
          >
            <i className="ti ti-search text-sm" />
            Voir toutes les annonces
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-6 px-5 bg-[#F7F9F3]">
        <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">
          Comment ça marche
        </h2>
        <p className="text-xs text-sc-gr2 mb-5 text-center">En 3 étapes simples</p>
        <div className="flex flex-col gap-3.5 max-w-lg mx-auto">
          {[
            { n: 1, color: '#46BDD6', icon: 'ti-search', title: 'Recherche ta coloc', desc: 'Filtre par ville, budget, services et règles de vie. Trouve le logement qui correspond à tes critères.' },
            { n: 2, color: '#99CC33', icon: 'ti-file-text', title: 'Postule ou contacte', desc: 'Envoie ta candidature directement depuis la fiche. Complète ton profil pour rassurer les colocataires.' },
            { n: 3, color: '#CCCC33', icon: 'ti-home-check', title: 'Emménage !', desc: 'Finalise les démarches avec les colocataires et le propriétaire. Sarintany\'COLOC t\'accompagne jusqu\'à la signature.' },
          ].map(step => (
            <div key={step.n} className="flex items-start gap-3.5">
              <div
                className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-bebas text-base flex-shrink-0 text-white"
                style={{ background: step.color }}
              >
                {step.n}
              </div>
              <div>
                <p className="text-sm font-bold text-sc-dark mb-0.5">{step.title}</p>
                <p className="text-xs text-sc-gr1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VILLES */}
      <section className="py-6 px-5 bg-white">
        <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">
          Cherche par ville
        </h2>
        <p className="text-xs text-sc-gr2 mb-4 text-center">Disponible partout à Madagascar</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
          {VILLES.map(v => (
            <Link
              key={v.code}
              to={`/recherche?q=${v.nom}`}
              className="flex items-center justify-between p-3 rounded-xl border border-sc-bd bg-white hover:border-sc-cy hover:bg-sc-cy-lt transition-colors no-underline group"
            >
              <div className="flex items-center gap-2">
                <i className="ti ti-map-pin text-sc-cy text-sm" />
                <span className="text-sm font-bold text-sc-dark group-hover:text-[#2a7a90]">{v.nom}</span>
              </div>
              <span className="text-[10px] text-sc-gr2 bg-gray-100 rounded px-1.5 py-0.5 font-bold">
                {v.count}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY SARINTANY */}
      <section className="py-6 px-5 bg-[#F7F9F3]">
        <div className="max-w-lg mx-auto bg-gradient-to-br from-sc-cy-lt to-sc-g-lt rounded-2xl p-5 border border-[rgba(70,189,214,.2)] text-center">
          <h2 className="font-bebas text-[19px] text-sc-dark tracking-wide mb-2">
            Pourquoi Sarintany'COLOC ?
          </h2>
          <p className="text-xs text-sc-gr1 leading-relaxed mb-3">
            La seule plateforme de colocation dédiée à Madagascar. Annonces vérifiées, services détaillés,
            partenaires locaux, et une équipe qui connaît le marché malgache.
          </p>
          <p className="text-sm text-sc-cy font-bold italic border-t border-[rgba(70,189,214,.3)] pt-3">
            « Trouver un colocataire de confiance, c'est possible. »
          </p>
          <div className="flex gap-2 mt-4 justify-center">
            <button
              onClick={() => { setAuthModalTab('register'); setShowAuthModal(true); }}
              className="px-5 py-2.5 bg-sc-cy text-white border-none rounded-xl text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
            >
              Créer mon compte
            </button>
            <Link
              to="/partenaires"
              className="px-5 py-2.5 bg-white text-sc-dark border border-sc-bd rounded-xl text-sm font-bold no-underline hover:bg-gray-50 transition-colors"
            >
              Nos partenaires
            </Link>
          </div>
        </div>
      </section>

      {/* RECENT */}
      <section className="py-6 px-5 bg-white">
        <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">
          Dernières annonces
        </h2>
        <p className="text-xs text-sc-gr2 mb-4 text-center">Mises en ligne récemment</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-5xl mx-auto">
          {recent.map(a => (
            <AnnonceCard key={a.id} annonce={a} />
          ))}
        </div>
      </section>

      {/* CTA PROPRIO */}
      <section className="py-8 px-5 bg-sc-dark text-center">
        <div className="max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-sc-cy/20 flex items-center justify-center mx-auto mb-3">
            <i className="ti ti-home-plus text-2xl text-sc-cy" />
          </div>
          <h2 className="font-bebas text-[26px] text-white tracking-wide mb-2">
            Tu as un logement à proposer ?
          </h2>
          <p className="text-sm text-white/65 mb-4 leading-relaxed">
            Dépose ton annonce gratuitement et constitue ta colocation idéale.
            Notre équipe vérifie et met en avant ton logement.
          </p>
          <Link
            to="/deposer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-sc-y2 text-white border-none rounded-xl text-sm font-bold no-underline hover:bg-[#7faa28] transition-colors"
          >
            <i className="ti ti-plus text-sm" />
            Déposer une annonce
          </Link>
        </div>
      </section>
    </main>
  );
}
