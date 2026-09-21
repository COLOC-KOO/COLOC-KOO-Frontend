import React, { useEffect, useMemo, useState } from 'react'
import { Ban, CheckCircle, Loader2, RefreshCw, Search, Shield, X } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, BackofficeMember } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useDialog } from '../../components/ui/Dialog'

const filters = [
  { label: 'Tous', value: 'all' },
  { label: 'Locataires', value: 'colocataires' },
  { label: 'Proprietaires', value: 'proprietaires' },
  { label: 'Agences', value: 'agences' },
  { label: 'Admins', value: 'admins' },
]

const roleLabels: Record<string, string> = {
  superadmin: 'Superadmin',
  admin: 'Admin',
  moderateur: 'Moderateur',
  proprietaire: 'Proprietaire',
  colocataire: 'Colocataire',
  agent: 'Agence / Pro',
}

const STATUT_ACTIF = 'active'
const STATUT_SUSPENDU = 'suspended'

export default function AdminUtilisateurs() {
  const { user } = useAuth()
  const dialog = useDialog()
  const [active, setActive] = useState('all')
  const [search, setSearch] = useState('')
  // Terme réellement envoyé au serveur (saisie temporisée de 350 ms)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<BackofficeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Identifiant de la ligne dont l'action est en cours (bouton en attente)
  const [pendingId, setPendingId] = useState<string | number | null>(null)

  const loadUsers = () => {
    setLoading(true)
    setError('')
    api
      .backofficeMembers({ role: active, q: searchQuery || undefined })
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setLoading(false))
  }

  useEffect(loadUsers, [active, searchQuery])

  // La recherche interroge le serveur (et plus seulement la page courante),
  // sans lancer une requête à chaque frappe.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((u) => `${u.name} ${u.email} ${u.telephone || ''}`.toLowerCase().includes(term))
  }, [search, users])

  const isSelf = (member: BackofficeMember) => Number(member.id) === Number(user?.id)

  async function applyStatus(member: BackofficeMember, statut: string) {
    if (isSelf(member)) {
      void dialog.alert({
        tone: 'warning',
        title: 'Action impossible',
        message: 'Vous ne pouvez pas modifier le statut de votre propre compte.',
      })
      return
    }

    if (statut === STATUT_SUSPENDU) {
      const confirmed = await dialog.confirm({
        tone: 'danger',
        title: 'Suspendre ce compte ?',
        message: `${member.name || member.email} ne pourra plus publier ni contacter d'autres membres tant que le compte reste suspendu.`,
        confirmLabel: 'Suspendre',
      })
      if (!confirmed) return
    }

    setPendingId(member.id)
    setError('')
    try {
      await api.updateMemberStatus(member.id, { statut })
      setUsers((current) => current.map((item) => (item.id === member.id ? { ...item, statut } : item)))
      dialog.toast(
        statut === STATUT_SUSPENDU
          ? `Compte de ${member.name || member.email} suspendu`
          : `Compte de ${member.name || member.email} réactivé`,
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Mise à jour impossible'
      setError(message)
      void dialog.alert({ tone: 'danger', title: 'Mise à jour impossible', message })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="bebas text-3xl text-white">Utilisateurs</h1>
            <p className="text-white/50 text-sm">{users.length} utilisateurs charges depuis le back-office</p>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>}

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setSearchQuery(search.trim())
                    loadUsers()
                  }
                }}
                placeholder="Rechercher un utilisateur..."
                className="flex-1 bg-transparent outline-none text-sm text-white"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label="Effacer la recherche"
                  className="text-white/40 hover:text-white/80 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-1 ml-auto overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setActive(f.value)}
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap ${
                    active === f.value ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">Utilisateur</th>
                  <th className="text-left font-medium">Role</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-left font-medium">Annonces</th>
                  <th className="text-left font-medium">Signalements</th>
                  <th className="text-left font-medium">Inscription</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const suspended = u.statut === STATUT_SUSPENDU || u.statut === 'banned'
                  const pending = pendingId === u.id
                  const self = isSelf(u)
                  return (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold">
                            {u.initials || u.name[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {u.name || `${u.prenom} ${u.nom}`}
                              {self && <span className="ml-2 text-[10px] font-semibold text-brand-cyan">(vous)</span>}
                            </div>
                            <div className="text-xs text-white/50">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-white/70">{roleLabels[u.poste] || u.poste}</td>
                      <td>
                        <StatusBadge statut={u.statut} verified={u.verification} />
                      </td>
                      <td className="text-white/60">{u.annoncesCount}</td>
                      <td className="text-white/60">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm">
                          <Shield className="w-3.5 h-3.5 text-brand-magenta" />
                          {u.signalementsCount ?? 0}
                        </span>
                      </td>
                      <td className="text-white/60">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          {pending ? (
                            <span className="p-1.5 text-white/60">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => applyStatus(u, STATUT_ACTIF)}
                                disabled={self || !suspended}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-green disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                title={
                                  self
                                    ? 'Vous ne pouvez pas modifier votre propre compte'
                                    : suspended
                                      ? 'Réactiver ce compte'
                                      : 'Compte déjà actif'
                                }
                                aria-label="Réactiver ce compte"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => applyStatus(u, STATUT_SUSPENDU)}
                                disabled={self || suspended}
                                className="p-1.5 hover:bg-white/10 rounded text-brand-magenta disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                title={
                                  self
                                    ? 'Vous ne pouvez pas modifier votre propre compte'
                                    : suspended
                                      ? 'Compte déjà suspendu'
                                      : 'Suspendre ce compte'
                                }
                                aria-label="Suspendre ce compte"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/40">Aucun utilisateur trouve</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-white/40">Chargement...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

// Le statut du compte et la vérification d'identité sont deux informations
// distinctes : afficher « Vérifié » à la place du statut masquait les
// suspensions (le badge ne changeait pas après l'action).
function StatusBadge({ statut, verified }: { statut?: string; verified?: boolean }) {
  const badge =
    statut === STATUT_SUSPENDU || statut === 'banned' ? (
      <span className="text-[10px] font-bold text-brand-magenta px-2 py-1 rounded-full border border-brand-magenta/30 bg-brand-magenta/10">
        {statut === 'banned' ? 'Banni' : 'Suspendu'}
      </span>
    ) : statut === 'inactive' ? (
      <span className="text-[10px] font-bold text-white/60 px-2 py-1 rounded-full border border-white/20 bg-white/5">Inactif</span>
    ) : statut === 'pending' ? (
      <span className="text-[10px] font-bold text-brand-olive px-2 py-1 rounded-full border border-brand-olive/30 bg-brand-olive/10">En attente</span>
    ) : (
      <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">Actif</span>
    )

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badge}
      {verified && (
        <span
          className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan px-2 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10"
          title="Identité vérifiée"
        >
          <Shield className="w-3 h-3" /> Verifie
        </span>
      )}
    </div>
  )
}
