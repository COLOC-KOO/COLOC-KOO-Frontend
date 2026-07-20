import { Link } from "react-router-dom";
import { Check, Eye, Trash2, UserPlus } from "lucide-react";

type Props = {
  annonceId?: string;
  candidateActionFeedback: string;
  candidateActionLoading: number | null;
  hasApplied: boolean;
  isAnnonceOwner: boolean;
  loadingCandidatures: boolean;
  realCandidatures: any[];
  showNotAppliedMessage: boolean;
  user: any;
  onCandidateDecision: (candidateId: number, action: "accept" | "refuse" | "discuss", message?: string) => void;
  onDeleteCandidature: (candidateId: number) => void;
  onOpenChat: (candidate: any) => void;
  onPostuler: () => void;
  onViewMyCandidature: () => void;
};

export function RealCandidaturesPanel({
  annonceId,
  candidateActionFeedback,
  candidateActionLoading,
  hasApplied,
  isAnnonceOwner,
  loadingCandidatures,
  realCandidatures,
  showNotAppliedMessage,
  user,
  onCandidateDecision,
  onDeleteCandidature,
  onOpenChat,
  onPostuler,
  onViewMyCandidature,
}: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h2 className="bebas text-2xl">Candidatures reçues</h2>
        {!hasApplied && user && annonceId && (
          <button
            onClick={onPostuler}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-cyan-dark"
          >
            <UserPlus className="h-4 w-4" />
            Postuler à cette coloc
          </button>
        )}
        {hasApplied && user && (
          <Link
            to={`/candidatures?annonceId=${annonceId}`}
            className="inline-flex items-center gap-2 rounded-xl border border-brand-cyan bg-brand-cyan-light/30 px-4 py-2 text-sm font-semibold text-brand-cyan-dark transition-colors hover:bg-brand-cyan-light"
          >
            <Eye className="h-4 w-4" />
            Voir ma candidature
          </Link>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          onClick={onViewMyCandidature}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-brand-cyan bg-brand-cyan-light/30 px-4 py-2 text-sm font-semibold text-brand-cyan-dark transition-colors hover:bg-brand-cyan-light sm:w-auto"
        >
          <Eye className="h-4 w-4" />
          Voir ma candidature
        </button>

        {showNotAppliedMessage && (
          <div className="mt-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Vous n'avez pas encore postulé à cette annonce.
            <br />
            <span className="text-xs text-yellow-600">
              Postulez en cliquant sur le bouton "Postuler à cette coloc" ci-dessus.
            </span>
          </div>
        )}

        {hasApplied && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <Check className="h-4 w-4 text-green-600" />
            Vous avez déjà postulé à cette annonce.
            <span className="ml-2 text-xs text-green-600">
              Cliquez sur "Voir ma candidature" pour voir toutes les candidatures.
            </span>
          </div>
        )}
      </div>

      {annonceId && (
        <div className="mt-5">
          <RealCandidaturesList
            candidateActionFeedback={candidateActionFeedback}
            candidateActionLoading={candidateActionLoading}
            isAnnonceOwner={isAnnonceOwner}
            loadingCandidatures={loadingCandidatures}
            realCandidatures={realCandidatures}
            user={user}
            onCandidateDecision={onCandidateDecision}
            onDeleteCandidature={onDeleteCandidature}
            onOpenChat={onOpenChat}
          />
        </div>
      )}
    </div>
  );
}

function RealCandidaturesList({
  candidateActionFeedback,
  candidateActionLoading,
  isAnnonceOwner,
  loadingCandidatures,
  realCandidatures,
  user,
  onCandidateDecision,
  onDeleteCandidature,
  onOpenChat,
}: Omit<Props, "annonceId" | "hasApplied" | "showNotAppliedMessage" | "onPostuler" | "onViewMyCandidature">) {
  if (loadingCandidatures) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-brand-cyan" />
      </div>
    );
  }

  if (realCandidatures.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Aucune candidature pour le moment. Soyez le premier à postuler !
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">
          {realCandidatures.length} candidat{realCandidatures.length > 1 ? "s" : ""}
        </h3>
      </div>

      {candidateActionFeedback ? (
        <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan-light/30 px-4 py-3 text-sm text-brand-cyan-dark">
          {candidateActionFeedback}
        </div>
      ) : null}

      {realCandidatures.map((candidat) => {
        const isCurrentUser = candidat.id_utilisateur === user?.id;
        const canManageCandidate = Boolean(
          user &&
            !isCurrentUser &&
            (user.poste === "proprietaire" ||
              user.poste === "superadmin" ||
              user.poste === "admin" ||
              user.poste === "moderateur") &&
            isAnnonceOwner,
        );
        const canDiscuss = Boolean(user);
        const canDeleteCandidate = Boolean(
          user &&
            (user.poste === "proprietaire" ||
              user.poste === "superadmin" ||
              user.poste === "admin" ||
              user.poste === "moderateur") &&
            (isAnnonceOwner || isCurrentUser),
        );

        return (
          <div
            key={candidat.id_candidature}
            className={`rounded-2xl border p-4 transition-shadow hover:shadow-md ${
              isCurrentUser ? "border-brand-cyan bg-brand-cyan-light/10" : "border-border bg-card"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-cyan text-lg font-semibold text-white">
                {(candidat.prenom?.[0] || "?") + (candidat.nom?.[0] || "")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-semibold">
                  {candidat.prenom} {candidat.nom}
                  {isCurrentUser && (
                    <span className="rounded-full bg-brand-cyan-light px-2 py-0.5 text-xs text-brand-cyan-dark">
                      Vous
                    </span>
                  )}
                </div>
                <div className="truncate text-sm text-muted-foreground">{candidat.email}</div>
                {candidat.message && (
                  <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 p-2 text-sm">
                    "{candidat.message}"
                  </div>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-4">
                  <span className="text-xs text-muted-foreground">
                    {new Date(candidat.date_creation).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      candidat.statut === "acceptee" || candidat.statut === "signature"
                        ? "bg-green-100 text-green-700"
                        : candidat.statut === "refusee"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {candidat.statut === "acceptee" || candidat.statut === "signature"
                      ? "Accepté"
                      : candidat.statut === "refusee"
                        ? "Refusé"
                        : "En attente"}
                  </span>
                </div>
                {canDiscuss || canManageCandidate ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenChat(candidat)}
                      disabled={candidateActionLoading === candidat.id_candidature}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-brand-cyan-dark hover:bg-brand-cyan-light disabled:opacity-60"
                    >
                      {candidateActionLoading === candidat.id_candidature ? "Traitement..." : "Discuter"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onCandidateDecision(candidat.id_candidature, "accept")}
                      disabled={!canManageCandidate || candidateActionLoading === candidat.id_candidature}
                      className="rounded-xl bg-brand-green px-3 py-2 text-sm font-semibold text-white hover:bg-brand-green-dark disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => onCandidateDecision(candidat.id_candidature, "refuse")}
                      disabled={!canManageCandidate || candidateActionLoading === candidat.id_candidature}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Refuser
                    </button>
                    {canDeleteCandidate ? (
                      <button
                        type="button"
                        onClick={() => onDeleteCandidature(candidat.id_candidature)}
                        disabled={candidateActionLoading === candidat.id_candidature}
                        className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        title="Supprimer la candidature"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
