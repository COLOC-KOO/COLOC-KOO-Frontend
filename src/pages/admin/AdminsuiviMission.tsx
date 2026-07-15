import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'
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
  CreditCard
} from 'lucide-react'

// ===== TYPES =====
// interface ServiceDemande {
//   id_demande: number
//   id_annonce: number
//   id_utilisateur: number
//   statut: 'a-contacter' | 'en-cours' | 'valide' | 'annule'
//   historique_contact: string | null
//   synthese: string | null
//   date_rendez_vous: string | null
//   note_rendez_vous: string | null
//   date_creation: string
//   nom?: string
//   prenom?: string
//   annonce_titre?: string
// }

interface ServiceDemande {
  id_demande: number
  id_annonce: number
  id_utilisateur: number
  statut: 'a-contacter' | 'en-cours' | 'valide' | 'annule'
  historique_contact: string | null
  synthese: string | null
  date_rendez_vous: string | null
  note_rendez_vous: string | null
  date_creation: string
  nom?: string | null      // ← Ajoutez | null
  prenom?: string | null   // ← Ajoutez | null
  annonce_titre?: string | null  // ← Ajoutez | null
}

interface Contrat {
  id_contrat: number          // ← Utilisez id_contrat au lieu de id
  id_annonce?: number         // ← Rendez-le optionnel car il n'existe pas dans ApiBackofficeContrat
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
  contratsEmisMois: number
  edlPlanifies: number
  versementsAVerifier: number
  partenairesActifs: number
  rendezVous: ServiceDemande[]
  contratsRecents: Contrat[]
}

// ===== COMPOSANTS =====

