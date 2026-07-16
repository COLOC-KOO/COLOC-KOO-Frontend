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
  Info,
  Leaf,
  Share2,
  Lock,
  Box,
  FileCode,
  Layout,
  Image,
  FileJson,
  FileType2,
  FileArchive,
  DollarSign
} from 'lucide-react'
import { api } from '../../lib/api'

// ===== TYPES =====
interface PerformanceData {
  disponibilite: number
  latenceP50: number
  latenceP95: number
  hitCache: number
  scoreLighthousePerf: number
  scoreLighthouseA11y: number
  bundleJS: number
  erreursFront: number
  erreursBack: number
  tauxErreur: number
  i18nFR: number
  i18nMG: number
  i18nEN: number
  tempsReactionModeration: number
  signalementsTraites: number
  conformiteVersements: number
}

// ===== COMPOSANTS =====

// Badge de statut
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

// ===== COMPOSANT PRINCIPAL =====
export default function AdminTechnique() {
  const [searchQuery, setSearchQuery] = useState('')
  const [networkType, setNetworkType] = useState<'4g' | '3g'>('4g')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [data] = useState<PerformanceData>({
    disponibilite: 99.9,
    latenceP50: 120,
    latenceP95: 480,
    hitCache: 87,
    scoreLighthousePerf: 94,
    scoreLighthouseA11y: 98,
    bundleJS: 96,
    erreursFront: 3,
    erreursBack: 1,
    tauxErreur: 0.3,
    i18nFR: 100,
    i18nMG: 45,
    i18nEN: 15,
    tempsReactionModeration: 7,
    signalementsTraites: 88,
    conformiteVersements: 92
  })

  // KPIs pour l'en-tête
  const kpis = [
    { label: 'Chargement moyen (4G)', value: '1,4 s', color: 'text-brand-green', icon: Gauge },
    { label: 'Chargement moyen (3G)', value: '2,8 s', color: 'text-amber-400', icon: Signal },
    { label: 'LCP médian', value: '2,1 s', color: 'text-brand-cyan', icon: Clock },
    { label: 'Poids moyen par page', value: '182 Ko', color: 'text-brand-green', icon: FileCode },
    { label: 'Taux d\'erreur (JS/API)', value: '0,3 %', color: 'text-brand-green', icon: AlertCircle }
  ]

  // Métriques d'infrastructure
  const infrastructureMetrics = [
    { label: 'Disponibilité API (Supabase)', value: `${data.disponibilite}%`, status: 'good' as const, icon: Server },
    { label: 'Latence API (p50)', value: `${data.latenceP50} ms`, status: 'good' as const, icon: Zap },
    { label: 'Latence API (p95)', value: `${data.latenceP95} ms`, status: 'warning' as const, icon: Zap },
    { label: 'Taux de hit cache (CDN)', value: `${data.hitCache}%`, status: 'good' as const, icon: Cloud }
  ]

  // Métriques de qualité
  const qualiteMetrics = [
    { label: 'Score Lighthouse — Performance', value: `${data.scoreLighthousePerf}/100`, status: 'good' as const, icon: Activity },
    { label: 'Score Lighthouse — Accessibilité', value: `${data.scoreLighthouseA11y}/100`, status: 'good' as const, icon: Eye },
    { label: 'Build — Bundle JS (gzip)', value: `${data.bundleJS} Ko`, status: 'good' as const, icon: FileArchive },
    { label: 'Couverture i18n (FR)', value: `${data.i18nFR}%`, status: 'good' as const, icon: Globe },
    { label: 'Couverture i18n (MG)', value: `${data.i18nMG}%`, status: 'warning' as const, icon: Globe },
    { label: 'Couverture i18n (EN)', value: `${data.i18nEN}%`, status: 'critical' as const, icon: Globe }
  ]

  // Métriques de sécurité
  const securiteMetrics = [
    { label: 'Erreurs 24h (front)', value: `${data.erreursFront} erreurs`, status: 'good' as const, icon: Monitor },
    { label: 'Erreurs 24h (back)', value: `${data.erreursBack} erreur`, status: 'good' as const, icon: Server },
    { label: 'Score de sécurité', value: '92/100', status: 'good' as const, icon: Shield }
  ]

  // Métriques de sobriété numérique
  const sobrieteMetrics = [
    { label: 'Taille moyenne par page', value: '182 Ko', status: 'good' as const, icon: Leaf },
    { label: 'Images WebP', value: 'Oui', status: 'good' as const, icon: Image },
    { label: 'Base64 (nouvelles pages)', value: '0', status: 'good' as const, icon: FileJson }
  ]

  // Données des pages
  const pageMetrics = [
    { page: 'Accueil', load4g: 1.1, load3g: 2.6, lcp: 1.8, poids: 165, light: 'prioritaire', status: 'good' as const },
    { page: 'Résultats', load4g: 1.6, load3g: 3.4, lcp: 2.3, poids: 210, light: 'prioritaire', status: 'good' as const },
    { page: 'Fiche annonce', load4g: 1.3, load3g: 2.9, lcp: 2.0, poids: 188, light: 'prioritaire', status: 'good' as const },
    { page: 'Dépôt (wizard)', load4g: 1.8, load3g: 3.8, lcp: 2.5, poids: 232, light: 'partiel', status: 'warning' as const },
    { page: 'Compte', load4g: 1.2, load3g: 2.7, lcp: 1.9, poids: 172, light: 'toggle profil', status: 'good' as const },
    { page: 'Messagerie', load4g: 1.4, load3g: 3.1, lcp: 2.1, poids: 196, light: 'toggle profil', status: 'good' as const }
  ]

  // Données des builds
  const buildMetrics = [
    { name: 'app.js', size: 245, gzip: 76, modules: 124, status: 'good' as const, lastUpdate: '2026-06-15 14:32' },
    { name: 'vendor.js', size: 180, gzip: 55, modules: 87, status: 'good' as const, lastUpdate: '2026-06-15 14:32' },
    { name: 'admin.js', size: 96, gzip: 30, modules: 42, status: 'good' as const, lastUpdate: '2026-06-15 14:32' },
    { name: 'styles.css', size: 28, gzip: 8, modules: 1, status: 'good' as const, lastUpdate: '2026-06-15 14:32' }
  ]

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setSuccessMessage('Données actualisées')
      setTimeout(() => setSuccessMessage(null), 3000)
      setLoading(false)
    }, 800)
  }

  // Filtrer les pages par recherche
  const filteredPages = useMemo(() => {
    if (!searchQuery) return pageMetrics
    const q = searchQuery.toLowerCase()
    return pageMetrics.filter(p => p.page.toLowerCase().includes(q))
  }, [searchQuery])

  // Filtrer les builds par recherche
  const filteredBuilds = useMemo(() => {
    if (!searchQuery) return buildMetrics
    const q = searchQuery.toLowerCase()
    return buildMetrics.filter(b => b.name.toLowerCase().includes(q))
  }, [searchQuery])

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
            <select
              value={networkType}
              onChange={(e) => setNetworkType(e.target.value as '4g' | '3g')}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-cyan/50 text-white/60"
            >
              <option value="4g" className="bg-[oklch(0.22_0.005_260)]">4G (urbain)</option>
              <option value="3g" className="bg-[oklch(0.22_0.005_260)]">3G (connectivité limitée)</option>
            </select>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

        {/* ===== KPIS ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1">
                <kpi.icon className="w-4 h-4 text-white/40" />
              </div>
              <div className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</div>
              <div className="text-[10px] text-white/40">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* ===== INFRASTRUCTURE & QUALITÉ ===== */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher..."
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
              <span className="text-xs text-white/30 flex items-center ml-auto">
                {networkType === '4g' ? '📶 4G (urbain)' : '📶 3G (connectivité limitée)'}
              </span>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-white/80">Infrastructure</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {infrastructureMetrics.map((metric) => (
                <div key={metric.label} className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <metric.icon className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">{metric.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{metric.value}</span>
                    <StatusBadge status={metric.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Qualité de code */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-4 h-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-white/80">Qualité de code &amp; Sécurité</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...qualiteMetrics, ...securiteMetrics].map((metric) => (
                <div key={metric.label} className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <metric.icon className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">{metric.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{metric.value}</span>
                    <StatusBadge status={metric.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sobriété numérique */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white/80">Sobriété numérique</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {sobrieteMetrics.map((metric) => (
                <div key={metric.label} className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <metric.icon className="w-3 h-3 text-white/40" />
                    <span className="text-xs text-white/40">{metric.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{metric.value}</span>
                    <StatusBadge status={metric.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance par page */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Performance par page</h3>
              <span className="text-xs text-white/30">
                Réseau: {networkType === '4g' ? '4G' : '3G'}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Page</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Chargement</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">LCP</th>
                    <th className="text-right p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Poids</th>
                    <th className="text-left p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Lite mode</th>
                    <th className="text-center p-2 text-white/40 font-medium text-xs uppercase tracking-wider">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPages.map((page) => {
                    const loadTime = networkType === '4g' ? page.load4g : page.load3g
                    const loadClass = loadTime > 3 ? 'text-red-400' : loadTime > 2.5 ? 'text-amber-400' : 'text-green-400'
                    
                    return (
                      <tr key={page.page} className="hover:bg-white/5 transition">
                        <td className="p-2 font-medium">{page.page}</td>
                        <td className={`p-2 text-right font-bold ${loadClass}`}>{loadTime}s</td>
                        <td className="p-2 text-right">{page.lcp}s</td>
                        <td className="p-2 text-right">{page.poids}Ko</td>
                        <td className="p-2 text-xs text-white/60">{page.light}</td>
                        <td className="p-2 text-center">
                          <StatusBadge status={page.status} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bundle & Build */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">Bundle &amp; Build</h3>
              <span className="text-xs text-white/30">
                Total: {buildMetrics.reduce((sum, b) => sum + b.size, 0)}Ko
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filteredBuilds.map((build) => (
                <div key={build.name} className="bg-[oklch(0.24_0.005_260)] border border-white/10 rounded-lg p-3">
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

          {/* Pied de page */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/30">
            <span>{pageMetrics.length} pages analysées</span>
            <span>·</span>
            <span className="text-green-400">{pageMetrics.filter(p => p.status === 'good').length} bonnes</span>
            <span>·</span>
            <span className="text-amber-400">{pageMetrics.filter(p => p.status === 'warning').length} à surveiller</span>
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
              <span className="font-semibold text-white/60">Cibles de sobriété :</span> page &lt; 250 Ko, chargement &lt; 3s en 3G, mode light prioritaire. 
              Images WebP, zéro base64 sur les nouvelles pages. <br />
              <span className="text-white/30">Stack cible: Next.js + Supabase + Leaflet/OSM.</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}