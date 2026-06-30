// src/pages/FicheColocPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useApp } from '../context/AppContext';

// Correction des icônes Leaflet par défaut
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AnnonceDetail {
  id: string;
  titre: string;
  description?: string;
  type_annonce: 'existante' | 'creation';
  type_propriete?: string;
  total_colocataires?: number;
  surface_totale?: number;
  quartier?: string;
  ville?: string;
  prix_loyer?: number;
  date_disponibilite?: string;
  photos: string[];
  services: string[];
  regles: string[];
  statut: string;
  verified?: boolean;
  auteur?: {
    nom: string;
    prenom: string;
  };
  latitude?: number;
  longitude?: number;
}

// Données de démonstration pour les colocataires
const COLOCATAIRES_DEMO = [
  { id: 1, nom: 'Hery R.', age: 26, initiales: 'HR', profession: 'Développeur web', statut: 'Leader', bio: 'Fan de musique et de cuisine. Je suis calme et ordonné.' },
  { id: 2, nom: 'Miora T.', age: 23, initiales: 'MT', profession: 'Étudiante en gestion', statut: 'Membre', bio: 'J\'adore les plantes et les longues discussions.' },
  { id: 3, nom: 'Tahiana R.', age: 28, initiales: 'TR', profession: 'Infirmière', statut: 'Membre', bio: 'Je travaille en horaires décalés, je suis discrète.' },
];

