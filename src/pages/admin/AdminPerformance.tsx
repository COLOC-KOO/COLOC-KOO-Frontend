import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Gauge,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Users,
  Building2,
  Wallet,
  FileText,
  MessageCircle,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Download,
  Eye,
  Zap,
  Target,
  Award,
  Star,
  Percent,
  Timer,
  Phone,
  Mail,
  Globe,
  Server,
  Database,
  Cpu,
  HardDrive,
  Network,
  Cloud,
  Wifi,
  Battery,
  Signal,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react'

// Types
interface PerformanceData {
  id: string
  domaine: string
  indicateur: string
  valeur: string | number
  objectif: string | number
  tendance: 'up' | 'down' | 'stable'
  variation: number
  statut: 'good' | 'warning' | 'critical'
  historique: { date: string; valeur: number }[]
  details?: string
}

interface DomainePerformance {
  nom: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  indicateurs: PerformanceData[]
}

// Données mockées
const MOCK_PERFORMANCE: DomainePerformance[] = [
  {
    nom: 'Modération',
    icon: Shield,
    color: 'text-cyan-400',
    indicateurs: [
      {
        id: 'P-001',
        domaine: 'Modération',
        indicateur: 'Annonces traitées / jour',
        valeur: 158,
        objectif: 150,
        tendance: 'up',
        variation: 5.3,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 142 },
          { date: '2026-06-10', valeur: 148 },
          { date: '2026-06-11', valeur: 155 },
          { date: '2026-06-12', valeur: 160 },
          { date: '2026-06-13', valeur: 152 },
          { date: '2026-06-14', valeur: 158 },
          { date: '2026-06-15', valeur: 158 }
        ]
      },
      {
        id: 'P-002',
        domaine: 'Modération',
        indicateur: 'Taux de validation automatique',
        valeur: '92%',
        objectif: '95%',
        tendance: 'up',
        variation: 2.1,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 88 },
          { date: '2026-06-10', valeur: 89 },
          { date: '2026-06-11', valeur: 90 },
          { date: '2026-06-12', valeur: 91 },
          { date: '2026-06-13', valeur: 91 },
          { date: '2026-06-14', valeur: 92 },
          { date: '2026-06-15', valeur: 92 }
        ]
      },
      {
        id: 'P-003',
        domaine: 'Modération',
        indicateur: 'Temps moyen de traitement',
        valeur: '7 min',
        objectif: '10 min',
        tendance: 'down',
        variation: -15.2,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 9.5 },
          { date: '2026-06-10', valeur: 9.2 },
          { date: '2026-06-11', valeur: 8.8 },
          { date: '2026-06-12', valeur: 8.3 },
          { date: '2026-06-13', valeur: 7.8 },
          { date: '2026-06-14', valeur: 7.3 },
          { date: '2026-06-15', valeur: 7 }
        ]
      },
      {
        id: 'P-004',
        domaine: 'Modération',
        indicateur: 'Signalements traités < 24h',
        valeur: '88%',
        objectif: '90%',
        tendance: 'down',
        variation: -1.5,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 90 },
          { date: '2026-06-10', valeur: 89 },
          { date: '2026-06-11', valeur: 88 },
          { date: '2026-06-12', valeur: 87 },
          { date: '2026-06-13', valeur: 88 },
          { date: '2026-06-14', valeur: 87 },
          { date: '2026-06-15', valeur: 88 }
        ]
      }
    ]
  },
  {
    nom: 'Acquisition Services',
    icon: Users,
    color: 'text-green-400',
    indicateurs: [
      {
        id: 'P-005',
        domaine: 'Acquisition Services',
        indicateur: 'Taux de conversion prospects → validés',
        valeur: '33%',
        objectif: '40%',
        tendance: 'up',
        variation: 8.4,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 28 },
          { date: '2026-06-10', valeur: 29 },
          { date: '2026-06-11', valeur: 30 },
          { date: '2026-06-12', valeur: 31 },
          { date: '2026-06-13', valeur: 32 },
          { date: '2026-06-14', valeur: 33 },
          { date: '2026-06-15', valeur: 33 }
        ]
      },
      {
        id: 'P-006',
        domaine: 'Acquisition Services',
        indicateur: 'Demandes de services / mois',
        valeur: 45,
        objectif: 50,
        tendance: 'up',
        variation: 12.5,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 38 },
          { date: '2026-06-10', valeur: 39 },
          { date: '2026-06-11', valeur: 40 },
          { date: '2026-06-12', valeur: 42 },
          { date: '2026-06-13', valeur: 43 },
          { date: '2026-06-14', valeur: 44 },
          { date: '2026-06-15', valeur: 45 }
        ]
      },
      {
        id: 'P-007',
        domaine: 'Acquisition Services',
        indicateur: 'Temps moyen de réponse prospect',
        valeur: '4.2 h',
        objectif: '2 h',
        tendance: 'down',
        variation: -8.7,
        statut: 'critical',
        historique: [
          { date: '2026-06-09', valeur: 5.8 },
          { date: '2026-06-10', valeur: 5.5 },
          { date: '2026-06-11', valeur: 5.2 },
          { date: '2026-06-12', valeur: 4.9 },
          { date: '2026-06-13', valeur: 4.6 },
          { date: '2026-06-14', valeur: 4.4 },
          { date: '2026-06-15', valeur: 4.2 }
        ]
      }
    ]
  },
  {
    nom: 'Contrats & EDL',
    icon: FileText,
    color: 'text-purple-400',
    indicateurs: [
      {
        id: 'P-008',
        domaine: 'Contrats & EDL',
        indicateur: 'Délai moyen d\'émission',
        valeur: '2.5 j',
        objectif: '2 j',
        tendance: 'down',
        variation: -10.7,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 3.4 },
          { date: '2026-06-10', valeur: 3.2 },
          { date: '2026-06-11', valeur: 3.0 },
          { date: '2026-06-12', valeur: 2.8 },
          { date: '2026-06-13', valeur: 2.7 },
          { date: '2026-06-14', valeur: 2.6 },
          { date: '2026-06-15', valeur: 2.5 }
        ]
      },
      {
        id: 'P-009',
        domaine: 'Contrats & EDL',
        indicateur: 'Documents émis / mois',
        valeur: 24,
        objectif: 20,
        tendance: 'up',
        variation: 20.0,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 18 },
          { date: '2026-06-10', valeur: 19 },
          { date: '2026-06-11', valeur: 20 },
          { date: '2026-06-12', valeur: 21 },
          { date: '2026-06-13', valeur: 22 },
          { date: '2026-06-14', valeur: 23 },
          { date: '2026-06-15', valeur: 24 }
        ]
      },
      {
        id: 'P-010',
        domaine: 'Contrats & EDL',
        indicateur: 'Coordonnées manquantes (moy.)',
        valeur: '1.2',
        objectif: '0',
        tendance: 'down',
        variation: -15.3,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 1.8 },
          { date: '2026-06-10', valeur: 1.7 },
          { date: '2026-06-11', valeur: 1.6 },
          { date: '2026-06-12', valeur: 1.5 },
          { date: '2026-06-13', valeur: 1.4 },
          { date: '2026-06-14', valeur: 1.3 },
          { date: '2026-06-15', valeur: 1.2 }
        ]
      }
    ]
  },
  {
    nom: 'Finances',
    icon: Wallet,
    color: 'text-amber-400',
    indicateurs: [
      {
        id: 'P-011',
        domaine: 'Finances',
        indicateur: 'Versements conformes',
        valeur: '92%',
        objectif: '95%',
        tendance: 'up',
        variation: 2.5,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 88 },
          { date: '2026-06-10', valeur: 89 },
          { date: '2026-06-11', valeur: 90 },
          { date: '2026-06-12', valeur: 90 },
          { date: '2026-06-13', valeur: 91 },
          { date: '2026-06-14', valeur: 91 },
          { date: '2026-06-15', valeur: 92 }
        ]
      },
      {
        id: 'P-012',
        domaine: 'Finances',
        indicateur: 'Versements à vérifier',
        valeur: 12,
        objectif: 5,
        tendance: 'down',
        variation: -8.3,
        statut: 'critical',
        historique: [
          { date: '2026-06-09', valeur: 18 },
          { date: '2026-06-10', valeur: 17 },
          { date: '2026-06-11', valeur: 16 },
          { date: '2026-06-12', valeur: 15 },
          { date: '2026-06-13', valeur: 14 },
          { date: '2026-06-14', valeur: 13 },
          { date: '2026-06-15', valeur: 12 }
        ]
      },
      {
        id: 'P-013',
        domaine: 'Finances',
        indicateur: 'Montant total reçu (mois)',
        valeur: '4.8M MGA',
        objectif: '5.0M MGA',
        tendance: 'up',
        variation: 4.3,
        statut: 'good',
        historique: [
          { date: '2026-06-09', valeur: 4.2 },
          { date: '2026-06-10', valeur: 4.3 },
          { date: '2026-06-11', valeur: 4.4 },
          { date: '2026-06-12', valeur: 4.5 },
          { date: '2026-06-13', valeur: 4.6 },
          { date: '2026-06-14', valeur: 4.7 },
          { date: '2026-06-15', valeur: 4.8 }
        ]
      }
    ]
  },
  {
    nom: 'Partenaires',
    icon: Building2,
    color: 'text-pink-400',
    indicateurs: [
      {
        id: 'P-014',
        domaine: 'Partenaires',
        indicateur: 'Comptes actifs / total',
        valeur: '5 / 8',
        objectif: '8 / 8',
        tendance: 'up',
        variation: 10.0,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 4 },
          { date: '2026-06-10', valeur: 4 },
          { date: '2026-06-11', valeur: 4 },
          { date: '2026-06-12', valeur: 4 },
          { date: '2026-06-13', valeur: 5 },
          { date: '2026-06-14', valeur: 5 },
          { date: '2026-06-15', valeur: 5 }
        ],
        details: '2 comptes en attente de qualification'
      },
      {
        id: 'P-015',
        domaine: 'Partenaires',
        indicateur: 'Campagnes actives',
        valeur: 4,
        objectif: 6,
        tendance: 'up',
        variation: 33.3,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 2 },
          { date: '2026-06-10', valeur: 2 },
          { date: '2026-06-11', valeur: 3 },
          { date: '2026-06-12', valeur: 3 },
          { date: '2026-06-13', valeur: 3 },
          { date: '2026-06-14', valeur: 4 },
          { date: '2026-06-15', valeur: 4 }
        ]
      },
      {
        id: 'P-016',
        domaine: 'Partenaires',
        indicateur: 'Visibilité partenaires (niveau moyen)',
        valeur: '2.1',
        objectif: '3.0',
        tendance: 'up',
        variation: 5.0,
        statut: 'warning',
        historique: [
          { date: '2026-06-09', valeur: 1.8 },
          { date: '2026-06-10', valeur: 1.9 },
          { date: '2026-06-11', valeur: 1.9 },
          { date: '2026-06-12', valeur: 2.0 },
          { date: '2026-06-13', valeur: 2.0 },
          { date: '2026-06-14', valeur: 2.1 },
          { date: '2026-06-15', valeur: 2.1 }
        ]
      }
    ]
  }
]

