import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  RefreshCw,
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Info,
  FileSignature,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Plus,
  Save,
  X,
  Printer,
  Send,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  FileCheck,
  FileX,
  ClipboardCheck,
  ClipboardX
} from 'lucide-react'

// Types
interface DocumentDemande {
  id: string
  type: 'contrat' | 'edl'
  sousType: string
  bien: string
  dateCreation: string
  dateDemande: string
  statut: 'a-emettre' | 'a-planifier' | 'emis' | 'signe' | 'en-attente'
  montant: number
  parties: Partie[]
  note?: string
  dateEmission?: string
  dateSignature?: string
}

interface Partie {
  nom: string
  role: string
  cin?: string
  telephone?: string
  email?: string
  comment?: string
}

// Données mockées
const MOCK_DOCUMENTS: DocumentDemande[] = [
  {
    id: 'CTR-0142',
    type: 'contrat',
    sousType: 'Contrat de colocation',
    bien: 'Coloc 3 ch. — Analakely',
    dateCreation: '2026-06-15',
    dateDemande: 'il y a 2 h',
    statut: 'a-emettre',
    montant: 120000,
    parties: [
      { 
        nom: 'Naina B.', 
        role: 'Propriétaire', 
        cin: '201 012 345 678', 
        telephone: '+261 34 12 345 67', 
        email: 'naina.b@email.mg' 
      },
      { 
        nom: 'Rivo A.', 
        role: 'Colocataire', 
        cin: '', 
        telephone: '+261 33 98 765 43', 
        email: '' 
      },
      { 
        nom: 'Tahiana R.', 
        role: 'Colocataire', 
        cin: '', 
        telephone: '', 
        email: 'tahiana.r@email.mg' 
      }
    ],
    note: 'En attente des CIN des colocataires'
  },
  {
    id: 'EDL-0098',
    type: 'edl',
    sousType: "État des lieux d'entrée",
    bien: 'Coloc 2 ch. — Ivandry',
    dateCreation: '2026-06-14',
    dateDemande: 'hier',
    statut: 'a-planifier',
    montant: 80000,
    parties: [
      { 
        nom: 'Rivo A.', 
        role: 'Colocataire', 
        cin: '201 099 887 766', 
        telephone: '+261 33 98 765 43', 
        email: 'rivo.a@email.mg' 
      },
      { 
        nom: 'Mamy C.', 
        role: 'Colocataire', 
        cin: '', 
        telephone: '', 
        email: '' 
      }
    ],
    note: 'Visite à planifier avec le propriétaire'
  },
  {
    id: 'CTR-0140',
    type: 'contrat',
    sousType: 'Contrat de colocation',
    bien: 'Coloc 4 ch. — Ankorondrano',
    dateCreation: '2026-06-12',
    dateDemande: 'il y a 3 j',
    statut: 'emis',
    montant: 150000,
    dateEmission: '2026-06-13',
    parties: [
      { 
        nom: 'Faniry T.', 
        role: 'Propriétaire', 
        cin: '201 055 443 322', 
        telephone: '+261 32 11 223 34', 
        email: 'faniry.t@email.mg' 
      },
      { 
        nom: 'Hery R.', 
        role: 'Colocataire', 
        cin: '201 088 776 655', 
        telephone: '+261 34 44 556 67', 
        email: 'hery.r@email.mg' 
      }
    ]
  },
  {
    id: 'EDL-0095',
    type: 'edl',
    sousType: "État des lieux de sortie",
    bien: 'Coloc 3 ch. — 67 Ha',
    dateCreation: '2026-06-10',
    dateDemande: 'il y a 5 j',
    statut: 'signe',
    montant: 80000,
    dateEmission: '2026-06-11',
    dateSignature: '2026-06-14',
    parties: [
      { 
        nom: 'Tahiana R.', 
        role: 'Propriétaire', 
        cin: '201 033 221 144', 
        telephone: '+261 34 55 667 78', 
        email: 'tahiana.r@email.mg' 
      },
      { 
        nom: 'Mamy C.', 
        role: 'Colocataire', 
        cin: '201 077 665 544', 
        telephone: '+261 33 44 556 67', 
        email: 'mamy.c@email.mg' 
      }
    ]
  },
  {
    id: 'CTR-0138',
    type: 'contrat',
    sousType: 'Avenant au contrat',
    bien: 'Coloc 2 ch. — Andoharanofotsy',
    dateCreation: '2026-06-08',
    dateDemande: 'il y a 7 j',
    statut: 'en-attente',
    montant: 50000,
    parties: [
      { 
        nom: 'Rivo A.', 
        role: 'Colocataire', 
        cin: '201 099 887 766', 
        telephone: '+261 33 98 765 43', 
        email: 'rivo.a@email.mg' 
      }
    ],
    note: "En attente de l'accord du propriétaire"
  }
]

