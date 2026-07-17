import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, type DemandeServiceStaffItem } from '../../lib/api'
import {
  CheckCircle,
  Clock,
  FileText,
  Building2,
  Search,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar as CalendarIcon,
  RefreshCw,
  ArrowUpDown,
  Info,
  Target,
  AlertCircle,
  User,
  Briefcase,
  Home,
  DollarSign,
  XCircle,
  TrendingUp,
  Users,
  FileCheck,
  CreditCard,
  Phone,
  Mail,
  Package,
  Tag,
  ArrowRight
} from 'lucide-react'

// ===== TYPES =====
type ServiceDemande = DemandeServiceStaffItem

interface Contrat {
  id_contrat: number
  id_annonce?: number
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

interface Paiement {
  id_paiement: number
  reference: string
  id_utilisateur: number
  id_contrat: number | null
  id_annonce: number | null
  montant_du: number
  montant_recu: number
  moyen_paiement: string
  service_type: string
  statut: 'a-verifier' | 'conforme' | 'non-conforme' | 'en_attente' | 'valide' | 'echoue'
  date_paiement: string
  reference_operateur: string | null
  date_creation: string
  nom?: string
  prenom?: string
  annonce_titre?: string
}

interface Partenaire {
  id_partenaire: number
  nom: string
  secteur: string | null
  niveau: string
  remise: string | null
  engagement: string | null
  logo: string | null
  actif: number
  date_creation: string
}

interface MissionStats {
  servicesEnCours: number
  servicesNouvelles: number
  servicesTraitees: number
  servicesAnnulees: number
  contratsEmisMois: number
  edlPlanifies: number
  versementsAVerifier: number
  partenairesActifs: number
  demandes: ServiceDemande[]
  contratsRecents: Contrat[]
}

// ===== COMPOSANTS =====

// Badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    'nouvelle': { label: 'Nouvelle', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'en-cours': { label: 'En cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    'traitee': { label: 'Traitée', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    'annulee': { label: 'Annulée', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    'a-contacter': { label: 'À contacter', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'valide': { label: 'Validé', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    'annule': { label: 'Annulé', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    'a-emettre': { label: 'À émettre', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    'a-planifier': { label: 'À planifier', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    'emis': { label: 'Émis', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
  }
  const { label, className } = config[statut] || { label: statut, className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' }
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      {label}
    </span>
  )
}

// Carte de statistique cliquable
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  color = 'text-brand-cyan',
  path,
  onClick
}: { 
  icon: React.ElementType
  value: string | number
  label: string
  color?: string
  path?: string
  onClick?: () => void
}) => {
  const navigate = useNavigate()
  
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else if (path) {
      navigate(path)
    }
  }
  
  return (
    <div 
      className={`bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4 text-center ${(path || onClick) ? 'cursor-pointer hover:border-brand-cyan/50 hover:bg-white/5 transition-all' : ''}`}
      onClick={handleClick}
    >
      <div className="flex justify-center mb-2">
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-white/40 mt-1">{label}</div>
      {(path || onClick) && (
        <div className="mt-2 flex justify-center">
          <ArrowRight className="w-3 h-3 text-white/20" />
        </div>
      )}
    </div>
  )
}

