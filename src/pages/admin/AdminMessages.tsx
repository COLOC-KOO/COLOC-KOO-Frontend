import React, { useEffect, useState } from 'react'
import {
  Inbox, MessageSquare, Search, Plus, Paperclip, Smile, Send, Trash2,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

interface MessageThread {
  membre_a: number
  membre_b: number
  threadKey: string
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

interface ContactMessage {
  id_message: number
  nom: string
  email: string
  sujet: string
  message: string
  statut: string
  date_creation: string
}

export default function AdminMessages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [activeThread, setActiveThread] = useState<string | null>(null)
  const [messages, setMessages] = useState<ThreadMessage[]>([])
  const [reply, setReply] = useState('')
  const [threadSearch, setThreadSearch] = useState('')
  const [loadingThreads, setLoadingThreads] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoadingThreads(true)
    Promise.allSettled([api.backofficeConversations(), api.backofficeContactMessages()])
      .then(([conversationResult, contactResult]) => {
        if (conversationResult.status === 'rejected') throw conversationResult.reason
        const mappedThreads = conversationResult.value.map((thread) => ({
          ...thread,
          threadKey: `${thread.membre_a}:${thread.membre_b}`,
        }))
        setThreads(mappedThreads)
        if (contactResult.status === 'fulfilled') setContactMessages(contactResult.value)
        else setError(contactResult.reason instanceof Error
          ? contactResult.reason.message
          : 'Impossible de charger les messages de contact.')
        if (mappedThreads.length) setActiveThread(mappedThreads[0].threadKey)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger les conversations.'))
      .finally(() => setLoadingThreads(false))
  }, [])

  useEffect(() => {
    if (!activeThread) return
    const thread = threads.find((item) => item.threadKey === activeThread)
    if (!thread) return
    setLoadingMessages(true)
    api.backofficeConversationMessages(thread.membre_a, thread.membre_b)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger la conversation.'))
      .finally(() => setLoadingMessages(false))
  }, [activeThread, threads])

  const handleSend = async () => {
    const thread = threads.find((item) => item.threadKey === activeThread)
    if (!reply.trim() || !thread) return
    setSending(true)
    setError(null)
    try {
      const currentUserId = Number(user?.id)
      const recipientId = currentUserId === thread.membre_a
        ? thread.membre_b
        : currentUserId === thread.membre_b
          ? thread.membre_a
          : thread.interlocuteur_id
      const sentMessage = await api.sendMessage({ id_destinataire: recipientId, contenu: reply.trim() })
      setReply('')
      const history = await api.backofficeConversationMessages(thread.membre_a, thread.membre_b)
      setMessages([...history, sentMessage as ThreadMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    } finally {
      setSending(false)
    }
  }

  const handleDeleteContact = async (id: number) => {
    setError(null)
    try {
      await api.deleteBackofficeContactMessage(id)
      setContactMessages((current) => current.filter((message) => message.id_message !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de supprimer ce message.')
    }
  }

  const activeThreadInfo = threads.find((thread) => thread.threadKey === activeThread)
  const threadTitle = activeThreadInfo
    ? `${activeThreadInfo.interlocuteur_prenom} ${activeThreadInfo.interlocuteur_nom}`.trim()
    : 'Choisissez une discussion'
  const filteredThreads = threads.filter((thread) =>
    `${thread.interlocuteur_prenom} ${thread.interlocuteur_nom}`.toLowerCase().includes(threadSearch.trim().toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-5 text-white">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="bebas text-3xl">Messagerie</h1>
              <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">Administration</span>
            </div>
            <p className="mt-1 text-sm text-white/50">Conversations privées et demandes reçues.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#242526] px-3 py-2 text-xs text-white/60">
            <Inbox className="h-4 w-4 text-blue-400" /> {threads.length} conversation{threads.length !== 1 ? 's' : ''}
          </div>
        </header>

        {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

        <details className="group overflow-hidden rounded-2xl border border-white/10 bg-[#242526]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 transition hover:bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/15 text-blue-300"><Inbox className="h-5 w-5" /></span>
              <div><h2 className="text-sm font-semibold">Messages de contact</h2><p className="mt-0.5 text-xs text-white/45">Messages envoyés depuis le formulaire public</p></div>
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">{contactMessages.length}</span>
          </summary>
          <div className="max-h-80 overflow-y-auto border-t border-white/10">
            {contactMessages.length === 0 ? <p className="p-5 text-sm text-white/45">Aucun message de contact.</p> : contactMessages.map((message) => (
              <article key={message.id_message} className="flex items-start gap-3 border-b border-white/5 p-4 last:border-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#3a3b3c] text-sm font-semibold text-white/80">{message.nom.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-sm font-semibold">{message.sujet}</h3><time className="text-[11px] text-white/40">{new Date(message.date_creation).toLocaleString('fr-FR')}</time></div>
                  <p className="mt-0.5 text-xs text-white/50">{message.nom} · <a className="text-blue-300 hover:underline" href={`mailto:${message.email}`}>{message.email}</a></p>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white/75">{message.message}</p>
                </div>
                <button aria-label="Supprimer le message" onClick={() => handleDeleteContact(message.id_message)} className="rounded-full p-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </article>
            ))}
          </div>
        </details>

        <div className="grid min-h-[680px] overflow-hidden rounded-3xl border border-white/10 bg-[#18191a] shadow-2xl shadow-black/20 lg:grid-cols-[340px_1fr]">
          <aside className="flex min-h-[300px] flex-col border-b border-white/10 bg-[#242526] lg:border-b-0 lg:border-r">
            <div className="border-b border-white/10 p-5">
              <div className="flex items-center justify-between"><h2 className="text-xl font-bold tracking-tight">Discussions</h2><span className="rounded-full bg-white/5 p-2 text-white/50"><Plus className="h-4 w-4" /></span></div>
              <label className="mt-4 flex items-center gap-2 rounded-full bg-[#3a3b3c] px-3.5 py-2.5 text-white/45 focus-within:ring-2 focus-within:ring-blue-500/50"><Search className="h-4 w-4 shrink-0" /><input value={threadSearch} onChange={(event) => setThreadSearch(event.target.value)} placeholder="Rechercher une discussion" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40" /></label>
              <div className="mt-4 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-white/40">Toutes les conversations</span><span className="text-xs text-white/40">{filteredThreads.length}</span></div>
            </div>
            {loadingThreads ? <div className="p-6 text-center text-sm text-white/45">Chargement des conversations…</div> : filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-sm text-white/45">{threadSearch ? 'Aucun résultat.' : 'Aucune conversation pour le moment.'}</div>
            ) : <div className="flex-1 overflow-y-auto p-2">{filteredThreads.map((thread) => (
              <button key={thread.threadKey} onClick={() => setActiveThread(thread.threadKey)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${thread.threadKey === activeThread ? 'bg-blue-500/15' : 'hover:bg-white/[0.05]'}`}>
                <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold text-white shadow-lg shadow-blue-900/20">{`${thread.interlocuteur_prenom?.[0] || ''}${thread.interlocuteur_nom?.[0] || ''}`.toUpperCase() || 'U'}{thread.non_lus > 0 && <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#242526] bg-blue-400" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{thread.interlocuteur_prenom} {thread.interlocuteur_nom}</span><time className="shrink-0 text-[10px] text-white/40">{new Date(thread.dernier_message).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time></div>
                  <div className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-white/45">{thread.total_messages} message{thread.total_messages !== 1 ? 's' : ''} · Ouvrir la discussion</span>{thread.non_lus > 0 && <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">{thread.non_lus}</span>}</div>
                </div>
              </button>
            ))}</div>}
          </aside>

          <section className="flex min-h-[520px] flex-col bg-[#18191a]">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#242526] px-4 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-sm font-bold">{activeThreadInfo ? `${activeThreadInfo.interlocuteur_prenom?.[0] || ''}${activeThreadInfo.interlocuteur_nom?.[0] || ''}`.toUpperCase() : <MessageSquare className="h-5 w-5" />}</div>
                <div className="min-w-0"><div className="truncate text-sm font-bold">{threadTitle}</div><div className="mt-0.5 truncate text-xs text-white/45">{activeThreadInfo ? `${activeThreadInfo.total_messages} messages · Conversation privée` : 'Sélectionnez une conversation'}</div></div>
              </div>
              {activeThread !== null && <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">Messagerie privée</span>}
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8">
              {activeThread === null ? <div className="grid h-full min-h-[360px] place-items-center text-center"><div><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#242526] text-blue-400"><MessageSquare className="h-7 w-7" /></div><p className="mt-4 font-semibold">Vos discussions</p><p className="mt-1 text-sm text-white/45">Choisissez une conversation pour afficher les messages.</p></div></div> : loadingMessages ? (
                <div className="grid min-h-[360px] place-items-center text-sm text-white/45">Chargement de la conversation…</div>
              ) : messages.length === 0 ? <div className="grid min-h-[360px] place-items-center text-sm text-white/45">Aucun message dans cette conversation.</div> : messages.map((msg) => {
                const isFromCurrentUser = Number(msg.id_expediteur) === Number(user?.id)
                const senderName = [msg.expediteur_prenom, msg.expediteur_nom].filter(Boolean).join(' ') || 'Utilisateur'
                return <div key={msg.id_message} className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex max-w-[82%] flex-col sm:max-w-[70%] ${isFromCurrentUser ? 'items-end' : 'items-start'}`}>
                    {!isFromCurrentUser && <span className="mb-1.5 ml-3 text-[11px] text-white/40">{senderName}</span>}
                    <div className={`rounded-[22px] px-4 py-2.5 text-sm leading-6 shadow-sm ${isFromCurrentUser ? 'rounded-br-md bg-[#0084ff] text-white' : 'rounded-bl-md bg-[#3a3b3c] text-white/90'}`}><div className="whitespace-pre-wrap break-words">{msg.contenu}</div></div>
                    <time className="mt-1 px-2 text-[10px] text-white/35">{new Date(msg.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
                  </div>
                </div>
              })}
            </div>

            <div className="border-t border-white/10 bg-[#242526] px-4 py-4 sm:px-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <button aria-label="Joindre un fichier" className="rounded-full p-2 text-blue-400 transition hover:bg-white/5"><Paperclip className="h-5 w-5" /></button>
                <input value={reply} onChange={(event) => setReply(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void handleSend() } }} placeholder="Écrire un message…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white px-5 py-3 text-sm text-black caret-black outline-none transition placeholder:text-gray-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60" disabled={activeThread === null} />
                <button aria-label="Ajouter un emoji" className="rounded-full p-2 text-blue-400 transition hover:bg-white/5"><Smile className="h-5 w-5" /></button>
                <button onClick={handleSend} disabled={!reply.trim() || sending || activeThread === null} aria-label="Envoyer le message" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"><Send className="h-5 w-5" /></button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
