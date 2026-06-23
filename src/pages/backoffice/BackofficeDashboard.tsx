import { useState } from 'react';

const KPIS = [
  { val: '12', label: 'En file d\'attente', color: 'text-sc-cy', icon: 'ti-stack-2' },
  { val: '8', label: 'Validées aujourd\'hui', color: 'text-[#99CC33]', icon: 'ti-circle-check' },
  { val: '3', label: 'Signalements actifs', color: 'text-[#E2B53A]', icon: 'ti-flag' },
  { val: '847', label: 'Membres actifs', color: 'text-[#CD6CA8]', icon: 'ti-users' },
  { val: '256', label: 'Annonces ce mois', color: 'text-[#99CC33]', icon: 'ti-home' },
  { val: '94%', label: 'Taux validation', color: 'text-sc-cy', icon: 'ti-chart-bar' },
];

const RECENT_ACTIONS = [
  { id: 'a1', type: 'validation', texte: 'Annonce #142 validée — Villa Iavoloha', user: 'Modérateur', temps: 'il y a 3 min', color: 'bg-[rgba(153,204,51,.15)] text-[#c0e07a]' },
  { id: 'a2', type: 'refus', texte: 'Annonce #141 refusée — Photos non conformes', user: 'Modérateur', temps: 'il y a 12 min', color: 'bg-[rgba(224,96,78,.15)] text-[#f0a094]' },
  { id: 'a3', type: 'signal', texte: 'Signalement traité — Membre @rakoto_a', user: 'Modérateur', temps: 'il y a 25 min', color: 'bg-[rgba(205,108,168,.15)] text-[#e3a8cd]' },
  { id: 'a4', type: 'validation', texte: 'Annonce #140 validée — Appart Analakely', user: 'Modérateur', temps: 'il y a 1h', color: 'bg-[rgba(153,204,51,.15)] text-[#c0e07a]' },
  { id: 'a5', type: 'correction', texte: 'Annonce #139 renvoyée — Correction demandée', user: 'Modérateur', temps: 'il y a 1h 30', color: 'bg-[rgba(226,181,58,.15)] text-[#e8c97a]' },
];

