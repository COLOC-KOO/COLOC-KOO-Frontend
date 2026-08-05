// Annonces.tsx (version refondue)
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Search,
  X,
  ChevronDown,
  Check,
  SlidersHorizontal,
  Users,
  PlusCircle,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import { SiteLayout } from "../components/site/SiteLayout";
import { ListingCard } from "../components/site/ListingCard";
import { api, annonceToListing, ApiServiceCkoo, Ville } from "../lib/api";
import { Listing } from "../types";

// ---- Liste de villes de secours (inchangée) ----
const MADAGASCAR_CITIES_FALLBACK = [
  "Antananarivo",
  "Toamasina",
  "Antsirabe",
  "Fianarantsoa",
  "Mahajanga",
  "Toliara",
  "Antsiranana",
  "Ambatondrazaka",
  "Antalaha",
  "Ambositra",
  "Manakara",
  "Farafangana",
  "Marovoay",
  "Sambava",
  "Morondava",
  "Ambanja",
  "Nosy Be",
  "Fenoarivo Atsinanana",
  "Ihosy",
  "Moramanga",
  "Vatomandry",
  "Maevatanana",
  "Miandrivazo",
  "Mandritsara",
  "Vangaindrano",
  "Betroka",
  "Tsiroanomandidy",
  "Mananjary",
  "Ambovombe",
  "Amparafaravola",
  "Ambatolampy",
  "Andapa",
  "Antsohihy",
  "Vohipeno",
  "Sakaraha",
  "Ejeda",
  "Mananara Avaratra",
  "Nosy Varika",
  "Bealanana",
  "Mahanoro",
  "Vohemar",
  "Marolambo",
  "Maroantsetra",
  "Ankazobe",
  "Faratsiho",
  "Betafo",
  "Ambalavao",
  "Ihandra",
  "Ivato",
  "Sainte-Marie",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface CountriesDevCity {
  name: string;
}

async function fetchMadagascarCities(): Promise<string[]> {
  try {
    const response = await fetch("https://countries.dev/cities?country=MG&limit=100");
    if (!response.ok) throw new Error("Réponse invalide de l'API de villes");
    const data: CountriesDevCity[] = await response.json();
    const names = data.map((c) => c.name).filter(Boolean);
    return names.length > 0 ? names : MADAGASCAR_CITIES_FALLBACK;
  } catch {
    return MADAGASCAR_CITIES_FALLBACK;
  }
}

// ---- Composant DropdownPill (copié depuis ResultsPage) ----
interface DropdownPillProps {
  label: string;
  icon: string;
  isOpen: boolean;
  onToggle: () => void;
  active?: boolean;
  minWidth?: number;
  children: React.ReactNode;
}

function DropdownPill({
  label,
  icon,
  isOpen,
  onToggle,
  active,
  minWidth = 180,
  children,
}: DropdownPillProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-colors ${
          active
            ? "border-sc-cy bg-sc-cy-lt text-[#2a7a90]"
            : isOpen
            ? "border-sc-cy bg-white text-sc-dark"
            : "border-sc-bd bg-white text-sc-dark hover:border-sc-cy"
        }`}
      >
        <i className={`ti ${icon} text-xs`} />
        {label}
        <i
          className={`ti ti-chevron-down text-[10px] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
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

// ---- Page principale ----
export default function Annonces() {
  const { t } = useTranslation(["annonces", "common"]);
  const location = useLocation();

  // États (inchangés)
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minSurface, setMinSurface] = useState(0);
  const [maxSurface, setMaxSurface] = useState(0);
  const [bedrooms, setBedrooms] = useState("");
  const [query, setQuery] = useState("");
  const [colocFilter, setColocFilter] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [services, setServices] = useState<ApiServiceCkoo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // États pour les dropdowns (ouverts/fermés)
  const [openDrop, setOpenDrop] = useState<string | null>(null);

  // Références pour fermeture au clic extérieur
  const searchRef = useRef<HTMLDivElement>(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [externalCities, setExternalCities] = useState<string[]>([]);

  // Options (inchangées)
  const equipmentOptions = useMemo(
    () => [
      { value: "accessibilite_handicape", label: "Accessibilité handicapé" },
      { value: "air_conditionne", label: "Air conditionné" },
      { value: "ascenseur", label: "Ascenseur" },
      { value: "balcon", label: "Balcon" },
      { value: "garage", label: "Garage" },
      { value: "jardin", label: "Jardin" },
      { value: "lave_vaisselle", label: "Lave-vaisselle" },
      { value: "machine_laver", label: "Machine à laver" },
      { value: "meuble", label: "Meublé" },
      { value: "parking", label: "Parking" },
      { value: "piscine", label: "Piscine" },
      { value: "wifi", label: "Wifi" },
      { value: "filles_uniquement", label: "Règle - Filles uniquement" },
      { value: "garcons_uniquement", label: "Règle - Garçons uniquement" },
      { value: "fumeurs_acceptes", label: "Règle - Fumeurs acceptés" },
      { value: "animaux_acceptes", label: "Règle - Animaux acceptés" },
    ],
    []
  );

  const bedroomOptions = useMemo(() => ["1", "2", "3", "4", "5", "6+"], []);
  const typeOptions = useMemo(
    () => [
      { value: "", label: t("annonces:filters.types.all") },
      { value: "chambre", label: t("annonces:filters.types.room") },
      { value: "appartement", label: t("annonces:filters.types.apartment") },
      { value: "maison", label: t("annonces:filters.types.house") },
    ],
    [t]
  );
  const colocOptions = useMemo(
    () => [
      { value: "", label: t("annonces:filters.coloc.all") },
      { value: "existantes", label: t("annonces:filters.coloc.existing") },
      { value: "a_creer", label: t("annonces:filters.coloc.create") },
    ],
    [t]
  );

  // Initialisation des villes externes
  useEffect(() => {
    fetchMadagascarCities().then(setExternalCities);
  }, []);

  // Lecture des paramètres d'URL (inchangé)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlQuery = params.get("q") || "";
    const urlType = params.get("type") || "";
    const urlCity = params.get("ville") || params.get("city") || "";
    const urlDistrict = params.get("quartier") || params.get("district") || "";
    const urlColoc = params.get("coloc") || "";
    const urlServices =
      params.get("services")?.split(",").map(Number).filter(Boolean) || [];
    const urlEquipments =
      params.get("equipements")?.split(",").map((item) => item.trim()).filter(Boolean) ||
      [];
    const urlMinPrice = Number(params.get("minPrice") || 0);
    const urlMaxPrice = Number(params.get("maxPrice") || 0);
    const urlMinSurface = Number(params.get("minSurface") || 0);
    const urlMaxSurface = Number(params.get("maxSurface") || 0);
    const urlBedrooms = params.get("chambres") || "";

    setQuery(urlQuery);
    setType(urlType);
    setCity(urlCity);
    setDistrict(urlDistrict);
    setColocFilter(urlColoc);
    setSelectedServiceIds(urlServices);
    setSelectedEquipments(urlEquipments);
    setMinPrice(urlMinPrice);
    setMaxPrice(urlMaxPrice);
    setMinSurface(urlMinSurface);
    setMaxSurface(urlMaxSurface);
    setBedrooms(urlBedrooms);
  }, [location.search]);

  // Chargement des données (inchangé)
  useEffect(() => {
    setLoading(true);
    setError("");
    const params: any = {
      statut: "active",
      ville: city || undefined,
      quartier: district || undefined,
      type: type || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      q: query || undefined,
      coloc: colocFilter || undefined,
    };
    if (selectedServiceIds.length > 0) {
      params.service = selectedServiceIds.join(",");
    }
    if (selectedEquipments.length > 0) {
      params.equipements = selectedEquipments.join(",");
      params.regles = selectedEquipments.join(",");
    }

    Promise.all([
      api.annonces(params),
      api.villes().catch(() => []),
      api.services().catch(() => []),
    ])
      .then(([annonces, villesList, servicesList]) => {
        setListings(
          annonces
            .map(annonceToListing)
            .sort(
              (a, b) =>
                Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted))
            )
        );
        setVilles(villesList);
        setServices(
          Array.isArray(servicesList)
            ? servicesList.filter((s) => String(s.cle_service || "").startsWith("service_"))
            : []
        );
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : t("common:common.error"))
      )
      .finally(() => setLoading(false));
  }, [
    city,
    district,
    type,
    selectedServiceIds,
    selectedEquipments,
    minPrice,
    maxPrice,
    query,
    colocFilter,
    t,
  ]);

  // Listes de villes (inchangé)
  const citiesList = useMemo(() => {
    const fromDb = villes.map((v) => v.nom_ville);
    const fromListings = listings.map((l) => l.city);
    const merged = [...new Set([...fromDb, ...fromListings, ...externalCities])];
    return merged.sort((a, b) => a.localeCompare(b, "fr"));
  }, [listings, villes, externalCities]);

  const searchSuggestions = useMemo(() => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return [];
    return citiesList
      .filter((c) => normalizeText(c).includes(normalizedQuery))
      .slice(0, 6);
  }, [query, citiesList]);

  // Filtrage supplémentaire (surface, chambres, équipements) – inchangé
  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      if (minSurface && listing.surface < minSurface) return false;
      if (maxSurface && listing.surface > maxSurface) return false;
      if (bedrooms) {
        const minBedrooms = bedrooms === "6+" ? 6 : Number(bedrooms);
        const listingBedrooms = Number(listing.bedrooms || listing.rooms || 0);
        if (bedrooms === "6+") {
          if (listingBedrooms < minBedrooms) return false;
        } else if (listingBedrooms !== minBedrooms) {
          return false;
        }
      }
      if (selectedEquipments.length > 0) {
        const normalizedAmenities = listing.amenities.map((item) =>
          item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
        );
        const normalizedRules = (listing.regles || []).map((item) =>
          item
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
        );
        const hasEveryEquipment = selectedEquipments.every((equipment) => {
          if (equipment === "wifi" && listing.internet) return true;
          if (equipment === "ascenseur" && listing.elevator) return true;
          if (
            equipment === "parking" &&
            ((listing.parkingVoitures ?? 0) > 0 || listing.parkingCouvert)
          )
            return true;
          if (equipment === "animaux_acceptes" && listing.petsAllowed)
            return true;
          if (equipment === "fumeurs_acceptes" && listing.smokersAllowed)
            return true;
          if (equipment === "filles_uniquement" && listing.womenOnly)
            return true;
          if (equipment === "garcons_uniquement" && listing.menOnly)
            return true;
          return (
            normalizedAmenities.some((amenity) => amenity.includes(equipment)) ||
            normalizedRules.some((rule) => rule.includes(equipment))
          );
        });
        if (!hasEveryEquipment) return false;
      }
      return true;
    });
  }, [listings, minSurface, maxSurface, bedrooms, selectedEquipments]);

  // Toggles (inchangés)
  const toggleService = (id: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };
  const toggleEquipment = (value: string) => {
    setSelectedEquipments((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };
  const selectCitySuggestion = (cityName: string) => {
    setCity(cityName);
    setQuery("");
    setShowSearchSuggestions(false);
  };

  const resetFilters = () => {
    setCity("");
    setDistrict("");
    setType("");
    setSelectedServiceIds([]);
    setSelectedEquipments([]);
    setMinPrice(0);
    setMaxPrice(0);
    setMinSurface(0);
    setMaxSurface(0);
    setBedrooms("");
    setQuery("");
    setColocFilter("");
    setShowMobileFilters(false);
  };

  // Fermeture des dropdowns au clic extérieur (géré via `openDrop`)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      // On ferme tous les dropdowns si on clique en dehors de tous les boutons
      // Cette approche est simplifiée : on ferme si on clique sur un élément qui n'est pas un dropdown
      // On pourrait faire plus précis, mais on garde la logique de ResultsPage qui utilisait des refs.
      // On va simplement fermer si le clic n'est pas sur un bouton de dropdown.
      // On peut aussi laisser les refs individuelles, mais je vais simplifier.
      // Pour être sûr, on utilise les refs des conteneurs de dropdown.
      // Comme on a plusieurs dropdowns, on utilise un tableau de refs ou on vérifie le parent.
      // Ici, je vais fermer si on clique en dehors du conteneur parent de la barre de filtres.
      // Mais pour une solution robuste, je vais ajouter des refs pour chaque dropdown.
      // Pour gagner du temps, je vais utiliser un gestionnaire global : si le clic est à l'intérieur d'un dropdown, on ne ferme pas.
      // On peut vérifier si l'élément cliqué a un parent avec la classe 'relative' (le conteneur du dropdown).
      // Mais je vais plutôt utiliser des refs pour chaque dropdown.
      // Je vais définir des refs pour chaque dropdown.
    };
  }, []);

  // On va plutôt gérer la fermeture en utilisant des refs pour chaque dropdown.
  // Créons des refs pour chaque type de dropdown
  const typeRef = useRef<HTMLDivElement>(null);
  const colocRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const equipmentsRef = useRef<HTMLDivElement>(null);
  const bedroomsRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (typeRef.current && !typeRef.current.contains(target)) {
        if (openDrop === "type") setOpenDrop(null);
      }
      if (colocRef.current && !colocRef.current.contains(target)) {
        if (openDrop === "coloc") setOpenDrop(null);
      }
      if (servicesRef.current && !servicesRef.current.contains(target)) {
        if (openDrop === "services") setOpenDrop(null);
      }
      if (equipmentsRef.current && !equipmentsRef.current.contains(target)) {
        if (openDrop === "equipments") setOpenDrop(null);
      }
      if (bedroomsRef.current && !bedroomsRef.current.contains(target)) {
        if (openDrop === "bedrooms") setOpenDrop(null);
      }
      if (cityRef.current && !cityRef.current.contains(target)) {
        if (openDrop === "city") setOpenDrop(null);
      }
      if (searchRef.current && !searchRef.current.contains(target)) {
        setShowSearchSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDrop]);

  // Helper pour les labels
  const getTypeLabel = (val: string) =>
    typeOptions.find((t) => t.value === val)?.label || t("annonces:filters.types.all");
  const getColocLabel = (val: string) =>
    colocOptions.find((c) => c.value === val)?.label || t("annonces:filters.coloc.all");
  const getCityLabel = (val: string) => val || t("annonces:filters.city.all");
  const getBedroomsLabel = (val: string) =>
    val ? `${val} chambre${val === "1" ? "" : "s"}` : "Chambres";

  // Nombre de filtres actifs
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city) count++;
    if (district) count++;
    if (type) count++;
    if (selectedServiceIds.length > 0) count++;
    if (selectedEquipments.length > 0) count++;
    if (minPrice > 0) count++;
    if (maxPrice > 0) count++;
    if (minSurface > 0) count++;
    if (maxSurface > 0) count++;
    if (bedrooms) count++;
    if (colocFilter) count++;
    return count;
  }, [
    city,
    district,
    type,
    selectedServiceIds,
    selectedEquipments,
    minPrice,
    maxPrice,
    minSurface,
    maxSurface,
    bedrooms,
    colocFilter,
  ]);

  const emptyMessage =
    city || query ? "Aucune annonce disponible." : t("annonces:emptySub");
  const searchedCityLabel = city || query;

  // ---- Composant MobileFilters (style adapté au thème sc) ----
  const MobileFilters = () => (
    <div
      className="lg:hidden fixed inset-0 z-50 bg-black/50"
      onClick={() => setShowMobileFilters(false)}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-sc-bg rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-sc-bg z-10 px-4 py-4 border-b border-sc-bd flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bebas text-xl text-sc-dark">
            {t("annonces:filters.title")}
          </h3>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="p-2 hover:bg-sc-bd/30 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-sc-dark" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          {/* Type */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              {t("annonces:filters.types.title")}
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    type === opt.value
                      ? "bg-sc-cy text-white shadow-md"
                      : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Coloc */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              {t("annonces:filters.coloc.title")}
            </label>
            <div className="flex flex-wrap gap-2">
              {colocOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColocFilter(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    colocFilter === opt.value
                      ? "bg-sc-cy text-white shadow-md"
                      : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Ville */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              {t("annonces:filters.city.title")}
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
            >
              <option value="">{t("annonces:filters.city.all")}</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {/* Quartier */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              {t("annonces:filters.district.title")}
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t("annonces:filters.district.placeholder")}
              className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
            />
          </div>
          {/* Budget */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              Budget
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                placeholder="Minimum"
                className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
              />
              <input
                type="number"
                min={0}
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                placeholder="Maximum"
                className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
              />
            </div>
          </div>
          {/* Surface */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              Surface
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                min={0}
                value={minSurface || ""}
                onChange={(e) => setMinSurface(Number(e.target.value) || 0)}
                placeholder="Minimum"
                className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
              />
              <input
                type="number"
                min={0}
                value={maxSurface || ""}
                onChange={(e) => setMaxSurface(Number(e.target.value) || 0)}
                placeholder="Maximum"
                className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
              />
            </div>
          </div>
          {/* Chambres */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              Nombre de chambres
            </label>
            <div className="flex flex-wrap gap-2">
              {bedroomOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setBedrooms(bedrooms === opt ? "" : opt)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    bedrooms === opt
                      ? "bg-sc-cy text-white shadow-md"
                      : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {/* Services */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              {t("annonces:filters.services")}
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
                        ? "bg-sc-cy text-white shadow-md"
                        : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                    }`}
                  >
                    {service.nom}
                  </button>
                ))}
            </div>
          </div>
          {/* Equipements */}
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">
              Equipement
            </label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map((equipment) => (
                <button
                  key={equipment.value}
                  onClick={() => toggleEquipment(equipment.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedEquipments.includes(equipment.value)
                      ? "bg-sc-cy text-white shadow-md"
                      : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {equipment.label}
                </button>
              ))}
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-sc-bd">
            <button
              onClick={resetFilters}
              className="flex-1 px-4 py-3 border border-sc-bd rounded-xl text-sm font-medium text-sc-dark hover:bg-sc-bd/30 transition-colors"
            >
              {t("common:common.reset")}
            </button>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="flex-1 px-4 py-3 bg-sc-cy text-white rounded-xl text-sm font-medium hover:bg-sc-cy-d transition-colors shadow-md"
            >
              {t("common:common.apply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- Rendu principal ----
  return (
    <SiteLayout>
      {/* Contenu principal avec fond sc-bg */}
      <div className="min-h-screen bg-sc-bg flex flex-col">
        {/* En-tête (similaire à ResultsPage) */}
        <div className="px-4 py-5 border-b border-sc-bd bg-white">
          <h1 className="font-bebas text-2xl text-sc-dark tracking-wide">
            Annonces récentes — {(city || query || "Madagascar").toUpperCase()}
          </h1>
          <p className="text-xs text-sc-gr2">
            {loading
              ? t("common:common.loading")
              : `${visibleListings.length} logement${
                  visibleListings.length > 1 ? "s" : ""
                } disponible${visibleListings.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Barre de filtres (sticky) – style ResultsPage */}
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

          {/* Type */}
          <div ref={typeRef} className="relative">
            <DropdownPill
              label={getTypeLabel(type)}
              icon="ti-home"
              isOpen={openDrop === "type"}
              onToggle={() => setOpenDrop((v) => (v === "type" ? null : "type"))}
              active={type !== ""}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">
                Type d'annonce
              </p>
              {typeOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm py-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="type"
                    checked={type === opt.value}
                    onChange={() => {
                      setType(opt.value);
                      setOpenDrop(null);
                    }}
                    className="accent-sc-cy"
                  />
                  {opt.label}
                </label>
              ))}
            </DropdownPill>
          </div>

          {/* Coloc */}
          <div ref={colocRef} className="relative">
            <DropdownPill
              label={getColocLabel(colocFilter)}
              icon="ti-users"
              isOpen={openDrop === "coloc"}
              onToggle={() => setOpenDrop((v) => (v === "coloc" ? null : "coloc"))}
              active={colocFilter !== ""}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">
                Type de colocation
              </p>
              {colocOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 text-sm py-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="coloc"
                    checked={colocFilter === opt.value}
                    onChange={() => {
                      setColocFilter(opt.value);
                      setOpenDrop(null);
                    }}
                    className="accent-sc-cy"
                  />
                  {opt.label}
                </label>
              ))}
            </DropdownPill>
          </div>

          {/* Budget */}
          <DropdownPill
            label="Budget"
            icon="ti-coin"
            isOpen={openDrop === "budget"}
            onToggle={() => setOpenDrop((v) => (v === "budget" ? null : "budget"))}
            active={!!(minPrice || maxPrice)}
          >
            <p className="text-[11px] font-bold text-sc-gr2 mb-2">
              Loyer mensuel (Ar)
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
                step={10000}
              />
              <span className="text-sc-gr2">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice || ""}
                onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
                step={10000}
              />
            </div>
          </DropdownPill>

          {/* Surface */}
          <DropdownPill
            label="Surface"
            icon="ti-ruler-2"
            isOpen={openDrop === "surface"}
            onToggle={() => setOpenDrop((v) => (v === "surface" ? null : "surface"))}
            active={!!(minSurface || maxSurface)}
          >
            <p className="text-[11px] font-bold text-sc-gr2 mb-2">Surface (m²)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={minSurface || ""}
                onChange={(e) => setMinSurface(Number(e.target.value) || 0)}
                className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
                step={1}
              />
              <span className="text-sc-gr2">—</span>
              <input
                type="number"
                placeholder="Max"
                value={maxSurface || ""}
                onChange={(e) => setMaxSurface(Number(e.target.value) || 0)}
                className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy"
                step={1}
              />
            </div>
          </DropdownPill>

          {/* Chambres */}
          <div ref={bedroomsRef} className="relative">
            <DropdownPill
              label={getBedroomsLabel(bedrooms)}
              icon="ti-bed"
              isOpen={openDrop === "bedrooms"}
              onToggle={() => setOpenDrop((v) => (v === "bedrooms" ? null : "bedrooms"))}
              active={bedrooms !== ""}
              minWidth={140}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">
                Nombre de chambres
              </p>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input
                    type="radio"
                    name="bedrooms"
                    checked={bedrooms === ""}
                    onChange={() => {
                      setBedrooms("");
                      setOpenDrop(null);
                    }}
                    className="accent-sc-cy"
                  />
                  Toutes
                </label>
                {bedroomOptions.map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm py-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="bedrooms"
                      checked={bedrooms === opt}
                      onChange={() => {
                        setBedrooms(opt);
                        setOpenDrop(null);
                      }}
                      className="accent-sc-cy"
                    />
                    {opt} chambre{opt === "1" ? "" : "s"}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

          {/* Services */}
          <div ref={servicesRef} className="relative">
            <DropdownPill
              label="Services"
              icon="ti-sparkles"
              isOpen={openDrop === "services"}
              onToggle={() => setOpenDrop((v) => (v === "services" ? null : "services"))}
              active={selectedServiceIds.length > 0}
              minWidth={220}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">
                Services inclus
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {services
                  .filter((s) => s.est_actif === 1)
                  .map((service) => (
                    <label
                      key={service.id_service}
                      className="flex items-center gap-2 text-xs cursor-pointer py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceIds.includes(service.id_service)}
                        onChange={() => toggleService(service.id_service)}
                        className="accent-sc-cy"
                      />
                      {service.nom}
                    </label>
                  ))}
              </div>
            </DropdownPill>
          </div>

          {/* Equipements */}
          <div ref={equipmentsRef} className="relative">
            <DropdownPill
              label="Equipement"
              icon="ti-building"
              isOpen={openDrop === "equipments"}
              onToggle={() => setOpenDrop((v) => (v === "equipments" ? null : "equipments"))}
              active={selectedEquipments.length > 0}
              minWidth={220}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">
                Equipements et règles
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {equipmentOptions.map((eq) => (
                  <label
                    key={eq.value}
                    className="flex items-center gap-2 text-xs cursor-pointer py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEquipments.includes(eq.value)}
                      onChange={() => toggleEquipment(eq.value)}
                      className="accent-sc-cy"
                    />
                    {eq.label}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

          {/* Ville */}
          <div ref={cityRef} className="relative">
            <DropdownPill
              label={getCityLabel(city)}
              icon="ti-map-pin"
              isOpen={openDrop === "city"}
              onToggle={() => setOpenDrop((v) => (v === "city" ? null : "city"))}
              active={city !== ""}
              minWidth={200}
            >
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">Ville</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input
                    type="radio"
                    name="city"
                    checked={city === ""}
                    onChange={() => {
                      setCity("");
                      setOpenDrop(null);
                    }}
                    className="accent-sc-cy"
                  />
                  Toutes les villes
                </label>
                {citiesList.map((c) => (
                  <label
                    key={c}
                    className="flex items-center gap-2 text-sm py-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="city"
                      checked={city === c}
                      onChange={() => {
                        setCity(c);
                        setOpenDrop(null);
                      }}
                      className="accent-sc-cy"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

          {/* Quartier (champ texte) */}
          <div className="flex items-center gap-2 px-2 py-1.5">
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Quartier"
              className="min-w-[130px] text-xs px-3 py-1.5 border border-sc-bd rounded-xl bg-white text-sc-dark outline-none focus:border-sc-cy"
            />
          </div>

          <div className="w-px h-4 bg-sc-bd" />

          {/* Bouton Réinitialiser */}
          <button
            onClick={resetFilters}
            className="text-xs font-bold text-sc-cy px-2 py-1 hover:bg-sc-cy-lt rounded-lg transition-colors"
          >
            Réinitialiser
          </button>

          {/* Bouton d'alerte (similaire à ResultsPage) */}
          <button className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 border border-sc-bd rounded-xl text-xs text-sc-dark hover:bg-sc-cy-lt hover:border-sc-cy transition-colors cursor-pointer bg-white">
            <i className="ti ti-bell-plus text-xs" />
            Créer une alerte · <strong>{city || query || "Madagascar"}</strong>
          </button>
        </div>

        {/* Contenu principal avec grille */}
        <div className="flex-1 px-4 py-5">
          {/* Compteur supplémentaire (déjà dans l'en-tête, mais on garde la structure) */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-bebas text-xl text-sc-dark tracking-wide">
                {visibleListings.length} annonce{visibleListings.length > 1 ? "s" : ""}
              </h2>
            </div>
            {/* On pourrait ajouter un tri ici, mais on garde le filtre par défaut */}
          </div>

          {visibleListings.length === 0 && !loading && (
            <div className="text-center py-16">
              <i className="ti ti-map-search text-5xl text-sc-gr2 mb-4 block" />
              <h3 className="font-bebas text-xl text-sc-dark mb-2">
                {t("annonces:empty")}
              </h3>
              <p className="text-sm text-sc-gr2 mb-4">{emptyMessage}</p>
              {searchedCityLabel && (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={`/profils-recherche-logement?ville=${encodeURIComponent(
                      searchedCityLabel
                    )}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-sc-bd text-sm font-medium text-sc-dark hover:bg-sc-bd/30 transition-colors rounded-xl"
                  >
                    <Users className="w-4 h-4 text-sc-cy" />
                    Voir les profils qui recherchent aussi à {searchedCityLabel}
                  </a>
                  <a
                    href={`/depot_annonce?ville=${encodeURIComponent(
                      searchedCityLabel
                    )}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sc-cy text-white text-sm font-medium hover:bg-sc-cy-d transition-colors shadow-md rounded-xl"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Déposer une annonce
                  </a>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-sc-bd aspect-[4/3] w-full rounded-xl"></div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-3 bg-sc-bd w-3/4 rounded"></div>
                    <div className="h-2.5 bg-sc-bd w-1/2 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && visibleListings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {visibleListings.map((l) => (
                <div
                  key={l.id}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => (window.location.href = `/annonces/${l.id}`)}
                >
                  <ListingCard l={l} compact />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="border border-red-200 bg-red-50/80 p-5 text-sm text-red-700 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Mobile filters modal */}
        {showMobileFilters && <MobileFilters />}
      </div>
    </SiteLayout>
  );
}