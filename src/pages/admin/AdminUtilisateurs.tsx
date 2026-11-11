import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Ban, CheckCircle, Loader2, RefreshCw, Search, Shield, X, XCircle } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, BackofficeMember, BackofficeMemberDetails } from '../../lib/api'
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
  const [statusFilter, setStatusFilter] = useState('all')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [search, setSearch] = useState('')
  // Terme réellement envoyé au serveur (saisie temporisée de 350 ms)
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<BackofficeMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Identifiant de la ligne dont l'action est en cours (bouton en attente)
  const [pendingId, setPendingId] = useState<string | number | null>(null)

  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [details, setDetails] = useState<BackofficeMemberDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  function openFiche(id: string | number) {
    setSelectedId(String(id))
    setDetails(null)
    setDetailsError('')
    setDetailsLoading(true)
    api
      .backofficeMemberDetails(id)
      .then(setDetails)
      .catch((err) => setDetailsError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setDetailsLoading(false))
  }

  function closeFiche() {
    setSelectedId(null)
    setDetails(null)
    searchParams.delete('userId')
    setSearchParams(searchParams, { replace: true })
  }

  // Liens profonds depuis le tableau de bord, les annonces et le journal
  useEffect(() => {
    const userId = searchParams.get('userId')
    if (userId) openFiche(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadUsers = () => {
    setLoading(true)
    setError('')
    api
      .backofficeMembers({
        role: active,
        q: searchQuery || undefined,
        statut: statusFilter === 'active' || statusFilter === 'suspended' ? statusFilter : undefined,
        verification: statusFilter === 'a_verifier' ? 'a_verifier' : undefined,
      })
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setLoading(false))
  }

  useEffect(loadUsers, [active, searchQuery, statusFilter])

  // La recherche interroge le serveur (et plus seulement la page courante),
  // sans lancer une requête à chaque frappe.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(search.trim()), 350)
    return () => window.clearTimeout(timer)
  }, [search])

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return users.filter((u) => {
      const matchesSearch = !term || `${u.name} ${u.email} ${u.telephone || ''}`.toLowerCase().includes(term)
      const verificationStatus = u.verificationStatus || (u.verification ? 'conforme' : 'a_verifier')
      const matchesVerification = verificationFilter === 'all' || verificationStatus === verificationFilter
      return matchesSearch && matchesVerification
    })
  }, [search, users, verificationFilter])

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
      const response = await dialog.prompt({
        tone: 'danger',
        title: 'Motif de suspension',
        message: `${member.name || member.email} ne pourra plus publier ni contacter d'autres membres tant que le compte reste suspendu.`,
        label: 'Motif obligatoire',
        placeholder: 'Expliquez la raison de la suspension',
        required: true,
        multiline: true,
        confirmLabel: 'Suspendre',
      })
      if (response === null) return
      const raison = response.trim()
      if (!raison) return
      await submitStatus(member, statut, raison)
      return
    }

    await submitStatus(member, statut)
  }

  async function submitStatus(member: BackofficeMember, statut: string, raison?: string) {
    setPendingId(member.id)
    setError('')
    try {
      await api.updateMemberStatus(member.id, { statut, raison })
      setUsers((current) => current.map((item) => (item.id === member.id
        ? {
            ...item,
            statut,
            suspensionDate: statut === STATUT_SUSPENDU ? new Date().toISOString() : null,
            suspensionReason: statut === STATUT_SUSPENDU ? raison || null : null,
            suspensionActor: statut === STATUT_SUSPENDU ? user?.name || null : null,
          }
        : item)))
      if (selectedId === String(member.id)) openFiche(member.id)
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

  async function applyVerification(member: BackofficeMember, statut: 'conforme' | 'non_conforme') {
    let raison: string | undefined
    if (statut === 'non_conforme') {
      const response = await dialog.prompt({
        tone: 'warning',
        title: 'Motif du refus',
        message: `Indiquez le motif de refus pour le profil de ${member.name || member.email}.`,
        label: 'Motif',
        placeholder: 'Ex. document illisible ou information incohérente',
        required: true,
        multiline: true,
        confirmLabel: 'Refuser le profil',
      })
      if (response === null) return
      raison = response.trim()
    }

    setPendingId(member.id)
    setError('')
    try {
      const result = await api.updateMemberVerification(member.id, { statut, raison })
      setUsers((current) => current.map((item) => item.id === member.id
        ? {
            ...item,
            verification: statut === 'conforme',
            verificationStatus: statut,
            verificationReason: statut === 'non_conforme' ? raison || null : null,
          }
        : item))
      if (selectedId === String(member.id)) openFiche(member.id)
      dialog.toast(result.changed ? 'Vérification du profil mise à jour' : 'Le statut était déjà à jour')
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
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs min-w-0">
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
                  className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap shrink-0 ${
                    active === f.value ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
              <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-white/40">Statut du compte :</span>
                {[
                  { label: 'Tous', value: 'all' },
                  { label: 'Actif', value: 'active' },
                  { label: 'Suspendu', value: 'suspended' },
                  { label: 'À vérifier', value: 'a_verifier' },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`px-2.5 py-1 text-xs rounded-lg ${
                      statusFilter === filter.value ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40">Vérification des profils :</span>
            {[
              { label: 'Tous', value: 'all' },
              { label: 'À vérifier', value: 'a_verifier' },
              { label: 'Vérifiés', value: 'conforme' },
              { label: 'Refusés', value: 'non_conforme' },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setVerificationFilter(filter.value)}
                className={`px-2.5 py-1 text-xs rounded-lg ${
                  verificationFilter === filter.value ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x" role="region" aria-label="Tableau des utilisateurs" tabIndex={0}>
            <table className="w-full min-w-[900px] text-sm break-words">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">Utilisateur</th>
                  <th className="text-left font-medium">Role</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-left font-medium">Vérification</th>
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
                    <tr
                      key={u.id}
                      onClick={() => openFiche(u.id)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
                    >
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
                        <div className="flex flex-col items-start gap-1">
                          <StatusBadge statut={u.statut} />
                          {suspended && (u.suspensionReason || u.suspensionDate || u.suspensionActor) && (
                            <span
                              className="max-w-52 text-[10px] text-white/45"
                              title={[u.suspensionReason, u.suspensionActor, u.suspensionDate ? new Date(u.suspensionDate).toLocaleString('fr-FR') : ''].filter(Boolean).join(' · ')}
                            >
                              {u.suspensionReason || 'Motif non renseigné'}
                              {u.suspensionDate && ` · ${new Date(u.suspensionDate).toLocaleDateString('fr-FR')}`}
                              {u.suspensionActor && ` · ${u.suspensionActor}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <VerificationBadge
                          status={u.verificationStatus || (u.verification ? 'conforme' : 'a_verifier')}
                          reason={u.verificationReason}
                        />
                      </td>
                      <td className="text-white/60">{u.annoncesCount}</td>
                      <td className="text-white/60">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-sm ${
                          Number(u.signalementsCount) > 0
                            ? 'border-red-500/40 bg-red-500/10 text-red-400'
                            : 'border-white/10 bg-white/5 text-white/60'
                        }`}>
                          <Shield className="w-3.5 h-3.5" />
                          {u.signalementsCount ?? 0}
                        </span>
                      </td>
                      <td className="text-white/60">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '-'}</td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}>
                          {pending ? (
                            <span className="p-1.5 text-white/60">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </span>
                          ) : (
                            <>
                              {(u.verificationStatus || (u.verification ? 'conforme' : 'a_verifier')) === 'a_verifier' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => applyVerification(u, 'conforme')}
                                    className="p-1.5 hover:bg-white/10 rounded text-brand-green"
                                    title="Valider ce profil"
                                    aria-label="Valider ce profil"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => applyVerification(u, 'non_conforme')}
                                    className="p-1.5 hover:bg-white/10 rounded text-brand-magenta"
                                    title="Refuser ce profil avec un motif"
                                    aria-label="Refuser ce profil"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
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
                    <td colSpan={8} className="text-center py-8 text-white/40">Aucun utilisateur trouvé</td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-white/40">Chargement...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="px-4 pt-2 text-xs text-white/40 lg:hidden">Faites défiler horizontalement pour afficher toutes les colonnes et les actions.</p>
        </div>

        {selectedId && (
          <MemberDetailPanel details={details} loading={detailsLoading} error={detailsError} onClose={closeFiche} />
        )}
      </div>
    </AdminLayout>
  )
}

// Le statut du compte et la vérification d'identité sont deux informations
// distinctes : afficher « Vérifié » à la place du statut masquait les
// suspensions (le badge ne changeait pas après l'action).
function StatusBadge({ statut }: { statut?: string }) {
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

  return badge
}

function VerificationBadge({ status, reason }: { status: string; reason?: string | null }) {
  const config = {
    a_verifier: { label: 'À vérifier', className: 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10' },
    conforme: { label: 'Vérifié', className: 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10' },
    non_conforme: { label: 'Refusé', className: 'text-brand-magenta border-brand-magenta/30 bg-brand-magenta/10' },
  }[status] || { label: status, className: 'text-white/60 border-white/20 bg-white/5' }

  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border ${config.className}`}>
        <Shield className="w-3 h-3" /> {config.label}
      </span>
      {status === 'non_conforme' && reason && <span className="max-w-40 text-[10px] text-white/50">{reason}</span>}
    </div>
  )
}

function fmtDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString('fr-FR') : '-'
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-white/40">{label}</span>
      <span className="text-white/80 text-right">{value || '-'}</span>
    </div>
  )
}

function DetailSection({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-xs uppercase tracking-wide text-white/40 mb-2">
        {title} <span className="text-white/30">({count})</span>
      </h3>
      {count === 0 ? <p className="text-sm text-white/30">Aucun élément.</p> : <ul className="space-y-2">{children}</ul>}
    </section>
  )
}

function MemberDetailPanel({ details, loading, error, onClose }: {
  details: BackofficeMemberDetails | null
  loading: boolean
  error: string
  onClose: () => void
}) {
  const navigate = useNavigate()
  const member = details?.member

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" aria-label="Fermer la fiche" onClick={onClose} className="flex-1 bg-black/60" />
      <aside className="w-full max-w-lg h-full overflow-y-auto bg-[oklch(0.18_0.008_260)] border-l border-white/10 p-5">
        {loading && (
          <div className="flex items-center gap-2 text-white/50 text-sm py-8">
            <Loader2 className="w-4 h-4 animate-spin" /> Chargement de la fiche...
          </div>
        )}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>
        )}
        {!loading && !error && member && (
          <div className="space-y-6">
            <header className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-sm font-bold shrink-0">
                  {member.initials || member.name?.[0] || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white leading-tight">
                    {member.name || `${member.prenom} ${member.nom}`}
                  </h2>
                  <p className="text-xs text-white/50">{member.email}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-[10px] text-white/60 border border-white/15 rounded-full px-2 py-0.5">
                      {roleLabels[member.poste] || member.poste}
                    </span>
                    <StatusBadge statut={member.statut} />
                    <VerificationBadge
                      status={member.verificationStatus || (member.verification ? 'conforme' : 'a_verifier')}
                      reason={member.verificationReason}
                    />
                  </div>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/10 rounded text-white/60" aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </header>

            {member.statut === STATUT_SUSPENDU && (member.suspensionReason || member.suspensionDate) && (
              <div className="bg-brand-magenta/10 border border-brand-magenta/30 rounded-lg p-3 text-xs text-brand-magenta space-y-1">
                <p className="font-semibold">Compte suspendu</p>
                <p>Motif : {member.suspensionReason || 'non renseigné'}</p>
                <p>
                  Le {fmtDate(member.suspensionDate)}
                  {member.suspensionActor ? ` par ${member.suspensionActor}` : ''}
                </p>
              </div>
            )}

            <section className="space-y-2 bg-white/5 border border-white/10 rounded-lg p-4">
              <InfoRow label="Téléphone" value={member.telephone} />
              <InfoRow label="Inscription" value={fmtDate(member.date_inscription || member.createdAt)} />
              <InfoRow label="Annonces" value={details.annonces.length} />
              <InfoRow label="Candidatures" value={details.candidatures.length} />
            </section>

            <DetailSection title="Annonces" count={details.annonces.length}>
              {details.annonces.map((a) => (
                <li key={a.id_annonce} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                  <button
                    type="button"
                    className="text-brand-cyan hover:underline text-left"
                    onClick={() => navigate(`/admin/annonces?annonceId=${a.id_annonce}`)}
                  >
                    {a.titre}
                  </button>
                  <div className="text-xs text-white/40 mt-1">
                    {a.statut}
                    {a.nom_ville ? ` · ${a.nom_ville}` : ''}
                    {` · ${fmtDate(a.date_publication || a.date_creation)}`}
                  </div>
                </li>
              ))}
            </DetailSection>

            <DetailSection title="Candidatures" count={details.candidatures.length}>
              {details.candidatures.map((c) => (
                <li key={c.id_candidature} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                  <div className="text-white/80">{c.titre || `Annonce #${c.id_annonce}`}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {c.statut} · {fmtDate(c.date_creation)}
                  </div>
                </li>
              ))}
            </DetailSection>

            <DetailSection title="Équipes" count={details.equipes.length}>
              {details.equipes.map((e) => (
                <li key={e.id_equipe} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                  <div className="text-white/80">{e.nom}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {e.annonce_titre ? `Équipe constituée sur « ${e.annonce_titre} »` : 'Équipe sans annonce liée'}
                    {` · ${e.statut} · ${fmtDate(e.date_creation)}`}
                  </div>
                </li>
              ))}
            </DetailSection>

            <DetailSection title="Historique" count={details.historique.length}>
              {details.historique.map((h) => (
                <li key={h.id_action} className="flex items-start justify-between gap-3 text-sm border-b border-white/5 pb-2">
                  <div>
                    <div className="text-white/80">{h.action}</div>
                    <div className="text-xs text-white/40">
                      {[h.acteur_prenom, h.acteur_nom].filter(Boolean).join(' ') || 'Système'}
                      {h.cible_type ? ` · ${h.cible_type}${h.cible_id ? ` #${h.cible_id}` : ''}` : ''}
                    </div>
                  </div>
                  <span className="text-xs text-white/40 whitespace-nowrap">{fmtDate(h.date_action)}</span>
                </li>
              ))}
            </DetailSection>

            <DetailSection title="Signalements" count={details.signalements.length}>
              {details.signalements.map((s) => (
                <li key={s.id_signalement} className="bg-white/5 border border-white/10 rounded-lg p-3 text-sm">
                  <div className="text-white/80">{s.raison}</div>
                  <div className="text-xs text-white/40 mt-1">
                    {[
                      [s.signaleur_prenom, s.signaleur_nom].filter(Boolean).join(' ') ? `Par ${[s.signaleur_prenom, s.signaleur_nom].filter(Boolean).join(' ')}` : null,
                      s.annonce_titre ? `« ${s.annonce_titre} »` : null,
                      `${s.statut} · ${fmtDate(s.date_signalement)}`,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </li>
              ))}
            </DetailSection>
          </div>
        )}
      </aside>
    </div>
  )
}
