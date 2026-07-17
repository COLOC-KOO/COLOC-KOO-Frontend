import React, { useEffect, useState, useMemo } from 'react'
import { api } from '../../lib/api'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  Settings,
  Globe,
  Flag,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Save,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Database,
  Languages,
  DollarSign,
  Users,
  Building2,
  Info,
  Sliders,
  ArrowUpDown,
  X
} from 'lucide-react'

// ===== TYPES =====
interface FlagConfig {
  id: string
  name: string
  description: string
  enabled: boolean
  category: 'général' | 'paiement' | 'internationalisation' | 'modération' | 'partenaire'
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

interface ConfigurationItem {
  id_configuration?: number
  cle: string
  valeur: any
  date_modification?: string
}

// Type pour les constantes sans valeur
type ConstanteSansValeur = Omit<Constante, 'value'>

// ===== COMPOSANTS =====

// Badge de statut
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

// Toggle switch
const ToggleSwitch = ({ 
  enabled, 
  onChange
}: { 
  enabled: boolean
  onChange: () => void
}) => {
  return (
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
  )
}

// ===== COMPOSANT PRINCIPAL =====
export default function AdminConfiguration() {
  const [flags, setFlags] = useState<FlagConfig[]>([])
  const [constantes, setConstantes] = useState<Constante[]>([])
  const [langues, setLangues] = useState<Langue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('tous')
  const [activeTab, setActiveTab] = useState<'flags' | 'constantes' | 'langues'>('flags')
  const [editingConstante, setEditingConstante] = useState<Constante | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sortField, setSortField] = useState<'name' | 'category' | 'enabled'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // ===== DONNÉES DE RÉFÉRENCE =====
  const FLAG_DEFINITIONS: Omit<FlagConfig, 'enabled' | 'lastModified'>[] = [
    { id: 'F-001', name: 'LAUNCH_FREE', description: 'Gratuité colocataires au lancement', category: 'général' },
    { id: 'F-002', name: 'LITE_MODE', description: 'Mode basse connexion (public)', category: 'général' },
    { id: 'F-003', name: 'PAIEMENT_OM_MVOLA', description: 'Orange Money / MVOLA - "Bientôt disponible"', category: 'paiement' },
    { id: 'F-004', name: 'MODERATION_AUTO', description: 'Validation automatique après 1h sans action', category: 'modération' },
    { id: 'F-005', name: 'PARTENAIRE_VISIBILITY', description: 'Visibilité cumulative des partenaires', category: 'partenaire' },
    { id: 'F-006', name: 'MOBILE_FIRST', description: 'Priorité au design mobile', category: 'général' },
    { id: 'F-007', name: 'I18N_MG', description: 'Internationalisation Malagasy', category: 'internationalisation' },
    { id: 'F-008', name: 'I18N_EN', description: 'Internationalisation Anglais', category: 'internationalisation' }
  ]

  // Correction: Utiliser un type qui inclut les valeurs par défaut
  const CONSTANTE_DEFINITIONS: (ConstanteSansValeur & { defaultValue: string | number })[] = [
    { id: 'C-001', key: 'DUREE_ANNONCE_STANDARD', description: 'Durée de validité d\'une annonce standard (mois)', category: 'annonce', editable: true, defaultValue: 3 },
    { id: 'C-002', key: 'DUREE_ANNONCE_PARTENAIRE', description: 'Durée de validité d\'une annonce partenaire (mois)', category: 'annonce', editable: true, defaultValue: 6 },
    { id: 'C-003', key: 'RAPPEL_RENOUVELLEMENT', description: 'Rappel de renouvellement avant expiration (jours)', category: 'annonce', editable: true, defaultValue: 7 },
    { id: 'C-004', key: 'RETENTION_TEXTE', description: 'Rétention des textes des annonces (années)', category: 'annonce', editable: true, defaultValue: 5 },
    { id: 'C-005', key: 'RETENTION_IMAGES', description: 'Rétention des images des annonces (années)', category: 'annonce', editable: true, defaultValue: 5 },
    { id: 'C-006', key: 'PHOTOS_MAX', description: 'Nombre maximum de photos par annonce', category: 'annonce', editable: true, defaultValue: 10 },
    { id: 'C-007', key: 'CHAMBRES_MIN', description: 'Nombre minimum de chambres pour une colocation', category: 'colocation', editable: true, defaultValue: 2 },
    { id: 'C-008', key: 'VALIDATION_AUTO_DELAI', description: 'Délai avant validation automatique sans modération (minutes)', category: 'modération', editable: true, defaultValue: 60 },
    { id: 'C-009', key: 'SIGNALEMENTS_MAX', description: 'Nombre de signalements avant suspension recommandée', category: 'modération', editable: true, defaultValue: 3 },
    { id: 'C-010', key: 'SUSPENSION_DUREE', description: 'Durée de suspension par défaut (jours)', category: 'modération', editable: true, defaultValue: 30 },
    { id: 'C-011', key: 'PARTENAIRE_NIVEAUX', description: 'Nombre de niveaux de partenariat', category: 'partenaire', editable: false, defaultValue: 3 },
    { id: 'C-012', key: 'CACHE_DUREE', description: 'Durée de cache des pages (secondes)', category: 'général', editable: true, defaultValue: 3600 }
  ]

