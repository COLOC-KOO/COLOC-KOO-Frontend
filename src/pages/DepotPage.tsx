// src/pages/DepotPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STEPS = [
  { n: 1, label: "Type d'annonce", icon: 'ti-home' },
  { n: 2, label: 'Logement', icon: 'ti-building' },
  { n: 3, label: 'Services & règles', icon: 'ti-sparkles' },
  { n: 4, label: 'Photos & prix', icon: 'ti-camera' },
  { n: 5, label: 'Publication', icon: 'ti-send' },
];

const SERVICES_OPTS = [
  'Femme de ménage', 'Gardien', 'Jardinier', "Porteurs d'eau",
  'Parking voiture', 'Parking moto', 'Connexion internet', 'Eau courante',
  'Surpresseur', 'Balcon', 'Jardin', 'Piscine', 'Machine à laver', 'Four / gazinière',
];

const REGLES_OPTS = [
  'Filles uniquement', 'Garçons uniquement', 'Mixte',
  'Enfants acceptés', 'Animaux acceptés', 'Non-fumeur', 'Non-alcool',
];

const QUARTIERS = ['Ankadifotsy', 'Analakely', 'Ivandry', 'Masinandriana', 'Ampefiloha', 'Iavoloha', 'Tanjombato'];
const VILLES = ['Antananarivo', 'Mahajanga', 'Toamasina', 'Fianarantsoa', 'Antsirabe', 'Antsiranana'];

// Mapping des villes vers leurs IDs (à adapter selon votre base de données)
const VILLE_IDS = {
  'Antananarivo': 1,
  'Mahajanga': 2,
  'Toamasina': 3,
  'Fianarantsoa': 4,
  'Antsirabe': 5,
  'Antsiranana': 6,
};

