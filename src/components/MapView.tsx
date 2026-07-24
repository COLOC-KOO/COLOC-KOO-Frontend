import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import { Icon, LatLngExpression, LatLngBounds } from 'leaflet';
import { Listing } from '../types';
import { geocodeAddress } from '../lib/geocoding';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Import des icônes
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const activeIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
});

interface MapViewProps {
  listings: Listing[];
  activeListingId?: string | null;
  onListingHover?: (listing: Listing | null) => void;
  onListingClick?: (listing: Listing) => void;
}

// Composant pour centrer la carte UNIQUEMENT au chargement initial
function MapInitializer({ listings }: { listings: Listing[] }) {
  const map = useMap();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    
    const validListings = listings.filter(l => l.latitude && l.longitude);
    if (validListings.length === 0) {
      map.setView([-18.8792, 47.5079], 6);
      initialized.current = true;
      return;
    }

    const bounds = new LatLngBounds(
      [validListings[0].latitude!, validListings[0].longitude!],
      [validListings[0].latitude!, validListings[0].longitude!]
    );
    validListings.forEach(l => {
      bounds.extend([l.latitude!, l.longitude!]);
    });
    map.fitBounds(bounds, { 
      padding: [50, 50],
      maxZoom: 15
    });
    initialized.current = true;
  }, [listings, map]);
  
  return null;
}

// Composant pour gérer le survol SANS déplacer la carte
function MapHoverHandler({ activeListingId, listings }: { activeListingId?: string | null; listings: Listing[] }) {
  const map = useMap();
  const previousActiveId = useRef<string | null>(null);

  useEffect(() => {
    // Si l'ID actif change et qu'on a une annonce active
    if (activeListingId && activeListingId !== previousActiveId.current) {
      const active = listings.find((listing) => listing.id === activeListingId);
      
      // On ne fait que mettre à jour l'état, on NE déplace PAS la carte
      // On peut juste ouvrir un popup ou changer l'icône, mais pas bouger la vue
      
      // Optionnel : zoomer légèrement si l'annonce est hors écran
      if (active && active.latitude && active.longitude) {
        const bounds = map.getBounds();
        const point = [active.latitude, active.longitude];
        
        // Vérifier si le point est dans la vue actuelle
        if (!bounds.contains(point)) {
          // Si hors écran, on le met dans la vue sans vol brusque
          map.panTo(point, { animate: true, duration: 0.5 });
        }
      }
    }
    
    previousActiveId.current = activeListingId;
  }, [activeListingId, listings, map]);

  return null;
}

