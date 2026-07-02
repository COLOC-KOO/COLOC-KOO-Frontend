import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Check, CreditCard, FileText, Lock, Upload, User } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { Button } from '../components/ui/Button'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

const tabs = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'dossier', label: 'Dossier locatif', icon: FileText },
  { id: 'notif', label: 'Notifications', icon: Bell },
  { id: 'paiements', label: 'Paiements', icon: CreditCard },
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

function TabDossier() {
  const initialDocs = [
    { name: "Pièce d'identité", status: 'ok' as const, fileName: '' },
    { name: 'Justificatif de revenus', status: 'ok' as const, fileName: '' },
    { name: 'Attestation employeur', status: 'pending' as const, fileName: '' },
    { name: 'Garant (facultatif)', status: 'missing' as const, fileName: '' }
  ]
  const [docs, setDocs] = useState(() => {
    const saved = localStorage.getItem('colockoo_docs')
    return saved ? JSON.parse(saved) : initialDocs
  })

  useEffect(() => {
    localStorage.setItem('colockoo_docs', JSON.stringify(docs))
  }, [docs])

  const handleFile = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setDocs((prev: Array<{ name: string; status: 'ok' | 'pending' | 'missing' | 'uploaded'; fileName: string }>) =>
      prev.map((item: { name: string; status: 'ok' | 'pending' | 'missing' | 'uploaded'; fileName: string }, itemIndex: number) =>
        itemIndex === index ? { ...item, status: 'uploaded' as const, fileName: file.name } : item
      )
    )
  }

  return (
    <div>
      <h2 className="bebas text-2xl">Dossier locatif</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Ces documents sont partagés avec les propriétaires quand tu postules.
      </p>
      <div className="mt-5 space-y-2">
        {docs.map((d: { name: string; status: 'ok' | 'pending' | 'missing' | 'uploaded'; fileName: string }, index: number) => (
          <div key={d.name} className="flex flex-col gap-3 p-4 border border-border rounded-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{d.name}</div>
                {d.fileName ? <div className="text-xs text-muted-foreground">{d.fileName}</div> : null}
              </div>
            </div>
            {d.status === 'ok' && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-green-dark font-semibold">
                <Check className="w-3 h-3" /> Validé
              </span>
            )}
            {d.status === 'pending' && (
              <span className="text-xs text-amber-700 font-semibold">En vérification</span>
            )}
            {d.status === 'uploaded' && (
              <span className="text-xs text-brand-cyan-dark font-semibold">Pièce reçue</span>
            )}
            {d.status === 'missing' && (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                <Upload className="w-3.5 h-3.5" /> Ajouter
                <input type="file" className="hidden" onChange={(event) => handleFile(index, event)} />
              </label>
            )}
          </div>
        ))}
      </div>
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

function TabPaiements() {
  return (
    <div>
      <h2 className="bebas text-2xl">Paiements</h2>
      <p className="text-sm text-muted-foreground mt-1">Historique de tes paiements de loyer et cautions.</p>
      <div className="mt-5 space-y-2">
        {[
          { label: 'Loyer Juillet 2026', amount: '450 000 Ar', status: 'Payé' },
          { label: 'Caution — Isoraka', amount: '900 000 Ar', status: 'Payé' }
        ].map((p) => (
          <div key={p.label} className="flex items-center justify-between p-4 border border-border rounded-xl">
            <div className="text-sm font-medium">{p.label}</div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{p.amount}</span>
              <span className="text-xs font-bold text-brand-green-dark bg-brand-green-light px-2 py-1 rounded-full">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
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
            {tab === 'dossier' && <TabDossier />}
            {tab === 'notif' && <TabNotif />}
            {tab === 'paiements' && <TabPaiements />}
            {tab === 'secu' && <TabSecu />}
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
