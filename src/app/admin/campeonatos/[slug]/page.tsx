import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entryLabel } from "@/lib/bracket";
import { entryTypeLabel, statusLabel } from "@/lib/championships";
import { BracketView } from "@/components/bracket-view";
import { ManualBracketForm } from "@/components/manual-bracket-form";
import {
  AdminEntryRow,
  ClearBracketButton,
  GenerateBracketButton,
  OrganizerEditor,
  ToggleRegistrationButton,
} from "@/components/admin-championship-actions";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function AdminChampionshipDetailPage({ params }: Props) {
  if (!(await isAdminAuthenticated())) redirect("/admin");

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

  const hasResults = championship.matches.some((m) => m.winnerId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/admin/campeonatos"
        className="text-sm font-semibold uppercase tracking-wide text-fiesta-magenta"
      >
        ← Todos
      </Link>
      <h1 className="mt-2 font-display text-3xl tracking-wide">{championship.name}</h1>
      <p className="text-muted-foreground">
        {entryTypeLabel(championship.entryType)} · {statusLabel(championship.status)}
      </p>

      <div className="mt-4 max-w-xl">
        <OrganizerEditor
          championshipId={championship.id}
          organizer={championship.organizer}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-start gap-3">
        <ToggleRegistrationButton
          championshipId={championship.id}
          open={championship.registrationOpen}
        />
        <GenerateBracketButton
          championshipId={championship.id}
          hasMatches={championship.matches.length > 0}
          hasResults={hasResults}
        />
        <ClearBracketButton
          championshipId={championship.id}
          hasMatches={championship.matches.length > 0}
        />
        <Badge variant="outline">
          {championship.registrationOpen ? "Inscripciones abiertas" : "Inscripciones cerradas"}
        </Badge>
      </div>

      <div className="mt-6">
        <ManualBracketForm
          championshipId={championship.id}
          entries={championship.entries}
          hasMatches={championship.matches.length > 0}
          hasResults={hasResults}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl tracking-wide">Inscritos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {championship.entries.map((e) => (
              <AdminEntryRow
                key={e.id}
                entryId={e.id}
                label={entryLabel(e)}
              />
            ))}
          </ul>
          {championship.entries.length === 0 && (
            <p className="mt-2 text-muted-foreground">Sin inscritos todavía.</p>
          )}
        </section>

        <section>
          <h2 className="font-display text-xl tracking-wide">Cuadro (admin)</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Marca el ganador de cada partido para avanzar rondas.
          </p>
          <div className="mt-4">
            <BracketView matches={championship.matches} admin />
          </div>
        </section>
      </div>
    </div>
  );
}
