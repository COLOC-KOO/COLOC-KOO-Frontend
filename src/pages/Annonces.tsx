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
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3 text-center">
          <h1 className="bebas text-2xl">
            <span className="text-[--brand-cyan-dark]">Annonces à </span>
            <span className="text-[--brand-green-dark]">Madagascar</span>
          </h1>
          <p className="text-muted-foreground text-xs">
            {loading ? "Chargement..." : `${listings.length} résultats valides`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Barre de recherche + filtres + info tri */}
        <div className="flex flex-wrap items-center gap-2 bg-card/30 rounded-xl px-4 py-2 border border-border">
          <div className="relative w-56 flex-shrink-0">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="input w-full pl-3 pr-8 py-1.5 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex items-center gap-1 text-xs font-medium border border-border rounded px-2 py-1 hover:bg-muted transition-colors whitespace-nowrap"
            >
              {getTypeLabel(type)}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTypeMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-1 z-20 w-40">
                {typeOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setType(opt.value);
                      setShowTypeMenu(false);
                    }}
                    className={`px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-muted flex items-center justify-between ${
                      type === opt.value ? "bg-muted" : ""
                    }`}
                  >
                    <span>{opt.label}</span>
                    {type === opt.value && (
                      <Check className="w-3 h-3 text-brand-cyan" />
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
              className="flex items-center gap-1 text-xs font-medium border border-border rounded px-2 py-1 hover:bg-muted transition-colors whitespace-nowrap"
            >
              {getColocLabel(colocFilter)}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showColocMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-1 z-20 w-48">
                {colocOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setColocFilter(opt.value);
                      setShowColocMenu(false);
                    }}
                    className={`px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-muted flex items-center justify-between ${
                      colocFilter === opt.value ? "bg-muted" : ""
                    }`}
                  >
                    <span>{opt.label}</span>
                    {colocFilter === opt.value && (
                      <Check className="w-3 h-3 text-brand-cyan" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-muted-foreground">
              Budget
            </label>
            <input
              type="range"
              min={0}
              max={1000000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-20 accent-brand-cyan"
            />
            <span className="text-xs tabular-nums min-w-[65px]">
              {maxPrice ? `${(maxPrice / 1000).toFixed(0)}k Ar` : "—"}
            </span>
          </div>

          {/* Services */}
          <div className="relative" ref={servicesRef}>
            <button
              onClick={() => setShowServicesMenu(!showServicesMenu)}
              className="flex items-center gap-1 text-xs font-medium border border-border rounded px-2 py-1 hover:bg-muted transition-colors whitespace-nowrap"
            >
              Services
              <ChevronDown className="w-3 h-3" />
              {selectedServiceIds.length > 0 && (
                <span className="ml-1 bg-brand-cyan text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {selectedServiceIds.length}
                </span>
              )}
            </button>
            {showServicesMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-2 z-20 w-48 max-h-60 overflow-y-auto">
                {services
                  .filter((s) => s.est_actif === 1)
                  .map((service) => (
                    <label
                      key={service.id_service}
                      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(
                          service.id_service,
                        )}
                        onChange={() => toggleService(service.id_service)}
                        className="accent-brand-cyan"
                      />
                      <span>{service.nom}</span>
                    </label>
                  ))}
                {services.filter((s) => s.est_actif === 1).length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-1">
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
              className="flex items-center gap-1 text-xs font-medium border border-border rounded px-2 py-1 hover:bg-muted transition-colors whitespace-nowrap"
            >
              {getCityLabel(city)}
              <ChevronDown className="w-3 h-3" />
            </button>
            {showCityMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg p-1 z-20 w-44 max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    setCity("");
                    setShowCityMenu(false);
                  }}
                  className={`px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-muted flex items-center justify-between ${
                    city === "" ? "bg-muted" : ""
                  }`}
                >
                  <span>Toutes les villes</span>
                  {city === "" && <Check className="w-3 h-3 text-brand-cyan" />}
                </div>
                {citiesList.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCity(c);
                      setShowCityMenu(false);
                    }}
                    className={`px-2 py-1.5 rounded cursor-pointer text-sm hover:bg-muted flex items-center justify-between ${
                      city === c ? "bg-muted" : ""
                    }`}
                  >
                    <span>{c}</span>
                    {city === c && (
                      <Check className="w-3 h-3 text-brand-cyan" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info tri (déplacée ici) */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
            <MapPin className="w-3 h-3" />
            <span>Résultats triés par date de validation</span>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs text-brand-cyan-dark font-semibold hover:underline ml-auto whitespace-nowrap"
          >
            Réinitialiser
          </button>
        </div>

        {/* Liste des annonces */}
        <div className="mt-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center text-muted-foreground py-20">
              Chargement des annonces...
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="text-center text-muted-foreground py-20">
              Aucune annonce validée pour le moment.
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
