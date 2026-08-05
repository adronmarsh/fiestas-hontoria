import Link from "next/link";
import { DayBanner } from "@/components/day-banner";
import { Hero } from "@/components/hero";
import { buttonVariants } from "@/components/ui/button";
import {
  NOTAS_INTERES,
  PROGRAMA_PDF_HREF,
  highlightProgramaDays,
} from "@/lib/programa";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const highlightDays = highlightProgramaDays(3);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-brush text-4xl text-fiesta-ink sm:text-5xl">
          Esta semana en el pueblo
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Un vistazo al programa. Consulta el calendario completo día a día.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3">
          {highlightDays.map((day) => (
            <li key={day.id}>
              <DayBanner weekday={day.weekday} dayNumber={day.dayNumber} />
              <ul className="mt-3 flex flex-col gap-2">
                {day.events.map((ev) => (
                  <li key={ev.title} className="text-base">
                    {ev.time && (
                      <span className="font-semibold text-fiesta-magenta">
                        {ev.time} ·{" "}
                      </span>
                    )}
                    {ev.title}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/programa"
            className={cn(buttonVariants(), "font-display tracking-wide")}
          >
            Programa completo
          </Link>
          <Link
            href={PROGRAMA_PDF_HREF}
            download
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-fiesta-ink font-display tracking-wide"
            )}
          >
            Descargar PDF
          </Link>
        </div>
      </section>

      <section className="border-y-4 border-fiesta-ink bg-fiesta-ink py-16 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-display text-4xl text-fiesta-yellow sm:text-5xl">
            Campeonatos
          </h2>
          <p className="mt-3 max-w-xl text-white/80">
            Ping pong, frontón, pádel, parchís, brisca, mus, ajedrez… Apúntate con tu
            nombre y sigue el cuadro eliminatorio.
          </p>
          <Link
            href="/campeonatos"
            className={cn(
              buttonVariants(),
              "mt-6 inline-flex bg-fiesta-cyan font-display text-fiesta-ink hover:bg-fiesta-cyan/90"
            )}
          >
            Ver campeonatos
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="border-4 border-dashed border-fiesta-magenta p-6 sm:p-8">
          <h2 className="font-brush text-4xl text-fiesta-magenta">Notas de interés</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {NOTAS_INTERES.map((nota) => (
              <li key={nota} className="flex gap-2">
                <span className="text-fiesta-magenta" aria-hidden>
                  ★
                </span>
                <span>{nota}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
