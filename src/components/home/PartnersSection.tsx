import { Link } from "react-router-dom";
import { ApiPartenaireCampagne } from "../../lib/api";
import { useTranslation } from "react-i18next";

type PartnersSectionProps = {
  partners: ApiPartenaireCampagne[];
  loading: boolean;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000/api"
).replace(/\/api\/?$/, "");

function normalizeImageUrl(value: string | null | undefined) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${API_BASE_URL}${trimmed}`;
  if (trimmed.startsWith("uploads/")) return `${API_BASE_URL}/${trimmed}`;
  return `${API_BASE_URL}/${trimmed}`;
}

export function PartnersSection({ partners, loading }: PartnersSectionProps) {
  const { t } = useTranslation(["home", "common"]);
  const displayedPartners = partners.slice(0, 6);

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

        {partners.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-slate-500">
            {loading ? t("home:partners.loading") : t("home:partners.empty")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
            {displayedPartners.map((partner) => (
              <div key={partner.id_partenaire} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md min-h-[130px]">
                <div className="flex h-full flex-col items-center justify-between text-center gap-2">
                  <div className="w-14 h-10 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden">
                    {(partner.visuel || partner.logo) && (/^(https?:\/\/|\/|uploads\/)/i.test((partner.visuel || partner.logo || "").trim())) ? (
                      <img
                        src={normalizeImageUrl(partner.visuel || partner.logo)}
                        alt={partner.partenaire_nom || partner.titre || "Partenaire"}
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-xl font-bold text-slate-700">{(partner.partenaire_nom || partner.titre || "P").charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{partner.partenaire_nom || partner.titre || "Partenaire"}</div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      {partner.secteur || partner.emplacement || "Partenaire"}
                    </div>
                  </div>
                  {(partner.description || partner.engagement) && (
                    <p className="text-[11px] text-slate-500 leading-tight line-clamp-2">
                      {partner.description || partner.engagement}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to="/partenaires"
            className="inline-flex items-center justify-center rounded-full border border-[#70D8F5] bg-white px-5 py-2.5 text-xs font-semibold text-[#0094AF] transition hover:bg-[#F0FCFF]"
          >
            Voir tous les partenaires
          </Link>
          <Link
            to="/partenaires#contact"
            className="inline-flex items-center justify-center rounded-full bg-[#2CB3D3] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#28a0bf]"
          >
            Je veux devenir partenaire
          </Link>
        </div>
      </div>
    </section>
  );
}
