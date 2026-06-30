import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

const FALLBACK_MEMBRES = [
  { id: 'm1', nom: 'Rakoto Andriamahefa', email: 'rakoto.a@email.mg', role: 'coloc', statut: 'actif', candidatures: 5, annonces: 0, inscription: '10 mai 2025', initiales: 'RA' },
  { id: 'm2', nom: 'Rabe Miandrisoa', email: 'rabe.m@email.mg', role: 'proprio', statut: 'actif', candidatures: 0, annonces: 2, inscription: '3 avril 2025', initiales: 'RM' },
  { id: 'm3', nom: 'Hery Randrianaivo', email: 'hery.r@email.mg', role: 'agent', statut: 'actif', candidatures: 2, annonces: 8, inscription: '15 mars 2025', initiales: 'HR' },
  { id: 'm4', nom: 'Miora Tahina', email: 'miora.t@email.mg', role: 'coloc', statut: 'suspendu', candidatures: 1, annonces: 0, inscription: '28 mai 2025', initiales: 'MT' },
  { id: 'm5', nom: 'Lalaina Nomenjanahary', email: 'lalaina.n@email.mg', role: 'coloc', statut: 'actif', candidatures: 3, annonces: 0, inscription: '7 juin 2025', initiales: 'LN' },
];

const ROLE_STYLE: Record<string, string> = {
  coloc: 'bg-[rgba(70,189,214,.12)] text-[#8fd9e8]',
  proprio: 'bg-[rgba(153,204,51,.12)] text-[#c0e07a]',
  agent: 'bg-[rgba(205,108,168,.12)] text-[#e3a8cd]',
  admin: 'bg-[rgba(224,96,78,.12)] text-[#f0a094]',
  moderator: 'bg-[rgba(226,181,58,.12)] text-[#e8c97a]',
};

export default function BackofficeMembers() {
  const { token } = useApp();
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [members, setMembers] = useState(FALLBACK_MEMBRES);

  useEffect(() => {
    if (!token) return;
    api.request('/backoffice/members', { token })
      .then(rows => {
        if (!Array.isArray(rows) || rows.length === 0) return;
        setMembers(rows.map((m: any) => ({
          id: String(m.id || m.id_utilisateur),
          nom: `${m.prenom || ''} ${m.nom || ''}`.trim(),
          email: m.email,
          role: m.nom_role || 'coloc',
          statut: m.statut || 'actif',
          candidatures: m.candidatures || 0,
          annonces: m.annonces || 0,
          inscription: m.date_inscription ? new Date(m.date_inscription).toLocaleDateString('fr-FR') : '',
          initiales: `${(m.prenom || '').charAt(0)}${(m.nom || '').charAt(0)}`.toUpperCase(),
        })));
      })
      .catch(() => null);
  }, [token]);

  const filtered = members.filter(m => {
    const matchSearch = !search || m.nom.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || m.role === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div className="flex items-end gap-3 flex-wrap mb-5">
        <h1 className="font-bebas text-3xl text-bo-txt tracking-wide">Membres</h1>
        <p className="text-bo-muted text-sm">{members.length} membres enregistres</p>
        <div className="ml-auto flex gap-2">
          <input
            type="text"
            placeholder="Rechercher un membre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-bo-panel2 border border-bo-line rounded-xl px-3 py-2 text-sm text-bo-txt outline-none focus:border-bo-muted w-48"
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="bg-bo-panel2 border border-bo-line rounded-xl px-3 py-2 text-sm text-bo-txt outline-none cursor-pointer"
          >
            <option value="all">Tous les roles</option>
            <option value="coloc">Colocataire</option>
            <option value="proprio">Proprietaire</option>
            <option value="agent">Agent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { val: String(members.length), label: 'Total membres', color: 'text-sc-cy' },
          { val: '12', label: 'Nouveaux cette semaine', color: 'text-[#99CC33]' },
          { val: String(members.filter(m => m.statut !== 'actif').length), label: 'Suspendus', color: 'text-[#E2B53A]' },
          { val: '95%', label: 'Actifs (30j)', color: 'text-[#CD6CA8]' },
        ].map(k => (
          <div key={k.label} className="bg-bo-panel border border-bo-line rounded-xl p-3">
            <p className={`font-bebas text-3xl ${k.color}`}>{k.val}</p>
            <p className="text-[11px] text-bo-muted mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-bo-panel border border-bo-line rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bo-line">
              {['Membre', 'Role', 'Statut', 'Activite', 'Inscription', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-bo-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-bo-line last:border-none hover:bg-bo-panel2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 ${m.statut === 'suspendu' ? 'bg-[rgba(224,96,78,.2)] text-[#f0a094]' : 'bg-sc-y2 text-white'}`}>
                      {m.initiales}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-bo-txt">{m.nom}</p>
                      <p className="text-xs text-bo-muted">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ROLE_STYLE[m.role] || ''}`}>{m.role}</span></td>
                <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.statut === 'actif' ? 'bg-[rgba(153,204,51,.12)] text-[#c0e07a]' : 'bg-[rgba(224,96,78,.12)] text-[#f0a094]'}`}>{m.statut}</span></td>
                <td className="px-4 py-3 text-xs text-bo-muted">{m.annonces > 0 ? `${m.annonces} annonce${m.annonces > 1 ? 's' : ''}` : ''}{m.candidatures > 0 ? `${m.candidatures} candidature${m.candidatures > 1 ? 's' : ''}` : ''}{m.annonces === 0 && m.candidatures === 0 ? 'Inactif' : ''}</td>
                <td className="px-4 py-3 text-xs text-bo-muted">{m.inscription}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button className="px-2.5 py-1.5 bg-bo-panel2 border border-bo-line rounded-lg text-[11px] text-bo-txt cursor-pointer hover:border-bo-muted transition-colors">Voir</button>
                    {m.statut === 'actif' ? (
                      <button className="px-2.5 py-1.5 bg-transparent border border-[rgba(226,181,58,.4)] text-[#e8c97a] rounded-lg text-[11px] cursor-pointer hover:bg-[rgba(226,181,58,.08)] transition-colors">Suspendre</button>
                    ) : (
                      <button className="px-2.5 py-1.5 bg-transparent border border-[rgba(153,204,51,.4)] text-[#c0e07a] rounded-lg text-[11px] cursor-pointer hover:bg-[rgba(153,204,51,.08)] transition-colors">Reactivier</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-bo-muted">
            <i className="ti ti-users-off text-3xl mb-2 block" />
            <p className="text-sm">Aucun membre trouve</p>
          </div>
        )}
      </div>
    </div>
  );
}
