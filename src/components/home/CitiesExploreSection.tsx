import { Link } from "react-router-dom";
import { CityInfo } from "../../types";

type CitiesExploreSectionProps = {
  cityCards: CityInfo[];
  loading: boolean;
  featuredListingsCount: number;
  error: string;
};

export function CitiesExploreSection({ cityCards }: CitiesExploreSectionProps) {
  return (
    <section className="py-6 px-5 bg-white">
      <h2 className="font-bebas text-[22px] text-sc-dark tracking-wide mb-1 text-center">
        Cherche par ville
      </h2>
      <p className="text-xs text-sc-gr2 mb-4 text-center">Disponible partout à Madagascar</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
        {cityCards.map((city) => (
          <Link
            key={city.name}
            to={`/annonces?q=${encodeURIComponent(city.name)}`}
            className="flex items-center justify-between p-3 rounded-xl border border-sc-bd bg-white hover:border-sc-cy hover:bg-sc-cy-lt transition-colors no-underline group"
          >
            <div className="flex items-center gap-2">
              <i className="ti ti-map-pin text-sc-cy text-sm" />
              <span className="text-sm font-bold text-sc-dark group-hover:text-[#2a7a90]">{city.name}</span>
            </div>
            <span className="text-[10px] text-sc-gr2 bg-gray-100 rounded px-1.5 py-0.5 font-bold">
              {city.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
