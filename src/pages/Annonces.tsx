import React, { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { X, Users, PlusCircle, List, Map, Pencil } from "lucide-react";
import { DivIcon, LatLngBounds, LatLngExpression } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiteLayout } from "../components/site/SiteLayout";
import { ListingCard } from "../components/site/ListingCard";
import { api, annonceToListing, Ville } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatAr } from "../lib/utils";
import { Listing } from "../types";

const MADAGASCAR_CITIES_FALLBACK = [
  "Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga", "Toliara",
  "Antsiranana", "Ambatondrazaka", "Antalaha", "Ambositra", "Manakara", "Farafangana",
  "Marovoay", "Sambava", "Morondava", "Ambanja", "Nosy Be", "Fenoarivo Atsinanana",
  "Ihosy", "Moramanga", "Vatomandry", "Maevatanana", "Miandrivazo", "Mandritsara",
  "Vangaindrano", "Betroka", "Tsiroanomandidy", "Mananjary", "Ambovombe",
  "Amparafaravola", "Ambatolampy", "Andapa", "Antsohihy", "Vohipeno", "Sakaraha",
  "Ejeda", "Mananara Avaratra", "Nosy Varika", "Bealanana", "Mahanoro", "Vohemar",
  "Marolambo", "Maroantsetra", "Ankazobe", "Faratsiho", "Betafo", "Ambalavao",
  "Ihandra", "Ivato", "Sainte-Marie",
];

const CITY_COORDINATES: Record<string, [number, number]> = {
  antananarivo: [-18.8792, 47.5079],
  toamasina: [-18.1492, 49.4023],
  antsirabe: [-19.8659, 47.0333],
  fianarantsoa: [-21.4527, 47.0857],
  mahajanga: [-15.7167, 46.3167],
  toliara: [-23.35, 43.6667],
  antsiranana: [-12.2787, 49.2917],
  "nosy be": [-13.3128, 48.2573],
};

function normalizeText(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function fallbackPositionForListing(listing: Listing, index: number): [number, number] {
  const cityKey = normalizeText(listing.city || "");
  const base = CITY_COORDINATES[cityKey] || CITY_COORDINATES.antananarivo;
  const angle = index * 1.65;
  const radius = 0.018 + (index % 5) * 0.008;
  return [base[0] + Math.sin(angle) * radius, base[1] + Math.cos(angle) * radius];
}

function getListingPosition(listing: Listing, index: number): [number, number] {
  if (Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude)) {
    return [Number(listing.latitude), Number(listing.longitude)];
  }
  return fallbackPositionForListing(listing, index);
}

const MARKER_CSS = `
  .ck-price-marker { background: transparent; border: none; }
  .ck-marker {
    width: 190px; height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
    transform-origin: 50% 100%; transition: transform .15s ease;
  }
  .ck-badge {
    display: flex; flex-direction: column; align-items: center; max-width: 186px;
    background: #111827; color: #fff; border: 2px solid #fff; border-radius: 12px;
    padding: 5px 10px; box-shadow: 0 4px 12px rgba(0,0,0,.35);
  }
  .ck-line1 { display: flex; align-items: center; gap: 6px; }
  .ck-price { font-size: 12px; font-weight: 800; white-space: nowrap; }
  .ck-sep { width: 1px; height: 10px; background: rgba(255,255,255,.4); flex-shrink: 0; }
  .ck-district {
    font-size: 10px; font-weight: 600; white-space: nowrap;
    max-width: 90px; overflow: hidden; text-overflow: ellipsis; opacity: .9;
  }
  .ck-details {
    display: flex; align-items: center; gap: 8px; margin-top: 4px; padding-top: 4px;
    border-top: 1px solid rgba(255,255,255,.3); font-size: 10px; font-weight: 700; white-space: nowrap;
  }
  .ck-caret {
    width: 0; height: 0;
    border-left: 7px solid transparent; border-right: 7px solid transparent;
    border-top: 9px solid #111827; border-bottom: none;
  }
  .ck-dot {
    width: 10px; height: 10px; margin-top: 1px; border-radius: 50%;
    background: #111827; border: 2.5px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,.4);
  }
  .ck-marker.is-active { transform: scale(1.08); }
  .ck-marker.is-active .ck-badge { background: #46BDD6; }
  .ck-marker.is-active .ck-caret { border-top-color: #46BDD6; }
  .ck-marker.is-active .ck-dot { background: #46BDD6; animation: ck-pulse 1.1s ease-out infinite; }
  @keyframes ck-pulse {
    0%   { box-shadow: 0 0 0 0 rgba(70,189,214,.55); }
    100% { box-shadow: 0 0 0 16px rgba(70,189,214,0); }
  }
`;

