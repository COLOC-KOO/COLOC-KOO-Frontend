import React from 'react'
import { Check } from 'lucide-react'
import { SiteLayout } from '../components/site/SiteLayout'
import { candidatures, candidatureStatusMeta } from '../data/mockData'
import { CandidatureStatus } from '../types'

const order: CandidatureStatus[] = ['envoyee', 'recue', 'dossier', 'signature', 'conv']
const labels = ['Envoyée', 'Reçue', 'Dossier', 'Signature', 'Convention']

export default function Candidatures() {
  return (
    <SiteLayout>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="bebas text-4xl">Mes candidatures</h1>
        <p className="text-muted-foreground mt-1">Suivi en temps réel de tes demandes de coloc.</p>

        <div className="mt-8 space-y-4">
          {candidatures.map((c) => {
            const idx = order.indexOf(c.status)
            return (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {c.id} · Envoyé le {c.date}
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
