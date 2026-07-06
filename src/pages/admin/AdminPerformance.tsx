import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Gauge, RefreshCw } from 'lucide-react'
import { api } from '../../lib/api'

type BackendPerformance = {
  annonces_actives: number
  utilisateurs_actifs: number
  messages_jour: number
  signalements_ouverts: number
  contrats_mois: number
  candidatures_mois: number
  chiffre_affaires_mois: number
  taux_validation: number
}

const BACKEND_KPIS: Array<{
  key: keyof BackendPerformance
  label: string
  color: string
  suffix?: string
}> = [
  { key: 'annonces_actives', label: 'Annonces actives', color: 'text-brand-cyan' },
  { key: 'utilisateurs_actifs', label: 'Utilisateurs actifs', color: 'text-brand-green' },
  { key: 'messages_jour', label: "Messages aujourd'hui", color: 'text-amber-400' },
  { key: 'signalements_ouverts', label: 'Signalements ouverts', color: 'text-red-400' },
  { key: 'contrats_mois', label: 'Contrats ce mois', color: 'text-brand-cyan' },
  { key: 'candidatures_mois', label: 'Candidatures ce mois', color: 'text-brand-green' },
  { key: 'chiffre_affaires_mois', label: 'CA ce mois', color: 'text-amber-400' },
  { key: 'taux_validation', label: 'Taux de validation', color: 'text-red-400', suffix: '%' },
]

export default function AdminPerformance() {
  const [backendPerformance, setBackendPerformance] = useState<BackendPerformance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const loadBackendPerformance = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.backofficePerformance()
      setBackendPerformance({
        annonces_actives: Number(data.annonces_actives || 0),
        utilisateurs_actifs: Number(data.utilisateurs_actifs || 0),
        messages_jour: Number(data.messages_jour || 0),
        signalements_ouverts: Number(data.signalements_ouverts || 0),
        contrats_mois: Number(data.contrats_mois || 0),
        candidatures_mois: Number(data.candidatures_mois || 0),
        chiffre_affaires_mois: Number(data.chiffre_affaires_mois || 0),
        taux_validation: Number(data.taux_validation || 0),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger les données backend.')
      setBackendPerformance(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBackendPerformance()
  }, [])

  const handleRefresh = async () => {
    await loadBackendPerformance()
    setSuccessMessage('Données actualisées')
    window.setTimeout(() => setSuccessMessage(null), 3000)
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="bebas text-3xl text-white">Performance & qualité de service</h1>
            <p className="text-white/50 text-sm">Données de performance chargées uniquement depuis le backend.</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition text-white/60"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {successMessage && (
          <div className="bg-brand-green/20 border border-brand-green/30 text-brand-green px-4 py-2 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-200">
            Erreur backend : {error}
          </div>
        )}

        {loading && (
          <div className="text-white/50 text-sm">Chargement des indicateurs de performance...</div>
        )}

        {!loading && backendPerformance && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BACKEND_KPIS.map((item) => (
              <div key={item.key} className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-5 text-center">
                <div className={`text-3xl font-bold ${item.color}`}>
                  {backendPerformance[item.key]}
                  {item.suffix ?? ''}
                </div>
                <div className="text-xs text-white/40 mt-2">{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && !backendPerformance && !error && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/60">
            <Gauge className="w-12 h-12 mx-auto mb-4 text-white/40" />
            <p>Aucune donnée de performance disponible pour le moment.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
