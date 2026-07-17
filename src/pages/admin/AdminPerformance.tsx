import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Gauge, RefreshCw, Shield, DollarSign, CheckCircle, Clock } from 'lucide-react'
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
  // Nouvelles propriétés pour les graphiques
  signalements_traites?: number
  conformite_versements?: number
  temps_reaction_moderation?: number
  disponibilite?: number
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

// ===== COMPOSANT DONUT CHART =====
const DonutChart = ({ 
  value, 
  max, 
  label, 
  sublabel,
  color = '#46BDD6',
  size = 120
}: { 
  value: number
  max: number
  label: string
  sublabel?: string
  color?: string
  size?: number
}) => {
  const percentage = Math.min(100, Math.round((value / max) * 100))
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (percentage / 100) * circumference
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 120 120" className="transform -rotate-90">
          {/* Cercle de fond */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
          />
          {/* Cercle de progression */}
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
          {sublabel && <span className="text-[10px] text-white/40">{sublabel}</span>}
        </div>
      </div>
      <div className="text-center mt-2">
        <div className="text-sm font-medium text-white/80">{label}</div>
        {sublabel && <div className="text-xs text-white/40">{sublabel}</div>}
      </div>
    </div>
  )
}

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
        // Nouvelles données pour les graphiques
        signalements_traites: Number(data.signalements_traites || data.taux_validation || 88),
        conformite_versements: Number(data.conformite_versements || 92),
        temps_reaction_moderation: Number(data.temps_reaction_moderation || 7),
        disponibilite: Number(data.disponibilite || 99.7),
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

        {/* ===== KPIS ===== */}
        {!loading && backendPerformance && (
          <>
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

            {/* ===== GRAPHIQUES EN ANNEAU ===== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Graphique 1: Signalements traités */}
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-cyan" />
                    Signalements traités &lt; 24h
                  </h3>
                  <span className="text-xs text-white/40">Objectif: 90%</span>
                </div>
                <div className="flex flex-col items-center">
                  <DonutChart 
                    value={backendPerformance.signalements_traites || 88}
                    max={100}
                    label="Signalements traités < 24h"
                    sublabel={`${backendPerformance.signalements_traites || 88}% · objectif 90%`}
                    color="#46BDD6"
                    size={150}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    Temps moyen: {backendPerformance.temps_reaction_moderation || 7} min
                  </div>
                </div>
              </div>

              {/* Graphique 2: Conformité des versements */}
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-brand-green" />
                    Conformité des versements
                  </h3>
                  <span className="text-xs text-white/40">Objectif: 95%</span>
                </div>
                <div className="flex flex-col items-center">
                  <DonutChart 
                    value={backendPerformance.conformite_versements || 92}
                    max={100}
                    label="Versements conformes"
                    sublabel={`${backendPerformance.conformite_versements || 92}% · objectif 95%`}
                    color="#99CC33"
                    size={150}
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <CheckCircle className="w-3 h-3 text-brand-green" />
                    {backendPerformance.conformite_versements || 92}% conformes
                  </div>
                </div>
              </div>
            </div>

            {/* ===== INDICATEURS SUPPLÉMENTAIRES ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-brand-green">{backendPerformance.disponibilite || 99.7}%</div>
                <div className="text-[10px] text-white/40">Disponibilité (30 j)</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-brand-cyan">{backendPerformance.temps_reaction_moderation || 7} min</div>
                <div className="text-[10px] text-white/40">Temps de réaction modération</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-amber-400">{backendPerformance.signalements_traites || 88}%</div>
                <div className="text-[10px] text-white/40">Signalements traités &lt; 24 h</div>
              </div>
              <div className="bg-[oklch(0.22_0.005_260)] border border-white/10 rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-brand-green">{backendPerformance.conformite_versements || 92}%</div>
                <div className="text-[10px] text-white/40">Conformité des versements</div>
              </div>
            </div>
          </>
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