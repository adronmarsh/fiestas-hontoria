"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DayBanner } from "@/components/day-banner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildMatchCalendarItems,
  buildProgramaCalendarItems,
  groupCalendarByDay,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

type MatchInput = {
  id: string;
  scheduledAt: Date | string;
  championship: { name: string; slug: string };
  entryA: { player1: string; player2: string | null; player3: string | null } | null;
  entryB: { player1: string; player2: string | null; player3: string | null } | null;
};

export function ChampionshipsSchedule({ matches }: { matches: MatchInput[] }) {
  const [playerFilter, setPlayerFilter] = useState("");

  const days = useMemo(() => {
    const normalized = matches.map((m) => ({
      ...m,
      scheduledAt: new Date(m.scheduledAt),
    }));
    const matchItems = buildMatchCalendarItems(normalized);
    const programaItems = buildProgramaCalendarItems();
    const q = playerFilter.trim().toLowerCase();

    const filteredMatches = q
      ? matchItems.filter((item) =>
          (item.playerNames ?? []).some((n) => n.toLowerCase().includes(q))
        )
      : matchItems;

    // Siempre incluir actos del programa; si hay filtro, solo días con partidos del jugador
    // o todos los días del programa si no hay filtro
    if (q) {
      const matchDayKeys = new Set(filteredMatches.map((m) => m.dayKey));
      const programaOnThoseDays = programaItems.filter((p) =>
        matchDayKeys.has(p.dayKey)
      );
      // Si el filtro no encuentra partidos, mostrar aviso vía lista vacía de matches
      // pero aún así mostrar programa completo para contexto de planificación
      if (filteredMatches.length === 0) {
        return groupCalendarByDay(programaItems);
      }
      return groupCalendarByDay([...filteredMatches, ...programaOnThoseDays]);
    }

    return groupCalendarByDay([...matchItems, ...programaItems]);
  }, [matches, playerFilter]);

  const hasAnyMatches = matches.length > 0;

  return (
    <section className="mt-14 border-t-4 border-fiesta-ink pt-10">
      <h2 className="font-display text-3xl tracking-wide sm:text-4xl">
        Horario de enfrentamientos
      </h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Enfrentamientos programados y actos de la fiesta en el mismo calendario,
        para que puedas evitar coincidencias si estás en varios campeonatos.
      </p>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 bg-fiesta-cyan" aria-hidden />
          Enfrentamiento
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="size-3 border-2 border-dashed border-fiesta-magenta bg-fiesta-magenta/15"
            aria-hidden
          />
          Acto del programa
        </span>
      </div>

      <div className="mt-6 max-w-sm">
        <Label htmlFor="player-filter">Filtrar por jugador</Label>
        <Input
          id="player-filter"
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
          placeholder="Ej. María"
          className="mt-1"
        />
      </div>

      {!hasAnyMatches && (
        <p className="mt-4 text-sm text-muted-foreground">
          Aún no hay partidos con hora. Mientras tanto, aquí tienes los actos del
          programa para planificar.
        </p>
      )}

      {playerFilter.trim() && hasAnyMatches && days.every((d) => !d.items.some((i) => i.kind === "campeonato")) && (
        <p className="mt-4 text-sm text-muted-foreground">
          No hay enfrentamientos con ese nombre. Se muestran los actos del programa.
        </p>
      )}

      <div className="mt-8 flex flex-col gap-10">
        {days.map((day) => (
          <div key={day.dayKey}>
            <DayBanner as="h3" weekday={day.weekday} dayNumber={day.dayNumber} />
            <ul className="mt-4 flex flex-col gap-2">
              {day.items.map((ev) => {
                const isMatch = ev.kind === "campeonato";
                return (
                  <li
                    key={ev.id}
                    className={cn(
                      "px-3 py-3",
                      isMatch
                        ? "border-l-4 border-fiesta-cyan bg-white"
                        : "border-l-4 border-dashed border-fiesta-magenta/70 bg-fiesta-magenta/10"
                    )}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      {ev.timeLabel && (
                        <span className="text-sm font-bold uppercase tracking-wide text-fiesta-magenta">
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
        ))}
      </div>
    </section>
  );
}
