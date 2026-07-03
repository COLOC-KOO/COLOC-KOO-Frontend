import React from 'react'
import { Check } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { candidatures, candidatureStatusMeta } from '../data/mockData'
import { CandidatureStatus } from '../types'

const order: CandidatureStatus[] = ['envoyee', 'recu', 'dossier', 'signature', 'convention']
const labels = ['Envoyee', 'Recue', 'Dossier', 'Signature', 'Convention']

const candidatureStatusMeta: Record<CandidatureStatus, { label: string; className: string }> = {
  envoyee: { label: 'Envoyee', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  recue: { label: 'Recue', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  recu: { label: 'Recue', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  dossier: { label: 'Dossier', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  signature: { label: 'Signature', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  conv: { label: 'Convention', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  convention: { label: 'Convention', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  en_attente: { label: 'En attente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  acceptee: { label: 'Acceptee', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  refusee: { label: 'Refusee', className: 'bg-red-50 text-red-700 border-red-200' },
  constituee: { label: 'Constituee', className: 'bg-brand-cyan-light text-brand-cyan-dark border-brand-cyan/30' },
}

function mapCandidature(c: ApiCandidature, userName: string): Candidature {
  return {
    id: String(c.id_candidature),
    listing: c.titre || `Annonce #${c.id_annonce}`,
    tenant: userName,
    status: (c.statut as CandidatureStatus) || 'envoyee',
    date: new Date(c.date_creation).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }
}

export default function Candidatures() {
  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="bebas text-4xl">Mes candidatures</h1>
        <p className="text-muted-foreground mt-1">Suivi en temps reel de tes demandes de coloc.</p>

        {authLoading ? (
          <div className="mt-8 text-muted-foreground">Chargement de votre session...</div>
        ) : !user ? (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Connecte-toi pour voir tes candidatures et suivre leur evolution.</p>
            <Link to="/auth?mode=signin&redirect=/candidatures" className="mt-4 inline-flex text-sm font-semibold text-brand-cyan-dark hover:underline">
              Se connecter
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
            {loading ? (
              <div className="text-muted-foreground">Chargement de vos candidatures...</div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
                Aucune candidature pour le moment.
              </div>
            ) : (
              items.map((c) => {
                const idx = Math.max(order.indexOf(c.status), 0)
                const meta = candidatureStatusMeta[c.status] || candidatureStatusMeta.envoyee
                return (
                  <div key={c.id} className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          #{c.id} - Envoye le {c.date}
                        </div>
                        <h3 className="font-semibold text-lg mt-1">{c.listing}</h3>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${meta.className}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="mt-6 flex items-center">
                      {order.map((s, i) => {
                        const isDone = i <= idx
                        const isCurrent = i === idx
                        return (
                          <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className="flex flex-col items-center gap-1 min-w-[60px]">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                  isDone && !isCurrent
                                    ? 'bg-brand-green text-white'
                                    : isCurrent
                                    ? 'bg-brand-cyan text-white ring-4 ring-brand-cyan-light'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {isDone && !isCurrent ? <Check className="w-4 h-4" /> : i + 1}
                              </div>
                              <span className="text-[10px] text-muted-foreground text-center">{labels[i]}</span>
                            </div>
                            {i < order.length - 1 && (
                              <div className={`flex-1 h-0.5 ${i < idx ? 'bg-brand-green' : 'bg-border'}`} />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <h3 className="font-semibold text-lg mt-1">{c.listing}</h3>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${candidatureStatusMeta[c.status].className}`}
                  >
                    {candidatureStatusMeta[c.status].label}
                  </span>
                </div>
                <div className="mt-6 flex items-center">
                  {order.map((s, i) => {
                    const isDone = i <= idx
                    const isCurrent = i === idx
                    return (
                      <div key={s} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1 min-w-[60px]">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDone && !isCurrent
                                ? 'bg-brand-green text-white'
                                : isCurrent
                                ? 'bg-brand-cyan text-white ring-4 ring-brand-cyan-light'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {isDone && !isCurrent ? <Check className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className="text-[10px] text-muted-foreground text-center">{labels[i]}</span>
                        </div>
                        {i < order.length - 1 && (
                          <div className={`flex-1 h-0.5 ${i < idx ? 'bg-brand-green' : 'bg-border'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SiteLayout>
  )
}
