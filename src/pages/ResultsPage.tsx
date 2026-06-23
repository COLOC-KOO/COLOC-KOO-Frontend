import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import AnnonceCard from '../components/AnnonceCard';
import { ANNONCES, VILLES } from '../data/annonces';

type SortBy = 'recente' | 'asc' | 'desc' | 'dispo';
type ViewMode = 'carte' | 'liste';

const SERVICES_LIST = [
  'Femme de ménage', 'Gardien', 'Jardinier', 'Porteurs d\'eau',
  'Parking voiture', 'Connexion internet', 'Eau courante',
  'Surpresseur', 'Balcon', 'Jardin', 'Piscine', 'Machine à laver',
];
const REGLES_LIST = ['Filles uniquement', 'Garçons uniquement', 'Enfants acceptés', 'Animaux acceptés'];

export default function ResultsPage() {
  const [params] = useSearchParams();
  const query = params.get('q') || 'Antananarivo';
  const typeParam = params.get('type') as 'coloc' | 'proprio' | null;

  const [view, setView] = useState<ViewMode>('liste');
  const [sortBy, setSortBy] = useState<SortBy>('recente');
  const [filterType, setFilterType] = useState<'all' | 'coloc' | 'proprio'>('all');
  const [filterServices, setFilterServices] = useState<string[]>([]);
  const [filterRegles, setFilterRegles] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...ANNONCES];
    if (query && query !== 'Antananarivo') {
      list = list.filter(a =>
        a.ville.toLowerCase().includes(query.toLowerCase()) ||
        a.quartier.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (typeParam) list = list.filter(a => a.type === typeParam);
    if (filterType !== 'all') list = list.filter(a => a.type === filterType);
    if (budgetMin) list = list.filter(a => a.prix >= parseInt(budgetMin));
    if (budgetMax) list = list.filter(a => a.prix <= parseInt(budgetMax));
    if (filterServices.length > 0) {
      list = list.filter(a => filterServices.every(s => a.services.includes(s)));
    }
    if (filterRegles.length > 0) {
      list = list.filter(a => filterRegles.some(r => a.regles.includes(r)));
    }

    if (sortBy === 'asc') list.sort((a, b) => a.prix - b.prix);
    else if (sortBy === 'desc') list.sort((a, b) => b.prix - a.prix);

    return list;
  }, [query, typeParam, filterType, filterServices, filterRegles, budgetMin, budgetMax, sortBy]);

  const toggleService = (s: string) =>
    setFilterServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  const toggleRegle = (r: string) =>
    setFilterRegles(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const activeFiltersCount = [
    filterType !== 'all',
    filterServices.length > 0,
    filterRegles.length > 0,
    budgetMin || budgetMax,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-sc-bg flex flex-col">
      {/* Filters bar */}
      <div className="bg-white border-b border-sc-bd px-4 py-2 flex items-center gap-2 flex-wrap sticky top-14 z-30">
        <span className="text-xs font-bold text-sc-dark flex items-center gap-1">
          <i className="ti ti-adjustments-horizontal text-sm" /> Filtres
          {activeFiltersCount > 0 && (
            <span className="ml-1 bg-sc-cy text-white text-[10px] font-bold px-1.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </span>
        <div className="w-px h-4 bg-sc-bd" />

        {/* Type filter */}
        <DropdownPill
          label="Tous types"
          icon="ti-home"
          isOpen={openDrop === 'type'}
          onToggle={() => setOpenDrop(v => v === 'type' ? null : 'type')}
          active={filterType !== 'all'}
        >
          <p className="text-[11px] font-bold text-sc-gr2 mb-2">Type de colocation</p>
          {[
            { v: 'all', l: 'Tous types' },
            { v: 'coloc', l: 'Colocation existante' },
            { v: 'proprio', l: 'Colocation à créer' },
          ].map(opt => (
            <label key={opt.v} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
              <input
                type="radio"
                name="type"
                checked={filterType === opt.v as any}
                onChange={() => setFilterType(opt.v as any)}
                className="accent-sc-cy"
              />
              {opt.l}
            </label>
          ))}
        </DropdownPill>

        {/* Budget */}
        <DropdownPill
          label="Budget"
          icon="ti-coin"
          isOpen={openDrop === 'budget'}
          onToggle={() => setOpenDrop(v => v === 'budget' ? null : 'budget')}
          active={!!(budgetMin || budgetMax)}
        >
          <p className="text-[11px] font-bold text-sc-gr2 mb-2">Loyer mensuel (Ar)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={budgetMin}
              onChange={e => setBudgetMin(e.target.value)}
              className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
              step={10000}
            />
            <span className="text-sc-gr2">—</span>
            <input
              type="number"
              placeholder="Max"
              value={budgetMax}
              onChange={e => setBudgetMax(e.target.value)}
              className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
              step={10000}
            />
          </div>
        </DropdownPill>

        {/* Services */}
        <DropdownPill
          label="Services"
          icon="ti-sparkles"
          isOpen={openDrop === 'services'}
          onToggle={() => setOpenDrop(v => v === 'services' ? null : 'services')}
          active={filterServices.length > 0}
          minWidth={220}
        >
          <p className="text-[11px] font-bold text-sc-gr2 mb-2">Services inclus</p>
          <div className="space-y-1">
            {SERVICES_LIST.map(s => (
              <label key={s} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={filterServices.includes(s)}
                  onChange={() => toggleService(s)}
                  className="accent-sc-cy"
                />
                {s}
              </label>
            ))}
          </div>
        </DropdownPill>

        {/* Règles */}
        <DropdownPill
          label="Règles"
          icon="ti-shield-check"
          isOpen={openDrop === 'regles'}
          onToggle={() => setOpenDrop(v => v === 'regles' ? null : 'regles')}
          active={filterRegles.length > 0}
        >
          <p className="text-[11px] font-bold text-sc-gr2 mb-2">Règles de la colocation</p>
          <div className="space-y-1">
            {REGLES_LIST.map(r => (
              <label key={r} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                <input
                  type="checkbox"
                  checked={filterRegles.includes(r)}
                  onChange={() => toggleRegle(r)}
                  className="accent-sc-cy"
                />
                {r}
              </label>
            ))}
          </div>
        </DropdownPill>

        <div className="w-px h-4 bg-sc-bd" />

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden border border-sc-bd">
          {([['carte', 'ti-map-2', 'Carte'], ['liste', 'ti-list', 'Liste']] as const).map(([v, icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold border-none cursor-pointer transition-colors ${
                view === v ? 'bg-sc-cy text-white' : 'bg-white text-sc-gr1 hover:bg-gray-50'
              }`}
            >
              <i className={`ti ${icon} text-xs`} /> {label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortBy)}
          className="text-xs border border-sc-bd rounded-lg px-2 py-1.5 text-sc-dark bg-white outline-none cursor-pointer"
        >
          <option value="recente">Plus récente</option>
          <option value="dispo">Dispo le plus tôt</option>
          <option value="asc">Prix croissant</option>
          <option value="desc">Prix décroissant</option>
        </select>

        {/* Alert pill */}
        <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 border border-sc-bd rounded-xl text-xs text-sc-dark hover:bg-sc-cy-lt hover:border-sc-cy transition-colors cursor-pointer bg-white">
          <i className="ti ti-bell-plus text-xs" />
          Créer une alerte · <strong>{query}</strong>
        </button>
      </div>

      {/* Content */}
      {view === 'liste' ? (
        <div className="flex-1 px-4 py-5">
          <div className="mb-4">
            <h1 className="font-bebas text-2xl text-sc-dark tracking-wide">
              Annonces récentes — {query.toUpperCase()}
            </h1>
            <p className="text-xs text-sc-gr2">{filtered.length} logement{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}</p>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <i className="ti ti-map-search text-5xl text-sc-gr2 mb-4 block" />
              <h3 className="font-bebas text-xl text-sc-dark mb-2">Aucune annonce trouvée</h3>
              <p className="text-sm text-sc-gr2 mb-4">Essayez de modifier vos filtres</p>
              <button
                onClick={() => { setFilterType('all'); setFilterServices([]); setFilterRegles([]); setBudgetMin(''); setBudgetMax(''); }}
                className="px-4 py-2 bg-sc-cy text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-sc-cy-d transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map(a => (
                <AnnonceCard key={a.id} annonce={a} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Map */}
          <div className="lg:flex-1 h-96 lg:h-auto relative bg-[#e4edd8] overflow-hidden">
            <svg width="100%" height="100%" viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
              <rect width="1000" height="800" fill="#e4edd8"/>
              <ellipse cx="500" cy="400" rx="420" ry="340" fill="#d8e8c8" opacity=".6"/>
              <path d="M0 400 Q250 375 500 400 Q750 425 1000 400" stroke="#fff" strokeWidth="8" fill="none"/>
              <path d="M500 0 Q490 200 500 400 Q510 600 500 800" stroke="#fff" strokeWidth="8" fill="none"/>
              <path d="M0 240 Q280 260 500 400 Q720 540 1000 560" stroke="#fff" strokeWidth="5" fill="none" opacity=".8"/>
              <path d="M0 600 Q260 575 500 400 Q740 225 1000 200" stroke="#fff" strokeWidth="5" fill="none" opacity=".8"/>
              {/* District labels */}
              {[
                { x: 500, y: 397, label: 'ANALAKELY', fw: '700' },
                { x: 207, y: 238, label: 'ANKADIFOTSY', fw: '600' },
                { x: 757, y: 493, label: 'MASINANDRIANA', fw: '400' },
                { x: 670, y: 256, label: 'IVANDRY', fw: '400' },
                { x: 302, y: 560, label: 'AMPEFILOHA', fw: '400' },
              ].map(d => (
                <text key={d.label} x={d.x} y={d.y} fontFamily="Arial" fontSize="13" fill="#555" textAnchor="middle" fontWeight={d.fw}>
                  {d.label}
                </text>
              ))}
            </svg>

            {/* Pins */}
            {filtered.filter(a => a.pinX).map(a => (
              <div
                key={a.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ left: `${(a.pinX! / 1000) * 100}%`, top: `${(a.pinY! / 800) * 100}%` }}
              >
                <div className="bg-sc-dark text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg hover:bg-sc-cy transition-colors whitespace-nowrap">
                  {(a.prix / 1000).toFixed(0)} 000 Ar
                </div>
              </div>
            ))}

            {/* Map credit */}
            <div className="absolute bottom-2 right-2 text-[10px] text-sc-gr1 bg-white/70 px-2 py-0.5 rounded">
              Représentation schématique
            </div>
          </div>

          {/* Side list */}
          <div className="lg:w-96 overflow-y-auto border-t lg:border-t-0 lg:border-l border-sc-bd">
            <div className="p-3 border-b border-sc-bd">
              <p className="text-sm font-bold text-sc-dark">{filtered.length} annonces · {query}</p>
            </div>
            <div className="p-3 space-y-2">
              {filtered.map(a => (
                <AnnonceCard key={a.id} annonce={a} compact />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable dropdown pill
interface DropdownPillProps {
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  active?: boolean;
  minWidth?: number;
  children: React.ReactNode;
}

function DropdownPill({ label, icon, isOpen, onToggle, active, minWidth = 180, children }: DropdownPillProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
          active
            ? 'border-sc-cy bg-sc-cy-lt text-[#2a7a90]'
            : isOpen
            ? 'border-sc-cy bg-white text-sc-dark'
            : 'border-sc-bd bg-white text-sc-dark hover:border-sc-cy'
        }`}
      >
        <i className={`ti ${icon} text-xs`} />
        {label}
        <i className={`ti ti-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div
          className="absolute top-[calc(100%+6px)] left-0 bg-white border border-gray-200 rounded-xl shadow-sc-lg z-50 p-3"
          style={{ minWidth }}
        >
          {children}
          <button
            onClick={onToggle}
            className="mt-3 w-full bg-sc-cy text-white text-xs font-bold py-1.5 rounded-lg border-none cursor-pointer hover:bg-sc-cy-d transition-colors"
          >
            Appliquer
          </button>
        </div>
      )}
    </div>
  );
}
