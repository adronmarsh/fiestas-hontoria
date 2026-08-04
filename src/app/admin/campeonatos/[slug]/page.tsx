import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entryLabel } from "@/lib/bracket";
import {
  championshipDatesLabel,
  entryTypeLabel,
  pairingModeLabel,
  statusLabel,
} from "@/lib/championships";
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

  const registrations = championship.entries.filter((e) => e.kind === "registration");
  const teams = championship.entries.filter((e) => e.kind === "team");
  const hasResults = championship.matches.some(
    (m) => m.winnerId && m.entryAId && m.entryBId
  );
  const dates = championshipDatesLabel(championship.startDay, championship.endDay);

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
        {entryTypeLabel(championship.entryType)}
        {championship.pairingMode === "random_pairs"
          ? ` · ${pairingModeLabel(championship.pairingMode)}`
          : ""}
        {dates ? ` · ${dates}` : ""} · {statusLabel(championship.status)}
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
          pairingMode={championship.pairingMode}
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
          entries={registrations}
          hasMatches={championship.matches.length > 0}
          pairingMode={championship.pairingMode}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,280px)_1fr]">
        <section>
          <h2 className="font-display text-xl tracking-wide">Inscritos</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {registrations.map((e) => (
              <AdminEntryRow key={e.id} entryId={e.id} label={entryLabel(e)} />
            ))}
          </ul>
          {registrations.length === 0 && (
            <p className="mt-2 text-muted-foreground">Sin inscritos todavía.</p>
          )}

          {teams.length > 0 && (
            <div className="mt-8">
              <h3 className="font-display text-lg tracking-wide">Parejas del cuadro</h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {teams.map((t) => (
                  <li key={t.id} className="border-l-4 border-fiesta-yellow bg-white/80 px-2 py-1">
                    {entryLabel(t)}
                    {!t.player2 && (
                      <span className="ml-2 text-xs text-muted-foreground">(sin pareja)</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="min-w-0">
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
