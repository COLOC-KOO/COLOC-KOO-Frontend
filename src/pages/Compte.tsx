import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  ArrowLeft, Bell, Check, FileText, Lock, MessageSquare, Send, Upload, User, 
  Edit, Trash, AlertTriangle, X, Camera, Home, MapPin, DollarSign, Ruler, 
  Calendar, Bed, Building2, Users, Image as ImageIcon, Heart, Search, Plus,
  Menu, ChevronLeft, UserPlus, Flag
} from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiAnnonce, AuthUser, getWebSocketUrl, Langue } from '../lib/api'
import { useAuth } from '../lib/auth'
import TabProfil from './compte/TabProfil'
import TabMesAnnonces from './compte/TabMesAnnonces'
import TabNotif from './compte/TabNotif'
import TabMessagesV2 from './compte/TabMessagesV2'
import ConversationsPage from './compte/ConversationsPage'
import TabMesFavoris from './compte/TabMesFavoris'





interface ChatMessage {
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

interface SuperadminUser {
  id: number
  email: string
  nom: string
  prenom: string
  role: string
  poste: string
  name: string
  initials: string
}

function TabMessages() {
  const { t } = useTranslation('compte')
  const { user } = useAuth()
  const [superadmin, setSuperadmin] = useState<SuperadminUser | null>(null)
  const [threads, setThreads] = useState<Array<{
    interlocuteur_id: number
    interlocuteur_nom: string
    interlocuteur_prenom: string
    dernier_message: string
    total_messages: number
    non_lus: number
    date_dernier_message: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupMembers, setNewGroupMembers] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.messagesThreads(),
      api.superadmin().catch(() => null)
    ])
      .then(([threadsData, superadminData]) => {
        setThreads(threadsData)
        setSuperadmin(superadminData)
        if (threadsData.length > 0) {
          setActiveThread(threadsData[0].interlocuteur_id)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('updateError')))
      .finally(() => setLoading(false))
  }, [t])

  useEffect(() => {
    if (activeThread === null) return
    setMsgLoading(true)
    setMessages([])
    api.messagesThread(activeThread)
      .then((data) => setMessages(data))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false))
  }, [activeThread])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!reply.trim() || activeThread === null) return
    setSending(true)
    setSendError('')
    try {
      await api.sendMessage({
        id_destinataire: activeThread,
        contenu: reply.trim(),
      })
      setReply('')
      const data = await api.messagesThread(activeThread)
      setMessages(data)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : t('reportError'))
    } finally {
      setSending(false)
    }
  }

  const handleReportMessage = async (id_message: number) => {
    const raison = window.prompt(t('reportReason'))
    try {
      await api.reportMessage(id_message, { raison: raison || t('reportSent') })
      if (activeThread !== null) {
        const data = await api.messagesThread(activeThread)
        setMessages(data)
      }
      alert(t('reportSent'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('reportError'))
    }
  }

  const handleDeleteConversation = async (interlocutorId: number) => {
    if (!window.confirm(t('deleteConversationConfirm'))) return
    try {
      await api.deleteThread(interlocutorId)
      setThreads((prev) => prev.filter((t) => t.interlocuteur_id !== interlocutorId))
      if (activeThread === interlocutorId) {
        const remaining = threads.filter(t => t.interlocuteur_id !== interlocutorId)
        setActiveThread(remaining.length > 0 ? remaining[0].interlocuteur_id : null)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : t('deleteConversationError'))
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupMembers.trim()) {
      alert('Veuillez remplir tous les champs')
      return
    }
    try {
      // Ici vous pouvez appeler votre API pour créer un groupe
      // Pour l'instant, on simule et on ferme le modal
      alert(`Groupe "${newGroupName}" créé avec ${newGroupMembers}`)
      setShowNewGroupModal(false)
      setNewGroupName('')
      setNewGroupMembers('')
    } catch (err) {
      alert('Erreur lors de la création du groupe')
    }
  }

  const filteredThreads = searchQuery 
    ? threads.filter(t => 
        `${t.interlocuteur_prenom} ${t.interlocuteur_nom}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : threads

  const getInitials = (prenom: string, nom: string) => {
    return `${(prenom || '?')[0]}${(nom || '?')[0]}`.toUpperCase()
  }

  // Sidebar toujours visible
  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row h-[700px] w-full">
        {/* Sidebar des conversations - toujours visible */}
        <div className={`${isSidebarOpen ? 'w-full lg:w-80' : 'w-0 lg:w-0'} border-r border-border bg-muted/10 flex flex-col transition-all duration-300 overflow-hidden shrink-0`}>
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-brand-cyan" />
                Messages
                {threads.length > 0 && (
                  <span className="ml-auto text-xs bg-brand-cyan text-white px-2 py-0.5 rounded-full">
                    {threads.reduce((acc, t) => acc + t.non_lus, 0)} non lus
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            {/* Barre de recherche et bouton nouveau groupe */}
            <div className="mt-2 flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-border rounded-full px-4 py-2 text-sm bg-white outline-none focus:border-brand-cyan pl-9"
                />
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                onClick={() => setShowNewGroupModal(true)}
                className="p-2 rounded-full bg-brand-cyan text-white hover:bg-brand-cyan-dark transition-colors shadow-md hover:shadow-lg"
                title="Créer un groupe de discussion"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-sm text-red-600">{error}</div>
            ) : filteredThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? 'Aucun résultat trouvé' : 'Aucune conversation'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {searchQuery ? 'Essayez une autre recherche' : 'Commencez une nouvelle conversation'}
                </p>
                {superadmin && !searchQuery && (
                  <button
                    onClick={() => setActiveThread(superadmin.id)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-cyan hover:text-brand-cyan-dark"
                  >
                    <Send className="w-4 h-4" />
                    Contacter {superadmin.prenom}
                  </button>
                )}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isActive = activeThread === thread.interlocuteur_id
                const displayName = `${thread.interlocuteur_prenom} ${thread.interlocuteur_nom}`
                const initials = getInitials(thread.interlocuteur_prenom, thread.interlocuteur_nom)
                const isAdmin = thread.interlocuteur_nom?.toLowerCase().includes('admin') || thread.interlocuteur_prenom?.toLowerCase().includes('admin')
                const lastMessage = thread.dernier_message?.substring(0, 50) || 'Aucun message'
                const time = new Date(thread.date_dernier_message || thread.dernier_message).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

                return (
                  <button
                    key={thread.interlocuteur_id}
                    onClick={() => {
                      setActiveThread(thread.interlocuteur_id)
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false)
                      }
                    }}
                    className={`w-full text-left p-4 border-b border-border/50 transition-all hover:bg-muted/50 ${
                      isActive ? 'bg-brand-cyan-light/20 border-l-4 border-l-brand-cyan' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm">
                          {initials}
                        </div>
                        {thread.non_lus > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                            {thread.non_lus}
                          </span>
                        )}
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          thread.non_lus > 0 ? 'bg-brand-cyan animate-pulse' : 'bg-green-500'
                        }`}></span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1.5">
                            {displayName}
                            {isAdmin && (
                              <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">
                                Admin
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground shrink-0">{time}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 mt-0.5">
                          <span className={`text-xs truncate ${thread.non_lus > 0 ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                            {lastMessage}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col bg-white min-w-0">
          {/* En-tête de la conversation */}
          {activeThread !== null ? (
            <>
              <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-border bg-white/95 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {(() => {
                      const threadInfo = threads.find((t) => t.interlocuteur_id === activeThread)
                      const isSuperadmin = superadmin && activeThread === superadmin.id
                      return getInitials(
                        threadInfo?.interlocuteur_prenom || superadmin?.prenom || 'U',
                        threadInfo?.interlocuteur_nom || superadmin?.nom || 'S'
                      )
                    })()}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-foreground flex items-center gap-2">
                      {(() => {
                        const threadInfo = threads.find((t) => t.interlocuteur_id === activeThread)
                        const isSuperadmin = superadmin && activeThread === superadmin.id
                        return threadInfo 
                          ? `${threadInfo.interlocuteur_prenom} ${threadInfo.interlocuteur_nom}`
                          : isSuperadmin 
                            ? `${superadmin.prenom} ${superadmin.nom}`
                            : 'Utilisateur'
                      })()}
                      {threads.find(t => t.interlocuteur_id === activeThread)?.non_lus ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-brand-cyan rounded-full">
                          {threads.find(t => t.interlocuteur_id === activeThread)?.non_lus}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${threads.find(t => t.interlocuteur_id === activeThread)?.non_lus ? 'bg-brand-cyan animate-pulse' : 'bg-green-500'}`}></span>
                        {threads.find(t => t.interlocuteur_id === activeThread)?.non_lus ? 'En ligne' : 'Dernière connexion récente'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <span>{threads.find(t => t.interlocuteur_id === activeThread)?.total_messages || 0} messages</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      const threadInfo = threads.find((t) => t.interlocuteur_id === activeThread)
                      if (threadInfo) handleDeleteConversation(threadInfo.interlocuteur_id)
                    }}
                    className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Supprimer la conversation"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 bg-muted/20 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-block w-8 h-8 border-4 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Chargement des messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Aucun message</p>
                      <p className="text-xs text-muted-foreground/70">Démarrez la conversation !</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.id_expediteur === user?.id
                    const senderName = isMe
                      ? 'Moi'
                      : `${msg.expediteur_prenom} ${msg.expediteur_nom}`
                    const isAdmin = !isMe && (msg.expediteur_nom?.toLowerCase().includes('admin') || msg.expediteur_prenom?.toLowerCase().includes('admin'))
                    const time = new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                    const date = new Date(msg.date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    
                    // Afficher la date si différente du message précédent
                    const prevDate = index > 0 ? new Date(messages[index - 1].date_envoi).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : null
                    const showDate = index === 0 || date !== prevDate

                    return (
                      <div key={msg.id_message}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="text-xs text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm">
                              {date}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] ${isMe ? 'order-2' : 'order-2'}`}>
                            {!isMe && (
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-foreground/80">
                                  {senderName}
                                </span>
                                {isAdmin && (
                                  <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">
                                    Admin
                                  </span>
                                )}
                              </div>
                            )}
                            <div
                              className={`relative rounded-2xl px-4 py-2.5 shadow-sm ${
                                isMe
                                  ? 'bg-brand-cyan text-white rounded-br-none'
                                  : isAdmin
                                    ? 'bg-brand-green-light text-brand-green-dark border border-brand-green/20 rounded-bl-none'
                                    : 'bg-white text-foreground border border-border rounded-bl-none'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap break-words">
                                {msg.contenu}
                              </div>
                              <div className={`flex items-center justify-end gap-2 mt-1 ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
                                <span className="text-[10px]">{time}</span>
                                {isMe && (
                                  <span className="text-[10px]">
                                    {msg.est_lu ? '✓✓' : '✓'}
                                  </span>
                                )}
                              </div>
                            </div>
                            {!isMe && (
                              <button
                                onClick={() => handleReportMessage(msg.id_message)}
                                className="mt-1 text-[10px] text-muted-foreground/50 hover:text-red-500 transition-colors"
                              >
                                Signaler
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Zone de saisie */}
              <div className="border-t border-border bg-white/95 backdrop-blur-sm px-6 py-4">
                {sendError && (
                  <p className="text-sm text-red-600 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {sendError}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                    placeholder="Écrire un message..."
                    className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-muted/30 outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 transition-all"
                    disabled={sending}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !reply.trim()}
                    className="w-11 h-11 rounded-full bg-brand-cyan hover:bg-brand-cyan-dark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors shadow-lg shadow-brand-cyan/20"
                  >
                    {sending ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Vue vide quand aucun thread n'est sélectionné
            <div className="flex-1 flex items-center justify-center bg-muted/5">
              <div className="text-center p-8">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30" />
                </div>
                <h4 className="text-lg font-semibold text-foreground">Messagerie</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Sélectionnez une conversation pour commencer
                </p>
                <button
                  onClick={() => setShowNewGroupModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-cyan text-white rounded-lg hover:bg-brand-cyan-dark transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                >
                  <UserPlus className="w-4 h-4" />
                  Créer un nouveau groupe
                </button>
                {superadmin && threads.length === 0 && (
                  <button
                    onClick={() => setActiveThread(superadmin.id)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-brand-cyan hover:text-brand-cyan-dark ml-2"
                  >
                    <Send className="w-4 h-4" />
                    Contacter {superadmin.prenom}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nouveau Groupe */}
      {showNewGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-cyan" />
                Nouveau groupe de discussion
              </h3>
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Nom du groupe
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Ex: Colocataires - Appartement 12"
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Membres (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={newGroupMembers}
                  onChange={(e) => setNewGroupMembers(e.target.value)}
                  placeholder="john@email.com, marie@email.com, pierre@email.com"
                  className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20 outline-none transition-all"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Entrez les emails des personnes à ajouter
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowNewGroupModal(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateGroup}
                className="flex-1 rounded-xl bg-brand-cyan text-white px-4 py-2.5 text-sm font-semibold hover:bg-brand-cyan-dark transition-colors shadow-md hover:shadow-lg"
              >
                Créer le groupe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

type Conversation =
  | {
      key: string
      type: 'direct'
      id: number
      name: string
      initials: string
      lastMessage: string
      total: number
      unread: number
      date: string | null
    }
  | {
      key: string
      type: 'group'
      id: number
      name: string
      initials: string
      lastMessage: string
      total: number
      unread: number
      date: string | null
    }

type UnifiedMessage = {
  id_message: number
  id_expediteur: number
  contenu: string
  date_envoi: string
  est_lu?: number
  signalement_abus?: number
  expediteur_nom?: string
  expediteur_prenom?: string
}

function UserSearchList({
  query,
  onQueryChange,
  selected,
  onToggle,
  onPick,
}: {
  query: string
  onQueryChange: (value: string) => void
  selected?: number[]
  onToggle?: (user: AuthUser) => void
  onPick?: (user: AuthUser) => void
}) {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => {
      api.searchUsers(query)
        .then(setUsers)
        .catch(() => setUsers([]))
        .finally(() => setLoading(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query])

  return (
    <div>
      <div className="relative">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full rounded-xl border border-border px-4 py-2.5 pl-10 text-sm outline-none focus:border-brand-cyan focus:ring-2 focus:ring-brand-cyan/20"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-border">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Recherche...</div>
        ) : users.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">Aucun utilisateur trouve</div>
        ) : users.map((item) => {
          const checked = selected?.includes(item.id) || false
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPick ? onPick(item) : onToggle?.(item)}
              className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left last:border-b-0 hover:bg-muted/50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-xs font-bold text-white">
                {item.initials || `${item.prenom?.[0] || ''}${item.nom?.[0] || ''}`.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">{item.prenom} {item.nom}</div>
                <div className="truncate text-xs text-muted-foreground">{item.email}</div>
              </div>
              {onToggle ? (
                <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? 'border-brand-cyan bg-brand-cyan text-white' : 'border-border'}`}>
                  {checked ? <Check className="h-3 w-3" /> : null}
                </span>
              ) : (
                <Plus className="h-4 w-4 text-brand-cyan" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}



function TabSecu() {
  const { t } = useTranslation('compte')
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!form.current || !form.next || form.next !== form.confirm) {
      setMessage(t('passwordValidation'))
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage(t('passwordUpdateSuccess'))
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setMessage(t('passwordUpdateError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">{t('security')}</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('currentPassword')}</label>
          <input type="password" value={form.current} onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('newPassword')}</label>
          <input type="password" value={form.next} onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('confirmPassword')}</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? t('updating') : t('update')}
      </Button>
    </div>
  )
}

export default function Compte() {
  const { t } = useTranslation('compte')
  const location = useLocation()
  const navigate = useNavigate()
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const [counters, setCounters] = useState({ favoris: 0, notifications: 0, messages: 0 })
  const isColocataire = user?.poste === 'colocataire'
  const tabs = [
    { id: 'profil', label: t('profile'), icon: User },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
    { id: isColocataire ? 'favoris' : 'dossier', label: isColocataire ? t('myFavoritesTab') : t('myAnnouncementsTab'), icon: isColocataire ? Heart : FileText },
    { id: 'notif', label: t('notifications'), icon: Bell },
    // { id: 'paiements', label: t('messagesTab'), icon: MessageSquare },
    { id: 'secu', label: t('securityTab'), icon: Lock }
  ]

  const getInitialTab = () => {
    const params = new URLSearchParams(location.search)
    const requestedTab = params.get('tab')
    if (!requestedTab) return 'profil'
    if (requestedTab === 'paiements' || requestedTab === 'messages') return 'paiements'
    if (requestedTab === 'conversations') return 'conversations'
    if (requestedTab === 'favoris') return 'favoris'
    if (requestedTab === 'dossier') return isColocataire ? 'favoris' : 'dossier'
    if (requestedTab === 'notif') return 'notif'
    if (requestedTab === 'secu') return 'secu'
    if (requestedTab === 'profil') return 'profil'
    return 'profil'
  }
  const [tab, setTab] = useState(getInitialTab)

  useEffect(() => {
    setTab(getInitialTab())
  }, [location.search, isColocataire])

  useEffect(() => {
    if (!user) {
      setCounters({ favoris: 0, notifications: 0, messages: 0 })
      return
    }
    const refreshCounters = () => {
      api.counters().then(setCounters).catch(() => setCounters({ favoris: 0, notifications: 0, messages: 0 }))
    }
    refreshCounters()
    window.addEventListener('colockoo:counters-refresh', refreshCounters)
    window.addEventListener('colockoo:favori-removed', refreshCounters)
    return () => {
      window.removeEventListener('colockoo:counters-refresh', refreshCounters)
      window.removeEventListener('colockoo:favori-removed', refreshCounters)
    }
  }, [user])

  const initials = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || t('userProfile')
  const roleLabel = user?.poste === 'proprietaire' ? t('proprietaire') : user?.poste === 'colocataire' ? t('colocataire') : user?.poste || t('member')
  const profileMeta = [user?.profession].filter(Boolean).join(' • ')

  return (
    <SiteLayout>
      <div className="w-full px-4 sm:px-6 py-8">
        {/* En-tête amélioré */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-cyan/10 via-white to-brand-green/10 p-6 md:p-8 border border-border/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
                {loading ? '...' : initials}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {loading ? 'Chargement...' : fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm text-muted-foreground">{user?.email}</span>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan-dark bg-brand-cyan-light px-2.5 py-0.5 rounded-full">
                    {roleLabel}
                  </span>
                  {user?.verification && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Vérifié
                    </span>
                  )}
                </div>
                {profileMeta && (
                  <div className="mt-1 text-sm text-muted-foreground">{profileMeta}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {user && isAdmin && (
                <Button variant="outline" onClick={() => navigate('/admin')} className="gap-2">
                  <Building2 className="w-4 h-4" /> Administration
                </Button>
              )}
              {user ? (
                <Button variant="outline" onClick={() => { logout(); navigate('/auth?mode=signin') }} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  Déconnexion
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        {/* <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">12</div>
            <div className="text-xs text-muted-foreground">Annonces vues</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">{counters.favoris}</div>
            <div className="text-xs text-muted-foreground">Favoris</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">{counters.messages}</div>
            <div className="text-xs text-muted-foreground">Messages</div>
          </div>
          <div className="bg-white rounded-xl border border-border p-4 text-center">
            <div className="text-2xl font-bold text-brand-cyan-dark">2</div>
            <div className="text-xs text-muted-foreground">Candidatures</div>
          </div>
        </div> */}

        {/* Tabs et contenu */}
        <div className="mt-8 grid md:grid-cols-[240px_1fr] gap-6">
          {/* Desktop aside: visible md+ */}
          <aside className="hidden md:block space-y-1 bg-white rounded-2xl border border-border p-2 h-fit">
            {tabs.map((t) => (
              <Link
                key={t.id}
                to={`/compte?tab=${t.id}`}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tab === t.id 
                    ? 'bg-brand-cyan text-white shadow-lg shadow-brand-cyan/20' 
                    : 'hover:bg-muted text-foreground/70 hover:text-foreground'
                }`}
              >
                <t.icon className={`w-5 h-5 ${tab === t.id ? 'text-white' : 'text-foreground/70'}`} /> 
                <span className="hidden sm:inline">{t.label}</span>
                {((t.id === 'favoris' && counters.favoris > 0) || (t.id === 'notif' && counters.notifications > 0) || (t.id === 'paiements' && counters.messages > 0)) && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {t.id === 'favoris' ? counters.favoris : t.id === 'notif' ? counters.notifications : counters.messages}
                  </span>
                )}
                {tab === t.id && !((t.id === 'favoris' && counters.favoris > 0) || (t.id === 'notif' && counters.notifications > 0) || (t.id === 'paiements' && counters.messages > 0)) && (
                  <span className="ml-auto">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </Link>
            ))}
          </aside>

          <div className={tab === 'paiements' ? 'bg-white border border-border rounded-2xl shadow-sm overflow-hidden' : 'bg-white border border-border rounded-2xl p-6 shadow-sm'}>
            {tab === 'profil' && <TabProfil user={user} onSave={updateProfile} />}
            {tab === 'conversations' && <ConversationsPage />}
            {tab === 'dossier' && <TabMesAnnonces />}
            {tab === 'favoris' && <TabMesFavoris />}
            {tab === 'notif' && <TabNotif />}
            {tab === 'paiements' && <TabMessagesV2 />} 
            {tab === 'secu' && <TabSecu />}
          </div>
        </div>
      </div>
        {/* Mobile fixed icon nav (visible on mobile only) */}
        <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}>
          <div className="bg-white/95 backdrop-blur-md border border-border rounded-xl shadow-lg px-3 py-3 flex items-center justify-between">
            {['profil','conversations','notif','secu'].map((id) => {
              const item = tabs.find((x) => x.id === id)
              if (!item) return null
              const IconComp = item.icon
              const isActive = tab === id
              const showBadge = (id === 'notif' && counters.notifications > 0) || (id === 'paiements' && counters.messages > 0)
              const badgeCount = id === 'notif' ? counters.notifications : id === 'paiements' ? counters.messages : 0
              return (
                <button
                  key={id}
                  onClick={() => navigate(`/compte?tab=${id}`)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-1 rounded-md transition-colors ${isActive ? 'bg-brand-cyan text-white' : 'text-foreground/80 hover:bg-muted/40'}`}
                  aria-label={item.label}
                >
                  <div className="relative">
                    <IconComp className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    {showBadge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] leading-3 hidden">{item.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
    </SiteLayout>
  )
}
