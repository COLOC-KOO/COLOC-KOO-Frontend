import React, { useState } from 'react'
import { Ellipsis, Search, Shield } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { adminUsers } from '../../data/mockData'

const filters = ['Tous', 'Locataires', 'Propriétaires', 'Agences', 'Admins']

export default function AdminUtilisateurs() {
  const [active, setActive] = useState(0)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Utilisateurs</h1>
          <p className="text-white/50 text-sm">1 420 utilisateurs · locataires, propriétaires, agences</p>
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 flex gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input placeholder="Rechercher un utilisateur..." className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <div className="flex gap-1 ml-auto">
              {filters.map((f, i) => (
                <button
                  key={f}
                  onClick={() => setActive(i)}
                  className={`px-3 py-1.5 text-xs rounded-lg ${
                    active === i ? 'bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-white/40 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 font-medium">Utilisateur</th>
                  <th className="text-left font-medium">Rôle</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-left font-medium">Inscription</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-cyan to-brand-green flex items-center justify-center text-[oklch(0.15_0_0)] text-xs font-bold">
                          {u.name[0]}
                        </div>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-white/50">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-white/70">{u.role}</td>
                    <td>
                      {u.status === 'Vérifié' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-cyan px-2 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10">
                          <Shield className="w-3 h-3" /> Vérifié
                        </span>
                      ) : u.status === 'Actif' ? (
                        <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">
                          Actif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-brand-olive px-2 py-1 rounded-full border border-brand-olive/30 bg-brand-olive/10">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="text-white/60">{u.date}</td>
                    <td className="p-4 text-right">
                      <button className="p-1.5 hover:bg-white/10 rounded">
                        <Ellipsis className="w-4 h-4" />
                      </button>
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
