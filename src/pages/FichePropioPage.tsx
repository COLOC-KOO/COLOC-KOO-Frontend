import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ANNONCES } from '../data/annonces';
import { useApp } from '../context/AppContext';

export default function FichePropioPage() {
  const { id } = useParams();
  const { auth, setShowAuthModal, setAuthModalTab } = useApp();
  const [imgIdx, setImgIdx] = useState(0);
  const [showCandidature, setShowCandidature] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState<'info' | 'success'>('info');

  const annonce = ANNONCES.find(a => a.id === parseInt(id || '4')) || ANNONCES.find(a => a.type === 'proprio') || ANNONCES[3];

  const CANDIDATS_DEMO = [
    { initiales: 'LR', nom: 'Lalaina R.', age: 25, statut: 'En attente' },
    { initiales: 'HA', nom: 'Haja A.', age: 27, statut: 'En attente' },
    { initiales: 'MN', nom: 'Miora N.', age: 22, statut: 'Accepté' },
  ];

  const handleCandidater = () => {
    if (auth === 'guest') {
      setAuthModalTab('login');
      setShowAuthModal(true);
    } else {
      setShowCandidature(true);
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
        {/* Coloc à constituer badge */}
        <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl w-fit">
          <i className="ti ti-users-plus text-amber-600 text-sm" />
          <span className="text-xs font-bold text-amber-700">Colocation à constituer — Le propriétaire cherche ses colocataires</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Main */}
          <div>
            {/* Gallery */}
            <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <div className="flex h-full transition-transform duration-300" style={{ transform: `translateX(-${imgIdx * 100}%)` }}>
                {annonce.images.map((src, i) => (
                  <img key={i} src={src} alt={annonce.titre} className="min-w-full h-full object-cover flex-shrink-0" />
                ))}
              </div>
              {annonce.verified && (
                <span className="absolute top-3 left-3 bg-sc-y2 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">
                  ✓ Propriétaire vérifié
                </span>
              )}
              <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-lg text-white" style={{ background: '#CCCC33' }}>
                Coloc à créer
              </span>
              {annonce.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(v => Math.max(0, v - 1))} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center hover:bg-white shadow">
                    <i className="ti ti-chevron-left text-sm text-sc-dark" />
                  </button>
                  <button onClick={() => setImgIdx(v => Math.min(annonce.images.length - 1, v + 1))} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/88 border-none cursor-pointer flex items-center justify-center hover:bg-white shadow">
                    <i className="ti ti-chevron-right text-sm text-sc-dark" />
                  </button>
                </>
              )}
            </div>

            {/* Title */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <span className="text-[10px] uppercase font-bold text-sc-gr2 tracking-wide">
                Colocation à constituer · {annonce.logement}
              </span>
              <h1 className="text-xl font-bold text-sc-dark mt-0.5 mb-1">{annonce.titre}</h1>
              <p className="text-sm text-sc-gr1 flex items-center gap-1">
                <i className="ti ti-map-pin text-sc-cy text-sm" />
                {annonce.quartier}, {annonce.ville}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div>
                  <span className="text-2xl font-bold text-sc-dark">{annonce.prix.toLocaleString('fr-FR')} Ar</span>
                  <span className="text-xs text-sc-gr2">/personne/mois</span>
                </div>
                <span className="text-xs text-sc-gr2 bg-gray-100 rounded-lg px-2 py-1">
                  Total logement : {(annonce.prix * annonce.colocataires).toLocaleString('fr-FR')} Ar
                </span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-4 gap-3 mt-3 py-3 border-t border-sc-bd">
                {[
                  { icon: 'ti-ruler-2', val: `${annonce.surface} m²`, label: 'Surface' },
                  { icon: 'ti-users', val: `${annonce.colocataires} pers.`, label: 'Cherche' },
                  { icon: 'ti-door', val: annonce.chambreSurface ? `${annonce.chambreSurface} m²` : 'N/A', label: 'Par chambre' },
                  { icon: 'ti-calendar', val: 'Dispo', label: annonce.disponible },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <i className={`ti ${s.icon} text-sc-cy text-lg block mb-1`} />
                    <p className="text-sm font-bold text-sc-dark">{s.val}</p>
                    <p className="text-[10px] text-sc-gr2">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
              <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-3 flex items-center gap-2">
                <i className="ti ti-sparkles text-sc-cy" />
                Services inclus par le propriétaire
              </h2>
              <div className="flex flex-wrap gap-2">
                {annonce.services.map(s => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-cy-lt text-[#2a7a90] text-xs font-bold rounded-xl">
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
                Profil recherché
              </h2>
              <div className="flex flex-wrap gap-2">
                {annonce.regles.map(r => (
                  <span key={r} className="flex items-center gap-1.5 px-3 py-1.5 bg-sc-g-lt text-[#4a7020] text-xs font-bold rounded-xl">
                    <i className="ti ti-circle-check text-xs" />
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Candidats */}
            <div className="bg-white rounded-2xl p-4 border border-sc-bd">
              <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-1 flex items-center gap-2">
                <i className="ti ti-users text-sc-cy" />
                Candidats actuels ({CANDIDATS_DEMO.length}/{annonce.colocataires})
              </h2>
              <p className="text-xs text-sc-gr2 mb-3">
                {annonce.colocataires - CANDIDATS_DEMO.filter(c => c.statut === 'Accepté').length} place{annonce.colocataires - CANDIDATS_DEMO.filter(c => c.statut === 'Accepté').length > 1 ? 's' : ''} restante{annonce.colocataires - CANDIDATS_DEMO.filter(c => c.statut === 'Accepté').length > 1 ? 's' : ''}
              </p>
              <div className="flex gap-2 flex-wrap">
                {CANDIDATS_DEMO.map(c => (
                  <div key={c.initiales} className="flex items-center gap-2 px-3 py-2 bg-sc-bg rounded-xl border border-sc-bd">
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${c.statut === 'Accepté' ? 'bg-sc-y2 text-white' : 'bg-gray-200 text-sc-gr1'}`}>
                      {c.initiales}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-sc-dark">{c.nom}</p>
                      <p className={`text-[10px] font-bold ${c.statut === 'Accepté' ? 'text-sc-y2' : 'text-sc-gr2'}`}>{c.statut}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-sc-bd sticky top-20">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-sc-bd">
                <div className="w-10 h-10 rounded-full bg-sc-y1 text-white font-bold flex items-center justify-center text-sm">
                  RM
                </div>
                <div>
                  <p className="text-sm font-bold text-sc-dark">Rabe M.</p>
                  <p className="text-xs text-sc-gr2 flex items-center gap-1">
                    <i className="ti ti-shield-check text-sc-y2 text-xs" />
                    Propriétaire vérifié
                  </p>
                </div>
              </div>

              <p className="text-2xl font-bold text-sc-dark mb-1">
                {annonce.prix.toLocaleString('fr-FR')} Ar
                <span className="text-xs font-normal text-sc-gr2">/pers./mois</span>
              </p>
              <p className="text-xs text-sc-gr2 mb-4 flex items-center gap-1">
                <i className="ti ti-calendar text-xs text-sc-y2" />
                Disponible : {annonce.disponible}
              </p>

              <button
                onClick={handleCandidater}
                className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors flex items-center justify-center gap-2 mb-2"
              >
                <i className="ti ti-send" />
                Postuler pour rejoindre
              </button>
              <button className="w-full bg-white border border-sc-bd rounded-xl py-2.5 text-sm font-bold cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <i className="ti ti-phone text-sc-cy" />
                Demander un rappel
              </button>

              <div className="mt-3 pt-3 border-t border-sc-bd space-y-1.5 text-xs text-sc-gr2">
                <p className="flex items-center gap-1.5"><i className="ti ti-users text-sc-cy" /> {CANDIDATS_DEMO.length} candidat(s) déjà</p>
                <p className="flex items-center gap-1.5"><i className="ti ti-clock text-sc-y2" /> Répond généralement sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Candidature modal */}
      {showCandidature && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center py-8 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 animate-fadeIn">
            {step === 'info' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bebas text-xl text-sc-dark">Postuler pour rejoindre</h3>
                  <button onClick={() => setShowCandidature(false)} className="w-7 h-7 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center">
                    <i className="ti ti-x text-sm" />
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
                  <i className="ti ti-info-circle mr-1" />
                  Le propriétaire examine les candidatures et constitue lui-même la colocation.
                </div>
                <div className="mb-3">
                  <label className="block text-xs font-bold text-sc-dark mb-1">Message au propriétaire</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Présentez-vous et expliquez pourquoi vous souhaitez rejoindre cette colocation…"
                    className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy resize-none"
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCandidature(false)} className="flex-1 border border-sc-bd rounded-xl py-2.5 text-sm font-bold text-sc-dark cursor-pointer hover:bg-gray-50 bg-white">Annuler</button>
                  <button onClick={() => setStep('success')} className="flex-1 bg-sc-cy text-white border-none rounded-xl py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-cy-d">Envoyer</button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-sc-g-lt flex items-center justify-center mx-auto mb-4">
                  <i className="ti ti-circle-check text-3xl text-sc-y2" />
                </div>
                <h3 className="font-bebas text-xl text-sc-dark mb-2">Candidature envoyée !</h3>
                <p className="text-sm text-sc-gr1 mb-4">Le propriétaire a été notifié. Vous recevrez une réponse bientôt.</p>
                <button onClick={() => { setShowCandidature(false); setStep('info'); }} className="bg-sc-cy text-white border-none rounded-xl px-6 py-2.5 text-sm font-bold cursor-pointer hover:bg-sc-cy-d">
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
