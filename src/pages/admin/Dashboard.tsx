import React, { useEffect, useState } from 'react'
import { ArrowUpRight, FileText, House, Users, Wallet } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { candidatureStatusMeta } from '../../data/mockData'
import { api, ApiAnnonce, ApiCandidature, BackofficeDashboard } from '../../lib/api'
import { formatAr } from '../../lib/utils'
import { CandidatureStatus } from '../../types'

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  color,
}: {
  icon: any
  label: string
  value: string | number
  delta: string
  color: 'cyan' | 'green' | 'olive' | 'magenta'
}) {
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
        <span className="text-xs text-brand-green inline-flex items-center gap-0.5">
          <ArrowUpRight className="w-3 h-3" /> {delta}
        </span>
      </div>
      <div className="mt-4 text-2xl font-bold text-white truncate">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<BackofficeDashboard | null>(null)
  const [annonces, setAnnonces] = useState<ApiAnnonce[]>([])
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([api.backofficeDashboard(), api.annonces({ statut: 'all' }), api.adminCandidatures()])
      .then(([dashboard, annoncesRows, candidaturesRows]) => {
        setStats(dashboard)
        setAnnonces(annoncesRows)
        setCandidatures(candidaturesRows)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement du dashboard impossible'))
      .finally(() => setLoading(false))
  }, [])

  const topCities = Object.entries(
    annonces.reduce<Record<string, number>>((acc, annonce) => {
      acc[annonce.ville] = (acc[annonce.ville] || 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const maxCity = Math.max(...topCities.map(([, count]) => count), 1)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="bebas text-3xl text-white">Dashboard</h1>
          <p className="text-white/50 text-sm">Vue d'ensemble de la plateforme, aujourd'hui</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>}
        {loading && <div className="text-white/50 text-sm">Chargement des donnees...</div>}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={House} label="Annonces actives" value={annonces.filter((a) => a.statut === 'active').length} delta={`${stats?.tauxValidation || 0}%`} color="cyan" />
          <StatCard icon={FileText} label="Candidatures/mois" value={stats?.candidaturesMois || 0} delta={`${candidatures.length} total`} color="green" />
          <StatCard icon={Users} label="Utilisateurs actifs" value={stats?.membresActifs || 0} delta={`${stats?.signalements || 0} signal.`} color="olive" />
          <StatCard icon={Wallet} label="Revenus (Ar)" value={formatAr(stats?.chiffreAffairesMois || 0)} delta={`${stats?.contratsMois || 0} contrats`} color="magenta" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="bebas text-xl text-white">Candidatures recentes</h2>
            </div>
            <div className="space-y-2">
              {candidatures.slice(0, 5).map((c) => {
                const status = (c.statut as CandidatureStatus) || 'envoyee'
                const meta = candidatureStatusMeta[status] || candidatureStatusMeta.envoyee
                const tenant = `Utilisateur #${c.id_utilisateur}`
                return (
                  <div key={c.id_candidature} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 border border-white/5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] font-bold text-sm">
                      {tenant[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{tenant}</div>
                      <div className="text-xs text-white/50 truncate">
                        {c.titre || `Annonce #${c.id_annonce}`} - #{c.id_candidature}
                      </div>
                    </div>
                    <span className={`inline-flex text-[10px] font-bold px-2 py-1 rounded-full border ${meta.className}`}>
                      {meta.label}
                    </span>
                  </div>
                )
              })}
              {!loading && candidatures.length === 0 && <div className="text-sm text-white/40">Aucune candidature recente.</div>}
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
              {!loading && topCities.length === 0 && <div className="text-sm text-white/40">Aucune ville a afficher.</div>}
            </div>
          </div>
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="bebas text-xl text-white">Dernieres annonces publiees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left py-2 font-medium">Titre</th>
                  <th className="text-left font-medium">Ville</th>
                  <th className="text-left font-medium">Prix</th>
                  <th className="text-left font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {annonces.slice(0, 5).map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">{l.titre}</td>
                    <td className="text-white/60">{l.ville}</td>
                    <td className="text-white/60">{formatAr(Number(l.chambre?.prix_loyer || 0))}</td>
                    <td>
                      <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">
                        {l.statut}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && annonces.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-white/40">Aucune annonce.</td>
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
