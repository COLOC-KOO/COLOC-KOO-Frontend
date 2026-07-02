import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  Code,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  Wifi,
  Signal,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Zap,
  Gauge,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Search,
  Eye,
  Shield,
  Info
} from 'lucide-react'

// Types
interface TechMetric {
  id: string
  category: 'performance' | 'infrastructure' | 'qualite' | 'securite'
  label: string
  value: string | number
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change?: number
  description: string
  unit?: string
}

interface PageMetric {
  page: string
  loadTime: number
  lcp: number
  weight: number
  requests: number
  score: number
  status: 'good' | 'warning' | 'critical'
}

interface BuildMetric {
  name: string
  size: number
  gzip: number
  modules: number
  status: 'good' | 'warning' | 'critical'
  lastUpdate: string
}

// Données mockées
const MOCK_TECH_METRICS: TechMetric[] = [
  {
    id: 'T-001',
    category: 'performance',
    label: 'Chargement moyen (4G)',
    value: 1.4,
    status: 'good',
    trend: 'down',
    change: -8.5,
    description: 'Temps de chargement moyen en 4G',
    unit: 's'
  },
  {
    id: 'T-002',
    category: 'performance',
    label: 'LCP médian',
    value: 2.1,
    status: 'good',
    trend: 'down',
    change: -5.2,
    description: 'Largest Contentful Paint médian',
    unit: 's'
  },
  {
    id: 'T-003',
    category: 'performance',
    label: 'Poids moyen par page',
    value: 182,
    status: 'good',
    trend: 'down',
    change: -12.3,
    description: 'Taille moyenne des pages',
    unit: 'Ko'
  },
  {
    id: 'T-004',
    category: 'performance',
    label: "Taux d'erreur (JS/API)",
    value: 0.3,
    status: 'good',
    trend: 'down',
    change: -25.0,
    description: "Taux d'erreurs frontend et API",
    unit: '%'
  },
  {
    id: 'T-005',
    category: 'infrastructure',
    label: 'Disponibilité API',
    value: 99.9,
    status: 'good',
    trend: 'stable',
    description: 'Disponibilité de l\'API Supabase',
    unit: '%'
  },
  {
    id: 'T-006',
    category: 'infrastructure',
    label: 'Latence API (p50)',
    value: 120,
    status: 'good',
    trend: 'down',
    change: -6.7,
    description: 'Latence médiane de l\'API',
    unit: 'ms'
  },
  {
    id: 'T-007',
    category: 'infrastructure',
    label: 'Latence API (p95)',
    value: 480,
    status: 'warning',
    trend: 'up',
    change: 8.3,
    description: 'Latence 95ème percentile',
    unit: 'ms'
  },
  {
    id: 'T-008',
    category: 'infrastructure',
    label: 'Taux de hit cache (CDN)',
    value: 87,
    status: 'good',
    trend: 'up',
    change: 3.5,
    description: 'Taux de cache CDN',
    unit: '%'
  },
  {
    id: 'T-009',
    category: 'qualite',
    label: 'Score Lighthouse - Performance',
    value: 94,
    status: 'good',
    trend: 'up',
    change: 2.1,
    description: 'Score de performance mobile',
    unit: '/100'
  },
  {
    id: 'T-010',
    category: 'qualite',
    label: 'Score Lighthouse - Accessibilité',
    value: 98,
    status: 'good',
    trend: 'up',
    change: 1.5,
    description: "Score d'accessibilité",
    unit: '/100'
  },
  {
    id: 'T-011',
    category: 'qualite',
    label: 'Build - Bundle JS (gzip)',
    value: 96,
    status: 'good',
    trend: 'down',
    change: -4.8,
    description: 'Taille du bundle JavaScript compressé',
    unit: 'Ko'
  },
  {
    id: 'T-012',
    category: 'qualite',
    label: 'Couverture i18n (MG)',
    value: 0,
    status: 'critical',
    trend: 'stable',
    description: 'Couverture de la traduction Malagasy',
    unit: '%'
  },
  {
    id: 'T-013',
    category: 'qualite',
    label: 'Couverture i18n (EN)',
    value: 0,
    status: 'critical',
    trend: 'stable',
    description: 'Couverture de la traduction Anglais',
    unit: '%'
  },
  {
    id: 'T-014',
    category: 'securite',
    label: 'Erreurs 24h (front)',
    value: 3,
    status: 'good',
    trend: 'down',
    change: -40.0,
    description: 'Erreurs frontend détectées',
    unit: 'erreurs'
  },
  {
    id: 'T-015',
    category: 'securite',
    label: 'Erreurs 24h (back)',
    value: 1,
    status: 'good',
    trend: 'stable',
    description: 'Erreurs backend détectées',
    unit: 'erreurs'
  },
  {
    id: 'T-016',
    category: 'securite',
    label: 'Taux de sécurité (score)',
    value: 92,
    status: 'good',
    trend: 'up',
    change: 5.0,
    description: 'Score de sécurité global',
    unit: '/100'
  }
]

