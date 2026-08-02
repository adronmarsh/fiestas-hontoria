import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { entryTypeLabel, statusLabel } from "@/lib/championships";
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
            {championship.name}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {entryTypeLabel(championship.entryType)} · eliminatorias
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline">{statusLabel(championship.status)}</Badge>
            <Badge className="bg-fiesta-yellow text-fiesta-ink">
              {championship.entries.length} inscritos
            </Badge>
            {!championship.registrationOpen && (
              <Badge variant="secondary">Inscripciones cerradas</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
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
          {championship.entries.length === 0 ? (
            <p className="mt-2 text-muted-foreground">Todavía no hay nadie apuntado.</p>
          ) : (
            <ol className="mt-3 flex flex-col gap-2">
              {championship.entries.map((e, i) => (
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

        <section>
          <h2 className="font-display text-2xl tracking-wide">Cuadro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Solo lectura. El organizador genera los emparejamientos y marca los ganadores.
          </p>
          <div className="mt-4">
            <BracketView matches={championship.matches} />
          </div>
        </section>
      </div>
    </div>
  );
}
