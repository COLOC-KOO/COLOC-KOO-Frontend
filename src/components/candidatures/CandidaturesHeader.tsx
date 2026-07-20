import { useTranslation } from "react-i18next";

type ViewId = "flux" | "track" | "cand" | "join" | "won" | "lost";

type Props = {
  activeView: ViewId;
  onChangeView: (view: ViewId) => void;
  activeButtonClass: string;
  inactiveButtonClass: string;
  officialNotification?: "won" | "lost" | null;
};

const viewButtons: ViewId[] = ["flux", "track", "cand", "join", "won", "lost"];

export function CandidaturesHeader({
  activeView,
  onChangeView,
  activeButtonClass,
  inactiveButtonClass,
  officialNotification = null,
}: Props) {
  const { t } = useTranslation(["candidatures"]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-cyan-light px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-cyan-dark">
            {t("candidatures:header.badge")}
          </span>
          <h1 className="bebas mt-4 text-4xl leading-tight">
            {t("candidatures:header.title")}
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            {t("candidatures:header.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {viewButtons.map((button) => {
            const isWonNotification = button === "won";
            const isLostNotification = button === "lost";
            const hasOfficialNotification = Boolean(officialNotification);
            const isCurrentNotification =
              (officialNotification === "won" && isWonNotification) ||
              (officialNotification === "lost" && isLostNotification);
            const isOppositeNotification =
              (officialNotification === "won" && isLostNotification) ||
              (officialNotification === "lost" && isWonNotification);
            const disabled = hasOfficialNotification && isOppositeNotification;
            const notificationClass = isCurrentNotification
              ? isWonNotification
                ? "animate-pulse border-brand-green bg-brand-green text-white shadow-sm shadow-brand-green/30"
                : "animate-pulse border-red-500 bg-red-500 text-white shadow-sm shadow-red-500/30"
              : isOppositeNotification
                ? isWonNotification
                  ? "cursor-not-allowed border-brand-green bg-brand-green text-white opacity-60"
                  : "cursor-not-allowed border-red-500 bg-red-500 text-white opacity-60"
                : activeView === button
                  ? activeButtonClass
                  : inactiveButtonClass;

            return (
              <button
                key={button}
                type="button"
                onClick={() => {
                  if (!disabled) onChangeView(button);
                }}
                disabled={disabled}
                aria-disabled={disabled}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${notificationClass}`}
              >
                {t(`candidatures:header.views.${button}`)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
