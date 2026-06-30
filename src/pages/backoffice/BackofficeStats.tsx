import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

interface Stat {
  month: string;
  annonces: number;
  membres: number;
}

export default function BackofficeStats() {
  const { token } = useApp();
  const [remoteStats, setRemoteStats] = useState<Stat[]>([]);

  useEffect(() => {
    if (!token) return;

    api
      .request('/backoffice/stats', { token })
      .then((data: any) => {
        if (Array.isArray(data)) {
          setRemoteStats(data);
        } else {
          setRemoteStats([]);
        }
      })
      .catch((error: any) => {
        console.error('Erreur chargement statistiques :', error);
        setRemoteStats([]);
      });
  }, [token]);

  const DATA_MOIS =
    remoteStats.length > 0
      ? remoteStats.map((r) => ({
          m: r.month,
          annonces: Number(r.annonces || 0),
          membres: Number(r.membres || 0),
        }))
      : [
          { m: 'Jan', annonces: 45, membres: 89 },
          { m: 'Fev', annonces: 52, membres: 102 },
          { m: 'Mar', annonces: 61, membres: 134 },
          { m: 'Avr', annonces: 58, membres: 127 },
          { m: 'Mai', annonces: 74, membres: 156 },
          { m: 'Jun', annonces: 68, membres: 143 },
        ];

  const max = Math.max(
    ...DATA_MOIS.map((d) => Math.max(d.annonces, d.membres))
  );

  return (
    <div>
      <div className="flex items-end gap-3 flex-wrap mb-5">
        <h1 className="font-bebas text-3xl text-bo-txt tracking-wide">
          Statistiques
        </h1>

        <p className="text-bo-muted text-sm">
          Vue d'ensemble de la plateforme
        </p>

        <div className="ml-auto">
          <select className="bg-bo-panel2 border border-bo-line rounded-xl px-3 py-2 text-sm text-bo-txt outline-none cursor-pointer">
            <option>6 derniers mois</option>
            <option>12 derniers mois</option>
            <option>Depuis le debut</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          {
            val: '847',
            label: 'Membres inscrits',
            delta: '+12%',
            color: 'text-sc-cy',
          },
          {
            val: '358',
            label: 'Annonces publiees',
            delta: '+8%',
            color: 'text-[#99CC33]',
          },
          {
            val: '1 240',
            label: 'Candidatures envoyees',
            delta: '+23%',
            color: 'text-[#CD6CA8]',
          },
          {
            val: '94%',
            label: 'Taux de validation',
            delta: '+2%',
            color: 'text-[#E2B53A]',
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-bo-panel border border-bo-line rounded-xl p-4"
          >
            <p className={`font-bebas text-4xl leading-none ${k.color}`}>
              {k.val}
            </p>

            <p className="text-[11px] text-bo-muted mt-1.5">
              {k.label}
            </p>

            <p className="text-[10px] text-[#99CC33] mt-1">
              {k.delta} vs mois precedent
            </p>
          </div>
        ))}
      </div>

      <div className="bg-bo-panel border border-bo-line rounded-xl p-5 mb-4">
        <h2 className="font-bebas text-xl text-bo-txt mb-4">
          Evolution mensuelle
        </h2>

        <div className="flex items-end gap-2 h-48 mb-2">
          {DATA_MOIS.map((d) => (
            <div
              key={d.m}
              className="flex-1 flex flex-col items-center gap-0.5"
            >
              <div className="w-full flex gap-0.5 items-end">
                <div
                  className="flex-1 rounded-t-sm bg-[rgba(70,189,214,.5)] hover:bg-sc-cy transition-colors"
                  style={{
                    height: `${(d.annonces / max) * 160}px`,
                  }}
                  title={`${d.annonces} annonces`}
                />

                <div
                  className="flex-1 rounded-t-sm bg-[rgba(153,204,51,.4)] hover:bg-sc-y2 transition-colors"
                  style={{
                    height: `${(d.membres / max) * 160}px`,
                  }}
                  title={`${d.membres} membres`}
                />
              </div>

              <span className="text-[10px] text-bo-muted mt-1">
                {d.m}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-5 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-bo-muted">
            <span className="w-3 h-3 rounded bg-[rgba(70,189,214,.6)] inline-block" />
            Annonces
          </span>

          <span className="flex items-center gap-1.5 text-xs text-bo-muted">
            <span className="w-3 h-3 rounded bg-[rgba(153,204,51,.5)] inline-block" />
            Membres
          </span>
        </div>
      </div>
    </div>
  );
}