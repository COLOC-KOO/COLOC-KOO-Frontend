import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  MapPin,
  Search,
  Shield,
  Sparkles,
  Star,
  Users,
  Map,
  List,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  Building2,
  Award,
  Briefcase,
} from "lucide-react";
import { SiteLayout } from "../components/site/SiteLayout";
import { ListingCard } from "../components/site/ListingCard";
import { Button } from "../components/ui/Button";
import { MapView } from "../components/MapView";
import { api, annonceToListing, type ApiPartenaireCampagne } from "../lib/api";
import { CityInfo, Listing } from "../types";
import { motion } from "framer-motion";

const heroImage =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80";
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/api\/?$/, "");

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_BASE_URL}/${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
}

const steps = [
  {
    n: "01",
    t: "Cherche dans ta ville",
    d: "Indique ta ville ou région. La carte interactive affiche toutes les colocations disponibles.",
    c: "bg-brand-cyan-light text-brand-cyan-dark",
  },
  {
    n: "02",
    t: "Consulte les annonces vérifiées et Postuler",
    d: "Photos, prix, services, règles — tout est détaillé. Chaque annonce est vérifiée avant publication.",
    c: "bg-brand-green-light text-brand-green-dark",
  },
  {
    n: "03",
    t: "Contacte directement",
    d: "Envoie un message sécurisé. Aucune commission, 100% gratuit.",
    c: "bg-pink-50 text-pink-800",
  },
];

