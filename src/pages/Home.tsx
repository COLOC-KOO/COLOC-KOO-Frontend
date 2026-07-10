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
import { motion } from "framer-motion";

const heroImage =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80";

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

  // Auto-play du carrousel - INFINI ET LENT
  useEffect(() => {
    if (isAutoPlaying && partners.length > 0) {
      autoPlayInterval.current = setInterval(() => {
        setCurrentPartnerIndex((prev) => {
          const maxIndex = Math.max(0, partners.length - itemsPerSlide);
          if (prev >= maxIndex) {
            // Retour au début pour un défilement infini
            return 0;
          }
          return prev + 0.5; // Défilement très lent (0.5 au lieu de 1)
        });
      }, 3000); // Intervalle plus long pour un défilement lent
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
      {/* Hero - Hauteur réduite */}
      <section className="relative min-h-[400px] sm:min-h-[450px]">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-cyan/20 to-brand-green/20 mix-blend-overlay" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-16 text-white">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-semibold text-white border border-white/20 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Colocation nouvelle génération
            </span>

            <h1 className="bebas text-4xl md:text-6xl mt-4 leading-[0.95] drop-shadow-2xl">
              Trouve ta coloc,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">
                partout à 
                <span className="text-[--brand-green-dark]"> Madagascar</span>
              </span>
            </h1>

            <p className="mt-4 text-lg md:text-xl font-bold text-white max-w-lg bg-black/15 backdrop-blur-md p-3 rounded-xl">
              Chambres, appartements et maisons vérifiés dossiers en ligne,
              signature simplifiée.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 max-w-3xl">
            <Link to="/annonces">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl hover:from-cyan-600 hover:to-blue-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <MapPin className="w-4 h-4" />
                Je cherche un logement
              </button>
            </Link>
            <Link to="/deposer">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:scale-105 border border-white/20">
                <KeyRound className="w-4 h-4" />
                Je propose un logement
              </button>
            </Link>
          </div>

          <div className="mt-5 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl border border-white/20">
            <div className="flex-1 flex items-center gap-2 px-4 py-2.5">
              <MapPin className="w-5 h-5 text-brand-cyan" />
              <input
                placeholder="Ville, quartier..."
                className="flex-1 bg-transparent text-gray-800 outline-none text-sm placeholder-gray-500"
              />
            </div>
            <div className="hidden md:block w-px bg-gray-300 my-2" />
            <select className="px-4 py-2.5 bg-transparent text-gray-800 text-sm outline-none cursor-pointer">
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

          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white">Annonces vérifiées</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-white">1 400+ colocataires</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white">4,8/5 satisfaction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Annonces vedettes - Espace réduit */}
      <section className="bg-white/60 border-y border-border py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="bebas text-3xl">
                <span className="text-[--brand-cyan-dark]">Annonces </span>
                <span className="text-[--brand-green-dark]">vedettes</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                Sélection de la semaine, vérifiée par notre équipe
              </p>
            </div>

            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
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
            <div className="text-center text-muted-foreground py-8">
              Chargement des annonces validées...
            </div>
          ) : featuredListings.length > 0 ? (
            viewMode === "list" ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featuredListings.map((l) => (
                  <ListingCard key={l.id} l={l} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[450px] lg:h-[500px] rounded-xl overflow-hidden bg-gray-50">
                  <MapView
                    listings={featuredListings}
                    onListingClick={(listing) => {
                      navigate(`/annonces/${listing.id}`);
                    }}
                  />
                </div>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
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

      {/* Explore par ville - Sans image, fond bleu */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <h1 className="bebas text-3xl">
              <span className="text-[--brand-cyan-dark]">Explore par </span>
              <span className="text-[--brand-green-dark]">ville</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {summaryText}
            </p>
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cityCards.map((c) => (
            <Link
              key={c.name}
              to="/annonces"
              className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-brand-cyan-dark to-brand-cyan hover:scale-105 transition-transform duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <div
                  className="bebas text-2xl"
                  style={{ color: "oklch(78% 0.16 130)" }}
                >
                  {c.name}
                </div>
                <div className="text-sm text-white/80 mt-1">
                  {c.count} annonce{c.count > 1 ? "s" : ""}
                </div>
                <div className="mt-3 w-8 h-0.5 bg-white/30 rounded-full" />
                <div className="mt-2 text-xs text-white/60">
                  Voir les annonces
                </div>
              </div>
              {/* Effet de brillance au survol */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Comment ça marche - AVEC ANIMATIONS ET ZOOM */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-6">
          <h1 className="bebas text-3xl">
            <span className="text-[--brand-cyan-dark]">Comment ça </span>
            <span className="text-[--brand-green-dark]">marche</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            3 étapes pour rejoindre ta coloc
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {steps.map((s, index) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                transition: { duration: 0.3 },
              }}
              className="bg-card border border-border rounded-2xl p-6 transition-all duration-300 cursor-pointer hover:border-brand-cyan/30"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className={`inline-block bebas text-2xl px-3 py-0.5 rounded-full ${s.c}`}
              >
                {s.n}
              </motion.div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{s.d}</p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "0%" }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.4 }}
                className="h-0.5 bg-gradient-to-r from-brand-cyan to-brand-green mt-4 rounded-full"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partenaires - Carrousel infini lent avec cartes agrandies */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="bebas text-3xl">
              <span className="text-[--brand-cyan-dark]">Nos </span>
              <span className="text-[--brand-green-dark]">Partenaires</span>
            </h2>
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
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            {loading ? "Chargement..." : "Aucun partenaire disponible"}
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
                {/* Partners avec duplication pour effet infini */}
                {[...partners, ...partners, ...partners].map((partner, idx) => (
                  <div
                    key={`${partner.id_partenaire}-${idx}`}
                    className="flex-shrink-0 px-3"
                    style={{ width: `${100 / itemsPerSlide}%` }}
                  >
                    <div className="group relative rounded-2xl border border-border/60 bg-white p-6 transition-all duration-300 hover:shadow-xl hover:border-brand-cyan/30 hover:-translate-y-2 min-h-[180px] flex flex-col justify-between">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-cyan-light/40 to-brand-cyan/10 flex items-center justify-center overflow-hidden shrink-0">
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
                            className="hidden h-full w-full items-center justify-center text-2xl font-bold text-brand-cyan-dark"
                            data-fallback
                          >
                            {partner.nom.charAt(0)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base font-semibold truncate">
                            {partner.nom}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {partner.secteur || "Partenaire"}
                          </div>
                        </div>
                      </div>

                      {partner.remise && (
                        <div className="inline-flex items-center gap-1 rounded-full bg-brand-green-light/30 px-3 py-1 text-xs font-medium text-brand-green-dark w-fit">
                          <Award className="w-3 h-3" />
                          {partner.remise}
                        </div>
                      )}

                      {partner.engagement && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {partner.engagement}
                        </p>
                      )}

                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] font-medium text-brand-cyan-dark bg-brand-cyan-light/50 px-2.5 py-0.5 rounded-full">
                          {partner.niveau || "Partenaire"}
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
              Propriétaire ou agence ?
            </h2>
            <p className="mt-2 text-white/80 text-sm">
              Publie ton annonce et gère tes colocataires en toute simplicité.
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
                Déposer une annonce
              </Button>
            </Link>
            <Link to="/partenaires">
              <Button
                variant="outline"
                className="border-white/30 text-white bg-white/10 hover:bg-white/20 transition-all duration-300"
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
