import React, { useEffect, useMemo, useState, useRef } from "react";
import { MapPin, Search, X, ChevronDown, Check } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SiteLayout } from "../components/site/SiteLayout";
import { ListingCard } from "../components/site/ListingCard";
import { api, annonceToListing, ApiServiceCkoo, Ville } from "../lib/api";
import { Listing } from "../types";

const typeOptions = [
  { value: "", label: "Tous types" },
  { value: "chambre", label: "Chambre" },
  { value: "appartement", label: "Appartement" },
  { value: "maison", label: "Maison" },
];

const colocOptions = [
  { value: "", label: "Tous" },
  { value: "existantes", label: "Colocataires existantes" },
  { value: "a_creer", label: "Colocataires à créer" },
];

export default function Annonces() {
  const location = useLocation();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [maxPrice, setMaxPrice] = useState(0);
  const [query, setQuery] = useState("");
  const [colocFilter, setColocFilter] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [services, setServices] = useState<ApiServiceCkoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showColocMenu, setShowColocMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const colocRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get("q") || "";
    const urlType = params.get("type") || "";
    const urlCity = params.get("ville") || params.get("city") || "";
    const urlColoc = params.get("coloc") || "";
    const urlServices =
      params.get("services")?.split(",").map(Number).filter(Boolean) || [];
    const urlMaxPrice = Number(params.get("maxPrice") || 0);

    setQuery(urlQuery);
    setType(urlType);
    setCity(urlCity);
    setColocFilter(urlColoc);
    setSelectedServiceIds(urlServices);
    setMaxPrice(urlMaxPrice);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params: any = {
      statut: "active",
      ville: city || undefined,
      type: type || undefined,
      maxPrice: maxPrice || undefined,
      q: query || undefined,
      coloc: colocFilter || undefined,
    };
    if (selectedServiceIds.length > 0) {
      params.service = selectedServiceIds.join(",");
    }

    Promise.all([
      api.annonces(params),
      api.villes().catch(() => []),
      api.services().catch(() => []),
    ])
      .then(([annonces, villesList, servicesList]) => {
        setListings(annonces.map(annonceToListing));
        setVilles(villesList);
        setServices(Array.isArray(servicesList) ? servicesList : []);
      })
      .catch((err) =>
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les annonces",
        ),
      )
      .finally(() => setLoading(false));
  }, [city, type, selectedServiceIds, maxPrice, query, colocFilter]);

  const citiesList = useMemo(() => {
    const fromDb = villes.map((v) => v.nom_ville);
    const fromListings = listings.map((l) => l.city);
    return [...new Set([...fromDb, ...fromListings])];
  }, [listings, villes]);

  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const resetFilters = () => {
    setCity("");
    setType("");
    setSelectedServiceIds([]);
    setMaxPrice(0);
    setQuery("");
    setColocFilter("");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeRef.current && !typeRef.current.contains(e.target as Node))
        setShowTypeMenu(false);
      if (colocRef.current && !colocRef.current.contains(e.target as Node))
        setShowColocMenu(false);
      if (
        servicesRef.current &&
        !servicesRef.current.contains(e.target as Node)
      )
        setShowServicesMenu(false);
      if (cityRef.current && !cityRef.current.contains(e.target as Node))
        setShowCityMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTypeLabel = (val: string) =>
    typeOptions.find((t) => t.value === val)?.label || "Tous types";
  const getColocLabel = (val: string) =>
    colocOptions.find((c) => c.value === val)?.label || "Tous";
  const getCityLabel = (val: string) => val || "Toutes les villes";

  return (
    <SiteLayout>
      <div className="relative bg-white border-b border-border overflow-hidden">
        {/* Image de fond */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay pour assurer la lisibilité */}
          <div className="absolute inset-0 bg-black/60 backdrop-sm"></div>
        </div>

        {/* Contenu - hauteur agrandie */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-center min-h-[180px] flex flex-col items-center justify-center">
          <h1 className="bebas text-4xl md:text-5xl">
            <span className="text-[--brand-cyan-dark] drop-shadow-lg">Annonces à </span>
            <span className="text-[--brand-green-dark] drop-shadow-lg">Madagascar</span>
          </h1>
          <p className="text-white/80 text-sm md:text-base drop-shadow mt-2">
            {loading ? "Chargement..." : `${listings.length} résultats valides`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Barre de recherche - Style Airbnb pur */}
        <div className="bg-white rounded-full border border-gray-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_20px_rgba(0,0,0,0.08)] transition-all duration-300 px-3 py-1.5 flex flex-wrap items-center gap-1">
          {/* Champ de recherche */}
          <div className="relative flex-1 min-w-[140px]">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Où voulez-vous aller ?"
              className="w-full pl-5 pr-8 py-2.5 text-sm bg-transparent border-none focus:ring-0 placeholder:text-gray-500 font-medium text-gray-800"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Séparateur vertical */}
          <div className="hidden sm:block w-px h-7 bg-gray-200"></div>

          {/* Filtres - Style boutons pilules Airbnb */}
          <div className="flex flex-wrap items-center gap-0.5">
            {/* Type d'annonce */}
            <div className="relative" ref={typeRef}>
              <button
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-full hover:bg-gray-100/80 transition-colors whitespace-nowrap"
              >
                {getTypeLabel(type)}
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {showTypeMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-48">
                  {typeOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setType(opt.value);
                        setShowTypeMenu(false);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${type === opt.value ? "bg-gray-50" : ""
                        }`}
                    >
                      <span>{opt.label}</span>
                      {type === opt.value && (
                        <Check className="w-4 h-4 text-[#FF385C]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Colocataires */}
            <div className="relative" ref={colocRef}>
              <button
                onClick={() => setShowColocMenu(!showColocMenu)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-full hover:bg-gray-100/80 transition-colors whitespace-nowrap"
              >
                {getColocLabel(colocFilter)}
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {showColocMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-52">
                  {colocOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setColocFilter(opt.value);
                        setShowColocMenu(false);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${colocFilter === opt.value ? "bg-gray-50" : ""
                        }`}
                    >
                      <span>{opt.label}</span>
                      {colocFilter === opt.value && (
                        <Check className="w-4 h-4 text-[#FF385C]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-sm font-medium text-gray-700">Budget</span>
              <div className="relative">
                <input
                  type="range"
                  min={0}
                  max={1000000}
                  step={50000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-28 accent-[#FF385C] h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #FF385C 0%, #FF385C ${(maxPrice / 1000000) * 100
                      }%, #E5E7EB ${(maxPrice / 1000000) * 100}%, #E5E7EB 100%)`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 min-w-[70px]">
                {maxPrice ? `${(maxPrice / 1000).toFixed(0)}k Ar` : "—"}
              </span>
            </div>

            {/* Services */}
            <div className="relative" ref={servicesRef}>
              <button
                onClick={() => setShowServicesMenu(!showServicesMenu)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-full hover:bg-gray-100/80 transition-colors whitespace-nowrap"
              >
                Services
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                {selectedServiceIds.length > 0 && (
                  <span className="ml-1 bg-[#FF385C] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {selectedServiceIds.length}
                  </span>
                )}
              </button>
              {showServicesMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-3 z-20 w-56 max-h-64 overflow-y-auto">
                  {services
                    .filter((s) => s.est_actif === 1)
                    .map((service) => (
                      <label
                        key={service.id_service}
                        className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 cursor-pointer text-sm transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(service.id_service)}
                          onChange={() => toggleService(service.id_service)}
                          className="w-4 h-4 accent-[#FF385C] rounded-md"
                        />
                        <span>{service.nom}</span>
                      </label>
                    ))}
                  {services.filter((s) => s.est_actif === 1).length === 0 && (
                    <div className="text-sm text-gray-500 px-2 py-3 text-center">
                      Aucun service actif
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ville */}
            <div className="relative" ref={cityRef}>
              <button
                onClick={() => setShowCityMenu(!showCityMenu)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 px-4 py-2.5 rounded-full hover:bg-gray-100/80 transition-colors whitespace-nowrap"
              >
                {getCityLabel(city)}
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>
              {showCityMenu && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200/80 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-52 max-h-64 overflow-y-auto">
                  <div
                    onClick={() => {
                      setCity("");
                      setShowCityMenu(false);
                    }}
                    className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${city === "" ? "bg-gray-50" : ""
                      }`}
                  >
                    <span>Toutes les villes</span>
                    {city === "" && <Check className="w-4 h-4 text-[#FF385C]" />}
                  </div>
                  {citiesList.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setCity(c);
                        setShowCityMenu(false);
                      }}
                      className={`px-3.5 py-2.5 rounded-xl cursor-pointer text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${city === c ? "bg-gray-50" : ""
                        }`}
                    >
                      <span>{c}</span>
                      {city === c && <Check className="w-4 h-4 text-[#FF385C]" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Réinitialiser */}
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-[#FF385C] px-4 py-2.5 rounded-full hover:bg-red-50/50 transition-colors whitespace-nowrap"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Compteur de résultats */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>
              {loading
                ? "Recherche en cours..."
                : `${listings.length} résultat${listings.length > 1 ? "s" : ""} trouvé${listings.length > 1 ? "s" : ""
                }`}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {!loading && listings.length > 0 && "📍 Madagascar"}
          </div>
        </div>

        {/* Grille d'annonces */}
        <div className="mt-5">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50/80 p-5 text-sm text-red-700 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-[4/3] w-full"></div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {listings.map((l, index) => (
                <div
                  key={l.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <ListingCard l={l} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-medium text-gray-700">Aucune annonce trouvée</h3>
              <p className="text-gray-500 mt-1 text-sm">
                Essayez de modifier vos filtres de recherche
              </p>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
