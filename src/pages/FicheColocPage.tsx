import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ANNONCES } from '../data/annonces';
import { useApp } from '../context/AppContext';

const COLOCATAIRES_DEMO = [
  { id: 1, nom: 'Hery R.', age: 26, initiales: 'HR', profession: 'Développeur web', statut: 'Leader', bio: 'Fan de musique et de cuisine. Je suis calme et ordonné.' },
  { id: 2, nom: 'Miora T.', age: 23, initiales: 'MT', profession: 'Étudiante en gestion', statut: 'Membre', bio: 'J\'adore les plantes et les longues discussions.' },
  { id: 3, nom: 'Tahiana R.', age: 28, initiales: 'TR', profession: 'Infirmière', statut: 'Membre', bio: 'Je travaille en horaires décalés, je suis discrète.' },
];

export default function FicheColocPage() {
  const { id } = useParams();
  const { auth, setShowAuthModal, setAuthModalTab } = useApp();
  const [imgIdx, setImgIdx] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  const annonce = ANNONCES.find(a => a.id === parseInt(id || '1')) || ANNONCES[0];

  const handleCandidater = () => {
    if (auth === 'guest') {
      setAuthModalTab('login');
      setShowAuthModal(true);
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-sc-bg">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-sc-bd px-4 py-2 flex items-center gap-2 text-xs text-sc-gr2">
        <Link to="/recherche" className="text-sc-cy no-underline hover:underline">Annonces</Link>
        <i className="ti ti-chevron-right text-[10px]" />
        <span>{annonce.quartier}</span>
        <i className="ti ti-chevron-right text-[10px]" />
        <span className="text-sc-dark font-bold">{annonce.titre}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Main content */}
          <div>
            {/* Image gallery */}
            <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <div
                className="flex h-full transition-transform duration-300"
                style={{ transform: `translateX(-${imgIdx * 100}%)` }}
              >
                {annonce.images.map((src, i) => (
                  <img key={i} src={src} alt={annonce.titre} className="min-w-full h-full object-cover flex-shrink-0" />
                ))}
              </div>
              {/* Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {annonce.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full border-none cursor-pointer ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
              {/* Nav */}
              {annonce.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(v => Math.max(0, v - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center hover:bg-white transition-colors shadow">
                    <i className="ti ti-chevron-left text-sm text-sc-dark" />
                  </button>
                  <button onClick={() => setImgIdx(v => Math.min(annonce.images.length - 1, v + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center hover:bg-white transition-colors shadow">
                    <i className="ti ti-chevron-right text-sm text-sc-dark" />
                  </button>
                </>
              )}
              {/* Badges */}
              {annonce.verified && (
                <span className="absolute top-3 left-3 bg-sc-y2 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  ✓ Annonce vérifiée
                </span>
              )}
            </div>

            {/* Title block */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sc-gr2 tracking-wide">
                    Colocation existante · {annonce.logement}
                  </span>
                  <h1 className="text-xl font-bold text-sc-dark mt-0.5">{annonce.titre}</h1>
                  <p className="text-sm text-sc-gr1 flex items-center gap-1 mt-1">
                    <i className="ti ti-map-pin text-sc-cy text-sm" />
                    {annonce.quartier}, {annonce.ville}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-sc-dark">
                    {annonce.prix.toLocaleString('fr-FR')} <span className="text-sm font-normal text-sc-gr2">Ar</span>
                  </p>
                  <p className="text-xs text-sc-gr2">par personne / mois</p>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 mt-3 py-3 border-t border-sc-bd">
                {[
                  { icon: 'ti-ruler-2', val: `${annonce.surface} m²`, label: 'Surface totale' },
                  { icon: 'ti-users', val: `${annonce.colocataires} pers.`, label: 'Colocataires' },
                  { icon: 'ti-door', val: annonce.chambreSurface ? `${annonce.chambreSurface} m²` : 'N/A', label: 'Chambre' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <i className={`ti ${s.icon} text-sc-cy text-lg block mb-1`} />
                    <p className="text-sm font-bold text-sc-dark">{s.val}</p>
                    <p className="text-[10px] text-sc-gr2">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colocataires */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-3 flex items-center gap-2">
                <i className="ti ti-users text-sc-cy" />
                Tes futurs colocataires
              </h2>
              <div className="space-y-3">
                {COLOCATAIRES_DEMO.map(c => (
                  <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-sc-bg border border-sc-bd">
                    <div className="w-10 h-10 rounded-full bg-sc-y2 text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {c.initiales}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-sc-dark">{c.nom}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sc-cy-lt text-[#2a7a90]">{c.statut}</span>
                        <span className="text-xs text-sc-gr2">{c.age} ans · {c.profession}</span>
                      </div>
                      <p className="text-xs text-sc-gr1 mt-1 italic">« {c.bio} »</p>
                    </div>
                    <button className="text-xs text-sc-cy font-bold border border-sc-cy rounded-lg px-2.5 py-1 bg-sc-cy-lt hover:bg-sc-cy hover:text-white transition-colors cursor-pointer border-t border-l border-r border-b flex-shrink-0">
                      Contacter
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-3 flex items-center gap-2">
                <i className="ti ti-sparkles text-sc-cy" />
                Services inclus
              </h2>
              <div className="flex flex-wrap gap-2">
                {annonce.services.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-cy-lt text-[#2a7a90] text-xs font-bold rounded-xl border border-[rgba(70,189,214,0.3)]">
                    <i className="ti ti-check text-xs" />
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Règles */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-3 flex items-center gap-2">
                <i className="ti ti-shield-check text-sc-cy" />
                Règles de vie
              </h2>
              <div className="flex flex-wrap gap-2">
                {annonce.regles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-g-lt text-[#4a7020] text-xs font-bold rounded-xl border border-[rgba(153,204,51,0.3)]">
                    <i className="ti ti-circle-check text-xs" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {annonce.description && (
              <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
                <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-2 flex items-center gap-2">
                  <i className="ti ti-notes text-sc-cy" />
                  Description
                </h2>
                <p className="text-sm text-sc-gr1 leading-relaxed">{annonce.description}</p>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-3">
            {/* CTA Card */}
            <div className="bg-white rounded-2xl p-4 border border-sc-bd sticky top-20">
              <p className="text-xs text-sc-gr2 mb-1">1 chambre disponible</p>
              <p className="text-2xl font-bold text-sc-dark mb-0.5">
                {annonce.prix.toLocaleString('fr-FR')} Ar
                <span className="text-xs font-normal text-sc-gr2">/mois</span>
              </p>
              <p className="text-xs text-sc-gr2 mb-3 flex items-center gap-1">
                <i className="ti ti-calendar text-xs text-sc-y2" />
                Disponible : {annonce.disponible}
              </p>

              <button
                onClick={handleCandidater}
                className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <i className="ti ti-send text-sm" />
                Postuler maintenant
              </button>
              <button className="w-full bg-sc-g-lt text-[#4a7020] border border-[rgba(153,204,51,0.3)] rounded-xl py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-y2 hover:text-white transition-colors flex items-center justify-center gap-2">
                <i className="ti ti-message text-sm" />
                Contacter la coloc
              </button>

              <div className="mt-3 pt-3 border-t border-sc-bd text-xs text-sc-gr2 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <i className="ti ti-shield-check text-sc-y2 text-sm" />
                  Annonce vérifiée par notre équipe
                </p>
                <p className="flex items-center gap-1.5">
                  <i className="ti ti-clock text-sc-cy text-sm" />
                  Réponse généralement sous 24h
                </p>
              </div>
            </div>

            {/* Map preview */}
            <div className="bg-white rounded-2xl p-3 border border-sc-bd">
              <h3 className="text-xs font-bold text-sc-dark mb-2 flex items-center gap-1">
                <i className="ti ti-map-pin text-sc-cy text-sm" />
                Localisation
              </h3>
              <div className="h-32 bg-sc-g-lt rounded-xl flex items-center justify-center text-sm text-sc-gr2">
                <div className="text-center">
                  <i className="ti ti-map-2 text-2xl text-sc-cy mb-1 block" />
                  <p>{annonce.quartier}</p>
                  <p className="text-[10px]">{annonce.ville}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidature modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center py-8 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bebas text-xl text-sc-dark">Postuler pour cette chambre</h3>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center text-sm hover:bg-gray-200">
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="bg-sc-g-lt border border-[rgba(153,204,51,0.3)] rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-sc-dark">{annonce.titre}</p>
              <p className="text-xs text-sc-gr2">{annonce.quartier} · {annonce.prix.toLocaleString('fr-FR')} Ar/mois</p>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-bold text-sc-dark mb-1">Message de présentation</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Présente-toi brièvement : ta situation, ton mode de vie, pourquoi cette coloc t'intéresse…"
                className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-sc-bd rounded-xl py-2.5 text-sm font-bold text-sc-dark cursor-pointer hover:bg-gray-50 transition-colors bg-white"
              >
                Annuler
              </button>
              <button
                onClick={() => { setShowModal(false); }}
                className="flex-1 bg-sc-cy text-white border-none rounded-xl py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors"
              >
                Envoyer ma candidature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
