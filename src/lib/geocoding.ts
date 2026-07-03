// Service de géocodage gratuit avec Nominatim (OpenStreetMap)
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    // Encoder l'adresse pour l'URL
    const encodedAddress = encodeURIComponent(address + ', Madagascar');
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1&countrycodes=mg`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ColocationMadagascar/1.0', // Important pour Nominatim
      },
    });
    
    if (!response.ok) {
      throw new Error(`Erreur de géocodage: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    return null;
  }
}

// Version batch pour plusieurs adresses
export async function geocodeMultipleAddresses(
  addresses: string[]
): Promise<Record<string, GeocodingResult | null>> {
  const results: Record<string, GeocodingResult | null> = {};
  
  // Nominatim limite à 1 requête par seconde
  for (const address of addresses) {
    const result = await geocodeAddress(address);
    results[address] = result;
    
    // Attendre 1 seconde entre chaque requête
    if (addresses.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}