// Composant de badge de statut
const StatusBadge = ({ statut }: { statut: DocumentDemande['statut'] }) => {
  const config = {
    'a-emettre': { label: 'À émettre', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: FileX },
    'a-planifier': { label: 'À planifier', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: CalendarIcon },
    'emis': { label: 'Émis', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: FileCheck },
    'signe': { label: 'Signé', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: UserCheck },
    'en-attente': { label: 'En attente', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: Clock }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de badge de type
const TypeBadge = ({ type }: { type: DocumentDemande['type'] }) => {
  const config = {
    'contrat': { label: 'Contrat', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: FileSignature },
    'edl': { label: 'État des lieux', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: ClipboardCheck }
  }
  const { label, className, icon: Icon } = config[type]
  
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de modale de détails
const DocumentDetailsModal = ({
  document,
  onClose,
  onUpdate
}: {
  document: DocumentDemande
  onClose: () => void
  onUpdate: (id: string, updates: Partial<DocumentDemande>) => void
}) => {
  const [note, setNote] = useState(document.note || '')

  // Vérifier si toutes les coordonnées sont renseignées
  const getCoordonneesManquantes = () => {
    const manquantes: { nom: string; champ: string }[] = []
    document.parties.forEach(p => {
      if (!p.cin) manquantes.push({ nom: p.nom, champ: 'CIN' })
      if (!p.telephone) manquantes.push({ nom: p.nom, champ: 'Téléphone' })
      if (!p.email) manquantes.push({ nom: p.nom, champ: 'Email' })
    })
    return manquantes
  }

  const manquantes = getCoordonneesManquantes()
  const estComplet = manquantes.length === 0

  const handleSave = () => {
    onUpdate(document.id, { note })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold">{document.id}</h3>
              <StatusBadge statut={document.statut} />
              <TypeBadge type={document.type} />
            </div>
            <p className="text-white/50 text-sm mt-1">{document.sousType} · {document.bien}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white/5 rounded-lg p-3">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Création</div>
              <div className="font-medium">{document.dateCreation}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Demande</div>
              <div className="font-medium">{document.dateDemande}</div>
            </div>
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider">Montant</div>
              <div className="font-bold text-brand-cyan">{document.montant.toLocaleString('fr-FR')} MGA</div>
            </div>
          </div>

          {document.dateEmission && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">Date d'émission</div>
              <div className="font-medium">{document.dateEmission}</div>
            </div>
          )}

          {document.dateSignature && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="text-white/40 text-xs uppercase tracking-wider">Date de signature</div>
              <div className="font-medium">{document.dateSignature}</div>
            </div>
          )}

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Parties</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Nom</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Rôle</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">N° CIN</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Téléphone</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Email</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {document.parties.map((p, idx) => {
                    const manque = []
                    if (!p.cin) manque.push('CIN')
                    if (!p.telephone) manque.push('Tél.')
                    if (!p.email) manque.push('Email')
                    
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{p.nom}</td>
                        <td className="p-2 text-white/60">{p.role}</td>
                        <td className="p-2">{p.cin || <span className="text-red-400">—</span>}</td>
                        <td className="p-2">{p.telephone || <span className="text-red-400">—</span>}</td>
                        <td className="p-2">{p.email || <span className="text-red-400">—</span>}</td>
                        <td className="p-2">
                          {manque.length === 0 ? (
                            <span className="text-[10px] text-green-400 font-medium">✓ Complet</span>
                          ) : (
                            <span className="text-[10px] text-red-400 font-medium">
                              Manque: {manque.join(', ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {estComplet ? (
              <div className="mt-2 text-xs text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Toutes les coordonnées sont renseignées
              </div>
            ) : (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {manquantes.length} donnée(s) manquante(s) — à récupérer en messagerie
              </div>
            )}
          </div>

          <div>
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Note de suivi</div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajouter une note..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 resize-none"
              rows={2}
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex flex-wrap gap-2">
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold rounded-lg hover:opacity-80 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
          {document.statut !== 'emis' && document.statut !== 'signe' && estComplet && (
            <button 
              onClick={() => {
                onUpdate(document.id, { 
                  statut: document.type === 'contrat' ? 'emis' : 'a-planifier',
                  dateEmission: new Date().toISOString().split('T')[0]
                })
                onClose()
              }}
              className="px-4 py-2 bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-lg hover:bg-brand-green/25 transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {document.type === 'contrat' ? 'Émettre le contrat' : 'Planifier EDL'}
            </button>
          )}
          {document.statut === 'emis' && (
            <button 
              onClick={() => {
                onUpdate(document.id, { 
                  statut: 'signe',
                  dateSignature: new Date().toISOString().split('T')[0]
                })
                onClose()
              }}
              className="px-4 py-2 bg-brand-green/15 text-brand-green border border-brand-green/30 rounded-lg hover:bg-brand-green/25 transition flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Marquer comme signé
            </button>
          )}
          <button 
            onClick={() => {
              alert(`Envoi du document ${document.id} à tous les destinataires (${document.parties.filter(p => p.email).length} email(s))`)
            }}
            className="px-4 py-2 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/25 transition flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Envoyer à tous
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition text-white/60 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminContratsEDL() {
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('tous')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [selectedDocument, setSelectedDocument] = useState<DocumentDemande | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'dateCreation' | 'id' | 'montant'>('dateCreation')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Types et statuts pour les filtres
  const types = useMemo(() => {
    const unique = new Set(documents.map(d => d.type))
    return ['tous', ...Array.from(unique)]
  }, [documents])

  const statuts = useMemo(() => {
    const unique = new Set(documents.map(d => d.statut))
    return ['tous', ...Array.from(unique)]
  }, [documents])

  // Filtrer et trier les documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.id.toLowerCase().includes(query) ||
        d.bien.toLowerCase().includes(query) ||
        d.sousType.toLowerCase().includes(query) ||
        d.parties.some(p => p.nom.toLowerCase().includes(query))
      )
    }

    if (filterType !== 'tous') {
      filtered = filtered.filter(d => d.type === filterType)
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
  }, [documents, searchQuery, filterType, filterStatut, sortField, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    const total = documents.length
    const contrats = documents.filter(d => d.type === 'contrat').length
    const edl = documents.filter(d => d.type === 'edl').length
    const aEmettre = documents.filter(d => d.statut === 'a-emettre').length
    const aPlanifier = documents.filter(d => d.statut === 'a-planifier').length
    const emis = documents.filter(d => d.statut === 'emis').length
    const signe = documents.filter(d => d.statut === 'signe').length
    const enAttente = documents.filter(d => d.statut === 'en-attente').length
    
    const totalMontant = documents.reduce((sum, d) => sum + d.montant, 0)
    
    return {
      total,
      contrats,
      edl,
      aEmettre,
      aPlanifier,
      emis,
      signe,
      enAttente,
      totalMontant
    }
  }, [documents])

  // Toggle de tri
  const handleSort = (field: 'dateCreation' | 'id' | 'montant') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: 'dateCreation' | 'id' | 'montant') => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  // Mettre à jour un document
  const handleUpdateDocument = (id: string, updates: Partial<DocumentDemande>) => {
    const index = documents.findIndex(d => d.id === id)
    if (index === -1) return
    
    const updatedDocuments = [...documents]
    updatedDocuments[index] = {
      ...updatedDocuments[index],
      ...updates
    }
    setDocuments(updatedDocuments)
    
    const statutLabels = {
      'a-emettre': 'À émettre',
      'a-planifier': 'À planifier',
      'emis': 'Émis',
      'signe': 'Signé',
      'en-attente': 'En attente'
    }
    
    if (updates.statut) {
      setSuccessMessage(`Document ${id} mis à jour : ${statutLabels[updates.statut as keyof typeof statutLabels]}`)
    } else {
      setSuccessMessage(`Document ${id} mis à jour avec succès`)
    }
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Actualiser les données
  const handleRefresh = () => {
    setDocuments(MOCK_DOCUMENTS)
    setSuccessMessage('Données actualisées')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Traduire le type
  const translateType = (type: string) => {
    return type === 'contrat' ? 'Contrat' : 'État des lieux'
  }

  // Traduire le statut
  const translateStatut = (statut: string) => {
    const labels = {
      'a-emettre': 'À émettre',
      'a-planifier': 'À planifier',
      'emis': 'Émis',
      'signe': 'Signé',
      'en-attente': 'En attente'
    }
    return labels[statut as keyof typeof labels] || statut
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Contrats &amp; états des lieux</h1>
            <p className="text-white/50 text-sm">
              {stats.total} documents · {stats.contrats} contrats · {stats.edl} EDL · {stats.aEmettre} à émettre
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
            <div className="text-xs text-white/40">Total</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.contrats}</div>
            <div className="text-xs text-white/40">Contrats</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{stats.edl}</div>
            <div className="text-xs text-white/40">EDL</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.aEmettre + stats.aPlanifier}</div>
            <div className="text-xs text-white/40">À traiter</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.signe}</div>
            <div className="text-xs text-white/40">Signés</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.totalMontant.toLocaleString('fr-FR')}</div>
            <div className="text-xs text-white/40">Montant total</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un document..."
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
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les types</option>
                  <option value="contrat" className="bg-[oklch(0.22_0.005_260)]">Contrats</option>
                  <option value="edl" className="bg-[oklch(0.22_0.005_260)]">États des lieux</option>
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="a-emettre" className="bg-[oklch(0.22_0.005_260)]">À émettre</option>
                  <option value="a-planifier" className="bg-[oklch(0.22_0.005_260)]">À planifier</option>
                  <option value="emis" className="bg-[oklch(0.22_0.005_260)]">Émis</option>
                  <option value="signe" className="bg-[oklch(0.22_0.005_260)]">Signé</option>
                  <option value="en-attente" className="bg-[oklch(0.22_0.005_260)]">En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Liste des documents */}
          <div className="divide-y divide-white/5">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucun document trouvé</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="p-4 hover:bg-white/5 transition cursor-pointer"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icône */}
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      doc.type === 'contrat' 
                        ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                        : 'bg-green-500/10 border-green-500/20 text-green-400'
                    }`}>
                      {doc.type === 'contrat' ? (
                        <FileSignature className="w-4 h-4" />
                      ) : (
                        <ClipboardCheck className="w-4 h-4" />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold">{doc.id}</h3>
                        <span className="text-white/30 text-xs">·</span>
                        <span className="text-white/50 text-sm">{doc.sousType}</span>
                        <TypeBadge type={doc.type} />
                        <StatusBadge statut={doc.statut} />
                      </div>
                      <p className="text-sm text-white/60 mt-1">{doc.bien}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-white/40 flex-wrap">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {doc.dateCreation}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {doc.parties.length} partie(s)
                        </span>
                        <span className="flex items-center gap-1 text-brand-cyan">
                          <DollarSign className="w-3 h-3" />
                          {doc.montant.toLocaleString('fr-FR')} MGA
                        </span>
                        {doc.dateEmission && (
                          <span className="flex items-center gap-1 text-purple-400">
                            <Send className="w-3 h-3" />
                            Émis le {doc.dateEmission}
                          </span>
                        )}
                        {doc.dateSignature && (
                          <span className="flex items-center gap-1 text-green-400">
                            <UserCheck className="w-3 h-3" />
                            Signé le {doc.dateSignature}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Badge coordonnées */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.parties.some(p => !p.cin || !p.telephone || !p.email) ? (
                        <span className="text-[10px] text-red-400 font-medium px-2 py-1 rounded-full border border-red-500/30 bg-red-500/10">
                          <AlertCircle className="w-3 h-3 inline mr-1" />
                          Données manquantes
                        </span>
                      ) : (
                        <span className="text-[10px] text-green-400 font-medium px-2 py-1 rounded-full border border-green-500/30 bg-green-500/10">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Complet
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>{filteredDocuments.length} documents</span>
            <span>·</span>
            <span className="text-purple-400">{filteredDocuments.filter(d => d.type === 'contrat').length} contrats</span>
            <span>·</span>
            <span className="text-green-400">{filteredDocuments.filter(d => d.type === 'edl').length} EDL</span>
            <span>·</span>
            <span className="text-amber-400">{filteredDocuments.filter(d => d.statut === 'a-emettre' || d.statut === 'a-planifier').length} à traiter</span>
            <span>·</span>
            <span className="text-brand-green">{filteredDocuments.filter(d => d.statut === 'signe').length} signés</span>
            <span className="ml-auto">
              Montant total: <b className="text-brand-cyan">{stats.totalMontant.toLocaleString('fr-FR')} MGA</b>
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/40">
              Certaines données (noms, N° CIN, coordonnées) sont à récupérer dans la messagerie échangée avec les parties. 
              Une coordonnée manquante bloque l'émission du document. Cliquez sur un document pour voir les détails.
            </div>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onUpdate={handleUpdateDocument}
        />
      )}
    </AdminLayout>
  )
}