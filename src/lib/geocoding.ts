// Service de géocodage gratuit avec Nominatim (OpenStreetMap)
export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/api\/?$/, '')

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  try {
    const q = encodeURIComponent(address);
    const url = `${API_BASE}/api/geocode?q=${q}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      console.warn('Geocode proxy returned', res.status);
      return null;
    }
    const data = await res.json();
    if (data && data.ok && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        displayName: data.result.displayName || data.result.display_name || address,
      };
    }
    return null;
  } catch (err) {
    console.error('Erreur geocode proxy:', err);
    return null;
  }
}

export async function geocodeMultipleAddresses(addresses: string[]): Promise<Record<string, GeocodingResult | null>> {
  const results: Record<string, GeocodingResult | null> = {}
  for (const address of addresses) {
    results[address] = await geocodeAddress(address)
    // small delay to avoid backend bursts
    if (addresses.length > 1) await new Promise(r => setTimeout(r, 300))
  }
  return results
}