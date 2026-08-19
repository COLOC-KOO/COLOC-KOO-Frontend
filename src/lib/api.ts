
// src/lib/api.ts
import {Listing} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')
const TOKEN_KEY = 'colockoo_token'
const USER_KEY = 'colockoo_user'

export type Poste = 'superadmin' | 'admin' | 'moderateur' | 'proprietaire' | 'agent' | 'colocataire'
export interface AppareilConnecte {
  id: number | string
  type: 'mobile' | 'desktop' | string
  label: string
  lieu: string
  courant: boolean
  derniere_activite?: string
  ip?: string
  user_agent?: string
}
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
    cin?: string | null
    profession?: string
    bio?: string | null
    profilePicture?: string | null
    dateNaissance?: string | null
    age?: number | null
    villeActuelle?: string | null
    villeOrigine?: string | null
    ville?: string | null
    date_inscription?: string
    languePreferee?: number | null
    verification?: boolean
    /** Indique si la double authentification est activée pour ce compte. */
    two_fa_enabled?: boolean | number
    statut?: string
    createdAt?: string
}

export interface Langue {
    id_langue: number
    code_langue: string
    nom_langue: string
}
//pour le details du bien 

export interface ApiAnnonce {
    id: number
    id_depot_annonce?: number
    id_annonce?: number
    reference: string
    titre: string
    description: string | null
    statut: 'pending' | 'active' | 'rejected' | 'archived' | 'expired' | 'en_attente' | 'refusee' | 'terminee'
    type_bailleur: string
    type_annonce: string
    type_propriete: 'appartement' | 'maison' | 'autre'
    type_bail?: 'individuel' | 'collectif' | null
    clause_solidarite?: 'avec' | 'sans' | null
    total_colocataires: number | null
    bedrooms_count?: number | null
    candidature_count?: number
    surface_totale: number | null
    adresse_exacte: string | null
    quartier: string | null
    ville: string
    region?: string
    id_ville: number
    id_utilisateur?: number
    auteur?: string
    auteur_email?: string | null
    auteur_telephone?: string | null
    auteur_profile_picture?: string | null
    chambre: {
        surface: number | null
        prix_loyer: number
        prix_charges: number | null
        date_disponibilite: string
        est_meuble?: string | number | null
    } | null
    services: string[]
    regles: string[]
    amenities?: string[]
    photos: string[]
    date_creation: string
    date_publication?: string
    mode_annonce?: string
    latitude?: number | null
    longitude?: number | null
    internet?: string | null
    parking_voitures?: number
    parking_motos?: number
    parking_couvert?: boolean
    services_communs?: any
    booster?: boolean | number | null
    boost_service_id?: number | null
    booster_duree?: number | null
    booster_unite?: BoosterUnite | string | null
    booster_date_creation?: string | null
    date_modification?: string | null
    date_expiration?: string | null
    energy_class?: string | null
    ghg_class?: string | null
    elevator?: boolean
    pets_allowed?: boolean
    smokers_allowed?: boolean
    women_only?: boolean
    men_only?: boolean
    rooms?: {
        surface?: number | null
        prix_loyer?: number | null
        prix_charges?: number | null
        est_meuble?: string | null
        bed_type?: string | null
    }[]
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

export interface ApiProfilRechercheLogement {
    id_utilisateur: number
    nom: string
    prenom: string
    poste?: Poste | string | null
    role?: string | null
    age: number | null
    bio: string | null
    profile_picture: string | null
    profession: string | null
    est_verifie: boolean
    date_inscription: string
    ville_actuelle: string | null
    ville_origine: string | null
    ville_recherchee: string
    demandes_count: number
    derniere_demande: string
    annonces_demandees: string[]
    sources?: string[]
    email: string | null
    telephone: string | null
}

export interface ApiProfilsRechercheResponse {
    ville: string
    months: number
    total: number
    profiles: ApiProfilRechercheLogement[]
}

// ===== TYPES POUR LES ÉQUIPES =====
export interface ApiEquipe {
    id_equipe: number
    id_annonce: number
    id_depot_annonce?: number
    nom: string
    ambiance: string | null
    statut: 'forming' | 'selected' | 'rejected' | 'complete'
    date_creation: string
    membres: ApiMembreEquipe[]
}

export interface ApiMembreEquipe {
    id_utilisateur: number
    nom: string
    prenom: string
    email: string
    statut: 'pending' | 'accepted' | 'refused' | 'owner'
    initials: string
}

// ===== TYPE POUR LES CAMPAGNES =====
export interface Campagne {
    id_campagne: number
    id_partenaire: number
    titre: string
    description: string | null
    emplacement: 'carte' | 'fil_annonces' | 'bandeau_regional' | 'page_partenaire'
    visuel: string | null
    date_debut: string
    date_fin: string | null
    statut: 'active' | 'programmee' | 'suspendue' | 'terminee'
    date_creation: string
    partenaire_nom?: string
    partenaire_niveau?: string
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

export interface ApiPartenaireCampagne {
    id_campagne: number
    id_partenaire: number
    titre: string
    description: string | null
    emplacement: 'carte' | 'fil_annonces' | 'bandeau_regional' | 'page_partenaire'
    visuel: string | null
    date_debut: string
    date_fin: string | null
    statut: 'active' | 'programmee' | 'suspendue' | 'terminee'
    date_creation: string
    nom?: string | null
    partenaire_nom?: string | null
    partenaire_niveau?: string | null
    secteur?: string | null
    niveau?: 'Bronze' | 'Argent' | 'Or' | 'Diamant' | null
    remise?: string | null
    engagement?: string | null
    logo?: string | null
    actif?: 0 | 1
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
    statut: 'a-verifier' | 'conforme' | 'non-conforme' | 'en_attente' | 'valide' | 'echoue'
    date_paiement: string
    reference_operateur?: string | null
    date_creation: string
    nom?: string | null
    prenom?: string | null
    annonce_titre?: string | null
}

export interface CreateCandidaturePayload {
    id_annonce: number | string
    id_depot_annonce?: number | string
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

export interface ServiceCatalogueItem {
    id: number
    cle: string
    nom: string
    description: string | null
    prix: number
    unite: 'heure' | 'forfait' | 'jour' | 'mois' | 'an' | 'stere' | string
}

export interface DemandeServiceGroup {
    reference: string
    statut: 'nouvelle' | 'en-cours' | 'traitee' | 'annulee'
    message: string | null
    telephone: string | null
    date_creation: string
    total: number
    lignes: Array<{
        nom: string
        unite: string
        quantite: number
        prix_unitaire: number
        sous_total: number
    }>
    dernier_contact?: string | null
    relance?: string | null
    synthese?: string | null
    rdv?: {
        date: string
        note: string
    } | null
}

export interface DemandeServiceStaffItem {
    reference: string
    statut: 'nouvelle' | 'en-cours' | 'traitee' | 'annulee'
    message: string | null
    telephone: string | null
    email: string | null
    id_utilisateur: number
    date_creation: string
    demandeur: string
    nom: string
    prenom: string
    total: number
    services: string[]
    lignes: Array<{
        nom: string
        unite: string
        quantite: number
        prix_unitaire: number
        sous_total: number
    }>
    dernier_contact?: string | null
    relance?: string | null
    synthese?: string | null
    rdv_date?: string | null
    rdv_note?: string | null
}

export interface ApiServiceCkoo {
    id_service: number
    cle_service?: string | null
    nom: string
    description?: string | null
    prix: number
    unite?: string | null
    est_actif: 0 | 1
    duree?: number | null
}

export type BoosterUnite = 'heure' | 'jour' | 'semaine' | 'mois'

export interface ApiBooster {
    id_booster: number
    nom: string
    description?: string | null
    cle_service?: string | null
    duree: number
    prix: number
    unite: BoosterUnite
    est_actif: 0 | 1
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

export interface DepotAnnonceRoomPayload {
    loyer: number | string
    charges?: number | string | null
    caution?: number | string | null
    surface?: number | string | null
    meublee?: string | null
    disponible_a_partir?: string | null
}
export interface CreateDepotAnnoncePayload {
  adresse: string
  ville?: string
  quartier?: string
  latitude?: number | null
  longitude?: number | null
  type_annonce: string
  logement: string
  nombre_pieces: string
  surface?: number | string | null
  internet?: string
  parking_voitures?: number
  parking_motos?: number
  parking_couvert?: number
  services_communs?: string[]
  commodites?: string[]
  regles?: string[]
  chambres: DepotAnnonceRoomPayload[]
  email: string
  telephone_code?: string
  telephone?: string
  message?: string
  visite_3d?: string
  photos?: string[]
  boost_service_id?: number | null
}

export interface DepotAnnonceResponse {
    id_depot_annonce: number
    id_annonce: number
    reference: string
    message: string
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
    type_bail?: 'individuel' | 'collectif' | null
    clause_solidarite?: 'avec' | 'sans' | null
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
    annoncesCount?: number
    candidaturesCount?: number
    signalementsCount?: number
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

export function getWebSocketUrl() {
    const base = API_BASE_URL.replace(/^http/, 'ws')
    const token = getToken()
    return `${base}/ws${token ? `?token=${encodeURIComponent(token)}` : ''}`
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

async function requestWithFallback<T>(primaryPath: string, fallbackPath: string, options: RequestInit = {}): Promise<T> {
    try {
        return await request<T>(primaryPath, options)
    } catch (primaryError) {
        try {
            return await request<T>(fallbackPath, options)
        } catch {
            throw primaryError
        }
    }
}

export const api = {
    login(payload: { email: string; mot_de_passe: string }) {
        return request<{ user: AuthUser; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    envoyerEmailContrat(id: string | number, payload?: {
        type?: 'contrat' | 'edl';
        message?: string;
        sujet?: string;
    }) {
        return request<{
            success: boolean;
            message: string;
            destinataires: string[];
            count: number;
        }>(`/contrats/${id}/email`, {
            method: 'POST',
            body: JSON.stringify(payload || {type: 'contrat'}),
        });
    },

    envoyerRelanceContrat(id: string | number, message?: string) {
        return request<{
            success: boolean;
            message: string;
            destinataires: string[];
            count: number;
        }>(`/contrats/${id}/relance`, {
            method: 'POST',
            body: JSON.stringify({message}),
        });
    },

    register(payload: {
        email: string
        mot_de_passe: string
        nom: string
        prenom: string
        telephone?: string
        poste: Poste
        date_naissance: string
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
    uploadProfilePicture(formData: FormData) {
        return request<{ profilePicture: string; user: AuthUser }>('/auth/me/upload', {
            method: 'POST',
            body: formData,
        })
    },
    uploadDepotAnnoncePhotos(formData: FormData) {
        return request<{ photos: string[] }>('/depot-annonce/upload', {
            method: 'POST',
            body: formData,
        })
    },
    createDepotAnnonce(payload: CreateDepotAnnoncePayload) {
        return request<DepotAnnonceResponse>('/depot-annonce', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    changePassword(payload: { mot_de_passe_actuel: string; nouveau_mot_de_passe: string }) {
        return request<{ message: string }>('/auth/me/password', {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
    },

    // ===== SÉCURITÉ DU COMPTE =====

// Récupérer la valeur enregistrée dans la BDD
    getSecuritySettings() {
        return request<{
        two_fa_enabled: number | boolean
    }>('/auth/me/security')
    },

// Enregistrer la nouvelle valeur dans la BDD
    updateSecuritySettings(payload: { 
        two_fa_enabled?: boolean; 
        [key: string]: unknown 
    }) {
    return request<{ 
        message: string; 
        user?: AuthUser 
    }>('/auth/me/security', {
        method: 'PATCH',
        body: JSON.stringify(payload),
    })
    },
    
    listSessions() {
        return request<AppareilConnecte[]>('/auth/me/sessions')
    },
    disconnectOtherDevices() {
        return request<{ message: string }>('/auth/me/sessions/revoke-others', {
            method: 'POST',
        })
    },
    deleteAccount() {
        return request<{ message: string }>('/auth/me', {
            method: 'DELETE',
        })
    },

    notifications() {
        return request<Array<{
            id_notification: number;
            titre: string;
            texte: string;
            est_lue: number;
            type_notification: string;
            date_creation: string;
            lien: string | null
        }>>('/notifications')
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
        return request<{ message: string }>(`/notifications/${id}`, {method: 'DELETE'})
    },
    counters() {
        return request<{ favoris: number; notifications: number; messages: number }>('/users/me/counters')
    },
    searchUsers(q = '') {
        const query = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
        return request<AuthUser[]>(`/users/search${query}`)
    },
    getUserById(id: string | number) {
        return request<AuthUser>(`/users/${id}`)
    },
    deleteThread(userId: string | number) {
        return request<{ message: string }>(`/messages/thread/${userId}`, {method: 'DELETE'})
    },
    messagesThreads() {
        return request<Array<{
            interlocuteur_id: number
            interlocuteur_nom: string
            interlocuteur_prenom: string
            dernier_message: string
            total_messages: number
            non_lus: number
            date_dernier_message: string
            id_annonce: number | null
            annonce_titre: string | null
            annonce_quartier: string | null
            annonce_ville: string | null
            annonce_prix: number | null
            annonce_photo: string | null
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
    sendMessage(payload: {
        id_destinataire: number | string;
        id_annonce?: number | string | null;
        sujet?: string;
        contenu: string;
        message_parent?: number | string | null
    }) {
        return request<{
            id_message: number
            id_expediteur: number
            id_destinataire: number
            contenu: string
            date_envoi: string
            est_lu: number
            expediteur_nom: string
            expediteur_prenom: string
            destinataire_nom: string
            destinataire_prenom: string
        }>('/messages', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    groupThreads() {
        return request<Array<{
            id_groupe: number
            nom: string
            id_createur: number
            id_annonce: number | null
            date_creation: string
            dernier_message: string | null
            total_messages: number
            non_lus: number
            date_dernier_message: string | null
            annonce_titre: string | null
            annonce_quartier: string | null
            annonce_ville: string | null
            annonce_prix: number | null
            annonce_photo: string | null
        }>>('/groupes')
    },
    createGroup(payload: { nom: string; membres: number[]; id_annonce?: number | string | null }) {
        return request<{ id_groupe: number; nom: string }>('/groupes', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    groupMessages(id: number | string) {
        return request<Array<{
            id_message: number
            id_groupe: number
            id_expediteur: number
            contenu: string
            date_envoi: string
            signalement_abus: number
            expediteur_nom: string
            expediteur_prenom: string
        }>>(`/groupes/${id}/messages`)
    },
    sendGroupMessage(id: number | string, contenu: string) {
        return request<{
            id_message: number
            id_groupe: number
            id_expediteur: number
            contenu: string
            date_envoi: string
            signalement_abus: number
            expediteur_nom: string
            expediteur_prenom: string
        }>(`/groupes/${id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ contenu }),
        })
    },
    deleteGroup(id: string | number) {
        return request<{ message: string }>(`/groupes/${id}`, { method: 'DELETE' })
    },
    reportGroupMessage(groupId: string | number, messageId: string | number, payload: { raison?: string; description?: string } = {}) {
        return request<{ id_signalement: number }>(`/groupes/${groupId}/messages/${messageId}/report`, {
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
        return request<{ message: string }>(`/messages/${id}`, {method: 'DELETE'})
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
    boosters() {
        return requestWithFallback<ApiBooster[]>('/meta/boosters', '/meta/services')
    },
    serviceCatalogue() {
        return request<ServiceCatalogueItem[]>('/demandes-service/catalogue')
    },
    createDemandeService(payload: {
        services: Array<{ id_service: number }>
        message?: string
        telephone?: string
    }) {
        return request<{ reference: string; total: number; lignes: number; message: string }>(
            '/demandes-service',
            {method: 'POST', body: JSON.stringify(payload)},
        )
    },
    myDemandesService() {
        return request<DemandeServiceGroup[]>('/demandes-service/mine')
    },
    backofficeDemandesService() {
        return request<DemandeServiceStaffItem[]>('/demandes-service/admin')
    },
    updateDemandeServiceStatut(reference: string, statut: 'nouvelle' | 'en-cours' | 'traitee' | 'annulee') {
        return request<{ message: string; reference: string; statut: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/statut`,
            {method: 'PATCH', body: JSON.stringify({statut})},
        )
    },

    marquerAppele(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/appel`,
            {method: 'POST'}
        )
    },

    marquerMailEnvoye(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/mail`,
            {method: 'POST'}
        )
    },

    relancerDemande(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/relance`,
            {method: 'POST'}
        )
    },

    programmerRdv(reference: string, date: string, note: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/rdv`,
            {
                method: 'POST',
                body: JSON.stringify({date, note})
            }
        )
    },

    annulerRdv(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/annuler-rdv`,
            {method: 'POST'}
        )
    },

    validerDemande(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/valider`,
            {method: 'POST'}
        )
    },

    annulerDemande(reference: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/annuler`,
            {method: 'POST'}
        )
    },

    updateSynthese(reference: string, synthese: string) {
        return request<{ message: string }>(
            `/demandes-service/${encodeURIComponent(reference)}/synthese`,
            {
                method: 'POST',
                body: JSON.stringify({synthese})
            }
        )
    },

    partenaires() {
        return request<ApiPartenaire[]>('/partenaires')
    },
    partenairesCampagnes() {
        return request<ApiPartenaireCampagne[]>('/partenaires/campaigns')
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
        return requestWithFallback<ApiAnnonce[]>(`/depot-annonce${query ? `?${query}` : ''}`, `/annonces${query ? `?${query}` : ''}`)
    },
    annonce(id: string | number) {
        return requestWithFallback<ApiAnnonce>(`/depot-annonce/${id}`, `/annonces/${id}`)
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
        return requestWithFallback<ApiAnnonce>(`/depot-annonce/${id}/status`, `/annonces/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({statut}),
        })
    },
    deleteAnnonce(id: string | number) {
        return requestWithFallback<{ message: string }>(`/depot-annonce/${id}`, `/annonces/${id}`, {method: 'DELETE'})
    },

    // ===== ARCHIVAGE D'ANNONCE =====
    archiveAnnonce(id: string | number) {
        return requestWithFallback<{ message: string; statut?: string }>(
            `/depot-annonce/${id}/archive`,
            `/annonces/${id}/archive`,
            { method: 'PATCH' },
        )
    },

    candidatures() {
        return request<ApiCandidature[]>('/candidatures')
    },
    profilsRechercheLogement(params: {
        ville: string
        q?: string
        profession?: string
        maxAge?: number
        months?: number
        roles?: string
        includeAllRoles?: boolean
    }) {
        const search = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== '') search.set(key, String(value))
        })
        return request<ApiProfilsRechercheResponse>(`/candidatures/profils?${search.toString()}`)
    },
    createCandidature(payload: CreateCandidaturePayload) {
        return request<ApiCandidature>('/candidatures', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    // ===== CANDIDATURES =====
    getCandidaturesByAnnonce(annonceId: string | number) {
        return requestWithFallback<ApiCandidature[]>(`/candidatures/depot-annonce/${annonceId}`, `/candidatures/annonce/${annonceId}`)
    },

    checkUserApplied(annonceId: string | number, userId: string | number) {
        const token = getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return fetch(`${API_URL}/candidatures/verifier?annonceId=${annonceId}&depotAnnonceId=${annonceId}&userId=${userId}`, {
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

    adminCandidatures() {
        return request<ApiCandidature[]>('/candidatures/admin/all')
    },
    updateCandidatureStatus(id: string | number, statut: string) {
        return request<{ message: string }>(`/candidatures/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({statut}),
        })
    },
    deleteCandidature(id: string | number) {
        return request<{ message: string }>(`/candidatures/${id}`, {
            method: 'DELETE',
        })
    },
    decideCandidature(id: string | number, action: 'accept' | 'refuse' | 'discuss', message?: string) {
        return request<{
            message: string;
            conversationId?: number;
            equipeId?: number
        }>(`/candidatures/${id}/decision`, {
            method: 'POST',
            body: JSON.stringify({action, message}),
        })
    },
    launchColocation(annonceId: string | number) {
        return requestWithFallback<{ message: string; equipeId?: number }>(`/candidatures/depot-annonce/${annonceId}/launch`, `/candidatures/annonce/${annonceId}/launch`, {
            method: 'POST',
        })
    },
    createContracts(
        annonceId: string | number,
        mode: 'contrat' | 'edl' | 'both',
        options: {
            type_bail?: 'individuel' | 'collectif' | null
            clause_solidarite?: 'avec' | 'sans' | null
            contrat_service_id?: number | null
            edl_service_id?: number | null
        } = {},
    ) {
        return requestWithFallback<{
            contratIds: number[];
            contracts: ApiBackofficeContratDetails[]
        }>(`/candidatures/depot-annonce/${annonceId}/contrats`, `/candidatures/annonce/${annonceId}/contrats`, {
            method: 'POST',
            body: JSON.stringify({mode, ...options}),
        })
    },
    contractConfig() {
        return request<{
            tiers: { maxLoyer: number | null; prix: number }[]
            edlPrix: number
            mobileMoney: { nom: string; numero: string; couleur: string; hint: string }[]
            clauses: { titre: string; description: string }[]
            offer: { titre: string; texte: string }
            body: { titre: string; intro: string; corps: string }
            bail: { cle: string; titre: string; description: string }[]
            solidarite: { cle: string; titre: string; description: string }[]
            mailNote: { contrat: string; edl: string }
            contratOffers: { id: number; nom: string; description: string | null; prix: number }[]
            edlOffers: { id: number; nom: string; description: string | null; prix: number }[]
        }>(`/meta/contract-config`)
    },
    lancerColocationOfficielle(annonceId: string | number) {
        return requestWithFallback<{ message: string; statut: string }>(`/candidatures/depot-annonce/${annonceId}/lancer-officiel`, `/candidatures/annonce/${annonceId}/lancer-officiel`, {
            method: 'POST',
        })
    },
    myContractsForAnnonce(annonceId: string | number) {
        return requestWithFallback<Array<{
            id_contrat: number
            reference: string | null
            type: 'contrat' | 'edl'
            montant_total: number
            ma_part: number
            deja_paye: boolean
            paidCount: number
            total: number
            peut_payer: boolean
        }>>(`/candidatures/depot-annonce/${annonceId}/mes-contrats`, `/candidatures/annonce/${annonceId}/mes-contrats`)
    },
    async getContractDocument(contratId: string | number) {
        const token = getToken()
        const res = await fetch(`${API_URL}/candidatures/contrats/${contratId}/document`, {
            headers: token ? {Authorization: `Bearer ${token}`} : {},
        })
        if (!res.ok) throw new Error('Impossible de générer le document du contrat.')
        return res.text()
    },
    submitContractPayment(
        contratId: string | number,
        payload: { moyen_paiement: 'MVOLA' | 'Orange Money'; reference_operateur: string; montant?: number },
    ) {
        return request<{
            message: string
            id_paiement: number
            reference: string
            statut: string
            montant: number
            paidCount: number
            total: number
            allPaid: boolean
        }>(`/candidatures/contrats/${contratId}/paiement`, {method: 'POST', body: JSON.stringify(payload)})
    },

    // ===== GESTION DES ÉQUIPES =====

    getEquipesByAnnonce(annonceId: string | number): Promise<ApiEquipe[]> {
        return requestWithFallback<ApiEquipe[]>(`/equipes/depot-annonce/${annonceId}`, `/equipes/annonces/${annonceId}`)
    },

    getEquipe(id: string | number): Promise<ApiEquipe> {
        return request<ApiEquipe>(`/equipes/${id}`)
    },

    createEquipe(data: {
        id_annonce: number;
        id_depot_annonce?: number;
        nom: string;
        ambiance?: string | null;
        statut?: 'forming' | 'selected' | 'rejected' | 'complete'
    }): Promise<{ id_equipe: number; message?: string }> {
        return request<{ id_equipe: number; message?: string }>('/equipes', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    },

    updateEquipe(id: string | number, data: {
        nom?: string;
        ambiance?: string | null;
        statut?: 'forming' | 'selected' | 'rejected' | 'complete'
    }): Promise<{ message: string }> {
        return request<{ message: string }>(`/equipes/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    },

    deleteEquipe(id: string | number): Promise<{ message: string }> {
        return request<{ message: string }>(`/equipes/${id}`, {
            method: 'DELETE',
        })
    },

    addMemberToEquipe(equipeId: string | number, userId: string | number): Promise<{ message: string }> {
        return request<{ message: string }>(`/equipes/${equipeId}/membres`, {
            method: 'POST',
            body: JSON.stringify({id_utilisateur: userId}),
        })
    },

    removeMemberFromEquipe(equipeId: string | number, userId: string | number): Promise<{ message: string }> {
        return request<{ message: string }>(`/equipes/${equipeId}/membres/${userId}`, {
            method: 'DELETE',
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
        return request<{
            items: Array<Record<string, unknown>>;
            generatedAt: string;
            total: number
        }>('/backoffice/statistiques-colocation')
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
    createBackofficeMember(payload: {
        nom: string;
        email: string;
        telephone?: string;
        mot_de_passe?: string;
        role?: string;
        statut?: string
    }) {
        return request<BackofficeMember & { mot_de_passe: string }>('/backoffice/membres', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    updateBackofficeMember(id: string | number, payload: {
        nom?: string;
        email?: string;
        telephone?: string;
        mot_de_passe?: string;
        role?: string;
        statut?: string
    }) {
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
    saveBackofficeObjectif(payload: {
        id?: number | string;
        libelle: string;
        objectif: number;
        realise?: number;
        periode?: string;
        statut?: string
    }) {
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
    backofficeBoosters() {
        return requestWithFallback<ApiBooster[]>('/backoffice/boosters', '/backoffice/services-ckoo')
    },
    createBooster(payload: {
        cle_service?: string;
        nom: string;
        description?: string;
        duree: number;
        prix?: number;
        unite?: BoosterUnite;
        est_actif?: 0 | 1;
    }) {
        return request<{ id_booster: number }>('/backoffice/boosters', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    updateBooster(id: string | number, payload: Partial<{
        cle_service: string;
        nom: string;
        description: string;
        duree: number;
        prix: number;
        unite: BoosterUnite;
        est_actif: 0 | 1;
    }>) {
        return request<{ message: string }>(`/backoffice/boosters/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
    },
    deleteBooster(id: string | number) {
        return request<{ message: string }>(`/backoffice/boosters/${id}`, {
            method: 'DELETE',
        })
    },
    createServiceCkoo(payload: {
        cle_service?: string;
        nom: string;
        description?: string;
        prix?: number;
        unite?: string;
        est_actif?: 0 | 1;
        duree?: number | null
    }) {
        return request<{ id_service: number }>('/backoffice/services-ckoo', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    updateServiceCkoo(id: string | number, payload: Partial<{
        cle_service: string;
        nom: string;
        description: string;
        prix: number;
        unite: string;
        est_actif: 0 | 1;
        duree: number | null
    }>) {
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
    updateBackofficePartenaireRequest(id: string | number, payload: { statut: string }) {
        return request<{ message: string }>(`/backoffice/partenaires/requests/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
    },
    deleteBackofficePartenaireRequest(id: string | number) {
        return request<{ message: string }>(`/backoffice/partenaires/requests/${id}`, {method: 'DELETE'})
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
        return request<{ message: string }>(`/backoffice/messages-contact/${id}`, {method: 'DELETE'})
    },
    createPartenaire(payload: {
        nom: string;
        secteur?: string;
        niveau?: string;
        remise?: string;
        engagement?: string;
        logo?: string;
        actif?: 0 | 1
    }) {
        return request<{ id_partenaire: number }>('/backoffice/partenaires', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },
    updatePartenaire(id: string | number, payload: Partial<{
        nom: string;
        secteur: string;
        niveau: string;
        remise: string;
        engagement: string;
        logo: string;
        actif: 0 | 1
    }>) {
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
    updateMemberStatus(id: string | number, payload: {
        statut: string;
        raison?: string;
        date_suspension_fin?: string | null
    }) {
        return request<{ message: string }>(`/backoffice/members/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
    },

    // ================================================================
    // ===== CAMPAGNES DE PUBLICITÉS NATIVES =====
    // ================================================================

    campagnes() {
        return request<Campagne[]>('/backoffice/campagnes')
    },

    campagne(id: string | number) {
        return request<Campagne>(`/backoffice/campagnes/${id}`)
    },

    createCampagne(payload: {
        id_partenaire: number
        titre: string
        description?: string | null
        emplacement: string
        visuel?: string | null
        date_debut: string
        date_fin?: string | null
        statut?: string
    }) {
        return request<{ id_campagne: number; message: string; campagne?: Campagne }>('/backoffice/campagnes', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
    },

    updateCampagne(id: string | number, payload: Partial<{
        id_partenaire: number
        titre: string
        description: string | null
        emplacement: string
        visuel: string | null
        date_debut: string
        date_fin: string | null
        statut: string
    }>) {
        return request<{ message: string; campagne?: Campagne }>(`/backoffice/campagnes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        })
    },

    deleteCampagne(id: string | number) {
        return request<{ message: string }>(`/backoffice/campagnes/${id}`, {
            method: 'DELETE',
        })
    },

    uploadCampagneVisuel(file: File) {
        const formData = new FormData()
        formData.append('visuel', file)
        return request<{ url: string; filename: string; message: string }>('/backoffice/campagnes/upload', {
            method: 'POST',
            body: formData,
        })
    },
    // ================================================================
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

function addDuration(date: Date, duration: number, unit: string) {
    const next = new Date(date)
    if (unit === 'heure') next.setHours(next.getHours() + duration)
    else if (unit === 'semaine') next.setDate(next.getDate() + duration * 7)
    else if (unit === 'mois') next.setMonth(next.getMonth() + duration)
    else next.setDate(next.getDate() + duration)
    return next
}

function isBoostActive(row: Record<string, any>) {
    const boostId = row.booster ?? row.boost_service_id
    if (boostId === null || boostId === undefined || boostId === false || Number(boostId) === 0) return false

    const duration = Number(row.booster_duree ?? row.duree_booster ?? row.boost_duree ?? 0)
    const unit = String(row.booster_unite ?? row.unite_booster ?? row.boost_unite ?? 'jour')
    const startedAt = row.booster_date_creation ?? row.boost_date_creation ?? row.date_publication ?? row.date_creation
    if (!duration || !startedAt) return true

    const start = new Date(startedAt)
    if (Number.isNaN(start.getTime())) return true
    return addDuration(start, duration, unit).getTime() >= Date.now()
}
export function annonceToListing(a: ApiAnnonce): Listing {
    const row = a as ApiAnnonce & Record<string, any>
    const photos = normalizePhotos(a.photos)
    const normalizedPhotos = photos.map((photo) => {
        if (photo.startsWith('http://') || photo.startsWith('https://')) return photo
        return `${API_BASE_URL}${photo.startsWith('/') ? '' : '/'}${photo}`
    })
    const image = normalizedPhotos[0] || FALLBACK_IMAGE
    const firstRoom = row.chambre || row.chambres?.[0] || row.rooms?.[0] || null
    const amenities = Array.isArray(row.commodites) ? row.commodites : (Array.isArray(row.services) ? row.services : Array.isArray(row.amenities) ? row.amenities : [])
    const regles = Array.isArray(row.regles) ? row.regles : Array.isArray(row.rules) ? row.rules : []
    const price = Number(firstRoom?.prix_loyer || firstRoom?.loyer || 0)
    const charges = Number(firstRoom?.prix_charges || firstRoom?.charges || 0)
    const surface = Number(firstRoom?.surface || row.surface_totale || row.surface || 0)
    const ownerName = row.auteur || [row.prenom, row.nom].filter(Boolean).join(' ').trim() || row.createur_nom || 'Proprietaire'
    const id = row.id_depot_annonce ?? row.id ?? row.id_annonce
    const isBoosted = isBoostActive(row)
    const boostServiceId = row.booster ?? row.boost_service_id ?? null
    
    // Surface de chambre (dynamique, distincte de la surface totale)
    const roomSurface = firstRoom?.surface != null ? Number(firstRoom.surface) : undefined
    
    // Services proposés (dynamique, à partir des services liés à l'annonce)
    const listingServices = Array.isArray(row.services_communs)
        ? row.services_communs
        : Array.isArray(row.services)
            ? row.services
            : []

    //  EXTRACTION DE L'ENUM ('Oui', 'Partiellement', 'Non', 'Rachat')
    const rawMeublee = String(
        firstRoom?.meublee || 
        firstRoom?.est_meuble || 
        row.meublee || 
        row.est_meuble || 
        'Non'
    ).trim();

    const lowerMeublee = rawMeublee.toLowerCase();

    //  CALCUL DU BOOLÉEN (True si Oui, Partiellement ou Rachat)
    const isFurnished = 
        ['oui', 'partiellement', 'rachat', 'true', '1'].includes(lowerMeublee) ||
        row.furnished === true || 
        row.furnished === 1;

    return {
        id: String(id),
        depotAnnonceId: row.id_depot_annonce != null ? Number(row.id_depot_annonce) : undefined,
        annonceId: row.id_annonce != null ? Number(row.id_annonce) : row.id != null ? Number(row.id) : undefined,
        title: row.titre || row.logement || row.type_annonce || 'Annonce',
        city: row.ville || 'Madagascar',
        district: row.quartier || row.region || 'Madagascar',
        price,
        charges,
        rooms: Number(row.total_colocataires || row.nombre_pieces || 1),
        bedrooms: Number(row.bedrooms_count || row.chambres?.length || row.rooms?.length || row.nombre_pieces || 1),
        surface,
        roomSurface,

        //  Transmet le booléen pour les filtres et composant de base
        furnished: isFurnished, 

        //  Transmet la valeur brute de l'Enum BDD ("Oui", "Partiellement", "Rachat", "Non")
        meublee: rawMeublee,

        available: String(firstRoom?.date_disponibilite || firstRoom?.disponible_a_partir || '').slice(0, 10),
        type: row.type_propriete === 'maison' || row.logement === 'Maison' ? 'maison' : row.type_propriete === 'appartement' || row.logement === 'Appartement' ? 'appartement' : 'chambre',
        image,
        gallery: normalizedPhotos.length ? normalizedPhotos : [image],
        description: row.description || row.message || '',
        amenities,
        colocs: [],
        owner: {
            id: row.id_utilisateur,
            name: ownerName,
            verified: row.statut === 'active',
            since: '2026',
            profilePicture: row.auteur_profile_picture ?? row.profile_picture ?? undefined,
            email: row.auteur_email ?? row.email ?? undefined,
            phone: row.auteur_telephone ?? row.telephone ?? undefined,
            city: row.ville,
        },
        tags: row.statut === 'active' ? (isBoosted ? ['verifie', 'boost'] : ['verifie']) : (isBoosted ? ['boost'] : []),
        annonceType: row.type_annonce || 'existante',
        typeBail: row.type_bail ?? null,
        clauseSolidarite: row.clause_solidarite ?? null,
        candidatureCount: row.candidature_count != null ? Number(row.candidature_count) : undefined,
        address: row.adresse_exacte ?? row.adresse ?? undefined,
        regles,
        services: listingServices,

        //  Conserve la valeur exacte ("Fibre", "ADSL", etc.)
        internet: (row.internet != null && String(row.internet).trim() !== '') 
            ? String(row.internet).trim() 
            : (amenities.includes('wifi') ? 'Wifi' : null),

        parkingVoitures: row.parking_voitures ?? (amenities.includes('parking') ? 1 : 0),
        parkingMotos: row.parking_motos ?? 0,
        parkingCouvert: row.parking_couvert ?? amenities.includes('garage'),
        elevator: row.elevator ?? amenities.includes('ascenseur'),
        petsAllowed: row.pets_allowed ?? regles.includes('animaux_acceptes'),
        smokersAllowed: row.smokers_allowed ?? regles.includes('fumeurs_acceptes'),
        womenOnly: row.women_only ?? regles.includes('filles_uniquement'),
        menOnly: row.men_only ?? regles.includes('garcons_uniquement'),
        energyClass: row.energy_class ?? null,
        ghgClass: row.ghg_class ?? null,
        modeAnnonce: row.mode_annonce ?? undefined,
        dateExpiration: row.date_expiration ?? null,
        region: row.region ?? undefined,
        isBoosted,
        boostServiceId: boostServiceId != null ? Number(boostServiceId) : null,
    }
}

// preference 
export interface EventPreference {
  id: string;
  push: boolean;
  email: boolean | null;
}

export interface UserPreferencesPayload {
  mode_defaut?: 'push' | 'email' | 'both' | string;
  mode_allege?: boolean;
  disponibilite_hors_ligne?: boolean;
  evenements?: EventPreference[];
  defaultMode?: 'push' | 'email' | 'both' | string;
  events?: EventPreference[];
}

export async function getUserPreferences(
  idUtilisateur: number | string
): Promise<UserPreferencesPayload> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${API_BASE_URL}/api/preferences/${idUtilisateur}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des préférences');
  }

  return await response.json();
}

export async function updateUserPreferences(
  idUtilisateur: number | string,
  preferences: UserPreferencesPayload
): Promise<{ ok: boolean }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${API_BASE_URL}/api/preferences/${idUtilisateur}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour des préférences');
  }

  return await response.json();
}