export function MapView({ listings, activeListingId, onListingHover, onListingClick }: MapViewProps) {
  const [geocodedListings, setGeocodedListings] = useState<Listing[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const geocodeListings = async () => {
      if (listings.length === 0) {
        setGeocodedListings([]);
        setIsGeocoding(false);
        return;
      }

      setIsGeocoding(true);

      const updatedListings: Listing[] = [];
      for (const listing of listings) {
        if (listing.latitude && listing.longitude) {
          updatedListings.push(listing);
          continue;
        }

        const addressCandidates = [
          listing.address,
          [listing.district, listing.city].filter(Boolean).join(', '),
          listing.city,
          listing.title,
        ]
          .filter(Boolean)
          .map((item) => String(item).trim())
          .filter(Boolean);

        let geocoded = listing;
        for (const candidate of addressCandidates) {
          try {
            const result = await geocodeAddress(candidate);
            if (result) {
              geocoded = {
                ...listing,
                latitude: result.latitude,
                longitude: result.longitude,
              };
              break;
            }
          } catch (error) {
            console.error(`Erreur de géocodage pour ${candidate}:`, error);
          }

          await delay(700);
        }

        updatedListings.push(geocoded);
      }

      // CORRECTION : Définition claire des coordonnées des villes malgaches
      const cityCoordinates: Record<string, [number, number]> = {
        'antananarivo': [-18.879190, 47.507905],
        'toamasina': [-18.1492, 49.4023],
        'fianarantsoa': [-21.4523, 47.0858],
        'mahajanga': [-15.7167, 46.3167],
        'majunga': [-15.7167, 46.3167],
        'toliara': [-23.3515, 43.6667],
        'tulear': [-23.3515, 43.6667],
        'antsirabe': [-19.8650, 47.0333],
        'diego suarez': [-12.2781, 49.2917],
        'antsiranana': [-12.2781, 49.2917],
        'morondava': [-20.2888, 44.3178],
        'ambositra': [-20.5300, 47.2436],
        'mananjary': [-21.2300, 48.3400],
        'manakara': [-22.1400, 48.0200],
        'farafangana': [-22.8200, 47.8300],
        'taolanaro': [-25.0300, 46.9900],
        'fort dauphin': [-25.0300, 46.9900],
        'ambovombe': [-25.1800, 46.0800],
        'miandrivazo': [-19.5300, 45.4600],
        'maintirano': [-18.0600, 44.0300],
        'sambava': [-14.2700, 50.1700],
        'andoany': [-14.6500, 49.6200],
        'antsalova': [-16.1500, 44.7200],
        'marovoay': [-16.1100, 46.6500],
        'nosy be': [-13.3119, 48.2699],
        'nosy-be': [-13.3119, 48.2699],
      };

      // Fonction de normalisation améliorée
      const normalizeCity = (city: string): string => {
        if (!city) return '';
        
        let normalized = city
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-zA-Z0-9\s-]/g, '')
          .toLowerCase()
          .trim();
          
        normalized = normalized.replace(/\s+/g, ' ');
        return normalized;
      };

      // Fonction pour trouver les coordonnées d'une ville
      const findCityCoordinates = (city: string): [number, number] | null => {
        if (!city) return null;
        
        const normalized = normalizeCity(city);
        if (!normalized) return null;
        
        if (cityCoordinates[normalized]) {
          return cityCoordinates[normalized];
        }
        
        const parts = normalized.split(' ');
        for (const part of parts) {
          if (cityCoordinates[part]) {
            return cityCoordinates[part];
          }
        }
        
        return null;
      };

      // Appliquer les coordonnées des villes
      const finalListings = updatedListings.map((listing) => {
        if (listing.latitude && listing.longitude) {
          return listing;
        }

        const coords = findCityCoordinates(listing.city || '');
        if (coords) {
          return {
            ...listing,
            latitude: coords[0],
            longitude: coords[1],
          };
        }

        if (listing.district) {
          const districtCoords = findCityCoordinates(listing.district);
          if (districtCoords) {
            return {
              ...listing,
              latitude: districtCoords[0],
              longitude: districtCoords[1],
            };
          }
        }

        return listing;
      });

      setGeocodedListings(finalListings);
      setIsGeocoding(false);
    };

    geocodeListings();
  }, [listings]);

  const defaultCenter: LatLngExpression = [-18.8792, 47.5079];

  if (isGeocoding) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-cyan mx-auto mb-4"></div>
          <p className="text-muted-foreground text-sm">Géolocalisation des annonces...</p>
        </div>
      </div>
    );
  }

  if (geocodedListings.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl">
        <div className="text-center text-muted-foreground p-8">
          <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Aucune annonce géolocalisée</p>
          <p className="text-sm">Les annonces seront affichées automatiquement</p>
        </div>
      </div>
    );
  }

  const activeListing = geocodedListings.find((listing) => listing.id === activeListingId);

  return (
    <div className="relative h-full">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        className="rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Initialisation unique de la carte */}
        <MapInitializer listings={geocodedListings} />
        
        {/* Gestion du survol SANS déplacement de la carte */}
        <MapHoverHandler 
          activeListingId={activeListingId} 
          listings={geocodedListings} 
        />
        
        {geocodedListings.map((listing) => {
          if (!listing.latitude || !listing.longitude) return null;
          
          const position: LatLngExpression = [listing.latitude, listing.longitude];
          const isActive = activeListingId === listing.id;
          
          return (
            <Marker
              key={listing.id}
              position={position}
              icon={isActive ? activeIcon : defaultIcon}
              eventHandlers={{
                click: () => {
                  if (onListingClick) {
                    onListingClick(listing);
                  }
                },
                mouseover: () => {
                  if (onListingHover) {
                    onListingHover(listing);
                  }
                },
                mouseout: () => {
                  if (onListingHover) {
                    onListingHover(null);
                  }
                }
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} sticky className="max-w-xs">
                <div className="w-56 p-2 bg-white rounded-lg shadow-md border border-gray-200">
                  {listing.image && (
                    <img src={listing.image} alt={listing.title} className="w-full h-28 object-cover rounded-md mb-2" />
                  )}
                  <div>
                    <h4 className="font-semibold text-sm leading-tight">{listing.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {listing.district ? `${listing.district}, ` : ''}
                      {listing.city || 'Ville non spécifiée'}
                    </p>
                    {listing.price && (
                      <p className="text-sm font-bold text-brand-cyan mt-2">
                        {listing.price} € / mois
                      </p>
                    )}
                  </div>
                </div>
              </Tooltip>
              <Popup>
                <div className="p-1">
                  {listing.image && (
                    <img 
                      src={listing.image} 
                      alt={listing.title} 
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-base">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.city || 'Ville non spécifiée'}
                  </p>
                  {listing.price && (
                    <p className="text-lg font-bold text-brand-cyan mt-2">
                      {listing.price} € <span className="text-sm font-normal text-muted-foreground">/ mois</span>
                    </p>
                  )}
                  <button
                    onClick={() => onListingClick && onListingClick(listing)}
                    className="mt-3 w-full text-center text-sm font-medium text-brand-cyan hover:text-brand-cyan-dark transition-colors"
                  >
                    Voir l'annonce →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Carte d'information flottante - toujours visible */}
      {activeListing && (
        <div className="absolute right-4 top-4 z-20 w-72 rounded-2xl bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl p-4 text-sm transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-2">Annonce sélectionnée</p>
          <h3 className="font-semibold text-base leading-tight mb-1">{activeListing.title}</h3>
          <p className="text-xs text-gray-500 mb-2">
            {activeListing.district ? `${activeListing.district}, ` : ''}
            {activeListing.city}
          </p>
          {activeListing.price ? (
            <p className="font-semibold text-brand-cyan">{activeListing.price} € / mois</p>
          ) : (
            <p className="font-semibold text-gray-700">Prix non renseigné</p>
          )}
          
          {/* Indicateur visuel de la position */}
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>Survoler un point sur la carte ou une annonce dans la liste</span>
          </div>
        </div>
      )}
    </div>
  );
}