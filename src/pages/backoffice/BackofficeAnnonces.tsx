import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

const DEFAULT_QUEUE = [
  { id: '#143', titre: 'Maison 4ch Ankadifotsy', auteur: 'Rabe M.', type: 'proprio', quartier: 'Ankadifotsy', prix: 420000, date: '23/06/2025 09:15', flags: ['Prix eleve'], priorite: 'haute' as const, statut: 'en_file' as const },
  { id: '#144', titre: 'Appart 2ch Ivandry', auteur: 'Rakoto A.', type: 'coloc', quartier: 'Ivandry', prix: 280000, date: '23/06/2025 08:50', flags: [], priorite: 'normale' as const, statut: 'en_file' as const },
  { id: '#145', titre: 'Studio Analakely', auteur: 'Hery R.', type: 'coloc', quartier: 'Analakely', prix: 120000, date: '22/06/2025 17:30', flags: ['Info manquante'], priorite: 'normale' as const, statut: 'en_file' as const },
];

const STATUT_STYLE: Record<string, string> = {
  en_file: 'bg-[rgba(226,181,58,.15)] text-[#e8c97a] border border-[rgba(226,181,58,.3)]',
  validee: 'bg-[rgba(153,204,51,.15)] text-[#c0e07a] border border-[rgba(153,204,51,.3)]',
  refusee: 'bg-[rgba(224,96,78,.15)] text-[#f0a094] border border-[rgba(224,96,78,.3)]',
  correction: 'bg-[rgba(70,189,214,.15)] text-[#8fd9e8] border border-[rgba(70,189,214,.3)]',
};

const STATUT_LABEL: Record<string, string> = {
  en_file: 'En file',
  validee: 'Validee',
  refusee: 'Refusee',
  correction: 'Correction',
};

