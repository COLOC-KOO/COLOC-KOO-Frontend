import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { candidatureStatusMeta } from '../../data/mockData'
import { api, ApiCandidature } from '../../lib/api'
import { CandidatureStatus } from '../../types'

const columns: { id: CandidatureStatus; label: string }[] = [
  { id: 'envoyee', label: 'Envoyees' },
  { id: 'recu', label: 'Recues' },
  { id: 'dossier', label: 'Dossier' },
  { id: 'signature', label: 'Signature' },
  { id: 'convention', label: 'Convention' },
]

export default function AdminCandidatures() {
  const [candidatures, setCandidatures] = useState<ApiCandidature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadCandidatures = () => {
    setLoading(true)
    setError('')
    api
      .adminCandidatures()
      .then(setCandidatures)
      .catch((err) => setError(err instanceof Error ? err.message : 'Chargement impossible'))
      .finally(() => setLoading(false))
  }

  useEffect(loadCandidatures, [])

  async function moveCandidature(candidature: ApiCandidature, statut: CandidatureStatus) {
    await api.updateCandidatureStatus(candidature.id_candidature, statut)
    setCandidatures((current) =>
      current.map((item) => (item.id_candidature === candidature.id_candidature ? { ...item, statut } : item))
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="bebas text-3xl text-white">Candidatures</h1>
            <p className="text-white/50 text-sm">Pipeline Kanban - {candidatures.length} en cours</p>
          </div>
          <button onClick={loadCandidatures} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/80 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/10 transition">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200">{error}</div>}
        {loading && <div className="text-white/40 text-sm">Chargement des candidatures...</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {columns.map((col, colIndex) => {
            const items = candidatures.filter((c) => c.statut === col.id || (col.id === 'recu' && c.statut === 'recue') || (col.id === 'convention' && c.statut === 'conv'))
            return (
              <div key={col.id} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-3">
                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/60">{col.label}</div>
                  <span className="text-xs bg-white/10 rounded-full px-2 py-0.5">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.length === 0 && <div className="text-xs text-white/30 text-center py-6">Vide</div>}
                  {items.map((c) => {
                    const status = (c.statut as CandidatureStatus) || 'envoyee'
                    const meta = candidatureStatusMeta[status] || candidatureStatusMeta.envoyee
                    const next = columns[colIndex + 1]?.id
                    const previous = columns[colIndex - 1]?.id
                    return (
                      <div key={c.id_candidature} className="bg-white/5 border border-white/5 rounded-lg p-3 hover:border-brand-cyan/40">
                        <div className="text-xs text-white/40">#{c.id_candidature}</div>
                        <div className="text-sm font-medium mt-1">Utilisateur #{c.id_utilisateur}</div>
                        <div className="text-xs text-white/50 truncate">{c.titre || `Annonce #${c.id_annonce}`}</div>
                        <div className={`mt-2 inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.className}`}>
                          {meta.label}
                        </div>
                        <div className="mt-3 flex gap-2">
                          {previous && (
                            <button onClick={() => moveCandidature(c, previous)} className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-[11px] text-white/70 hover:bg-white/10">
                              Retour
                            </button>
                          )}
                          {next && (
                            <button onClick={() => moveCandidature(c, next)} className="flex-1 rounded-lg bg-brand-cyan px-2 py-1 text-[11px] font-semibold text-[oklch(0.15_0_0)]">
                              Avancer
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminLayout>
  )
}
