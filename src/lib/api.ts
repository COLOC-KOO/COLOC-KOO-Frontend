import { Listing } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const TOKEN_KEY = 'colockoo_token'
const USER_KEY = 'colockoo_user'

export type Poste = 'superadmin' | 'admin' | 'moderateur' | 'proprietaire' | 'colocataire'

export interface AuthUser {
  id: number
  email: string
  nom: string
  prenom: string
  name: string
  initials: string
  role: string
  poste: Poste
  roleLabel: Poste
  telephone?: string
  profession?: string
  bio?: string | null
  profilePicture?: string | null
  dateNaissance?: string | null
  age?: number | null
  villeActuelle?: string | null
  villeOrigine?: string | null
  createdAt?: string
}

export interface ApiAnnonce {
  id: number
  reference: string
  titre: string
  description: string | null
  statut: 'pending' | 'active' | 'rejected' | 'archived' | 'expired'
  type_bailleur: string
  type_annonce: string
  type_propriete: 'appartement' | 'maison' | 'autre'
  total_colocataires: number | null
  surface_totale: number | null
  adresse_exacte: string | null
  quartier: string | null
  ville: string
  region?: string
  id_ville: number
  auteur?: string
  chambre: {
    surface: number | null
    prix_loyer: number
    date_disponibilite: string
  } | null
  services: string[]
  regles: string[]
  photos: string[]
  date_creation: string
  date_publication?: string
}

export interface ApiCandidature {
  id_candidature: number
  id_utilisateur: number
  id_annonce: number
  message: string | null
  statut: string
  date_creation: string
  titre?: string
  quartier?: string
  prix_looyer?: number | null
}

export interface CreateCandidaturePayload {
  id_annonce: number | string
  message?: string
  statut?: string
  membres?: Array<Record<string, unknown>>
}

export interface Ville {
  id_ville: number
  nom_ville: string
  id_region: number
  nom_region: string
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveSession(user: AuthUser, token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  const text = await response.text()
  const data = text ? JSON.parse(text) : null
  if (!response.ok) {
    throw new Error(data?.message || 'Erreur API')
  }
  return data as T
}

export const api = {
  login(payload: { email: string; mot_de_passe: string }) {
    return request<{ user: AuthUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  register(payload: {
    email: string
    mot_de_passe: string
    nom: string
    prenom: string
    telephone?: string
    poste: Poste
  }) {
    return request<{ user: AuthUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  me() {
    return request<AuthUser>('/auth/me')
  },
  updateMe(payload: Record<string, unknown>) {
    return request<AuthUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  changePassword(payload: { mot_de_passe_actuel: string; nouveau_mot_de_passe: string }) {
    return request<{ message: string }>('/auth/me/password', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  notifications() {
    return request<Array<{ id_notification: number; titre: string; texte: string; est_lue: number; type_notification: string; date_creation: string; lien: string | null }>>('/notifications')
  },
  markNotificationsRead() {
    return request<{ message: string }>('/notifications/read-all', {
      method: 'PATCH',
    })
  },
  villes() {
    return request<Ville[]>('/meta/villes')
  },
  annonces(params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value))
    })
    const query = search.toString()
    return request<ApiAnnonce[]>(`/annonces${query ? `?${query}` : ''}`)
  },
  annonce(id: string | number) {
    return request<ApiAnnonce>(`/annonces/${id}`)
  },
  createAnnonce(payload: unknown) {
    return request<ApiAnnonce>('/annonces', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateAnnonce(id: string | number, payload: unknown) {
    return request<ApiAnnonce>(`/annonces/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  updateAnnonceStatus(id: string | number, statut: string) {
    return request<ApiAnnonce>(`/annonces/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    })
  },
  deleteAnnonce(id: string | number) {
    return request<{ message: string }>(`/annonces/${id}`, { method: 'DELETE' })
  },
  candidatures() {
    return request<ApiCandidature[]>('/candidatures')
  },
  createCandidature(payload: CreateCandidaturePayload) {
    return request<ApiCandidature>('/candidatures', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}

export function annonceToListing(a: ApiAnnonce): Listing {
  const image = a.photos[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  const price = Number(a.chambre?.prix_loyer || 0)
  return {
    id: String(a.id),
    title: a.titre,
    city: a.ville,
    district: a.quartier || a.region || 'Madagascar',
    price,
    charges: 0,
    rooms: a.total_colocataires || 1,
    bedrooms: 1,
    surface: Number(a.chambre?.surface || a.surface_totale || 0),
    furnished: true,
    available: String(a.chambre?.date_disponibilite || '').slice(0, 10),
    type: a.type_propriete === 'maison' ? 'maison' : a.type_propriete === 'appartement' ? 'appartement' : 'chambre',
    image,
    gallery: a.photos.length ? a.photos : [image],
    description: a.description || '',
    amenities: a.services,
    colocs: [],
    owner: { name: a.auteur || 'Proprietaire', verified: a.statut === 'active', since: '2026' },
    tags: a.statut === 'active' ? ['verifie'] : [],
  }
}