export default function DepotPage() {
  const { auth, setShowAuthModal, setAuthModalTab, createAnnonce, isCreating, user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    // Étape 1: Type d'annonce
    typeAnnonce: '' // 'coloc' | 'proprio'
  });
  const [annonceData, setAnnonceData] = useState({
    // Étape 2: Logement
    typeLogement: '',
    ville: '',
    quartier: '',
    surface: '',
    nbChambres: '',
    nbColocMax: '',
    description: '',
    
    // Étape 3: Services & règles
    services: [],
    regles: [],
    
    // Étape 4: Photos & prix
    prixParPersonne: '',
    dispo: '',
    contact: '',
    photos: [],
  });
  const [published, setPublished] = useState(false);

  // Vérifier si l'utilisateur est connecté
  if (auth === 'guest') {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd shadow-sc">
          <div className="w-16 h-16 rounded-full bg-sc-cy-lt flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-home-plus text-3xl text-sc-cy" />
          </div>
          <h2 className="font-bebas text-2xl text-sc-dark mb-2">Dépose une annonce</h2>
          <p className="text-sm text-sc-gr1 mb-5">Tu dois être connecté pour déposer une annonce sur Sarintany'COLOC.</p>
          <button
            onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
            className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors mb-2"
          >
            Se connecter
          </button>
          <button
            onClick={() => { setAuthModalTab('register'); setShowAuthModal(true); }}
            className="w-full bg-white border border-sc-bd rounded-xl py-2.5 text-sm font-bold text-sc-dark cursor-pointer hover:bg-gray-50 transition-colors"
          >
            Créer un compte gratuit
          </button>
        </div>
      </div>
    );
  }

  // Validation des étapes
  const canNext = () => {
    if (step === 1) return !!form.typeAnnonce;
    if (step === 2) return !!(annonceData.ville && annonceData.quartier && annonceData.surface && annonceData.nbColocMax);
    if (step === 3) return true;
    if (step === 4) return !!(annonceData.prixParPersonne && annonceData.dispo);
    return true;
  };

  // Navigation entre les étapes
  const handleNext = () => {
    if (canNext() && step < 5) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Soumission de l'annonce
  const handleSubmit = async () => {
    setError(null);
    
    try {
      // Construire les données pour l'API
      const apiData = {
        titre: `${annonceData.typeLogement} à ${annonceData.quartier}`,
        description: annonceData.description || '',
        type_annonce: form.typeAnnonce === 'coloc' ? 'existante' : 'creation',
        type_propriete: annonceData.typeLogement.toLowerCase(),
        total_colocataires: parseInt(annonceData.nbColocMax) || null,
        surface_totale: parseInt(annonceData.surface) || null,
        quartier: annonceData.quartier,
        id_ville: VILLE_IDS[annonceData.ville] || null,
        chambres: {
          surface: parseInt(annonceData.surface) || null,
          prix_loyer: parseInt(annonceData.prixParPersonne) || 0,
          date_disponibilite: annonceData.dispo || null,
        },
        services: annonceData.services || [],
        regles: annonceData.regles || [],
        photos: annonceData.photos || [],
        contact: annonceData.contact || '',
      };

      const result = await createAnnonce(apiData);
      
      if (result) {
        setPublished(true);
        // Rediriger vers la page de l'annonce après un délai
        setTimeout(() => {
          navigate(`/annonce/${result.id_annonce || result.id}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
      setError(err.message || 'Erreur lors de la création de l\'annonce');
    }
  };

  // Si l'annonce est publiée
  if (published) {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd shadow-sc">
          <div className="w-16 h-16 rounded-full bg-sc-g-lt flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-circle-check text-4xl text-sc-y2" />
          </div>
          <h2 className="font-bebas text-2xl text-sc-dark mb-2">Annonce soumise !</h2>
          <p className="text-sm text-sc-gr1 mb-1">Votre annonce a été envoyée pour modération.</p>
          <p className="text-xs text-sc-gr2 mb-5">Elle sera publiée après vérification par notre équipe (généralement sous 24h).</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-xs text-amber-700 text-left">
            <p className="font-bold mb-1 flex items-center gap-1"><i className="ti ti-clock text-sm" /> Prochaines étapes</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Modération par notre équipe (24h)</li>
              <li>Publication de votre annonce</li>
              <li>Notifications lors des candidatures</li>
            </ul>
          </div>
          <button onClick={() => navigate('/')} className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  // Fonctions utilitaires pour les toggles
  const toggleArr = (arr, val) => {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  };

  // Mise à jour des champs du formulaire
  const updateAnnonceField = (field, value) => {
    setAnnonceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Rendu des différentes étapes
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="font-bebas text-xl text-sc-dark mb-1">Quel type d'annonce ?</h2>
            <p className="text-xs text-sc-gr2 mb-4">Choisissez le type d'annonce que vous souhaitez publier</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  v: 'coloc',
                  icon: 'ti-users',
                  title: 'Colocation existante',
                  desc: 'Vous faites partie d\'une colocation et cherchez un colocataire pour une chambre libre',
                },
                {
                  v: 'proprio',
                  icon: 'ti-home-plus',
                  title: 'Colocation à constituer',
                  desc: 'Vous êtes propriétaire et cherchez à constituer une nouvelle colocation dans votre logement',
                },
              ].map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setForm(f => ({ ...f, typeAnnonce: opt.v }))}
                  className={`text-left p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    form.typeAnnonce === opt.v
                      ? 'border-sc-cy bg-sc-cy-lt'
                      : 'border-sc-bd bg-white hover:border-sc-cy'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    form.typeAnnonce === opt.v ? 'bg-sc-cy text-white' : 'bg-gray-100 text-sc-gr1'
                  }`}>
                    <i className={`ti ${opt.icon} text-xl`} />
                  </div>
                  <h3 className="font-bold text-sm text-sc-dark mb-1">{opt.title}</h3>
                  <p className="text-xs text-sc-gr1 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="font-bebas text-xl text-sc-dark mb-1">Informations sur le logement</h2>
            <p className="text-xs text-sc-gr2 mb-4">Décrivez votre logement avec précision</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-sc-dark mb-1">Ville *</label>
                  <select
                    value={annonceData.ville}
                    onChange={e => updateAnnonceField('ville', e.target.value)}
                    className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy bg-white"
                  >
                    <option value="">Choisir...</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-sc-dark mb-1">Quartier *</label>
                  <select
                    value={annonceData.quartier}
                    onChange={e => updateAnnonceField('quartier', e.target.value)}
                    className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm text-sc-dark outline-none focus:border-sc-cy bg-white"
                  >
                    <option value="">Choisir...</option>
                    {QUARTIERS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Type de logement *</label>
                <div className="flex gap-2 flex-wrap">
                  {['Appartement', 'Maison', 'Villa', 'Studio'].map(t => (
                    <button
                      key={t}
                      onClick={() => updateAnnonceField('typeLogement', t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                        annonceData.typeLogement === t
                          ? 'border-sc-cy bg-sc-cy-lt text-[#2a7a90]'
                          : 'border-sc-bd bg-white text-sc-gr1 hover:border-sc-cy'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Surface totale (m²) *', field: 'surface', placeholder: 'ex: 90' },
                  { label: 'Nb chambres total', field: 'nbChambres', placeholder: 'ex: 3' },
                  { label: 'Colocataires max *', field: 'nbColocMax', placeholder: 'ex: 3' },
                ].map(f => (
                  <div key={f.field}>
                    <label className="block text-xs font-bold text-sc-dark mb-1">{f.label}</label>
                    <input
                      type="number"
                      value={annonceData[f.field]}
                      onChange={e => updateAnnonceField(f.field, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Description</label>
                <textarea
                  value={annonceData.description}
                  onChange={e => updateAnnonceField('description', e.target.value)}
                  placeholder="Décrivez votre logement, l'ambiance, les avantages du quartier…"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="font-bebas text-xl text-sc-dark mb-1">Services & règles de vie</h2>
            <p className="text-xs text-sc-gr2 mb-4">Ces informations aident les candidats à trouver le bon match</p>
            <div className="mb-4">
              <p className="text-sm font-bold text-sc-dark mb-2 flex items-center gap-1">
                <i className="ti ti-sparkles text-sc-cy" />
                Services inclus
              </p>
              <div className="flex flex-wrap gap-2">
                {SERVICES_OPTS.map(s => (
                  <button
                    key={s}
                    onClick={() => updateAnnonceField('services', toggleArr(annonceData.services, s))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                      annonceData.services.includes(s)
                        ? 'border-sc-cy bg-sc-cy-lt text-[#2a7a90]'
                        : 'border-sc-bd bg-white text-sc-gr1 hover:border-sc-cy'
                    }`}
                  >
                    {annonceData.services.includes(s) && <i className="ti ti-check text-xs mr-1" />}
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-sc-dark mb-2 flex items-center gap-1">
                <i className="ti ti-shield-check text-sc-cy" />
                Règles de vie
              </p>
              <div className="flex flex-wrap gap-2">
                {REGLES_OPTS.map(r => (
                  <button
                    key={r}
                    onClick={() => updateAnnonceField('regles', toggleArr(annonceData.regles, r))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
                      annonceData.regles.includes(r)
                        ? 'border-sc-y2 bg-sc-g-lt text-[#4a7020]'
                        : 'border-sc-bd bg-white text-sc-gr1 hover:border-sc-y2'
                    }`}
                  >
                    {annonceData.regles.includes(r) && <i className="ti ti-check text-xs mr-1" />}
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="font-bebas text-xl text-sc-dark mb-1">Photos & tarification</h2>
            <p className="text-xs text-sc-gr2 mb-4">Les annonces avec photos reçoivent 5x plus de candidatures</p>

            {/* Photo upload */}
            <div className="border-2 border-dashed border-sc-bd rounded-2xl p-6 text-center mb-4 hover:border-sc-cy transition-colors cursor-pointer">
              <i className="ti ti-camera text-3xl text-sc-gr2 mb-2 block" />
              <p className="text-sm font-bold text-sc-dark mb-1">Ajouter des photos</p>
              <p className="text-xs text-sc-gr2">PNG, JPG jusqu'à 10 Mo · Maximum 10 photos</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                id="photo-upload"
                onChange={(e) => {
                  // Gérer l'upload des photos ici
                  const files = Array.from(e.target.files);
                  // Pour l'instant, on simule des URLs
                  const urls = files.map(f => URL.createObjectURL(f));
                  updateAnnonceField('photos', [...annonceData.photos, ...urls]);
                }}
              />
              <label htmlFor="photo-upload" className="mt-3 inline-block px-4 py-2 bg-sc-cy-lt text-sc-cy text-xs font-bold rounded-xl border border-[rgba(70,189,214,0.3)] cursor-pointer hover:bg-sc-cy hover:text-white transition-colors">
                Choisir des fichiers
              </label>
              {annonceData.photos.length > 0 && (
                <div className="mt-3 text-xs text-sc-gr2">
                  {annonceData.photos.length} photo(s) sélectionnée(s)
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Prix par personne (Ar) *</label>
                <input
                  type="number"
                  value={annonceData.prixParPersonne}
                  onChange={e => updateAnnonceField('prixParPersonne', e.target.value)}
                  placeholder="ex: 350000"
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                  step={10000}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-sc-dark mb-1">Disponibilité *</label>
                <input
                  type="date"
                  value={annonceData.dispo}
                  onChange={e => updateAnnonceField('dispo', e.target.value)}
                  className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-bold text-sc-dark mb-1">Contact direct (optionnel)</label>
              <input
                type="tel"
                value={annonceData.contact}
                onChange={e => updateAnnonceField('contact', e.target.value)}
                placeholder="+261 XX XXX XXXX"
                className="w-full border border-sc-bd rounded-xl px-3 py-2.5 text-sm outline-none focus:border-sc-cy"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="font-bebas text-xl text-sc-dark mb-1">Récapitulatif & publication</h2>
            <p className="text-xs text-sc-gr2 mb-4">Vérifiez les informations avant de soumettre</p>

            <div className="space-y-2">
              {[
                { label: 'Type', val: form.typeAnnonce === 'coloc' ? 'Colocation existante' : 'Colocation à constituer' },
                { label: 'Logement', val: `${annonceData.typeLogement} · ${annonceData.surface} m²` },
                { label: 'Localisation', val: `${annonceData.quartier}, ${annonceData.ville}` },
                { label: 'Colocataires', val: `${annonceData.nbColocMax} max` },
                { label: 'Prix', val: annonceData.prixParPersonne ? `${parseInt(annonceData.prixParPersonne).toLocaleString('fr-FR')} Ar/pers.` : '—' },
                { label: 'Services', val: annonceData.services.length ? annonceData.services.join(', ') : 'Aucun' },
                { label: 'Règles', val: annonceData.regles.length ? annonceData.regles.join(', ') : 'Aucune' },
                { label: 'Contact', val: annonceData.contact || 'Non fourni' },
              ].map(r => (
                <div key={r.label} className="flex gap-2 py-2 border-b border-sc-bd last:border-none">
                  <span className="text-xs font-bold text-sc-gr2 w-28 flex-shrink-0">{r.label}</span>
                  <span className="text-xs text-sc-dark">{r.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              <p className="font-bold flex items-center gap-1 mb-1">
                <i className="ti ti-shield-check text-sm" />
                Charte Sarintany'COLOC
              </p>
              <p>En soumettant cette annonce, vous acceptez que notre équipe la vérifie avant publication. Les annonces non conformes seront refusées.</p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">
                <i className="ti ti-alert-circle mr-2" />
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-sc-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/" className="text-sc-gr2 hover:text-sc-dark transition-colors no-underline">
            <i className="ti ti-arrow-left text-lg" />
          </Link>
          <div>
            <h1 className="font-bebas text-2xl text-sc-dark tracking-wide">Déposer une annonce</h1>
            <p className="text-xs text-sc-gr2">Service gratuit · Vérification sous 24h</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-6 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-shrink-0">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  step === s.n
                    ? 'bg-sc-cy text-white'
                    : step > s.n
                    ? 'bg-sc-g-lt text-[#4a7020]'
                    : 'bg-white text-sc-gr2 border border-sc-bd'
                }`}
              >
                <i className={`ti ${s.icon} text-sm`} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.n}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-4 h-px bg-sc-bd mx-1" />}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-sc-bd p-5 mb-4 shadow-sc">
          {renderStep()}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              disabled={isCreating}
              className="flex-1 border border-sc-bd rounded-xl py-3 text-sm font-bold text-sc-dark cursor-pointer hover:bg-gray-50 transition-colors bg-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ti ti-arrow-left text-sm" />
              Précédent
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canNext() || isCreating}
              className={`flex-1 rounded-xl py-3 text-sm font-bold cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                canNext() && !isCreating
                  ? 'bg-sc-cy text-white border-none hover:bg-sc-cy-d'
                  : 'bg-gray-200 text-gray-400 border-none cursor-not-allowed'
              }`}
            >
              {isCreating ? 'Chargement...' : (
                <>
                  Suivant
                  <i className="ti ti-arrow-right text-sm" />
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="flex-1 bg-sc-y2 text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-[#7faa28] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <>
                  <i className="ti ti-loader animate-spin text-sm" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <i className="ti ti-send text-sm" />
                  Soumettre mon annonce
                </>
              )}
            </button>
          )}
        </div>

        {/* Message informatif */}
        <p className="text-center text-xs text-sc-gr2 mt-4">
          <i className="ti ti-shield-check mr-1" />
          Toutes les annonces sont modérées avant publication
        </p>
      </div>
    </div>
  );
}