export default function Home() {
  const { t } = useTranslation(['home', 'common']);
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [cityCards, setCityCards] = useState<CityInfo[]>([]);
  const [partners, setPartners] = useState<ApiPartenaireCampagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayInterval = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Nombre de partenaires à afficher par slide (responsive)
  const getItemsPerSlide = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 640) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    return 3;
  };

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(getItemsPerSlide());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.all([
      api.annonces({ statut: "active" }),
      api.villes().catch(() => []),
      api.partenairesCampagnes().catch(() => []),
    ])
      .then(([annonces, villes, campagnes]) => {
        if (cancelled) return;

        const mapped = annonces.map(annonceToListing);
        const grouped = mapped.reduce<Record<string, CityInfo>>(
          (acc, listing) => {
            const key = listing.city || "Autres";
            if (!acc[key]) {
              acc[key] = { name: key, count: 0, image: listing.image };
            }
            acc[key].count += 1;
            return acc;
          },
          {},
        );

        const dynamicCities = Object.values(grouped)
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        const dedupedCampaignPartners = Array.isArray(campagnes)
          ? campagnes.filter((item, index, array) => {
              const firstIndex = array.findIndex((candidate) => candidate.id_partenaire === item.id_partenaire);
              return firstIndex === index;
            })
          : [];

        setFeaturedListings(mapped.slice(0, 6));
        setCityCards(
          dynamicCities.length > 0
            ? dynamicCities
            : villes.slice(0, 6).map((v) => ({
                name: v.nom_ville,
                count: 0,
                image:
                  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
              })),
        );
        setPartners(dedupedCampaignPartners);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de charger les annonces validées",
          );
          setFeaturedListings([]);
          setCityCards([]);
          setPartners([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-play du carrousel - INFINI ET LENT
  useEffect(() => {
    if (isAutoPlaying && partners.length > 0) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentPartnerIndex((prev) => {
          const maxIndex = Math.max(0, partners.length - itemsPerSlide);
          if (prev >= maxIndex) {
            return 0;
          }
          return prev + 0.5;
        });
      }, 3000);
    }
    return () => {
      if (autoPlayInterval.current) {
        clearInterval(autoPlayInterval.current);
      }
    };
  }, [isAutoPlaying, partners.length, itemsPerSlide]);

  // Pause au survol
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (autoPlayInterval.current) {
      clearInterval(autoPlayInterval.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Gestion du carrousel
  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentPartnerIndex((prev) => {
      const maxIndex = Math.max(0, partners.length - itemsPerSlide);
      return prev <= 0 ? maxIndex : prev - 1;
    });
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentPartnerIndex((prev) => {
      const maxIndex = Math.max(0, partners.length - itemsPerSlide);
      return prev >= maxIndex ? 0 : prev + 1;
    });
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentPartnerIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const totalSlides = Math.max(1, partners.length - itemsPerSlide + 1);
  const maxIndex = Math.max(0, partners.length - itemsPerSlide);

  const summaryText = useMemo(() => {
    if (loading) return t('common:common.loading');
    const cityLabel = cityCards.length > 1 ? t('home:cities.subtitle').split(' ')[0] : "ville";
    const annonceLabel = featuredListings.length > 1 ? "annonces" : "annonce";
    return `${cityCards.length} ${t('home:cities.subtitle').split(' ')[0]}${cityCards.length > 1 ? 's' : ''} couvertes, ${featuredListings.length} ${annonceLabel} validées`;
  }, [cityCards.length, featuredListings.length, loading, t]);

  // Traductions des étapes
  const translatedSteps = useMemo(() => {
    return steps.map((step, index) => ({
      ...step,
      t: t(`home:howItWorks.steps.${index}.title`),
      d: t(`home:howItWorks.steps.${index}.description`),
    }));
  }, [t]);

  return (
    <SiteLayout>
      {/* Hero - Hauteur réduite */}
      <section className="relative min-h-[400px] sm:min-h-[450px] w-full">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-16 text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-white border border-white/20 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              {t('home:hero.badge')}
            </span>

            <h1 className="bebas text-4xl md:text-6xl mt-4 leading-[0.95] drop-shadow-2xl">
              {t('home:hero.title')}
            </h1>

            <p className="mt-4 text-lg md:text-xl font-bold text-white max-w-lg bg-black/15 backdrop-blur-md p-3 rounded-xl">
              {t('home:hero.subtitle')}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 max-w-3xl">
            <Link to="/annonces">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <MapPin className="w-4 h-4" />
                {t('home:hero.search')}
              </button>
            </Link>
            <Link to="/deposer">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <KeyRound className="w-4 h-4" />
                {t('home:hero.propose')}
              </button>
            </Link>
          </div>

          <div className="mt-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl border border-white/20">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5">
              <MapPin className="w-5 h-5 text-brand-cyan" />
              <input
                placeholder={t('home:hero.placeholder')}
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm placeholder-gray-500"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-300 my-2" />
            <select className="px-4 py-2.5 bg-transparent text-gray-800 text-sm outline-none cursor-pointer">
              <option>{t('home:hero.allTypes')}</option>
              <option>{t('home:hero.room')}</option>
              <option>{t('home:hero.apartment')}</option>
              <option>{t('home:hero.house')}</option>
            </select>
            <Link to="/annonces">
              <Button className="w-full md:w-auto bg-gradient-to-r from-brand-cyan to-cyan-600 hover:from-brand-cyan-dark hover:to-cyan-700 text-white h-full px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Search className="w-4 h-4" /> {t('common:common.search')}
              </Button>
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white">{t('home:hero.verified')}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white">{t('home:hero.colocataires')}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">{t('home:hero.satisfaction')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Annonces vedettes - Espace réduit */}
      <section className="bg-white border-b border-gray-100 py-10 w-full px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* En-tête style Airbnb */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="bebas text-3xl">
                <span className="text-[--brand-cyan-dark]">{t('home:featured.title').split(' ')[0]} </span>
                <span className="text-[--brand-green-dark]">{t('home:featured.title').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {t('home:featured.subtitle')}
              </p>
            </div>

            {/* Vue liste/carte - Style Airbnb épuré */}
            <div className="flex gap-1 bg-gray-100/80 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">{t('home:featured.list')}</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === "map"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden sm:inline">{t('home:featured.map')}</span>
              </button>
            </div>
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 rounded-2xl aspect-[4/3] w-full"></div>
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            viewMode === "list" ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredListings.map((l) => (
                  <div
                    key={l.id}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/annonces/${l.id}`)}
                  >
                    <div className="relative rounded-2xl overflow-hidden bg-gray-100">
                      {/* Image */}
                      {l.image ? (
                        <img
                          src={l.image}
                          alt={l.title}
                          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}

                      {/* Badge "Vérifiée" */}
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        ✓ {t('home:featured.verified')}
                      </div>

                      {/* PRIX SUR LA CARTE - Style Airbnb */}
                      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl shadow-md">
                        <span className="text-sm font-bold text-gray-900">
                          {l.price
                            ? `${(l.price / 1000).toFixed(0)}k Ar`
                            : t('common:common.none')}
                        </span>
                        {l.price && (
                          <span className="text-[10px] text-gray-500 ml-1">
                            {t('home:featured.pricePerMonth')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Informations sous la carte */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1 flex-1">
                          {l.title || "Annonce sans titre"}
                        </h3>
                        <div className="flex items-center gap-0.5 text-xs text-gray-600 shrink-0">
                          <Star className="w-3 h-3 fill-[#FF385C] text-[#FF385C]" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {l.city || "Ville non spécifiée"}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {l.description || ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[450px] lg:h-[500px] rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
                  <MapView
                    listings={featuredListings}
                    onListingClick={(listing) => {
                      navigate(`/annonces/${listing.id}`);
                    }}
                  />
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {featuredListings.map((l) => (
                    <div
                      key={l.id}
                      className="group cursor-pointer flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                      onClick={() => navigate(`/annonces/${l.id}`)}
                    >
                      <div className="relative flex-shrink-0 w-32 h-24 rounded-xl overflow-hidden bg-gray-100">
                        {l.image ? (
                          <img
                            src={l.image}
                            alt={l.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-1.5 right-1.5 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-lg shadow-sm">
                          <span className="text-xs font-bold text-gray-900">
                            {l.price
                              ? `${(l.price / 1000).toFixed(0)}k Ar`
                              : "—"}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {l.title || "Annonce sans titre"}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {l.city || "Ville non spécifiée"}
                        </p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {l.description || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-12 text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-lg font-medium text-gray-700">
                {t('home:featured.empty')}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                {t('home:featured.emptySub')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Explore par ville - Sans espaces sur les côtés, taille des cards inchangée */}
      <section className="bg-gray-50/50 border-y border-border py-10 w-full px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="bebas text-3xl">
                <span className="text-[--brand-cyan-dark]">{t('home:cities.title').split(' ')[0]} </span>
                <span className="text-[--brand-green-dark]">{t('home:cities.title').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {summaryText}
              </p>
            </div>
            <Link
              to="/annonces"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-[--brand-cyan-dark] hover:gap-2 transition-all duration-300"
            >
              {t('home:cities.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {/* Grille de villes - Style épuré avec couleurs brand */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cityCards.map((c) => (
              <Link
                key={c.name}
                to="/annonces"
                className="group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border hover:border-[--brand-cyan]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[--brand-cyan-light] to-[--brand-green-light] group-hover:from-[--brand-cyan]/10 group-hover:to-[--brand-green]/10 transition-colors duration-300" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <MapPin className="w-4 h-4 text-[--brand-cyan-dark]" />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                  <div className="text-xl md:text-2xl font-semibold text-foreground group-hover:text-[--brand-cyan-dark] transition-colors duration-300">
                    {c.name}
                  </div>
                  <div className="w-8 h-0.5 bg-border group-hover:bg-[--brand-cyan] rounded-full transition-all duration-300 my-2" />
                  <div className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {c.count} {c.count > 1 ? t('home:cities.annonces') : t('home:cities.annonce')}
                  </div>
                  <div className="mt-3 overflow-hidden">
                    <span className="inline-block text-xs font-medium text-[--brand-cyan-dark] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {t('home:cities.explore')} →
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[--brand-cyan] to-[--brand-green] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche - AVEC ANIMATIONS ET ZOOM */}
      <section className="bg-white border-b border-gray-100 py-10 w-full px-4 md:px-6 lg:px-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="bebas text-3xl">
                <span className="text-[--brand-cyan-dark]">{t('home:howItWorks.title').split(' ')[0]} </span>
                <span className="text-[--brand-green-dark]">{t('home:howItWorks.title').split(' ').slice(1).join(' ')}</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                {t('home:howItWorks.subtitle')}
              </p>
            </div>
            <Link
              to="/annonces"
              className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-[--brand-cyan-dark] hover:gap-2 transition-all duration-300"
            >
              {t('home:howItWorks.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {translatedSteps.map((s, index) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{
                  y: -4,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                  transition: { duration: 0.3 },
                }}
                className="group relative bg-card border border-border rounded-2xl p-6 transition-all duration-300 hover:border-[--brand-cyan]/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[--brand-cyan-light] text-[--brand-cyan-dark] text-lg font-bold transition-all duration-300 group-hover:bg-[--brand-cyan] group-hover:text-white">
                    {s.n}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block flex-1 h-px bg-border group-hover:bg-[--brand-cyan]/30 transition-colors duration-300" />
                  )}
                </div>

                <h3 className="text-base font-semibold text-foreground group-hover:text-[--brand-cyan-dark] transition-colors duration-300">
                  {s.t}
                </h3>

                <p className="mt-1.5 text-muted-foreground text-sm leading-relaxed">
                  {s.d}
                </p>

                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[--brand-cyan] to-[--brand-green] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-b-2xl" />

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs font-medium text-[--brand-cyan-dark] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Étape {s.n}
                  </span>
                  <ArrowRight className="w-3 h-3 text-[--brand-cyan-dark] opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lien "Toutes les annonces" en bas */}
          <div className="text-center mt-6">
            <Link
              to="/annonces"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-[--brand-cyan-dark] transition-colors duration-300 group"
            >
              <span>{t('home:howItWorks.startSearch')}</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Partenaires - Carrousel infini lent avec cartes agrandies */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="bebas text-3xl">
              <span className="text-[--brand-cyan-dark]">{t('home:partners.title').split(' ')[0]} </span>
              <span className="text-[--brand-green-dark]">{t('home:partners.title').split(' ').slice(1).join(' ')}</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t('home:partners.subtitle')}
            </p>
          </div>
          <Link
            to="/partenaires"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan-dark hover:gap-2 transition-all"
          >
            {t('home:partners.viewAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {partners.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {loading ? t('home:partners.loading') : t('home:partners.empty')}
          </div>
        ) : (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="overflow-hidden rounded-2xl">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-[8000ms] ease-linear"
                style={{
                  transform: `translateX(-${Math.floor(currentPartnerIndex) * (100 / itemsPerSlide)}%)`,
                }}
              >
                {[...partners, ...partners, ...partners].map((partner, idx) => (
                  <div
                    key={`${partner.id_partenaire}-${idx}`}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / itemsPerSlide}%` }}
                  >
                    <div className="group relative rounded-2xl border border-border/60 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:border-brand-cyan/30 hover:-translate-y-2 min-h-[180px] flex flex-col justify-between">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-cyan-light/40 to-brand-cyan/10 flex items-center justify-center overflow-hidden shrink-0">
                          {partner.logo || partner.visuel ? (
                            <img
                              src={normalizeImageUrl(partner.logo || partner.visuel)}
                              alt={partner.partenaire_nom || partner.titre || "Partenaire"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const fallback = target.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="hidden h-full w-full items-center justify-center text-2xl font-bold text-brand-cyan-dark"
                            data-fallback
                          >
                            {(partner.partenaire_nom || partner.titre || "P").charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold truncate">
                            {partner.partenaire_nom || partner.titre || "Partenaire"}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {partner.secteur || partner.emplacement || "Partenaire"}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {partner.titre && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-brand-cyan-light/50 px-3 py-1 text-xs font-medium text-brand-cyan-dark w-fit">
                            <Briefcase className="w-3 h-3" />
                            {partner.titre}
                          </div>
                        )}

                        {partner.remise && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-brand-green-light/30 px-3 py-1 text-xs font-medium text-brand-green-dark w-fit">
                            <Award className="w-3 h-3" />
                            {partner.remise}
                          </div>
                        )}

                        {(partner.description || partner.engagement) && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {partner.description || partner.engagement}
                          </p>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-medium text-brand-cyan-dark bg-brand-cyan-light/50 px-2.5 py-0.5 rounded-full">
                          {partner.partenaire_niveau || partner.niveau || "Partenaire"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {partners.length > itemsPerSlide && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute top-1/2 -left-3 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110 border border-border/50 z-10"
                  aria-label={t('common:common.previous')}
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute top-1/2 -right-3 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110 border border-border/50 z-10"
                  aria-label={t('common:common.next')}
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {totalSlides > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: Math.min(totalSlides, 10) }).map(
                  (_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`transition-all duration-300 rounded-full ${
                        index === Math.floor(currentPartnerIndex)
                          ? "w-6 h-1.5 bg-brand-cyan"
                          : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Aller à la slide ${index + 1}`}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* CTA - Coloré en bleu brand-cyan-dark */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div
          className="rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden relative"
          style={{
            backgroundColor: "oklch(66% 0.11 210)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative text-white">
            <h2 className="bebas text-3xl md:text-4xl">
              {t('home:cta.title')}
            </h2>
            <p className="mt-2 text-white/80 text-sm">
              {t('home:cta.subtitle')}
            </p>
          </div>
          <div className="relative flex md:justify-end gap-3 flex-wrap">
            <Link to="/deposer">
              <Button
                className="text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: "oklch(68% 0.17 130)",
                }}
              >
                {t('home:cta.deposer')}
              </Button>
            </Link>
            <Link to="/partenaires">
              <Button
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                {t('home:cta.partenaire')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}