function MarkerStyles() {
  return <style>{MARKER_CSS}</style>;
}

function createPriceIcon(listing: Listing, isActive: boolean) {
  return new DivIcon({
    className: "ck-price-marker",
    html: `
      <div class="ck-marker${isActive ? " is-active" : ""}">
        <div class="ck-badge">
          <span class="ck-line1">
            <span class="ck-price">${formatAr(listing.price || 0)}</span>
            <span class="ck-sep"></span>
            <span class="ck-district">${listing.district || "Madagascar"}</span>
          </span>
        </div>
        <div class="ck-caret"></div>
        <div class="ck-dot"></div>
      </div>`,
    iconSize: [190, 56],
    iconAnchor: [95, 49],
    popupAnchor: [0, -52],
  });
}

// Zoom maximal au cadrage initial : garde une vue d'ensemble de la ville pour
// situer le bien, même avec une seule annonce.
const CITY_VIEW_MAX_ZOOM = 13;

function MapBounds({ listings }: { listings: Listing[] }) {
  const map = useMap();
  useEffect(() => {
    if (listings.length === 0) return;
    const first = getListingPosition(listings[0], 0);
    const bounds = new LatLngBounds(first, first);
    listings.forEach((listing, index) => {
      bounds.extend(getListingPosition(listing, index));
    });
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: CITY_VIEW_MAX_ZOOM });
  }, [listings, map]);
  return null;
}

