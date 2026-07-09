import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { api, annonceToListing, ApiPartenaire } from "../lib/api";
import { CityInfo, Listing } from "../types";

const heroImage =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80";

const steps = [
  {
    n: "01",
    t: "Cherche",
    d: "Filtre par ville, prix, ambiance. Toutes les annonces sont vérifiées.",
    c: "bg-brand-cyan-light text-brand-cyan-dark",
  },
  {
    n: "02",
    t: "Postule",
    d: "Dépose ton dossier locatif en ligne. Réponse sous 48h.",
    c: "bg-brand-green-light text-brand-green-dark",
  },
  {
    n: "03",
    t: "Emménage",
    d: "Signature électronique, convention de coloc, tu prends les clés.",
    c: "bg-pink-50 text-pink-800",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [cityCards, setCityCards] = useState<CityInfo[]>([]);
  const [partners, setPartners] = useState<ApiPartenaire[]>([]);
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
      return 4;
    }
    return 4;
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
      api.partenaires().catch(() => []),
    ])
      .then(([annonces, villes, partenaires]) => {
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
        setPartners(partenaires);
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

  // Auto-play du carrousel
  useEffect(() => {
    if (isAutoPlaying && partners.length > 0) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentPartnerIndex((prev) => {
          const maxIndex = Math.max(0, partners.length - itemsPerSlide);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 4000);
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
    if (loading) return "Chargement...";
    const cityLabel = cityCards.length > 1 ? "villes" : "ville";
    const annonceLabel = featuredListings.length > 1 ? "annonces" : "annonce";
    return `${cityCards.length} ${cityLabel} couvertes, ${featuredListings.length} ${annonceLabel} validées`;
  }, [cityCards.length, featuredListings.length, loading]);

  return (
    <SiteLayout>
      <section className="relative">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          {/* Overlay plus foncé pour améliorer la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          {/* Ajout d'un overlay de couleur pour harmoniser */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-32 text-white">
          <div className="max-w-2xl">
            {/* Badge avec fond semi-transparent et blur */}
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-white border border-white/20 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Colocation nouvelle génération
            </span>

            {/* Titre avec ombre portée */}
            <h1 className="bebas text-5xl md:text-7xl mt-5 leading-[0.95] drop-shadow-2xl">
              Trouve ta coloc,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                partout à Madagascar
              </span>
            </h1>

            {/* Description avec fond semi-transparent */}
            <p className="mt-5 text-xl md:text-1xl font-bold text-white max-w-lg bg-black/15 backdrop-blur-md p-4 rounded-xl">
              Chambres, appartements et maisons vérifiés — dossiers en ligne,
              signature simplifiée.
            </p>
          </div>

          {/* Boutons avec ombres et effets */}
          <div className="mt-8 flex flex-wrap gap-3 max-w-3xl">
            <Link to="/annonces">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <MapPin className="w-4 h-4" />
                Je cherche un logement
              </button>
            </Link>
            <Link to="/deposer">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <KeyRound className="w-4 h-4" />
                Je propose un logement
              </button>
            </Link>
          </div>

          {/* Barre de recherche avec fond opaque */}
          <div className="mt-6 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl border border-white/20">
            <div className="flex-1 flex items-center gap-2 px-4 py-3">
              <MapPin className="w-5 h-5 text-brand-cyan" />
              <input
                placeholder="Ville, quartier..."
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm placeholder-gray-500"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-300 my-2" />
            <select className="px-4 py-3 bg-transparent text-gray-800 text-sm outline-none cursor-pointer">
              <option>Tous types</option>
              <option>Chambre</option>
              <option>Appartement</option>
              <option>Maison</option>
            </select>
            <Link to="/annonces">
              <Button className="w-full md:w-auto bg-gradient-to-r from-brand-cyan to-cyan-600 hover:from-brand-cyan-dark hover:to-cyan-700 text-white h-full px-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Search className="w-4 h-4" /> Rechercher
              </Button>
            </Link>
          </div>

          {/* Statistiques avec fond semi-transparent */}
          <div className="mt-8 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white">Annonces vérifiées</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white">1 400+ colocataires</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">4,8/5 satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="bebas text-4xl">Explore par ville</h2>
            <p className="text-muted-foreground mt-1">{summaryText}</p>
          </div>
          <Link
            to="/annonces"
            className="hidden md:inline-flex items-center gap-1 text-sm font-semibold text-brand-cyan-dark hover:gap-2 transition-all"
          >
            Toutes les annonces <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cityCards.map((c) => (
            <Link
              key={c.name}
              to="/annonces"
              className="group relative aspect-square rounded-2xl overflow-hidden"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="bebas text-xl">{c.name}</div>
                <div className="text-xs text-white/70">
                  {c.count} annonce{c.count > 1 ? "s" : ""}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white/60 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="bebas text-4xl">Annonces vedettes</h2>
              <p className="text-muted-foreground mt-1">
                Sélection de la semaine, vérifiée par notre équipe
              </p>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-4 h-4" />
                Liste
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === "map"
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Map className="w-4 h-4" />
                Carte
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-10">
              Chargement des annonces validées...
            </div>
          ) : featuredListings.length > 0 ? (
            viewMode === "list" ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featuredListings.map((l) => (
                  <ListingCard key={l.id} l={l} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[500px] lg:h-[600px] rounded-xl overflow-hidden bg-gray-50">
                  <MapView
                    listings={featuredListings}
                    onListingClick={(listing) => {
                      navigate(`/annonces/${listing.id}`);
                    }}
                  />
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {featuredListings.map((l) => (
                    <ListingCard key={l.id} l={l} />
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
              Aucune annonce validée n'est disponible pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="bebas text-4xl">Comment ça marche</h2>
          <p className="text-muted-foreground mt-2">
            3 étapes pour rejoindre ta coloc
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-card border border-border rounded-2xl p-8"
            >
              <div
                className={`inline-block bebas text-3xl px-4 py-1 rounded-full ${s.c}`}
              >
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Partenaires - Version moderne et compacte */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="bebas text-3xl">Nos Partenaires</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ils nous font confiance
            </p>
          </div>
          <Link
            to="/partenaires"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-cyan-dark hover:gap-2 transition-all"
          >
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {partners.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground">
            {loading ? "Chargement..." : "Aucun partenaire disponible"}
          </div>
        ) : (
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Carrousel Container */}
            <div className="overflow-hidden rounded-2xl">
              <div
                ref={carouselRef}
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentPartnerIndex * (100 / itemsPerSlide)}%)`,
                }}
              >
                {partners.map((partner) => (
                  <div
                    key={partner.id_partenaire}
                    className="flex-shrink-0 px-2"
                    style={{ width: `${100 / itemsPerSlide}%` }}
                  >
                    <div className="group relative rounded-2xl border border-border/60 bg-white p-5 transition-all duration-300 hover:shadow-lg hover:border-brand-cyan/30 hover:-translate-y-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-cyan-light/40 to-brand-cyan/10 flex items-center justify-center overflow-hidden shrink-0">
                          {partner.logo ? (
                            <img
                              src={partner.logo}
                              alt={partner.nom}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target =
                                  e.currentTarget as HTMLImageElement;
                                target.style.display = "none";
                                const fallback =
                                  target.nextElementSibling as HTMLElement | null;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="hidden h-full w-full items-center justify-center text-xl font-bold text-brand-cyan-dark"
                            data-fallback
                          >
                            {partner.nom.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">
                            {partner.nom}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {partner.secteur || "Partenaire"}
                          </div>
                        </div>
                      </div>

                      {partner.remise && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-brand-green-light/30 px-2.5 py-0.5 text-xs font-medium text-brand-green-dark">
                          <Award className="w-3 h-3" />
                          {partner.remise}
                        </div>
                      )}

                      {partner.engagement && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                          {partner.engagement}
                        </p>
                      )}

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-medium text-brand-cyan-dark bg-brand-cyan-light/50 px-2 py-0.5 rounded-full">
                          {partner.niveau || "Partenaire"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrôles */}
            {partners.length > itemsPerSlide && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute top-1/2 -left-3 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110 border border-border/50 z-10"
                  aria-label="Précédent"
                >
                  <ChevronLeft className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute top-1/2 -right-3 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-all duration-200 hover:scale-110 border border-border/50 z-10"
                  aria-label="Suivant"
                >
                  <ChevronRight className="w-4 h-4 text-foreground" />
                </button>
              </>
            )}

            {/* Indicateurs */}
            {totalSlides > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentPartnerIndex
                        ? "w-6 h-1.5 bg-brand-cyan"
                        : "w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Aller à la slide ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Auto-play status */}
            <div className="text-center mt-2">
              <span className="text-[10px] text-muted-foreground/60 flex items-center justify-center gap-1.5">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${isAutoPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
                />
                {isAutoPlaying ? "" : ""}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="rounded-3xl bg-brand-dark text-white p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center overflow-hidden relative">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-brand-cyan/20 blur-3xl" />
          <div className="relative">
            <h2 className="bebas text-4xl md:text-5xl">
              Propriétaire ou agence ?
            </h2>
            <p className="mt-3 text-white/70">
              Publie ton annonce et gère tes colocataires en toute simplicité.
            </p>
          </div>
          <div className="relative flex md:justify-end gap-3">
            <Link to="/deposer">
              <Button className="bg-brand-green text-brand-dark hover:bg-brand-green-dark hover:text-white">
                Déposer une annonce
              </Button>
            </Link>
            <Link to="/partenaires">
              <Button
                variant="outline"
                className="border-white/30 text-white bg-transparent hover:bg-white/10"
              >
                Devenir partenaire
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