// Badge de statut
const StatusBadge = ({ statut }: { statut: string }) => {
  const config: Record<string, { label: string; className: string }> = {
    'a-contacter': { label: 'À contacter', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    'en-cours': { label: 'En cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    'valide': { label: 'Validé', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    'annule': { label: 'Annulé', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
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

// Carte de statistique
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  color = 'text-brand-cyan',
  onClick 
}: { 
  icon: React.ElementType
  value: string | number
  label: string
  color?: string
  onClick?: () => void
}) => (
  <div 
    className={`bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4 text-center ${onClick ? 'cursor-pointer hover:border-brand-cyan/50 transition-colors' : ''}`}
    onClick={onClick}
  >
    <div className="flex justify-center mb-2">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-white/40 mt-1">{label}</div>
  </div>
)

// Composant de modale de détails du rendez-vous
const RendezVousModal = ({
  demande,
  onClose
}: {
  demande: ServiceDemande
  onClose: () => void
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">Rendez-vous</h3>
            <p className="text-white/50 text-sm mt-1">
              {demande.prenom} {demande.nom} · {demande.annonce_titre || `Annonce #${demande.id_annonce}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Statut</div>
              <StatusBadge statut={demande.statut} />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Date de création</div>
              <div className="text-sm">{new Date(demande.date_creation).toLocaleDateString('fr-FR')}</div>
            </div>
            {demande.date_rendez_vous && (
              <div className="col-span-2">
                <div className="text-white/40 text-xs uppercase tracking-wider">Date du rendez-vous</div>
                <div className="text-sm font-medium text-brand-cyan">
                  {new Date(demande.date_rendez_vous).toLocaleString('fr-FR')}
                </div>
              </div>
            )}
          </div>

          {demande.synthese && (
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Synthèse</div>
              <p className="text-sm mt-1 bg-white/5 rounded-lg p-3">{demande.synthese}</p>
            </div>
          )}

          {demande.historique_contact && (
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Historique des contacts</div>
              <p className="text-sm mt-1 bg-white/5 rounded-lg p-3">{demande.historique_contact}</p>
            </div>
          )}

          {demande.note_rendez_vous && (
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Note du rendez-vous</div>
              <p className="text-sm mt-1 bg-white/5 rounded-lg p-3">{demande.note_rendez_vous}</p>
            </div>
          )}
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

// ===== COMPOSANT PRINCIPAL =====
export default function AdminSuiviMissions() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<MissionStats>({
    servicesEnCours: 0,
    contratsEmisMois: 0,
    edlPlanifies: 0,
    versementsAVerifier: 0,
    partenairesActifs: 0,
    rendezVous: [],
    contratsRecents: []
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRendezVous, setSelectedRendezVous] = useState<ServiceDemande | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('tous')
  const [filterType, setFilterType] = useState<string>('tous')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string>('')

  // Charger les données
  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Charger les demandes de services
      const demandes = await api.backofficeSuiviMissions()
      
      // Charger les contrats
      const contrats = await api.backofficeContrats()
      
      // Charger les paiements
      const paiements = await api.backofficePaiements()
      
      // Charger les partenaires
      const partenaires = await api.partenaires()

      // Calculer les statistiques
      const now = new Date()
      const moisCourant = now.getMonth()
      const anneeCourante = now.getFullYear()

      const servicesEnCours = demandes.demandes?.filter((d: any) => d.statut === 'en-cours').length || 0
      
      const contratsEmisMois = contrats?.filter((c: any) => {
        const date = new Date(c.date_creation)
        return c.statut === 'emis' && date.getMonth() === moisCourant && date.getFullYear() === anneeCourante
      }).length || 0

      const edlPlanifies = contrats?.filter((c: any) => c.type === 'edl' && c.statut === 'a-planifier').length || 0

      const versementsAVerifier = paiements?.filter((p: any) => p.statut === 'a-verifier').length || 0

      const partenairesActifs = partenaires?.filter((p: any) => p.actif === 1).length || 0

      // Rendez-vous
      const rendezVous = demandes.demandes?.filter((d: any) => d.date_rendez_vous) || []

      // Contrats récents (5 derniers)
      const contratsRecents = contrats?.slice(0, 5) || []

      setStats({
        servicesEnCours,
        contratsEmisMois,
        edlPlanifies,
        versementsAVerifier,
        partenairesActifs,
        rendezVous,
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

  // Filtrer les rendez-vous
  const filteredRendezVous = useMemo(() => {
    let filtered = stats.rendezVous

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((d: any) =>
        (d.prenom?.toLowerCase() || '').includes(query) ||
        (d.nom?.toLowerCase() || '').includes(query) ||
        (d.annonce_titre?.toLowerCase() || '').includes(query)
      )
    }

    if (filterStatus !== 'tous') {
      filtered = filtered.filter((d: any) => d.statut === filterStatus)
    }

    return filtered
  }, [stats.rendezVous, searchQuery, filterStatus])

  // Rendu
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

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* KPIs - Statistiques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard 
            icon={Briefcase} 
            value={stats.servicesEnCours} 
            label="Services Coloc'KOO en cours" 
            color="text-brand-cyan"
          />
          <StatCard 
            icon={FileCheck} 
            value={stats.contratsEmisMois} 
            label="Contrats émis (mois)" 
            color="text-green-400"
          />
          <StatCard 
            icon={Home} 
            value={stats.edlPlanifies} 
            label="EDL planifiés" 
            color="text-amber-400"
          />
          <StatCard 
            icon={CreditCard} 
            value={stats.versementsAVerifier} 
            label="Versements à vérifier" 
            color="text-red-400"
          />
          <StatCard 
            icon={Users} 
            value={stats.partenairesActifs} 
            label="Partenaires actifs" 
            color="text-pink-400"
          />
        </div>

        {/* Planning des rendez-vous */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="font-semibold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-brand-cyan" />
                Planning des rendez-vous
              </h2>
              <p className="text-white/40 text-xs mt-1">
                {stats.rendezVous.length} rendez-vous programmés
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
                <option value="a-contacter" className="bg-[oklch(0.22_0.005_260)]">À contacter</option>
                <option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>
                <option value="valide" className="bg-[oklch(0.22_0.005_260)]">Validé</option>
                <option value="annule" className="bg-[oklch(0.22_0.005_260)]">Annulé</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="text-center py-12 text-white/40">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chargement des rendez-vous...</p>
              </div>
            ) : filteredRendezVous.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun rendez-vous programmé</p>
              </div>
            ) : (
              filteredRendezVous.map((demande: any) => (
                <div 
                  key={demande.id_demande}
                  className="p-4 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedRendezVous(demande)}
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="w-10 h-10 rounded-full bg-brand-cyan/20 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold">
                          {demande.prenom} {demande.nom}
                        </span>
                        <StatusBadge statut={demande.statut} />
                      </div>
                      <div className="text-sm text-white/60">
                        {demande.annonce_titre || `Annonce #${demande.id_annonce}`}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/40 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {demande.date_rendez_vous 
                            ? new Date(demande.date_rendez_vous).toLocaleString('fr-FR')
                            : 'Date non définie'
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Créé le {new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-white/20" />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
            <span>{filteredRendezVous.length} rendez-vous</span>
            <span>
              Les rendez-vous sont programmés depuis l'onglet Services Coloc'KOO
            </span>
          </div>
        </div>

        {/* Partenaires B2B */}
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
            <button className="text-xs text-brand-cyan hover:text-brand-cyan-light transition">
              Voir tous →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-pink-400">{stats.partenairesActifs}</div>
              <div className="text-xs text-white/40">Partenaires actifs</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-400">3</div>
              <div className="text-xs text-white/40">Réseaux immobiliers</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-brand-cyan">— MGA</div>
              <div className="text-xs text-white/40">CA partenaires</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
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

      {/* Modal de détails du rendez-vous */}
      {selectedRendezVous && (
        <RendezVousModal 
          demande={selectedRendezVous}
          onClose={() => setSelectedRendezVous(null)}
        />
      )}
    </AdminLayout>
  )
}