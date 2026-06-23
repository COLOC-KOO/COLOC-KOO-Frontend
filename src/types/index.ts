// ===== TYPES SARINTANY'COLOC =====

export type Lang = 'FR' | 'MG' | 'ENG';
export type AuthState = 'guest' | 'coloc' | 'proprio' | 'agent' | 'admin' | 'moderator';

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: AuthState;
  avatar?: string;
}

export interface Annonce {
  id: number;
  type: 'coloc' | 'proprio';
  logement: 'Appartement' | 'Maison' | 'Studio' | 'Villa';
  titre: string;
  quartier: string;
  ville: string;
  surface: number;
  chambreSurface?: number;
  colocataires: number;
  prix: number;
  prixLabel?: string;
  disponible: string;
  images: string[];
  tags: { label: string; variant: 'cy' | 'gr' | 'gy' }[];
  services: string[];
  regles: string[];
  description?: string;
  proprio?: string;
  badge?: string;
  badgeColor?: string;
  pinX?: number;
  pinY?: number;
  featured?: boolean;
  verified?: boolean;
}

export interface Partenaire {
  id: string;
  nom: string;
  logo?: string;
  secteur: string;
  tier: 'Diamant' | 'Or' | 'Argent' | 'Bronze';
  engagement: string;
  remise?: string;
  actif: boolean;
}

export interface Candidature {
  id: string;
  annonceId: number;
  annonceTitle: string;
  quartier: string;
  prix: number;
  statut: 'en_attente' | 'acceptee' | 'refusee' | 'constituee';
  datePostulation: string;
  coequipiers?: CoEquipier[];
  messageColoc?: string;
}

export interface CoEquipier {
  id: string;
  nom: string;
  initiales: string;
  statut: 'accepte' | 'en_attente' | 'refuse';
  profession?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'candidature' | 'systeme';
  titre: string;
  texte: string;
  temps: string;
  lue: boolean;
  lien?: string;
}

export interface BackofficeAnnonce {
  id: string;
  titre: string;
  auteur: string;
  type: 'coloc' | 'proprio' | 'agent';
  quartier: string;
  prix: number;
  dateDepot: string;
  statut: 'en_file' | 'validee' | 'refusee' | 'correction';
  flags: string[];
  priorite: 'haute' | 'normale' | 'basse';
}

export interface BackofficeStats {
  annoncesFile: number;
  validationsAujourdhui: number;
  signalements: number;
  membresActifs: number;
  annoncesMois: number;
  tauxValidation: number;
  objectifJour: number;
  progressObjectif: number;
}
