import React, { useEffect, useRef, useState } from 'react'
import { MessageSquare, ChevronLeft, Send, UserPlus, X, Plus, Flag, Search, House } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { api, AuthUser, getWebSocketUrl } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function TabMessagesV2() {
  const { t } = useTranslation('messages')
  const { user } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [conversations, setConversations] = useState<any[]>([])
  const [active, setActive] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [conversationSearch, setConversationSearch] = useState('')
  const [sendError, setSendError] = useState('')
  const [reportingMessageId, setReportingMessageId] = useState<number | null>(null)
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showDirectModal, setShowDirectModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [typingUsers, setTypingUsers] = useState<number[]>([])
  const [pinnedMessage, setPinnedMessage] = useState<any | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const typingTimerRef = useRef<number | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const remoteTypingTimersRef = useRef<Map<number, number>>(new Map())
  const activeRef = useRef<any | null>(null)
  const isTypingRef = useRef(false)
  const endRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [allMessages, setAllMessages] = useState<any[]>([])
  const [displayCount, setDisplayCount] = useState(30)
  const [loadingOlder, setLoadingOlder] = useState(false)

  // Search states for modals
  const [directSearchQuery, setDirectSearchQuery] = useState('')
  const [directSearchResults, setDirectSearchResults] = useState<AuthUser[]>([])
  const [directLoading, setDirectLoading] = useState(false)
  const [groupSearchResults, setGroupSearchResults] = useState<AuthUser[]>([])
  const [groupLoading, setGroupLoading] = useState(false)

  const [viewedProfile, setViewedProfile] = useState<any | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
  const API_BASE_URL = API_URL.replace(/\/api\/?$/, '')

  const resolveProfilePicture = (value: unknown, version?: number) => {
    if (!value) return ''
    const raw = String(value).trim()
    if (!raw) return ''

    let url = raw
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:image/')) {
      url = url.startsWith('/') ? `${API_BASE_URL}${url}` : `${API_BASE_URL}/${url.replace(/^\/+/, '')}`
    }

    if (version) {
      url += `${url.includes('?') ? '&' : '?'}v=${version}`
    }

    return url
  }

  useEffect(() => {
    activeRef.current = active
  }, [active])

  useEffect(() => {
    setTypingUsers([])
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    isTypingRef.current = false
  }, [active?.key])

  const appendMessage = (message: any) => {
    setAllMessages((prev) => prev.some((item) => item.id_message === message.id_message) ? prev : [...prev, message])
    const el = containerRef.current
    const atBottom = el ? (el.scrollTop + el.clientHeight >= el.scrollHeight - 80) : true
    if (atBottom) {
      setMessages((prev) => prev.some((item) => item.id_message === message.id_message) ? prev : [...prev, message])
      setDisplayCount((c) => Math.min(c + 1, allMessages.length + 1))
      setTimeout(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, 50)
    }
  }

  // Récupère la photo la plus récente de l'interlocuteur.
  // On utilise d'abord l'ID exact, puis les autres sources déjà présentes
  // dans le projet en cas d'indisponibilité de /users/:id.
  const getFreshProfilePicture = async (
    userId: number | string,
    fallbackPicture: unknown,
    userName: string,
    city?: string | null,
  ): Promise<string | null> => {
    const activeId = Number(userId)
    if (!Number.isFinite(activeId) || activeId <= 0) {
      return fallbackPicture ? String(fallbackPicture) : null
    }

    // 1. Source la plus fiable : profil exact par ID.
    try {
      const profile = await api.getUserById(activeId)
      const picture =
        profile?.profilePicture ??
        (profile as any)?.profile_picture ??
        null

      if (picture) return String(picture)
    } catch (error) {
      console.warn('[MESSAGES] Impossible de charger /users/:id :', error)
    }

    // 2. Secours : recherche utilisateur avec comparaison d'ID.
    try {
      const results = await api.searchUsers(userName || '')
      const found = (Array.isArray(results) ? results : []).find((item: any) =>
        Number(item?.id ?? item?.id_utilisateur) === activeId
      )

      const picture =
        (found as any)?.profilePicture ??
        (found as any)?.profile_picture ??
        null

      if (picture) return String(picture)
    } catch (error) {
      console.warn('[MESSAGES] Impossible de charger /users/search :', error)
    }

    // 3. Dernier secours : endpoint public déjà utilisé par le projet.
    try {
      const response = await api.profilsRechercheLogement({
        ville: city || '',
        q: userName || undefined,
        months: 12,
        roles: 'colocataire,proprietaire,agent',
        includeAllRoles: true,
      })

      const profiles = Array.isArray(response?.profiles)
        ? response.profiles
        : []

      const found = profiles.find(
        (item: any) => Number(item?.id_utilisateur) === activeId
      )

      const picture =
        (found as any)?.profile_picture ??
        (found as any)?.profilePicture ??
        null

      if (picture) return String(picture)
    } catch (error) {
      console.warn('[MESSAGES] Impossible de charger le profil public :', error)
    }

    // 4. Si aucune source ne répond, on conserve la photo déjà connue.
    return fallbackPicture ? String(fallbackPicture) : null
  }

  // 1. Regroupement dynamique par Déposition / Annonce
  const loadConversations = async (refreshProfilePictures = false) => {
    const [directThreads, groups] = await Promise.all([
      api.messagesThreads().catch(() => []),
      api.groupThreads().catch(() => []),
    ])

    // IMPORTANT : lors de l'entrée dans la messagerie, on enrichit les
    // conversations DIRECTES avec la photo actuelle de chaque interlocuteur.
    // Pour les rafraîchissements déclenchés par le WebSocket, on conserve
    // les photos déjà connues afin d'éviter de multiplier les requêtes API.
    const direct = refreshProfilePictures
      ? await Promise.all(
          directThreads.map(async (thread: any) => {
            const id = Number(thread.interlocuteur_id)
            const name = `${thread.interlocuteur_prenom || ''} ${thread.interlocuteur_nom || ''}`.trim() || 'Utilisateur'
            const initialPicture =
              thread.interlocuteur_profile_picture ??
              thread.profile_picture ??
              thread.profilePicture ??
              null

            const profilePicture = await getFreshProfilePicture(
              id,
              initialPicture,
              name,
              thread.annonce_ville ?? null,
            )

            return {
              key: `direct:${thread.interlocuteur_id}`,
              type: 'direct',
              id: thread.interlocuteur_id,
              name,
              initials: `${thread.interlocuteur_prenom?.[0] || ''}${thread.interlocuteur_nom?.[0] || ''}`.toUpperCase() || 'U',
              profilePicture,
              profilePictureVersion: profilePicture ? Date.now() : undefined,
              lastMessage: thread.dernier_message || t('no_message'),
              total: Number(thread.total_messages || 0),
              unread: Number(thread.non_lus || 0),
              date: thread.date_dernier_message || thread.dernier_message || null,
              annonce: thread.id_annonce ? {
                id: thread.id_annonce,
                title: thread.annonce_titre,
                quartier: thread.annonce_quartier,
                ville: thread.annonce_ville,
                price: thread.annonce_prix,
                photo: thread.annonce_photo,
              } : null,
            }
          })
        )
      : directThreads.map((thread: any) => ({
          key: `direct:${thread.interlocuteur_id}`,
          type: 'direct',
          id: thread.interlocuteur_id,
          name: `${thread.interlocuteur_prenom || ''} ${thread.interlocuteur_nom || ''}`.trim() || 'Utilisateur',
          initials: `${thread.interlocuteur_prenom?.[0] || ''}${thread.interlocuteur_nom?.[0] || ''}`.toUpperCase() || 'U',
          profilePicture:
            thread.interlocuteur_profile_picture ??
            thread.profile_picture ??
            thread.profilePicture ??
            null,
          profilePictureVersion: thread.interlocuteur_profile_picture || thread.profile_picture || thread.profilePicture
            ? Date.now()
            : undefined,
          lastMessage: thread.dernier_message || t('no_message'),
          total: Number(thread.total_messages || 0),
          unread: Number(thread.non_lus || 0),
          date: thread.date_dernier_message || thread.dernier_message || null,
          annonce: thread.id_annonce ? {
            id: thread.id_annonce,
            title: thread.annonce_titre,
            quartier: thread.annonce_quartier,
            ville: thread.annonce_ville,
            price: thread.annonce_prix,
            photo: thread.annonce_photo,
          } : null,
        }))

    const groupItems = groups.map((group: any) => ({
      key: `group:${group.id_groupe}`,
      type: 'group',
      id: group.id_groupe,
      name: group.nom,
      initials: 'GR',
      lastMessage: group.dernier_message || t('no_message'),
      total: Number(group.total_messages || 0),
      unread: Number(group.non_lus || 0),
      date: group.date_dernier_message || group.date_creation || null,
      annonce: group.id_annonce ? {
        id: group.id_annonce,
        title: group.annonce_titre,
        quartier: group.annonce_quartier,
        ville: group.annonce_ville,
        price: group.annonce_prix,
        photo: group.annonce_photo,
      } : null,
    }))

    const rawList = [...direct, ...groupItems]

    const groupedMap = new Map<string | number, any>()
    const withoutAnnonce: any[] = []

    rawList.forEach((item) => {
      if (item.annonce?.id) {
        const annonceId = item.annonce.id
        if (!groupedMap.has(annonceId)) {
          groupedMap.set(annonceId, {
            ...item,
            threads: [item],
          })
        } else {
          const existing = groupedMap.get(annonceId)
          existing.threads.push(item)
          existing.unread += item.unread
          existing.total += item.total

          if (new Date(item.date || 0) > new Date(existing.date || 0)) {
            existing.lastMessage = item.lastMessage
            existing.date = item.date
          }
        }
      } else {
        withoutAnnonce.push(item)
      }
    })

    const merged = [...Array.from(groupedMap.values()), ...withoutAnnonce].sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
    )

    setConversations(merged)
    return merged
  }

  useEffect(() => {
    setLoading(true)
    loadConversations(true)
      .then((items) => {
        setActive(items[0] || null)
        if (typeof window !== 'undefined') setIsSidebarOpen(window.innerWidth >= 1024)
      })
      .finally(() => setLoading(false))
  }, [])

  // Modals Search Effects
  useEffect(() => {
    if (!showDirectModal) return
    setDirectLoading(true)
    const timer = window.setTimeout(() => {
      api.searchUsers(directSearchQuery).then(setDirectSearchResults).catch(() => setDirectSearchResults([])).finally(() => setDirectLoading(false))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [directSearchQuery, showDirectModal])

  useEffect(() => {
    if (!showGroupModal) return
    setGroupLoading(true)
    const timer = window.setTimeout(() => {
      api.searchUsers(userSearch)
        .then((items) => setGroupSearchResults(items.filter((item) => item.id !== user?.id)))
        .catch(() => setGroupSearchResults([]))
        .finally(() => setGroupLoading(false))
    }, 200)
    return () => window.clearTimeout(timer)
  }, [userSearch, showGroupModal, user?.id])

  const startDirect = (item: AuthUser) => {
    const existing = conversations.find((conversation) => conversation.key === `direct:${item.id}`)
    const next = existing || {
      key: `direct:${item.id}`,
      type: 'direct' as const,
      id: item.id,
      name: `${item.prenom} ${item.nom}`.trim() || item.email,
      initials: item.initials || `${item.prenom?.[0] || ''}${item.nom?.[0] || ''}`.toUpperCase() || 'U',
      profilePicture:
        item.profilePicture ??
        (item as any).profile_picture ??
        null,
      profilePictureVersion:
        item.profilePicture || (item as any).profile_picture
          ? Date.now()
          : undefined,
      lastMessage: t('no_message'),
      total: 0,
      unread: 0,
      date: null,
    }
    if (!existing) setConversations((prev) => [next, ...prev])
    setActive(next)
    setShowDirectModal(false)
    setDirectSearchQuery('')
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  const toggleSelectedUser = (id: number) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      setSendError(t('send_error_group'))
      return
    }
    try {
      const created = await api.createGroup({ nom: groupName.trim(), membres: selectedUsers })
      const items = await loadConversations()
      const createdConversation = {
        key: `group:${created.id_groupe}`,
        type: 'group',
        id: created.id_groupe,
        name: created.nom,
        initials: 'GR',
        lastMessage: t('no_message'),
        total: 0,
        unread: 0,
        date: new Date().toISOString(),
      }
      setConversations((prev) => prev.some((item) => item.key === createdConversation.key) ? prev : [createdConversation, ...prev])
      setActive(items.find((item) => item.key === `group:${created.id_groupe}`) || createdConversation)
      setGroupName('')
      setSelectedUsers([])
      setShowGroupModal(false)
      window.dispatchEvent(new Event('colockoo:counters-refresh'))
    } catch (err) {
      setSendError(err instanceof Error ? err.message : t('create_group_error'))
    }
  }

  // 2. Chargement et filtrage des messages selon la déposition active
  useEffect(() => {
    let mounted = true
    if (!active) {
      setAllMessages([])
      setMessages([])
      return
    }
    setMsgLoading(true)

    const loader = active.type === 'group' ? api.groupMessages(active.id) : api.messagesThread(active.id)

    loader.then((data) => {
      if (!mounted) return
      let items = (data as any[]) || []

      // Filtre : ne conserve que les messages associés à la déposition sélectionnée
      if (active.annonce?.id) {
        items = items.filter((m: any) => String(m.id_annonce) === String(active.annonce.id))
      }

      setAllMessages(items)
      setDisplayCount(Math.min(30, items.length))
      setMessages(items.slice(-Math.min(30, items.length)))
      setTimeout(() => { const el = containerRef.current; if (el) el.scrollTop = el.scrollHeight }, 50)
    }).catch(() => {
      if (!mounted) return
      setAllMessages([])
      setMessages([])
    }).finally(() => { if (mounted) setMsgLoading(false) })

    return () => { mounted = false }
  }, [active?.key, active?.annonce?.id])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120
    if (atBottom) endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers])

  const handleScroll = () => {
    const el = containerRef.current
    if (!el || loadingOlder) return
    if (el.scrollTop <= 40) {
      if (allMessages.length > messages.length) {
        setLoadingOlder(true)
        const prevScrollHeight = el.scrollHeight
        const nextCount = Math.min(allMessages.length, displayCount + 30)
        setDisplayCount(nextCount)
        setMessages(allMessages.slice(-nextCount))
        setTimeout(() => {
          const newScrollHeight = el.scrollHeight
          el.scrollTop = newScrollHeight - prevScrollHeight + el.scrollTop
          setLoadingOlder(false)
        }, 50)
      }
    }
  }

  // 3. WebSocket avec vérification de l'annonce active
  useEffect(() => {
    if (!user) return
    let disposed = false

    const connect = () => {
      const ws = new WebSocket(getWebSocketUrl())
      wsRef.current = ws
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          const currentActive = activeRef.current

          if (payload.type === 'direct_message' && payload.message) {
            const otherId = payload.message.id_expediteur === user.id ? payload.message.id_destinataire : payload.message.id_expediteur
            const sameAnnonce = currentActive?.annonce?.id
              ? String(payload.message.id_annonce) === String(currentActive.annonce.id)
              : true

            if (currentActive?.type === 'direct' && currentActive.id === otherId && sameAnnonce) {
              appendMessage(payload.message)
              setTypingUsers((prev) => prev.filter((id) => id !== Number(otherId)))
            }
            void loadConversations()
          }

          if (payload.type === 'group_message' && payload.message) {
            const sameAnnonce = currentActive?.annonce?.id
              ? String(payload.message.id_annonce) === String(currentActive.annonce.id)
              : true

            if (currentActive?.type === 'group' && currentActive.id === Number(payload.groupId) && sameAnnonce) {
              appendMessage(payload.message)
              setTypingUsers((prev) => prev.filter((id) => id !== Number(payload.message.id_expediteur)))
            }
            void loadConversations()
          }

          if (payload.type === 'group_created') {
            void loadConversations()
            window.dispatchEvent(new Event('colockoo:counters-refresh'))
          }

          if (payload.type === 'typing') {
            const sameDirect = currentActive?.type === 'direct' && currentActive.id === Number(payload.fromUserId)
            const sameGroup = currentActive?.type === 'group' && currentActive.id === Number(payload.targetId)
            if (sameDirect || sameGroup) {
              const typingUserId = Number(payload.fromUserId)
              const previousTimer = remoteTypingTimersRef.current.get(typingUserId)
              if (previousTimer) window.clearTimeout(previousTimer)
              if (payload.isTyping) {
                setTypingUsers((prev) => [...new Set([...prev, typingUserId])])
                remoteTypingTimersRef.current.set(typingUserId, window.setTimeout(() => {
                  setTypingUsers((prev) => prev.filter((id) => id !== typingUserId))
                  remoteTypingTimersRef.current.delete(typingUserId)
                }, 2500))
              } else {
                setTypingUsers((prev) => prev.filter((id) => id !== typingUserId))
                remoteTypingTimersRef.current.delete(typingUserId)
              }
            }
          }

          if (payload.type === 'notification') {
            void loadConversations()
            window.dispatchEvent(new Event('colockoo:counters-refresh'))
          }
        } catch {
          // Payload ignore
        }
      }
      ws.onclose = () => {
        if (!disposed) reconnectTimerRef.current = window.setTimeout(connect, 1500)
      }
    }

    connect()
    return () => {
      disposed = true
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current)
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
      remoteTypingTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      remoteTypingTimersRef.current.clear()
      wsRef.current?.close()
    }
  }, [user?.id])

  const emitTyping = (isTyping: boolean) => {
    if (!active || wsRef.current?.readyState !== WebSocket.OPEN) return
    wsRef.current.send(JSON.stringify({
      type: 'typing',
      conversationType: active.type === 'group' ? 'group' : 'direct',
      targetId: active.id,
      isTyping,
    }))
  }

  const handleReplyChange = (value: string) => {
    setReply(value)
    if (!value.trim()) {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
      if (isTypingRef.current) emitTyping(false)
      isTypingRef.current = false
      return
    }

    if (!isTypingRef.current) {
      emitTyping(true)
      isTypingRef.current = true
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    typingTimerRef.current = window.setTimeout(() => {
      emitTyping(false)
      isTypingRef.current = false
    }, 1200)
  }

  const handleSend = async () => {
    if (!active || !reply.trim()) return
    const contenu = reply.trim()
    setReply('')
    setSendError('')
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current)
    emitTyping(false)
    isTypingRef.current = false
    try {
      const sent = active.type === 'group'
        ? await api.sendGroupMessage(active.id, contenu)
        : await api.sendMessage({ id_destinataire: active.id, contenu, id_annonce: active.annonce?.id })
      appendMessage(sent as any)
      void loadConversations()
      window.dispatchEvent(new Event('colockoo:counters-refresh'))
    } catch (err) {
      setReply(contenu)
      setSendError(err instanceof Error ? err.message : t('send_message_error'))
    }
  }

  const handleReportMessage = async (m: any) => {
    if (!m) return
    setReportingMessageId(m.id_message)
    const raison = window.prompt(t('report_prompt')) || ''
    try {
      if (active?.type === 'group') {
        await api.reportGroupMessage(active.id, m.id_message, { raison })
      } else {
        await api.reportMessage(m.id_message, { raison })
      }
      alert(t('report_success'))
    } catch (err) {
      alert(err instanceof Error ? err.message : t('report_error'))
    } finally {
      setReportingMessageId(null)
    }
  }

  const viewProfile = async () => {
    if (!active || active.type !== 'direct') return

    setProfileLoading(true)
    setViewedProfile(null)

    const activeId = Number(active.id)
    const query = String(active.name || '').trim()

    const normalize = (value: unknown) =>
      String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()

    try {
      let found: any = null

      // 1. Première source : /users/search.
      try {
        const results = await api.searchUsers(query)
        const users = Array.isArray(results) ? (results as any[]) : []

        found = users.find((item: any) => {
          const id = Number(item.id ?? item.id_utilisateur)
          return Number.isFinite(id) && id === activeId
        }) || null

        if (!found && query) {
          const normalizedQuery = normalize(query)
          found = users.find((item: any) =>
            normalize(`${item.prenom || ''} ${item.nom || ''}`) === normalizedQuery
          ) || null
        }
      } catch (error) {
        console.warn('[MESSAGES] /users/search indisponible :', error)
      }

      // 2. On essaie d'abord le profil direct par identifiant.
      //    C'est la source la plus fiable pour obtenir la photo actuelle
      //    de la personne avec qui la conversation est ouverte.
      if (!found?.profilePicture && !found?.profile_picture) {
        try {
          const directProfile = await api.getUserById(activeId)
          if (directProfile) {
            found = {
              ...(found || {}),
              ...directProfile,
              id: Number(directProfile.id ?? (directProfile as any).id_utilisateur ?? activeId),
              profilePicture:
                directProfile.profilePicture ??
                (directProfile as any).profile_picture ??
                null,
            }
          }
        } catch (error) {
          // Cette route peut ne pas exister sur certaines versions du backend.
          // On continue alors avec la route publique déjà utilisée par le projet.
          console.warn('[MESSAGES] /users/:id indisponible :', error)
        }
      }

      // 3. Si /users/search et /users/:id ne renvoient pas la photo, on utilise
      //    l'endpoint déjà présent dans le projet pour les profils publics.
      //    Cet endpoint renvoie explicitement profile_picture.
      if (!found?.profilePicture && !found?.profile_picture) {
        const cities = Array.from(new Set([
          active.annonce?.ville,
          user?.villeActuelle,
          '',
        ].filter((value): value is string => typeof value === 'string')))

        for (const ville of cities) {
          try {
            const response = await api.profilsRechercheLogement({
              ville,
              q: query || undefined,
              months: 12,
              roles: 'colocataire,proprietaire,agent',
              includeAllRoles: true,
            })

            const profiles = Array.isArray(response?.profiles) ? response.profiles : []

            const candidate = profiles.find((profile: any) =>
              Number(profile.id_utilisateur) === activeId
            ) || profiles.find((profile: any) =>
              normalize(`${profile.prenom || ''} ${profile.nom || ''}`) === normalize(query)
            ) || null

            if (candidate) {
              found = {
                ...(found || {}),
                ...candidate,
                id: Number(candidate.id_utilisateur ?? activeId),
              profilePicture:
                candidate.profile_picture ??
                (candidate as any).profilePicture ??
                found?.profilePicture ??
                found?.profile_picture ??
                null,
              }
              break
            }
          } catch (error) {
            console.warn('[MESSAGES] Impossible de charger le profil public :', error)
          }
        }
      }

      // 3. Dernier secours : les données déjà présentes dans la conversation.
      if (!found) {
        found = {
          id: activeId,
          prenom: query.split(' ')[0] || 'Utilisateur',
          nom: query.split(' ').slice(1).join(' '),
          profilePicture: active.profilePicture ?? null,
          profile_picture: active.profilePicture ?? null,
          roleLabel: 'colocataire',
        }
      }

      const rawPicture =
        found.profilePicture ??
        found.profile_picture ??
        found.photo_profil ??
        found.photo_url ??
        found.avatar ??
        active.profilePicture ??
        null

      const normalizedProfile = {
        ...found,
        id: Number(found.id ?? found.id_utilisateur ?? activeId),
        prenom: found.prenom || query.split(' ')[0] || 'Utilisateur',
        nom: found.nom || query.split(' ').slice(1).join(' '),
        profilePicture: rawPicture,
        profile_picture: rawPicture,
        roleLabel: found.roleLabel || found.poste || found.role || 'colocataire',
        bio: found.bio ?? null,
        profession: found.profession ?? null,
        age: found.age ?? null,
        villeActuelle: found.villeActuelle ?? found.ville_actuelle ?? null,
        profilePictureVersion: Date.now(),
      }

      setViewedProfile(normalizedProfile)

      // On mémorise immédiatement la photo fraîche dans la conversation.
      if (rawPicture) {
        setActive((current: any) => current ? {
          ...current,
          profilePicture: rawPicture,
          profilePictureVersion: normalizedProfile.profilePictureVersion,
        } : current)

        setConversations((previous) => previous.map((conversation) =>
          conversation.key === active.key
            ? {
                ...conversation,
                profilePicture: rawPicture,
                profilePictureVersion: normalizedProfile.profilePictureVersion,
              }
            : conversation
        ))
      }
    } catch (error) {
      console.error('[MESSAGES] Impossible de charger le profil :', error)

      setViewedProfile({
        id: activeId,
        prenom: query.split(' ')[0] || 'Utilisateur',
        nom: query.split(' ').slice(1).join(' '),
        profilePicture: active.profilePicture ?? null,
        profile_picture: active.profilePicture ?? null,
        roleLabel: 'colocataire',
        bio: null,
        profilePictureVersion: Date.now(),
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const closeProfile = () => {
    setViewedProfile(null)
  }

  const handleConversationClick = (c: any) => {
    setActive(c)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  const filteredConversations = conversations.filter((conversation) => {
    const query = conversationSearch.trim().toLocaleLowerCase()
    if (!query) return true
    return `${conversation.name} ${conversation.lastMessage} ${conversation.annonce?.title || ''}`.toLocaleLowerCase().includes(query)
  })

  return (
    <div className="flex h-[calc(100dvh-180px)] min-h-[480px] w-full min-w-0 overflow-hidden rounded-none border border-border bg-white shadow-sm sm:min-h-[560px] sm:rounded-2xl lg:h-[700px] lg:max-h-[calc(100dvh-180px)] lg:flex-row">
      {/* Panneau latéral gauche */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} min-h-0 w-full shrink-0 flex-col overflow-hidden bg-white lg:flex lg:h-full lg:w-[300px] xl:w-[320px] lg:border-r`}>
        <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
          <div className="flex items-center gap-2 min-w-0">
            <button aria-label="Fermer les conversations" onClick={() => setIsSidebarOpen(false)} className="rounded-full p-2 hover:bg-muted lg:hidden shrink-0">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight truncate">{t('title')}</h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button aria-label={t('new_discussion')} title={t('new_discussion')} onClick={() => setShowDirectModal(true)} className="rounded-full bg-muted p-2.5 text-foreground transition hover:bg-muted/70">
              <Plus className="h-4 w-4" />
            </button>
            <button aria-label={t('new_group')} title={t('new_group')} onClick={() => setShowGroupModal(true)} className="rounded-full bg-brand-cyan p-2.5 text-white shadow-sm transition hover:brightness-95">
              <UserPlus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <label className="mx-4 mb-3 flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-muted-foreground focus-within:ring-2 focus-within:ring-brand-cyan/30 sm:mx-5">
          <Search className="h-4 w-4 shrink-0" />
          <input value={conversationSearch} onChange={(event) => setConversationSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" placeholder={t('search_placeholder')} aria-label={t('search_placeholder')} />
          {conversationSearch && <button type="button" onClick={() => setConversationSearch('')} aria-label="Effacer la recherche" className="rounded-full px-1 text-xs hover:bg-background">×</button>}
        </label>
        <div className="flex-1 overflow-y-auto px-2 pb-4 sm:px-3">
          {loading ? <div className="p-5 text-sm text-muted-foreground">{t('loading_conversations')}</div> : filteredConversations.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">{conversationSearch ? t('no_conversations_found') : t('no_conversations_yet')}</div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((c) => (
                <button key={c.key} onClick={() => handleConversationClick(c)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-muted/70 ${active?.key === c.key ? 'bg-brand-cyan-light/25' : ''}`}>
                  {c.annonce?.photo ? (
                    <img src={c.annonce.photo} alt="Déposition associée" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : c.annonce ? (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-cyan-light/20 text-brand-cyan"><House className="h-5 w-5" /></div>
                  ) : c.type === 'direct' && c.profilePicture ? (
                    <img
                      key={`${c.id}-${c.profilePicture}-${c.profilePictureVersion || ''}`}
                      src={resolveProfilePicture(c.profilePicture, c.profilePictureVersion)}
                      alt={c.name}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                      onError={(event) => { event.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${c.type === 'group' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-cyan/15 text-brand-cyan'}`}>{c.initials}</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold">{c.annonce?.title || c.name}</div>
                      {c.date && <time className="shrink-0 text-[11px] text-muted-foreground">{new Date(c.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</time>}
                    </div>
                    {c.annonce && (
                      <div className="mt-0.5 flex max-w-full items-center gap-1 truncate text-[11px] font-medium text-brand-cyan">
                        <House className="h-3 w-3 shrink-0" />
                        <span className="truncate">{c.name}{(c.annonce.quartier || c.annonce.ville) && ` · ${c.annonce.quartier || c.annonce.ville}`}{c.annonce.price ? ` · ${Number(c.annonce.price).toLocaleString()} Ar` : ''}</span>
                      </div>
                    )}
                    <div className={`truncate text-xs ${c.unread > 0 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cyan px-1 text-[10px] font-bold text-white">{c.unread}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Direct message modal */}
      {showDirectModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('new_discussion')}</h3>
              <button onClick={() => setShowDirectModal(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div>
              <input value={directSearchQuery} onChange={(e) => setDirectSearchQuery(e.target.value)} placeholder={t('search_user')} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none" />
              <div className="mt-4 max-h-64 overflow-y-auto rounded-xl border border-border">
                {directLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">{t('searching')}</div>
                ) : directSearchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">{t('no_user_found')}</div>
                ) : directSearchResults.map((item) => (
                  <button key={item.id} onClick={() => startDirect(item)} className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left last:border-b-0 hover:bg-muted/50">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-cyan to-brand-green text-xs font-bold text-white">{item.initials || 'U'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{item.prenom} {item.nom}</div>
                      <div className="truncate text-xs text-muted-foreground">{item.email}</div>
                    </div>
                    <Plus className="h-4 w-4 text-brand-cyan" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create group modal */}
      {showGroupModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('new_group')}</h3>
              <button onClick={() => setShowGroupModal(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <label className="mb-1.5 block text-sm font-semibold">{t('group_name')}</label>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={t('group_name_placeholder')} className="mb-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-brand-cyan" />
            <label className="mb-1.5 flex items-center justify-between text-sm font-semibold">
              <span>{t('members')}</span>
              <span className="text-xs font-medium text-brand-cyan">
                {selectedUsers.length} {selectedUsers.length > 1 ? t('selected_plural') : t('selected_singular')}
              </span>
            </label>
            <div>
              <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder={t('search_user')} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none" />
              <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-border">
                {groupLoading ? (
                  <div className="p-4 text-sm text-muted-foreground">{t('loading_users')}</div>
                ) : groupSearchResults.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">{t('no_user_found')}</div>
                ) : groupSearchResults.map((item) => (
                  <button key={item.id} type="button" onClick={() => toggleSelectedUser(item.id)} className="flex w-full items-center gap-3 border-b border-border/60 px-4 py-3 text-left last:border-b-0 hover:bg-muted/50">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${selectedUsers.includes(item.id) ? 'bg-brand-cyan' : 'bg-muted'}`}>{item.initials || 'U'}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{item.prenom} {item.nom}</div>
                      <div className="truncate text-xs text-muted-foreground">{item.email}</div>
                    </div>
                    {selectedUsers.includes(item.id) ? <span className="text-xs text-brand-cyan">✓</span> : null}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setShowGroupModal(false)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">{t('cancel')}</button>
              <button onClick={createGroup} className="flex-1 rounded-xl bg-brand-cyan px-4 py-2.5 text-sm font-semibold text-white">{t('create')}</button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Zone principale de conversation */}
      <main className={`${isSidebarOpen ? 'hidden' : 'flex'} min-h-0 min-w-0 flex-1 flex-col bg-[#f7f8fa] lg:flex`}>
        <header className="flex min-h-[64px] sm:min-h-[72px] items-center gap-3 border-b border-border bg-white px-3 py-3 sm:px-5">
          <button aria-label="Retour aux conversations" onClick={() => setIsSidebarOpen(true)} className="rounded-full p-2 hover:bg-muted lg:hidden shrink-0"><ChevronLeft className="h-5 w-5" /></button>
          {active?.type === 'direct' && active?.profilePicture ? (
            <img
              key={`${active.id}-${active.profilePicture}-${active.profilePictureVersion || ''}`}
              src={resolveProfilePicture(active.profilePicture, active.profilePictureVersion)}
              alt={active.name || 'Profil'}
              className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full object-cover"
              onError={(event) => { event.currentTarget.style.display = 'none' }}
            />
          ) : (
            <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active?.type === 'group' ? 'bg-brand-green/15 text-brand-green' : 'bg-brand-cyan/15 text-brand-cyan'}`}>{active?.initials || <MessageSquare className="h-5 w-5" />}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold text-sm sm:text-base">{active?.annonce?.title || active?.name || t('title')}</div>
            <div className="truncate text-xs text-muted-foreground">{active?.annonce ? t('deposition', { name: active.name }) : active ? t('private_conversation') : t('select_conversation')}</div>
          </div>
          {active?.type === 'direct' && <button aria-label={t('profile')} onClick={() => { void viewProfile() }} className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan-light/20 sm:text-sm">{t('profile')}</button>}
        </header>

        {/* Banner message épinglé */}
        {pinnedMessage ? (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-b-lg text-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground">{t('pinned_message')}</div>
                <div className="font-semibold truncate">{pinnedMessage.expediteur_prenom} {pinnedMessage.expediteur_nom}</div>
                <div className="mt-1 text-sm break-words">{pinnedMessage.contenu}</div>
              </div>
              <button onClick={() => setPinnedMessage(null)} className="shrink-0 text-sm text-muted-foreground">{t('unpin')}</button>
            </div>
          </div>
        ) : null}

        {/* Zone des messages */}
        <div ref={(el) => { containerRef.current = el }} onScroll={handleScroll} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
          {!active ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center text-muted-foreground">
              <MessageSquare className="mb-3 h-10 w-10 text-brand-cyan" />
              <p className="font-medium text-foreground">{t('your_messages')}</p>
              <p className="mt-1 text-sm">{t('select_conversation_hint')}</p>
            </div>
          ) : msgLoading ? (
            <div className="p-5 text-center text-sm text-muted-foreground">{t('loading_messages')}</div>
          ) : (
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-2">
              {loadingOlder ? <div className="text-center text-sm text-muted-foreground">{t('loading_older')}</div> : null}
              {messages.map((m) => {
                const isMe = m.id_expediteur === user?.id
                const senderName = m.expediteur_prenom || m.expediteur_nom ? `${m.expediteur_prenom || ''} ${m.expediteur_nom || ''}`.trim() : 'Utilisateur'

                return (
                  <div key={m.id_message} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                      {!isMe && active?.type === 'group' && (
                        <div className="mb-1 text-[11px] text-muted-foreground font-medium">{senderName}</div>
                      )}
                      <div className={`relative rounded-2xl px-4 py-2.5 text-sm ${isMe ? 'bg-brand-cyan text-white rounded-br-none' : 'bg-white text-foreground border border-border/80 rounded-bl-none shadow-sm'}`}>
                        <p className="break-words leading-relaxed">{m.contenu}</p>
                        <div className={`mt-1 text-[10px] text-right ${isMe ? 'text-white/80' : 'text-muted-foreground'}`}>
                          {new Date(m.date_envoi || m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <button onClick={() => handleReportMessage(m)} title={t('report_message')} className="opacity-0 group-hover:opacity-100 transition p-1 text-muted-foreground hover:text-red-500">
                        <Flag className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        {active && (
          <footer className="border-t border-border bg-white p-3 sm:p-4">
            {sendError && <div className="mb-2 text-xs text-red-500">{sendError}</div>}
            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex items-center gap-2">
              <input
                value={reply}
                onChange={(e) => handleReplyChange(e.target.value)}
                placeholder={t('type_message_placeholder')}
                className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-cyan/30"
              />
              <button
                type="submit"
                disabled={!reply.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cyan text-white transition hover:brightness-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </footer>
        )}
      </main>

      {viewedProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('profile')}
          onClick={closeProfile}
        >
          <div
            className="grid w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl md:grid-cols-[42%_58%]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative min-h-[320px] bg-[#f1f3f5] md:min-h-[620px]">
              {viewedProfile.profilePicture ? (
                <img
                  key={`${viewedProfile.id}-${viewedProfile.profilePicture}-${viewedProfile.profilePictureVersion || ''}`}
                  src={resolveProfilePicture(viewedProfile.profilePicture, viewedProfile.profilePictureVersion) || undefined}
                  alt={`${viewedProfile.prenom || ''} ${viewedProfile.nom || ''}`.trim()}
                  className="absolute inset-0 z-10 h-full w-full object-cover"
                  onError={(event) => { event.currentTarget.style.display = 'none' }}
                />
              ) : null}

              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-cyan to-brand-green text-7xl font-bold text-white">
                {viewedProfile.initials || `${viewedProfile.prenom?.[0] || ''}${viewedProfile.nom?.[0] || ''}`.toUpperCase() || 'U'}
              </div>
            </div>

            <div className="relative max-h-[90vh] overflow-y-auto p-7 sm:p-10">
              <button
                type="button"
                aria-label="Fermer"
                onClick={closeProfile}
                className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="pr-10">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {viewedProfile.prenom || ''} {viewedProfile.nom || ''}
                </h2>
                <p className="mt-2 text-xl text-muted-foreground">
                  {viewedProfile.roleLabel || viewedProfile.poste || viewedProfile.role || 'colocataire'}
                </p>
              </div>

              <div className="my-8 h-px bg-border" />

              <section>
                <h3 className="flex items-center gap-2 text-xl font-semibold">
                  <span className="text-brand-cyan">♙</span> PROFIL
                </h3>

                <p className="mt-7 text-base leading-7 text-foreground">
                  {viewedProfile.bio || "Ce membre n'a pas encore complété sa présentation."}
                </p>

                <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                  {viewedProfile.profession ? (
                    <p>Profession : <span className="font-semibold text-foreground">{viewedProfile.profession}</span></p>
                  ) : null}
                  <p>Type de profil : <span className="font-semibold text-foreground">{viewedProfile.poste || viewedProfile.roleLabel || viewedProfile.role || 'colocataire'}</span></p>
                  {viewedProfile.villeActuelle ? (
                    <p>Ville actuelle : <span className="font-semibold text-foreground">{viewedProfile.villeActuelle}</span></p>
                  ) : null}
                  {viewedProfile.age ? (
                    <p>Âge : <span className="font-semibold text-foreground">{viewedProfile.age} ans</span></p>
                  ) : null}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