// Composant de galerie d'images
const ImageGallery = ({ images, titre }: { images: string[]; titre: string }) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Fonction pour générer une couleur de fond basée sur le titre
  const getPlaceholderColor = (index: number) => {
    const colors = ['#46BDD6', '#99CC33', '#FFB800', '#FF6B6B', '#845EC2', '#FF9671'];
    return colors[index % colors.length];
  };

  // Fonction pour générer une image placeholder SVG
  const getPlaceholderImage = (index: number) => {
    const color = getPlaceholderColor(index);
    const initial = titre.charAt(0).toUpperCase();
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="${color}" opacity="0.3"/>
        <text x="200" y="150" font-family="Arial" font-size="48" fill="${color}" text-anchor="middle" dominant-baseline="central">
          ${initial}
        </text>
        <text x="200" y="200" font-family="Arial" font-size="14" fill="${color}" text-anchor="middle" dominant-baseline="central">
          ${titre}
        </text>
      </svg>
    `)}`;
  };

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  if (!images || images.length === 0) {
    return (
      <div className="relative h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-sc-cy-lt to-sc-g-lt flex items-center justify-center">
        <div className="text-center text-sc-gr2">
          <i className="ti ti-photo text-4xl block mb-2" />
          <p className="text-sm font-medium">Aucune photo disponible</p>
          <p className="text-xs text-sc-gr2">{titre}</p>
        </div>
      </div>
    );
  }

  // Filtrer les images invalides et utiliser des placeholders
  const displayImages = images.map((src, index) => {
    if (imageErrors[index] || !src || src.startsWith('blob:')) {
      return getPlaceholderImage(index);
    }
    return src;
  });

  return (
    <>
      <div className="relative h-72 rounded-2xl overflow-hidden bg-gray-100 group">
        {/* Image principale */}
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${imgIdx * 100}%)` }}
        >
          {displayImages.map((src, i) => (
            <div key={i} className="min-w-full h-full relative flex-shrink-0">
              <img
                src={src}
                alt={`${titre} - Photo ${i + 1}`}
                className="w-full h-full object-cover"
                onError={() => handleImageError(i)}
                loading="lazy"
              />
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors"
              >
                <i className="ti ti-arrows-maximize text-sm" />
              </button>
            </div>
          ))}
        </div>

        {/* Indicateurs de navigation */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={() => setImgIdx(prev => (prev - 1 + displayImages.length) % displayImages.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border-none cursor-pointer flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <i className="ti ti-chevron-left text-lg text-sc-dark" />
            </button>
            <button
              onClick={() => setImgIdx(prev => (prev + 1) % displayImages.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white border-none cursor-pointer flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100"
            >
              <i className="ti ti-chevron-right text-lg text-sc-dark" />
            </button>
          </>
        )}

        {/* Dots */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${
                  i === imgIdx ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        {/* Compteur */}
        {displayImages.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
            {imgIdx + 1} / {displayImages.length}
          </div>
        )}
      </div>

      {/* Mode plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
          >
            <i className="ti ti-x" />
          </button>
          <button
            onClick={() => setImgIdx(prev => (prev - 1 + displayImages.length) % displayImages.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl"
          >
            <i className="ti ti-chevron-left" />
          </button>
          <button
            onClick={() => setImgIdx(prev => (prev + 1) % displayImages.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl"
          >
            <i className="ti ti-chevron-right" />
          </button>
          <img
            src={displayImages[imgIdx]}
            alt={`${titre} - Plein écran`}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onError={() => handleImageError(imgIdx)}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`w-2 h-2 rounded-full border-none cursor-pointer transition-all ${
                  i === imgIdx ? 'bg-white w-4' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

// Composant de carte avec Leaflet
const LocationMap = ({ 
  quartier, 
  ville, 
  latitude, 
  longitude 
}: { 
  quartier?: string; 
  ville?: string; 
  latitude?: number; 
  longitude?: number;
}) => {
  const position: [number, number] = latitude && longitude 
    ? [latitude, longitude] 
    : [-18.8792, 47.5079]; // Antananarivo par défaut

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="h-48 bg-sc-bg rounded-xl flex items-center justify-center">
        <div className="text-center text-sc-gr2">
          <div className="w-8 h-8 border-2 border-sc-cy border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 rounded-xl overflow-hidden relative">
      <MapContainer
        center={position}
        zoom={14}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold">{quartier || 'Emplacement'}</p>
              <p>{ville || 'Antananarivo'}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Contrôles de zoom personnalisés */}
      <div className="absolute right-2 bottom-2 flex flex-col gap-1">
        <button 
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-sc-dark transition-colors"
          onClick={() => {
            const map = document.querySelector('.leaflet-container') as any;
            if (map?._leaflet_id) {
              const leafletMap = (window as any).L?.map?.(map);
              if (leafletMap) leafletMap.zoomIn();
            }
          }}
        >
          <i className="ti ti-plus text-sm" />
        </button>
        <button 
          className="w-8 h-8 bg-white rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center text-sc-dark transition-colors"
          onClick={() => {
            const map = document.querySelector('.leaflet-container') as any;
            if (map?._leaflet_id) {
              const leafletMap = (window as any).L?.map?.(map);
              if (leafletMap) leafletMap.zoomOut();
            }
          }}
        >
          <i className="ti ti-minus text-sm" />
        </button>
      </div>

      {/* Badge localisation */}
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm">
        <p className="text-xs text-sc-dark font-medium">
          <i className="ti ti-map-pin text-sc-cy mr-1" />
          {quartier || 'Emplacement'}
        </p>
      </div>
    </div>
  );
};

