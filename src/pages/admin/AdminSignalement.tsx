import React, { useEffect, useMemo, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  AlertCircle,
  Mail,
  MessageCircle,
  Search,
  X,
  CheckCircle,
  Clock,
  Flag,
  Ban,
} from 'lucide-react'
import { api } from '../../lib/api'

interface Message {
  sender: 'A' | 'B'
  text: string
  timestamp: string
}

interface ConversationSignalement {
  id: string
  motif: string
  signaler: string
  date: string
  status: 'new' | 'in_progress' | 'resolved' | 'dismissed'
  messages: Message[]
  participants: {
    id: string
    name: string
    role: string
  }[]
  actions: {
    suspension?: {
      membre: string
      date: string
      duree: number
    }
    avertissement?: {
      envoye: boolean
      date: string
    }
  }
  rawId?: number
  raw?: unknown
}

const StatusBadge = ({ status }: { status: ConversationSignalement['status'] }) => {
  const config: Record<ConversationSignalement['status'], { label: string; className: string }> = {
    new: { label: 'Nouveau', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
    in_progress: { label: 'En cours', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    resolved: { label: 'Traité', className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    dismissed: { label: 'Classé', className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  }
  const { label, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${className}`}>
      {status === 'new' && <Clock className="w-3 h-3" />}
      {status === 'in_progress' && <AlertCircle className="w-3 h-3" />}
      {status === 'resolved' && <CheckCircle className="w-3 h-3" />}
      {status === 'dismissed' && <X className="w-3 h-3" />}
      {label}
    </span>
  )
}

const ConversationView = ({
  signalement,
  onAction,
  onClose,
}: {
  signalement: ConversationSignalement
  onAction: (id: string, action: string, membre?: string, payload?: { raison?: string; contenu?: string }) => Promise<void>
  onClose: () => void
}) => {
  const [showFull, setShowFull] = useState(false)
  const [showWarnForm, setShowWarnForm] = useState(false)
  const [warnRecipient, setWarnRecipient] = useState<'A' | 'B'>('A')
  const [warnMessage, setWarnMessage] = useState('')
  const [warnSending, setWarnSending] = useState(false)
  const visibleMessages = showFull ? signalement.messages : signalement.messages.slice(0, 5)

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold">#{signalement.rawId ?? signalement.id}</h3>
              <StatusBadge status={signalement.status} />
            </div>
            <p className="text-white/50 text-sm mt-1">
              {signalement.motif} · signalé par {signalement.signaler} · {signalement.date}
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-white/10 flex gap-6 text-sm">
          {signalement.participants.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold">
                {p.name[0]}
              </div>
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-white/40 text-xs">{p.role}</div>
              </div>
              {i === 0 && <span className="text-white/30 text-xs ml-1">(Membre A)</span>}
              {i === 1 && <span className="text-white/30 text-xs ml-1">(Membre B)</span>}
            </div>
          ))}
        </div>

        <div className="p-4 overflow-y-auto max-h-[40vh]">
          <div className="space-y-3">
            {visibleMessages.map((msg, idx) => {
              const isA = msg.sender === 'A'
              const participant = isA ? signalement.participants[0] : signalement.participants[1]

              return (
                <div key={idx} className={`flex ${isA ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2.5 ${
                      isA ? 'bg-white/5 border border-white/10' : 'bg-brand-cyan/15 border border-brand-cyan/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-white/50 mb-1">
                      <span className="font-bold">{participant?.name}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              )
            })}

            {signalement.messages.length > 5 && (
              <button
                onClick={() => setShowFull(!showFull)}
                className="w-full text-center text-xs text-white/40 hover:text-white/70 py-2 transition"
              >
                {showFull ? 'Voir moins' : `Voir les ${signalement.messages.length - 5} messages suivants`}
              </button>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex flex-wrap gap-2">
          {!showWarnForm ? (
            <button
              onClick={() => setShowWarnForm(true)}
              className="px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/25 transition"
            >
              <Mail className="w-3 h-3 inline mr-1" />
              Envoyer un avertissement
            </button>
          ) : (
            <div className="w-full max-w-2xl bg-white/5 p-3 rounded-lg">
              <div className="mb-2 text-xs text-white/70">Envoyer un avertissement à</div>
              <div className="flex gap-2 mb-2">
                <button
                  className={`px-3 py-1.5 text-xs rounded-lg ${warnRecipient === 'A' ? 'bg-white/10' : 'bg-transparent'}`}
                  onClick={() => setWarnRecipient('A')}
                >
                  Membre A — {signalement.participants[0]?.name}
                </button>
                <button
                  className={`px-3 py-1.5 text-xs rounded-lg ${warnRecipient === 'B' ? 'bg-white/10' : 'bg-transparent'}`}
                  onClick={() => setWarnRecipient('B')}
                >
                  Membre B — {signalement.participants[1]?.name}
                </button>
              </div>
              <textarea
                rows={3}
                value={warnMessage}
                onChange={(e) => setWarnMessage(e.target.value)}
                placeholder="Message d'avertissement (optionnel)"
                className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm mb-2"
              />
              <div className="flex gap-2">
                <button
                    onClick={async () => {
                      const memberId = warnRecipient === 'A' ? signalement.participants[0]?.id : signalement.participants[1]?.id
                      if (!memberId) return
                      try {
                        setWarnSending(true)
                        await onAction(signalement.id, 'warn', memberId as string, { contenu: warnMessage })
                      } finally {
                        setWarnSending(false)
                        setShowWarnForm(false)
                        setWarnMessage('')
                      }
                    }}
                  disabled={warnSending}
                  className="px-3 py-1.5 bg-amber-500/15 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-medium hover:bg-amber-500/25 transition"
                >
                  {warnSending ? 'Envoi…' : 'Envoyer'}
                </button>
                <button onClick={() => { setShowWarnForm(false); setWarnMessage('') }} className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs">Annuler</button>
              </div>
            </div>
          )}
          <button
            onClick={() => onAction(signalement.id, 'resolve')}
            className="px-3 py-1.5 bg-green-500/15 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium hover:bg-green-500/25 transition"
          >
            <CheckCircle className="w-3 h-3 inline mr-1" />
            Marquer traité
          </button>
          <button
            onClick={() => onAction(signalement.id, 'dismiss')}
            className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition"
          >
            Classer sans suite
          </button>
          <button
            onClick={() => onAction(signalement.id, 'open')}
            className="px-3 py-1.5 bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30 rounded-lg text-xs font-medium hover:bg-brand-cyan/25 transition ml-auto"
          >
            <MessageCircle className="w-3 h-3 inline mr-1" />
            Ouvrir la conversation
          </button>

          {/* Admin moderation actions per participant */}
          {signalement.participants[0] && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction(signalement.id, 'suspend', signalement.participants[0].id)}
                className="px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-600/20 rounded-lg text-xs font-medium hover:bg-red-600/20 transition"
              >
                <Ban className="w-3 h-3 inline mr-1" />
                Suspendre A
              </button>
              <button
                onClick={() => onAction(signalement.id, 'deactivate', signalement.participants[0].id)}
                className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition"
              >
                Désactiver A
              </button>
            </div>
          )}
          {signalement.participants[1] && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAction(signalement.id, 'suspend', signalement.participants[1].id)}
                className="px-3 py-1.5 bg-red-600/10 text-red-400 border border-red-600/20 rounded-lg text-xs font-medium hover:bg-red-600/20 transition"
              >
                <Ban className="w-3 h-3 inline mr-1" />
                Suspendre B
              </button>
              <button
                onClick={() => onAction(signalement.id, 'deactivate', signalement.participants[1].id)}
                className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition"
              >
                Désactiver B
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminSignalements() {
  const [signalements, setSignalements] = useState<ConversationSignalement[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSignalement, setSelectedSignalement] = useState<ConversationSignalement | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('tous')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadSignalements = async () => {
      try {
        setLoading(true)
        const rows = await api.backofficeSignalements()
        const mapped = rows.map((row) => {
          const participants = [
            { id: String(row.id_utilisateur_signalant ?? 'unknown'), name: [row.signaleur_prenom, row.signaleur_nom].filter(Boolean).join(' ').trim() || 'Utilisateur', role: 'Signaleur' },
            { id: String(row.id_utilisateur_cible ?? 'unknown'), name: [row.cible_prenom, row.cible_nom].filter(Boolean).join(' ').trim() || 'Cible', role: 'Cible' },
          ]
          return {
            id: `#${row.id_signalement}`,
            motif: row.raison || row.description || 'Signalement de conversation',
            signaler: [row.signaleur_prenom, row.signaleur_nom].filter(Boolean).join(' ').trim() || 'Utilisateur',
            date: new Date(row.date_signalement).toLocaleString('fr-FR'),
            status: (row.statut === 'resolved' || row.statut === 'dismissed' || row.statut === 'in_progress' || row.statut === 'new' ? row.statut : 'new') as ConversationSignalement['status'],
            messages: row.message_contenu ? [{ sender: 'A' as const, text: row.message_contenu, timestamp: 'message' }] : [],
            participants,
            actions: {},
            rawId: row.id_signalement,
            raw: row,
          }
        })
        setSignalements(mapped)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Impossible de charger les signalements')
      } finally {
        setLoading(false)
      }
    }

    loadSignalements()
  }, [])

  useEffect(() => {
    const rawId = selectedSignalement?.rawId
    if (!rawId) return

    let cancelled = false
    const loadConversation = async () => {
      try {
        const detail = await api.backofficeSignalementConversation(rawId)
        if (cancelled) return
        const mappedMessages = detail.messages.map((message) => ({
          sender: (message.id_expediteur === detail.membreA ? 'A' : 'B') as Message['sender'],
          text: message.contenu,
          timestamp: new Date(message.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }))
        setSignalements((current) =>
          current.map((item) =>
            item.rawId === selectedSignalement.rawId
              ? {
                  ...item,
                  motif: detail.signalement.raison || detail.signalement.description || item.motif,
                  messages: mappedMessages.length ? mappedMessages : item.messages,
                }
              : item
          )
        )
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Impossible de charger la conversation')
        }
      }
    }

    loadConversation()
    return () => {
      cancelled = true
    }
  }, [selectedSignalement?.rawId])

  const filteredSignalements = useMemo(() => {
    let filtered = signalements

    if (filterStatus !== 'tous') {
      filtered = filtered.filter((s) => s.status === filterStatus)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((s) =>
        s.id.toLowerCase().includes(query) ||
        s.motif.toLowerCase().includes(query) ||
        s.signaler.toLowerCase().includes(query) ||
        s.participants.some((p) => p.name.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [signalements, filterStatus, searchQuery])

  const stats = useMemo(() => ({
    total: signalements.length,
    enAttente: signalements.filter((s) => s.status === 'new').length,
    enCours: signalements.filter((s) => s.status === 'in_progress').length,
    traite: signalements.filter((s) => s.status === 'resolved').length,
    classe: signalements.filter((s) => s.status === 'dismissed').length,
  }), [signalements])

  const handleAction = async (id: string, action: string, membre?: string, payload?: { raison?: string; contenu?: string }) => {
    const selected = signalements.find((s) => s.id === id)
    if (!selected?.rawId) return

    try {
      // Admin moderation: suspendre -> supprimer le membre; deactivate -> supprimer as well per request
      if ((action === 'suspend' || action === 'deactivate') && membre) {
        await api.deleteBackofficeMember(membre)
        // Mark signalement as resolved after deletion
        await api.updateBackofficeSignalement(selected.rawId, { statut: 'resolved', action, raison: `Membre ${membre} ${action}` })
        setSignalements((current) => current.map((item) => (item.rawId === selected.rawId ? { ...item, status: 'resolved' } : item)))
        setSuccessMessage(action === 'suspend' ? 'Membre supprime' : 'Membre supprime')
        setTimeout(() => setSuccessMessage(null), 3000)
        return
      }

      if (action === 'warn') {
        const cibleId = membre || (selected.raw as any)?.id_utilisateur_cible
        if (!cibleId) throw new Error('Aucune cible disponible pour cet avertissement')
        await api.sendBackofficeWarning({
          id_utilisateur: String(cibleId),
          raison: payload?.raison || (selected.raw as any)?.raison ? String((selected.raw as any).raison) : 'Signalement',
          contenu: payload?.contenu || `Avertissement lié au signalement #${selected.rawId}`,
        })
      }

      await api.updateBackofficeSignalement(selected.rawId, {
        statut: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'in_progress',
        action,
        raison: action === 'warn' ? 'Avertissement envoyé' : 'Traitement admin',
      })

      setSignalements((current) =>
        current.map((item) =>
          item.rawId === selected.rawId
            ? {
                ...item,
                status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'in_progress',
                actions: action === 'warn' ? { ...item.actions, avertissement: { envoye: true, date: new Date().toLocaleDateString('fr-FR') } } : item.actions,
              }
            : item
        )
      )
      setSelectedSignalement((current) => (current?.rawId === selected.rawId ? null : current))
      setSuccessMessage(action === 'warn' ? 'Avertissement envoyé' : action === 'resolve' ? 'Signalement traité' : 'Signalement classé sans suite')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="bebas text-3xl text-white">Signalements de conversations</h1>
            <p className="text-white/50 text-sm">
              {stats.total} signalements · {stats.enAttente} en attente, {stats.enCours} en cours, {stats.traite} traités
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm animate-in slide-in-from-top-2">
            {successMessage}
          </div>
        )}

        {loading && (
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6 text-sm text-white/60">
            Chargement des signalements...
          </div>
        )}

        {!loading && (
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
            <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
                <Search className="w-4 h-4 text-white/40" />
                <input
                  placeholder="Rechercher un signalement..."
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
              <div className="flex gap-1 ml-auto flex-wrap">
                {[
                  { value: 'tous', label: 'Tous' },
                  { value: 'new', label: 'Nouveaux' },
                  { value: 'in_progress', label: 'En cours' },
                  { value: 'resolved', label: 'Traités' },
                  { value: 'dismissed', label: 'Classés' }
                ].map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterStatus(filter.value)}
                    className={`px-3 py-1.5 text-xs rounded-lg transition ${
                      filterStatus === filter.value
                        ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold'
                        : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {filter.label}
                    {filter.value === 'tous' && (
                      <span className="ml-1 text-[10px] opacity-60">({stats.total})</span>
                    )}
                    {filter.value === 'new' && stats.enAttente > 0 && (
                      <span className="ml-1 text-[10px] text-amber-400">({stats.enAttente})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste des signalements */}
            <div className="divide-y divide-white/5">
              {filteredSignalements.length === 0 ? (
                <div className="text-center py-12 text-white/40">
                  <Flag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun signalement trouvé</p>
                </div>
              ) : (
                filteredSignalements.map((s) => (
                  <div 
                    key={s.id}
                    className="p-4 hover:bg-white/5 transition cursor-pointer"
                    onClick={() => setSelectedSignalement(s)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icône */}
                      <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <Flag className="w-4 h-4 text-red-400" />
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold">{s.id}</h3>
                          <StatusBadge status={s.status} />
                          <span className="text-white/30 text-xs">·</span>
                          <span className="text-white/50 text-sm">{s.date}</span>
                        </div>
                        <p className="text-sm text-white/80 mt-0.5">{s.motif}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-xs text-white/40">
                          <span>Signalé par {s.signaler}</span>
                          <span>·</span>
                          <span>{s.participants.map((p) => p.name).join(' vs ')}</span>
                          {s.actions.suspension && (
                            <>
                              <span>·</span>
                              <span className="text-red-400 flex items-center gap-1">
                                <Ban className="w-3 h-3" />
                                Suspension {s.actions.suspension.membre}
                              </span>
                            </>
                          )}
                          {s.actions.avertissement?.envoye && (
                            <>
                              <span>·</span>
                              <span className="text-amber-400 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Avertissement envoyé
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Nombre de messages */}
                      <div className="flex items-center gap-2 text-white/30 text-xs">
                        <MessageCircle className="w-3 h-3" />
                        {s.messages.length}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pied de tableau */}
            <div className="p-4 border-t border-white/10 flex gap-6 text-xs text-white/40">
              <span>Total: {filteredSignalements.length}</span>
              <span>Nouveaux: {filteredSignalements.filter((s) => s.status === 'new').length}</span>
              <span>En cours: {filteredSignalements.filter((s) => s.status === 'in_progress').length}</span>
              <span>Traités: {filteredSignalements.filter((s) => s.status === 'resolved').length}</span>
              <span>Classés: {filteredSignalements.filter((s) => s.status === 'dismissed').length}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modale de conversation */}
      {selectedSignalement && (
        <ConversationView 
          signalement={selectedSignalement}
          onAction={handleAction}
          onClose={() => setSelectedSignalement(null)}
        />
      )}
    </AdminLayout>
  )
}