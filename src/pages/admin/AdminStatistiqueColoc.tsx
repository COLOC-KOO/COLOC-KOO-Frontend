import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api } from '../../lib/api'
import {
  BarChart3,
  PieChart,
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Home,
  Users,
  DollarSign,
  Percent,
  Building2,
  Wifi,
  Car,
  Dog,
  Coffee,
  Utensils,
  Droplets,
  Zap,
  Flame,
  Trees,
  Waves,
  Mountain,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake,
  Wind,
  Thermometer,
  Activity,
  MapPin,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Database,
  FileSpreadsheet,
  Info
} from 'lucide-react'

// Types
interface Annonce {
  id: string
  date: string
  quartier: string
  type: 'Appartement' | 'Maison' | 'Autre'
  annonce: 'Colocation existante' | 'Création'
  nbColocs: number
  surface: number
  surfChambre: number
  loyer: number
  charges: number
  caution: number
  meuble: 'Oui' | 'Partiellement' | 'Non' | 'Rachat'
  internet: 'Fibre' | 'ADSL' | 'Box' | 'Aucune'
  parkingVoit: number
  parking2r: number
  commod: string[]
  svck: string[]
  filles: boolean
  garcons: boolean
  animaux: boolean
  fumeurs: boolean
}

interface StatItem {
  label: string
  value: number
  dkey?: string
}

// Génération de données mockées
const generateMockData = (): Annonce[] => {
  const quartiers = ['Analakely', 'Ivandry', 'Ankorondrano', '67 Ha', 'Andoharanofotsy', 'Antanimena', 'Ambohijatovo', 'Ambatobe', 'Andraharo', 'Toamasina', 'Antsirabe', 'Mahajanga']
  const types: ('Appartement' | 'Maison' | 'Autre')[] = ['Appartement', 'Appartement', 'Maison', 'Maison', 'Autre']
  const meubles: ('Oui' | 'Partiellement' | 'Non' | 'Rachat')[] = ['Oui', 'Oui', 'Partiellement', 'Non', 'Rachat']
  const internets: ('Fibre' | 'ADSL' | 'Box' | 'Aucune')[] = ['Fibre', 'ADSL', 'Box', 'Fibre', 'ADSL', 'Aucune']
  const commods = ['Eau courante', 'Surpresseur', 'Balcon', 'Jardin', 'Piscine', 'BBQ', 'Gazinière', 'Four', 'Machine à laver', 'Abri vélo/moto']
  const svcks = ['Gardien', 'Femme de ménage', 'Jardinier', 'Porteurs d\'eau', 'Intendance']

  const data: Annonce[] = []
  const seed = 12345
  
  const rng = () => {
    let s = seed
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff
      return s / 0x7fffffff
    }
  }
  const rand = rng()

  for (let i = 0; i < 160; i++) {
    const mb = Math.floor(rand() * 24)
    const d = new Date(2026, 6 - mb - 1, Math.floor(rand() * 28) + 1)
    const q = quartiers[Math.floor(rand() * quartiers.length)]
    const coef = 0.8 + rand() * 0.8
    const loyer = Math.round((180 + rand() * 340) * coef) * 1000
    
    data.push({
      id: `A-${String(2000 + i).padStart(4, '0')}`,
      date: d.toISOString().slice(0, 10),
      quartier: q,
      type: types[Math.floor(rand() * types.length)],
      annonce: rand() < 0.6 ? 'Colocation existante' : 'Création',
      nbColocs: Math.floor(rand() * 5) + 2,
      surface: Math.floor(45 + rand() * 115),
      surfChambre: Math.floor(9 + rand() * 13),
      loyer: loyer,
      charges: Math.floor((20 + rand() * 100) * 1000),
      caution: loyer,
      meuble: meubles[Math.floor(rand() * meubles.length)],
      internet: internets[Math.floor(rand() * internets.length)],
      parkingVoit: Math.floor(rand() * 3),
      parking2r: Math.floor(rand() * 4),
      commod: commods.filter(() => rand() < 0.4),
      svck: svcks.filter(() => rand() < 0.28),
      filles: rand() < 0.15,
      garcons: rand() < 0.12,
      animaux: rand() < 0.3,
      fumeurs: rand() < 0.2
    })
  }
  
  return data
}

