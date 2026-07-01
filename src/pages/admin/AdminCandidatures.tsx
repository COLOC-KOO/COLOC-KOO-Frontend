import React from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { candidatures, candidatureStatusMeta } from '../../data/mockData'
import { CandidatureStatus } from '../../types'

const columns: { id: CandidatureStatus; label: string }[] = [
  { id: 'envoyee', label: 'Envoyées' },
  { id: 'recue', label: 'Reçues' },
  { id: 'dossier', label: 'Dossier' },
  { id: 'signature', label: 'Signature' },
  { id: 'conv', label: 'Convention' }
]

export default function AdminCandidatures() {
  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="bebas text-3xl text-white">Candidatures</h1>
          <p className="text-white/50 text-sm">Pipeline Kanban · {candidatures.length} en cours</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((col) => {
            const items = candidatures.filter((c) => c.status === col.id)
            return (
              <div key={col.id} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">{col.label}</div>
                  <span className="text-xs bg-white/10 rounded-full px-2 py-0.5">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && <div className="text-xs text-white/30 text-center py-6">Vide</div>}
                  {items.map((c) => (
                    <div
                      key={c.id}
                      className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-brand-cyan/40 cursor-pointer"
                    >
                      <div className="text-xs text-white/40">{c.id}</div>
                      <div className="text-sm font-medium mt-1">{c.tenant}</div>
                      <div className="text-xs text-white/50 truncate">{c.listing}</div>
                      <div
                        className={`mt-2 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${candidatureStatusMeta[c.status].className}`}
                      >
                        {candidatureStatusMeta[c.status].label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
