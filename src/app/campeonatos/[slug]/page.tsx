import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  championshipDatesLabel,
  entryTypeLabel,
  statusLabel,
} from "@/lib/championships";
import { entryLabel } from "@/lib/bracket";
import { EntryForm } from "@/components/entry-form";
import { BracketView } from "@/components/bracket-view";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = await prisma.championship.findUnique({ where: { slug } });
  return {
    title: c ? c.name : "Campeonato",
  };
}

export default async function ChampionshipPage({ params }: Props) {
  const { slug } = await params;
  const championship = await prisma.championship.findUnique({
    where: { slug },
    include: {
      entries: { orderBy: { createdAt: "asc" } },
      matches: {
        orderBy: [{ round: "asc" }, { position: "asc" }],
        include: { entryA: true, entryB: true, winner: true },
      },
    },
  });

  if (!championship) notFound();

  const registrations = championship.entries.filter((e) => e.kind === "registration");
  const dates = championshipDatesLabel(
    championship.startDay,
    championship.endDay,
    championship.startTime
  );
  const modalityNote =
    championship.pairingMode === "random_pairs"
      ? "Inscripción individual · parejas al azar en el cuadro"
      : entryTypeLabel(championship.entryType);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
            {championship.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {modalityNote} · eliminatorias
            {dates ? ` · ${dates}` : ""}
          </p>
          {championship.organizer && (
            <p className="mt-1 text-sm">
              <span className="font-semibold text-fiesta-magenta">Organiza:</span>{" "}
              {championship.organizer}
            </p>
          )}
          {championship.pairingMode === "random_pairs" && (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Te apuntas solo. Al generar el cuadro se forman parejas al azar.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{statusLabel(championship.status)}</Badge>
            <Badge className="bg-fiesta-yellow text-fiesta-ink">
              {registrations.length} inscritos
            </Badge>
            {dates && (
              <Badge className="bg-fiesta-cyan text-fiesta-ink">{dates}</Badge>
            )}
            {!championship.registrationOpen && (
              <Badge variant="secondary">Inscripciones cerradas</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-start">
        <section>
          {championship.registrationOpen ? (
            <EntryForm
              championshipId={championship.id}
              entryType={championship.entryType}
            />
          ) : (
            <div className="border-4 border-dashed border-muted-foreground/40 p-5 text-muted-foreground">
              Las inscripciones están cerradas para este campeonato.
            </div>
          )}

          <h2 className="mt-8 font-display text-2xl tracking-wide">Inscritos</h2>
          {registrations.length === 0 ? (
            <p className="mt-2 text-muted-foreground">Todavía no hay nadie apuntado.</p>
          ) : (
            <ol className="mt-3 flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {registrations.map((e, i) => (
                <li
                  key={e.id}
                  className="flex gap-3 border-l-4 border-fiesta-cyan bg-white/80 px-3 py-2"
                >
                  <span className="font-bold text-fiesta-magenta">{i + 1}.</span>
                  {entryLabel(e)}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="min-w-0">
          <h2 className="font-display text-2xl tracking-wide">Cuadro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo lectura. El organizador genera los emparejamientos y marca los ganadores.
          </p>
          <div className="mt-4 rounded-none border-2 border-fiesta-ink/15 bg-white/60 p-3 sm:p-4">
            <BracketView matches={championship.matches} />
          </div>
        </section>
      </div>
    </div>
  );
}
