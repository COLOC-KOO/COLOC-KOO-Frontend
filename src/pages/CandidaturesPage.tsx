import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

type CandidatureStatut = 'constituee' | 'en_attente' | 'acceptee' | 'refusee';
type MembreStatut = 'accepte' | 'en_attente' | 'refuse';

type ApiCandidature = {
  id_candidature: number;
  id_annonce: number;
  titre: string;
  quartier: string;
  prix_loyer?: number;
  statut: CandidatureStatut;
  date_creation: string;
  message?: string | null;
  membres?: string | null;
};

const DEMO_CANDIDATURES: Array<{
  id: string; annonceId: number; titre: string; quartier: string; prix: number;
  statut: CandidatureStatut; datePostulation: string;
  equipe: Array<{initiales: string; nom: string; statut: MembreStatut}>;
  message: string;
}> = [
  {
    id: 'c1',
    annonceId: 1,
    titre: 'Belle maison avec jardin - Ankadifotsy',
    quartier: 'Ankadifotsy',
    prix: 810000,
    statut: 'constituee',
    datePostulation: '10 juin 2025',
    equipe: [
      { initiales: 'RA', nom: 'Rakoto A.', statut: 'accepte' },
      { initiales: 'HR', nom: 'Hery R.', statut: 'accepte' },
      { initiales: 'MT', nom: 'Miora T.', statut: 'accepte' },
      { initiales: '?', nom: 'Place libre', statut: 'en_attente' },
    ],
    message: 'Bonjour, je suis developpeur web, calme et ordonne. Je cherche une coloc serieuse dans un cadre agreable.',
  },
  {
    id: 'c2',
    annonceId: 2,
    titre: 'Appart moderne pres INSCAE',
    quartier: 'Analakely',
    prix: 280000,
    statut: 'en_attente',
    datePostulation: '12 juin 2025',
    equipe: [
      { initiales: 'RA', nom: 'Rakoto A.', statut: 'accepte' as MembreStatut },
      { initiales: 'LN', nom: 'Lalaina N.', statut: 'en_attente' as MembreStatut },
      { initiales: 'MV', nom: 'Mamy V.', statut: 'accepte' as MembreStatut },
    ],
    message: 'Etudiant en derniere annee, serieux et respectueux des regles de vie commune.',
  },
  {
    id: 'c3',
    annonceId: 4,
    titre: 'Villa avec piscine - Iavoloha',
    quartier: 'Iavoloha',
    prix: 420000,
    statut: 'refusee' as CandidatureStatut,
    datePostulation: '5 juin 2025',
    equipe: [],
    message: '',
  },
];

const STATUTS = {
  constituee: { label: 'Coloc constituee', color: 'bg-sc-g-lt text-[#4a7020]', icon: 'ti-circle-check' },
  en_attente: { label: 'En attente', color: 'bg-amber-50 text-amber-700', icon: 'ti-clock' },
  acceptee: { label: 'Acceptee', color: 'bg-sc-cy-lt text-[#2a7a90]', icon: 'ti-thumb-up' },
  refusee: { label: 'Refusee', color: 'bg-red-50 text-red-600', icon: 'ti-x' },
};

function mapRemoteCandidatures(rows: ApiCandidature[]) {
  return rows.map(row => ({
    id: String(row.id_candidature),
    annonceId: row.id_annonce,
    titre: row.titre,
    quartier: row.quartier,
    prix: row.prix_loyer || 0,
    statut: row.statut,
    datePostulation: new Date(row.date_creation).toLocaleDateString('fr-FR'),
    equipe: row.membres ? row.membres.split('||').map(member => {
      const [label, status = 'en_attente'] = member.split('::');
      const parts = label.split(' ');
      return {
        initiales: `${parts[0]?.[0] || ''}${parts[1]?.[0] || parts[0]?.[1] || ''}`.toUpperCase(),
        nom: label,
        statut: (status as MembreStatut) || 'en_attente',
      };
    }) : [],
    message: row.message || '',
  }));
}

