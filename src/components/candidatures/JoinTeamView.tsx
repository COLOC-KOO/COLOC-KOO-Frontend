import { UserPlus } from "lucide-react";
import { CandidateAvatarStack } from "./CandidateAvatarStack";

type Team = {
  id: string;
  title: string;
  mood: string;
  members: string[];
};

type Props = {
  teams: Team[];
  joinTarget: string;
  target: number;
  onJoinTeam: (teamId: string) => void;
  onBackToTeams: () => void;
};

export function JoinTeamView({
  teams,
  joinTarget,
  target,
  onJoinTeam,
  onBackToTeams,
}: Props) {
  const selectedTeam = teams.find((team) => team.id === joinTarget) || teams[0];

  if (!selectedTeam) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-muted-foreground">
        Aucune équipe disponible pour le moment.
      </div>
    );
  }

  const available = target - selectedTeam.members.length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Équipe sélectionnée
            </div>
            <h2 className="bebas mt-3 text-2xl">{selectedTeam.title}</h2>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {selectedTeam.members.length}/{target} membres
            </div>
            <div className="text-base font-semibold text-brand-cyan-dark">
              {available > 0
                ? `${available} place${available > 1 ? "s" : ""} restante${available > 1 ? "s" : ""}`
                : "Complète"}
            </div>
          </div>
        </div>
        <div className="mt-4 whitespace-pre-line text-sm text-muted-foreground">
          {selectedTeam.mood}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CandidateAvatarStack members={selectedTeam.members} target={target} />
        </div>
        <div className="mt-5">
          {available > 0 ? (
            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-brand-green px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-green-dark"
              onClick={() => onJoinTeam(selectedTeam.id)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Rejoindre cette équipe
            </button>
          ) : (
            <button
              className="inline-flex w-full items-center justify-center rounded-xl bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground"
              disabled
            >
              Équipe complète
            </button>
          )}
          <button
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-muted-foreground hover:border-brand-cyan"
            onClick={onBackToTeams}
          >
            Voir toutes les équipes
          </button>
        </div>
      </div>
    </div>
  );
}