export default function BackofficeAnnonces() {
  const { token } = useApp();
  const [selected, setSelected] = useState<string | null>('#143');
  const [filter, setFilter] = useState('all');
  const [motifRefus, setMotifRefus] = useState('');
  const [showRefusModal, setShowRefusModal] = useState(false);
  const [annonces, setAnnonces] = useState(DEFAULT_QUEUE);

  useEffect(() => {
    if (!token) return;
    api.request('/backoffice/annonces', { token })
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        setAnnonces(rows.map((a: any) => ({
          id: `#${a.id_annonce || a.id}`,
          titre: a.titre,
          auteur: a.auteur || `${a.auteur_prenom || ''} ${a.auteur_nom || ''}`.trim(),
          type: a.type_annonce === 'creation' ? 'proprio' : 'coloc',
          quartier: a.quartier || '',
          prix: a.prix_loyer || a.prix || 0,
          date: a.date_creation ? new Date(a.date_creation).toLocaleString('fr-FR') : '',
          flags: [],
          priorite: a.booster ? 'haute' : 'normale',
          statut: 'en_file',
        })));
      })
      .catch(() => null);
  }, [token]);

  const filtered = annonces.filter(a => filter === 'all' || a.statut === filter);
  const selectedAnnonce = annonces.find(a => a.id === selected);

  return (
    <div>
      <div className="flex items-end gap-3 flex-wrap mb-5">
        <h1 className="font-bebas text-3xl text-bo-txt tracking-wide">File d'annonces</h1>
        <p className="text-bo-muted text-sm">{annonces.filter(a => a.statut === 'en_file').length} en attente de validation</p>
        <div className="ml-auto flex gap-2">
          {[{ v: 'all', l: 'Toutes' }, { v: 'en_file', l: 'En file' }, { v: 'validee', l: 'Validees' }, { v: 'refusee', l: 'Refusees' }].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${filter === f.v ? 'bg-sc-cy border-sc-cy text-[#06343d]' : 'bg-bo-panel2 border-bo-line text-bo-muted hover:border-bo-muted'}`}>
              {f.l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} onClick={() => setSelected(a.id)} className={`bg-bo-panel border rounded-xl p-4 cursor-pointer transition-all ${selected === a.id ? 'border-sc-cy' : 'border-bo-line hover:border-bo-muted'}`}>
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-0.5 items-center text-bo-muted pt-1">
                  <button className="hover:text-bo-txt cursor-pointer bg-none border-none p-0 text-lg leading-none" onClick={e => e.stopPropagation()}>▲</button>
                  <button className="hover:text-bo-txt cursor-pointer bg-none border-none p-0 text-lg leading-none" onClick={e => e.stopPropagation()}>▼</button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bebas text-sm text-sc-cy tracking-wider">{a.id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUT_STYLE[a.statut]}`}>{STATUT_LABEL[a.statut]}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${a.type === 'proprio' ? 'bg-[rgba(70,189,214,.12)] text-[#8fd9e8]' : 'bg-[rgba(153,204,51,.12)] text-[#c0e07a]'}`}>{a.type === 'proprio' ? 'Proprio' : 'Coloc'}</span>
                    {a.flags.map(f => <span key={f} className="text-[10px] bg-[rgba(224,96,78,.12)] text-[#f0a094] border border-[rgba(224,96,78,.25)] px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><i className="ti ti-alert-triangle text-[10px]" />{f}</span>)}
                    {a.priorite === 'haute' && <span className="text-[10px] text-[#E2B53A]"><i className="ti ti-flame text-[10px]" /> Haute priorite</span>}
                  </div>
                  <p className="text-sm font-bold text-bo-txt">{a.titre}</p>
                  <p className="text-xs text-bo-muted mt-0.5">Par {a.auteur} · {a.quartier} · {a.prix.toLocaleString('fr-FR')} Ar/mois · {a.date}</p>
                </div>

                {a.statut === 'en_file' && (
                  <div className="flex gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 bg-[rgba(153,204,51,.15)] text-[#c0e07a] text-xs font-bold rounded-lg border border-[rgba(153,204,51,.3)] cursor-pointer hover:bg-[rgba(153,204,51,.25)] transition-colors"><i className="ti ti-check text-xs" /> Valider</button>
                    <button onClick={() => setShowRefusModal(true)} className="flex items-center gap-1 px-2.5 py-1.5 bg-transparent text-[#f0a094] text-xs font-bold rounded-lg border border-[rgba(224,96,78,.4)] cursor-pointer hover:bg-[rgba(224,96,78,.12)] transition-colors"><i className="ti ti-x text-xs" /> Refuser</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedAnnonce && (
          <div className="bg-bo-panel border border-bo-line rounded-xl p-4 sticky top-[100px] h-fit">
            <h3 className="font-bebas text-lg text-bo-txt mb-3">Detail annonce</h3>
            <div className="h-28 bg-bo-panel2 rounded-xl mb-3 flex items-center justify-center text-bo-muted"><i className="ti ti-photo text-2xl" /></div>
            <div className="space-y-2 mb-3">
              {[
                { l: 'Reference', v: selectedAnnonce.id },
                { l: 'Titre', v: selectedAnnonce.titre },
                { l: 'Depose par', v: selectedAnnonce.auteur },
                { l: 'Type', v: selectedAnnonce.type === 'proprio' ? 'Coloc a constituer' : 'Coloc existante' },
                { l: 'Quartier', v: selectedAnnonce.quartier },
                { l: 'Prix', v: `${selectedAnnonce.prix.toLocaleString('fr-FR')} Ar/mois` },
                { l: 'Date depot', v: selectedAnnonce.date },
                { l: 'Statut', v: STATUT_LABEL[selectedAnnonce.statut] },
              ].map(row => <div key={row.l} className="flex gap-2 text-xs border-b border-bo-line pb-1.5 last:border-none"><span className="text-bo-muted w-24 flex-shrink-0">{row.l}</span><span className="text-bo-txt">{row.v}</span></div>)}
            </div>
            {selectedAnnonce.flags.length > 0 && (
              <div className="mb-3 p-2.5 bg-[rgba(224,96,78,.08)] border border-[rgba(224,96,78,.2)] rounded-xl">
                <p className="text-[10px] font-bold text-[#f0a094] mb-1">⚠ Alertes detectees</p>
                {selectedAnnonce.flags.map(f => <p key={f} className="text-xs text-[#f0a094]">• {f}</p>)}
              </div>
            )}
            {selectedAnnonce.statut === 'en_file' && (
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-sc-y2 border-sc-y2 border text-[#163300] text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"><i className="ti ti-circle-check text-sm" /> Valider l'annonce</button>
                <button className="w-full flex items-center justify-center gap-1.5 py-2 bg-[rgba(70,189,214,.12)] border border-[rgba(70,189,214,.3)] text-[#8fd9e8] text-xs font-bold rounded-xl cursor-pointer hover:bg-[rgba(70,189,214,.2)] transition-colors"><i className="ti ti-message text-sm" /> Demander correction</button>
                <button onClick={() => setShowRefusModal(true)} className="w-full flex items-center justify-center gap-1.5 py-2 bg-transparent border border-[rgba(224,96,78,.4)] text-[#f0a094] text-xs font-bold rounded-xl cursor-pointer hover:bg-[rgba(224,96,78,.12)] transition-colors"><i className="ti ti-x text-sm" /> Refuser l'annonce</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showRefusModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-bo-panel border border-bo-line rounded-2xl p-5 w-full max-w-md">
            <h3 className="font-bebas text-xl text-bo-txt mb-3">Motif de refus</h3>
            <div className="space-y-2 mb-3">
              {['Photos non conformes', 'Prix anormal', 'Informations incomplètes', 'Doublon détecté', 'Contenu inapproprié'].map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer py-1.5">
                  <input type="radio" name="motif" value={m} checked={motifRefus === m} onChange={e => setMotifRefus(e.target.value)} className="accent-sc-cy" />
                  <span className="text-sm text-bo-txt">{m}</span>
                </label>
              ))}
            </div>
            <textarea placeholder="Details supplementaires (optionnel)..." rows={2} className="w-full bg-bo-panel2 border border-bo-line rounded-xl px-3 py-2.5 text-sm text-bo-txt mb-3 resize-none outline-none focus:border-bo-muted" />
            <div className="flex gap-2">
              <button onClick={() => setShowRefusModal(false)} className="flex-1 py-2.5 bg-bo-panel2 border border-bo-line text-bo-txt text-sm font-bold rounded-xl cursor-pointer hover:border-bo-muted transition-colors">Annuler</button>
              <button onClick={() => setShowRefusModal(false)} className="flex-1 py-2.5 bg-[rgba(224,96,78,.2)] border border-[rgba(224,96,78,.4)] text-[#f0a094] text-sm font-bold rounded-xl cursor-pointer hover:bg-[rgba(224,96,78,.3)] transition-colors">Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