export default function CandidaturesPage() {
  const { auth, token, setShowAuthModal, setAuthModalTab } = useApp();
  const [activeTab, setActiveTab] = useState<'mes_candidatures' | 'en_cours' | 'archivees'>('mes_candidatures');
  const [openId, setOpenId] = useState<string | null>('c1');
  const [items, setItems] = useState(DEMO_CANDIDATURES);

  useEffect(() => {
    if (!token) return;
    api.candidatures.listMine(token)
      .then(rows => {
        if (Array.isArray(rows) && rows.length > 0) {
          setItems(mapRemoteCandidatures(rows as ApiCandidature[]));
        }
      })
      .catch(() => null);
  }, [token]);

  if (auth === 'guest') {
    return (
      <div className="min-h-screen bg-sc-bg flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-sc-bd">
          <i className="ti ti-file-text text-4xl text-sc-cy block mb-4" />
          <h2 className="font-bebas text-2xl text-sc-dark mb-2">Mes candidatures</h2>
          <p className="text-sm text-sc-gr1 mb-5">Connecte-toi pour voir tes candidatures et suivre l'etat de tes demandes.</p>
          <button
            onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
            className="w-full bg-sc-cy text-white border-none rounded-xl py-3 text-sm font-bold cursor-pointer hover:bg-sc-cy-d"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  const filtered = items.filter(c => {
    if (activeTab === 'en_cours') return c.statut === 'en_attente' || c.statut === 'constituee';
    if (activeTab === 'archivees') return c.statut === 'refusee' || c.statut === 'acceptee';
    return true;
  });

  return (
    <div className="min-h-screen bg-sc-bg">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-bebas text-2xl text-sc-dark tracking-wide">Mes candidatures</h1>
            <p className="text-xs text-sc-gr2">{items.length} candidature(s) au total</p>
          </div>
          <Link to="/recherche" className="flex items-center gap-1.5 px-3.5 py-2 bg-sc-cy text-white rounded-xl text-xs font-bold no-underline hover:bg-sc-cy-d transition-colors">
            <i className="ti ti-search text-sm" />
            Nouvelles annonces
          </Link>
        </div>

        <div className="flex gap-1 mb-4 bg-white rounded-xl p-1 border border-sc-bd w-fit">
          {[
            { v: 'mes_candidatures', l: 'Toutes', count: items.length },
            { v: 'en_cours', l: 'En cours', count: items.filter(c => ['en_attente','constituee'].includes(c.statut)).length },
            { v: 'archivees', l: 'Archivees', count: items.filter(c => ['refusee','acceptee'].includes(c.statut)).length },
          ].map(tab => (
            <button
              key={tab.v}
              onClick={() => setActiveTab(tab.v as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border-none transition-colors ${
                activeTab === tab.v ? 'bg-sc-cy text-white' : 'bg-transparent text-sc-gr1 hover:text-sc-dark'
              }`}
            >
              {tab.l}
              <span className={`text-[10px] px-1.5 rounded-full font-bold ${activeTab === tab.v ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-sc-bd">
            <i className="ti ti-file-off text-4xl text-sc-gr2 mb-3 block" />
            <p className="text-sm font-bold text-sc-dark mb-1">Aucune candidature</p>
            <p className="text-xs text-sc-gr2">Explorez les annonces pour trouver votre coloc ideale</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => {
              const statut = STATUTS[c.statut];
              const isOpen = openId === c.id;

              return (
                <div key={c.id} className="bg-white rounded-2xl border border-sc-bd overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenId(isOpen ? null : c.id)}
                    className="w-full flex items-center gap-3 p-4 text-left cursor-pointer border-none bg-transparent hover:bg-gray-50 transition-colors"
                  >
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold flex-shrink-0 ${statut.color}`}>
                      <i className={`ti ${statut.icon} text-xs`} />
                      {statut.label}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-sc-dark truncate">{c.titre}</p>
                      <p className="text-xs text-sc-gr2">{c.quartier} · {c.prix.toLocaleString('fr-FR')} Ar/mois · postule le {c.datePostulation}</p>
                    </div>
                    <i className={`ti ti-chevron-down text-sc-gr2 text-sm transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-sc-bd">
                      {c.equipe.length > 0 && (
                        <div className="mt-3 mb-3">
                          <p className="text-xs font-bold text-sc-dark mb-2 flex items-center gap-1">
                            <i className="ti ti-users text-sc-cy text-sm" />
                            Equipe de colocataires
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {c.equipe.map((m, i) => (
                              <div key={i} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs border ${
                                m.statut === 'accepte' ? 'bg-sc-g-lt border-[rgba(153,204,51,0.3)]' :
                                m.statut === 'refuse' ? 'bg-red-50 border-red-100' :
                                'bg-gray-50 border-sc-bd'
                              }`}>
                                <div className={`w-6 h-6 rounded-full font-bold text-[10px] flex items-center justify-center ${
                                  m.statut === 'accepte' ? 'bg-sc-y2 text-white' :
                                  m.statut === 'refuse' ? 'bg-red-400 text-white' :
                                  'bg-gray-200 text-gray-600'
                                }`}>
                                  {m.initiales}
                                </div>
                                <span className="font-bold text-sc-dark">{m.nom}</span>
                                <i className={`ti ${m.statut === 'accepte' ? 'ti-check text-sc-y2' : m.statut === 'refuse' ? 'ti-x text-red-400' : 'ti-clock text-amber-500'} text-xs`} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {c.statut === 'constituee' && (
                        <div className="mb-3 p-3 bg-sc-g-lt border border-[rgba(153,204,51,0.3)] rounded-xl">
                          <p className="text-xs font-bold text-[#4a7020] flex items-center gap-1">
                            <i className="ti ti-party-popper text-sm" />
                            Colocation constituee ! Prochaine etape : signature du bail.
                          </p>
                        </div>
                      )}

                      {c.message && (
                        <div className="mb-3">
                          <p className="text-xs font-bold text-sc-dark mb-1">Votre message de candidature</p>
                          <p className="text-xs text-sc-gr1 bg-gray-50 rounded-xl p-3 italic">"{c.message}"</p>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <Link
                          to={`/annonce/${c.annonceId}`}
                          className="flex items-center gap-1.5 px-3 py-2 bg-sc-cy-lt text-[#2a7a90] text-xs font-bold rounded-xl no-underline hover:bg-sc-cy hover:text-white transition-colors border border-[rgba(70,189,214,0.3)]"
                        >
                          <i className="ti ti-eye text-xs" />
                          Voir l'annonce
                        </Link>
                        {c.statut === 'en_attente' && (
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-sc-g-lt text-[#4a7020] text-xs font-bold rounded-xl cursor-pointer border border-[rgba(153,204,51,0.3)] hover:bg-sc-y2 hover:text-white transition-colors">
                            <i className="ti ti-message text-xs" />
                            Contacter
                          </button>
                        )}
                        {c.statut === 'refusee' && (
                          <button className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-sc-gr1 text-xs font-bold rounded-xl cursor-pointer border border-sc-bd hover:bg-gray-200 transition-colors">
                            <i className="ti ti-trash text-xs" />
                            Archiver
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 p-4 bg-gradient-to-br from-sc-cy-lt to-sc-g-lt rounded-2xl border border-[rgba(70,189,214,0.2)]">
          <p className="text-xs font-bold text-sc-dark mb-1 flex items-center gap-1">
            <i className="ti ti-bulb text-sc-cy text-sm" />
            Conseil
          </p>
          <p className="text-xs text-sc-gr1">Completez votre profil pour augmenter vos chances d'etre accepte. Les colocataires aiment les profils avec photo et description.</p>
          <Link to="/compte" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-sc-cy no-underline hover:underline">
            Completer mon profil <i className="ti ti-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </div>
  );
}