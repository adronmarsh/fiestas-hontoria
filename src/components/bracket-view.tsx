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

const CARD_MIN_H = 76;

function sideLabel(match: MatchWithEntries, side: "a" | "b"): string {
  const entry = side === "a" ? match.entryA : match.entryB;
  const other = side === "a" ? match.entryB : match.entryA;
  if (entry) return entryLabel(entry);
  if (other) return side === "b" ? "BYE" : "—";
  return "Por determinar";
}

function isResolvedBye(match: MatchWithEntries): boolean {
  const oneSide =
    (Boolean(match.entryAId) && !match.entryBId) ||
    (!match.entryAId && Boolean(match.entryBId));
  return oneSide && Boolean(match.winnerId);
}

function MatchCard({
  match,
  admin,
  compact,
}: {
  match: MatchWithEntries;
  admin: boolean;
  compact?: boolean;
}) {
  const aLabel = sideLabel(match, "a");
  const bLabel = sideLabel(match, "b");
  const isBye = Boolean(
    (match.entryA && !match.entryB) || (!match.entryA && match.entryB)
  );
  const scheduleLabel = formatMatchSchedule(match.scheduledAt);
  const aWon = match.winnerId && match.winnerId === match.entryAId;
  const bWon = match.winnerId && match.winnerId === match.entryBId;

  return (
    <div
      className={cn(
        "flex w-[200px] flex-col justify-center border-2 border-fiesta-ink bg-white sm:w-[220px]",
        compact ? "p-2" : "p-2.5",
        match.winnerId && !isBye && "border-fiesta-cyan"
      )}
      style={{ minHeight: CARD_MIN_H }}
    >
      <div className="flex flex-col gap-0.5">
        <p
          className={cn(
            "truncate text-[13px] leading-tight",
            aWon ? "font-bold text-fiesta-cyan" : "font-medium",
            match.winnerId && !aWon && match.entryAId && "text-muted-foreground line-through decoration-black/30"
          )}
          title={aLabel}
        >
          {aLabel}
        </p>
        <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          vs
        </p>
        <p
          className={cn(
            "truncate text-[13px] leading-tight",
            bWon ? "font-bold text-fiesta-cyan" : "font-medium",
            match.winnerId && !bWon && match.entryBId && "text-muted-foreground line-through decoration-black/30"
          )}
          title={bLabel}
        >
          {bLabel}
        </p>
      </div>

      {match.winner && !isBye ? (
        <p className="mt-1 truncate text-[10px] font-semibold text-fiesta-magenta">
          Gana: {entryLabel(match.winner)}
        </p>
      ) : isBye ? (
        <Badge variant="outline" className="mt-1 w-fit text-[10px]">
          Bye
        </Badge>
      ) : null}

      {scheduleLabel && (
        <p className="mt-1 text-[10px] font-semibold text-fiesta-magenta">
          {scheduleLabel}
        </p>
      )}

      {admin && !isBye && (
        <div className="mt-1">
          <MatchScheduleEditor matchId={match.id} scheduledAt={match.scheduledAt} />
        </div>
      )}

      {admin && !match.winnerId && match.entryAId && match.entryBId && (
        <div className="mt-1">
          <SetWinnerButtons
            matchId={match.id}
            entryAId={match.entryAId}
            entryBId={match.entryBId}
            labelA={entryLabel(match.entryA!)}
            labelB={entryLabel(match.entryB!)}
          />
        </div>
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

  // Oculta byes ya resueltos para no hinchar el gráfico
  const visible = matches.filter((m) => !isResolvedBye(m));
  const displayMatches = visible.length > 0 ? visible : matches;
  const totalRounds = Math.max(...matches.map((m) => m.round));
  const byRound = new Map<number, MatchWithEntries[]>();
  for (const m of displayMatches) {
    const list = byRound.get(m.round) ?? [];
    list.push(m);
    byRound.set(m.round, list);
  }

  const rounds = [...byRound.keys()].sort((a, b) => a - b);
  const firstRound = rounds[0] ?? 1;
  const firstRoundCount = (byRound.get(firstRound) ?? []).length || 1;

  // Altura de un “hueco” de la primera ronda visible
  const leafSlot = admin ? 130 : 92;
  const columnHeight = firstRoundCount * leafSlot;

  return (
    <div className="w-full overflow-x-auto pb-3">
      <div
        className="flex min-w-min items-start gap-0"
        style={{ minHeight: columnHeight + 40 }}
      >
        {rounds.map((round, roundIndex) => {
          const roundMatches = (byRound.get(round) ?? []).sort(
            (a, b) => a.position - b.position
          );
          const isLast = roundIndex === rounds.length - 1;
          const depth = round - firstRound;
          const slotH = leafSlot * Math.pow(2, Math.max(depth, 0));

          return (
            <div key={round} className="flex items-stretch">
              <div className="flex flex-col">
                <h3 className="mb-2 h-7 whitespace-nowrap text-center font-display text-xs tracking-wide text-fiesta-magenta sm:text-sm">
                  {roundLabel(round, totalRounds)}
                </h3>
                <div
                  className="relative flex flex-col"
                  style={{ height: columnHeight }}
                >
                  {roundMatches.map((match, i) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-center px-1"
                      style={{
                        height: slotH,
                        marginTop: depth === 0 ? 0 : undefined,
                      }}
                    >
                      <MatchCard match={match} admin={admin} compact={!admin} />
                    </div>
                  ))}
                </div>
              </div>

              {!isLast && (
                <div
                  className="relative w-6 shrink-0 sm:w-10"
                  style={{ marginTop: 28, height: columnHeight }}
                  aria-hidden
                >
                  {roundMatches.map((match) => {
                    const feedsTop = match.position % 2 === 0;
                    const localIndex = roundMatches.indexOf(match);
                    const centerY = localIndex * slotH + slotH / 2;
                    return (
                      <div
                        key={`line-${match.id}`}
                        className="pointer-events-none absolute left-0 w-full"
                        style={{ top: centerY - slotH / 4, height: slotH / 2 }}
                      >
                        <div
                          className={cn(
                            "absolute left-0 w-full border-fiesta-ink/35",
                            feedsTop
                              ? "top-1/2 h-1/2 border-t-2 border-r-2 rounded-tr"
                              : "bottom-1/2 h-1/2 border-b-2 border-r-2 rounded-br"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {matches.some(isResolvedBye) && (
        <p className="mt-2 max-w-[20rem] text-[11px] leading-snug text-muted-foreground sm:max-w-none sm:text-xs">
          Byes automáticos ocultos
        </p>
      )}
    </div>
  );
}
