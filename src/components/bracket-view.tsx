import type { Entry, Match } from "@prisma/client";
import { entryLabel, roundLabel } from "@/lib/bracket";
import { formatMatchSchedule } from "@/lib/datetime";
import { Badge } from "@/components/ui/badge";
import { MatchScheduleEditor } from "@/components/match-schedule-editor";
import { SetWinnerButtons } from "@/components/set-winner-buttons";
import { cn } from "@/lib/utils";

type MatchWithEntries = Match & {
  entryA: Entry | null;
  entryB: Entry | null;
  winner: Entry | null;
};

function sideLabel(
  match: MatchWithEntries,
  side: "a" | "b"
): string {
  const entry = side === "a" ? match.entryA : match.entryB;
  const other = side === "a" ? match.entryB : match.entryA;
  if (entry) return entryLabel(entry);
  if (other) return side === "b" ? "BYE" : "—";
  return "Por determinar";
}

function MatchCard({
  match,
  admin,
}: {
  match: MatchWithEntries;
  admin: boolean;
}) {
  const aLabel = sideLabel(match, "a");
  const bLabel = sideLabel(match, "b");
  const isBye = Boolean(
    (match.entryA && !match.entryB) || (!match.entryA && match.entryB)
  );
  const scheduleLabel = formatMatchSchedule(match.scheduledAt);

  return (
    <div className="w-[220px] shrink-0 border-2 border-fiesta-ink bg-white p-3 shadow-[3px_3px_0_0_rgba(10,10,10,0.12)] sm:w-[240px]">
      <div className="flex flex-col gap-1">
        <p
          className={cn(
            "text-sm leading-snug",
            match.winnerId && match.winnerId === match.entryAId
              ? "font-bold text-fiesta-cyan"
              : "font-medium"
          )}
        >
          {aLabel}
        </p>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          vs
        </p>
        <p
          className={cn(
            "text-sm leading-snug",
            match.winnerId && match.winnerId === match.entryBId
              ? "font-bold text-fiesta-cyan"
              : "font-medium"
          )}
        >
          {bLabel}
        </p>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {match.winner ? (
          <Badge className="bg-fiesta-yellow text-fiesta-ink">
            Gana: {entryLabel(match.winner)}
          </Badge>
        ) : isBye ? (
          <Badge variant="outline">Bye</Badge>
        ) : null}
      </div>

      {scheduleLabel ? (
        <p className="mt-2 text-xs font-semibold text-fiesta-magenta">
          {scheduleLabel}
        </p>
      ) : admin && !isBye ? (
        <p className="mt-2 text-xs text-muted-foreground">Sin hora</p>
      ) : !admin && !isBye ? (
        <p className="mt-2 text-xs text-muted-foreground">Por confirmar</p>
      ) : null}

      {admin && !isBye && (
        <MatchScheduleEditor matchId={match.id} scheduledAt={match.scheduledAt} />
      )}

      {admin && !match.winnerId && match.entryAId && match.entryBId && (
        <SetWinnerButtons
          matchId={match.id}
          entryAId={match.entryAId}
          entryBId={match.entryBId}
          labelA={entryLabel(match.entryA!)}
          labelB={entryLabel(match.entryB!)}
        />
      )}
    </div>
  );
}

export function BracketView({
  matches,
  admin = false,
}: {
  matches: MatchWithEntries[];
  admin?: boolean;
}) {
  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground">
        El cuadro aún no se ha generado. Cuando el organizador lo cree, aparecerá aquí.
      </p>
    );
  }

  const totalRounds = Math.max(...matches.map((m) => m.round));
  const byRound = new Map<number, MatchWithEntries[]>();
  for (const m of matches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }

  const rounds = [...byRound.keys()].sort((a, b) => a - b);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex min-w-min items-stretch gap-0">
        {rounds.map((round, roundIndex) => {
          const roundMatches = (byRound.get(round) ?? []).sort(
            (a, b) => a.position - b.position
          );
          const isLast = roundIndex === rounds.length - 1;

          return (
            <div key={round} className="flex items-stretch">
              <div className="flex flex-col">
                <h3 className="mb-3 whitespace-nowrap text-center font-display text-sm tracking-wide text-fiesta-magenta sm:text-base">
                  {roundLabel(round, totalRounds)}
                </h3>
                <div
                  className="flex flex-1 flex-col justify-around gap-6 py-2"
                  style={{ minHeight: `${Math.max(roundMatches.length, 1) * 140}px` }}
                >
                  {roundMatches.map((match) => (
                    <div key={match.id} className="flex items-center">
                      <MatchCard match={match} admin={admin} />
                    </div>
                  ))}
                </div>
              </div>

              {!isLast && (
                <div
                  className="mx-1 flex w-8 flex-col justify-around self-stretch pt-10 sm:mx-2 sm:w-12"
                  aria-hidden
                >
                  {roundMatches.map((match) => {
                    const feedsTop = match.position % 2 === 0;
                    return (
                      <div
                        key={`line-${match.id}`}
                        className="relative flex h-[120px] items-center"
                      >
                        <div
                          className={cn(
                            "absolute right-0 w-1/2 border-fiesta-ink/40",
                            feedsTop
                              ? "top-1/2 border-t-2 border-r-2 h-1/2 rounded-tr-md"
                              : "bottom-1/2 border-b-2 border-r-2 h-1/2 rounded-br-md"
                          )}
                        />
                        <div className="absolute top-1/2 left-1/2 h-0 w-1/2 border-t-2 border-fiesta-ink/40" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
