import Link from "next/link";
import { DayBanner } from "@/components/day-banner";
import { Badge } from "@/components/ui/badge";
import {
  buildMatchCalendarItems,
  buildProgramaCalendarItems,
  groupCalendarByDay,
  type CalendarItem,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

type MatchInput = {
  id: string;
  scheduledAt: Date;
  championship: { name: string; slug: string };
  entryA: { player1: string; player2: string | null; player3: string | null } | null;
  entryB: { player1: string; player2: string | null; player3: string | null } | null;
};

/** Same minute key for conflict detection between matches. */
function timeConflictKey(item: CalendarItem): string | null {
  if (item.kind !== "campeonato" || !item.timeLabel) return null;
  return `${item.dayKey}|${item.timeLabel}`;
}

export function ChampionshipsSchedule({ matches }: { matches: MatchInput[] }) {
  const matchItems = buildMatchCalendarItems(matches);
  const programaItems = buildProgramaCalendarItems();

  const conflictKeys = new Set<string>();
  const seen = new Map<string, number>();
  for (const item of matchItems) {
    const key = timeConflictKey(item);
    if (!key) continue;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  for (const [key, count] of seen) {
    if (count > 1) conflictKeys.add(key);
  }

  const days = groupCalendarByDay([...matchItems, ...programaItems]);

  if (matchItems.length === 0) {
    return (
      <section className="mt-14 border-t-4 border-fiesta-ink pt-10">
        <h2 className="font-display text-3xl tracking-wide">Horario de enfrentamientos</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Cuando el organizador asigne hora a los partidos, verás aquí el calendario
          junto con el resto de actos de las fiestas para evitar solapes.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-14 border-t-4 border-fiesta-ink pt-10">
      <h2 className="font-display text-3xl tracking-wide sm:text-4xl">
        Horario de enfrentamientos
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Partidos programados y, en segundo plano, el resto de actos de la fiesta.
        Así puedes comprobar que no te coinciden dos campeonatos (u otro evento) a
        la misma hora.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 bg-fiesta-cyan" aria-hidden />
          Enfrentamiento
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 border-2 border-dashed border-fiesta-magenta bg-fiesta-magenta/15" aria-hidden />
          Acto del programa
        </span>
      </div>

      <div className="mt-8 flex flex-col gap-10">
        {days.map((day) => {
          const hasMatches = day.items.some((i) => i.kind === "campeonato");
          if (!hasMatches) return null;

          return (
            <div key={day.dayKey}>
              <DayBanner
                as="h3"
                weekday={day.weekday}
                dayNumber={day.dayNumber}
              />
              <ul className="mt-4 flex flex-col gap-2">
                {day.items.map((ev) => {
                  const isMatch = ev.kind === "campeonato";
                  const conflict =
                    isMatch &&
                    timeConflictKey(ev) !== null &&
                    conflictKeys.has(timeConflictKey(ev)!);

                  return (
                    <li
                      key={ev.id}
                      className={cn(
                        "px-3 py-3",
                        isMatch
                          ? cn(
                              "border-l-4 border-fiesta-cyan bg-white",
                              conflict && "ring-2 ring-destructive/60"
                            )
                          : "border-l-4 border-dashed border-fiesta-magenta/70 bg-fiesta-magenta/10 opacity-90"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        {ev.timeLabel && (
                          <span
                            className={cn(
                              "text-sm font-bold uppercase tracking-wide",
                              isMatch ? "text-fiesta-magenta" : "text-fiesta-magenta/80"
                            )}
                          >
                            {ev.timeLabel} h
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={
                            isMatch
                              ? "border-fiesta-cyan bg-fiesta-cyan/10 text-fiesta-ink"
                              : "border-fiesta-magenta/50 text-fiesta-magenta"
                          }
                        >
                          {isMatch ? "Enfrentamiento" : "Programa"}
                        </Badge>
                        {conflict && (
                          <Badge variant="destructive">Posible solape</Badge>
                        )}
                      </div>
                      {ev.href ? (
                        <Link
                          href={ev.href}
                          className="mt-1 block font-semibold tracking-wide hover:text-fiesta-magenta"
                        >
                          {ev.title}
                        </Link>
                      ) : (
                        <p className="mt-1 font-medium tracking-wide text-fiesta-ink/80">
                          {ev.title}
                        </p>
                      )}
                      {ev.note && (
                        <p className="text-sm text-muted-foreground">{ev.note}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
