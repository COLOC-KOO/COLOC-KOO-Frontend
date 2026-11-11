import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  House,
  Minus,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { api, ApiAnnonce, ApiCandidature, ApiEquipe, BackofficeDashboard } from '../../lib/api'
import { formatAr } from '../../lib/utils'

function localDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function initialDateRange() {
  const today = new Date()
  return {
    start: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    end: localDateInput(today),
  }
}

function isWithinRange(value: string | null | undefined, start: string, end: string) {
  if (!value) return false
  const day = String(value).slice(0, 10)
  return day >= start && day <= end
}

function StatCard({
  icon: Icon,
  label,
  value,
  displayValue,
  previous,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  displayValue?: string
  previous: number
  color: 'cyan' | 'green' | 'olive' | 'magenta'
}) {
  const delta = value - previous
  const percent = previous === 0 ? null : Math.round((delta / previous) * 100)
  const IconTrend = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : Minus
  const trendColor = delta > 0 ? 'text-brand-green' : delta < 0 ? 'text-brand-magenta' : 'text-white/50'
  const comparison = percent === null
    ? value === 0 ? '0% vs période précédente' : 'Nouveau'
    : `${delta > 0 ? '+' : ''}${percent}% vs période précédente`
  const colorClasses: Record<string, string> = {
    cyan: 'text-brand-cyan bg-brand-cyan/10',
    green: 'text-brand-green bg-brand-green/10',
    olive: 'text-brand-olive bg-brand-olive/10',
    magenta: 'text-brand-magenta bg-brand-magenta/10',
  }

  return (
    <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs inline-flex items-center gap-0.5 ${trendColor}`} title="Comparaison avec la période précédente de même durée">
          <IconTrend className="w-3 h-3" /> {comparison}
        </span>
      </div>
      <div className="mt-4 text-2xl font-bold text-white truncate">{displayValue ?? value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  )
}

type CandidatureGroup = {
  key: string
  idAnnonce: number
  titre: string
  month: string
  candidatures: ApiCandidature[]
}

function candidatureStatusLabel(status: string) {
  const normalized = String(status || '').toLowerCase()
  if (['acceptee', 'accepted', 'validee', 'validated'].includes(normalized)) return 'Validée'
  if (['refusee', 'rejected', 'refused'].includes(normalized)) return 'Refusée'
  return 'Envoyée'
}

function isAwaitingOwner(status: string) {
  return !['acceptee', 'accepted', 'validee', 'validated', 'refusee', 'rejected', 'refused'].includes(String(status || '').toLowerCase())
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<BackofficeDashboard | null>(null)
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([])
  const [allCandidatures, setAllCandidatures] = useState<ApiCandidature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const dateRange = useMemo(initialDateRange, [])
  const [startDate, setStartDate] = useState(dateRange.start)
  const [endDate, setEndDate] = useState(dateRange.end)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [selectedCandidature, setSelectedCandidature] = useState<ApiCandidature | null>(null)
  const [selectedAnnonceCandidatures, setSelectedAnnonceCandidatures] = useState<number | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<ApiEquipe | null>(null)

  useEffect(() => {
    if (!startDate || !endDate) {
      setLoading(false)
      setError('Sélectionnez une date de début et une date de fin.')
      return
    }
    if (startDate > endDate) {
      setLoading(false)
      setError('La date de début doit précéder la date de fin.')
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')
    Promise.all([
      api.backofficeDashboard(startDate, endDate),
      api.annonces({ statut: 'all', startDate, endDate }),
      api.adminCandidatures(startDate, endDate),
      api.adminCandidatures(),
    ])
      .then(([dashboard, annoncesRows, candidaturesRows, allCandidatureRows]) => {
        if (cancelled) return
        setStats(dashboard)
        setAnnonces(annoncesRows)
        setCandidatures(candidaturesRows)
        setAllCandidatures(allCandidatureRows)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Chargement du dashboard impossible')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  const periodAnnonces = useMemo(
    () => annonces
      .filter((annonce) => isWithinRange(annonce.date_publication || annonce.date_creation, startDate, endDate))
      .sort((a, b) => String(b.date_publication || b.date_creation).localeCompare(String(a.date_publication || a.date_creation))),
    [annonces, endDate, startDate],
  )
  const periodCandidatures = useMemo(
    () => candidatures.filter((candidature) => isWithinRange(candidature.date_creation, startDate, endDate)),
    [candidatures, endDate, startDate],
  )
  const candidaturesByAnnonce = useMemo(() => {
    const groups = new Map<number, ApiCandidature[]>()
    for (const candidature of allCandidatures) {
      const current = groups.get(candidature.id_annonce) || []
      current.push(candidature)
      groups.set(candidature.id_annonce, current)
    }
    return groups
  }, [allCandidatures])

  useEffect(() => {
    if (!selectedCandidature?.equipe_id) {
      setSelectedTeam(null)
      return
    }
    let cancelled = false
    api.getEquipe(selectedCandidature.equipe_id)
      .then((team) => {
        if (!cancelled) setSelectedTeam(team)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Impossible de charger les membres de l’équipe')
      })
    return () => {
      cancelled = true
    }
  }, [selectedCandidature?.equipe_id])

  const groupedCandidatures = useMemo(() => {
    const groups = new Map<string, CandidatureGroup>()
    for (const candidature of periodCandidatures) {
      const monthKey = String(candidature.date_creation).slice(0, 7)
      const key = `${candidature.id_annonce}-${monthKey}`
      const group = groups.get(key)
      if (group) {
        group.candidatures.push(candidature)
      } else {
        const month = new Date(candidature.date_creation).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        groups.set(key, {
          key,
          idAnnonce: candidature.id_annonce,
          titre: candidature.titre || `Annonce #${candidature.id_annonce}`,
          month,
          candidatures: [candidature],
        })
      }
    }
    return Array.from(groups.values()).sort((a, b) => {
      const monthA = String(a.candidatures[0]?.date_creation || '').slice(0, 7)
      const monthB = String(b.candidatures[0]?.date_creation || '').slice(0, 7)
      return monthB.localeCompare(monthA) || a.idAnnonce - b.idAnnonce
    })
  }, [periodCandidatures])

  const topCities = Object.entries(
    periodAnnonces.reduce<Record<string, number>>((acc, annonce) => {
      const city = annonce.ville || 'Ville inconnue'
      acc[city] = (acc[city] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxCity = Math.max(...topCities.map(([, count]) => count), 1)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="bebas text-3xl text-white">Dashboard</h1>
            <p className="text-white/50 text-sm">Vue d’ensemble pour la période sélectionnée</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs text-white/60">
              Du
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                className="ml-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
              />
            </label>
            <label className="text-xs text-white/60">
              Au
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                className="ml-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white"
              />
            </label>
          </div>
        </div>

        {stats && (
          <p className="text-xs text-white/40">
            Comparaison avec la période précédente : {new Date(`${stats.previousStartDate}T00:00:00`).toLocaleDateString('fr-FR')} – {new Date(`${stats.previousEndDate}T00:00:00`).toLocaleDateString('fr-FR')}
          </p>
        )}
        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>}
        {loading && <div className="text-white/50 text-sm">Chargement des données...</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={House}
            label="Annonces publiées"
            value={stats?.annoncesMois || 0}
            previous={stats?.comparaison.annoncesPrecedentes || 0}
            color="cyan"
          />
          <StatCard
            icon={FileText}
            label="Candidatures"
            value={stats?.candidaturesMois || 0}
            previous={stats?.comparaison.candidaturesPrecedentes || 0}
            color="green"
          />
          <StatCard
            icon={Users}
            label="Nouveaux utilisateurs actifs"
            value={stats?.membresActifs || 0}
            previous={stats?.comparaison.membresPrecedents || 0}
            color="olive"
          />
          <StatCard
            icon={Wallet}
            label="Revenus (Ar)"
            value={stats?.chiffreAffairesMois || 0}
            displayValue={formatAr(stats?.chiffreAffairesMois || 0)}
            previous={stats?.comparaison.revenusPrecedents || 0}
            color="magenta"
          />
        </div>

        {Boolean(stats?.signalements) && (
          <button
            type="button"
            onClick={() => navigate('/admin/signalements-conversations')}
            className="flex w-full items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/20"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {`${stats?.signalements} signalement${(stats?.signalements ?? 0) > 1 ? 's' : ''} ouvert${(stats?.signalements ?? 0) > 1 ? 's' : ''} à traiter`}
          </button>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <h2 className="bebas text-xl text-white mb-4">Candidatures récentes par annonce et par mois</h2>
            <div className="space-y-2 max-h-[34rem] overflow-y-auto">
              {groupedCandidatures.map((group) => (
                <section key={group.key} className="rounded-lg border border-white/5">
                  <button
                    type="button"
                    onClick={() => setExpandedGroup(expandedGroup === group.key ? null : group.key)}
                    aria-expanded={expandedGroup === group.key}
                    className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-white/5 rounded-lg"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{group.titre}</span>
                      <span className="block text-xs text-white/50 capitalize">{group.month}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-brand-cyan/10 text-brand-cyan px-2 py-1 text-xs">
                      {group.candidatures.length} candidature{group.candidatures.length > 1 ? 's' : ''}
                    </span>
                  </button>
                  {expandedGroup === group.key && (
                    <div className="px-3 pb-3 space-y-1">
                      {group.candidatures.map((candidature) => {
                        const status = candidatureStatusLabel(candidature.statut)
                        const statusClass = status === 'Validée'
                          ? 'text-brand-green border-brand-green/30 bg-brand-green/10'
                          : status === 'Refusée'
                            ? 'text-brand-magenta border-brand-magenta/30 bg-brand-magenta/10'
                            : 'text-brand-yellow border-brand-yellow/30 bg-brand-yellow/10'
                        const name = [candidature.prenom, candidature.nom].filter(Boolean).join(' ') || `Utilisateur #${candidature.id_utilisateur}`
                        return (
                          <button
                            key={candidature.id_candidature}
                            type="button"
                            onClick={() => setSelectedCandidature(candidature)}
                            className="w-full flex items-center justify-between gap-3 rounded-md bg-white/5 p-2 text-left hover:bg-white/10"
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              {candidature.profile_picture ? (
                                <img src={candidature.profile_picture} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
                              ) : (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 text-xs font-semibold text-brand-cyan">
                                  {(candidature.prenom || candidature.nom || 'U')[0]}
                                </span>
                              )}
                              <span className="min-w-0">
                                <span className="block text-sm truncate">{name}</span>
                                {candidature.equipe_nom && <span className="block text-xs text-brand-cyan/80 truncate">{candidature.equipe_nom}</span>}
                              <span className="block text-xs text-white/40">
                                {new Date(candidature.date_creation).toLocaleDateString('fr-FR')} · #{candidature.id_candidature}
                              </span>
                              </span>
                            </span>
                            <span className={`inline-flex shrink-0 text-[10px] font-bold px-2 py-1 rounded-full border ${statusClass}`}>
                              {status}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </section>
              ))}
              {!loading && groupedCandidatures.length === 0 && (
                <div className="text-sm text-white/40">Aucune candidature sur cette période.</div>
              )}
            </div>
          </div>

          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <h2 className="bebas text-xl text-white mb-4">Top villes</h2>
            <div className="space-y-3">
              {topCities.map(([city, count]) => (
                <div key={city}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{city}</span>
                    <span className="text-white/50">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-green" style={{ width: `${Math.round((count / maxCity) * 100)}%` }} />
                  </div>
                </div>
              ))}
              {!loading && topCities.length === 0 && <div className="text-sm text-white/40">Aucune ville à afficher.</div>}
            </div>
          </div>
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="bebas text-xl text-white">Dernières annonces publiées</h2>
          </div>
          <div className="w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain touch-pan-x" role="region" aria-label="Dernières annonces publiées" tabIndex={0}>
            <table className="w-full min-w-[860px] text-sm break-words">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left py-2 font-medium">Titre</th>
                  <th className="text-left font-medium">Ville</th>
                  <th className="text-left font-medium">Propriétaire</th>
                  <th className="text-left font-medium">Date de publication</th>
                  <th className="text-left font-medium">Candidatures</th>
                  <th className="text-left font-medium">Vues</th>
                  <th className="text-left font-medium">Prix</th>
                  <th className="text-left font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {periodAnnonces.slice(0, 10).map((annonce) => (
                  <tr key={annonce.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/annonces?annonceId=${annonce.id}`)}
                        className="text-left text-brand-cyan hover:underline"
                      >
                        {annonce.titre}
                      </button>
                    </td>
                    <td className="text-white/60">{annonce.ville}</td>
                    <td className="text-white/60">{annonce.auteur || '-'}</td>
                    <td className="text-white/60">
                      {annonce.date_publication
                        ? new Date(annonce.date_publication).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="text-white/60">
                      {(() => {
                        const candidates = candidaturesByAnnonce.get(annonce.id) || []
                        const waiting = candidates.filter((candidate) => isAwaitingOwner(candidate.statut)).length
                        return (
                          <button
                            type="button"
                            onClick={() => setSelectedAnnonceCandidatures(annonce.id)}
                            className="text-left text-brand-cyan hover:underline"
                          >
                            {candidates.length} ({waiting} en attente)
                          </button>
                        )
                      })()}
                    </td>
                    <td className="text-xs text-white/40" title="Le nombre de consultations de chaque annonce n’est pas encore mesuré.">
                      Non suivi
                    </td>
                    <td className="text-white/60">{formatAr(Number(annonce.chambre?.prix_loyer || 0))}</td>
                    <td>
                      <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">
                        {annonce.statut}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && periodAnnonces.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-white/40">Aucune annonce sur cette période.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="pt-2 text-xs text-white/40 lg:hidden">Faites défiler horizontalement pour afficher toutes les colonnes.</p>
        </div>
      </div>

      {selectedCandidature && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="candidature-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCandidature(null)
          }}
        >
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)] p-4 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="candidature-detail-title" className="text-xl font-semibold text-white">Détail de la candidature</h2>
                <p className="mt-1 text-xs text-white/40">Consultation en lecture seule</p>
              </div>
              <button type="button" onClick={() => setSelectedCandidature(null)} aria-label="Fermer" className="rounded p-1 text-white/60 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              {selectedCandidature.profile_picture ? (
                <img src={selectedCandidature.profile_picture} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-cyan/10 font-semibold text-brand-cyan">
                  {(selectedCandidature.prenom || selectedCandidature.nom || 'U')[0]}
                </div>
              )}
              <div>
                <div className="font-semibold text-white">
                  {[selectedCandidature.prenom, selectedCandidature.nom].filter(Boolean).join(' ') || `Utilisateur #${selectedCandidature.id_utilisateur}`}
                </div>
                <div className="text-xs text-white/50">{selectedCandidature.email || 'Coordonnées non disponibles'}</div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCandidature(null)
                    navigate(`/admin/utilisateurs?userId=${selectedCandidature.id_utilisateur}`)
                  }}
                  className="mt-1 text-xs text-brand-cyan hover:underline"
                >
                  Ouvrir le profil du candidat
                </button>
              </div>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <Detail label="Annonce" value={selectedCandidature.titre || `Annonce #${selectedCandidature.id_annonce}`} />
              <Detail label="Candidature" value={`#${selectedCandidature.id_candidature}`} />
              <Detail label="Date" value={new Date(selectedCandidature.date_creation).toLocaleString('fr-FR')} />
              <Detail label="Statut" value={candidatureStatusLabel(selectedCandidature.statut)} />
              <Detail label="Téléphone" value={selectedCandidature.telephone || '-'} />
              <Detail label="Quartier" value={selectedCandidature.quartier || '-'} />
              {selectedCandidature.equipe_nom && <Detail label="Équipe" value={selectedCandidature.equipe_nom} />}
            </dl>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase text-white/40">Message</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm text-white/80">{selectedCandidature.message || 'Aucun message.'}</p>
            </div>
            {Boolean(selectedCandidature.membres?.length) && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase text-white/40">Équipe associée</h3>
                <ul className="mt-2 space-y-1">
                  {selectedCandidature.membres?.map((member) => (
                    <li key={member.id} className="text-sm text-white/80">
                      {member.nom} · {member.profession || 'Profession non précisée'} · {member.statut}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Boolean(selectedTeam?.membres.length) && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase text-white/40">Membres de l’équipe</h3>
                <ul className="mt-2 space-y-2">
                  {selectedTeam?.membres.map((member) => (
                    <li key={member.id_utilisateur} className="flex items-center justify-between gap-3 text-sm text-white/80">
                      <span>
                        {member.prenom} {member.nom} · {member.statut}
                        {Number(member.id_utilisateur) === Number(selectedCandidature.id_utilisateur) && (
                          <span className="ml-2 text-[10px] font-semibold text-brand-cyan">(a déposé la candidature)</span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCandidature(null)
                          navigate(`/admin/utilisateurs?userId=${member.id_utilisateur}`)
                        }}
                        className="text-xs text-brand-cyan hover:underline"
                      >
                        Profil
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      {selectedAnnonceCandidatures !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="annonce-candidatures-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedAnnonceCandidatures(null)
          }}
        >
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-[oklch(0.22_0.005_260)] p-4 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="annonce-candidatures-title" className="text-xl font-semibold text-white">Candidatures</h2>
                <p className="mt-1 text-sm text-white/50">
                  {annonces.find((annonce) => annonce.id === selectedAnnonceCandidatures)?.titre || `Annonce #${selectedAnnonceCandidatures}`}
                </p>
              </div>
              <button type="button" onClick={() => setSelectedAnnonceCandidatures(null)} aria-label="Fermer" className="rounded p-1 text-white/60 hover:bg-white/10">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-2">
              {(candidaturesByAnnonce.get(selectedAnnonceCandidatures) || []).map((candidature) => (
                <div key={candidature.id_candidature} className="flex flex-wrap items-center gap-3 rounded-lg bg-white/5 p-3">
                  {candidature.profile_picture ? (
                    <img src={candidature.profile_picture} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan/10 font-semibold text-brand-cyan">
                      {(candidature.prenom || candidature.nom || 'U')[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-white">
                      {[candidature.prenom, candidature.nom].filter(Boolean).join(' ') || `Utilisateur #${candidature.id_utilisateur}`}
                    </div>
                    <div className="text-xs text-white/45">
                      {candidature.equipe_nom ? `${candidature.equipe_nom} · ` : ''}
                      {new Date(candidature.date_creation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="text-xs text-white/60">{candidatureStatusLabel(candidature.statut)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnnonceCandidatures(null)
                      setSelectedCandidature(candidature)
                    }}
                    className="text-xs text-brand-cyan hover:underline"
                  >
                    Détail
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAnnonceCandidatures(null)
                      navigate(`/admin/utilisateurs?userId=${candidature.id_utilisateur}`)
                    }}
                    className="text-xs text-brand-cyan hover:underline"
                  >
                    Profil
                  </button>
                </div>
              ))}
              {(candidaturesByAnnonce.get(selectedAnnonceCandidatures) || []).length === 0 && (
                <p className="py-8 text-center text-sm text-white/50">Aucune candidature pour cette annonce.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  )
}