const MOCK_PAGE_METRICS: PageMetric[] = [
  { page: 'Accueil', loadTime: 1.1, lcp: 1.8, weight: 165, requests: 24, score: 95, status: 'good' },
  { page: 'Résultats', loadTime: 1.6, lcp: 2.3, weight: 210, requests: 32, score: 88, status: 'good' },
  { page: 'Fiche annonce', loadTime: 1.3, lcp: 2.0, weight: 188, requests: 28, score: 92, status: 'good' },
  { page: 'Dépôt (wizard)', loadTime: 1.8, lcp: 2.5, weight: 232, requests: 36, score: 82, status: 'warning' },
  { page: 'Compte', loadTime: 1.2, lcp: 1.9, weight: 172, requests: 22, score: 93, status: 'good' },
  { page: 'Messagerie', loadTime: 1.4, lcp: 2.1, weight: 196, requests: 30, score: 89, status: 'good' }
]

const MOCK_BUILD_METRICS: BuildMetric[] = [
  { name: 'app.js', size: 245, gzip: 76, modules: 124, status: 'good', lastUpdate: '2026-06-15 14:32' },
  { name: 'vendor.js', size: 180, gzip: 55, modules: 87, status: 'good', lastUpdate: '2026-06-15 14:32' },
  { name: 'admin.js', size: 96, gzip: 30, modules: 42, status: 'good', lastUpdate: '2026-06-15 14:32' },
  { name: 'styles.css', size: 28, gzip: 8, modules: 1, status: 'good', lastUpdate: '2026-06-15 14:32' }
]