export default function BackofficeDashboard() {
  const [objectif] = useState(30);
  const [fait] = useState(8);
  const progress = Math.round((fait / objectif) * 100);

  return (
    <div>
      {/* Header */}
      <div className="flex items-end gap-3 flex-wrap mb-5">
        <h1 className="font-bebas text-3xl tracking-wide text-bo-txt">Dashboard</h1>
        <p className="text-bo-muted text-sm">Lundi 23 juin 2025</p>
        <div className="ml-auto flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-bo-panel2 border border-bo-line rounded-xl text-xs text-bo-txt cursor-pointer hover:border-bo-muted transition-colors">
            <i className="ti ti-calendar text-sm" />
            Aujourd'hui
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-sc-cy border-sc-cy border rounded-xl text-xs text-[#06343d] font-bold cursor-pointer hover:bg-sc-cy-d transition-colors">
            <i className="ti ti-download text-sm" />
            Rapport
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {KPIS.map(k => (
          <div key={k.label} className="bg-bo-panel border border-bo-line rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <i className={`ti ${k.icon} text-xl text-bo-muted`} />
              <span className="text-[10px] text-bo-muted bg-bo-panel2 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <p className={`font-bebas text-4xl leading-none ${k.color}`}>{k.val}</p>
            <p className="text-xs text-bo-muted mt-1.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Objectif du jour */}
      <div className="bg-bo-panel border border-bo-line rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="font-bebas text-xl text-bo-txt">Objectif quotidien</h2>
          <span className="text-xs bg-[rgba(226,181,58,.15)] text-[#e8c97a] border border-[rgba(226,181,58,.3)] px-2 py-0.5 rounded-full font-bold">
            {fait}/{objectif} annonces
          </span>
          <span className="ml-auto text-sm font-bold text-bo-txt">{progress}%</span>
        </div>
        <div className="h-3 bg-bo-panel2 rounded-full overflow-hidden border border-bo-line mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #CCCC33, #99CC33)',
            }}
          />
        </div>
        <p className="text-xs text-bo-muted">
          {objectif - fait} annonces restantes pour atteindre l'objectif fixé par le Super Admin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activité récente */}
        <div className="bg-bo-panel border border-bo-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bebas text-xl text-bo-txt flex-1">Activité récente</h2>
            <button className="text-xs text-sc-cy hover:underline cursor-pointer bg-none border-none font-sans">
              Tout voir
            </button>
          </div>
          <div className="space-y-2">
            {RECENT_ACTIONS.map(a => (
              <div key={a.id} className="flex items-start gap-2.5 py-2 border-b border-bo-line last:border-none">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${a.color}`}>
                  {a.type}
                </span>
                <p className="text-xs text-bo-txt flex-1">{a.texte}</p>
                <span className="text-[10px] text-bo-muted flex-shrink-0">{a.temps}</span>
              </div>
            ))}
          </div>
        </div>

        {/* File d'attente aperçu */}
        <div className="bg-bo-panel border border-bo-line rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bebas text-xl text-bo-txt flex-1">File d'attente</h2>
            <span className="text-xs bg-[rgba(224,96,78,.15)] text-[#f0a094] border border-[rgba(224,96,78,.35)] px-2 py-0.5 rounded-full font-bold">
              12 en attente
            </span>
          </div>
          <div className="space-y-2">
            {[
              { id: '#143', titre: 'Maison 4ch — Ankadifotsy', type: 'Proprio', priorite: 'haute' },
              { id: '#144', titre: 'Appart 2ch — Ivandry', type: 'Coloc', priorite: 'normale' },
              { id: '#145', titre: 'Studio — Analakely', type: 'Coloc', priorite: 'normale' },
            ].map(item => (
              <div key={item.id} className="flex items-center gap-2 py-2 border-b border-bo-line last:border-none">
                <span className="text-xs text-bo-muted font-bebas">{item.id}</span>
                <p className="text-xs text-bo-txt flex-1">{item.titre}</p>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  item.type === 'Proprio' ? 'bg-[rgba(70,189,214,.12)] text-[#8fd9e8]' : 'bg-[rgba(153,204,51,.12)] text-[#c0e07a]'
                }`}>
                  {item.type}
                </span>
                {item.priorite === 'haute' && (
                  <span className="text-[10px] text-[#E2B53A]">
                    <i className="ti ti-alert-triangle text-xs" /> Priorité
                  </span>
                )}
                <button className="text-xs text-sc-cy font-bold bg-none border-none cursor-pointer hover:underline">
                  Traiter →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance hebdo */}
      <div className="bg-bo-panel border border-bo-line rounded-xl p-4 mt-4">
        <h2 className="font-bebas text-xl text-bo-txt mb-3">Performance hebdomadaire</h2>
        <div className="flex items-end gap-1.5 h-24">
          {[
            { j: 'L', n: 25, ok: 24, ref: 1 },
            { j: 'M', n: 30, ok: 28, ref: 2 },
            { j: 'M', n: 22, ok: 20, ref: 2 },
            { j: 'J', n: 28, ok: 27, ref: 1 },
            { j: 'V', n: 35, ok: 33, ref: 2 },
            { j: 'S', n: 15, ok: 15, ref: 0 },
            { j: 'D', n: 8, ok: 8, ref: 0, current: true },
          ].map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full flex flex-col items-center gap-0.5">
                <div
                  className={`w-full rounded-t-sm ${d.current ? 'bg-sc-cy' : 'bg-[rgba(153,204,51,.4)]'}`}
                  style={{ height: `${(d.ok / 35) * 80}px` }}
                  title={`${d.ok} validées`}
                />
                {d.ref > 0 && (
                  <div
                    className="w-full bg-[rgba(224,96,78,.4)]"
                    style={{ height: `${(d.ref / 35) * 80}px` }}
                    title={`${d.ref} refusées`}
                  />
                )}
              </div>
              <span className="text-[10px] text-bo-muted">{d.j}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-[10px] text-bo-muted">
            <span className="w-3 h-2 rounded-sm bg-[rgba(153,204,51,.6)] inline-block" /> Validées
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-bo-muted">
            <span className="w-3 h-2 rounded-sm bg-[rgba(224,96,78,.5)] inline-block" /> Refusées
          </span>
        </div>
      </div>
    </div>
  );
}
