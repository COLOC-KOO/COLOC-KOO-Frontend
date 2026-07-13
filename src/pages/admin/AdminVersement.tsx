import React, { useEffect, useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, ApiPaiement } from '../../lib/api'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Banknote,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  RefreshCw,
  Wallet,
  Smartphone,
  Landmark,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react'

// Types
interface Versement {
  id: string
  emetteur: string
  typeEmetteur: 'particulier' | 'partenaire' | 'agence'
  associeA: string
  reference: string
  canal: 'MVOLA' | 'Orange Money' | 'Airtel Money' | 'Virement bancaire' | 'Especes' | 'CB' | 'Autre'
  date: string
  montantDu: number
  montantRecu: number
  statut: 'a-verifier' | 'conforme' | 'non-conforme' | 'en_attente' | 'valide' | 'echoue'
  commentaire?: string
  dateVerification?: string
  verifiePar?: string
}

// Données mockées
const MOCK_VERSEMENTS: Versement[] = [
  {
    id: 'VST-0312',
    emetteur: 'Naina B.',
    typeEmetteur: 'particulier',
    associeA: 'CTR-0142 (Contrat)',
    reference: 'CTR-0142',
    canal: 'MVOLA',
    date: '2026-06-15',
    montantDu: 120000,
    montantRecu: 120000,
    statut: 'a-verifier',
    commentaire: 'Premier versement pour le contrat'
  },
  {
    id: 'VST-0311',
    emetteur: 'Réseau Tana Immo',
    typeEmetteur: 'partenaire',
    associeA: 'Abonnement partenaire',
    reference: 'PART-045',
    canal: 'Orange Money',
    date: '2026-06-13',
    montantDu: 1250000,
    montantRecu: 1250000,
    statut: 'a-verifier'
  },
  {
    id: 'VST-0310',
    emetteur: 'Naina B.',
    typeEmetteur: 'particulier',
    associeA: 'SVC-217 (Services Coloc\'KOO)',
    reference: 'SVC-217',
    canal: 'MVOLA',
    date: '2026-06-14',
    montantDu: 26400,
    montantRecu: 26400,
    statut: 'a-verifier'
  },
  {
    id: 'VST-0309',
    emetteur: 'Faniry T.',
    typeEmetteur: 'particulier',
    associeA: 'CTR-0140 (Contrat)',
    reference: 'CTR-0140',
    canal: 'MVOLA',
    date: '2026-06-12',
    montantDu: 150000,
    montantRecu: 150000,
    statut: 'conforme',
    dateVerification: '2026-06-12',
    verifiePar: 'Sata L.'
  },
  {
    id: 'VST-0308',
    emetteur: 'Entreprise Vato SA',
    typeEmetteur: 'partenaire',
    associeA: 'Abonnement partenaire',
    reference: 'PART-039',
    canal: 'Orange Money',
    date: '2026-06-08',
    montantDu: 900000,
    montantRecu: 900000,
    statut: 'conforme',
    dateVerification: '2026-06-08',
    verifiePar: 'Koto R.'
  },
  {
    id: 'VST-0307',
    emetteur: 'Rivo A.',
    typeEmetteur: 'particulier',
    associeA: 'EDL-0098 (État des lieux)',
    reference: 'EDL-0098',
    canal: 'Orange Money',
    date: '2026-06-10',
    montantDu: 80000,
    montantRecu: 40000,
    statut: 'non-conforme',
    commentaire: 'Montant partiel reçu, 40000 MGA manquants',
    dateVerification: '2026-06-11',
    verifiePar: 'Sata L.'
  },
  {
    id: 'VST-0291',
    emetteur: 'Telma Madagascar',
    typeEmetteur: 'partenaire',
    associeA: 'Abonnement partenaire',
    reference: 'PART-047',
    canal: 'Orange Money',
    date: '2026-05-20',
    montantDu: 900000,
    montantRecu: 900000,
    statut: 'conforme',
    dateVerification: '2026-05-20',
    verifiePar: 'Koto R.'
  },
  {
    id: 'VST-0288',
    emetteur: 'Naina B.',
    typeEmetteur: 'particulier',
    associeA: 'EDL-0090 (État des lieux)',
    reference: '',
    canal: 'MVOLA',
    date: '2026-05-06',
    montantDu: 80000,
    montantRecu: 80000,
    statut: 'conforme',
    dateVerification: '2026-05-06',
    verifiePar: 'Sata L.'
  },
  {
    id: 'VST-0276',
    emetteur: 'Réseau Tana Immo',
    typeEmetteur: 'partenaire',
    associeA: 'Abonnement partenaire',
    reference: 'PART-045',
    canal: 'MVOLA',
    date: '2026-04-18',
    montantDu: 1250000,
    montantRecu: 1250000,
    statut: 'conforme',
    dateVerification: '2026-04-18',
    verifiePar: 'Koto R.'
  },
  {
    id: 'VST-0255',
    emetteur: 'Faniry T.',
    typeEmetteur: 'particulier',
    associeA: 'CTR-0131 (Contrat)',
    reference: '',
    canal: 'MVOLA',
    date: '2026-03-10',
    montantDu: 150000,
    montantRecu: 150000,
    statut: 'conforme',
    dateVerification: '2026-03-10',
    verifiePar: 'Sata L.'
  },
  {
    id: 'VST-0241',
    emetteur: 'Agence Lalana',
    typeEmetteur: 'agence',
    associeA: 'Abonnement partenaire',
    reference: 'PART-044',
    canal: 'Orange Money',
    date: '2026-02-22',
    montantDu: 450000,
    montantRecu: 450000,
    statut: 'conforme',
    dateVerification: '2026-02-22',
    verifiePar: 'Koto R.'
  },
  {
    id: 'VST-0230',
    emetteur: 'Mamy C.',
    typeEmetteur: 'particulier',
    associeA: 'CTR-0125 (Contrat)',
    reference: '',
    canal: 'Airtel Money',
    date: '2026-01-15',
    montantDu: 120000,
    montantRecu: 0,
    statut: 'en_attente',
    commentaire: 'Paiement non reçu à ce jour'
  }
]