// Composant de badge de statut
const StatusBadge = ({ status }: { status: 'good' | 'warning' | 'critical' }) => {
  const config = {
    'good': { label: 'Bon', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'warning': { label: 'À surveiller', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: AlertCircle },
    'critical': { label: 'Critique', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle }
  }
  const { label, className, icon: Icon } = config[status]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de badge de tendance
const TrendBadge = ({ trend, change }: { trend: 'up' | 'down' | 'stable'; change?: number }) => {
  if (trend === 'stable') {
    return <span className="text-xs text-blue-400">⟶ Stable</span>
  }
  
  const isUp = trend === 'up'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {change !== undefined && `${Math.abs(change)}%`}
    </span>
  )
}

// Composant de modale de détails
const DetailModal = ({ 
  data, 
  onClose 
}: { 
  data: TechMetric | PageMetric | BuildMetric | null
  onClose: () => void
}) => {
  if (!data) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {'page' in data ? data.page : 'label' in data ? data.label : data.name}
            </h3>
            <p className="text-sm text-white/50 mt-1">
              {'description' in data && data.description}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {'value' in data && (
              <>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white/40 text-xs uppercase tracking-wider">Valeur</div>
                  <div className="text-2xl font-bold">{data.value}</div>
                </div>
                {'unit' in data && data.unit && (
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-white/40 text-xs uppercase tracking-wider">Unité</div>
                    <div className="text-2xl font-bold text-brand-cyan">{data.unit}</div>
                  </div>
                )}
              </>
            )}
            {'status' in data && (
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white/40 text-xs uppercase tracking-wider">Statut</div>
                <StatusBadge status={data.status as any} />
              </div>
            )}
            {'trend' in data && data.trend && (
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-white/40 text-xs uppercase tracking-wider">Tendance</div>
                <TrendBadge trend={data.trend as any} change={data.change} />
              </div>
            )}
          </div>

          {'page' in data && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Chargement</div>
                <div className="font-semibold">{data.loadTime}s</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">LCP</div>
                <div className="font-semibold">{data.lcp}s</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Poids</div>
                <div className="font-semibold">{data.weight}Ko</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Requêtes</div>
                <div className="font-semibold">{data.requests}</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center col-span-2">
                <div className="text-white/40 text-[10px]">Score</div>
                <div className="font-semibold text-brand-cyan">{data.score}/100</div>
              </div>
            </div>
          )}

          {'size' in data && (
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Taille</div>
                <div className="font-semibold">{data.size}Ko</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Gzip</div>
                <div className="font-semibold">{data.gzip}Ko</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-white/40 text-[10px]">Modules</div>
                <div className="font-semibold">{data.modules}</div>
              </div>
            </div>
          )}

          {'lastUpdate' in data && (
            <div className="text-xs text-white/30">
              Dernière mise à jour: {data.lastUpdate}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onClose}
            className="w-full bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant principal
export default function AdminTechnique() {
  const [metrics, setMetrics] = useState(MOCK_TECH_METRICS)
  const [pageMetrics, setPageMetrics] = useState(MOCK_PAGE_METRICS)
  const [buildMetrics, setBuildMetrics] = useState(MOCK_BUILD_METRICS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('tous')
  const [filterStatus, setFilterStatus] = useState<string>('tous')
  const [networkType, setNetworkType] = useState<'4g' | '3g'>('4g')
  const [selectedMetric, setSelectedMetric] = useState<TechMetric | PageMetric | BuildMetric | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Catégories pour le filtre
  const categories = useMemo(() => {
    const unique = new Set(metrics.map(m => m.category))
    return ['tous', ...Array.from(unique)]
  }, [metrics])

  // Statuts pour le filtre
  const statuts = useMemo(() => {
    const unique = new Set(metrics.map(m => m.status))
    return ['tous', ...Array.from(unique)]
  }, [metrics])

  // Filtrer les métriques
  const filteredMetrics = useMemo(() => {
    let filtered = metrics

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(m =>
        m.label.toLowerCase().includes(query) ||
        m.description.toLowerCase().includes(query)
      )
    }

    if (filterCategory !== 'tous') {
      filtered = filtered.filter(m => m.category === filterCategory)
    }

    if (filterStatus !== 'tous') {
      filtered = filtered.filter(m => m.status === filterStatus)
    }

    return filtered
  }, [metrics, searchQuery, filterCategory, filterStatus])

  // Statistiques
  const stats = useMemo(() => {
    const total = metrics.length
    const good = metrics.filter(m => m.status === 'good').length
    const warning = metrics.filter(m => m.status === 'warning').length
    const critical = metrics.filter(m => m.status === 'critical').length
    const up = metrics.filter(m => m.trend === 'up').length
    const down = metrics.filter(m => m.trend === 'down').length
    
    const avgLoad = networkType === '4g' ? 1.4 : 2.8
    const avgLCP = networkType === '4g' ? 2.1 : 3.8
    
    return {
      total,
      good,
      warning,
      critical,
      up,
      down,
      avgLoad,
      avgLCP,
      tauxConformite: total > 0 ? Math.round((good / total) * 100) : 0
    }
  }, [metrics, networkType])

  // Obtenir l'icône de catégorie
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'performance': Gauge,
      'infrastructure': Server,
      'qualite': Code,
      'securite': Shield
    }
    const Icon = icons[category] || Activity
    return <Icon className="w-4 h-4" />
  }

  // Obtenir la couleur de catégorie
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'performance': 'text-cyan-400',
      'infrastructure': 'text-purple-400',
      'qualite': 'text-green-400',
      'securite': 'text-amber-400'
    }
    return colors[category] || 'text-white/40'
  }

  // Traduire la catégorie
  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'performance': 'Performance',
      'infrastructure': 'Infrastructure',
      'qualite': 'Qualité de code',
      'securite': 'Sécurité'
    }
    return translations[category] || category
  }

  // Actualiser les données
  const handleRefresh = () => {
    setMetrics(MOCK_TECH_METRICS)
    setPageMetrics(MOCK_PAGE_METRICS)
    setBuildMetrics(MOCK_BUILD_METRICS)
    setSuccessMessage('Données actualisées')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Exporter les données
  const handleExport = () => {
    const data = metrics.map(m => ({
      Catégorie: translateCategory(m.category),
      Indicateur: m.label,
      Valeur: m.value,
      Statut: m.status,
      Tendance: m.trend,
      Variation: m.change ? `${m.change}%` : '-',
      Description: m.description
    }))
    
    const csv = [
      ['Catégorie', 'Indicateur', 'Valeur', 'Statut', 'Tendance', 'Variation', 'Description'],
      ...data.map(row => [
        row.Catégorie,
        row.Indicateur,
        row.Valeur,
        row.Statut,
        row.Tendance,
        row.Variation,
        row.Description
      ])
    ].map(row => row.join(';')).join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `technique_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSuccessMessage('Export CSV effectué')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Technique — indicateurs développeur</h1>
            <p className="text-white/50 text-sm">
              Performance front, sobriété numérique, infrastructure (mobile-first, connectivité Madagascar)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-lg text-sm hover:bg-brand-cyan/25 transition"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
            <div className="text-xs text-white/40">Indicateurs</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.good}</div>
            <div className="text-xs text-white/40">Bons</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.warning}</div>
            <div className="text-xs text-white/40">À surveiller</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-white/40">Critiques</div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un indicateur..."
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

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="good" className="bg-[oklch(0.22_0.005_260)]">Bon</option>
                  <option value="warning" className="bg-[oklch(0.22_0.005_260)]">À surveiller</option>
                  <option value="critical" className="bg-[oklch(0.22_0.005_260)]">Critique</option>
                </select>

                <select
                  value={networkType}
                  onChange={(e) => setNetworkType(e.target.value as '4g' | '3g')}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="4g" className="bg-[oklch(0.22_0.005_260)]">4G (urbain)</option>
                  <option value="3g" className="bg-[oklch(0.22_0.005_260)]">3G (connectivité limitée)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Métriques techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filteredMetrics.map((metric) => {
              const categoryColor = getCategoryColor(metric.category)
              const CategoryIcon = getCategoryIcon(metric.category)
              
              return (
                <div 
                  key={metric.id}
                  className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-xl p-4 hover:border-white/20 transition group cursor-pointer"
                  onClick={() => setSelectedMetric(metric)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {CategoryIcon}
                      <span className={`text-xs ${categoryColor}`}>{translateCategory(metric.category)}</span>
                    </div>
                    <StatusBadge status={metric.status} />
                  </div>

                  <div className="mb-2">
                    <div className="text-sm text-white/60">{metric.label}</div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-2xl font-bold">
                        {metric.value}{metric.unit && ` ${metric.unit}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">{metric.description}</span>
                    {metric.trend && (
                      <TrendBadge trend={metric.trend} change={metric.change} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Performance par page */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Performance par page</h3>
              <span className="text-xs text-white/40">Chargement moyen: {stats.avgLoad}s · LCP: {stats.avgLCP}s</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Page</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Chargement</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">LCP</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Poids</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Score</th>
                    <th className="text-center p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {pageMetrics.map((page) => (
                    <tr 
                      key={page.page} 
                      className="hover:bg-white/5 transition cursor-pointer"
                      onClick={() => setSelectedMetric(page)}
                    >
                      <td className="p-2 font-medium">{page.page}</td>
                      <td className="p-2 text-right">{page.loadTime}s</td>
                      <td className="p-2 text-right">{page.lcp}s</td>
                      <td className="p-2 text-right">{page.weight}Ko</td>
                      <td className="p-2 text-right font-bold text-brand-cyan">{page.score}/100</td>
                      <td className="p-2 text-center">
                        <StatusBadge status={page.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Build metrics */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Bundle &amp; Build</h3>
              <span className="text-xs text-white/40">Taille totale: {buildMetrics.reduce((sum, b) => sum + b.size, 0)}Ko</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {buildMetrics.map((build) => (
                <div 
                  key={build.name}
                  className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-lg p-3 cursor-pointer hover:border-white/20 transition"
                  onClick={() => setSelectedMetric(build)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">{build.name}</span>
                    <StatusBadge status={build.status} />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <div>
                      <div className="text-white/30">Taille</div>
                      <div className="font-semibold">{build.size}Ko</div>
                    </div>
                    <div>
                      <div className="text-white/30">Gzip</div>
                      <div className="font-semibold text-brand-green">{build.gzip}Ko</div>
                    </div>
                    <div>
                      <div className="text-white/30">Modules</div>
                      <div className="font-semibold">{build.modules}</div>
                    </div>
                    <div>
                      <div className="text-white/30">Updated</div>
                      <div className="text-[10px] text-white/30">{build.lastUpdate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-white/80">Infrastructure &amp; Qualité de code</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Disponibilité API</div>
                  <div className="font-bold text-brand-green">99.9%</div>
                </div>
                <CheckCircle className="w-5 h-5 text-brand-green" />
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Latence API (p50)</div>
                  <div className="font-bold">120ms</div>
                </div>
                <span className="text-xs text-green-400">↓ 6.7%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Taux de hit cache</div>
                  <div className="font-bold">87%</div>
                </div>
                <span className="text-xs text-green-400">↑ 3.5%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Score Lighthouse</div>
                  <div className="font-bold text-brand-cyan">94/100</div>
                </div>
                <span className="text-xs text-green-400">↑ 2.1%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Bundle JS (gzip)</div>
                  <div className="font-bold">96Ko</div>
                </div>
                <span className="text-xs text-green-400">↓ 4.8%</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/40">Erreurs 24h</div>
                  <div className="font-bold text-brand-green">3 / 1</div>
                </div>
                <span className="text-xs text-green-400">↓ 40%</span>
              </div>
            </div>
          </div>

          {/* Pied de page */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/30">
            <span>{filteredMetrics.length} indicateurs</span>
            <span>·</span>
            <span className="text-green-400">{filteredMetrics.filter(m => m.status === 'good').length} bons</span>
            <span>·</span>
            <span className="text-amber-400">{filteredMetrics.filter(m => m.status === 'warning').length} à surveiller</span>
            <span>·</span>
            <span className="text-red-400">{filteredMetrics.filter(m => m.status === 'critical').length} critiques</span>
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
              Indicateurs destinés au prestataire de développement (stack cible Next.js + Supabase + Leaflet/OSM). 
              Valeurs de référence placeholders. Cliquez sur les indicateurs pour plus de détails.
            </div>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedMetric && (
        <DetailModal 
          data={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}
    </AdminLayout>
  )
}