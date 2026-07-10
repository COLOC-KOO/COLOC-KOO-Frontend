import { Listing } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')
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
  id_utilisateur?: number
  auteur?: string
  chambre: {
    surface: number | null
    prix_loyer: number
    date_disponibilite: string
    est_meuble?: number | null
  } | null
  services: string[]
  regles: string[]
  photos: string[]
  date_creation: string
  date_publication?: string
}

export interface ApiFavoriResponse {
  favori: boolean
  alreadyExists: boolean
  message: string
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
  nom?: string
  prenom?: string
  email?: string
  telephone?: string
  utilisateur_id?: number
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

export interface ApiPartenaireRequest {
  id_demande: number
  nom_entreprise: string
  nom_contact: string
  email: string
  telephone?: string | null
  telephone_code?: string | null
  secteur?: string | null
  niveau_souhaite?: string | null
  message?: string | null
  statut: string
  date_creation: string
  souhaite_rappel?: number
  date_rappel?: string | null
  creneau_rappel?: string | null
  souhaite_plaquette?: number
}

export interface CreatePartenaireRequestPayload {
  nom?: string
  nom_entreprise?: string
  email: string
  telephone?: string
  phone?: string
  phoneCC?: string
  secteur?: string
  niveau_souhaite?: string
  niveau?: string
  message?: string
  activity?: string
  wantCallback?: boolean
  callbackDate?: string
  callbackSlot?: string
  wantBrochure?: boolean
}

export interface ApiPaiement {
  id_paiement: number
  reference: string
  id_utilisateur: number
  id_contrat?: number | null
  id_annonce?: number | null
  id_partenaire?: number | null
  montant_du: number
  montant_recu: number
  moyen_paiement: 'MVOLA' | 'Orange Money' | 'Airtel Money' | 'CB' | 'Autre'
  service_type: 'booster' | 'publicite' | 'contrat' | 'autre'
  statut: 'a-verifier' | 'conforme' | 'non-conforme' | 'en-attente' | 'valide' | 'echoue'
  date_paiement: string
  reference_operateur?: string | null
  date_creation: string
  nom?: string | null
  prenom?: string | null
  annonce_titre?: string | null
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

export interface BackofficeAdministration {
  versements: ApiPaiement[]
  objectifs: Array<{
    id_objectif: number
    libelle: string
    objectif: number
    realise: number
    periode: string
    statut: string
    date_creation: string
  }>
  configuration: Array<Record<string, unknown>>
  performance: Record<string, unknown>
  statistiquesColocation: Array<Record<string, unknown>>
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

export interface ApiSignalement {
  id_signalement: number
  id_utilisateur_signalant: number | null
  id_utilisateur_cible: number | null
  id_annonce: number | null
  id_message: number | null
  raison: string | null
  description: string | null
  statut: string | null
  date_signalement: string
  date_resolution: string | null
  signaleur_nom?: string | null
  signaleur_prenom?: string | null
  signaleur_email?: string | null
  cible_nom?: string | null
  cible_prenom?: string | null
  cible_email?: string | null
  annonce_titre?: string | null
  message_contenu?: string | null
}

export interface ApiSignalementConversation {
  signalement: ApiSignalement
  membreA: number | null
  membreB: number | null
  messages: Array<{
    id_message: number
    id_expediteur: number
    id_destinataire: number
    sujet: string | null
    contenu: string
    date_envoi: string
    est_lu: number
    expediteur_nom: string | null
    expediteur_prenom: string | null
    destinataire_nom: string | null
    destinataire_prenom: string | null
    annonce_titre: string | null
  }>
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
  const headers = new Headers(options.headers)

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
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
  markNotificationRead(id: string | number) {
    return request<{ message: string }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    })
  },
  deleteNotification(id: string | number) {
    return request<{ message: string }>(`/notifications/${id}`, { method: 'DELETE' })
  },
  deleteThread(userId: string | number) {
    return request<{ message: string }>(`/messages/thread/${userId}`, { method: 'DELETE' })
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
  superadmin() {
    return request<{
      id: number
      email: string
      nom: string
      prenom: string
      role: string
      poste: string
      name: string
      initials: string
    }>('/users/superadmin')
  },
  sendMessage(payload: { id_destinataire: number | string; id_annonce?: number | string | null; sujet?: string; contenu: string; message_parent?: number | string | null }) {
    return request<{ id_message: number }>('/messages', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  reportMessage(id: string | number, payload: { raison?: string; description?: string } = {}) {
    return request<{ id_signalement: number }>(`/messages/${id}/report`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  deleteMessage(id: string | number) {
    return request<{ message: string }>(`/messages/${id}`, { method: 'DELETE' })
  },
  villes() {
    return request<Ville[]>('/meta/villes')
  },
  langues() {
    return request<Langue[]>('/meta/langues')
  },
  services() {
    return request<ApiServiceCkoo[]>('/meta/services')
  },
  partenaires() {
    return request<ApiPartenaire[]>('/partenaires')
  },
  createPartenaireRequest(payload: CreatePartenaireRequestPayload) {
    return request<{ id_demande: number; message: string }>('/partenaires/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
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
  favoris() {
    return request<ApiAnnonce[]>('/favoris')
  },
  addFavori(idAnnonce: string | number) {
    return request<ApiFavoriResponse>(`/favoris/${idAnnonce}`, {
      method: 'POST',
    })
  },
  deleteFavori(idAnnonce: string | number) {
    return request<{ favori: false }>(`/favoris/${idAnnonce}`, {
      method: 'DELETE',
    })
  },
  uploadAnnoncePhotos(formData: FormData) {
    return request<{ photos: string[] }>('/annonces/upload', {
      method: 'POST',
      body: formData,
    })
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
    // 🆕 NOUVELLES FONCTIONS À AJOUTER
  
  // Récupérer toutes les candidatures pour une annonce spécifique
  getCandidaturesByAnnonce(annonceId: string | number) {
    return request<ApiCandidature[]>(`/candidatures/annonce/${annonceId}`)
  },
  
  // Vérifier si l'utilisateur a déjà postulé à une annonce
  // checkUserApplied(annonceId: string | number, userId: string | number) {
  //   return request<{ hasApplied: boolean; count: number }>(
  //     `/candidatures/verifier?annonceId=${annonceId}&userId=${userId}`
  //   )
  // },

  checkUserApplied(annonceId: string | number, userId: string | number) {
  // 🔥 Récupérer le token manuellement
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Utiliser fetch directement au lieu de request()
  return fetch(`${API_URL}/candidatures/verifier?annonceId=${annonceId}&userId=${userId}`, {
    method: 'GET',
    headers,
  }).then(async (response) => {
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      throw new Error(data?.message || 'Erreur API');
    }
    return data as { hasApplied: boolean; count: number };
  });
},
  
  // Récupérer mes candidatures (déjà existante, mais on la garde)
  // candidatures() existe déjà
  
  adminCandidatures() {
    return request<ApiCandidature[]>('/candidatures/admin/all')
  },
  updateCandidatureStatus(id: string | number, statut: string) {
    return request<{ message: string }>(`/candidatures/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ statut }),
    })
  },
  deleteCandidature(id: string | number) {
    return request<{ message: string }>(`/candidatures/${id}`, {
      method: 'DELETE',
    })
  },
  decideCandidature(id: string | number, action: 'accept' | 'refuse' | 'discuss', message?: string) {
    return request<{ message: string; conversationId?: number; equipeId?: number }>(`/candidatures/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action, message }),
    })
  },
  launchColocation(annonceId: string | number) {
    return request<{ message: string; equipeId?: number }>(`/candidatures/annonce/${annonceId}/launch`, {
      method: 'POST',
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
  backofficeColocationStats() {
    return request<{ items: Array<Record<string, unknown>>; generatedAt: string; total: number }>('/backoffice/statistiques-colocation')
  },
  backofficePaiements() {
    return request<ApiPaiement[]>('/backoffice/paiements')
  },
  updatePaiementStatus(id: string | number, payload: { statut: string }) {
    return request<{ message: string }>(`/backoffice/paiements/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  backofficeMembers(params: Record<string, string | number | undefined> = {}) {
    const search = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value))
    })
    const query = search.toString()
    return request<BackofficeMember[]>(`/backoffice/membres${query ? `?${query}` : ''}`)
  },
  createBackofficeMember(payload: { nom: string; email: string; telephone?: string; mot_de_passe?: string; role?: string; statut?: string }) {
    return request<BackofficeMember & { mot_de_passe: string }>('/backoffice/membres', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateBackofficeMember(id: string | number, payload: { nom?: string; email?: string; telephone?: string; mot_de_passe?: string; role?: string; statut?: string }) {
    return request<BackofficeMember>(`/backoffice/membres/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteBackofficeMember(id: string | number) {
    return request<{ message: string }>(`/backoffice/membres/${id}`, {
      method: 'DELETE',
    })
  },
  backofficeJournal() {
    return request<ApiJournalEntry[]>('/backoffice/journal')
  },
  deleteBackofficeJournalEntry(id: string | number) {
    return request<{ message: string }>(`/backoffice/journal/${id}`, {
      method: 'DELETE',
    })
  },
  backofficeAdministration() {
    return request<BackofficeAdministration>('/backoffice/administration')
  },
  backofficePerformance() {
    return request<Record<string, number>>('/backoffice/performance')
  },
  saveBackofficeConfiguration(payload: { cle: string; valeur: unknown }) {
    return request<{ message: string }>('/backoffice/administration/configuration', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  saveBackofficeObjectif(payload: { id?: number | string; libelle: string; objectif: number; realise?: number; periode?: string; statut?: string }) {
    const method = payload.id ? 'PATCH' : 'POST'
    const path = payload.id ? `/backoffice/administration/objectifs/${payload.id}` : '/backoffice/administration/objectifs'
    return request<{ id_objectif: number; message: string }>(path, {
      method,
      body: JSON.stringify({
        libelle: payload.libelle,
        objectif: payload.objectif,
        realise: payload.realise ?? 0,
        periode: payload.periode ?? 'mois',
        statut: payload.statut ?? 'actif'
      })
    })
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
  uploadPartenaireLogo(file: File) {
    const formData = new FormData()
    formData.append('logo', file)
    return request<{ url: string; filename: string }>('/backoffice/partenaires/upload', {
      method: 'POST',
      body: formData,
    })
  },
  backofficePartenaireRequests() {
    return request<ApiPartenaireRequest[]>('/backoffice/partenaires/requests')
  },
  deleteBackofficePartenaireRequest(id: string | number) {
    return request<{ message: string }>(`/backoffice/partenaires/requests/${id}`, { method: 'DELETE' })
  },
  backofficeContactMessages() {
    return request<Array<{
      id_message: number
      nom: string
      email: string
      sujet: string
      message: string
      statut: string
      date_creation: string
    }>>('/backoffice/messages-contact')
  },
  deleteBackofficeContactMessage(id: string | number) {
    return request<{ message: string }>(`/backoffice/messages-contact/${id}`, { method: 'DELETE' })
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
  backofficeSignalements() {
    return request<ApiSignalement[]>('/backoffice/signalements')
  },
  backofficeSignalementConversation(id: string | number) {
    return request<ApiSignalementConversation>(`/backoffice/signalements/${id}/conversation`)
  },
  updateBackofficeSignalement(id: string | number, payload: { statut?: string; action?: string; raison?: string }) {
    return request<{ message: string }>(`/backoffice/signalements/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  backofficeWarningReasons() {
    return request<string[]>('/backoffice/warning-reasons')
  },
  sendBackofficeWarning(payload: { id_utilisateur: string | number; raison?: string; contenu?: string }) {
    return request<{ id_message: number; redirect: string }>('/backoffice/warnings', {
      method: 'POST',
      body: JSON.stringify(payload),
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
  const normalizedPhotos = photos.map((photo) => {
    if (photo.startsWith('http://') || photo.startsWith('https://')) return photo
    return `${API_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
  })
  const image = normalizedPhotos[0] || FALLBACK_IMAGE
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
    gallery: normalizedPhotos.length ? normalizedPhotos : [image],
    description: a.description || '',
    amenities: a.services,
    colocs: [],
    owner: {
      id: a.id_utilisateur,
      name: a.auteur || 'Proprietaire',
      verified: a.statut === 'active',
      since: '2026',
    },
    tags: a.statut === 'active' ? ['verifie'] : [],
  }
}
