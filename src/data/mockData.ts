import {
  AdminUser,
  Candidature,
  CandidatureStatus,
  CityInfo,
  Conversation,
  DashboardStats,
  Listing,
  Partner,
  Payment
} from '../types'
import { unsplash } from '../lib/utils'

export const listings: Listing[] = [
  {
    id: 'ant-001',
    title: 'Chambre lumineuse dans coloc étudiante — Isoraka',
    city: 'Antananarivo',
    district: 'Isoraka',
    price: 450000,
    charges: 60000,
    rooms: 4,
    bedrooms: 1,
    surface: 14,
    furnished: true,
    available: '01/08/2026',
    type: 'chambre',
    image: unsplash('1522708323590-d24dbb6b0267'),
    gallery: [
      unsplash('1522708323590-d24dbb6b0267'),
      unsplash('1560448204-e02f11c3d0e2'),
      unsplash('1493809842364-78817add7ffb')
    ],
    description:
      "Chambre meublée dans une belle colocation de 4 personnes à Isoraka, quartier calme et central. Salon spacieux, cuisine équipée, terrasse avec vue sur les collines. Ambiance conviviale et respectueuse.",
    amenities: ['Wi-Fi fibre', 'Eau chaude', 'Cuisine équipée', 'Machine à laver', 'Terrasse', 'Gardien'],
    colocs: [
      { name: 'Hery', age: 24, job: 'Étudiant Master' },
      { name: 'Volana', age: 26, job: 'Développeuse' },
      { name: 'Tafita', age: 23, job: 'Étudiant' }
    ],
    owner: { name: 'Mme Rasoa', verified: true, since: '2024' },
    tags: ['vedette', 'verifie']
  },
  {
    id: 'ant-002',
    title: 'Appartement T3 meublé à partager — Ivandry',
    city: 'Antananarivo',
    district: 'Ivandry',
    price: 750000,
    charges: 100000,
    rooms: 5,
    bedrooms: 2,
    surface: 24,
    furnished: true,
    available: '15/07/2026',
    type: 'appartement',
    image: unsplash('1502672260266-1c1ef2d93688'),
    gallery: [unsplash('1502672260266-1c1ef2d93688'), unsplash('1560448204-e02f11c3d0e2')],
    description: 'Appartement moderne en résidence sécurisée, parking, piscine. Colocation professionnelle.',
    amenities: ['Wi-Fi', 'Parking', 'Piscine', 'Sécurité 24/7', 'Climatisation'],
    colocs: [{ name: 'Mamy', age: 29, job: 'Consultant' }],
    owner: { name: 'Agence Tana Immo', verified: true, since: '2023' },
    tags: ['nouveau', 'verifie']
  },
  {
    id: 'toa-001',
    title: 'Villa bord de mer — Toamasina, colocation 3 chambres',
    city: 'Toamasina',
    district: 'Bord de mer',
    price: 600000,
    charges: 80000,
    rooms: 6,
    bedrooms: 1,
    surface: 18,
    furnished: true,
    available: '20/07/2026',
    type: 'maison',
    image: unsplash('1512917774080-9991f1c4c750'),
    gallery: [unsplash('1512917774080-9991f1c4c750')],
    description: "Villa pieds dans l'eau, jardin tropical, terrasse ombragée. Idéal télétravail.",
    amenities: ['Wi-Fi fibre', 'Jardin', 'Terrasse', 'Vue mer', 'Ménage inclus'],
    colocs: [
      { name: 'Fetra', age: 31, job: 'Freelance' },
      { name: 'Nirina', age: 28, job: "Prof d'anglais" }
    ],
    owner: { name: 'M. Rakoto', verified: true, since: '2022' },
    tags: ['vedette']
  },
  {
    id: 'maj-001',
    title: 'Studio en coloc — Mahajanga centre',
    city: 'Mahajanga',
    district: 'Centre',
    price: 350000,
    charges: 40000,
    rooms: 3,
    bedrooms: 1,
    surface: 12,
    furnished: false,
    available: '01/09/2026',
    type: 'chambre',
    image: unsplash('1493809842364-78817add7ffb'),
    gallery: [unsplash('1493809842364-78817add7ffb')],
    description: 'Chambre non meublée, proche université. Ambiance étudiante.',
    amenities: ['Wi-Fi', 'Cuisine partagée'],
    colocs: [{ name: 'Lova', age: 22, job: 'Étudiante' }],
    owner: { name: 'Mme Ravao', verified: false, since: '2025' },
    tags: []
  },
  {
    id: 'fia-001',
    title: 'Maison coloniale à partager — Fianarantsoa',
    city: 'Fianarantsoa',
    district: 'Haute ville',
    price: 400000,
    charges: 50000,
    rooms: 5,
    bedrooms: 1,
    surface: 16,
    furnished: true,
    available: '10/08/2026',
    type: 'maison',
    image: unsplash('1449844908441-8829872d2607'),
    gallery: [unsplash('1449844908441-8829872d2607')],
    description: 'Belle maison coloniale rénovée avec charme et cachet.',
    amenities: ['Cheminée', 'Jardin', 'Wi-Fi', 'Chauffage'],
    colocs: [{ name: 'Rija', age: 27, job: 'Architecte' }],
    owner: { name: 'M. Andria', verified: true, since: '2024' },
    tags: ['nouveau']
  },
  {
    id: 'ant-003',
    title: 'Chambre cosy — Ambatobe, résidence calme',
    city: 'Antananarivo',
    district: 'Ambatobe',
    price: 500000,
    charges: 70000,
    rooms: 4,
    bedrooms: 1,
    surface: 15,
    furnished: true,
    available: '05/08/2026',
    type: 'chambre',
    image: unsplash('1560185007-cde436f6a4d0'),
    gallery: [unsplash('1560185007-cde436f6a4d0')],
    description: 'Chambre spacieuse en colocation internationale (FR/EN/MG).',
    amenities: ['Wi-Fi fibre', 'Ménage 1x/sem', 'Parking', 'Balcon'],
    colocs: [
      { name: 'Sarah', age: 25, job: 'ONG' },
      { name: 'Andry', age: 30, job: 'Ingénieur' }
    ],
    owner: { name: 'Mme Voahangy', verified: true, since: '2023' },
    tags: ['vedette', 'verifie']
  }
]

