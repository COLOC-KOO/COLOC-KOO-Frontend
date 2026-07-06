import React, { useEffect, useState } from 'react'
import { CircleAlert, MessageSquare, Send, ArrowLeft } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

interface MessageThread {
  interlocuteur_id: number
  interlocuteur_nom: string
  interlocuteur_prenom: string
  dernier_message: string
  total_messages: number
  non_lus: number
}

interface ThreadMessage {
  id_message: number
  id_expediteur: number
  id_destinataire: number
  id_annonce: number | null
  sujet: string | null
  contenu: string
  date_envoi: string
  est_lu: number
  message_parent: number | null
  signalement_abus: number
  expediteur_nom: string
  expediteur_prenom: string
  destinataire_nom: string
  destinataire_prenom: string
  annonce_titre: string | null
}

export default function AdminMessages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [reply, setReply] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingThreads(true)
    api.messagesThreads()
      .then((data) => {
        setThreads(data)
        if (data.length > 0) setActiveThread(data[0].interlocuteur_id)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger les conversations.'))
      .finally(() => setLoadingThreads(false))
  }, [])

  useEffect(() => {
    if (activeThread === null) return
    setLoadingMessages(true)
    api.messagesThread(activeThread)
      .then((data) => setMessages(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger la conversation.'))
      .finally(() => setLoadingMessages(false))
  }, [activeThread])

  const handleSend = async () => {
    if (!reply.trim() || activeThread === null) return
    setSending(true)
    setError(null)
    try {
      await api.sendMessage({ id_destinataire: activeThread, contenu: reply.trim() })
      setReply('')
      const data = await api.messagesThread(activeThread)
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    } finally {
      setSending(false)
    }
  }

  const activeThreadInfo = threads.find((thread) => thread.interlocuteur_id === activeThread)
  const threadTitle = activeThreadInfo ? `${activeThreadInfo.interlocuteur_prenom} ${activeThreadInfo.interlocuteur_nom}` : 'Conversation'
  const activeUserLabel = activeThreadInfo ? `${activeThreadInfo.interlocuteur_prenom} ${activeThreadInfo.interlocuteur_nom}` : 'Utilisateur inconnu'

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Messages / Conversations</h1>
          <p className="text-white/50 text-sm">Échangez avec les utilisateurs depuis le backend.</p>
          {activeThread !== null && (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
              <div className="font-semibold">Utilisateur actif en base de données :</div>
              <div>{activeUserLabel}</div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-[380px_1fr] gap-4">
          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-4 border-b border-white/10 text-sm font-semibold text-white">Conversations</div>
            {loadingThreads ? (
              <div className="p-6 text-center text-white/50">Chargement des conversations...</div>
            ) : threads.length === 0 ? (
              <div className="p-6 text-center text-white/50">Aucune conversation disponible.</div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.interlocuteur_id}
                  onClick={() => setActiveThread(thread.interlocuteur_id)}
                  className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition ${thread.interlocuteur_id === activeThread ? 'bg-white/5' : ''}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-sm text-white">{thread.interlocuteur_prenom} {thread.interlocuteur_nom}</div>
                    <div className="text-[11px] text-white/50">{thread.total_messages} msg</div>
                  </div>
                  <div className="text-xs text-white/50 mt-1">Dernier message: {new Date(thread.dernier_message).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                  {thread.non_lus > 0 && (
                    <span className="inline-flex items-center gap-2 mt-3 text-[11px] text-brand-cyan">
                      <CircleAlert className="w-3 h-3" /> {thread.non_lus} non lus
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl flex flex-col min-h-[520px]">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">{threadTitle}</div>
                <div className="text-xs text-white/50">Conversation en cours</div>
              </div>
              {activeThread !== null && (
                <button onClick={() => setActiveThread(null)} className="text-xs text-white/50 hover:text-white transition flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" /> Fermer
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {activeThread === null ? (
                <div className="text-center text-white/50">Sélectionnez une conversation à gauche.</div>
              ) : loadingMessages ? (
                <div className="text-center text-white/50">Chargement de la conversation...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-white/50">Aucun message dans cette conversation.</div>
              ) : (
                messages.map((msg) => {
                  const isFromCurrentUser = msg.id_expediteur === user?.id
                  const senderName = msg.expediteur_prenom ? `${msg.expediteur_prenom} ${msg.expediteur_nom}` : 'Utilisateur'
                  return (
                    <div key={msg.id_message} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-3xl p-4 ${isFromCurrentUser ? 'bg-brand-cyan text-black' : 'bg-white/5 text-white'} `}>
                        <div className="text-[11px] text-white/50 mb-1">{senderName}</div>
                        <div className="text-sm whitespace-pre-wrap break-words">{msg.contenu}</div>
                        <div className="text-[10px] text-white/40 mt-2 text-right">{new Date(msg.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-white/40" />
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Écrire une réponse..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white outline-none focus:border-brand-cyan"
                  disabled={activeThread === null}
                />
                <button
                  onClick={handleSend}
                  disabled={!reply.trim() || sending || activeThread === null}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-cyan px-4 py-3 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
