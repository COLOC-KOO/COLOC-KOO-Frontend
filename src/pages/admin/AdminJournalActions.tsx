import React, { useState, useMemo } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  Search,
  Filter,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Ban,
  Edit,
  Eye,
  MessageCircle,
  Shield,
  History,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

// Types
interface LogEntry {
  id: string
  timestamp: string
  date: string
  time: string
  acteur: string
  role: string
  action: string
  cible: string
  detail: string
  type: 'validation' | 'rejet' | 'correction' | 'suspension' | 'message' | 'auto-validation' | 'autre'
}

// Données mockées
const MOCK_LOG: LogEntry[] = [
  {
    id: 'L-001',
    timestamp: '2026-06-15T09:41:00',
    date: '15/06/2026',
    time: '09:41',
    acteur: 'Hanta R.',
    role: 'Modérateur',
    action: 'Validation',
    cible: 'A-2052',
    detail: 'Annonce conforme',
    type: 'validation'
  },
  {
    id: 'L-002',
    timestamp: '2026-06-15T09:38:00',
    date: '15/06/2026',
    time: '09:38',
    acteur: 'Hanta R.',
    role: 'Modérateur',
    action: 'Rejet',
    cible: 'A-2050',
    detail: 'Logement inexistant (arnaque)',
    type: 'rejet'
  },
  {
    id: 'L-003',
    timestamp: '2026-06-15T09:30:00',
    date: '15/06/2026',
    time: '09:30',
    acteur: 'Tovo M.',
    role: 'Modérateur',
    action: 'Suspension',
    cible: 'Mamy C.',
    detail: '3e signalement fondé',
    type: 'suspension'
  },
  {
    id: 'L-004',
    timestamp: '2026-06-15T09:22:00',
    date: '15/06/2026',
    time: '09:22',
    acteur: 'Hanta R.',
    role: 'Modérateur',
    action: 'Correction',
    cible: 'A-2048',
    detail: 'Charges non communiquées',
    type: 'correction'
  },
  {
    id: 'L-005',
    timestamp: '2026-06-15T09:15:00',
    date: '15/06/2026',
    time: '09:15',
    acteur: 'Hanta R.',
    role: 'Modérateur',
    action: 'Message',
    cible: 'A-2048',
    detail: 'Modèle "Renseignements manquants"',
    type: 'message'
  },
  {
    id: 'L-006',
    timestamp: '2026-06-15T08:45:00',
    date: '15/06/2026',
    time: '08:45',
    acteur: 'Système',
    role: 'Automatique',
    action: 'Validation auto.',
    cible: 'A-2035',
    detail: 'Délai 1h écoulé sans action',
    type: 'auto-validation'
  },
  {
    id: 'L-007',
    timestamp: '2026-06-14T16:20:00',
    date: '14/06/2026',
    time: '16:20',
    acteur: 'Sata L.',
    role: 'Admin',
    action: 'Suspension',
    cible: 'Partenaire BTP Vato',
    detail: 'Non-conformité des données',
    type: 'suspension'
  },
  {
    id: 'L-008',
    timestamp: '2026-06-14T14:10:00',
    date: '14/06/2026',
    time: '14:10',
    acteur: 'Hanta R.',
    role: 'Modérateur',
    action: 'Validation',
    cible: 'A-2041',
    detail: 'Annonce conforme après correction',
    type: 'validation'
  },
  {
    id: 'L-009',
    timestamp: '2026-06-14T11:30:00',
    date: '14/06/2026',
    time: '11:30',
    acteur: 'Tovo M.',
    role: 'Modérateur',
    action: 'Message',
    cible: 'Naina B.',
    detail: 'Avertissement pour comportement',
    type: 'message'
  },
  {
    id: 'L-010',
    timestamp: '2026-06-14T10:00:00',
    date: '14/06/2026',
    time: '10:00',
    acteur: 'Système',
    role: 'Automatique',
    action: 'Validation auto.',
    cible: 'A-2031',
    detail: 'Délai 1h écoulé sans action',
    type: 'auto-validation'
  }
]

