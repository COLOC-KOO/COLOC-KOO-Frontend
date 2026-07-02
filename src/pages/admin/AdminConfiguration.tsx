import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  Settings,
  Globe,
  Flag,
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Edit,
  Save,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Copy,
  Download,
  Upload,
  Database,
  Server,
  Cloud,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  Languages,
  DollarSign,
  Percent,
  Calendar,
  Users,
  Building2,
  Mail,
  Bell,
  Zap,
  ShieldCheck,
  Key,
  Fingerprint,
  QrCode,
  Scan,
  AlertTriangle,
  Info,
  HelpCircle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Moon,
  Sun,
  Palette,
  Sliders,
  Gauge,
  Activity,
  Cpu,
  HardDrive,
  Network,
  ArrowUpDown
} from 'lucide-react'

// Types
interface FlagConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'général' | 'paiement' | 'internationalisation' | 'modération'
  lastModified?: string
}

interface Constante {
  id: string
  key: string
  value: string | number
  description: string
  category: 'annonce' | 'colocation' | 'partenaire' | 'modération' | 'général'
  editable: boolean
}

interface Langue {
  code: string
  name: string
  nativeName: string
  status: 'référence' | 'complet' | 'partiel' | 'stub'
  progress: number
  lastUpdated?: string
}

// Données mockées
const MOCK_FLAGS: FlagConfig[] = [
  {
    id: 'F-001',
    name: 'LAUNCH_FREE',
    description: 'Gratuité colocataires au lancement',
    enabled: true,
    category: 'général',
    lastModified: '2026-06-01'
  },
  {
    id: 'F-002',
    name: 'LITE_MODE',
    description: 'Mode basse connexion (public)',
    enabled: true,
    category: 'général',
    lastModified: '2026-06-10'
  },
  {
    id: 'F-003',
    name: 'PAIEMENT_OM_MVOLA',
    description: 'Orange Money / MVOLA - "Bientôt disponible"',
    enabled: false,
    category: 'paiement',
    lastModified: '2026-06-05'
  },
  {
    id: 'F-004',
    name: 'MODERATION_AUTO',
    description: 'Validation automatique après 1h sans action',
    enabled: true,
    category: 'modération',
    lastModified: '2026-06-15'
  },    
  {
    id: 'F-005',
    name: 'PARTENAIRE_VISIBILITY',
    description: 'Visibilité cumulative des partenaires',
    enabled: true,
    category: 'partenaire',
    lastModified: '2026-06-12'
  },
  {
    id: 'F-006',
    name: 'MOBILE_FIRST',
    description: 'Priorité au design mobile',
    enabled: true,
    category: 'général',
    lastModified: '2026-06-08'
  },
  {
    id: 'F-007',
    name: 'I18N_MG',
    description: 'Internationalisation Malagasy',
    enabled: false,
    category: 'internationalisation',
    lastModified: '2026-06-14'
  },
  {
    id: 'F-008',
    name: 'I18N_EN',
    description: 'Internationalisation Anglais',
    enabled: false,
    category: 'internationalisation',
    lastModified: '2026-06-14'
  }
]

const MOCK_CONSTANTES: Constante[] = [
  {
    id: 'C-001',
    key: 'DUREE_ANNONCE_STANDARD',
    value: 2,
    description: 'Durée de validité d\'une annonce standard (mois)',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-002',
    key: 'DUREE_ANNONCE_PARTENAIRE',
    value: 4,
    description: 'Durée de validité d\'une annonce partenaire (mois)',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-003',
    key: 'RAPPEL_RENOUVELLEMENT',
    value: 7,
    description: 'Rappel de renouvellement avant expiration (jours)',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-004',
    key: 'RETENTION_TEXTE',
    value: 5,
    description: 'Rétention des textes des annonces (années)',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-005',
    key: 'RETENTION_IMAGES',
    value: 1,
    description: 'Rétention des images des annonces (années)',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-006',
    key: 'PHOTOS_MAX',
    value: 3,
    description: 'Nombre maximum de photos par annonce',
    category: 'annonce',
    editable: true
  },
  {
    id: 'C-007',
    key: 'CHAMBRES_MIN',
    value: 2,
    description: 'Nombre minimum de chambres pour une colocation',
    category: 'colocation',
    editable: true
  },
  {
    id: 'C-008',
    key: 'VALIDATION_AUTO_DELAI',
    value: 60,
    description: 'Délai avant validation automatique sans modération (minutes)',
    category: 'modération',
    editable: true
  },
  {
    id: 'C-009',
    key: 'SIGNALEMENTS_MAX',
    value: 3,
    description: 'Nombre de signalements avant suspension recommandée',
    category: 'modération',
    editable: true
  },
  {
    id: 'C-010',
    key: 'SUSPENSION_DUREE',
    value: 10,
    description: 'Durée de suspension par défaut (jours)',
    category: 'modération',
    editable: true
  },
  {
    id: 'C-011',
    key: 'PARTENAIRE_NIVEAUX',
    value: 4,
    description: 'Nombre de niveaux de partenariat',
    category: 'partenaire',
    editable: false
  },
  {
    id: 'C-012',
    key: 'CACHE_DUREE',
    value: 3600,
    description: 'Durée de cache des pages (secondes)',
    category: 'général',
    editable: true
  }
]

