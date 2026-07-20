type Props = {
  members: string[];
  target: number;
};

export function CandidateAvatarStack({ members, target }: Props) {
  return (
    <div className="flex items-center -space-x-3">
      {members.map((member, index) => (
        <div
          key={`${member}-${index}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-cyan text-sm font-semibold text-white ring-2 ring-white"
        >
          {member
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>
      ))}
      {Array.from({ length: Math.max(0, target - members.length) }).map((_, idx) => (
        <div
          key={`empty-${idx}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted/50 text-sm font-semibold text-muted-foreground ring-2 ring-white"
        >
          +
        </div>
      ))}
    </div>
  );
}
