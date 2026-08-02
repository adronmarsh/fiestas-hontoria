import type { Entry, Match } from "@prisma/client";
import { entryLabel, roundLabel } from "@/lib/bracket";
import { Badge } from "@/components/ui/badge";
import { SetWinnerButtons } from "@/components/set-winner-buttons";

type MatchWithEntries = Match & {
  entryA: Entry | null;
  entryB: Entry | null;
  winner: Entry | null;
};

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

  return (
    <div className="flex flex-col gap-8 overflow-x-auto">
      {[...byRound.entries()]
        .sort(([a], [b]) => a - b)
        .map(([round, roundMatches]) => (
          <section key={round}>
            <h3 className="font-display text-xl tracking-wide text-fiesta-magenta">
              {roundLabel(round, totalRounds)}
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {roundMatches
                .sort((a, b) => a.position - b.position)
                .map((match) => {
                  const aLabel = match.entryA
                    ? entryLabel(match.entryA)
                    : match.entryB && !match.entryA
                      ? "—"
                      : "Por determinar";
                  const bLabel = match.entryB
                    ? entryLabel(match.entryB)
                    : match.entryA && !match.entryB
                      ? "BYE"
                      : "Por determinar";
                  const isBye =
                    (match.entryA && !match.entryB) ||
                    (!match.entryA && match.entryB);

                  return (
                    <li
                      key={match.id}
                      className="border-2 border-fiesta-ink bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-1">
                          <p
                            className={
                              match.winnerId && match.winnerId === match.entryAId
                                ? "font-bold text-fiesta-cyan"
                                : ""
                            }
                          >
                            {aLabel}
                          </p>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground">
                            vs
                          </p>
                          <p
                            className={
                              match.winnerId && match.winnerId === match.entryBId
                                ? "font-bold text-fiesta-cyan"
                                : ""
                            }
                          >
                            {bLabel}
                          </p>
                        </div>
                        {match.winner ? (
                          <Badge className="bg-fiesta-yellow text-fiesta-ink">
                            Gana: {entryLabel(match.winner)}
                          </Badge>
                        ) : isBye ? (
                          <Badge variant="outline">Bye</Badge>
                        ) : null}
                      </div>
                      {admin &&
                        !match.winnerId &&
                        match.entryAId &&
                        match.entryBId && (
                          <SetWinnerButtons
                            matchId={match.id}
                            entryAId={match.entryAId}
                            entryBId={match.entryBId}
                            labelA={entryLabel(match.entryA!)}
                            labelB={entryLabel(match.entryB!)}
                          />
                        )}
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
    </div>
  );
}