// Composant de badge d'action
const ActionBadge = ({ type }: { type: LogEntry['type'] }) => {
  const config = {
    'validation': { label: 'Validation', className: 'bg-green-500/15 text-green-400 border-green-500/30', icon: CheckCircle },
    'auto-validation': { label: 'Validation auto.', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30', icon: Clock },
    'rejet': { label: 'Rejet', className: 'bg-red-500/15 text-red-400 border-red-500/30', icon: XCircle },
    'correction': { label: 'Correction', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: Edit },
    'suspension': { label: 'Suspension', className: 'bg-purple-500/15 text-purple-400 border-purple-500/30', icon: Ban },
    'message': { label: 'Message', className: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', icon: Mail },
    'autre': { label: 'Autre', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30', icon: AlertCircle }
  }
  const { label, className, icon: Icon } = config[type] || config['autre']
  
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

// Composant principal
export default function AdminJournalActions() {
  const [logs, setLogs] = useState(MOCK_LOG)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('tous')
  const [filterActeur, setFilterActeur] = useState<string>('tous')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  // Récupérer les acteurs uniques pour le filtre
  const acteurs = useMemo(() => {
    const unique = new Set(logs.map(log => log.acteur))
    return ['tous', ...Array.from(unique)]
  }, [logs])

  // Types d'actions uniques pour le filtre
  const actionTypes = useMemo(() => {
    const unique = new Set(logs.map(log => log.action))
    return ['tous', ...Array.from(unique)]
  }, [logs])

  // Filtrer et trier les logs
  const filteredLogs = useMemo(() => {
    let filtered = logs

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(log =>
        log.acteur.toLowerCase().includes(query) ||
        log.cible.toLowerCase().includes(query) ||
        log.detail.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query)
      )
    }

    // Filtre par type d'action
    if (filterType !== 'tous') {
      filtered = filtered.filter(log => log.action === filterType)
    }

    // Filtre par acteur
    if (filterActeur !== 'tous') {
      filtered = filtered.filter(log => log.acteur === filterActeur)
    }

    // Tri par date
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [logs, searchQuery, filterType, filterActeur, sortOrder])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: logs.length,
      today: logs.filter(log => {
        const today = new Date().toDateString()
        return new Date(log.timestamp).toDateString() === today
      }).length,
      validation: logs.filter(log => log.type === 'validation' || log.type === 'auto-validation').length,
      suspension: logs.filter(log => log.type === 'suspension').length
    }
  }, [logs])

  // Toggle expansion d'un log
  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id)
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="bebas text-3xl text-white">Journal d'actions</h1>
            <p className="text-white/50 text-sm">
              {stats.total} actions au total · {stats.today} aujourd'hui · {stats.validation} validations · {stats.suspension} suspensions
            </p>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Recherche */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher une action..."
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
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {actionTypes.map(type => (
                    <option key={type} value={type} className="bg-[oklch(0.22_0.005_260)]">
                      {type === 'tous' ? 'Toutes les actions' : type}
                    </option>
                  ))}
                </select>

                <select
                  value={filterActeur}
                  onChange={(e) => setFilterActeur(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-brand-cyan/50"
                >
                  {acteurs.map(acteur => (
                    <option key={acteur} value={acteur} className="bg-[oklch(0.22_0.005_260)]">
                      {acteur === 'tous' ? 'Tous les acteurs' : acteur}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition"
                >
                  <Calendar className="w-4 h-4" />
                  {sortOrder === 'desc' ? 'Plus récent' : 'Plus ancien'}
                  {sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Liste des logs */}
          <div className="divide-y divide-white/5">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Aucune action trouvée</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="p-4 hover:bg-white/5 transition"
                >
                  <div 
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => toggleExpand(log.id)}
                  >
                    {/* Icône */}
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                      {log.type === 'validation' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {log.type === 'auto-validation' && <Clock className="w-4 h-4 text-blue-400" />}
                      {log.type === 'rejet' && <XCircle className="w-4 h-4 text-red-400" />}
                      {log.type === 'correction' && <Edit className="w-4 h-4 text-amber-400" />}
                      {log.type === 'suspension' && <Ban className="w-4 h-4 text-purple-400" />}
                      {log.type === 'message' && <Mail className="w-4 h-4 text-cyan-400" />}
                      {log.type === 'autre' && <AlertCircle className="w-4 h-4 text-gray-400" />}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-white/40">{log.date}</span>
                        <span className="text-xs text-white/40">{log.time}</span>
                        <ActionBadge type={log.type} />
                        <span className="text-sm font-medium">{log.action}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {log.acteur}
                          <span className="text-white/30">({log.role})</span>
                        </span>
                        <span>→</span>
                        <span className="font-medium text-white/80">{log.cible}</span>
                      </div>

                      {/* Détail */}
                      <div className="mt-1.5 text-sm text-white/70 line-clamp-1">
                        {log.detail}
                      </div>

                      {/* Détail étendu */}
                      {expandedLog === log.id && (
                        <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                          <div className="space-y-2 text-sm">
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Action :</span>
                              <span className="text-white/80">{log.action}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Acteur :</span>
                              <span className="text-white/80">{log.acteur}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Rôle :</span>
                              <span className="text-white/80">{log.role}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Cible :</span>
                              <span className="text-white/80">{log.cible}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Détail :</span>
                              <span className="text-white/80">{log.detail}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">Date :</span>
                              <span className="text-white/80">{log.date} à {log.time}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="text-white/40 w-20">ID :</span>
                              <span className="text-white/40 text-xs">{log.id}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Indicateur d'expansion */}
                    <button className="text-white/30 hover:text-white/60 transition">
                      {expandedLog === log.id ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de tableau */}
          <div className="p-4 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs text-white/40">
            <span>Total: {filteredLogs.length} actions</span>
            <span>·</span>
            <span>Validations: {filteredLogs.filter(log => log.type === 'validation' || log.type === 'auto-validation').length}</span>
            <span>·</span>
            <span>Rejets: {filteredLogs.filter(log => log.type === 'rejet').length}</span>
            <span>·</span>
            <span>Suspensions: {filteredLogs.filter(log => log.type === 'suspension').length}</span>
            <span>·</span>
            <span>Messages: {filteredLogs.filter(log => log.type === 'message').length}</span>
            <span className="ml-auto">
              Dernière action: {filteredLogs.length > 0 ? filteredLogs[0].time : '-'}
            </span>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}