// Composant de barres horizontales
const HorizontalBars = ({ 
  items, 
  color = 'var(--brand-cyan)',
  format,
  drill
}: { 
  items: StatItem[]
  color?: string
  format?: (v: number) => string
  drill?: (key: string) => void
}) => {
  if (!items.length) return <div className="text-white/40 text-sm">Aucune donnée</div>
  
  const max = Math.max(...items.map(x => x.value)) || 1
  
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const width = Math.round((item.value / max) * 100)
        return (
          <div 
            key={item.label} 
            className={`flex items-center gap-3 ${drill ? 'cursor-pointer hover:bg-white/5 rounded-lg px-2 py-1 transition' : ''}`}
            onClick={() => drill && drill(item.dkey || item.label)}
          >
            <div className="text-xs text-white/60 w-24 sm:w-32 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${Math.max(2, width)}%`,
                  background: color
                }}
              />
            </div>
            <div className="text-xs font-medium w-16 text-right">
              {format ? format(item.value) : item.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Composant de barres verticales
const VerticalBars = ({ 
  items,
  format
}: { 
  items: { label: string; value: number }[]
  format?: (v: number) => string
}) => {
  if (!items.length) return <div className="text-white/40 text-sm">Aucune donnée</div>
  
  const max = Math.max(...items.map(x => x.value)) || 1
  
  return (
    <div className="flex items-end gap-1 h-40 overflow-x-auto pb-2">
      {items.map((item) => {
        const height = Math.round((item.value / max) * 100)
        return (
          <div key={item.label} className="flex flex-col items-center flex-shrink-0 min-w-[32px]">
            <div className="text-[10px] text-white/60 mb-1">
              {format ? format(item.value) : item.value}
            </div>
            <div 
              className="w-6 rounded-t-sm"
              style={{ 
                height: `${Math.max(4, height)}%`,
                background: 'linear-gradient(180deg, var(--brand-cyan), var(--brand-green))'
              }}
            />
            <div className="text-[8px] text-white/30 mt-1 text-center leading-tight max-w-[40px] truncate">
              {item.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Composant principal
export default function AdminStatistiquesColocation() {
  const [data, setData] = useState<Annonce[]>([])
  const [period, setPeriod] = useState<number>(12)
  const [month, setMonth] = useState<number>(6)
  const [year, setYear] = useState<number>(2026)
  const [searchQuery, setSearchQuery] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtrer les données par période
  const filteredData = useMemo(() => {
    const end = new Date(year, month, 0)
    const start = new Date(year, month - period, 1)
    
    let filtered = data.filter(d => {
      const dt = new Date(d.date)
      return dt >= start && dt <= end
    })

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(d =>
        d.quartier.toLowerCase().includes(query) ||
        d.type.toLowerCase().includes(query) ||
        d.internet.toLowerCase().includes(query) ||
        d.commod.some(c => c.toLowerCase().includes(query)) ||
        d.svck.some(s => s.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [data, period, month, year, searchQuery])

  // Statistiques globales
  const stats = useMemo(() => {
    const total = filteredData.length
    if (!total) return null

    const loyerMoy = Math.round(filteredData.reduce((sum, d) => sum + d.loyer, 0) / total)
    const surfaceMoy = Math.round(filteredData.reduce((sum, d) => sum + d.surface, 0) / total)
    const surfChambreMoy = Math.round(filteredData.reduce((sum, d) => sum + d.surfChambre, 0) / total)
    const chargesMoy = Math.round(filteredData.reduce((sum, d) => sum + d.charges, 0) / total)
    const nbColocsMoy = filteredData.reduce((sum, d) => sum + d.nbColocs, 0) / total
    const avecInternet = filteredData.filter(d => d.internet !== 'Aucune').length
    const avecServices = filteredData.filter(d => d.svck.length > 0).length
    
    return {
      total,
      loyerMoy,
      surfaceMoy,
      surfChambreMoy,
      chargesMoy,
      nbColocsMoy: nbColocsMoy.toFixed(1),
      avecInternet,
      avecServices,
      pctInternet: Math.round((avecInternet / total) * 100),
      pctServices: Math.round((avecServices / total) * 100)
    }
  }, [filteredData])

  // Données par quartier
  const quartierData = useMemo(() => {
    const groups: Record<string, { loyers: number[]; count: number }> = {}
    filteredData.forEach(d => {
      if (!groups[d.quartier]) groups[d.quartier] = { loyers: [], count: 0 }
      groups[d.quartier].loyers.push(d.loyer)
      groups[d.quartier].count++
    })
    
    return Object.entries(groups)
      .map(([label, data]) => ({
        label,
        dkey: label,
        value: Math.round(data.loyers.reduce((a, b) => a + b, 0) / data.loyers.length)
      }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Données par type de logement
  const typeData = useMemo(() => {
    const groups: Record<string, number> = {}
    filteredData.forEach(d => {
      groups[d.type] = (groups[d.type] || 0) + 1
    })
    return ['Appartement', 'Maison', 'Autre'].map(label => ({
      label,
      dkey: label,
      value: groups[label] || 0
    }))
  }, [filteredData])

  // Données par connexion internet
  const internetData = useMemo(() => {
    const groups: Record<string, number> = {}
    filteredData.forEach(d => {
      groups[d.internet] = (groups[d.internet] || 0) + 1
    })
    return ['Fibre', 'ADSL', 'Box', 'Aucune'].map(label => ({
      label,
      dkey: label,
      value: groups[label] || 0
    }))
  }, [filteredData])

  // Données par nombre de colocataires
  const colocData = useMemo(() => {
    const groups: Record<number, number> = {}
    filteredData.forEach(d => {
      groups[d.nbColocs] = (groups[d.nbColocs] || 0) + 1
    })
    return [2, 3, 4, 5, 6].map(n => ({
      label: `${n} colocs`,
      dkey: String(n),
      value: groups[n] || 0
    }))
  }, [filteredData])

  // Données des commodités
  const commodData = useMemo(() => {
    const groups: Record<string, number> = {}
    filteredData.forEach(d => {
      d.commod.forEach(c => {
        groups[c] = (groups[c] || 0) + 1
      })
    })
    return Object.entries(groups)
      .map(([label, value]) => ({ label, dkey: label, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Données des services
  const svckData = useMemo(() => {
    const groups: Record<string, number> = {}
    filteredData.forEach(d => {
      d.svck.forEach(s => {
        groups[s] = (groups[s] || 0) + 1
      })
    })
    return Object.entries(groups)
      .map(([label, value]) => ({ label, dkey: label, value }))
      .sort((a, b) => b.value - a.value)
  }, [filteredData])

  // Évolution temporelle
  const timeData = useMemo(() => {
    const groups: Record<string, { count: number; loyers: number[] }> = {}
    filteredData.forEach(d => {
      const key = d.date.slice(0, 7)
      if (!groups[key]) groups[key] = { count: 0, loyers: [] }
      groups[key].count++
      groups[key].loyers.push(d.loyer)
    })
    
    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => ({
        label: key.slice(5) + '/' + key.slice(2, 4),
        value: data.count,
        loyerMoy: Math.round(data.loyers.reduce((a, b) => a + b, 0) / data.loyers.length)
      }))
  }, [filteredData])

  // Formatage des montants
  const formatMoney = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
    return String(v)
  }

  // Drill-down
  const handleDrill = (field: string, value: string) => {
    const filtered = filteredData.filter(d => {
      if (field === 'quartier') return d.quartier === value
      if (field === 'type') return d.type === value
      if (field === 'internet') return d.internet === value
      if (field === 'nbColocs') return d.nbColocs === parseInt(value)
      if (field === 'commod') return d.commod.includes(value)
      if (field === 'svck') return d.svck.includes(value)
      return false
    })
    
    // Afficher les détails dans une modale
    const details = filtered.map(d => 
      `${d.date} - ${d.quartier} - ${d.type} - ${d.nbColocs} colocs - ${d.loyer.toLocaleString()} Ar`
    ).join('\n')
    
    alert(`🔍 Détail - ${field}: ${value}\n\n${filtered.length} annonces trouvées\n\n${details.slice(0, 500)}${details.length > 500 ? '\n...' : ''}`)
  }

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.backofficeColocationStats()
      const items = Array.isArray(response?.items) ? response.items : []
      setData((items as unknown as Annonce[]))
      if (!items.length) {
        setSuccessMessage('Aucune annonce disponible pour le moment')
        window.setTimeout(() => setSuccessMessage(null), 2500)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les statistiques')
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // Export CSV
  const handleExport = () => {
    const headers = ['Date', 'Quartier', 'Type', 'Nb Colocs', 'Surface', 'Surface Chambre', 'Loyer', 'Charges', 'Internet', 'Meuble', 'Commodités', 'Services']
    const rows = filteredData.map(d => [
      d.date,
      d.quartier,
      d.type,
      d.nbColocs,
      d.surface,
      d.surfChambre,
      d.loyer,
      d.charges,
      d.internet,
      d.meuble,
      d.commod.join(' | '),
      d.svck.join(' | ')
    ])
    
    const csv = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `statistiques_colocation_${year}-${String(month).padStart(2, '0')}_${period}mois.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setSuccessMessage('Export CSV effectué avec succès')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  // Rafraîchir les données
  const handleRefresh = () => {
    void loadData()
    setSuccessMessage('Actualisation des données…')
    setTimeout(() => setSuccessMessage(null), 2000)
  }

  // Formater le mois
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Statistiques de la colocation à Madagascar</h1>
            <p className="text-white/50 text-sm">
              Synthèse des données chiffrables des annonces déposées
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-lg text-sm hover:bg-brand-cyan/25 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Exporter CSV
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Filtres */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {/* Période */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/40">Période</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value={1} className="bg-[oklch(0.22_0.005_260)]">Mensuelle (30j)</option>
                  <option value={3} className="bg-[oklch(0.22_0.005_260)]">Trimestrielle</option>
                  <option value={6} className="bg-[oklch(0.22_0.005_260)]">Semestrielle</option>
                  <option value={12} className="bg-[oklch(0.22_0.005_260)]">Annuelle</option>
                  <option value={24} className="bg-[oklch(0.22_0.005_260)]">Bi-annuelle</option>
                </select>
              </div>

              {/* Mois */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-white/40">jusqu'à</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {monthNames.map((m, i) => (
                    <option key={i} value={i + 1} className="bg-[oklch(0.22_0.005_260)]">{m}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  <option value={2024} className="bg-[oklch(0.22_0.005_260)]">2024</option>
                  <option value={2025} className="bg-[oklch(0.22_0.005_260)]">2025</option>
                  <option value={2026} className="bg-[oklch(0.22_0.005_260)]">2026</option>
                </select>
              </div>

              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 min-w-[180px]">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Filtrer par quartier, type..."
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

              <span className="text-xs text-white/40 flex items-center">
                {filteredData.length} annonces
              </span>
            </div>
          </div>

          {loading && (
            <div className="p-4 text-sm text-white/50">Chargement des statistiques depuis le backend…</div>
          )}

          {/* KPIs */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 border-b border-white/10">
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-brand-cyan">{stats.total}</div>
                <div className="text-[10px] text-white/40">Annonces</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-brand-green">{formatMoney(stats.loyerMoy)}</div>
                <div className="text-[10px] text-white/40">Loyer moyen</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{stats.surfaceMoy} m²</div>
                <div className="text-[10px] text-white/40">Surface moyenne</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-400">{stats.nbColocsMoy}</div>
                <div className="text-[10px] text-white/40">Colocataires (moy.)</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-cyan-400">{stats.pctInternet}%</div>
                <div className="text-[10px] text-white/40">Avec internet</div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-pink-400">{stats.pctServices}%</div>
                <div className="text-[10px] text-white/40">Avec services</div>
              </div>
            </div>
          )}

          {/* Évolution temporelle */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Évolution dans le temps</h3>
              <span className="text-xs text-white/40">Annonces déposées</span>
            </div>
            <VerticalBars 
              items={timeData.map(d => ({ label: d.label, value: d.value }))}
            />
            <div className="flex justify-between text-[8px] text-white/20 mt-1">
              <span>{monthNames[month - period < 0 ? 0 : month - period]} {year}</span>
              <span>{monthNames[month - 1]} {year}</span>
            </div>
          </div>

          {/* Grille de statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Loyer moyen par quartier */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Loyer moyen par quartier</h3>
              </div>
              <HorizontalBars 
                items={quartierData}
                color="linear-gradient(90deg, var(--brand-green), var(--brand-cyan))"
                format={(v) => `${(v / 1000).toFixed(0)}k Ar`}
                drill={(key) => handleDrill('quartier', key)}
              />
            </div>

            {/* Type de logement */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Type de logement</h3>
              </div>
              <HorizontalBars 
                items={typeData}
                color="linear-gradient(90deg, #46BDD6, #99CC33)"
                drill={(key) => handleDrill('type', key)}
              />
            </div>

            {/* Connexion internet */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Connexion internet</h3>
              </div>
              <HorizontalBars 
                items={internetData}
                color="linear-gradient(90deg, #E2B53A, #99CC33)"
                drill={(key) => handleDrill('internet', key)}
              />
            </div>

            {/* Nombre de colocataires */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Nombre de colocataires</h3>
              </div>
              <HorizontalBars 
                items={colocData}
                color="linear-gradient(90deg, #CD6CA8, #46BDD6)"
                drill={(key) => handleDrill('nbColocs', key)}
              />
            </div>

            {/* Commodités */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Commodités les plus fréquentes</h3>
              </div>
              <HorizontalBars 
                items={commodData.slice(0, 8)}
                color="linear-gradient(90deg, #99CC33, #CCCC33)"
                drill={(key) => handleDrill('commod', key)}
              />
            </div>

            {/* Services Coloc'KOO */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-brand-cyan" />
                <h3 className="text-sm font-semibold text-white/80">Services Coloc'KOO demandés</h3>
              </div>
              <HorizontalBars 
                items={svckData}
                color="linear-gradient(90deg, #46BDD6, #CD6CA8)"
                drill={(key) => handleDrill('svck', key)}
              />
            </div>
          </div>

          {/* Pied de page */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/30">
            <span>{filteredData.length} annonces analysées</span>
            <span>·</span>
            <span>Période: {period} mois</span>
            <span>·</span>
            <span>Jusqu'à {monthNames[month - 1]} {year}</span>
            <span className="ml-auto">
              Données simulées · {new Date().toLocaleString('fr-FR')}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-white/40 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-white/40">
              Ces statistiques sont désormais alimentées par les données du backend. 
              Les graphiques se basent sur les annonces réellement présentes dans la base et se mettent à jour automatiquement.
              Cliquez sur les barres pour filtrer les données.
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}