// ===== COMPOSANT PRINCIPAL =====
export default function AdminSuiviMissions() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<MissionStats>({
    servicesEnCours: 0,
    servicesNouvelles: 0,
    servicesTraitees: 0,
    servicesAnnulees: 0,
    contratsEmisMois: 0,
    edlPlanifies: 0,
    versementsAVerifier: 0,
    partenairesActifs: 0,
    demandes: [],
    contratsRecents: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('tous')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Charger les données
  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Charger les demandes de services
      const demandesData = await api.backofficeDemandesService()
      
      // Charger les contrats
      const contrats = await api.backofficeContrats() || []
      
      // Charger les paiements
      const paiements = await api.backofficePaiements() || []
      
      // Charger les partenaires
      const partenaires = await api.partenaires() || []

      // Transformer les données
      const demandes = demandesData.map((d: any) => ({
        ...d,
        reference: d.reference || `SVC-${d.id_demande || d.id_demande_service || 0}`,
        service_nom: d.services?.[0] || 'Service Coloc\'KOO'
      }))

      // Calculer les statistiques
      const servicesEnCours = demandes?.filter((d: any) => d.statut === 'en-cours').length || 0
      const servicesNouvelles = demandes?.filter((d: any) => d.statut === 'nouvelle').length || 0
      const servicesTraitees = demandes?.filter((d: any) => d.statut === 'traitee').length || 0
      const servicesAnnulees = demandes?.filter((d: any) => d.statut === 'annulee').length || 0
      
      const now = new Date()
      const moisCourant = now.getMonth()
      const anneeCourante = now.getFullYear()

      const contratsEmisMois = contrats?.filter((c: any) => {
        const date = new Date(c.date_creation)
        return c.statut === 'emis' && date.getMonth() === moisCourant && date.getFullYear() === anneeCourante
      }).length || 0

      const edlPlanifies = contrats?.filter((c: any) => c.type === 'edl' && c.statut === 'a-planifier').length || 0
      const versementsAVerifier = paiements?.filter((p: any) => p.statut === 'a-verifier').length || 0
      const partenairesActifs = partenaires?.filter((p: any) => p.actif === 1).length || 0

      const contratsRecents = contrats?.slice(0, 5) || []

      setStats({
        servicesEnCours,
        servicesNouvelles,
        servicesTraitees,
        servicesAnnulees,
        contratsEmisMois,
        edlPlanifies,
        versementsAVerifier,
        partenairesActifs,
        demandes: demandes || [],
        contratsRecents
      })

      setLastUpdate(new Date().toLocaleString('fr-FR'))
      setSuccessMessage('Données chargées avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrer les demandes
  const filteredDemandes = useMemo(() => {
    let filtered = stats.demandes

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((d: any) =>
        (d.demandeur?.toLowerCase() || '').includes(query) ||
        (d.reference?.toLowerCase() || '').includes(query) ||
        (d.services?.join(' ')?.toLowerCase() || '').includes(query)
      )
    }

    if (filterStatus !== 'tous') {
      filtered = filtered.filter((d: any) => d.statut === filterStatus)
    }

    return filtered
  }, [stats.demandes, searchQuery, filterStatus])

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Suivi des missions</h1>
            <p className="text-white/50 text-sm">
              Tableau de bord et chiffres associés · Dernière mise à jour : {lastUpdate || '...'}
            </p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ===== KPIs cliquables comme dans le HTML ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard 
            icon={Tag} 
            value={stats.servicesNouvelles} 
            label="Services Coloc'KOO en cours" 
            color="text-brand-cyan"
            path="/admin/services-colockoo"
          />
          <StatCard 
            icon={FileCheck} 
            value={stats.contratsEmisMois} 
            label="Contrats émis (mois)" 
            color="text-green-400"
            path="/admin/contrats-edl"
          />
          <StatCard 
            icon={Home} 
            value={stats.edlPlanifies} 
            label="EDL planifiés" 
            color="text-amber-400"
            path="/admin/contrats-edl"
          />
          <StatCard 
            icon={CreditCard} 
            value={stats.versementsAVerifier} 
            label="Versements à vérifier" 
            color="text-red-400"
            path="/admin/versements"
          />
          <StatCard 
            icon={Users} 
            value={stats.partenairesActifs} 
            label="Partenaires actifs" 
            color="text-pink-400"
            path="/admin/partenaires"
          />
        </div>

        {/* ===== Planning des rendez-vous (comme dans le HTML) ===== */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-cyan" />
                Planning des rendez-vous
              </h2>
              <p className="text-white/40 text-xs mt-1">
                {stats.demandes.length} rendez-vous programmés
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher..."
                  className="flex-1 bg-transparent outline-none text-sm w-32"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
              >
                <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                <option value="nouvelle" className="bg-[oklch(0.22_0.005_260)]">Nouvelle</option>
                <option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>
                <option value="traitee" className="bg-[oklch(0.22_0.005_260)]">Traitée</option>
                <option value="annulee" className="bg-[oklch(0.22_0.005_260)]">Annulée</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="text-center py-12 text-white/40">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chargement des rendez-vous...</p>
              </div>
            ) : filteredDemandes.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun rendez-vous programmé</p>
              </div>
            ) : (
              filteredDemandes.map((demande: any) => {
                const total = demande.total || 0
                const demandeur = demande.demandeur || 'Client inconnu'
                const services = demande.services?.join(', ') || 'Service Coloc\'KOO'
                
                return (
                  <div 
                    key={demande.reference || Math.random()}
                    className="p-4 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => navigate('/admin/services-colockoo')}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                        <CalendarIcon className="w-4 h-4 text-brand-cyan" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-semibold">
                            {demandeur}
                          </span>
                          <StatusBadge statut={demande.statut || 'nouvelle'} />
                        </div>
                        <div className="text-sm text-white/60">
                          {services}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-white/40 flex-wrap">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {demande.date_creation ? new Date(demande.date_creation).toLocaleDateString('fr-FR') : '-'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Créé le {demande.date_creation ? new Date(demande.date_creation).toLocaleDateString('fr-FR') : '-'}
                          </span>
                          <span className="flex items-center gap-1 text-brand-cyan">
                            <DollarSign className="w-3 h-3" />
                            {total.toLocaleString('fr-FR')} Ar
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-white/20" />
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>{filteredDemandes.length} rendez-vous</span>
            <span>
              Les rendez-vous sont programmés depuis l'onglet Services Coloc'KOO
            </span>
          </div>
        </div>

        {/* ===== Partenaires B2B (comme dans le HTML) ===== */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pink-400" />
                Partenaires B2B
              </h2>
              <p className="text-white/40 text-xs mt-1">
                {stats.partenairesActifs} partenaires actifs
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/partenaires')}
              className="text-xs text-brand-cyan hover:text-brand-cyan-light transition"
            >
              Voir tous →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div 
              className="bg-white/5 rounded-lg p-3 text-center cursor-pointer hover:bg-white/10 transition"
              onClick={() => navigate('/admin/partenaires')}
            >
              <div className="text-lg font-bold text-pink-400">{stats.partenairesActifs}</div>
              <div className="text-xs text-white/40">Partenaires actifs</div>
            </div>
            <div 
              className="bg-white/5 rounded-lg p-3 text-center cursor-pointer hover:bg-white/10 transition"
              onClick={() => navigate('/admin/partenaires')}
            >
              <div className="text-lg font-bold text-amber-400">3</div>
              <div className="text-xs text-white/40">Réseaux immobiliers</div>
            </div>
            <div 
              className="bg-white/5 rounded-lg p-3 text-center cursor-pointer hover:bg-white/10 transition"
              onClick={() => navigate('/admin/partenaires')}
            >
              <div className="text-lg font-bold text-brand-cyan">— MGA</div>
              <div className="text-xs text-white/40">CA partenaires</div>
            </div>
            <div 
              className="bg-white/5 rounded-lg p-3 text-center cursor-pointer hover:bg-white/10 transition"
              onClick={() => navigate('/admin/partenaires')}
            >
              <div className="text-lg font-bold text-green-400">4</div>
              <div className="text-xs text-white/40">Nouveaux (mois)</div>
            </div>
          </div>
        </div>

        {/* Note d'information */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/40">
              Les rendez-vous sont programmés depuis l'onglet <b>Services Coloc'KOO</b> (prise de contact prospect). 
              Cliquez un RDV pour ouvrir la demande associée.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}