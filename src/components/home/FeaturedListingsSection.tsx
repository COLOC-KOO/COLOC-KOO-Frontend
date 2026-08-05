import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Star, MapPin } from "lucide-react";

import { LazyImage } from "../ui/LazyImage";
import { Listing } from "../../types";
import { useTranslation } from "react-i18next";
import { ListingCard } from "../site/ListingCard";

type FeaturedListingsSectionProps = {
  featuredListings: Listing[];
  loading: boolean;
  hoveredListingId: string | null;
  setHoveredListingId: (id: string | null) => void;
  error: string;
};

export function FeaturedListingsSection({
  featuredListings,
  loading,
  hoveredListingId,
  setHoveredListingId,
  error,
}: FeaturedListingsSectionProps) {
  const { t } = useTranslation(["home", "common"]);
  const navigate = useNavigate();

  return (
    <section className="bg-white border-b border-gray-100 py-10 w-full">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400 mb-3">{t("home:featured.subtitle")}</p>
            <h2 className="bebas text-4xl font-semibold tracking-tight text-slate-900">
              {t("home:featured.title")}
            </h2>
          </div>
          <div className="hidden md:flex items-center">
            <button
              onClick={() => navigate('/annonces')}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--brand-cyan-dark)] to-[var(--brand-green-dark)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(66,153,225,0.16)] hover:scale-[1.01] transition-transform duration-200"
            >
              {t("home:featured.viewAll") || "Voir toutes"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex gap-4 overflow-x-auto py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-64 animate-pulse">
                <div className="bg-gray-200 rounded-2xl aspect-[4/3] w-full"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredListings.length > 0 ? (
          <>
            <div className="relative overflow-x-auto pb-4">
              <div className="flex gap-5 min-w-max py-2">
                {featuredListings.slice(0, 5).map((listing) => (
                  <div key={listing.id} className="w-80 flex-shrink-0">
                    <ListingCard key={listing.id} l={listing} />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/annonces')}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {t("home:featured.viewAll") || "Voir toutes les annonces"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-12 text-center">
            <div className="text-4xl mb-3">🏠</div>
            <h3 className="text-lg font-medium text-gray-700">
              {t("home:featured.empty")}
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {t("home:featured.emptySub")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
