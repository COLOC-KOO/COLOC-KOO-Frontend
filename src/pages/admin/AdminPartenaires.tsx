import React from 'react'
import { Building2 } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { partners } from '../../data/mockData'

export default function AdminPartenaires() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Partenaires</h1>
          <p className="text-white/50 text-sm">Agences et propriétaires professionnels</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partners.map((p) => (
            <div key={p.name} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 text-brand-cyan flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="mt-3 font-semibold text-white">{p.name}</div>
              <div className="text-xs text-white/50">
                Plan {p.plan} · depuis {p.since}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-white/40">Annonces</div>
                  <div className="text-lg font-bold text-white">{p.listings}</div>
                </div>
                <div>
                  <div className="text-white/40">CA (Ar)</div>
                  <div className="text-lg font-bold text-brand-green">{(p.revenue / 1000000).toFixed(1)}M</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