// Composant de badge de statut
const StatutBadge = ({ statut }: { statut: PerformanceData['statut'] }) => {
  const config = {
    'good': { label: 'Bon', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'warning': { label: 'À surveiller', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: AlertCircle },
    'critical': { label: 'Critique', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle }
  }
  const { label, className, icon: Icon } = config[statut]
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant de tendance
const TendanceBadge = ({ 
  tendance, 
  variation 
}: { 
  tendance: PerformanceData['tendance']
  variation: number 
}) => {
  const config = {
    'up': { icon: TrendingUp, className: 'text-green-400', prefix: '+' },
    'down': { icon: TrendingDown, className: 'text-red-400', prefix: '' },
    'stable': { icon: Activity, className: 'text-blue-400', prefix: '' }
  }
  const { icon: Icon, className, prefix } = config[tendance]
  
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {prefix}{variation}%
    </span>
  )
}

// Composant de mini graphique
const MiniChart = ({ data }: { data: { date: string; valeur: number }[] }) => {
  const max = Math.max(...data.map(d => d.valeur))
  const min = Math.min(...data.map(d => d.valeur))
  const range = max - min || 1
  
  return (
    <div className="flex items-end gap-0.5 h-8 w-24">
      {data.map((d, i) => {
        const height = ((d.valeur - min) / range) * 100
        return (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${Math.max(20, height)}%`,
              backgroundColor: height >= 70 ? '#99CC33' : height >= 40 ? '#E2B53A' : '#E0604E',
              opacity: 0.7 + (i / data.length) * 0.3
            }}
          />
        )
      })}
    </div>
  )
}

// Composant principal
export default function AdminPerformance() {
  const [performance, setPerformance] = useState(MOCK_PERFORMANCE)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDomaine, setFilterDomaine] = useState<string>('tous')
  const [filterStatut, setFilterStatut] = useState<string>('tous')
  const [selectedIndicateur, setSelectedIndicateur] = useState<PerformanceData | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Domaines uniques pour le filtre
  const domaines = useMemo(() => {
    const unique = new Set(performance.map(d => d.nom))
    return ['tous', ...Array.from(unique)]
  }, [performance])

  // Statuts uniques pour le filtre
  const statuts = useMemo(() => {
    const allIndicateurs = performance.flatMap(d => d.indicateurs)
    const unique = new Set(allIndicateurs.map(i => i.statut))
    return ['tous', ...Array.from(unique)]
  }, [performance])

  // Filtrer les indicateurs
  const filteredIndicateurs = useMemo(() => {
    let allIndicateurs = performance.flatMap(d => d.indicateurs)

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      allIndicateurs = allIndicateurs.filter(i =>
        i.indicateur.toLowerCase().includes(query) ||
        i.domaine.toLowerCase().includes(query)
      )
    }

    if (filterDomaine !== 'tous') {
      allIndicateurs = allIndicateurs.filter(i => i.domaine === filterDomaine)
    }

    if (filterStatut !== 'tous') {
      allIndicateurs = allIndicateurs.filter(i => i.statut === filterStatut)
    }

    return allIndicateurs
  }, [performance, searchQuery, filterDomaine, filterStatut])

  // Statistiques globales
  const stats = useMemo(() => {
    const allIndicateurs = performance.flatMap(d => d.indicateurs)
    const good = allIndicateurs.filter(i => i.statut === 'good').length
    const warning = allIndicateurs.filter(i => i.statut === 'warning').length
    const critical = allIndicateurs.filter(i => i.statut === 'critical').length
    const total = allIndicateurs.length
    const up = allIndicateurs.filter(i => i.tendance === 'up').length
    const down = allIndicateurs.filter(i => i.tendance === 'down').length

    return {
      total,
      good,
      warning,
      critical,
      up,
      down,
      tauxConformite: total > 0 ? Math.round((good / total) * 100) : 0
    }
  }, [performance])

  // Obtenir l'icône du domaine
  const getDomaineIcon = (domaine: string) => {
    const found = performance.find(d => d.nom === domaine)
    return found?.icon || Activity
  }

  // Obtenir la couleur du domaine
  const getDomaineColor = (domaine: string) => {
    const found = performance.find(d => d.nom === domaine)
    return found?.color || 'text-white/40'
  }

  // Actualiser les données
  const handleRefresh = () => {
    setPerformance(MOCK_PERFORMANCE)
    setSuccessMessage('Données actualisées')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Export des données
  const handleExport = () => {
    const data = performance.flatMap(d => 
      d.indicateurs.map(i => ({
        Domaine: i.domaine,
        Indicateur: i.indicateur,
        Valeur: i.valeur,
        Objectif: i.objectif,
        Tendance: i.tendance,
        Variation: `${i.variation}%`,
        Statut: i.statut
      }))
    )
    
    const csv = [
      ['Domaine', 'Indicateur', 'Valeur', 'Objectif', 'Tendance', 'Variation', 'Statut'],
      ...data.map(row => [
        row.Domaine,
        row.Indicateur,
        row.Valeur,
        row.Objectif,
        row.Tendance,
        row.Variation,
        row.Statut
      ])
    ].map(row => row.join(';')).join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Vue détaillée d'un indicateur
  const handleViewDetails = (indicateur: PerformanceData) => {
    setSelectedIndicateur(indicateur)
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Performance &amp; qualité de service</h1>
            <p className="text-white/50 text-sm">
              Vue d'ensemble cohérente : modération, acquisition, contrats, finances, partenaires
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            >
              {viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
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

        {/* KPIs globaux */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.total}</div>
            <div className="text-xs text-white/40">Indicateurs</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.good}</div>
            <div className="text-xs text-white/40">Bon</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.warning}</div>
            <div className="text-xs text-white/40">À surveiller</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-white/40">Critique</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-green">{stats.up}</div>
            <div className="text-xs text-white/40">En hausse</div>
          </div>
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-brand-cyan">{stats.tauxConformite}%</div>
            <div className="text-xs text-white/40">Taux de conformité</div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
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

              <div className="flex gap-2 flex-wrap ml-auto">
                <select
                  value={filterDomaine}
                  onChange={(e) => setFilterDomaine(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {domaines.map(domaine => (
                    <option key={domaine} value={domaine} className="bg-[oklch(0.22_0.005_260)]">
                      {domaine === 'tous' ? 'Tous les domaines' : domaine}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value="tous" className="bg-[oklch(0.22_0.005_260)]">Tous les statuts</option>
                  <option value="good" className="bg-[oklch(0.22_0.005_260)]">Bon</option>
                  <option value="warning" className="bg-[oklch(0.22_0.005_260)]">À surveiller</option>
                  <option value="critical" className="bg-[oklch(0.22_0.005_260)]">Critique</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vue Grille */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredIndicateurs.length === 0 ? (
                <div className="col-span-full text-center py-12 text-white/40">
                  <Gauge className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun indicateur trouvé</p>
                </div>
              ) : (
                filteredIndicateurs.map((indicateur) => {
                  const DomaineIcon = getDomaineIcon(indicateur.domaine)
                  const color = getDomaineColor(indicateur.domaine)
                  
                  return (
                    <div 
                      key={indicateur.id}
                      className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-xl p-4 hover:border-white/20 transition group"
                    >
                      {/* En-tête */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <DomaineIcon className={`w-4 h-4 ${color}`} />
                          <span className="text-xs text-white/40">{indicateur.domaine}</span>
                        </div>
                        <StatutBadge statut={indicateur.statut} />
                      </div>

                      {/* Indicateur */}
                      <div className="mb-3">
                        <div className="text-sm text-white/60">{indicateur.indicateur}</div>
                        <div className="flex items-baseline gap-3 mt-1">
                          <span className="text-2xl font-bold">{indicateur.valeur}</span>
                          <span className="text-sm text-white/40">Objectif: {indicateur.objectif}</span>
                        </div>
                      </div>

                      {/* Tendance et graphique */}
                      <div className="flex items-center justify-between">
                        <TendanceBadge 
                          tendance={indicateur.tendance} 
                          variation={indicateur.variation} 
                        />
                        <MiniChart data={indicateur.historique} />
                      </div>

                      {/* Détails et actions */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        {indicateur.details && (
                          <span className="text-xs text-white/30">{indicateur.details}</span>
                        )}
                        <button
                          onClick={() => handleViewDetails(indicateur)}
                          className="text-xs text-brand-cyan hover:text-brand-cyan/80 transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Détails
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* Vue Liste */}
          {viewMode === 'list' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Domaine
                    </th>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Indicateur
                    </th>
                    <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="text-right p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Objectif
                    </th>
                    <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Tendance
                    </th>
                    <th className="text-left p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Évolution
                    </th>
                    <th className="text-center p-3 text-white/40 font-medium text-xs uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredIndicateurs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-white/40">
                        <Gauge className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Aucun indicateur trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIndicateurs.map((indicateur) => {
                      const DomaineIcon = getDomaineIcon(indicateur.domaine)
                      const color = getDomaineColor(indicateur.domaine)
                      
                      return (
                        <tr key={indicateur.id} className="hover:bg-white/5 transition">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <DomaineIcon className={`w-4 h-4 ${color}`} />
                              <span className="text-sm">{indicateur.domaine}</span>
                            </div>
                          </td>
                          <td className="p-3 text-white/80">{indicateur.indicateur}</td>
                          <td className="p-3 text-right font-bold">{indicateur.valeur}</td>
                          <td className="p-3 text-right text-white/40">{indicateur.objectif}</td>
                          <td className="p-3 text-center">
                            <TendanceBadge 
                              tendance={indicateur.tendance} 
                              variation={indicateur.variation} 
                            />
                          </td>
                          <td className="p-3">
                            <StatutBadge statut={indicateur.statut} />
                          </td>
                          <td className="p-3 text-center">
                            <MiniChart data={indicateur.historique} />
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleViewDetails(indicateur)}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4 text-white/40" />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>{filteredIndicateurs.length} indicateurs</span>
            <span>·</span>
            <span className="text-green-400">{filteredIndicateurs.filter(i => i.statut === 'good').length} bons</span>
            <span>·</span>
            <span className="text-amber-400">{filteredIndicateurs.filter(i => i.statut === 'warning').length} à surveiller</span>
            <span>·</span>
            <span className="text-red-400">{filteredIndicateurs.filter(i => i.statut === 'critical').length} critiques</span>
            <span className="ml-auto">
              Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Modale de détails */}
      {selectedIndicateur && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedIndicateur(null)}>
          <div 
            className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold">{selectedIndicateur.indicateur}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-white/60">{selectedIndicateur.domaine}</span>
                  <StatutBadge statut={selectedIndicateur.statut} />
                </div>
              </div>
              <button onClick={() => setSelectedIndicateur(null)} className="p-1 hover:bg-white/10 rounded-lg transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white/40 text-xs uppercase tracking-wider">Valeur actuelle</div>
                  <div className="text-2xl font-bold">{selectedIndicateur.valeur}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <div className="text-white/40 text-xs uppercase tracking-wider">Objectif</div>
                  <div className="text-2xl font-bold text-brand-cyan">{selectedIndicateur.objectif}</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-white/5 rounded-lg p-3">
                <div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">Tendance</div>
                  <TendanceBadge 
                    tendance={selectedIndicateur.tendance} 
                    variation={selectedIndicateur.variation} 
                  />
                </div>
                {selectedIndicateur.details && (
                  <div className="text-right">
                    <div className="text-white/40 text-xs uppercase tracking-wider">Détail</div>
                    <div className="text-sm text-white/60">{selectedIndicateur.details}</div>
                  </div>
                )}
              </div>

              <div>
                <div className="text-white/40 text-xs uppercase tracking-wider mb-2">Évolution sur 7 jours</div>
                <div className="flex items-end gap-1 h-32 bg-white/5 rounded-lg p-4">
                  {selectedIndicateur.historique.map((d, i) => {
                    const max = Math.max(...selectedIndicateur.historique.map(h => h.valeur))
                    const min = Math.min(...selectedIndicateur.historique.map(h => h.valeur))
                    const range = max - min || 1
                    const height = ((d.valeur - min) / range) * 100
                    
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-[10px] text-white/30">{d.valeur}</div>
                        <div 
                          className="w-full rounded-sm"
                          style={{
                            height: `${Math.max(10, height)}%`,
                            backgroundColor: height >= 70 ? '#99CC33' : height >= 40 ? '#E2B53A' : '#E0604E',
                            minHeight: '4px'
                          }}
                        />
                        <div className="text-[8px] text-white/20">{d.date.slice(5)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <button 
                onClick={() => setSelectedIndicateur(null)}
                className="flex-1 bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition text-white/60"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}