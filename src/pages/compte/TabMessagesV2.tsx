import React, { useEffect, useRef, useState } from 'react'
import { MessageSquare, Menu, ChevronLeft, Send, UserPlus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, AuthUser, getWebSocketUrl } from '../../lib/api'
import { useAuth } from '../../lib/auth'

// Note: This component mirrors the original TabMessagesV2 from Compte.tsx.
export default function TabMessagesV2() {
  const { user } = useAuth()
  const location = window.location
  const [conversations, setConversations] = useState<any[]>([])
  const [active, setActive] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sendError, setSendError] = useState('')
  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null)
  const [reportedMessageIds, setReportedMessageIds] = useState<Set<number>>(new Set())
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showDirectModal, setShowDirectModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimerRef = useRef<number | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  const appendMessage = (message: any) => {
    setMessages((prev) => prev.some((item) => item.id_message === message.id_message) ? prev : [...prev, message])
  }

  const loadConversations = async () => {
    const [directThreads, groups] = await Promise.all([
      api.messagesThreads().catch(() => []),
      api.groupThreads().catch(() => []),
    ])
    const direct = directThreads.map((thread: any) => ({
      key: `direct:${thread.interlocuteur_id}`,
      type: 'direct',
      id: thread.interlocuteur_id,
      name: `${thread.interlocuteur_prenom} ${thread.interlocuteur_nom}`.trim() || 'Utilisateur',
      initials: `${thread.interlocuteur_prenom?.[0] || ''}${thread.interlocuteur_nom?.[0] || ''}`.toUpperCase() || 'U',
      lastMessage: thread.dernier_message || 'Aucun message',
      total: Number(thread.total_messages || 0),
      unread: Number(thread.non_lus || 0),
      date: thread.date_dernier_message || thread.dernier_message || null,
    }))
    const groupItems = groups.map((group: any) => ({
      key: `group:${group.id_groupe}`,
      type: 'group',
      id: group.id_groupe,
      name: group.nom,
      initials: 'GR',
      lastMessage: group.dernier_message || 'Aucun message',
      total: Number(group.total_messages || 0),
      unread: Number(group.non_lus || 0),
      date: group.date_dernier_message || group.date_creation || null,
    }))
    const merged = [...direct, ...groupItems].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    setConversations(merged)
    return merged
  }

  useEffect(() => {
    setLoading(true)
    loadConversations()
      .then((items) => {
        setActive(items[0] || null)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!active) {
      setMessages([])
      return
    }
    setMsgLoading(true)
    const loader = active.type === 'group' ? api.groupMessages(active.id) : api.messagesThread(active.id)
    loader.then((data) => setMessages(data as any[])).catch(() => setMessages([])).finally(() => setMsgLoading(false))
  }, [active?.key])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  useEffect(() => {
    if (!user) return
    const ws = new WebSocket(getWebSocketUrl())
    wsRef.current = ws
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'direct_message' && payload.message) {
          const otherId = payload.message.id_expediteur === user.id ? payload.message.id_destinataire : payload.message.id_expediteur
          if (active?.type === 'direct' && active.id === otherId) appendMessage(payload.message)
          void loadConversations()
        }
        if (payload.type === 'group_message' && payload.message) {
          if (active?.type === 'group' && active.id === Number(payload.groupId)) appendMessage(payload.message)
          void loadConversations()
        }
        if (payload.type === 'group_created') {
          if (payload.conversation) {
            setConversations((prev) => {
              const exists = prev.some((item) => item.key === payload.conversation.key)
              return exists ? prev : [payload.conversation, ...prev]
            })
          }
          void loadConversations()
          window.dispatchEvent(new Event('colockoo:counters-refresh'))
        }
        if (payload.type === 'typing') {
          const sameDirect = active?.type === 'direct' && active.id === Number(payload.fromUserId)
          const sameGroup = active?.type === 'group' && active.id === Number(payload.targetId)
          if (sameDirect || sameGroup) {
            setTypingUsers((prev) => payload.isTyping ? [...new Set([...prev, Number(payload.fromUserId)])] : prev.filter((id) => id !== Number(payload.fromUserId)))
          }
        }
        if (payload.type === 'notification') {
          void loadConversations()
          window.dispatchEvent(new Event('colockoo:counters-refresh'))
        }
      } catch {
        // Ignore malformed websocket payloads.
      }
    }
    return () => ws.close()
  }, [user?.id, active?.key])

  const emitTyping = (isTyping: boolean) => {
    if (!active || wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({
      type: 'typing',
      conversationType: active.type === 'group' ? 'group' : 'direct',
      targetId: active.id,
      isTyping,
    }))
  }

  const handleSend = async () => {
    if (!active || !reply.trim()) return
    const contenu = reply.trim()
    setReply('')
    setSendError('')
    emitTyping(false)
    try {
      const sent = active.type === 'group'
        ? await api.sendGroupMessage(active.id, contenu)
        : await api.sendMessage({ id_destinataire: active.id, contenu })
      appendMessage(sent as any)
      void loadConversations()
      window.dispatchEvent(new Event('colockoo:counters-refresh'))
    } catch (err) {
      setReply(contenu)
      setSendError(err instanceof Error ? err.message : 'Impossible d envoyer le message.')
    }
  }

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[620px] w-full flex-col lg:h-[700px] lg:flex-row">
      {/* Left panel */}
      <div className="h-72 w-full shrink-0 border-b border-border bg-muted/10 lg:h-auto lg:w-80 lg:border-b-0 lg:border-r">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-brand-cyan" />
              Messages
            </h3>
          </div>
        </div>
        {/* Conversations list simplified for extracted component */}
        <div className="p-4">
          {loading ? <div>Chargement...</div> : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <button key={c.key} onClick={() => setActive(c)} className="w-full text-left p-3 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">{c.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{c.lastMessage}</div>
                    </div>
                    {c.unread > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{c.unread}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area simplified */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        <div className="flex-1 overflow-y-auto p-4">
          {msgLoading ? <div>Chargement des messages...</div> : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id_message} className={`p-3 rounded-xl ${m.id_expediteur === user?.id ? 'bg-brand-cyan text-white' : 'bg-white border'}`}>
                  <div className="text-sm">{m.contenu}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(m.date_envoi).toLocaleTimeString('fr-FR')}</div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2">
            <input value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 rounded-full border px-4 py-2" placeholder="Écrire un message..." />
            <button onClick={handleSend} className="w-11 h-11 rounded-full bg-brand-cyan text-white">{<Send />}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