export default function FicheColocPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { auth, setShowAuthModal, setAuthModalTab, getAnnonce } = useApp();
  
  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');

  // Charger l'annonce depuis l'API
  useEffect(() => {
    const fetchAnnonce = async () => {
      if (!id) {
        setError('ID d\'annonce manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const data = await getAnnonce(id);
        
        // Transformer les données pour le format attendu
        const formattedData: AnnonceDetail = {
          id: data.id || id,
          titre: data.titre || 'Annonce sans titre',
          description: data.description || undefined,
          type_annonce: data.type_annonce || 'existante',
          type_propriete: data.type_propriete || 'appartement',
          total_colocataires: data.total_colocataires || 0,
          surface_totale: data.surface_totale || 0,
          quartier: data.quartier || 'Non spécifié',
          ville: data.ville || 'Antananarivo',
          prix_loyer: data.chambre?.prix_loyer || data.prix || 0,
          date_disponibilite: data.chambre?.date_disponibilite || 'Dès maintenant',
          photos: data.photos && data.photos.length > 0 
            ? data.photos.filter((p: string) => p && !p.startsWith('blob:')) 
            : [],
          services: data.services || [],
          regles: data.regles || [],
          statut: data.statut || 'pending',
          verified: data.statut === 'active',
          auteur: data.auteur ? {
            nom: data.auteur.nom || 'Nom',
            prenom: data.auteur.prenom || 'Prénom',
          } : undefined,
          latitude: data.latitude || undefined,
          longitude: data.longitude || undefined,
        };

        setAnnonce(formattedData);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'annonce:', err);
        setError('Impossible de charger l\'annonce. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnonce();
  }, [id, getAnnonce]);

  const handleCandidater = () => {
    if (auth === 'guest') {
      setAuthModalTab('login');
      setShowAuthModal(true);
    } else {
      setShowModal(true);
    }
  };

  const handleSendCandidature = () => {
    console.log('Candidature envoyée pour l\'annonce:', id);
    console.log('Message:', message);
    setShowModal(false);
    setMessage('');
    // TODO: Appeler l'API pour envoyer la candidature
  };

  // États de chargement et d'erreur...
  if (loading) {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sc-cy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sc-gr1">Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd shadow-sc">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-alert-circle text-3xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-sc-dark mb-2">Erreur</h2>
          <p className="text-sm text-sc-gr1 mb-5">{error}</p>
          <button
            onClick={() => navigate('/recherche')}
            className="px-6 py-2 bg-sc-cy text-white rounded-xl text-sm font-bold hover:bg-sc-cy-d transition-colors"
          >
            Voir les annonces
          </button>
        </div>
      </div>
    );
  }

  if (!annonce) {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd shadow-sc">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <i className="ti ti-home-off text-3xl text-sc-gr2" />
          </div>
          <h2 className="text-xl font-bold text-sc-dark mb-2">Annonce introuvable</h2>
          <p className="text-sm text-sc-gr1 mb-5">L'annonce que vous recherchez n'existe pas ou a été supprimée.</p>
          <button
            onClick={() => navigate('/recherche')}
            className="px-6 py-2 bg-sc-cy text-white rounded-xl text-sm font-bold hover:bg-sc-cy-d transition-colors"
          >
            Voir les annonces
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sc-bg">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-sc-bd px-4 py-2 flex items-center gap-2 text-xs text-sc-gr2">
        <Link to="/recherche" className="text-sc-cy no-underline hover:underline">Annonces</Link>
        <i className="ti ti-chevron-right text-[10px]" />
        <span>{annonce.quartier}</span>
        <i className="ti ti-chevron-right text-[10px]" />
        <span className="text-sc-dark font-bold truncate max-w-[200px]">{annonce.titre}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* Main content */}
          <div>
            {/* Image Gallery */}
            <ImageGallery images={annonce.photos} titre={annonce.titre} />

            {/* Badge vérification */}
            {annonce.verified && (
              <div className="flex items-center gap-2 mt-2 text-xs text-sc-y2">
                <i className="ti ti-shield-check" />
                <span>Annonce vérifiée par notre équipe</span>
              </div>
            )}

            {/* Title block */}
            <div className="bg-white rounded-2xl p-4 mt-4 mb-4 border border-sc-bd">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sc-gr2 tracking-wide">
                    {annonce.type_annonce === 'creation' ? 'Colocation à constituer' : 'Colocation existante'} · {annonce.type_propriete}
                  </span>
                  <h1 className="text-xl font-bold text-sc-dark mt-0.5">{annonce.titre}</h1>
                  <p className="text-sm text-sc-gr1 flex items-center gap-1 mt-1">
                    <i className="ti ti-map-pin text-sc-cy text-sm" />
                    {annonce.quartier}, {annonce.ville}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-bold text-sc-dark">
                    {annonce.prix_loyer?.toLocaleString('fr-FR') || 0} <span className="text-sm font-normal text-sc-gr2">Ar</span>
                  </p>
                  <p className="text-xs text-sc-gr2">par personne / mois</p>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-3 mt-3 py-3 border-t border-sc-bd">
                {[
                  { icon: 'ti-ruler-2', val: `${annonce.surface_totale || 0} m²`, label: 'Surface totale' },
                  { icon: 'ti-users', val: `${annonce.total_colocataires || 0} pers.`, label: 'Colocataires' },
                  { icon: 'ti-door', val: 'N/A', label: 'Chambre' },
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
            {annonce.services && annonce.services.length > 0 && (
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
            )}

            {/* Règles */}
            {annonce.regles && annonce.regles.length > 0 && (
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
            )}

            {/* Description */}
            {annonce.description && (
              <div className="bg-white rounded-2xl p-4 mb-4 border border-sc-bd">
                <h2 className="font-bebas text-lg text-sc-dark tracking-wide mb-2 flex items-center gap-2">
                  <i className="ti ti-notes text-sc-cy" />
                  Description
                </h2>
                <p className="text-sm text-sc-gr1 leading-relaxed whitespace-pre-wrap">{annonce.description}</p>
              </div>
            )}
          </div>

          {/* Sticky sidebar */}
          <div className="space-y-3">
            {/* CTA Card */}
            <div className="bg-white rounded-2xl p-4 border border-sc-bd sticky top-20">
              <p className="text-xs text-sc-gr2 mb-1">1 chambre disponible</p>
              <p className="text-2xl font-bold text-sc-dark mb-0.5">
                {annonce.prix_loyer?.toLocaleString('fr-FR') || 0} Ar
                <span className="text-xs font-normal text-sc-gr2">/mois</span>
              </p>
              <p className="text-xs text-sc-gr2 mb-3 flex items-center gap-1">
                <i className="ti ti-calendar text-xs text-sc-y2" />
                Disponible : {annonce.date_disponibilite || 'Dès maintenant'}
              </p>

              {annonce.statut === 'active' ? (
                <>
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
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center text-xs text-yellow-700">
                  <i className="ti ti-clock text-sm block mb-1" />
                  Cette annonce est en cours de modération
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-sc-bd text-xs text-sc-gr2 space-y-1.5">
                <p className="flex items-center gap-1.5">
                  <i className="ti ti-shield-check text-sc-y2 text-sm" />
                  {annonce.verified ? 'Annonce vérifiée par notre équipe' : 'Annonce en cours de vérification'}
                </p>
                <p className="flex items-center gap-1.5">
                  <i className="ti ti-clock text-sc-cy text-sm" />
                  Réponse généralement sous 24h
                </p>
              </div>
            </div>

            {/* Localisation avec Leaflet */}
            <div className="bg-white rounded-2xl p-3 border border-sc-bd">
              <h3 className="text-xs font-bold text-sc-dark mb-2 flex items-center gap-1">
                <i className="ti ti-map-pin text-sc-cy text-sm" />
                Localisation
              </h3>
              <LocationMap 
                quartier={annonce.quartier}
                ville={annonce.ville}
                latitude={annonce.latitude}
                longitude={annonce.longitude}
              />
              <p className="text-xs text-sc-gr2 mt-2">
                <i className="ti ti-map text-sc-cy mr-1" />
                {annonce.quartier}, {annonce.ville}
              </p>
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
              <button 
                onClick={() => {
                  setShowModal(false);
                  setMessage('');
                }} 
                className="w-7 h-7 rounded-full bg-gray-100 border-none cursor-pointer flex items-center justify-center text-sm hover:bg-gray-200 transition-colors"
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <div className="bg-sc-g-lt border border-[rgba(153,204,51,0.3)] rounded-xl p-3 mb-4">
              <p className="text-xs font-bold text-sc-dark">{annonce.titre}</p>
              <p className="text-xs text-sc-gr2">{annonce.quartier} · {annonce.prix_loyer?.toLocaleString('fr-FR') || 0} Ar/mois</p>
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
                onClick={() => {
                  setShowModal(false);
                  setMessage('');
                }}
                className="flex-1 border border-sc-bd rounded-xl py-2.5 text-sm font-bold text-sc-dark cursor-pointer hover:bg-gray-50 transition-colors bg-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSendCandidature}
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