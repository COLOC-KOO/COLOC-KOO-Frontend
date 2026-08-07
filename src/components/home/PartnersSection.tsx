import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { ApiPartenaireCampagne } from "../../lib/api";
import { useTranslation } from "react-i18next";

type PartnersSectionProps = {
  partners: ApiPartenaireCampagne[];
  loading: boolean;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api\/?$/, "");

const LEVEL_OPTIONS = [
  { value: "all", labelKey: "home:partners.levelAll" },
  { value: "argent", labelKey: "home:partners.levelArgent" },
  { value: "bronze", labelKey: "home:partners.levelBronze" },
  { value: "or", labelKey: "home:partners.levelOr" },
  { value: "diamant", labelKey: "home:partners.levelDiamant" },
];

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_BASE_URL}/${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
}

function normalizePartnerLevel(value: string | null | undefined) {
  return (value || "").trim().toLowerCase();
}

function getLevelStyle(level: string) {
  switch (level) {
    case "diamant":
      return {
        badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
        card: "border-cyan-200/70 bg-gradient-to-br from-cyan-50/60 to-white",
      };
    case "or":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700",
        card: "border-amber-200/70 bg-gradient-to-br from-amber-50/60 to-white",
      };
    case "argent":
      return {
        badge: "border-slate-200 bg-slate-50 text-slate-700",
        card: "border-slate-200/70 bg-gradient-to-br from-slate-50/70 to-white",
      };
    case "bronze":
      return {
        badge: "border-orange-200 bg-orange-50 text-orange-700",
        card: "border-orange-200/70 bg-gradient-to-br from-orange-50/60 to-white",
      };
    default:
      return {
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
        card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-white",
      };
  }
}

export function PartnersSection({ partners, loading }: PartnersSectionProps) {
  const { t } = useTranslation(["home", "common"]);
  const [selectedLevel, setSelectedLevel] = useState("all");

  const filteredPartners = useMemo(() => {
    const level = selectedLevel.toLowerCase();
    if (level === "all") return partners;
    return partners.filter((partner) => {
      const partnerLevel = normalizePartnerLevel(partner.partenaire_niveau || partner.niveau);
      return partnerLevel === level;
    });
  }, [partners, selectedLevel]);

  const displayedPartners = filteredPartners.slice(0, 6);

  return (
    <section className="bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <h2 className="bebas text-3xl tracking-[0.2em] uppercase text-slate-900 mb-2">
            {t("home:partners.title")}
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            {t("home:partners.subtitle")}
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">{t("home:partners.filterLevelLabel")}</div>
          <div className="w-full sm:w-auto">
            <select
              value={selectedLevel}
              onChange={(event) => setSelectedLevel(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-300 sm:w-auto"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500">
            {loading ? t("home:partners.loading") : t("home:partners.empty")}
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {displayedPartners.map((partner) => {
              const levelValue = normalizePartnerLevel(partner.partenaire_niveau || partner.niveau);
              const levelStyle = getLevelStyle(levelValue);
              const levelLabel = partner.partenaire_niveau || partner.niveau || "";

              return (
                <div
                  key={partner.id_partenaire}
                  className={`min-h-[132px] rounded-2xl border border-slate-200 border-t-[3px] border-t-[#cacc7d] bg-white p-3 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${levelStyle.card}`}
                >
                  <div className="flex h-full flex-col items-center justify-between gap-2 text-center">
                    <div className="flex w-full flex-col items-center justify-center gap-2">
                      <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/90 shadow-sm">
                        {(partner.visuel || partner.logo) && (/^(https?:\/\/|\/|uploads\/)/i.test((partner.visuel || partner.logo || "").trim())) ? (
                          <img
                            src={normalizeImageUrl(partner.visuel || partner.logo)}
                            alt={partner.partenaire_nom || partner.titre || "Partenaire"}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-base font-semibold text-slate-700">{(partner.partenaire_nom || partner.titre || "P").charAt(0)}</span>
                        )}
                      </div>
                      {levelLabel && (
                        <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${levelStyle.badge}`}>
                          {levelLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col items-center space-y-1 text-center">
                      <div className="text-sm font-semibold text-slate-900">
                        {partner.partenaire_nom || partner.titre || "Partenaire"}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {partner.secteur || partner.emplacement || "Partenaire"}
                      </div>
                    </div>

                    {(partner.description || partner.engagement) && (
                      <p className="text-[11px] leading-tight text-slate-500 line-clamp-2">
                        {partner.description || partner.engagement}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/partenaires-tous"
            className="inline-flex items-center justify-center rounded-full border border-[#70D8F5] bg-white px-5 py-2.5 text-xs font-semibold text-[#0094AF] transition hover:bg-[#F0FCFF]"
          >
            {t('home:partners.viewAll')}
          </Link>
          <Link
            to="/partenaires#contact"
            className="inline-flex items-center justify-center rounded-full bg-[#2CB3D3] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#28a0bf]"
          >
            {t('home:partners.becomePartner')}
          </Link>
        </div>
      </div>
    </section>
  );
}
