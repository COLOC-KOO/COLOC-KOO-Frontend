import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SiteLayout } from "../components/site/SiteLayout";
import { Button } from "../components/ui/Button";
import { api, annonceToListing, type ApiPartenaireCampagne } from "../lib/api";
import { CityInfo, Listing } from "../types";
import { useAuth } from "../lib/auth";
import { HomeHero } from "../components/home/HomeHero";
import { FeaturedListingsSection } from "../components/home/FeaturedListingsSection";
import { CitiesExploreSection } from "../components/home/CitiesExploreSection";
import { HowItWorksSection } from "../components/home/HowItWorksSection";
import { PartnersSection } from "../components/home/PartnersSection";

export default function Home() {
  const { t } = useTranslation(["home", "common"]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [cityCards, setCityCards] = useState<CityInfo[]>([]);
  const [partners, setPartners] = useState<ApiPartenaireCampagne[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteMessage, setFavoriteMessage] = useState("");
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayInterval = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [heroMode, setHeroMode] = useState<"chercher" | "proposer">("chercher");

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

        const mapped = annonces
          .map(annonceToListing)
          .sort((a, b) => Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted)));
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
              const firstIndex = array.findIndex(
                (candidate) => candidate.id_partenaire === item.id_partenaire,
              );
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

        const suggestionSet = new Set<string>();
        mapped.forEach((listing) => {
          if (listing.city) suggestionSet.add(listing.city);
          if (listing.district) suggestionSet.add(listing.district);
        });
        villes.forEach((v) => {
          if (v.nom_ville) suggestionSet.add(v.nom_ville);
        });
        setSearchSuggestions(Array.from(suggestionSet).slice(0, 50));
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

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    api.favoris()
      .then((items) => {
        if (!cancelled) setFavoriteIds(new Set(items.map((item) => String(item.id))));
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

  const handleFavorite = async (event: React.MouseEvent, listingId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate("/auth?mode=signin&redirect=/");
      return;
    }
    if (favoriteIds.has(String(listingId))) {
      setFavoriteMessage("Cette annonce est déjà dans vos favoris.");
      return;
    }
    try {
      await api.addFavori(listingId);
      setFavoriteIds((prev) => new Set([...prev, String(listingId)]));
      setFavoriteMessage("Ajouté aux favoris.");
    } catch (err) {
      setFavoriteMessage(err instanceof Error ? err.message : "Impossible d'ajouter ce favori.");
    }
  };

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

  const handleSearch = () => {
    const query = searchTerm.trim();

    // === Mode "Je propose un logement" ===
    // On affiche les profils des candidats qui recherchent une colocation dans la ville.
    if (heroMode === "proposer") {
      const params = new URLSearchParams();
      if (query) {
        params.set("ville", query.replace(/\s+/g, " ").trim());
      }
      navigate(`/profils-recherche-logement${params.toString() ? `?${params.toString()}` : ""}`);
      return;
    }

    // === Mode "Je cherche un logement" (comportement original) ===
    if (!query) {
      navigate("/annonces");
      return;
    }

    const params = new URLSearchParams();
    const normalizedQuery = query.replace(/\s+/g, " ").trim();
    params.set("q", normalizedQuery);
    if (searchType) {
      params.set("type", searchType);
    }

    navigate(`/annonces?${params.toString()}`);
  };

  return (
    <SiteLayout>
      {favoriteMessage && (
        <div className="fixed bottom-5 right-5 z-[80] rounded-xl border border-[var(--brand-cyan-dark)]/20 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-2xl">
          {favoriteMessage}
        </div>
      )}
      {/* Hero - Hauteur réduite */}
      <HomeHero
        mode={heroMode}
        onModeChange={setHeroMode}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        suggestions={searchSuggestions}
        onSearch={handleSearch}
      />

      <FeaturedListingsSection
        featuredListings={featuredListings}
        loading={loading}
        hoveredListingId={hoveredListingId}
        setHoveredListingId={setHoveredListingId}
        error={error}
      />

    {/* <CitiesExploreSection
        cityCards={cityCards}
        loading={loading}
        featuredListingsCount={featuredListings.length}
        error={error}
      /> */}

      <HowItWorksSection />

      <PartnersSection
        partners={partners}
        loading={loading}
      />

      {/* CTA - Coloré en bleu brand-cyan-dark
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div
          className="rounded-2xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden relative"
          style={{
            backgroundColor: "oklch(66% 0.11 210)",
          }}
        >
          <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" />
          <div className="relative text-white">
            <h2 className="bebas text-3xl md:text-3xl">
              {t("home:cta.title")}
            </h2>
            <p className="mt-2 text-white/80 text-sm">
              {t("home:cta.subtitle")}
            </p>
          </div>
          <div className="relative flex md:justify-end gap-3 flex-wrap">
            <Link to="/depot_annonce">
              <Button
                className="text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                style={{
                  backgroundColor: "oklch(68% 0.17 130)",
                }}
              >
                {t("home:cta.deposer")}
              </Button>
            </Link>
            <Link to="/partenaires">
              <Button
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                {t("home:cta.partenaire")}
              </Button>
            </Link>
          </div>
        </div>
      </section> */}
    </SiteLayout>
  );
}