export const cities: CityInfo[] = [
  { name: 'Antananarivo', count: 128, image: unsplash('1568454537842-d933259bb258') },
  { name: 'Toamasina', count: 42, image: unsplash('1512917774080-9991f1c4c750') },
  { name: 'Mahajanga', count: 28, image: unsplash('1507525428034-b723cf961d3e') },
  { name: 'Fianarantsoa', count: 19, image: unsplash('1449844908441-8829872d2607') },
  { name: 'Antsirabe', count: 15, image: unsplash('1502005229762-cf1b2da7c5d6') },
  { name: 'Nosy Be', count: 11, image: unsplash('1519046904884-53103b34b206') }
]

export const dashboardStats: DashboardStats = {
  activeListings: 243,
  pendingListings: 18,
  applications: 87,
  signatures: 12,
  users: 1420,
  revenueMga: 4560000
}

export const candidatures: Candidature[] = [
  { id: 'C-1042', listing: 'Chambre Isoraka', tenant: 'Volana R.', status: 'envoyee', date: '28/06/2026' },
  { id: 'C-1041', listing: 'T3 Ivandry', tenant: 'Mamy A.', status: 'dossier', date: '27/06/2026' },
  { id: 'C-1040', listing: 'Villa Toamasina', tenant: 'Fetra R.', status: 'signature', date: '25/06/2026' },
  { id: 'C-1039', listing: 'Studio Mahajanga', tenant: 'Lova B.', status: 'conv', date: '22/06/2026' },
  { id: 'C-1038', listing: 'Maison Fianar', tenant: 'Rija H.', status: 'recue', date: '20/06/2026' }
]

