import type { Metadata } from "next";
import { PROGRAMA, NOTAS_INTERES } from "@/lib/programa";

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

      <div className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {PROGRAMA.map((day) => (
          <article key={day.id} id={day.id}>
            <h2 className="day-banner text-xl sm:text-2xl">
              {day.label.replace(/\d+/, "")}
              <span className="day-num">{day.dayNumber}</span>
              {" AGOSTO"}
            </h2>
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
