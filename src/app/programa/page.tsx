import type { Metadata } from "next";
import Link from "next/link";
import { DayBanner } from "@/components/day-banner";
import { buttonVariants } from "@/components/ui/button";
import { PROGRAMA, NOTAS_INTERES, PROGRAMA_PDF_HREF } from "@/lib/programa";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Programa",
  description: "Programa de la Semana Cultural 2026 en Hontoria de la Cantera.",
};

export default function ProgramaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <p className="font-accent text-2xl font-bold text-fiesta-cyan">Agosto 2026</p>
      <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
        Programa Semana Cultural
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Todas las actividades del programa oficial. Los horarios pueden variar por
        organización.
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

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PROGRAMA.map((day) => (
          <article key={day.id} id={day.id}>
            <DayBanner
              as="h2"
              weekday={day.weekday}
              dayNumber={day.dayNumber}
            />
            <ul className="mt-4 flex flex-col gap-3">
              {day.events.map((ev) => (
                <li key={`${day.id}-${ev.title}`} className="border-l-4 border-fiesta-yellow pl-3">
                  {ev.time && (
                    <p className="text-sm font-bold uppercase tracking-wide text-fiesta-magenta">
                      {ev.time} h
                    </p>
                  )}
                  <p className="font-semibold uppercase tracking-wide">{ev.title}</p>
                  {ev.note && (
                    <p className="text-sm text-muted-foreground">{ev.note}</p>
                  )}
                </li>
              ))}
            </ul>
          </article>
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
