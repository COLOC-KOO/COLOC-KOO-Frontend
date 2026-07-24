import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { MapPin, Search, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react";
import { useLocation } from "react-router-dom";
import { SiteLayout } from "../components/site/SiteLayout";
import { ListingCard } from "../components/site/ListingCard";
import { api, annonceToListing, ApiServiceCkoo, Ville } from "../lib/api";
import { Listing } from "../types";

export default function Annonces() {
  const { t } = useTranslation(['annonces', 'common']);
  const location = useLocation();
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [showColocMenu, setShowColocMenu] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);

  const typeRef = useRef<HTMLDivElement>(null);
  const colocRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  const typeOptions = useMemo(() => [
    { value: "", label: t('annonces:filters.types.all') },
    { value: "chambre", label: t('annonces:filters.types.room') },
    { value: "appartement", label: t('annonces:filters.types.apartment') },
    { value: "maison", label: t('annonces:filters.types.house') },
  ], [t]);

  const colocOptions = useMemo(() => [
    { value: "", label: t('annonces:filters.coloc.all') },
    { value: "existantes", label: t('annonces:filters.coloc.existing') },
    { value: "a_creer", label: t('annonces:filters.coloc.create') },
  ], [t]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get("q") || "";
    const urlType = params.get("type") || "";
    const urlCity = params.get("ville") || params.get("city") || "";
    const urlDistrict = params.get("quartier") || params.get("district") || "";
    const urlColoc = params.get("coloc") || "";
    const urlServices =
      params.get("services")?.split(",").map(Number).filter(Boolean) || [];
    const urlMaxPrice = Number(params.get("maxPrice") || 0);

    setQuery(urlQuery);
    setType(urlType);
    setCity(urlCity);
    setDistrict(urlDistrict);
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
      quartier: district || undefined,
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
            : t('common:common.error'),
        ),
      )
      .finally(() => setLoading(false));
  }, [city, type, selectedServiceIds, maxPrice, query, colocFilter, t]);

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
    setDistrict("");
    setType("");
    setSelectedServiceIds([]);
    setMaxPrice(0);
    setQuery("");
    setColocFilter("");
    setShowMobileFilters(false);
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
    typeOptions.find((t) => t.value === val)?.label || t('annonces:filters.types.all');
  const getColocLabel = (val: string) =>
    colocOptions.find((c) => c.value === val)?.label || t('annonces:filters.coloc.all');
  const getCityLabel = (val: string) => val || t('annonces:filters.city.all');

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city) count++;
    if (district) count++;
    if (type) count++;
    if (selectedServiceIds.length > 0) count++;
    if (maxPrice > 0) count++;
    if (colocFilter) count++;
    return count;
  }, [city, district, type, selectedServiceIds, maxPrice, colocFilter]);

  // Composant filtres mobile avec les couleurs du thème
  const MobileFilters = () => (
    <div 
      className="lg:hidden fixed inset-0 z-50 bg-black/50" 
      onClick={() => setShowMobileFilters(false)}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-[var(--background)] rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--background)] z-10 px-4 py-4 border-b border-[var(--border)] flex items-center justify-between rounded-t-3xl">
          <h3 className="bebas text-xl text-[var(--foreground)]">
            {t('annonces:filters.title')}
          </h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-[var(--foreground)]" />
          </button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.types.title')}
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    type === opt.value
                      ? "bg-[var(--brand-cyan)] text-white shadow-md"
                      : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Coloc */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.coloc.title')}
            </label>
            <div className="flex flex-wrap gap-2">
              {colocOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColocFilter(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    colocFilter === opt.value
                      ? "bg-[var(--brand-cyan)] text-white shadow-md"
                      : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ville */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.city.title')}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-white focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/20 transition-all text-[var(--foreground)]"
            >
              <option value="">{t('annonces:filters.city.all')}</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Quartier */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.district.title')}
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t('annonces:filters.district.placeholder')}
              className="w-full px-4 py-2.5 border border-[var(--border)] rounded-xl text-sm bg-white focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/20 transition-all text-[var(--foreground)]"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.budget')}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={1000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="flex-1 accent-[var(--brand-cyan)] h-1.5 bg-[var(--border)] rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--brand-cyan) 0%, var(--brand-cyan) ${(maxPrice / 1000000) * 100}%, var(--border) ${(maxPrice / 1000000) * 100}%, var(--border) 100%)`,
                }}
              />
              <span className="text-sm font-semibold text-[var(--foreground)] min-w-[80px] text-right">
                {maxPrice ? `${(maxPrice / 1000).toFixed(0)}k Ar` : '0 Ar'}
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <label className="text-sm font-medium text-[var(--foreground)] block mb-2">
              {t('annonces:filters.services')}
            </label>
            <div className="flex flex-wrap gap-2">
              {services
                .filter((s) => s.est_actif === 1)
                .map((service) => (
                  <button
                    key={service.id_service}
                    onClick={() => toggleService(service.id_service)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedServiceIds.includes(service.id_service)
                        ? "bg-[var(--brand-cyan)] text-white shadow-md"
                        : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
                    }`}
                  >
                    {service.nom}
                  </button>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            >
              {t('common:common.reset')}
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-4 py-3 bg-[var(--brand-cyan)] text-white rounded-xl text-sm font-medium hover:bg-[var(--brand-cyan-dark)] transition-colors shadow-md"
            >
              {t('common:common.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SiteLayout>
      {/* Header avec image de fond - Aligné avec le header */}
      <div className="relative bg-white border-b border-[var(--border)] overflow-hidden min-h-[180px] md:min-h-[220px] w-full">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-sm"></div>
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-6 md:py-8 min-h-[180px] md:min-h-[220px] flex flex-col items-center justify-center">
          <h1 className="bebas text-3xl sm:text-4xl md:text-5xl text-center">
            <span className="text-[var(--brand-cyan)] drop-shadow-lg">
              {t('annonces:title').split(' ')[0]} à 
            </span>
            <span className="text-[var(--brand-green)] drop-shadow-lg"> Madagascar</span>
          </h1>
          <p className="text-white/80 text-xs sm:text-sm md:text-base drop-shadow mt-1">
            {loading ? t('common:common.loading') : `${listings.length} ${t('annonces:results')}`}
          </p>

          {/* Barre de recherche - Déplacée sous le titre, sans border-radius */}
          <div className="w-full max-w-3xl mt-4">
            <div className="bg-white/95 backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('annonces:search')}
                  className="w-full pl-4 pr-8 py-2.5 text-sm bg-transparent border-none focus:ring-0 placeholder:text-gray-500 font-medium text-gray-900"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700 transition-colors whitespace-nowrap relative"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden xs:inline">{t('annonces:filters.title')}</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--brand-cyan)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12 py-4 sm:py-6">
        {/* Filtres desktop - sans border-radius */}
        <div className="hidden lg:flex flex-wrap items-center gap-0.5 bg-white border border-[var(--border)] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-2">
          <div className="w-px h-7 bg-[var(--border)]"></div>

          {/* Type d'annonce */}
          <div className="relative" ref={typeRef}>
            <button
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] px-3 sm:px-4 py-2 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
            >
              {getTypeLabel(type)}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            </button>
            {showTypeMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[var(--border)] shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-48">
                {typeOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setType(opt.value);
                      setShowTypeMenu(false);
                    }}
                    className={`px-3.5 py-2.5 cursor-pointer text-sm hover:bg-[var(--muted)] flex items-center justify-between transition-colors text-[var(--foreground)] ${type === opt.value ? "bg-[var(--muted)]" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {type === opt.value && (
                      <Check className="w-4 h-4 text-[var(--brand-cyan)]" />
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
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] px-3 sm:px-4 py-2 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
            >
              {getColocLabel(colocFilter)}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            </button>
            {showColocMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[var(--border)] shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-52">
                {colocOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setColocFilter(opt.value);
                      setShowColocMenu(false);
                    }}
                    className={`px-3.5 py-2.5 cursor-pointer text-sm hover:bg-[var(--muted)] flex items-center justify-between transition-colors text-[var(--foreground)] ${colocFilter === opt.value ? "bg-[var(--muted)]" : ""}`}
                  >
                    <span>{opt.label}</span>
                    {colocFilter === opt.value && (
                      <Check className="w-4 h-4 text-[var(--brand-cyan)]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5">
            <span className="text-sm font-medium text-[var(--foreground)] hidden sm:inline">
              {t('annonces:filters.budget')}
            </span>
            <div className="relative">
              <input
                type="range"
                min={0}
                max={1000000}
                step={50000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-20 sm:w-28 accent-[var(--brand-cyan)] h-1 bg-[var(--border)] appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--brand-cyan) 0%, var(--brand-cyan) ${(maxPrice / 1000000) * 100}%, var(--border) ${(maxPrice / 1000000) * 100}%, var(--border) 100%)`,
                }}
              />
            </div>
            <span className="text-sm font-medium text-[var(--foreground)] min-w-[60px] sm:min-w-[70px]">
              {maxPrice ? `${(maxPrice / 1000).toFixed(0)}k` : t('annonces:filters.budget')}
            </span>
          </div>

          {/* Services */}
          <div className="relative" ref={servicesRef}>
            <button
              onClick={() => setShowServicesMenu(!showServicesMenu)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] px-3 sm:px-4 py-2 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
            >
              {t('annonces:filters.services')}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
              {selectedServiceIds.length > 0 && (
                <span className="ml-1 bg-[var(--brand-cyan)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center">
                  {selectedServiceIds.length}
                </span>
              )}
            </button>
            {showServicesMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[var(--border)] shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-3 z-20 w-56 max-h-64 overflow-y-auto">
                {services
                  .filter((s) => s.est_actif === 1)
                  .map((service) => (
                    <label
                      key={service.id_service}
                      className="flex items-center gap-3 px-2 py-2.5 hover:bg-[var(--muted)] cursor-pointer text-sm transition-colors text-[var(--foreground)]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id_service)}
                        onChange={() => toggleService(service.id_service)}
                        className="w-4 h-4 accent-[var(--brand-cyan)]"
                      />
                      <span>{service.nom}</span>
                    </label>
                  ))}
                {services.filter((s) => s.est_actif === 1).length === 0 && (
                  <div className="text-sm text-[var(--muted-foreground)] px-2 py-3 text-center">
                    {t('annonces:filters.noServices')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ville */}
          <div className="relative" ref={cityRef}>
            <button
              onClick={() => setShowCityMenu(!showCityMenu)}
              className="flex items-center gap-1.5 text-sm font-medium text-[var(--foreground)] px-3 sm:px-4 py-2 hover:bg-[var(--muted)] transition-colors whitespace-nowrap"
            >
              {getCityLabel(city)}
              <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            </button>
            {showCityMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-[var(--border)] shadow-[0_4px_25px_rgba(0,0,0,0.12)] p-1.5 z-20 w-52 max-h-64 overflow-y-auto">
                <div
                  onClick={() => {
                    setCity("");
                    setShowCityMenu(false);
                  }}
                  className={`px-3.5 py-2.5 cursor-pointer text-sm hover:bg-[var(--muted)] flex items-center justify-between transition-colors text-[var(--foreground)] ${city === "" ? "bg-[var(--muted)]" : ""}`}
                >
                  <span>{t('annonces:filters.city.all')}</span>
                  {city === "" && <Check className="w-4 h-4 text-[var(--brand-cyan)]" />}
                </div>
                {citiesList.map((c) => (
                  <div
                    key={c}
                    onClick={() => {
                      setCity(c);
                      setShowCityMenu(false);
                    }}
                    className={`px-3.5 py-2.5 cursor-pointer text-sm hover:bg-[var(--muted)] flex items-center justify-between transition-colors text-[var(--foreground)] ${city === c ? "bg-[var(--muted)]" : ""}`}
                  >
                    <span>{c}</span>
                    {city === c && <Check className="w-4 h-4 text-[var(--brand-cyan)]" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quartier */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5">
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t('annonces:filters.district.placeholder')}
              className="min-w-[130px] sm:min-w-[180px] text-sm px-3 py-2 border border-[var(--border)] rounded-xl bg-white text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/20"
            />
          </div>

          {/* Bouton Réinitialiser */}
          <button
            onClick={resetFilters}
            className="text-sm font-medium text-[var(--brand-cyan)] px-3 sm:px-4 py-2 hover:bg-[var(--brand-cyan-light)] transition-colors whitespace-nowrap"
          >
            {t('common:common.reset')}
          </button>
        </div>

        {/* Filtres actifs - Version mobile */}
        {activeFiltersCount > 0 && (
          <div className="lg:hidden flex flex-wrap gap-1.5 mt-3">
            {city && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {city}
                <button onClick={() => setCity("")} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {district && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {district}
                <button onClick={() => setDistrict("")} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {type && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {getTypeLabel(type)}
                <button onClick={() => setType("")} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedServiceIds.length > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {selectedServiceIds.length} services
                <button onClick={() => setSelectedServiceIds([])} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {maxPrice > 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {`${(maxPrice / 1000).toFixed(0)}k Ar`}
                <button onClick={() => setMaxPrice(0)} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {colocFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--muted)] text-xs text-[var(--foreground)]">
                {getColocLabel(colocFilter)}
                <button onClick={() => setColocFilter("")} className="hover:text-[var(--brand-cyan)]">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Compteur de résultats */}
        <div className="flex items-center justify-between mt-4 sm:mt-5">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--muted-foreground)]">
            <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[var(--muted-foreground)]" />
            <span>
              {loading
                ? t('annonces:loading')
                : `${listings.length} ${t('annonces:results')}`}
            </span>
          </div>
          <div className="text-xs sm:text-sm text-[var(--muted-foreground)]">
            {!loading && listings.length > 0 && "📍 Madagascar"}
          </div>
        </div>

        {/* Grille d'annonces - Cards plus petites et cliquables */}
        <div className="mt-4 sm:mt-5">
          {error && (
            <div className="border border-red-200 bg-red-50/80 p-5 text-sm text-red-700 backdrop-blur-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-[var(--muted)] aspect-[4/3] w-full"></div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 bg-[var(--muted)] w-3/4"></div>
                    <div className="h-2.5 bg-[var(--muted)] w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {listings.map((l, index) => (
                <div
                  key={l.id}
                  className="animate-fade-in-up cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => {
                    window.location.href = `/annonces/${l.id}`;
                  }}
                >
                  <ListingCard l={l} compact />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-12 sm:py-20">
              <div className="text-4xl sm:text-5xl mb-4">🏠</div>
              <h3 className="bebas text-lg sm:text-xl text-[var(--foreground)]">
                {t('annonces:empty')}
              </h3>
              <p className="text-[var(--muted-foreground)] mt-1 text-xs sm:text-sm">
                {t('annonces:emptySub')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal filtres mobile */}
      {showMobileFilters && <MobileFilters />}
    </SiteLayout>
  );
}