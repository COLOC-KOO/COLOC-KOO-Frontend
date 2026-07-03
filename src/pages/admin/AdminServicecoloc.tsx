import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'
import {
  Wrench,
  Search,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  UserPlus,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Info,
  MessageCircle,
  FileText,
  Briefcase,
  Home,
  Calendar as CalendarIcon,
  User,
  MapPin,
  Plus,
  Save,
  X
} from 'lucide-react'

// Types
interface ServiceDemande {
  id: string
  nom: string
  annonce: string
  telephone: string
  email: string
  dateCreation: string
  statut: 'a-contacter' | 'en-cours' | 'valide' | 'annule'
  contact?: string
  relance?: string
  synth?: string
  rdv?: {
    date: string
    note: string
  }
  devis: DevisItem[]
}

interface DevisItem {
  offre: string
  jours: number
  pu: number
}

interface ApiBackofficeSuiviMissionDemande {
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
}

interface ApiServiceCkooRow {
  id_service: number
  cle_service?: string | null
  nom: string
  description?: string | null
  prix: number
  unite?: string | null
  est_actif: 0 | 1
}

function mapSuiviMissionDemande(demande: ApiBackofficeSuiviMissionDemande): ServiceDemande {
  const nom = [demande.prenom, demande.nom].filter(Boolean).join(' ') || `Client #${demande.id_utilisateur}`
  return {
    id: String(demande.id_demande),
    nom,
    annonce: demande.titre || 'Annonce inconnue',
    telephone: '-',
    email: '-',
    dateCreation: demande.date_creation ? new Date(demande.date_creation).toLocaleDateString('fr-FR') : '',
    statut: demande.statut,
    contact: demande.historique_contact || 'Aucun contact',
    relance: demande.note_rendez_vous || '—',
    synth: demande.synthese || '',
    rdv: demande.date_rendez_vous
      ? {
          date: new Date(demande.date_rendez_vous).toLocaleString('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short',
          }),
          note: demande.note_rendez_vous || '',
        }
      : undefined,
    devis: [],
  }
}

