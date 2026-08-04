import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entryTypeLabel, statusLabel } from "@/lib/championships";
import { CreateChampionshipForm } from "@/components/create-championship-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminChampionshipsPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin");

  const championships = await prisma.championship.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          entries: { where: { kind: "registration" } },
          matches: true,
        },
      },
    },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-3xl tracking-wide">Gestionar campeonatos</h1>
      <p className="mt-2 text-muted-foreground">
        Crea campeonatos, cierra listas, genera cuadros aleatorios y marca ganadores.
      </p>

      <div className="mt-8">
        <CreateChampionshipForm />
      </div>

      <ul className="mt-8 flex flex-col gap-3">
        {championships.map((c) => (
          <li key={c.id}>
            <Link
              href={`/admin/campeonatos/${c.slug}`}
              className="flex flex-wrap items-center justify-between gap-3 border-2 border-fiesta-ink bg-white px-4 py-3 hover:border-fiesta-magenta"
            >
              <div>
                <p className="font-display text-xl tracking-wide">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.pairingMode === "random_pairs"
                    ? "Individual → parejas al azar"
                    : entryTypeLabel(c.entryType)}
                  {c.organizer ? ` · Org: ${c.organizer}` : ""} ·{" "}
                  {c._count.entries} inscritos · {c._count.matches} partidos
                </p>
              </div>
              <Badge variant="outline">{statusLabel(c.status)}</Badge>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
