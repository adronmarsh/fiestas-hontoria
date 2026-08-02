import type { Metadata } from "next";
import Link from "next/link";
import { DayBanner } from "@/components/day-banner";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  buildMatchCalendarItems,
  buildProgramaCalendarItems,
  groupCalendarByDay,
} from "@/lib/calendar";
import { prisma } from "@/lib/prisma";
import { NOTAS_INTERES, PROGRAMA_PDF_HREF } from "@/lib/programa";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programa",
  description:
    "Calendario de la Semana Cultural 2026 y enfrentamientos de campeonatos en Hontoria de la Cantera.",
};

export const dynamic = "force-dynamic";

export default async function ProgramaPage() {
  const matches = await prisma.match.findMany({
    where: { scheduledAt: { not: null } },
    orderBy: { scheduledAt: "asc" },
    include: {
      championship: { select: { name: true, slug: true } },
      entryA: true,
      entryB: true,
    },
  });

  const items = [
    ...buildProgramaCalendarItems(),
    ...buildMatchCalendarItems(
      matches.map((m) => ({
        id: m.id,
        scheduledAt: m.scheduledAt!,
        championship: m.championship,
        entryA: m.entryA,
        entryB: m.entryB,
      }))
    ),
  ];

  const days = groupCalendarByDay(items);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-accent text-2xl font-bold text-fiesta-cyan">Agosto 2026</p>
      <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
        Calendario
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Programa cultural y enfrentamientos de campeonatos con hora. Los horarios
        pueden variar por organización.
      </p>
      <div className="mt-6">
        <Link
          href={PROGRAMA_PDF_HREF}
          download
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            "font-display tracking-wide"
          )}
        >
          Descargar PDF del programa
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        {days.map((day) => (
          <section key={day.dayKey} id={`${day.dayNumber}-agosto`}>
            <DayBanner
              as="h2"
              weekday={day.weekday}
              dayNumber={day.dayNumber}
            />
            <ul className="mt-4 flex flex-col gap-3">
              {day.items.map((ev) => (
                <li
                  key={ev.id}
                  className={cn(
                    "border-l-4 pl-3",
                    ev.kind === "campeonato"
                      ? "border-fiesta-cyan"
                      : "border-fiesta-yellow"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {ev.timeLabel && (
                      <p className="text-sm font-bold uppercase tracking-wide text-fiesta-magenta">
                        {ev.timeLabel} h
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className={
                        ev.kind === "campeonato"
                          ? "border-fiesta-cyan text-fiesta-cyan"
                          : ""
                      }
                    >
                      {ev.kind === "campeonato" ? "Campeonato" : "Programa"}
                    </Badge>
                  </div>
                  {ev.href ? (
                    <Link
                      href={ev.href}
                      className="font-semibold uppercase tracking-wide hover:text-fiesta-magenta"
                    >
                      {ev.title}
                    </Link>
                  ) : (
                    <p className="font-semibold uppercase tracking-wide">{ev.title}</p>
                  )}
                  {ev.note && (
                    <p className="text-sm text-muted-foreground">{ev.note}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside className="mt-12 border-4 border-dashed border-fiesta-magenta p-6">
        <h2 className="font-brush text-3xl text-fiesta-magenta">Notas de interés</h2>
        <ul className="mt-4 flex flex-col gap-2">
          {NOTAS_INTERES.map((nota) => (
            <li key={nota} className="flex gap-2">
              <span className="text-fiesta-magenta" aria-hidden>
                ★
              </span>
              {nota}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