  const LANGUE_DEFINITIONS: Langue[] = [
    { code: 'FR', name: 'Français', nativeName: 'Français', status: 'référence', progress: 100 },
    { code: 'MG', name: 'Malagasy', nativeName: 'Malagasy', status: 'partiel', progress: 45 },
    { code: 'EN', name: 'English', nativeName: 'English', status: 'stub', progress: 15 }
  ]

  // ===== CATÉGORIES =====
  const categories = useMemo(() => {
    const unique = new Set(flags.map(f => f.category))
    return ['tous', ...Array.from(unique)]
  }, [flags])

  // ===== FILTRAGE =====
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

  // ===== FONCTIONS UTILITAIRES =====
  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'général': 'Général',
      'paiement': 'Paiement',
      'internationalisation': 'Internationalisation',
      'modération': 'Modération',
      'annonce': 'Annonce',
      'colocation': 'Colocation',
      'partenaire': 'Partenaire'
    }
    return translations[category] || category
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'général': Globe,
      'paiement': DollarSign,
      'internationalisation': Languages,
      'modération': Shield,
      'annonce': Database,
      'colocation': Users,
      'partenaire': Building2
    }
    const Icon = icons[category] || Info
    return <Icon className="w-3 h-3" />
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'général': 'text-blue-400',
      'paiement': 'text-green-400',
      'internationalisation': 'text-purple-400',
      'modération': 'text-red-400',
      'annonce': 'text-amber-400',
      'colocation': 'text-cyan-400',
      'partenaire': 'text-pink-400'
    }
    return colors[category] || 'text-white/40'
  }

  const getSortIcon = (field: 'name' | 'category' | 'enabled') => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 opacity-40" />
    return sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
  }

  const handleSort = (field: 'name' | 'category' | 'enabled') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // ===== CHARGEMENT DES DONNÉES =====
  const loadConfiguration = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.backofficeAdministration()
      const configItems = Array.isArray(data.configuration) ? data.configuration : []

      // Créer un map des valeurs
      const configMap = new Map<string, any>()
      configItems.forEach((item: any) => {
        let valeur = item.valeur
        try {
          if (typeof valeur === 'string') {
            valeur = JSON.parse(valeur)
          }
        } catch (e) {
          // Conserver la valeur telle quelle
        }
        configMap.set(item.cle, { 
          valeur, 
          date_modification: item.date_modification || item.date_creation 
        })
      })

      // Mettre à jour les flags
      const updatedFlags = FLAG_DEFINITIONS.map(flag => {
        const config = configMap.get(flag.name)
        return {
          ...flag,
          enabled: config ? Boolean(config.valeur) : false,
          lastModified: config?.date_modification 
            ? new Date(config.date_modification).toISOString().split('T')[0] 
            : undefined
        }
      })
      setFlags(updatedFlags)

      // Mettre à jour les constantes - CORRECTION ICI
      const updatedConstantes = CONSTANTE_DEFINITIONS.map(constante => {
        const config = configMap.get(constante.key)
        return {
          id: constante.id,
          key: constante.key,
          description: constante.description,
          category: constante.category,
          editable: constante.editable,
          value: config?.valeur !== undefined ? config.valeur : constante.defaultValue
        }
      })
      setConstantes(updatedConstantes)

      // Mettre à jour les langues (avec données de la base si disponibles)
      const updatedLangues = LANGUE_DEFINITIONS.map(langue => {
        const config = configMap.get(`LANGUE_${langue.code}`)
        return {
          ...langue,
          progress: config?.valeur?.progress || langue.progress,
          status: config?.valeur?.status || langue.status,
          lastUpdated: config?.date_modification 
            ? new Date(config.date_modification).toISOString().split('T')[0] 
            : undefined
        }
      })
      setLangues(updatedLangues)

      setSuccessMessage('Configuration chargée avec succès')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger la configuration')
      // Fallback sur les données par défaut - CORRECTION ICI
      setFlags(FLAG_DEFINITIONS.map(f => ({ ...f, enabled: false })))
      setConstantes(CONSTANTE_DEFINITIONS.map(c => ({
        id: c.id,
        key: c.key,
        description: c.description,
        category: c.category,
        editable: c.editable,
        value: c.defaultValue
      })))
      setLangues(LANGUE_DEFINITIONS)
    } finally {
      setLoading(false)
    }
  }

  // ===== SAUVEGARDE =====
  const saveConfiguration = async (key: string, valeur: any) => {
    setSaving(true)
    setError(null)
    try {
      await api.saveBackofficeConfiguration({ cle: key, valeur })
      setSuccessMessage(`Configuration "${key}" enregistrée`)
      setTimeout(() => setSuccessMessage(null), 3000)
      await loadConfiguration()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d\'enregistrer la configuration')
      throw err
    } finally {
      setSaving(false)
    }
  }

  // ===== ACTIONS =====
  const toggleFlag = async (id: string) => {
    const flag = flags.find(f => f.id === id)
    if (!flag) return
    
    const newValue = !flag.enabled
    try {
      await saveConfiguration(flag.name, newValue)
    } catch (err) {
      // L'erreur est déjà gérée dans saveConfiguration
    }
  }

  const handleEditConstante = async (id: string, value: string | number) => {
    const constante = constantes.find(c => c.id === id)
    if (!constante) return
    
    try {
      await saveConfiguration(constante.key, value)
      setEditingConstante(null)
    } catch (err) {
      // L'erreur est déjà gérée dans saveConfiguration
    }
  }

  // ===== MODALE D'ÉDITION =====
  const ConstanteEditModal = ({ 
    constante, 
    onClose 
  }: { 
    constante: Constante
    onClose: () => void
  }) => {
    const [value, setValue] = useState<string | number>(constante.value)

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      handleEditConstante(constante.id, value)
    }

    // Gérer le changement de valeur
    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      if (typeof constante.value === 'number') {
        const numValue = parseFloat(rawValue)
        setValue(isNaN(numValue) ? 0 : numValue)
      } else {
        setValue(rawValue)
      }
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
              <X className="w-5 h-5" />
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
                value={String(value)}
                onChange={handleValueChange}
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

  // ===== INITIALISATION =====
  useEffect(() => {
    loadConfiguration()
  }, [])

  // ===== RENDU =====
  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Configuration globale</h1>
            <p className="text-white/50 text-sm">
              Flags, constantes produit et internationalisation
            </p>
          </div>
          <button
            onClick={loadConfiguration}
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

        {/* Contenu */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          
          {/* ===== TAB: FLAGS ===== */}
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
                {loading ? (
                  <div className="text-center py-12 text-white/40">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-40" />
                    <p>Chargement des flags...</p>
                  </div>
                ) : filteredFlags.length === 0 ? (
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

          {/* ===== TAB: CONSTANTES ===== */}
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
                      <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Toutes les catégories</option>
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
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-white/40">
                          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin opacity-40" />
                          <p>Chargement des constantes...</p>
                        </td>
                      </tr>
                    ) : filteredConstantes.length === 0 ? (
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
                                disabled={saving}
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

          {/* ===== TAB: LANGUES ===== */}
          {activeTab === 'langues' && (
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="text-center py-12 text-white/40">
                  <RefreshCw className="w-12 h-12 mx-auto mb-3 animate-spin opacity-40" />
                  <p>Chargement des langues...</p>
                </div>
              ) : langues.map((langue) => (
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
        />
      )}
    </AdminLayout>
  )
}