import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, ApiJournalEntry } from '../../lib/api'
import {
  Search,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Ban,
  Edit,
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2
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

function normalizeJournalActionType(action: string): LogEntry['type'] {
  const normalized = String(action).toLowerCase()
  if (normalized.includes('auto') && normalized.includes('validat')) return 'auto-validation'
  if (normalized.includes('validat')) return 'validation'
  if (normalized.includes('rejet')) return 'rejet'
  if (normalized.includes('suspens')) return 'suspension'
  if (normalized.includes('correction')) return 'correction'
  if (normalized.includes('message')) return 'message'
  return 'autre'
}

function formatJournalDetail(details: unknown): string {
  if (!details) return ''
  if (typeof details === 'string') {
    try {
      return formatJournalDetail(JSON.parse(details))
    } catch {
      return details
    }
  }
  if (Array.isArray(details)) {
    return details.join(' · ')
  }
  if (typeof details === 'object') {
    return Object.entries(details)
      .filter(([, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join(' · ')
  }
  return String(details)
}

function normalizeJournalRow(row: ApiJournalEntry): LogEntry {
  const date = new Date(row.date_action)
  const dateString = isNaN(date.getTime()) ? row.date_action : date.toLocaleDateString('fr-FR')
  const timeString = isNaN(date.getTime()) ? '' : date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const actorName = [row.prenom, row.nom].filter(Boolean).join(' ') || 'Système'
  const cible = row.cible_type
    ? row.cible_id != null
      ? `${row.cible_type} ${row.cible_id}`
      : row.cible_type
    : '-'

  return {
    id: String(row.id_action),
    timestamp: row.date_action,
    date: dateString,
    time: timeString,
    acteur: actorName,
    role: row.id_utilisateur ? 'Utilisateur' : 'Automatique',
    action: row.action || 'Action',
    cible,
    detail: formatJournalDetail(row.details),
    type: normalizeJournalActionType(row.action),
  }
}

// Composant principal
export default function AdminJournalActions() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<string>('tous')
  const [filterActeur, setFilterActeur] = useState<string>('tous')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadLogs = async () => {
    setLoading(true)
    setError('')
    try {
      const rows = await api.backofficeJournal()
      setLogs(rows.map(normalizeJournalRow))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le journal')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

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
      let filtered = [...logs]
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette entrée du journal ?')) return

    setDeletingId(id)
    try {
      await api.deleteBackofficeJournalEntry(id)
      await loadLogs()
      setExpandedLog(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer cette entrée')
    } finally {
      setDeletingId(null)
    }
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
            {error && (
              <div className="mt-3 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
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
            {loading ? (
              <div className="text-center py-12 text-white/40">
                <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Chargement des actions...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
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

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(log.id)
                        }}
                        
                        disabled={deletingId === log.id}
                        className="rounded-full p-2 text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Supprimer cette entrée"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button className="text-white/30 hover:text-white/60 transition">
                        {expandedLog === log.id ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </div>
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