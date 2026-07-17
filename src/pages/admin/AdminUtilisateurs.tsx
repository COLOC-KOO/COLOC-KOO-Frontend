import React, { useEffect, useMemo, useState } from 'react'
import { Ban, CheckCircle, RefreshCw, Search, Shield } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, BackofficeMember } from '../../lib/api'

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
}

export default function AdminUtilisateurs() {
  const [active, setActive] = useState('all')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<BackofficeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadUsers = () => {
    setLoading(true)
    setError('')
    api
      .backofficeMembers({ role: active, q: search || undefined })
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setLoading(false))
  }

  useEffect(loadUsers, [active])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter((u) => `${u.name} ${u.email} ${u.telephone || ''}`.toLowerCase().includes(term))
  }, [search, users])

  async function setStatus(user: BackofficeMember, statut: string) {
    await api.updateMemberStatus(user.id, { statut })
    setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, statut } : item)))
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="bebas text-3xl text-white">Utilisateurs</h1>
            <p className="text-white/50 text-sm">{users.length} utilisateurs charges depuis le back-office</p>
          </div>
          <button onClick={loadUsers} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
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
                  if (event.key === 'Enter') loadUsers()
                }}
                placeholder="Rechercher un utilisateur..."
                className="flex-1 bg-transparent outline-none text-sm text-white"
              />
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
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold">
                          {u.initials || u.name[0] || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-white">{u.name || `${u.prenom} ${u.nom}`}</div>
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
                        <button onClick={() => setStatus(u, 'active')} className="p-1.5 hover:bg-white/10 rounded text-brand-green" title="Activer">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button onClick={() => setStatus(u, 'suspended')} className="p-1.5 hover:bg-white/10 rounded text-brand-magenta" title="Suspendre">
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

function StatusBadge({ statut, verified }: { statut?: string; verified?: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan px-2 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10">
        <Shield className="w-3 h-3" /> Verifie
      </span>
    )
  }
  if (statut === 'suspended') {
    return <span className="text-[10px] font-bold text-brand-magenta px-2 py-1 rounded-full border border-brand-magenta/30 bg-brand-magenta/10">Suspendu</span>
  }
  if (statut === 'pending') {
    return <span className="text-[10px] font-bold text-brand-olive px-2 py-1 rounded-full border border-brand-olive/30 bg-brand-olive/10">En attente</span>
  }
  return <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">Actif</span>
}