const MOCK_LANGUES: Langue[] = [
  {
    code: 'FR',
    name: 'Français',
    nativeName: 'Français',
    status: 'référence',
    progress: 100,
    lastUpdated: '2026-06-15'
  },
  {
    code: 'MG',
    name: 'Malagasy',
    nativeName: 'Malagasy',
    status: 'partiel',
    progress: 45,
    lastUpdated: '2026-06-10'
  },
  {
    code: 'EN',
    name: 'English',
    nativeName: 'English',
    status: 'stub',
    progress: 15,
    lastUpdated: '2026-06-05'
  }
]

// Composant de badge de statut
const StatusBadge = ({ status }: { status: Langue['status'] }) => {
  const config = {
    'référence': { label: 'Référence', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'complet': { label: 'Complet', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'partiel': { label: 'Partiel', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: AlertCircle },
    'stub': { label: 'Stub', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle }
  }
  const { label, className, icon: Icon } = config[status]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de toggle switch
const ToggleSwitch = ({ 
  enabled, 
  onChange, 
  label,
  description 
}: { 
  enabled: boolean
  onChange: () => void
  label?: string
  description?: string
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {label && <div className="font-medium text-sm">{label}</div>}
        {description && <div className="text-xs text-white/40">{description}</div>}
      </div>
      <button
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
          enabled ? 'bg-brand-cyan' : 'bg-white/20'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 ${
            enabled ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

// Composant de modale d'édition de constante
const ConstanteEditModal = ({
  constante,
  onClose,
  onSave
}: {
  constante: Constante
  onClose: () => void
  onSave: (id: string, value: string | number) => void
}) => {
  const [value, setValue] = useState(constante.value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(constante.id, value)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-xl font-bold">Modifier la constante</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">Clé</label>
            <div className="text-sm font-mono bg-white/5 px-3 py-2 rounded-lg">{constante.key}</div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Description</label>
            <div className="text-sm text-white/70">{constante.description}</div>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">Valeur</label>
            <input
              type={typeof constante.value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => setValue(typeof constante.value === 'number' ? parseFloat(e.target.value) : e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-brand-cyan/50"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-brand-cyan text-[oklch(0.15_0_0)] font-bold px-4 py-2 rounded-lg hover:opacity-80 transition">
              <Save className="w-4 h-4 inline mr-2" />
              Enregistrer
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
export default function AdminConfiguration() {
  const [flags, setFlags] = useState(MOCK_FLAGS)
  const [constantes, setConstantes] = useState(MOCK_CONSTANTES)
  const [langues, setLangues] = useState(MOCK_LANGUES)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('tous')
  const [activeTab, setActiveTab] = useState<'flags' | 'constantes' | 'langues'>('flags')
  const [editingConstante, setEditingConstante] = useState<Constante | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'name' | 'category' | 'enabled'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Catégories uniques pour le filtre
  const categories = useMemo(() => {
    const unique = new Set(flags.map(f => f.category))
    return ['tous', ...Array.from(unique)]
  }, [flags])

  // Filtrer les flags
  const filteredFlags = useMemo(() => {
    let filtered = flags

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query)
      )
    }

    if (filterCategory !== 'tous') {
      filtered = filtered.filter(f => f.category === filterCategory)
    }

    filtered = filtered.sort((a, b) => {
      if (sortField === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name)
      }
      if (sortField === 'category') {
        return sortOrder === 'desc' 
          ? b.category.localeCompare(a.category) 
          : a.category.localeCompare(b.category)
      }
      return sortOrder === 'desc' 
        ? (b.enabled ? 1 : 0) - (a.enabled ? 1 : 0)
        : (a.enabled ? 1 : 0) - (b.enabled ? 1 : 0)
    })

    return filtered
  }, [flags, searchQuery, filterCategory, sortField, sortOrder])

  // Filtrer les constantes
  const filteredConstantes = useMemo(() => {
    let filtered = constantes

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.key.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      )
    }

    if (filterCategory !== 'tous') {
      filtered = filtered.filter(c => c.category === filterCategory)
    }

    return filtered
  }, [constantes, searchQuery, filterCategory])

  // Toggle de tri
  const handleSort = (field: 'name' | 'category' | 'enabled') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Obtenir l'icône de tri
  const getSortIcon = (field: 'name' | 'category' | 'enabled') => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  // Toggle flag
  const toggleFlag = (id: string) => {
    const index = flags.findIndex(f => f.id === id)
    if (index === -1) return
    
    const updatedFlags = [...flags]
    updatedFlags[index] = {
      ...updatedFlags[index],
      enabled: !updatedFlags[index].enabled,
      lastModified: new Date().toISOString().split('T')[0]
    }
    setFlags(updatedFlags)
    setSuccessMessage(`Flag ${updatedFlags[index].name} ${updatedFlags[index].enabled ? 'activé' : 'désactivé'}`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Modifier une constante
  const handleEditConstante = (id: string, value: string | number) => {
    const index = constantes.findIndex(c => c.id === id)
    if (index === -1) return
    
    const updatedConstantes = [...constantes]
    updatedConstantes[index] = {
      ...updatedConstantes[index],
      value
    }
    setConstantes(updatedConstantes)
    setEditingConstante(null)
    setSuccessMessage(`Constante ${updatedConstantes[index].key} mise à jour`)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    const icons = {
      'général': Globe,
      'paiement': DollarSign,
      'internationalisation': Languages,
      'modération': Shield,
      'annonce': Database,
      'colocation': Users,
      'partenaire': Building2
    }
    const Icon = icons[category as keyof typeof icons] || Info
    return <Icon className="w-3 h-3" />
  }

  // Obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    const colors = {
      'général': 'text-blue-400',
      'paiement': 'text-green-400',
      'internationalisation': 'text-purple-400',
      'modération': 'text-red-400',
      'annonce': 'text-amber-400',
      'colocation': 'text-cyan-400',
      'partenaire': 'text-pink-400'
    }
    return colors[category as keyof typeof colors] || 'text-white/40'
  }

  // Traduire les catégories
  const translateCategory = (category: string) => {
    const translations = {
      'général': 'Général',
      'paiement': 'Paiement',
      'internationalisation': 'Internationalisation',
      'modération': 'Modération',
      'annonce': 'Annonce',
      'colocation': 'Colocation',
      'partenaire': 'Partenaire'
    }
    return translations[category as keyof typeof translations] || category
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Configuration globale</h1>
            <p className="text-white/50 text-sm">
              Flags, constantes et internationalisation
            </p>
          </div>
          <button 
            onClick={() => {
              setFlags(MOCK_FLAGS)
              setConstantes(MOCK_CONSTANTES)
              setLangues(MOCK_LANGUES)
              setSuccessMessage('Configuration réinitialisée')
              setTimeout(() => setSuccessMessage(null), 3000)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm text-white/60"
          >
            <RefreshCw className="w-4 h-4" />
            Réinitialiser
          </button>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* Onglets */}
        <div className="flex flex-wrap gap-1 border-b border-white/10 pb-0">
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
              activeTab === 'flags'
                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flag className="w-4 h-4 inline mr-2" />
            Flags
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{flags.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('constantes')}
            className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
              activeTab === 'constantes'
                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-4 h-4 inline mr-2" />
            Constantes
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{constantes.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('langues')}
            className={`px-4 py-2.5 text-sm font-medium transition rounded-t-lg ${
              activeTab === 'langues'
                ? 'bg-[oklch(0.22_0.005_260)] text-brand-cyan border-b-2 border-brand-cyan'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Languages className="w-4 h-4 inline mr-2" />
            Internationalisation
            <span className="ml-2 text-xs bg-white/10 px-2 py-0.5 rounded-full">{langues.length}</span>
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          
          {/* TAB: Flags */}
          {activeTab === 'flags' && (
            <>
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      placeholder="Rechercher un flag..."
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
                  <div className="flex gap-2 ml-auto flex-wrap">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-[oklch(0.22_0.005_260)]">
                          {cat === 'tous' ? 'Toutes les catégories' : translateCategory(cat)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-white/5">
                {filteredFlags.length === 0 ? (
                  <div className="text-center py-12 text-white/40">
                    <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun flag trouvé</p>
                  </div>
                ) : (
                  filteredFlags.map((flag) => (
                    <div key={flag.id} className="p-4 hover:bg-white/5 transition">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-mono font-semibold">{flag.name}</span>
                            <span className={`text-xs flex items-center gap-1 ${getCategoryColor(flag.category)}`}>
                              {getCategoryIcon(flag.category)}
                              {translateCategory(flag.category)}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              flag.enabled 
                                ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                                : 'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}>
                              {flag.enabled ? 'Activé' : 'Désactivé'}
                            </span>
                          </div>
                          <p className="text-sm text-white/60 mt-1">{flag.description}</p>
                          {flag.lastModified && (
                            <div className="text-xs text-white/30 mt-1">
                              Modifié le {flag.lastModified}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <ToggleSwitch
                            enabled={flag.enabled}
                            onChange={() => toggleFlag(flag.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* TAB: Constantes */}
          {activeTab === 'constantes' && (
            <>
              <div className="p-4 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                    <Search className="w-4 h-4 text-white/40" />
                    <input
                      placeholder="Rechercher une constante..."
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
                  <div className="flex gap-2 ml-auto flex-wrap">
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                    >
                      <option value="tous">Toutes les catégories</option>
                      <option value="annonce" className="bg-[oklch(0.22_0.005_260)]">Annonce</option>
                      <option value="colocation" className="bg-[oklch(0.22_0.005_260)]">Colocation</option>
                      <option value="partenaire" className="bg-[oklch(0.22_0.005_260)]">Partenaire</option>
                      <option value="modération" className="bg-[oklch(0.22_0.005_260)]">Modération</option>
                      <option value="général" className="bg-[oklch(0.22_0.005_260)]">Général</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Clé
                      </th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Description
                      </th>
                      <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Valeur
                      </th>
                      <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredConstantes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-white/40">
                          <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Aucune constante trouvée</p>
                        </td>
                      </tr>
                    ) : (
                      filteredConstantes.map((c) => (
                        <tr key={c.id} className="hover:bg-white/5 transition">
                          <td className="p-3 font-mono text-xs">{c.key}</td>
                          <td className="p-3 text-white/60">{c.description}</td>
                          <td className="p-3">
                            <span className={`text-xs flex items-center gap-1 ${getCategoryColor(c.category)}`}>
                              {getCategoryIcon(c.category)}
                              {translateCategory(c.category)}
                            </span>
                          </td>
                          <td className="p-3 text-right font-medium">{c.value}</td>
                          <td className="p-3 text-center">
                            {c.editable ? (
                              <button 
                                onClick={() => setEditingConstante(c)}
                                className="p-1.5 hover:bg-white/10 rounded-lg transition"
                              >
                                <Edit className="w-4 h-4 text-white/40" />
                              </button>
                            ) : (
                              <span className="text-xs text-white/30">Lecture seule</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* TAB: Langues */}
          {activeTab === 'langues' && (
            <div className="divide-y divide-white/5">
              {langues.map((langue) => (
                <div key={langue.code} className="p-4 hover:bg-white/5 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                        {langue.code}
                      </div>
                      <div>
                        <div className="font-semibold">{langue.name}</div>
                        <div className="text-white/40 text-sm">{langue.nativeName}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <StatusBadge status={langue.status} />
                      <div className="flex items-center gap-2">
                        <div className="w-24 sm:w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-brand-cyan to-brand-green"
                            style={{ width: `${langue.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-white/40">{langue.progress}%</span>
                      </div>
                      {langue.lastUpdated && (
                        <span className="text-xs text-white/30">
                          Mis à jour le {langue.lastUpdated}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>
              {activeTab === 'flags' && `${filteredFlags.length} flags`}
              {activeTab === 'constantes' && `${filteredConstantes.length} constantes`}
              {activeTab === 'langues' && `${langues.length} langues`}
            </span>
            <span>·</span>
            <span>Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</span>
          </div>
        </div>
      </div>

      {/* Modale d'édition de constante */}
      {editingConstante && (
        <ConstanteEditModal
          constante={editingConstante}
          onClose={() => setEditingConstante(null)}
          onSave={handleEditConstante}
        />
      )}
    </AdminLayout>
  )
}