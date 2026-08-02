import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { entryTypeLabel, statusLabel } from "@/lib/championships";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Campeonatos",
  description: "Inscripción y cuadros de los campeonatos de las fiestas 2026.",
};

export const dynamic = "force-dynamic";

export default async function CampeonatosPage() {
  const championships = await prisma.championship.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { entries: true } } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-brush text-5xl text-fiesta-magenta sm:text-6xl">
        Campeonatos
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Apúntate escribiendo tu nombre. Los emparejamientos los genera el organizador.
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {championships.map((c) => (
          <li key={c.id}>
            <Link
              href={`/campeonatos/${c.slug}`}
              className="block border-4 border-fiesta-ink bg-white p-5 transition hover:-translate-y-0.5 hover:border-fiesta-magenta"
            >
              <h2 className="font-display text-2xl tracking-wide">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {entryTypeLabel(c.entryType)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{statusLabel(c.status)}</Badge>
                <Badge className="bg-fiesta-cyan text-fiesta-ink">
                  {c._count.entries} inscritos
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {championships.length === 0 && (
        <p className="mt-8 text-muted-foreground">
          Aún no hay campeonatos. El organizador los creará desde el panel admin.
        </p>
      )}
    </div>
  );
}