function mapPaiementToVersement(payment: ApiPaiement): Versement {
  const emetteur = [payment.nom, payment.prenom].filter(Boolean).join(' ').trim() || 'Utilisateur'
  const typeEmetteur = payment.id_partenaire ? 'partenaire' : payment.id_contrat ? 'agence' : 'particulier'
  const serviceLabel = payment.service_type === 'contrat' ? 'Contrat' : payment.service_type === 'booster' ? 'Booster' : payment.service_type === 'publicite' ? 'Publicité' : 'Service'
  const associeA = payment.annonce_titre ? `${serviceLabel} · ${payment.annonce_titre}` : `${serviceLabel} · ${payment.reference}`
  return {
    id: String(payment.id_paiement),
    emetteur,
    typeEmetteur,
    associeA,
    reference: payment.reference || '',
    canal: payment.moyen_paiement,
    date: payment.date_paiement,
    montantDu: payment.montant_du,
    montantRecu: payment.montant_recu,
    statut: payment.statut,
    commentaire: payment.reference_operateur || undefined,
  }
}

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: Versement['statut'] }) => {
  const config = {
    'a-verifier': { label: 'À vérifier', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Clock },
    'conforme': { label: 'Conforme', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'non-conforme': { label: 'Non conforme', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle },
    'en_attente': { label: 'En attente', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: AlertCircle },
    'valide': { label: 'Validé', className: 'bg-brand-green/15 text-brand-green border-brand-green/30', icon: CheckCircle },
    'echoue': { label: 'Échoué', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de badge de canal
const CanalBadge = ({ canal }: { canal: Versement['canal'] }) => {
  const config = {
    'MVOLA': { label: 'MVOLA', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    'Orange Money': { label: 'Orange Money', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    'Airtel Money': { label: 'Airtel Money', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    'Virement bancaire': { label: 'Virement bancaire', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    'Especes': { label: 'Espèces', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    'CB': { label: 'CB', className: 'bg-violet-500/15 text-violet-400 border-violet-500/30' },
    'Autre': { label: 'Autre', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' }
  }
  const { label, className } = config[canal]
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${className}`}>
      {canal === 'MVOLA' && <Smartphone className="w-3 h-3" />}
      {canal === 'Orange Money' && <Smartphone className="w-3 h-3" />}
      {canal === 'Airtel Money' && <Smartphone className="w-3 h-3" />}
      {canal === 'Virement bancaire' && <Landmark className="w-3 h-3" />}
      {canal === 'Especes' && <Banknote className="w-3 h-3" />}
      {label}
    </span>
  )
}

// Composant de modale de détails
const VersementDetails = ({ 
  versement, 
  onClose, 
  onValidate 
}: { 
  versement: Versement
  onClose: () => void
  onValidate: (id: string, statut: 'conforme' | 'non-conforme' | 'a-verifier', commentaire?: string) => void
}) => {
  const [commentaire, setCommentaire] = useState(versement.commentaire || '')

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">{versement.id}</h3>
              <StatusBadge statut={versement.statut} />
            </div>
            <p className="text-white/50 text-sm mt-1">
              {versement.emetteur} · {versement.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Détails */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Émetteur</div>
              <div className="font-medium">{versement.emetteur}</div>
              <div className="text-white/40 text-xs capitalize">{versement.typeEmetteur}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Canal</div>
              <CanalBadge canal={versement.canal} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Associé à</div>
              <div className="font-medium">{versement.associeA}</div>
              {versement.reference && (
                <div className="text-white/40 text-xs">Réf: {versement.reference}</div>
              )}
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Date</div>
              <div>{versement.date}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-white/5 rounded-lg">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Montant dû</div>
              <div className="text-2xl font-bold text-white/80">
                {versement.montantDu.toLocaleString('fr-FR')} MGA
              </div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Montant reçu</div>
              <div className={`text-2xl font-bold ${
                versement.montantRecu === versement.montantDu 
                  ? 'text-brand-green' 
                  : versement.montantRecu === 0 
                    ? 'text-red-400' 
                    : 'text-amber-400'
              }`}>
                {versement.montantRecu.toLocaleString('fr-FR')} MGA
              </div>
              {versement.montantRecu !== versement.montantDu && (
                <div className="text-white/40 text-xs">
                  Écart: {(versement.montantDu - versement.montantRecu).toLocaleString('fr-FR')} MGA
                </div>
              )}
            </div>
          </div>

          {versement.dateVerification && (
            <div className="text-xs text-white/40">
              Vérifié le {versement.dateVerification} par {versement.verifiePar}
            </div>
          )}

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Commentaire</div>
            <textarea
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        {versement.statut === 'a-verifier' && (
          <div className="p-4 border-t border-white/10 flex gap-2">
            <button 
              onClick={() => onValidate(versement.id, 'conforme', commentaire)}
              className="flex-1 bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-lg px-4 py-2 font-medium hover:bg-brand-green/25 transition"
            >
              <CheckCircle className="w-4 h-4 inline mr-2" />
              Marquer conforme
            </button>
            <button 
              onClick={() => onValidate(versement.id, 'non-conforme', commentaire)}
              className="flex-1 bg-red-500/15 text-red-400 border border-red-500/30 rounded-lg px-4 py-2 font-medium hover:bg-red-500/25 transition"
            >
              <XCircle className="w-4 h-4 inline mr-2" />
              Non conforme
            </button>
          </div>
        )}
        {versement.statut !== 'a-verifier' && (
          <div className="p-4 border-t border-white/10 flex gap-2">
            <button 
              onClick={() => onValidate(versement.id, 'a-verifier', commentaire)}
              className="flex-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg px-4 py-2 font-medium hover:bg-amber-500/25 transition"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Remettre en vérification
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Composant principal
export default function AdminVersements() {
  const [versements, setVersements] = useState<Versement[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [filterCanal, setFilterCanal] = useState<string>('tous')
  const [filterType, setFilterType] = useState<string>('tous')
  const [selectedVersement, setSelectedVersement] = useState<Versement | null>(null)
  const [sortField, setSortField] = useState<keyof Versement>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Canaux uniques pour le filtre
  const canaux = useMemo(() => {
    const unique = new Set(versements.map(v => v.canal))
    return ['tous', ...Array.from(unique)]
  }, [versements])

  // Types d'émetteurs uniques pour le filtre
  const typesEmetteur = useMemo(() => {
    const unique = new Set(versements.map(v => v.typeEmetteur))
    return ['tous', ...Array.from(unique)]
  }, [versements])

  const loadVersements = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await api.backofficePaiements()
      setVersements(result.map(mapPaiementToVersement))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les paiements')
      setVersements(MOCK_VERSEMENTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersements()
  }, [])

  // Filtrer et trier les versements
  const filteredVersements = useMemo(() => {
    let filtered = versements

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v =>
        v.id.toLowerCase().includes(query) ||
        v.emetteur.toLowerCase().includes(query) ||
        v.associeA.toLowerCase().includes(query) ||
        (v.reference && v.reference.toLowerCase().includes(query))
      )
    }

    // Filtre par statut
    if (filterStatut !== 'tous') {
      filtered = filtered.filter(v => v.statut === filterStatut)
    }

    // Filtre par canal
    if (filterCanal !== 'tous') {
      filtered = filtered.filter(v => v.canal === filterCanal)
    }

    // Filtre par type d'émetteur
    if (filterType !== 'tous') {
      filtered = filtered.filter(v => v.typeEmetteur === filterType)
    }

    // Tri
    filtered = filtered.sort((a, b) => {
      let aVal: any = a[sortField]
      let bVal: any = b[sortField]
      
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (typeof aVal === 'string') {
        return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal)
      }
      
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
    })

    return filtered
  }, [versements, searchQuery, filterStatut, filterCanal, filterType, sortField, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    const total = versements.length
    const aVerifier = versements.filter(v => v.statut === 'a-verifier').length
    const conformes = versements.filter(v => v.statut === 'conforme').length
    const nonConformes = versements.filter(v => v.statut === 'non-conforme').length
    const enAttente = versements.filter(v => v.statut === 'en_attente').length
    
    const totalRecu = versements.reduce((sum, v) => sum + v.montantRecu, 0)
    const totalDu = versements.reduce((sum, v) => sum + v.montantDu, 0)
    const tauxConformite = total > 0 ? Math.round((conformes / total) * 100) : 0
    
    return {
      total,
      aVerifier,
      conformes,
      nonConformes,
      enAttente,
      totalRecu,
      totalDu,
      tauxConformite
    }
  }, [versements])

  // Formatage des montants
  const formatMontant = (montant: number) => {
    return montant.toLocaleString('fr-FR') + ' MGA'
  }

  // Validation d'un versement
  const handleValidate = async (id: string, statut: 'conforme' | 'non-conforme' | 'a-verifier', commentaire?: string) => {
    const index = versements.findIndex(v => v.id === id)
    if (index === -1) return

    const updatedVersements = [...versements]
    const versement = { ...updatedVersements[index] }
    
    versement.statut = statut
    if (commentaire !== undefined) {
      versement.commentaire = commentaire
    }
    if (statut === 'conforme' || statut === 'non-conforme') {
      versement.dateVerification = new Date().toLocaleDateString('fr-FR')
      versement.verifiePar = 'Koto R. (Super Admin)'
    } else {
      versement.dateVerification = undefined
      versement.verifiePar = undefined
    }

    try {
      await api.updatePaiementStatus(id, { statut })
      updatedVersements[index] = versement
      setVersements(updatedVersements)
      setSelectedVersement(null)

      const message = statut === 'conforme' 
        ? 'Versement marqué comme conforme' 
        : statut === 'non-conforme' 
          ? 'Versement marqué comme non conforme'
          : 'Versement remis en vérification'
      setSuccessMessage(message)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le statut du paiement')
    }
  }

  // Toggle de tri
  const handleSort = (field: keyof Versement) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: keyof Versement) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="bebas text-3xl text-white">Versements</h1>
            <p className="text-white/50 text-sm">
              {stats.total} versements · {stats.aVerifier} à vérifier · {stats.conformes} conformes · {stats.nonConformes} non conformes
            </p>
          </div>
          <button 
            onClick={() => loadVersements()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan/25 transition text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Chargement...' : 'Actualiser'}
          </button>
        </div>

        {/* Message d'erreur et succès */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
            <div className="text-xs text-white/40">Total</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.aVerifier}</div>
            <div className="text-xs text-white/40">À vérifier</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.conformes}</div>
            <div className="text-xs text-white/40">Conformes</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.nonConformes}</div>
            <div className="text-xs text-white/40">Non conformes</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{formatMontant(stats.totalRecu)}</div>
            <div className="text-xs text-white/40">Total reçu</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.tauxConformite}%</div>
            <div className="text-xs text-white/40">Taux de conformité</div>
          </div>
        </div>

        {/* Tableau des versements */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          {/* Filtres */}
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un versement..."
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

              {/* Filtres */}
              <div className="flex gap-2 flex-wrap ml-auto">
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="a-verifier" className="bg-[oklch(0.22_0.005_260)]">À vérifier</option>
                  <option value="conforme" className="bg-[oklch(0.22_0.005_260)]">Conforme</option>
                  <option value="non-conforme" className="bg-[oklch(0.22_0.005_260)]">Non conforme</option>
                  <option value="en_attente" className="bg-[oklch(0.22_0.005_260)]">En attente</option>
                  <option value="valide" className="bg-[oklch(0.22_0.005_260)]">Validé</option>
                  <option value="echoue" className="bg-[oklch(0.22_0.005_260)]">Échoué</option>
                </select>

                <select
                  value={filterCanal}
                  onChange={(e) => setFilterCanal(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {canaux.map(canal => (
                    <option key={canal} value={canal} className="bg-[oklch(0.22_0.005_260)]">
                      {canal === 'tous' ? 'Tous les canaux' : canal}
                    </option>
                  ))}
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {typesEmetteur.map(type => (
                    <option key={type} value={type} className="bg-[oklch(0.22_0.005_260)]">
                      {type === 'tous' ? 'Tous les types' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center gap-1">
                      Réf. {getSortIcon('id')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('emetteur')}
                  >
                    <div className="flex items-center gap-1">
                      Émetteur {getSortIcon('emetteur')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('associeA')}
                  >
                    <div className="flex items-center gap-1">
                      Associé à {getSortIcon('associeA')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('canal')}
                  >
                    <div className="flex items-center gap-1">
                      Canal {getSortIcon('canal')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      Date {getSortIcon('date')}
                    </div>
                  </th>
                  <th 
                    className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('montantDu')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Montant dû {getSortIcon('montantDu')}
                    </div>
                  </th>
                  <th 
                    className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('montantRecu')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Montant reçu {getSortIcon('montantRecu')}
                    </div>
                  </th>
                  <th 
                    className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider cursor-pointer hover:text-white/70"
                    onClick={() => handleSort('statut')}
                  >
                    <div className="flex items-center gap-1">
                      Statut {getSortIcon('statut')}
                    </div>
                  </th>
                  <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredVersements.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-white/40">
                      <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Aucun versement trouvé</p>
                    </td>
                  </tr>
                ) : (
                  filteredVersements.map((v) => (
                    <tr 
                      key={v.id} 
                      className="hover:bg-white/5 transition cursor-pointer"
                      onClick={() => setSelectedVersement(v)}
                    >
                      <td className="p-3 font-mono text-xs">{v.id}</td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{v.emetteur}</div>
                          <div className="text-white/40 text-xs capitalize">{v.typeEmetteur}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-sm">{v.associeA}</div>
                        {v.reference && (
                          <div className="text-white/40 text-xs">Réf: {v.reference}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <CanalBadge canal={v.canal} />
                      </td>
                      <td className="p-3 text-white/60">{v.date}</td>
                      <td className="p-3 text-right text-white/60">
                        {v.montantDu.toLocaleString('fr-FR')}
                      </td>
                      <td className={`p-3 text-right font-medium ${
                        v.montantRecu === v.montantDu 
                          ? 'text-brand-green' 
                          : v.montantRecu === 0 
                            ? 'text-red-400' 
                            : 'text-amber-400'
                      }`}>
                        {v.montantRecu.toLocaleString('fr-FR')}
                      </td>
                      <td className="p-3">
                        <StatusBadge statut={v.statut} />
                      </td>
                      <td className="p-3 text-center">
                        <button 
                          className="p-1.5 hover:bg-white/10 rounded-lg transition"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedVersement(v)
                          }}
                        >
                          <Eye className="w-4 h-4 text-white/40" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>Total: {filteredVersements.length} versements</span>
            <span>·</span>
            <span>Montant total: {formatMontant(filteredVersements.reduce((sum, v) => sum + v.montantRecu, 0))}</span>
            <span>·</span>
            <span>Conformité: {filteredVersements.length > 0 
              ? Math.round((filteredVersements.filter(v => v.statut === 'conforme').length / filteredVersements.length) * 100) 
              : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedVersement && (
        <VersementDetails 
          versement={selectedVersement}
          onClose={() => setSelectedVersement(null)}
          onValidate={handleValidate}
        />
      )}
    </AdminLayout>
  )
}