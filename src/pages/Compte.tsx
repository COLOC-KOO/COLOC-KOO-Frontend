import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, Check, FileText, Lock, MessageSquare, Send, Upload, User } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api, ApiAnnonce } from '../lib/api'
import { useAuth } from '../lib/auth'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'

function normalizePhotos(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof value === 'string' && value.trim()) {
    return value.split('||').map((item) => item.trim()).filter(Boolean)
  }
  return []
}

const tabs = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'dossier', label: 'Mes annonces', icon: FileText },
  { id: 'notif', label: 'Notifications', icon: Bell },
  { id: 'paiements', label: 'Messages', icon: MessageSquare },
  { id: 'secu', label: 'Sécurité', icon: Lock }
]

function TabProfil({ user, onSave }: { user: ReturnType<typeof useAuth>['user']; onSave: (payload: Record<string, unknown>) => Promise<unknown> }) {
  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    email: user?.email || '',
    telephone: user?.telephone || '',
    dateNaissance: user?.dateNaissance || '',
    profession: user?.profession || '',
    bio: user?.bio || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    setForm({
      prenom: user?.prenom || '',
      nom: user?.nom || '',
      email: user?.email || '',
      telephone: user?.telephone || '',
      dateNaissance: user?.dateNaissance || '',
      profession: user?.profession || '',
      bio: user?.bio || '',
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const birthDate = form.dateNaissance || null
      const age = birthDate ? new Date().getFullYear() - new Date(birthDate).getFullYear() : null
      await onSave({
        prenom: form.prenom,
        nom: form.nom,
        email: form.email,
        telephone: form.telephone,
        bio: form.bio,
        date_naissance: birthDate,
        age,
        profession: form.profession,
      })
      setMessage('Profil mis à jour avec succès.')
    } catch {
      setMessage('Impossible de mettre à jour le profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Informations personnelles</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Prénom</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.prenom} onChange={(e) => setForm((prev) => ({ ...prev, prenom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Nom</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.nom} onChange={(e) => setForm((prev) => ({ ...prev, nom: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Téléphone</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.telephone} onChange={(e) => setForm((prev) => ({ ...prev, telephone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Date de naissance</label>
          <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.dateNaissance} onChange={(e) => setForm((prev) => ({ ...prev, dateNaissance: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Profession</label>
          <input className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.profession} onChange={(e) => setForm((prev) => ({ ...prev, profession: e.target.value }))} />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Biographie</label>
          <textarea rows={4} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </Button>
    </div>
  )
}

function TabMesAnnonces() {
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.annonces({ mine: 'true', statut: 'all' })
      .then((data) => setAnnonces(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger vos annonces.'))
      .finally(() => setLoading(false))
  }, [])

  const statutStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    active: 'bg-brand-green-light text-brand-green-dark',
    rejected: 'bg-red-100 text-red-700',
    archived: 'bg-slate-100 text-slate-700',
    expired: 'bg-slate-100 text-slate-700',
  }

  const statutLabels: Record<string, string> = {
    pending: 'En attente',
    active: 'Active',
    rejected: 'Rejetée',
    archived: 'Archivée',
    expired: 'Expirée',
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Mes annonces</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Toutes les annonces que tu as déposées, y compris celles en attente de validation.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Chargement...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-600">{error}</p>
      ) : annonces.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">Aucune annonce trouvée. Dépose une annonce pour la voir ici.</p>
      ) : (
        <div className="mt-5 space-y-4">
          {annonces.map((annonce) => {
            const photos = normalizePhotos(annonce.photos)
            const img = photos[0] || FALLBACK_IMG
            return (
              <div key={annonce.id} className="rounded-3xl border border-border bg-white shadow-sm overflow-hidden">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Link to={`/annonces/${annonce.id}`} className="sm:w-48 sm:h-36 shrink-0 overflow-hidden bg-muted">
                    <img
                      src={img}
                      alt={annonce.titre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="flex-1 p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <Link to={`/annonces/${annonce.id}`} className="text-lg font-semibold text-foreground hover:text-brand-cyan-dark">
                          {annonce.titre}
                        </Link>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {annonce.quartier ? `${annonce.quartier}, ` : ''}{annonce.ville}
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statutStyles[annonce.statut] || 'bg-slate-100 text-slate-700'}`}>
                        {statutLabels[annonce.statut] || annonce.statut}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-3 text-sm text-muted-foreground">
                      <div>Prix: {annonce.chambre?.prix_loyer ? `${annonce.chambre.prix_loyer.toLocaleString('fr-FR')} Ar` : 'Indisponible'}</div>
                      <div>Type: {annonce.type_propriete}</div>
                      <div>Créée le: {new Date(annonce.date_creation).toLocaleDateString('fr-FR')}</div>
                    </div>

                    {photos.length > 1 && (
                      <div className="mt-3 flex gap-2 overflow-x-auto">
                        {photos.slice(1, 5).map((p, i) => (
                          <img key={i} src={p} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0 border border-border" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabNotif() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    annonces: true,
    candidatures: true,
    newsletter: false,
    offres: false,
  })
  const [notifications, setNotifications] = useState<Array<{ id_notification: number; titre: string; texte: string; est_lue: number; type_notification: string; date_creation: string; lien: string | null }>>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.notifications()
      .then((data) => setNotifications(data))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }, [])

  const handleReadAll = async () => {
    setSaving(true)
    try {
      await api.markNotificationsRead()
      setNotifications((prev) => prev.map((item) => ({ ...item, est_lue: 1 })))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Notifications</h2>
      <div className="mt-5 space-y-3">
        {loading ? <p className="text-sm text-muted-foreground">Chargement…</p> : notifications.length === 0 ? <p className="text-sm text-muted-foreground">Aucune notification pour le moment.</p> : notifications.map((item) => (
          <div key={item.id_notification} className="flex items-start justify-between gap-3 rounded-xl border border-border p-4">
            <div>
              <div className="text-sm font-medium">{item.titre}</div>
              <div className="text-sm text-muted-foreground">{item.texte}</div>
              <div className="mt-1 text-xs text-muted-foreground">{new Date(item.date_creation).toLocaleString('fr-FR')}</div>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.est_lue ? 'bg-muted text-muted-foreground' : 'bg-brand-cyan-light text-brand-cyan-dark'}`}>
              {item.est_lue ? 'Lue' : 'Nouvelle'}
            </span>
          </div>
        ))}
      </div>
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleReadAll} disabled={saving}>
        {saving ? 'Mise à jour…' : 'Tout marquer comme lu'}
      </Button>
    </div>
  )
}

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

function TabMessages() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<Array<{
    interlocuteur_id: number
    interlocuteur_nom: string
    interlocuteur_prenom: string
    dernier_message: string
    total_messages: number
    non_lus: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeThread, setActiveThread] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [msgLoading, setMsgLoading] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.messagesThreads()
      .then((data) => setThreads(data))
      .catch((err) => setError(err instanceof Error ? err.message : 'Impossible de charger les messages.'))
      .finally(() => setLoading(false))
  }, [])

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
      setSendError(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    } finally {
      setSending(false)
    }
  }

  const activeThreadInfo = threads.find((t) => t.interlocuteur_id === activeThread)

  // Chat view: conversation with a specific interlocutor
  if (activeThread !== null) {
    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <button
            onClick={() => setActiveThread(null)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm">
            {(activeThreadInfo?.interlocuteur_prenom?.[0] || activeThreadInfo?.interlocuteur_nom?.[0] || '?').toUpperCase()}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {activeThreadInfo?.interlocuteur_prenom} {activeThreadInfo?.interlocuteur_nom}
            </div>
            <div className="text-xs text-muted-foreground">
              {activeThreadInfo?.total_messages} message{activeThreadInfo && activeThreadInfo.total_messages > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {msgLoading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Chargement des messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucun message dans cette conversation.</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.id_expediteur === user?.id
              const senderName = isMe
                ? 'Vous'
                : `${msg.expediteur_prenom} ${msg.expediteur_nom}`
              const isAdmin = !isMe && (msg.expediteur_nom?.toLowerCase().includes('admin') || msg.expediteur_prenom?.toLowerCase().includes('admin') || msg.expediteur_nom?.toLowerCase().includes('super'))
              return (
                <div key={msg.id_message} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isMe
                      ? 'bg-brand-cyan text-white rounded-br-sm'
                      : isAdmin
                        ? 'bg-brand-green-light text-brand-green-dark border border-brand-green/30 rounded-bl-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {!isMe && (
                      <div className="text-xs font-semibold mb-0.5 opacity-80">
                        {senderName}
                        {isAdmin && <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full">Admin</span>}
                      </div>
                    )}
                    {msg.sujet && (
                      <div className="text-xs font-medium mb-1 opacity-70 italic">Re: {msg.sujet}</div>
                    )}
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.contenu}</div>
                    <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.date_envoi).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {sendError && <p className="text-sm text-red-600 mb-2">{sendError}</p>}

        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <input
            type="text"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Écris ton message..."
            className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-brand-cyan"
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={sending || !reply.trim()}
            className="w-10 h-10 rounded-full bg-brand-cyan hover:bg-brand-cyan-dark text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Thread list view
  return (
    <div>
      <h2 className="bebas text-2xl">Messages</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Retrouve tes conversations avec l'administration et le support.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Chargement...</p>
      ) : error ? (
        <p className="mt-5 text-sm text-red-600">{error}</p>
      ) : threads.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-border bg-white p-5">
          <p className="text-sm text-muted-foreground">Tu n'as pas encore de conversation. Utilise la page Contact pour écrire à l'administrateur ou superadmin.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {threads.map((thread) => {
            const isAdmin = thread.interlocuteur_nom?.toLowerCase().includes('admin') || thread.interlocuteur_prenom?.toLowerCase().includes('admin') || thread.interlocuteur_nom?.toLowerCase().includes('super')
            return (
              <button
                key={thread.interlocuteur_id}
                onClick={() => setActiveThread(thread.interlocuteur_id)}
                className="w-full text-left rounded-2xl border border-border p-4 bg-white shadow-sm hover:shadow-md hover:border-brand-cyan/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {(thread.interlocuteur_prenom?.[0] || thread.interlocuteur_nom?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">
                        {thread.interlocuteur_prenom} {thread.interlocuteur_nom}
                      </span>
                      {isAdmin && (
                        <span className="text-[10px] bg-brand-green text-white px-1.5 py-0.5 rounded-full font-semibold">Admin</span>
                      )}
                      {thread.non_lus > 0 && (
                        <span className="text-[10px] bg-brand-cyan text-white px-1.5 py-0.5 rounded-full font-semibold">
                          {thread.non_lus} non lu{thread.non_lus > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {thread.total_messages} message{thread.total_messages > 1 ? 's' : ''} · Dernière activité le {new Date(thread.dernier_message).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TabSecu() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    if (!form.current || !form.next || form.next !== form.confirm) {
      setMessage('Vérifie le mot de passe actuel et la confirmation.')
      return
    }
    setSaving(true)
    setMessage('')
    try {
      await api.changePassword({ mot_de_passe_actuel: form.current, nouveau_mot_de_passe: form.next })
      setMessage('Mot de passe mis à jour avec succès.')
      setForm({ current: '', next: '', confirm: '' })
    } catch {
      setMessage('Impossible de changer le mot de passe.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Sécurité</h2>
      <div className="mt-5 grid md:grid-cols-2 gap-4 max-w-lg">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Mot de passe actuel</label>
          <input type="password" value={form.current} onChange={(e) => setForm((prev) => ({ ...prev, current: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Nouveau mot de passe</label>
          <input type="password" value={form.next} onChange={(e) => setForm((prev) => ({ ...prev, next: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirmer</label>
          <input type="password" value={form.confirm} onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))} className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white" />
        </div>
      </div>
      {message ? <p className="mt-4 text-sm text-brand-cyan-dark">{message}</p> : null}
      <Button className="mt-6 bg-brand-cyan text-white hover:bg-brand-cyan-dark" onClick={handleSave} disabled={saving}>
        {saving ? 'Mise à jour…' : 'Mettre à jour'}
      </Button>
    </div>
  )
}

export default function Compte() {
  const [tab, setTab] = useState('profil')
  const { user, loading, logout, updateProfile, isAdmin } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.prenom?.[0] || user?.name?.[0] || 'U').toUpperCase()
  const fullName = `${user?.prenom || ''} ${user?.nom || ''}`.trim() || user?.name || 'Utilisateur'
  const roleLabel = user?.poste === 'proprietaire' ? 'Propriétaire' : user?.poste === 'colocataire' ? 'Locataire' : user?.poste || 'Membre'
  const profileMeta = [user?.profession].filter(Boolean).join(' • ')

  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
            <div>
              <h1 className="bebas text-3xl">{loading ? 'Chargement...' : fullName}</h1>
              <div className="text-sm text-muted-foreground">
                {user ? `${user.email} · ${roleLabel}` : 'Connecte-toi pour voir ton profil'}
                {profileMeta ? <div className="mt-1">{profileMeta}</div> : null}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user && isAdmin ? (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Aller au back office
              </Button>
            ) : null}
            {user ? (
              <Button variant="outline" onClick={() => { logout(); navigate('/auth?mode=signin') }}>
                Se déconnecter
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-[220px_1fr] gap-6">
          <aside className="space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  tab === t.id ? 'bg-brand-cyan-light text-brand-cyan-dark' : 'hover:bg-muted text-foreground/70'
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </aside>

          <div className="bg-card border border-border rounded-2xl p-6">
            {tab === 'profil' && <TabProfil user={user} onSave={updateProfile} />}
            {tab === 'dossier' && <TabMesAnnonces />}
            {tab === 'notif' && <TabNotif />}
            {tab === 'paiements' && <TabMessages />}
            {tab === 'secu' && <TabSecu />}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
