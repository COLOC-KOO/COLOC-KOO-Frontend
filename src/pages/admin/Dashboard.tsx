import React from 'react'
import { ArrowUpRight, FileText, House, Users, Wallet } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { candidatureStatusMeta, candidatures, dashboardStats, listings, topCities } from '../../data/mockData'
import { formatAr } from '../../lib/utils'

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  color
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
    magenta: 'text-brand-magenta bg-brand-magenta/10'
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
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="bebas text-3xl text-white">Dashboard</h1>
          <p className="text-white/50 text-sm">Vue d'ensemble de la plateforme · aujourd'hui</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={House} label="Annonces actives" value={dashboardStats.activeListings} delta="+12%" color="cyan" />
          <StatCard icon={FileText} label="Candidatures" value={dashboardStats.applications} delta="+8%" color="green" />
          <StatCard icon={Users} label="Utilisateurs" value={dashboardStats.users} delta="+34" color="olive" />
          <StatCard
            icon={Wallet}
            label="Revenus (Ar)"
            value={formatAr(dashboardStats.revenueMga)}
            delta="+22%"
            color="magenta"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="bebas text-xl text-white">Candidatures récentes</h2>
              <button className="text-xs text-brand-cyan hover:underline">Voir tout →</button>
            </div>
            <div className="space-y-2">
              {candidatures.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 border border-white/5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] font-bold text-sm">
                    {c.tenant[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.tenant}</div>
                    <div className="text-xs text-white/50 truncate">
                      {c.listing} · {c.id}
                    </div>
                  </div>
                  <span className={`inline-flex text-[10px] font-bold px-2 py-1 rounded-full border ${candidatureStatusMeta[c.status].className}`}>
                    {candidatureStatusMeta[c.status].label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
            <h2 className="bebas text-xl text-white mb-4">Top villes</h2>
            <div className="space-y-3">
              {topCities.map((c) => (
                <div key={c.c}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.c}</span>
                    <span className="text-white/50">{c.n}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-cyan to-brand-green" style={{ width: `${c.p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="bebas text-xl text-white">Dernières annonces publiées</h2>
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
                {listings.slice(0, 5).map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3">{l.title}</td>
                    <td className="text-white/60">{l.city}</td>
                    <td className="text-white/60">{formatAr(l.price)}</td>
                    <td>
                      <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">
                        Actif
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
