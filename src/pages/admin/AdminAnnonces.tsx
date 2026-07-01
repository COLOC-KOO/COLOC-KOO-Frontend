import React, { useState } from 'react'
import { Eye, Filter, Plus, Search, SquarePen, Trash2 } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { listings } from '../../data/mockData'
import { formatAr } from '../../lib/utils'

const filters = ['Toutes', 'Actives', 'En attente', 'Rejetées']

export default function AdminAnnonces() {
  const [active, setActive] = useState(0)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="bebas text-3xl text-white">Annonces</h1>
            <p className="text-white/50 text-sm">{listings.length} annonces au total</p>
          </div>
          <button className="inline-flex items-center gap-2 bg-brand-cyan text-[oklch(0.15_0_0)] font-semibold px-4 py-2 rounded-lg text-sm">
            <Plus className="w-4 h-4" /> Nouvelle annonce
          </button>
        </div>

        <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl">
          <div className="p-4 border-b border-white/10 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 flex-1 max-w-xs">
              <Search className="w-4 h-4 text-white/40" />
              <input placeholder="Rechercher..." className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm">
              <Filter className="w-4 h-4" /> Filtrer
            </button>
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
                  <th className="text-left p-4 font-medium">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left font-medium">Annonce</th>
                  <th className="text-left font-medium">Ville</th>
                  <th className="text-left font-medium">Prix</th>
                  <th className="text-left font-medium">Propriétaire</th>
                  <th className="text-left font-medium">Statut</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4">
                      <input type="checkbox" />
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img src={l.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[240px]">{l.title}</div>
                          <div className="text-xs text-white/40">{l.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-white/70">{l.city}</td>
                    <td className="text-white/70">{formatAr(l.price)}</td>
                    <td className="text-white/70">{l.owner.name}</td>
                    <td>
                      <span className="text-[10px] font-bold text-brand-green px-2 py-1 rounded-full border border-brand-green/30 bg-brand-green/10">
                        Actif
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex gap-1">
                        <button className="p-1.5 hover:bg-white/10 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded">
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded text-brand-magenta">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
