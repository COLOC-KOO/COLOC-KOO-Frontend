import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

interface MapViewProps {
  listings: Listing[];
  onListingClick?: (listing: Listing) => void;
}

// Composant pour centrer la carte
function MapController({ listings }: { listings: Listing[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (listings.length > 0) {
      const validListings = listings.filter(l => l.latitude && l.longitude);
      if (validListings.length > 0) {
        // CORRECTION: Utiliser une boucle pour construire les bounds
        const bounds = new LatLngBounds(
          [validListings[0].latitude!, validListings[0].longitude!],
          [validListings[0].latitude!, validListings[0].longitude!]
        );
        
        // Ajouter tous les points
        validListings.forEach(l => {
          bounds.extend([l.latitude!, l.longitude!]);
        });
        
        map.fitBounds(bounds, { 
          padding: [50, 50],
          maxZoom: 15
        });
      } else {
        map.setView([-18.8792, 47.5079], 6);
      }
    }
  }, [listings, map]);
  
  return null;
}

export function MapView({ listings, onListingClick }: MapViewProps) {
  const [geocodedListings, setGeocodedListings] = useState<Listing[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const geocodeListings = async () => {
      if (listings.length === 0) {
        setGeocodedListings([]);
        return;
      }

      setIsGeocoding(true);

      const updatedListings = await Promise.all(
        listings.map(async (listing) => {
          if (listing.latitude && listing.longitude) {
            return listing;
          }

          let address = listing.city || listing.address || '';
          
          if (!address && listing.title) {
            const cityMatch = listing.title.match(/(?:à|a|au|aux|à la|dans)\s+([A-Z][a-zA-Z\s-]+?)(?:\s|,|$)/);
            if (cityMatch) {
              address = cityMatch[1].trim();
            }
          }

          if (address) {
            try {
              const result = await geocodeAddress(address);
              if (result) {
                return {
                  ...listing,
                  latitude: result.latitude,
                  longitude: result.longitude,
                };
              }
            } catch (error) {
              console.error(`Erreur de géocodage pour ${address}:`, error);
            }
          }

          return listing;
        })
      );

      const validListings = updatedListings.filter(l => l.latitude && l.longitude);
      setGeocodedListings(validListings);
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

  return (
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
      
      <MapController listings={geocodedListings} />
      
      {geocodedListings.map((listing) => {
        if (!listing.latitude || !listing.longitude) return null;
        
        const position: LatLngExpression = [listing.latitude, listing.longitude];
        
        return (
          <Marker
            key={listing.id}
            position={position}
            icon={defaultIcon}
            eventHandlers={{
              click: () => {
                if (onListingClick) {
                  onListingClick(listing);
                }
              }
            }}
          >
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
  );
}