function mapServiceCkooRow(service: ApiServiceCkooRow): OffreService {
  return {
    id: String(service.id_service),
    nom: service.nom,
    prixParJour: Number(service.prix || 0),
    actif: Boolean(service.est_actif),
  }
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: ServiceDemande['statut'] }) => {
  const config = {
    'a-contacter': { label: 'À contacter', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock },
    'en-cours': { label: 'Échange en cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: MessageCircle },
    'valide': { label: 'Validé', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'annule': { label: 'Annulé', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de modale de détails
const DemandeDetailsModal = ({
  demande,
  onClose,
  onUpdate
}: {
  demande: ServiceDemande
  onClose: () => void
  onUpdate: (id: string, updates: Partial<ServiceDemande>) => void
}) => {
  const [synth, setSynth] = useState(demande.synth || '')
  const [rdvDate, setRdvDate] = useState(demande.rdv?.date || '')
  const [rdvNote, setRdvNote] = useState(demande.rdv?.note || '')

  const handleSave = () => {
    const updates: Partial<ServiceDemande> = {
      synth,
      rdv: rdvDate ? { date: rdvDate, note: rdvNote } : undefined
    }
    onUpdate(demande.id, updates)
    onClose()
  }

  const totalDevis = demande.devis.reduce((sum, item) => sum + item.jours * item.pu, 0)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold">{demande.nom}</h3>
              <StatusBadge statut={demande.statut} />
            </div>
            <p className="text-white/50 text-sm mt-1">{demande.id} · {demande.annonce}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Contact</div>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-white/40" />
                <span>{demande.telephone}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-white/40" />
                <span>{demande.email}</span>
              </div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Informations</div>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="w-4 h-4 text-white/40" />
                <span>Créé le {demande.dateCreation}</span>
              </div>
              {demande.contact && (
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span>{demande.contact}</span>
                </div>
              )}
              {demande.relance && demande.relance !== '—' && (
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span>{demande.relance}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Devis</div>
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Offre</th>
                    <th className="text-center p-2 text-white/40 font-medium text-xs">Jours</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs">Prix/jour</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {demande.devis.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{item.offre}</td>
                      <td className="p-2 text-center">{item.jours}</td>
                      <td className="p-2 text-right">{item.pu.toLocaleString('fr-FR')} MGA</td>
                      <td className="p-2 text-right">{(item.jours * item.pu).toLocaleString('fr-FR')} MGA</td>
                    </tr>
                  ))}
                  <tr className="bg-white/5">
                    <td colSpan={3} className="p-2 text-right font-bold">Total devis</td>
                    <td className="p-2 text-right font-bold text-brand-cyan">{totalDevis.toLocaleString('fr-FR')} MGA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {demande.rdv && (
            <div className="bg-brand-cyan/10 border border-brand-cyan/30 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">RDV téléphonique</div>
              <div className="flex items-center gap-2 mt-1">
                <CalendarIcon className="w-4 h-4 text-brand-cyan" />
                <span className="font-medium">{demande.rdv.date}</span>
              </div>
              {demande.rdv.note && (
                <div className="text-sm text-white/60 mt-1">{demande.rdv.note}</div>
              )}
            </div>
          )}

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Synthèse</div>
            <textarea
              value={synth}
              onChange={(e) => setSynth(e.target.value)}
              placeholder="Synthèse des échanges..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">RDV date</div>
              <input
                type="datetime-local"
                value={rdvDate}
                onChange={(e) => setRdvDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
              />
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Note RDV</div>
              <input
                type="text"
                value={rdvNote}
                onChange={(e) => setRdvNote(e.target.value)}
                placeholder="Note..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex gap-2">
          <button 
            onClick={handleSave}
            className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition"
          >
            <Save className="w-4 h-4 inline mr-2" />
            Enregistrer
          </button>
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

// Composant de modale d'ajout d'offre
const OffreModal = ({
  onClose,
  onSave
}: {
  onClose: () => void
  onSave: (offre: Omit<OffreService, 'id'>) => void
}) => {
  const [nom, setNom] = useState('')
  const [prixParJour, setPrixParJour] = useState(8800)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nom.trim()) {
      alert('Veuillez saisir un nom pour l\'offre')
      return
    }
    onSave({ nom, prixParJour, actif: true })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold">Ajouter une offre</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Nom de l'offre *</label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
              placeholder="Ex: Service de jardinage"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Prix par jour (MGA)</label>
            <input
              type="number"
              min="0"
              value={prixParJour}
              onChange={(e) => setPrixParJour(parseInt(e.target.value) || 0)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
              <Plus className="w-4 h-4 inline mr-2" />
              Ajouter
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminServicesColockoo() {
  const [demandes, setDemandes] = useState<ServiceDemande[]>([])
  const [offres, setOffres] = useState<OffreService[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [selectedDemande, setSelectedDemande] = useState<ServiceDemande | null>(null)
  const [showOffreModal, setShowOffreModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'demandes' | 'offres'>('demandes')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sortField, setSortField] = useState<'dateCreation' | 'nom' | 'statut'>('dateCreation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const loadAdminServiceData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [missionsResponse, services] = await Promise.all([
        api.backofficeSuiviMissions(),
        api.backofficeServicesCkoo(),
      ])

      setDemandes(missionsResponse.demandes.map(mapSuiviMissionDemande))
      setOffres(services.map(mapServiceCkooRow))
      setSuccessMessage('Données chargées depuis le backend')
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminServiceData()
  }, [])

  // Statuts uniques pour le filtre
  const statuts = useMemo(() => {
    const unique = new Set(demandes.map(d => d.statut))
    return ['tous', ...Array.from(unique)]
  }, [demandes])

  // Filtrer et trier les demandes
  const filteredDemandes = useMemo(() => {
    let filtered = demandes

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.nom.toLowerCase().includes(query) ||
        d.annonce.toLowerCase().includes(query) ||
        d.id.toLowerCase().includes(query) ||
        d.email.toLowerCase().includes(query)
      )
    }

    if (filterStatut !== 'tous') {
      filtered = filtered.filter(d => d.statut === filterStatut)
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
  }, [demandes, searchQuery, filterStatut, sortField, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    const total = demandes.length
    const aContacter = demandes.filter(d => d.statut === 'a-contacter').length
    const enCours = demandes.filter(d => d.statut === 'en-cours').length
    const valide = demandes.filter(d => d.statut === 'valide').length
    const annule = demandes.filter(d => d.statut === 'annule').length
    
    const totalDevis = demandes.reduce((sum, d) => {
      const total = d.devis.reduce((s, item) => s + item.jours * item.pu, 0)
      return sum + total
    }, 0)
    
    return {
      total,
      aContacter,
      enCours,
      valide,
      annule,
      totalDevis
    }
  }, [demandes])

  // Toggle de tri
  const handleSort = (field: 'dateCreation' | 'nom' | 'statut') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: 'dateCreation' | 'nom' | 'statut') => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  // Mettre à jour une demande
  const handleUpdateDemande = (id: string, updates: Partial<ServiceDemande>) => {
    const index = demandes.findIndex(d => d.id === id)
    if (index === -1) return
    
    const updatedDemandes = [...demandes]
    updatedDemandes[index] = {
      ...updatedDemandes[index],
      ...updates
    }
    setDemandes(updatedDemandes)
    setSuccessMessage('Demande mise à jour avec succès')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Changer le statut d'une demande
  const handleChangeStatut = (id: string, statut: ServiceDemande['statut']) => {
    const index = demandes.findIndex(d => d.id === id)
    if (index === -1) return
    
    const updatedDemandes = [...demandes]
    updatedDemandes[index] = {
      ...updatedDemandes[index],
      statut
    }
    setDemandes(updatedDemandes)
    
    const label = {
      'a-contacter': 'À contacter',
      'en-cours': 'Échange en cours',
      'valide': 'Validé',
      'annule': 'Annulé'
    }[statut]
    
    setSuccessMessage(`Statut changé en "${label}"`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Ajouter une offre
  const handleAddOffre = async (offre: Omit<OffreService, 'id'>) => {
    setLoading(true)
    setError(null)
    try {
      await api.createServiceCkoo({
        nom: offre.nom,
        prix: offre.prixParJour,
        unite: 'heure',
        est_actif: offre.actif ? 1 : 0,
      })
      await loadAdminServiceData()
      setSuccessMessage(`Offre "${offre.nom}" ajoutée avec succès`)
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’ajouter l’offre')
    } finally {
      setLoading(false)
    }
  }

  // Supprimer une offre
  const handleDeleteOffre = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) return
    setLoading(true)
    setError(null)
    try {
      await api.deleteServiceCkoo(id)
      await loadAdminServiceData()
      setSuccessMessage('Offre supprimée avec succès')
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer l’offre')
    } finally {
      setLoading(false)
    }
  }

  // Toggle actif/inactif
  const handleToggleOffre = async (id: string) => {
    const index = offres.findIndex(o => o.id === id)
    if (index === -1) return
    const updatedOffre = { ...offres[index], actif: !offres[index].actif }

    setLoading(true)
    setError(null)
    try {
      await api.updateServiceCkoo(id, { est_actif: updatedOffre.actif ? 1 : 0 })
      await loadAdminServiceData()
      setSuccessMessage(`Offre ${updatedOffre.actif ? 'activée' : 'désactivée'}`)
      window.setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de changer le statut de l’offre')
    } finally {
      setLoading(false)
    }
  }

  // Actualiser les données
  const handleRefresh = () => {
    loadAdminServiceData()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Services Coloc'KOO</h1>
            <p className="text-white/50 text-sm">
              {stats.total} demandes · {stats.aContacter} à contacter · {stats.enCours} en cours · {stats.valide} validées
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
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm">
            Chargement des données...
          </div>
        )}

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 border-b border-white/10 pb-0">
          <button
            onClick={() => setActiveTab('demandes')}
            className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
              activeTab === 'demandes'
                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Demandes de services
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{demandes.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('offres')}
            className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
              activeTab === 'offres'
                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4 inline mr-2" />
            Offres commerciales
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{offres.length}</span>
          </button>
        </div>

        {/* Contenu */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          
          {/* TAB: Demandes */}
          {activeTab === 'demandes' && (
            <>
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      placeholder="Rechercher une demande..."
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
                      value={filterStatut}
                      onChange={(e) => setFilterStatut(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                    >
                      <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                      <option value="a-contacter" className="bg-[oklch(0.22_0.005_260)]">À contacter</option>
                      <option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">Échange en cours</option>
                      <option value="valide" className="bg-[oklch(0.22_0.005_260)]">Validé</option>
                      <option value="annule" className="bg-[oklch(0.22_0.005_260)]">Annulé</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Liste des demandes */}
              <div className="divide-y divide-white/5">
                {filteredDemandes.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucune demande trouvée</p>
                  </div>
                ) : (
                  filteredDemandes.map((demande) => {
                    const totalDevis = demande.devis.reduce((sum, item) => sum + item.jours * item.pu, 0)
                    
                    return (
                      <div 
                        key={demande.id}
                        className="p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold flex-shrink-0">
                            {demande.nom[0]}
                          </div>

                          {/* Contenu */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-semibold">{demande.nom}</h3>
                              <span className="text-white/30 text-xs">·</span>
                              <span className="text-white/50 text-sm">{demande.id}</span>
                              <span className="text-white/30 text-xs">·</span>
                              <span className="text-white/50 text-sm">{demande.annonce}</span>
                              <StatusBadge statut={demande.statut} />
                            </div>
                            
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/40 flex-wrap">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {demande.dateCreation}
                              </span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {demande.telephone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {demande.email}
                              </span>
                              {demande.rdv && (
                                <span className="flex items-center gap-1 text-brand-cyan">
                                  <CalendarIcon className="w-3 h-3" />
                                  RDV: {demande.rdv.date}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-brand-cyan">
                                <DollarSign className="w-3 h-3" />
                                {totalDevis.toLocaleString('fr-FR')} MGA
                              </span>
                            </div>

                            {demande.synth && (
                              <p className="text-sm text-white/60 mt-1">{demande.synth}</p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 flex-shrink-0">
                            <button
                              onClick={() => setSelectedDemande(demande)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
                              title="Détails"
                            >
                              <Eye className="w-4 h-4 text-white/40" />
                            </button>
                            <select
                              value={demande.statut}
                              onChange={(e) => handleChangeStatut(demande.id, e.target.value as ServiceDemande['statut'])}
                              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs outline-none focus:border-brand-cyan/50"
                            >
                              <option value="a-contacter" className="bg-[oklch(0.22_0.005_260)]">À contacter</option>
                              <option value="en-cours" className="bg-[oklch(0.22_0.005_260)]">En cours</option>
                              <option value="valide" className="bg-[oklch(0.22_0.005_260)]">Validé</option>
                              <option value="annule" className="bg-[oklch(0.22_0.005_260)]">Annulé</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}

          {/* TAB: Offres */}
          {activeTab === 'offres' && (
            <div>
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm text-white/40">Catalogue des offres commerciales</span>
                <button
                  onClick={() => setShowOffreModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-cyan text-[oklch(0.15_0_0)] font-medium rounded-lg text-sm hover:opacity-80 transition"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une offre
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Offre
                      </th>
                      <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Prix / jour (MGA)
                      </th>
                      <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {offres.map((offre) => (
                      <tr key={offre.id} className="hover:bg-white/5 transition">
                        <td className="p-3 font-medium">{offre.nom}</td>
                        <td className="p-3 text-right font-bold text-brand-cyan">
                          {offre.prixParJour.toLocaleString('fr-FR')} MGA
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                            offre.actif 
                              ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                              : 'bg-red-500/15 text-red-400 border-red-500/30'
                          }`}>
                            {offre.actif ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleToggleOffre(offre.id)}
                              className={`p-1.5 rounded-lg transition ${
                                offre.actif 
                                  ? 'hover:bg-red-500/20 text-red-400/60' 
                                  : 'hover:bg-green-500/20 text-green-400/60'
                              }`}
                              title={offre.actif ? 'Désactiver' : 'Activer'}
                            >
                              {offre.actif ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDeleteOffre(offre.id)}
                              className="p-1.5 hover:bg-red-500/20 rounded-lg transition text-red-400/60"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            {activeTab === 'demandes' ? (
              <>
                <span>{filteredDemandes.length} demandes</span>
                <span>·</span>
                <span className="text-amber-400">{filteredDemandes.filter(d => d.statut === 'a-contacter').length} à contacter</span>
                <span>·</span>
                <span className="text-blue-400">{filteredDemandes.filter(d => d.statut === 'en-cours').length} en cours</span>
                <span>·</span>
                <span className="text-brand-green">{filteredDemandes.filter(d => d.statut === 'valide').length} validées</span>
                <span>·</span>
                <span className="text-red-400">{filteredDemandes.filter(d => d.statut === 'annule').length} annulées</span>
                <span className="ml-auto">
                  Montant total devis: <b className="text-brand-cyan">{stats.totalDevis.toLocaleString('fr-FR')} MGA</b>
                </span>
              </>
            ) : (
              <>
                <span>{offres.length} offres</span>
                <span>·</span>
                <span className="text-brand-green">{offres.filter(o => o.actif).length} actives</span>
                <span>·</span>
                <span className="text-red-400">{offres.filter(o => !o.actif).length} inactives</span>
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
              Prix des services en Ariary <b>en attente de confirmation</b> par l'équipe Coloc'KOO. 
              Mention légale CNAPS / OSTIE rappelée à la validation. Les offres commerciales sont 
              modifiables par le super admin.
            </div>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedDemande && (
        <DemandeDetailsModal
          demande={selectedDemande}
          onClose={() => setSelectedDemande(null)}
          onUpdate={handleUpdateDemande}
        />
      )}

      {/* Modale d'ajout d'offre */}
      {showOffreModal && (
        <OffreModal
          onClose={() => setShowOffreModal(false)}
          onSave={handleAddOffre}
        />
      )}
    </AdminLayout>
  )
}