export const candidatureStatusMeta: Record<CandidatureStatus, { label: string; className: string }> = {
  envoyee: { label: 'Envoyée', className: 'bg-brand-cyan-light text-brand-cyan-dark border-brand-cyan/30' },
  recue: { label: 'Reçue', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  dossier: { label: 'Dossier complet', className: 'bg-brand-green-light text-brand-green-dark border-brand-green/30' },
  signature: { label: 'Signature', className: 'bg-pink-50 text-pink-700 border-pink-200' },
  conv: { label: 'Convention', className: 'bg-brand-green text-white border-brand-green' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  acceptee: { label: 'Acceptée', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refusee: { label: 'Refusée', className: 'bg-red-50 text-red-700 border-red-200' },
  constituee: { label: 'Constituée', className: 'bg-brand-cyan-light text-brand-cyan-dark border-brand-cyan/30' }
}

export const adminUsers: AdminUser[] = [
  { id: 'U-001', name: 'Volana Rakoto', email: 'volana@example.mg', role: 'Locataire', status: 'Actif', date: '12/03/2026' },
  { id: 'U-002', name: 'Mamy Andria', email: 'mamy@example.mg', role: 'Locataire', status: 'Actif', date: '18/03/2026' },
  { id: 'U-003', name: 'Mme Rasoa', email: 'rasoa@example.mg', role: 'Propriétaire', status: 'Vérifié', date: '01/02/2026' },
  { id: 'U-004', name: 'Agence Tana Immo', email: 'contact@tanaimmo.mg', role: 'Agence', status: 'Vérifié', date: '10/01/2026' },
  { id: 'U-005', name: 'Fetra R.', email: 'fetra@example.mg', role: 'Locataire', status: 'En attente', date: '22/06/2026' }
]

export const partners: Partner[] = [
  { name: 'Tana Immo', plan: 'Pro', listings: 34, revenue: 5100000, since: '2024' },
  { name: 'Coloc Mada', plan: 'Agence', listings: 62, revenue: 12400000, since: '2023' },
  { name: 'M. Rakoto', plan: 'Découverte', listings: 3, revenue: 0, since: '2026' },
  { name: 'Mahajanga Homes', plan: 'Pro', listings: 18, revenue: 2700000, since: '2025' }
]

export const payments: Payment[] = [
  { id: 'TX-9821', type: 'Loyer', amount: 450000, from: 'Volana R.', to: 'Mme Rasoa', date: '01/07/2026', status: 'Payé' },
  { id: 'TX-9820', type: 'Caution', amount: 900000, from: 'Mamy A.', to: 'Tana Immo', date: '28/06/2026', status: 'Payé' },
  { id: 'TX-9819', type: 'Commission', amount: 45000, from: 'Sarintany', to: '—', date: '28/06/2026', status: 'Payé' },
  { id: 'TX-9818', type: 'Loyer', amount: 600000, from: 'Fetra R.', to: 'M. Rakoto', date: '27/06/2026', status: 'En attente' },
  { id: 'TX-9817', type: 'Remboursement', amount: 350000, from: 'Sarintany', to: 'Lova B.', date: '22/06/2026', status: 'Payé' }
]

export const paymentStats = [
  { label: 'Volume ce mois', value: '4,56M Ar', delta: '+22%', up: true },
  { label: 'Commissions', value: '684k Ar', delta: '+18%', up: true },
  { label: 'Cautions en garde', value: '12,3M Ar', delta: '+3%', up: true },
  { label: 'Remboursements', value: '350k Ar', delta: '-12%', up: false }
]

export const conversations: Conversation[] = [
  {
    user: 'Volana R.',
    subject: 'Problème avec ma candidature',
    preview: "Bonjour, je n'arrive pas à uploader mon justificatif...",
    date: 'il y a 12 min',
    unread: true,
    flag: false
  },
  {
    user: 'M. Rakoto',
    subject: 'Signalement annonce ANT-999',
    preview: 'Cette annonce semble être une arnaque...',
    date: 'il y a 1h',
    unread: true,
    flag: true
  },
  {
    user: 'Agence Tana Immo',
    subject: 'Demande de facturation',
    preview: 'Bonjour, pouvez-vous nous envoyer la facture du mois...',
    date: 'il y a 3h',
    unread: true,
    flag: false
  },
  {
    user: 'Fetra R.',
    subject: 'Merci pour le service !',
    preview: 'Juste un mot pour vous remercier.',
    date: 'hier',
    unread: false,
    flag: false
  }
]

export const topCities = [
  { c: 'Antananarivo', n: 128, p: 100 },
  { c: 'Toamasina', n: 42, p: 33 },
  { c: 'Mahajanga', n: 28, p: 22 },
  { c: 'Fianarantsoa', n: 19, p: 15 }
]

export const settingsSections = [
  {
    title: 'Général',
    fields: [
      ['Nom', "Sarintany'COLOC"],
      ['Email contact', 'hello@sarintany-coloc.mg'],
      ['Devise', 'Ariary (Ar)'],
      ['Fuseau', 'Indian/Antananarivo']
    ]
  },
  {
    title: 'Commission & tarifs',
    fields: [
      ['Commission (%)', '3'],
      ['Frais dossier (Ar)', '10000'],
      ['Garde caution (jours)', '45']
    ]
  },
  {
    title: 'Emails',
    fields: [
      ['Expéditeur', 'no-reply@sarintany-coloc.mg'],
      ['SMTP', 'smtp.sendgrid.net']
    ]
  }
]
