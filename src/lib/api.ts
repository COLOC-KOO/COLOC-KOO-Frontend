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
  languePreferee?: number | null
  verification?: boolean
  statut?: string
  createdAt?: string
}

export interface Langue {
  id_langue: number
  code_langue: string
  nom_langue: string
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
  date_modification?: string
  titre?: string
  quartier?: string
  prix_looyer?: number | null
  prix_loyer?: number | null
  statut_original?: string
}

export interface ApiPartenaire {
  id_partenaire: number
  nom: string
  secteur?: string | null
  niveau: 'Bronze' | 'Argent' | 'Or' | 'Diamant'
  remise?: string | null
  engagement?: string | null
  logo?: string | null
  actif: 0 | 1
  date_creation: string
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

export interface BackofficeDashboard {
  annoncesFile: number
  validationsAujourdhui: number
  signalements: number
  membresActifs: number
  annoncesMois: number
  tauxValidation: number
  candidaturesMois: number
  contratsMois: number
  chiffreAffairesMois: number
  objectifJour: number
  progressObjectif: number
}

export interface ApiJournalEntry {
  id_action: number
  id_utilisateur: number | null
  action: string
  cible_type: string | null
  cible_id: number | null
  details: string | Record<string, unknown> | null
  date_action: string
  nom: string | null
  prenom: string | null
  email: string | null
}

export interface ApiServiceCkoo {
  id_service: number
  cle_service?: string | null
  nom: string
  description?: string | null
  prix: number
  unite?: string | null
  est_actif: 0 | 1
}

export interface ApiPartenaire {
  id_partenaire: number
  nom: string
  secteur: string | null
  niveau: string | null
  remise: string | null
  engagement: string | null
  logo: string | null
  actif: 0 | 1
  date_creation: string
}

export interface ApiBackofficeSuiviMissions {
  servicesEnCours: number
  contratsEmisMois: number
  rendezVousAvenir: number
  chiffreAffairesMois: number
  demandes: Array<{
    id_demande: number
    id_annonce: number
    id_utilisateur: number
    statut: 'a-contacter' | 'en-cours' | 'valide' | 'annule'
    historique_contact: string | null
    synthese: string | null
    date_rendez_vous: string | null
    note_rendez_vous: string | null
    date_creation: string
    titre: string | null
    nom: string | null
    prenom: string | null
  }>
}

export interface ApiBackofficeContratParty {
  id: number
  id_utilisateur?: number | null
  nom_complet?: string | null
  role?: string | null
  cin?: string | null
  telephone?: string | null
  email?: string | null
  commentaire?: string | null
}

export interface ApiBackofficeContrat {
  id_contrat: number
  reference?: string | null
  type: 'contrat' | 'edl'
  statut: 'a-emettre' | 'a-planifier' | 'brouillon' | 'emis' | 'envoye' | 'signe' | 'annule'
  montant_total: number | null
  date_creation: string
  date_emission?: string | null
  date_signature?: string | null
  titre?: string | null
  quartier?: string | null
  nom_ville?: string | null
}

export interface ApiBackofficeContratDetails extends ApiBackofficeContrat {
  parties: ApiBackofficeContratParty[]
}

export interface BackofficeMember extends AuthUser {
  annoncesCount: number
  candidaturesCount: number
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
  messagesThreads() {
    return request<Array<{
      interlocuteur_id: number
      interlocuteur_nom: string
      interlocuteur_prenom: string
      dernier_message: string
      total_messages: number
      non_lus: number
    }>>('/messages')
  },
  messagesThread(userId: number | string) {
    return request<Array<{
      id_message: number
      id_expediteur: number
      id_destinataire: number
      id_annonce: number | null
      sujet: string | null
      contenu: string
      date_envoi: string
      est_lu: number
      message_parent: number | null
      signalement_abus: number
      expediteur_nom: string
      expediteur_prenom: string
      destinataire_nom: string
      destinataire_prenom: string
      annonce_titre: string | null
    }>>(`/messages/${userId}`)
  },
  sendMessage(payload: { id_destinataire: number | string; id_annonce?: number | string | null; sujet?: string; contenu: string; message_parent?: number | string | null }) {
    return request<{ id_message: number }>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  villes() {
    return request<Ville[]>('/meta/villes')
  },
  langues() {
    return request<Langue[]>('/meta/langues')
  },
  partenaires() {
    return request<ApiPartenaire[]>('/partenaires')
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
  adminCandidatures() {
    return request<ApiCandidature[]>('/candidatures/admin/all')
  },
  updateCandidatureStatus(id: string | number, statut: string) {
    return request<{ message: string }>(`/candidatures/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    })
  },
  contact(payload: { nom: string; email: string; sujet: string; message: string }) {
    return request<{ id_message: number }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  backofficeDashboard() {
    return request<BackofficeDashboard>('/backoffice/dashboard')
  },
  backofficeMembers(params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value))
    })
    const query = search.toString()
    return request<BackofficeMember[]>(`/backoffice/membres${query ? `?${query}` : ''}`)
  },
  backofficeJournal() {
    return request<ApiJournalEntry[]>('/backoffice/journal')
  },
  backofficeSuiviMissions() {
    return request<ApiBackofficeSuiviMissions>('/backoffice/suivi-missions')
  },
  backofficeServicesCkoo() {
    return request<ApiServiceCkoo[]>('/backoffice/services-ckoo')
  },
  createServiceCkoo(payload: { cle_service?: string; nom: string; description?: string; prix?: number; unite?: string; est_actif?: 0 | 1 }) {
    return request<{ id_service: number }>('/backoffice/services-ckoo', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateServiceCkoo(id: string | number, payload: Partial<{ cle_service: string; nom: string; description: string; prix: number; unite: string; est_actif: 0 | 1 }>) {
    return request<{ message: string }>(`/backoffice/services-ckoo/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteServiceCkoo(id: string | number) {
    return request<{ message: string }>(`/backoffice/services-ckoo/${id}`, {
      method: 'DELETE',
    })
  },
  backofficePartenaires() {
    return request<ApiPartenaire[]>('/backoffice/partenaires')
  },
  createPartenaire(payload: { nom: string; secteur?: string; niveau?: string; remise?: string; engagement?: string; logo?: string; actif?: 0 | 1 }) {
    return request<{ id_partenaire: number }>('/backoffice/partenaires', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updatePartenaire(id: string | number, payload: Partial<{ nom: string; secteur: string; niveau: string; remise: string; engagement: string; logo: string; actif: 0 | 1 }>) {
    return request<{ message: string }>(`/backoffice/partenaires/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deletePartenaire(id: string | number) {
    return request<{ message: string }>(`/backoffice/partenaires/${id}`, {
      method: 'DELETE',
    })
  },
  backofficeContrats() {
    return request<ApiBackofficeContrat[]>('/backoffice/contrats')
  },
  backofficeContratDetails(id: string | number) {
    return request<ApiBackofficeContratDetails>(`/backoffice/contrats/${id}`)
  },
  contratAction(id: string | number, action: 'emettre' | 'signer' | 'envoyer') {
    return request<{ message: string }>(`/backoffice/contrats/${id}/${action}`, {
      method: 'POST',
    })
  },
  updateMemberStatus(id: string | number, payload: { statut: string; raison?: string; date_suspension_fin?: string | null }) {
    return request<{ message: string }>(`/backoffice/members/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'

function normalizePhotos(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split('||').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

export function annonceToListing(a: ApiAnnonce): Listing {
  const photos = normalizePhotos(a.photos)
  const image = photos[0] || FALLBACK_IMAGE
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
    gallery: photos.length ? photos : [image],
    description: a.description || '',
    amenities: a.services,
    colocs: [],
    owner: { name: a.auteur || 'Proprietaire', verified: a.statut === 'active', since: '2026' },
    tags: a.statut === 'active' ? ['verifie'] : [],
  }
}
