export interface Coloc {
  name: string
  age: number
  job: string
}

export interface Owner {
  id?: number
  name: string
  verified: boolean
  since: string
  profilePicture?: string; 
  email?: string
  phone?: string
  city?: string
}

export type ListingType = 'chambre' | 'appartement' | 'maison'
export type ListingTag = 'vedette' | 'verifie' | 'nouveau' | 'boost'

export interface Listing {
  id: string
  depotAnnonceId?: number
  annonceId?: number
  title: string
  city: string
  district: string
  price: number
  charges: number
  rooms: number
  bedrooms: number
  surface: number
  furnished: boolean
  available: string
  type: ListingType
  annonceType?: string
  typeBail?: 'individuel' | 'collectif' | null
  clauseSolidarite?: 'avec' | 'sans' | null
  candidatureCount?: number
  image: string
  address?: string
  latitude?: number
  longitude?: number
  gallery: string[]
  description: string
  amenities: string[]
  colocs: Coloc[]
  owner: Owner
  tags: ListingTag[]
  regles?: string[]
  internet?: boolean
  parkingVoitures?: number
  parkingMotos?: number
  parkingCouvert?: boolean
  elevator?: boolean
  petsAllowed?: boolean
  smokersAllowed?: boolean
  womenOnly?: boolean
  menOnly?: boolean
  energyClass?: string | null
  ghgClass?: string | null
  modeAnnonce?: string
  dateExpiration?: string | null
  region?: string
  isBoosted?: boolean
  boostServiceId?: number | null
}

export interface CityInfo {
  name: string
  count: number
  image: string
}

export type CandidatureStatus = 'envoyee' | 'recue' | 'recu' | 'dossier' | 'signature' | 'conv' | 'convention' | 'en_attente' | 'acceptee' | 'refusee' | 'constituee'

export interface Candidature {
  id: string
  listing: string
  tenant: string
  status: CandidatureStatus
  date: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'Locataire' | 'Propriétaire' | 'Agence' | 'Admin'
  status: 'Actif' | 'Vérifié' | 'En attente'
  date: string
}

export interface Partner {
  name: string
  plan: 'Découverte' | 'Pro' | 'Agence'
  listings: number
  revenue: number
  since: string
}

export type PaymentType = 'Loyer' | 'Caution' | 'Commission' | 'Remboursement'
export type PaymentStatus = 'Payé' | 'En attente'

export interface Payment {
  id: string
  type: PaymentType
  amount: number
  from: string
  to: string
  date: string
  status: PaymentStatus
}

export interface Conversation {
  user: string
  subject: string
  preview: string
  date: string
  unread: boolean
  flag: boolean
}

export interface DashboardStats {
  activeListings: number
  pendingListings: number
  applications: number
  signatures: number
  users: number
  revenueMga: number
}