// Au survol d'une annonce, la carte ne zoome plus : elle se déplace seulement
// (sans changer d'échelle) si le repère est hors de la zone visible.
function MapFocusController({ target }: { target: [number, number] | null }) {
  const map = useMap();
  const key = target ? target.join(",") : "";
  useEffect(() => {
    if (!target) return;
    if (map.getBounds().pad(-0.1).contains(target)) return;
    map.panTo(target, { animate: true, duration: 0.5 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}

function InteractiveListingsMap({
  listings,
  favoriteIds,
  onFavoriteClick,
  locationLabel,
}: {
  listings: Listing[];
  favoriteIds: Set<string>;
  onFavoriteClick: (event: React.MouseEvent, listing: Listing) => void;
  locationLabel: string;
}) {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const firstPosition: LatLngExpression =
    listings.length > 0 ? getListingPosition(listings[0], 0) : CITY_COORDINATES.antananarivo;

  const activeIndex = activeId ? listings.findIndex((l) => String(l.id) === activeId) : -1;
  const activeListing = activeIndex >= 0 ? listings[activeIndex] : null;
  const activePosition = activeListing ? getListingPosition(activeListing, activeIndex) : null;

  useEffect(() => {
    if (!activeId) return;
    const el = listRefs.current[activeId];
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  return (
    <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 overflow-hidden border-t border-sc-bd bg-white lg:grid-cols-[1fr_470px]">
      {/* `isolate` : la carte et ses repères restent sous le header fixe. */}
      <div className="relative isolate min-h-[420px] bg-[#dfead4] lg:min-h-[calc(100vh-190px)]">
        <MarkerStyles />
        <MapContainer center={firstPosition} zoom={CITY_VIEW_MAX_ZOOM} className="h-full w-full" zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · précision quartier'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds listings={listings} />
          <MapFocusController target={activePosition} />
          {listings.map((listing, index) => {
            const position = getListingPosition(listing, index);
            const isActive = activeId === String(listing.id);
            return (
              <Marker
                key={listing.id}
                position={position}
                icon={createPriceIcon(listing, isActive)}
                zIndexOffset={isActive ? 1000 : 0}
                eventHandlers={{
                  click: () => navigate(`/annonces/${listing.id}`),
                  mouseover: () => setActiveId(String(listing.id)),
                  mouseout: () => setActiveId((current) => (current === String(listing.id) ? null : current)),
                }}
              >
                <Popup>
                  <div className="w-56">
                    <img src={listing.image} alt={listing.title} className="mb-2 h-28 w-full rounded-lg object-cover" />
                    <p className="text-sm font-bold text-slate-900">{listing.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{listing.district}, {listing.city}</p>
                    <p className="mt-2 text-sm font-bold text-sc-cy">{formatAr(listing.price)}/mois</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
        <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg bg-black/55 px-2.5 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          Survolez une annonce pour voir les détails sur la carte
        </div>
      </div>

      <aside className="max-h-[calc(100vh-190px)] overflow-y-auto border-l border-sc-bd bg-white">
        <div className="sticky top-0 z-10 border-b border-sc-bd bg-white px-4 py-4">
          <h2 className="text-lg font-extrabold text-sc-dark">
            {listings.length} annonce{listings.length > 1 ? "s" : ""} · {locationLabel}
          </h2>
        </div>
        <div className="space-y-3 p-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              ref={(el) => {
                listRefs.current[String(listing.id)] = el;
              }}
            >
              <ListingCard
                l={listing}
                compact
                isFavorite={favoriteIds.has(String(listing.id))}
                onFavoriteClick={onFavoriteClick}
                highlighted={activeId === String(listing.id)}
                onMouseEnter={() => setActiveId(String(listing.id))}
                onMouseLeave={() => setActiveId((current) => (current === String(listing.id) ? null : current))}
              />
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// Filtres alignés sur les éléments renseignés au dépôt d'annonce
// (Partie 4 « Services & commodités » et Partie 6 « Règles »).
const EQUIPMENT_OPTIONS = [
  "Eau courante",
  "Surpresseur",
  "Balcon",
  "Jardin",
  "Piscine",
  "BBQ",
  "Gazinière / Plaques électriques",
  "Four",
  "Machine à laver",
  "Abri vélo / moto",
];
const RULE_OPTIONS = ["Filles uniquement", "Garçons uniquement", "Animaux acceptés", "Famille / Enfant(s) accepté(s)"];
const SERVICE_OPTIONS = ["Gardien", "Femme de ménage", "Jardinier", "Porteurs d'eau", "Intendance et petits travaux"];

function normalizeOption(value: string) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function includesOption(values: string[] | undefined, option: string) {
  const wanted = normalizeOption(option);
  return (values || []).some((value) => normalizeOption(String(value)) === wanted);
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
            ? "border-sc-cy bg-sc-cy-lt text-[#2a7a90]"
            : isOpen
            ? "border-sc-cy bg-white text-sc-dark"
            : "border-sc-bd bg-white text-sc-dark hover:border-sc-cy"
        }`}
      >
        <i className={`ti ${icon} text-xs`} />
        {label}
        <i className={`ti ti-chevron-down text-[10px] transition-transform ${isOpen ? "rotate-180" : ""}`} />
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

export default function Annonces() {
  const { t } = useTranslation(["annonces", "common"]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [query, setQuery] = useState("");
  const [colocFilter, setColocFilter] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [alertStage, setAlertStage] = useState<"closed" | "auth" | "confirm">("closed");
  const [alertVilleId, setAlertVilleId] = useState("");
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [alertError, setAlertError] = useState("");
  const [alertDone, setAlertDone] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [externalCities, setExternalCities] = useState<string[]>([]);

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

  useEffect(() => {
    fetchMadagascarCities().then(setExternalCities);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") || "");
    setType(params.get("type") || "");
    setCity(params.get("ville") || params.get("city") || "");
    setDistrict(params.get("quartier") || params.get("district") || "");
    setColocFilter(params.get("coloc") || "");
    setSelectedServices(params.get("services")?.split(",").map((i) => i.trim()).filter(Boolean) || []);
    setSelectedEquipments(params.get("equipements")?.split(",").map((i) => i.trim()).filter(Boolean) || []);
    setMinPrice(Number(params.get("minPrice") || 0));
    setMaxPrice(Number(params.get("maxPrice") || 0));
  }, [location.search]);

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

    // Les villes alimentent les filtres et l'autocomplete : on ne veut pas
    // qu'un échec du chargement des annonces les fasse disparaître aussi.
    api.villes().catch(() => []).then(setVilles);

    api
      .annonces(params)
      .then((annonces) => {
        setListings(
          annonces.map(annonceToListing).sort((a, b) => Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted)))
        );
      })
      .catch(() => {
        setListings([]);
        setError("Impossible de charger les annonces pour le moment. Réessaie dans quelques instants.");
      })
      .finally(() => setLoading(false));
  }, [city, district, type, minPrice, maxPrice, query, colocFilter, t]);

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    api
      .favoris()
      .then((items) => {
        if (cancelled) return;
        const ids = items.flatMap((item) => [item.id, item.id_depot_annonce, item.id_annonce]);
        setFavoriteIds(new Set(ids.filter(Boolean).map(String)));
      })
      .catch(() => {
        if (!cancelled) setFavoriteIds(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!favoriteMessage) return;
    const timer = window.setTimeout(() => setFavoriteMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [favoriteMessage]);

  const citiesList = useMemo(() => {
    const fromDb = villes.map((v) => v.nom_ville);
    const fromListings = listings.map((l) => l.city);
    return [...new Set([...fromDb, ...fromListings, ...externalCities])].sort((a, b) => a.localeCompare(b, "fr"));
  }, [listings, villes, externalCities]);

  // La ville filtrée correspond-elle à une vraie ville en base ? Sinon on la
  // demande dans la pop-up (l'alerte a besoin d'un id_ville valide côté API).
  const matchedAlertVille = useMemo(
    () => villes.find((v) => v.nom_ville.toLowerCase() === city.trim().toLowerCase()) || null,
    [villes, city]
  );

  const openAlertModal = () => {
    if (!user) {
      setAlertStage("auth");
      return;
    }
    setAlertVilleId(matchedAlertVille ? String(matchedAlertVille.id_ville) : "");
    setAlertError("");
    setAlertDone(false);
    setAlertStage("confirm");
  };

  const confirmCreateAlerte = async () => {
    if (!user) return;
    const idVille = Number(alertVilleId);
    if (!alertVilleId || Number.isNaN(idVille)) {
      setAlertError("Choisis une ville pour ton alerte.");
      return;
    }
    setAlertSubmitting(true);
    setAlertError("");
    try {
      await api.createAlerte({
        id_utilisateur: Number(user.id),
        id_ville: idVille,
        quartier: district || null,
        prix_max: maxPrice || null,
        types_bien: type ? [type] : [],
        notif_push: true,
        notif_email: true,
      });
      setAlertDone(true);
    } catch (err) {
      setAlertError(err instanceof Error ? err.message : "Impossible de créer l'alerte pour le moment.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  const visibleListings = useMemo(() => {
    return listings.filter((listing) => {
      if (selectedServices.length > 0 && !selectedServices.every((service) => includesOption(listing.services, service))) {
        return false;
      }
      if (selectedEquipments.length > 0) {
        const hasEveryEquipment = selectedEquipments.every(
          (item) => includesOption(listing.amenities, item) || includesOption(listing.regles, item)
        );
        if (!hasEveryEquipment) return false;
      }
      return true;
    });
  }, [listings, selectedServices, selectedEquipments]);

  const toggleService = (value: string) => {
    setSelectedServices((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };
  const toggleEquipment = (value: string) => {
    setSelectedEquipments((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  };

  const resetFilters = () => {
    setCity("");
    setDistrict("");
    setType("");
    setSelectedServices([]);
    setSelectedEquipments([]);
    setMinPrice(0);
    setMaxPrice(0);
    setQuery("");
    setColocFilter("");
    setShowMobileFilters(false);
  };

  const showFavoriteToast = (message: string) => {
    setFavoriteMessage("");
    window.setTimeout(() => setFavoriteMessage(message), 20);
  };

  const handleFavoriteClick = async (event: React.MouseEvent, listing: Listing) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate(`/auth?mode=signin&redirect=/annonces`);
      return;
    }
    const listingId = String(listing.id);
    if (favoriteIds.has(listingId)) {
      showFavoriteToast("C'est déjà dans vos favoris.");
      return;
    }
    try {
      const response = await api.addFavori(listing.id);
      setFavoriteIds((prev) => new Set([...prev, listingId]));
      showFavoriteToast(response.alreadyExists ? "C'est déjà dans vos favoris." : "Ajouté avec succès.");
    } catch (err) {
      showFavoriteToast(err instanceof Error ? err.message : "Impossible d'ajouter ce favori.");
    }
  };

  const typeRef = useRef<HTMLDivElement>(null);
  const colocRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const equipmentsRef = useRef<HTMLDivElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (openDrop === "type" && typeRef.current && !typeRef.current.contains(target)) setOpenDrop(null);
      if (openDrop === "coloc" && colocRef.current && !colocRef.current.contains(target)) setOpenDrop(null);
      if (openDrop === "services" && servicesRef.current && !servicesRef.current.contains(target)) setOpenDrop(null);
      if (openDrop === "equipments" && equipmentsRef.current && !equipmentsRef.current.contains(target)) setOpenDrop(null);
      if (openDrop === "city" && cityRef.current && !cityRef.current.contains(target)) setOpenDrop(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDrop]);

  // Sans sélection, les pastilles portent le nom du filtre (« Type de bien »,
  // « Type de coloc ») plutôt que « Tous types » / « Tous », qui se confondaient.
  const getTypeLabel = (val: string) =>
    (val && typeOptions.find((o) => o.value === val)?.label) || t("annonces:filters.types.title");
  const getColocLabel = (val: string) =>
    (val && colocOptions.find((c) => c.value === val)?.label) || t("annonces:filters.coloc.title");
  const getCityLabel = (val: string) => val || t("annonces:filters.city.all");

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (city) count++;
    if (district) count++;
    if (type) count++;
    if (selectedServices.length > 0) count++;
    if (selectedEquipments.length > 0) count++;
    if (minPrice > 0) count++;
    if (maxPrice > 0) count++;
    if (colocFilter) count++;
    return count;
  }, [city, district, type, selectedServices, selectedEquipments, minPrice, maxPrice, colocFilter]);

  const emptyMessage = city || query ? "Aucune annonce disponible." : t("annonces:emptySub");
  const searchedCityLabel = city || query;

  const MobileFilters = () => (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileFilters(false)}>
      <div className="absolute bottom-0 left-0 right-0 bg-sc-bg rounded-t-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-sc-bg z-10 px-4 py-4 border-b border-sc-bd flex items-center justify-between rounded-t-3xl">
          <h3 className="font-bebas text-xl text-sc-dark">{t("annonces:filters.title")}</h3>
          <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-sc-bd/30 rounded-full transition-colors">
            <X className="w-5 h-5 text-sc-dark" />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">{t("annonces:filters.types.title")}</label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    type === opt.value ? "bg-sc-cy text-white shadow-md" : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">{t("annonces:filters.coloc.title")}</label>
            <div className="flex flex-wrap gap-2">
              {colocOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setColocFilter(opt.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    colocFilter === opt.value ? "bg-sc-cy text-white shadow-md" : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">{t("annonces:filters.city.title")}</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
            >
              <option value="">{t("annonces:filters.city.all")}</option>
              {citiesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">{t("annonces:filters.district.title")}</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder={t("annonces:filters.district.placeholder")}
              className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">Budget</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={0} value={minPrice || ""} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} placeholder="Minimum" className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark" />
              <input type="number" min={0} value={maxPrice || ""} onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} placeholder="Maximum" className="w-full px-4 py-2.5 border border-sc-bd rounded-xl text-sm bg-white focus:border-sc-cy focus:ring-2 focus:ring-sc-cy/20 transition-all text-sc-dark" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">{t("annonces:filters.services")}</label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_OPTIONS.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedServices.includes(service) ? "bg-sc-cy text-white shadow-md" : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">Équipements</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <button
                  key={equipment}
                  onClick={() => toggleEquipment(equipment)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedEquipments.includes(equipment) ? "bg-sc-cy text-white shadow-md" : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {equipment}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-sc-dark block mb-2">Règles</label>
            <div className="flex flex-wrap gap-2">
              {RULE_OPTIONS.map((rule) => (
                <button
                  key={rule}
                  onClick={() => toggleEquipment(rule)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedEquipments.includes(rule) ? "bg-sc-cy text-white shadow-md" : "bg-white border border-sc-bd text-sc-dark hover:border-sc-cy"
                  }`}
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-sc-bd">
            <button onClick={resetFilters} className="flex-1 px-4 py-3 border border-sc-bd rounded-xl text-sm font-medium text-sc-dark hover:bg-sc-bd/30 transition-colors">
              {t("common:common.reset")}
            </button>
            <button onClick={() => setShowMobileFilters(false)} className="flex-1 px-4 py-3 bg-sc-cy text-white rounded-xl text-sm font-medium hover:bg-sc-cy-d transition-colors shadow-md">
              {t("common:common.apply")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SiteLayout>
      <div className="min-h-screen bg-sc-bg flex flex-col">
        {favoriteMessage && (
          <div className="fixed right-5 top-20 z-[90] rounded-xl border border-sc-bd bg-white px-4 py-3 text-sm font-semibold text-sc-dark shadow-2xl">
            {favoriteMessage}
          </div>
        )}

        <div className="px-4 py-5 border-b border-sc-bd bg-white">
          <h1 className="font-bebas text-2xl text-sc-dark tracking-wide">
            {t("annonces:recentTitle")} — {(city || query || "Madagascar").toUpperCase()}
          </h1>
          <p className="text-xs text-sc-gr2">
            {loading
              ? t("common:common.loading")
              : `${visibleListings.length} logement${visibleListings.length > 1 ? "s" : ""} disponible${visibleListings.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="bg-white border-b border-sc-bd px-4 py-2 flex items-center gap-2 flex-wrap sticky top-14 z-30">
<span className="text-xs font-bold text-sc-dark flex items-center gap-1">
  <i className="ti ti-adjustments-horizontal text-sm" /> {t("annonces:filters.title")}
  {activeFiltersCount > 0 && (
    <span className="ml-1 bg-sc-cy text-white text-[10px] font-bold px-1.5 rounded-full">{activeFiltersCount}</span>
  )}
</span>
          <div className="w-px h-4 bg-sc-bd" />

          <div ref={typeRef} className="relative">
            <DropdownPill label={getTypeLabel(type)} icon="ti-home" isOpen={openDrop === "type"} onToggle={() => setOpenDrop((v) => (v === "type" ? null : "type"))} active={type !== ""}>
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">{t("annonces:filters.types.title")}</p>
              {typeOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input type="radio" name="type" checked={type === opt.value} onChange={() => { setType(opt.value); setOpenDrop(null); }} className="accent-sc-cy" />
                  {opt.label}
                </label>
              ))}
            </DropdownPill>
          </div>

          <div ref={colocRef} className="relative">
            <DropdownPill label={getColocLabel(colocFilter)} icon="ti-users" isOpen={openDrop === "coloc"} onToggle={() => setOpenDrop((v) => (v === "coloc" ? null : "coloc"))} active={colocFilter !== ""}>
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">{t("annonces:filters.coloc.title")}</p>
              {colocOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input type="radio" name="coloc" checked={colocFilter === opt.value} onChange={() => { setColocFilter(opt.value); setOpenDrop(null); }} className="accent-sc-cy" />
                  {opt.label}
                </label>
              ))}
            </DropdownPill>
          </div>

          <DropdownPill   label={t("annonces:filters.budget")} icon="ti-coin" isOpen={openDrop === "budget"} onToggle={() => setOpenDrop((v) => (v === "budget" ? null : "budget"))} active={!!(minPrice || maxPrice)}>
            <p className="text-[11px] font-bold text-sc-gr2 mb-2">Loyer mensuel (Ar)</p>
            <div className="flex items-center gap-2">
              <input type="number" placeholder="Min" value={minPrice || ""} onChange={(e) => setMinPrice(Number(e.target.value) || 0)} className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy" step={10000} />
              <span className="text-sc-gr2">—</span>
              <input type="number" placeholder="Max" value={maxPrice || ""} onChange={(e) => setMaxPrice(Number(e.target.value) || 0)} className="w-24 border border-sc-bd rounded-lg px-2 py-1.5 text-xs text-sc-dark outline-none focus:border-sc-cy" step={10000} />
            </div>
          </DropdownPill>

          <div ref={servicesRef} className="relative">
            <DropdownPill label={t("annonces:filters.services")} icon="ti-sparkles" isOpen={openDrop === "services"} onToggle={() => setOpenDrop((v) => (v === "services" ? null : "services"))} active={selectedServices.length > 0} minWidth={220}>
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">Services déjà en place</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {SERVICE_OPTIONS.map((service) => (
                  <label key={service} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedServices.includes(service)} onChange={() => toggleService(service)} className="accent-sc-cy" />
                    {service}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

          <div ref={equipmentsRef} className="relative">
            <DropdownPill label={t("annonces:filters.equipments")} icon="ti-building" isOpen={openDrop === "equipments"} onToggle={() => setOpenDrop((v) => (v === "equipments" ? null : "equipments"))} active={selectedEquipments.length > 0} minWidth={240}>
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">Équipements</p>
              <div className="space-y-1 max-h-60 overflow-y-auto">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <label key={eq} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedEquipments.includes(eq)} onChange={() => toggleEquipment(eq)} className="accent-sc-cy" />
                    {eq}
                  </label>
                ))}
                <p className="text-[11px] font-bold text-sc-gr2 pt-2">Règles</p>
                {RULE_OPTIONS.map((rule) => (
                  <label key={rule} className="flex items-center gap-2 text-xs cursor-pointer py-0.5">
                    <input type="checkbox" checked={selectedEquipments.includes(rule)} onChange={() => toggleEquipment(rule)} className="accent-sc-cy" />
                    {rule}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

          <div ref={cityRef} className="relative">
            <DropdownPill label={getCityLabel(city)} icon="ti-map-pin" isOpen={openDrop === "city"} onToggle={() => setOpenDrop((v) => (v === "city" ? null : "city"))} active={city !== ""} minWidth={200}>
              <p className="text-[11px] font-bold text-sc-gr2 mb-2">Ville</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                <label className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                  <input type="radio" name="city" checked={city === ""} onChange={() => { setCity(""); setOpenDrop(null); }} className="accent-sc-cy" />
                  Toutes les villes
                </label>
                {citiesList.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input type="radio" name="city" checked={city === c} onChange={() => { setCity(c); setOpenDrop(null); }} className="accent-sc-cy" />
                    {c}
                  </label>
                ))}
              </div>
            </DropdownPill>
          </div>

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

          <button onClick={resetFilters} className="text-xs font-bold text-sc-cy px-2 py-1 hover:bg-sc-cy-lt rounded-lg transition-colors">
             {t("annonces:filters.reset")}
          </button>

          <div className="flex items-center rounded-xl border border-sc-bd bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "map" ? "bg-sc-cy text-white" : "text-sc-dark hover:bg-sc-cy-lt"
              }`}
            >
               <Map className="h-3.5 w-3.5" /> {t("annonces:view.map")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                viewMode === "list" ? "bg-white text-sc-dark shadow-sm" : "text-sc-dark hover:bg-sc-cy-lt"
              }`}
            >
              <List className="h-3.5 w-3.5" /> {t("annonces:view.list")}
            </button>
          </div>

<button
  onClick={() => {
    if (user) {
      navigate("/compte?tab=alertes&create=1");
      return;
    }
    navigate(`/auth?mode=signin&redirect=${encodeURIComponent("/compte?tab=alertes&create=1")}`);
  }}
  className="ml-auto flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
  style={{ backgroundColor: "#46BDD6" }}
>
  <i className="ti ti-bell-plus text-xs" />
  {t("annonces:alert.create")}{(city || query) ? <> · <strong>{city || query}</strong></> : null}
</button>
        </div>

        {alertStage !== "closed" && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
              <button
                type="button"
                onClick={() => setAlertStage("closed")}
                aria-label="Fermer"
                className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>

              {alertStage === "auth" ? (
                <>
                  <h3 className="bebas text-xl text-slate-900 mb-2">Connecte-toi pour créer une alerte</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    Crée un compte ou connecte-toi pour être prévenu·e dès qu'une annonce correspond à ta recherche.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/auth?mode=signin&redirect=/annonces")}
                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#46BDD6" }}
                  >
                    Se connecter / S'inscrire
                  </button>
                </>
              ) : alertDone ? (
                <>
                  <h3 className="bebas text-xl text-slate-900 mb-2">Alerte créée !</h3>
                  <p className="text-sm text-slate-500 mb-5">
                    Tu retrouveras toutes tes alertes dans la section ton compte.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAlertStage("closed")}
                    className="w-full rounded-xl border border-sc-bd px-4 py-2.5 text-sm font-semibold text-sc-dark hover:bg-muted"
                  >
                    Fermer
                  </button>
                </>
              ) : (
                <>
                  <h3 className="bebas text-xl text-slate-900 mb-1">Créer un
                    e alerte</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    On te préviendra dès qu'une annonce correspond à ces critères.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {type && (
                      <span className="text-[11px] font-semibold bg-muted text-foreground/70 rounded-md px-2.5 py-1">{type}</span>
                    )}
                    {district && (
                      <span className="text-[11px] font-semibold bg-muted text-foreground/70 rounded-md px-2.5 py-1">{district}</span>
                    )}
                    {maxPrice > 0 && (
                      <span className="text-[11px] font-semibold bg-muted text-foreground/70 rounded-md px-2.5 py-1">
                        Jusqu'à {formatAr(maxPrice)}
                      </span>
                    )}
                    {!type && !district && !maxPrice && (
                      <span className="text-[11px] text-slate-400">Aucun filtre particulier — toutes les annonces de la ville.</span>
                    )}
                  </div>

                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ville<span className="text-red-500"> *</span>
                  </label>
                  {matchedAlertVille ? (
                    <div className="mb-4 rounded-xl border border-sc-bd bg-muted/40 px-3 py-2 text-sm font-semibold text-sc-dark">
                      {matchedAlertVille.nom_ville}
                    </div>
                  ) : (
                    <select
                      value={alertVilleId}
                      onChange={(e) => setAlertVilleId(e.target.value)}
                      className="mb-4 w-full rounded-xl border border-sc-bd px-3 py-2 text-sm outline-none focus:border-sc-cy"
                    >
                      <option value="">Choisis une ville</option>
                      {villes.map((v) => (
                        <option key={v.id_ville} value={v.id_ville}>
                          {v.nom_ville}
                        </option>
                      ))}
                    </select>
                  )}

                  {alertError && <div className="mb-3 text-xs text-red-600">{alertError}</div>}

                  <p className="text-xs text-slate-400 mb-4">
                    Tu retrouveras toutes tes alertes dans la section ton compte.
                  </p>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setAlertStage("closed")}
                      className="flex-1 rounded-xl border border-sc-bd px-4 py-2.5 text-sm font-semibold text-sc-dark hover:bg-muted"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={alertSubmitting}
                      onClick={confirmCreateAlerte}
                      className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                      style={{ backgroundColor: "#46BDD6" }}
                    >
                      {alertSubmitting ? "Création…" : "Confirmer"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="bg-white px-4 py-4">
          <Link
            to="/depot_annonce"
            className="mx-auto flex min-h-[68px] w-full max-w-[520px] items-center justify-center gap-8 rounded border border-sc-bd bg-white px-8 py-3 text-center text-sm leading-5 text-sc-gr2 shadow-sm transition-colors hover:border-sc-cy hover:text-sc-dark"
          >
            <Pencil className="h-6 w-6 shrink-0 text-emerald-500" />
            <span>{t("annonces:postCta")}</span>
          </Link>
        </div>

        {viewMode === "map" && !loading && !error && visibleListings.length > 0 ? (
          <InteractiveListingsMap
            listings={visibleListings}
            favoriteIds={favoriteIds}
            onFavoriteClick={handleFavoriteClick}
            locationLabel={city || query || "Madagascar"}
          />
        ) : (
          <div className="flex-1 px-4 py-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bebas text-xl text-sc-dark tracking-wide">
                {visibleListings.length} annonce{visibleListings.length > 1 ? "s" : ""}
              </h2>
            </div>

            {visibleListings.length === 0 && !loading && (
              <div className="text-center py-16">
                <i className="ti ti-map-search text-5xl text-sc-gr2 mb-4 block" />
                <h3 className="font-bebas text-xl text-sc-dark mb-2">{t("annonces:empty")}</h3>
                <p className="text-sm text-sc-gr2 mb-4">{emptyMessage}</p>
                {searchedCityLabel && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`/profils-recherche-logement?ville=${encodeURIComponent(searchedCityLabel)}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-sc-bd text-sm font-medium text-sc-dark hover:bg-sc-bd/30 transition-colors rounded-xl"
                    >
                      <Users className="w-4 h-4 text-sc-cy" />
                      Voir les profils qui recherchent aussi à {searchedCityLabel}
                    </a>
                    <a
                      href={`/depot_annonce?ville=${encodeURIComponent(searchedCityLabel)}`}
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
                  <ListingCard
                    key={l.id}
                    l={l}
                    isFavorite={favoriteIds.has(String(l.id))}
                    onFavoriteClick={handleFavoriteClick}
                  />
                ))}
              </div>
            )}

            {error && <div className="border border-red-200 bg-red-50/80 p-5 text-sm text-red-700 rounded-xl">{error}</div>}
          </div>
        )}

        {showMobileFilters && <MobileFilters />}
      </div>
    </SiteLayout>
  );
}
