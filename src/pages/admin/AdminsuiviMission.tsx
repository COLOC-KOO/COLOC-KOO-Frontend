import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar as CalendarIcon,
  RefreshCw,
  ArrowUpDown,
  Info,
  Target,
  Award,
  Star,
  AlertCircle,
  User,
  Briefcase,
  Home,
  DollarSign,
  Percent,
  PieChart,
  LineChart,
  XCircle
} from 'lucide-react'

// Types
interface Mission {
  id: string
  type: 'service' | 'contrat' | 'edl' | 'partenaire'
  titre: string
  description: string
  statut: 'en-cours' | 'planifie' | 'termine' | 'en-attente'
  priorite: 'haute' | 'moyenne' | 'basse'
  dateCreation: string
  dateEcheance?: string
  dateRealisation?: string
  responsable: string
  lieu?: string
  montant?: number
  progression: number // 0-100
  sousTaches: SousTache[]
  commentaires?: string
}

interface SousTache {
  id: string
  titre: string
  statut: 'a-faire' | 'en-cours' | 'termine'
  assigne: string
  dateEcheance?: string
}

// Données mockées
const MOCK_MISSIONS: Mission[] = [
  {
    id: 'M-001',
    type: 'service',
    titre: 'Service Coloc\'KOO - Gestion Jirama',
    description: 'Prise en charge des relevés Jirama pour la colocation 3 ch. Analakely',
    statut: 'en-cours',
    priorite: 'haute',
    dateCreation: '2026-06-10',
    dateEcheance: '2026-06-20',
    responsable: 'Sata L.',
    lieu: 'Analakely',
    montant: 26400,
    progression: 65,
    sousTaches: [
      { id: 'ST-001', titre: 'Contact avec le propriétaire', statut: 'termine', assigne: 'Sata L.', dateEcheance: '2026-06-12' },
      { id: 'ST-002', titre: 'Récupération des factures', statut: 'termine', assigne: 'Sata L.', dateEcheance: '2026-06-14' },
      { id: 'ST-003', titre: 'Saisie des relevés', statut: 'en-cours', assigne: 'Tovo M.', dateEcheance: '2026-06-18' },
      { id: 'ST-004', titre: 'Validation finale', statut: 'a-faire', assigne: 'Hanta R.', dateEcheance: '2026-06-20' }
    ],
    commentaires: 'En attente des factures pour le mois de mai'
  },
  {
    id: 'M-002',
    type: 'contrat',
    titre: 'Émission contrat - Coloc Ivandry',
    description: 'Contrat de colocation pour le 2 ch. Ivandry',
    statut: 'planifie',
    priorite: 'moyenne',
    dateCreation: '2026-06-12',
    dateEcheance: '2026-06-25',
    responsable: 'Hanta R.',
    lieu: 'Ivandry',
    montant: 120000,
    progression: 20,
    sousTaches: [
      { id: 'ST-005', titre: 'Vérification des parties', statut: 'termine', assigne: 'Hanta R.', dateEcheance: '2026-06-13' },
      { id: 'ST-006', titre: 'Rédaction du contrat', statut: 'en-cours', assigne: 'Tovo M.', dateEcheance: '2026-06-18' },
      { id: 'ST-007', titre: 'Signature des parties', statut: 'a-faire', assigne: 'Hanta R.', dateEcheance: '2026-06-22' },
      { id: 'ST-008', titre: 'Envoi du document', statut: 'a-faire', assigne: 'Sata L.', dateEcheance: '2026-06-25' }
    ],
    commentaires: 'En attente des coordonnées du colocataire'
  },
  {
    id: 'M-003',
    type: 'edl',
    titre: 'État des lieux - Ankorondrano',
    description: 'EDL d\'entrée pour la colocation 4 ch. Ankorondrano',
    statut: 'en-attente',
    priorite: 'haute',
    dateCreation: '2026-06-14',
    dateEcheance: '2026-06-30',
    responsable: 'Tovo M.',
    lieu: 'Ankorondrano',
    montant: 80000,
    progression: 10,
    sousTaches: [
      { id: 'ST-009', titre: 'Planification de la visite', statut: 'a-faire', assigne: 'Tovo M.', dateEcheance: '2026-06-18' },
      { id: 'ST-010', titre: 'Visite sur site', statut: 'a-faire', assigne: 'Tovo M.', dateEcheance: '2026-06-22' },
      { id: 'ST-011', titre: 'Rédaction de l\'EDL', statut: 'a-faire', assigne: 'Hanta R.', dateEcheance: '2026-06-25' }
    ],
    commentaires: 'En attente de la disponibilité du propriétaire'
  },
  {
    id: 'M-004',
    type: 'partenaire',
    titre: 'Intégration partenaire - Telma',
    description: 'Mise en place de la campagne publicitaire Telma Madagascar',
    statut: 'en-cours',
    priorite: 'moyenne',
    dateCreation: '2026-06-01',
    dateEcheance: '2026-07-15',
    responsable: 'Sata L.',
    montant: 900000,
    progression: 45,
    sousTaches: [
      { id: 'ST-012', titre: 'Brief créatif', statut: 'termine', assigne: 'Sata L.', dateEcheance: '2026-06-05' },
      { id: 'ST-013', titre: 'Création des visuels', statut: 'en-cours', assigne: 'Tovo M.', dateEcheance: '2026-06-20' },
      { id: 'ST-014', titre: 'Validation des visuels', statut: 'a-faire', assigne: 'Koto R.', dateEcheance: '2026-06-25' },
      { id: 'ST-015', titre: 'Lancement de la campagne', statut: 'a-faire', assigne: 'Sata L.', dateEcheance: '2026-07-15' }
    ],
    commentaires: 'En attente des visuels de la part du partenaire'
  },
  {
    id: 'M-005',
    type: 'service',
    titre: 'Service Coloc\'KOO - Ménage',
    description: 'Service de ménage pour la colocation 2 ch. Ivandry',
    statut: 'termine',
    priorite: 'basse',
    dateCreation: '2026-06-05',
    dateRealisation: '2026-06-15',
    responsable: 'Hanta R.',
    lieu: 'Ivandry',
    montant: 17600,
    progression: 100,
    sousTaches: [
      { id: 'ST-016', titre: 'Contact avec le client', statut: 'termine', assigne: 'Hanta R.', dateEcheance: '2026-06-06' },
      { id: 'ST-017', titre: 'Envoi du devis', statut: 'termine', assigne: 'Hanta R.', dateEcheance: '2026-06-07' },
      { id: 'ST-018', titre: 'Validation du client', statut: 'termine', assigne: 'Hanta R.', dateEcheance: '2026-06-08' },
      { id: 'ST-019', titre: 'Exécution du service', statut: 'termine', assigne: 'Tovo M.', dateEcheance: '2026-06-15' }
    ],
    commentaires: 'Service réalisé avec succès - Client satisfait'
  },
  {
    id: 'M-006',
    type: 'partenaire',
    titre: 'Intégration partenaire - BTP Vato',
    description: 'Réactivation du compte partenaire BTP Vato SA',
    statut: 'en-attente',
    priorite: 'haute',
    dateCreation: '2026-06-16',
    dateEcheance: '2026-06-30',
    responsable: 'Koto R.',
    montant: 0,
    progression: 0,
    sousTaches: [
      { id: 'ST-020', titre: 'Audit du compte', statut: 'a-faire', assigne: 'Koto R.', dateEcheance: '2026-06-18' },
      { id: 'ST-021', titre: 'Mise à jour des documents', statut: 'a-faire', assigne: 'Sata L.', dateEcheance: '2026-06-22' },
      { id: 'ST-022', titre: 'Réactivation du compte', statut: 'a-faire', assigne: 'Koto R.', dateEcheance: '2026-06-30' }
    ],
    commentaires: 'Compte suspendu - Nécessite une réactivation manuelle'
  }
]

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: Mission['statut'] }) => {
  const config = {
    'en-cours': { label: 'En cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Clock },
    'planifie': { label: 'Planifié', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: CalendarIcon },
    'termine': { label: 'Terminé', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'en-attente': { label: 'En attente', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: AlertCircle }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de badge de priorité
const PriorityBadge = ({ priorite }: { priorite: Mission['priorite'] }) => {
  const config = {
    'haute': { label: 'Haute', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    'moyenne': { label: 'Moyenne', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'basse': { label: 'Basse', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' }
  }
  const { label, className } = config[priorite]
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  )
}

// Composant de badge de type
const TypeBadge = ({ type }: { type: Mission['type'] }) => {
  const config = {
    'service': { label: 'Service Coloc\'KOO', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: Briefcase },
    'contrat': { label: 'Contrat', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: FileText },
    'edl': { label: 'État des lieux', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: Home },
    'partenaire': { label: 'Partenaire', className: 'bg-pink-500/15 text-pink-400 border-pink-500/30', icon: Building2 }
  }
  const { label, className, icon: Icon } = config[type]
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de barre de progression
const ProgressBar = ({ progression }: { progression: number }) => {
  const color = progression >= 80 ? 'bg-brand-green' : progression >= 50 ? 'bg-amber-400' : 'bg-red-400'
  
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color}`}
          style={{ width: `${progression}%` }}
        />
      </div>
      <span className="text-[10px] text-white/40">{progression}%</span>
    </div>
  )
}

// Composant de modale de détails
const MissionDetailsModal = ({
  mission,
  onClose
}: {
  mission: Mission
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold">{mission.titre}</h3>
              <StatusBadge statut={mission.statut} />
              <PriorityBadge priorite={mission.priorite} />
            </div>
            <p className="text-white/50 text-sm mt-1">{mission.id} · {mission.responsable}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Description</div>
              <p className="text-sm mt-1">{mission.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Type</span>
                <TypeBadge type={mission.type} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Progression</span>
                <ProgressBar progression={mission.progression} />
              </div>
              {mission.montant && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Montant</span>
                  <span className="font-bold text-brand-cyan">{mission.montant.toLocaleString('fr-FR')} MGA</span>
                </div>
              )}
              {mission.lieu && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Lieu</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-white/40" />
                    {mission.lieu}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 rounded-lg p-3">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Création</div>
              <div className="font-medium">{mission.dateCreation}</div>
            </div>
            {mission.dateEcheance && (
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Échéance</div>
                <div className="font-medium">{mission.dateEcheance}</div>
              </div>
            )}
            {mission.dateRealisation && (
              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider">Réalisation</div>
                <div className="font-medium text-brand-green">{mission.dateRealisation}</div>
              </div>
            )}
          </div>

          {mission.commentaires && (
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">Commentaires</div>
              <p className="text-sm mt-1">{mission.commentaires}</p>
            </div>
          )}

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Sous-tâches</div>
            <div className="space-y-2">
              {mission.sousTaches.map((st) => {
                const statusConfig = {
                  'termine': { label: '✓ Terminé', className: 'text-green-400' },
                  'en-cours': { label: '◉ En cours', className: 'text-amber-400' },
                  'a-faire': { label: '○ À faire', className: 'text-white/40' }
                }
                const status = statusConfig[st.statut]
                
                return (
                  <div key={st.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <span className={status.className}>{status.label}</span>
                      <span>{st.titre}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/40">
                      <span>{st.assigne}</span>
                      {st.dateEcheance && <span>Échéance: {st.dateEcheance}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <button 
            onClick={onClose}
            className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminSuiviMissions() {
  const [missions, setMissions] = useState(MOCK_MISSIONS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('tous')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [filterPriorite, setFilterPriorite] = useState<string>('tous')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [sortField, setSortField] = useState<'dateCreation' | 'titre' | 'progression'>('dateCreation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Types uniques pour les filtres
  const types = useMemo(() => {
    const unique = new Set(missions.map(m => m.type))
    return ['tous', ...Array.from(unique)]
  }, [missions])

  const statuts = useMemo(() => {
    const unique = new Set(missions.map(m => m.statut))
    return ['tous', ...Array.from(unique)]
  }, [missions])

  const priorites = useMemo(() => {
    const unique = new Set(missions.map(m => m.priorite))
    return ['tous', ...Array.from(unique)]
  }, [missions])

  // Filtrer et trier les missions
  const filteredMissions = useMemo(() => {
    let filtered = missions

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.titre.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query) ||
        m.responsable.toLowerCase().includes(query) ||
        (m.lieu && m.lieu.toLowerCase().includes(query))
      )
    }

    if (filterType !== 'tous') {
      filtered = filtered.filter(m => m.type === filterType)
    }

    if (filterStatut !== 'tous') {
      filtered = filtered.filter(m => m.statut === filterStatut)
    }

    if (filterPriorite !== 'tous') {
      filtered = filtered.filter(m => m.priorite === filterPriorite)
    }

    filtered = filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (sortField === 'dateCreation') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    return filtered
  }, [missions, searchQuery, filterType, filterStatut, filterPriorite, sortField, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    const total = missions.length
    const enCours = missions.filter(m => m.statut === 'en-cours').length
    const planifie = missions.filter(m => m.statut === 'planifie').length
    const termine = missions.filter(m => m.statut === 'termine').length
    const enAttente = missions.filter(m => m.statut === 'en-attente').length
    
    const haute = missions.filter(m => m.priorite === 'haute').length
    const moyenne = missions.filter(m => m.priorite === 'moyenne').length
    
    const progressionMoyenne = Math.round(missions.reduce((sum, m) => sum + m.progression, 0) / total)
    const totalMontant = missions.reduce((sum, m) => sum + (m.montant || 0), 0)
    
    return {
      total,
      enCours,
      planifie,
      termine,
      enAttente,
      haute,
      moyenne,
      progressionMoyenne,
      totalMontant
    }
  }, [missions])

  // Toggle de tri
  const handleSort = (field: 'dateCreation' | 'titre' | 'progression') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: 'dateCreation' | 'titre' | 'progression') => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  // Actualiser les données
  const handleRefresh = () => {
    setMissions(MOCK_MISSIONS)
    setSuccessMessage('Données actualisées')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Suivi des missions</h1>
            <p className="text-white/50 text-sm">
              {stats.total} missions · {stats.enCours} en cours · {stats.planifie} planifiées · {stats.termine} terminées
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
            <div className="text-xs text-white/40">Total missions</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.enCours}</div>
            <div className="text-xs text-white/40">En cours</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.planifie}</div>
            <div className="text-xs text-white/40">Planifiées</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.termine}</div>
            <div className="text-xs text-white/40">Terminées</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.enAttente}</div>
            <div className="text-xs text-white/40">En attente</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.progressionMoyenne}%</div>
            <div className="text-xs text-white/40">Progression moyenne</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher une mission..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-white/40 hover:text-white/70 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex gap-2 flex-wrap ml-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {types.map(type => (
                    <option key={type} value={type} className="bg-[oklch(0.22_0.005_260)]">
                      {type === 'tous' ? 'Tous les types' : 
                        type === 'service' ? 'Services Coloc\'KOO' :
                        type === 'contrat' ? 'Contrats' :
                        type === 'edl' ? 'États des lieux' : 'Partenaires'}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>
                  <option value="planifie" className="bg-[oklch(0.22_0.005_260)]">Planifié</option>
                  <option value="termine" className="bg-[oklch(0.22_0.005_260)]">Terminé</option>
                  <option value="en-attente" className="bg-[oklch(0.22_0.005_260)]">En attente</option>
                </select>

                <select
                  value={filterPriorite}
                  onChange={(e) => setFilterPriorite(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Toutes les priorités</option>
                  <option value="haute" className="bg-[oklch(0.22_0.005_260)]">Haute</option>
                  <option value="moyenne" className="bg-[oklch(0.22_0.005_260)]">Moyenne</option>
                  <option value="basse" className="bg-[oklch(0.22_0.005_260)]">Basse</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des missions */}
          <div className="divide-y divide-white/5">
            {filteredMissions.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune mission trouvée</p>
              </div>
            ) : (
              filteredMissions.map((mission) => (
                <div 
                  key={mission.id}
                  className="p-4 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedMission(mission)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icône */}
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {mission.type === 'service' && <Briefcase className="w-4 h-4 text-cyan-400" />}
                      {mission.type === 'contrat' && <FileText className="w-4 h-4 text-purple-400" />}
                      {mission.type === 'edl' && <Home className="w-4 h-4 text-green-400" />}
                      {mission.type === 'partenaire' && <Building2 className="w-4 h-4 text-pink-400" />}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold">{mission.titre}</h3>
                        <StatusBadge statut={mission.statut} />
                        <PriorityBadge priorite={mission.priorite} />
                        <TypeBadge type={mission.type} />
                      </div>
                      <p className="text-sm text-white/60 mt-1 line-clamp-1">{mission.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40 flex-wrap">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {mission.responsable}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {mission.dateCreation}
                          {mission.dateEcheance && ` → ${mission.dateEcheance}`}
                        </span>
                        {mission.lieu && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {mission.lieu}
                          </span>
                        )}
                        {mission.montant && (
                          <span className="flex items-center gap-1 text-brand-cyan">
                            <DollarSign className="w-3 h-3" />
                            {mission.montant.toLocaleString('fr-FR')} MGA
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <ProgressBar progression={mission.progression} />
                        </span>
                      </div>
                    </div>

                    {/* Nombre de sous-tâches */}
                    <div className="flex items-center gap-2 text-white/30 text-xs flex-shrink-0">
                      <CheckCircle className="w-3 h-3" />
                      {mission.sousTaches.filter(st => st.statut === 'termine').length}/{mission.sousTaches.length}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>{filteredMissions.length} missions</span>
            <span>·</span>
            <span className="text-blue-400">{filteredMissions.filter(m => m.statut === 'en-cours').length} en cours</span>
            <span>·</span>
            <span className="text-amber-400">{filteredMissions.filter(m => m.statut === 'planifie').length} planifiées</span>
            <span>·</span>
            <span className="text-brand-green">{filteredMissions.filter(m => m.statut === 'termine').length} terminées</span>
            <span>·</span>
            <span className="text-red-400">{filteredMissions.filter(m => m.statut === 'en-attente').length} en attente</span>
            {stats.totalMontant > 0 && (
              <>
                <span>·</span>
                <span>Montant total: <b className="text-brand-cyan">{stats.totalMontant.toLocaleString('fr-FR')} MGA</b></span>
              </>
            )}
            <span className="ml-auto">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/40">
              Les missions regroupent l'ensemble des activités de l'équipe : services Coloc'KOO, 
              contrats, états des lieux et partenariats. Cliquez sur une mission pour voir les détails.
            </div>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedMission && (
        <MissionDetailsModal 
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
        />
      )}
    </AdminLayout>
  )
}