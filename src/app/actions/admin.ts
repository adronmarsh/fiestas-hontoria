"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
  verifyAdminPassword,
} from "@/lib/auth";
import { buildBracketSeeds } from "@/lib/bracket";
import { slugify } from "@/lib/championships";
import { prisma } from "@/lib/prisma";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function loginAdmin(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (!verifyAdminPassword(password)) {
    return { ok: false, error: "Contraseña incorrecta" };
  }
  await createAdminSession();
  redirect("/admin/campeonatos");
}

export async function logoutAdmin() {
  await destroyAdminSession();
  redirect("/admin");
}

export async function createChampionship(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const organizer = String(formData.get("organizer") ?? "").trim();
  const entryType = String(formData.get("entryType") ?? "");
  if (!name) return { ok: false, error: "Nombre obligatorio" };
  if (!["individual", "pareja", "trio"].includes(entryType)) {
    return { ok: false, error: "Modalidad inválida" };
  }

  let slug = slugify(name);
  if (!slug) slug = `campeonato-${Date.now()}`;

  const exists = await prisma.championship.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  await prisma.championship.create({
    data: {
      name,
      slug,
      organizer: organizer || null,
      entryType: entryType as "individual" | "pareja" | "trio",
    },
  });

  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return { ok: true, message: "Campeonato creado" };
}

export async function updateChampionshipOrganizer(
  championshipId: string,
  organizer: string
): Promise<ActionResult> {
  await requireAdmin();
  const trimmed = organizer.trim();
  const value = trimmed.length > 0 ? trimmed : null;

  const c = await prisma.championship.update({
    where: { id: championshipId },
    data: { organizer: value },
  });

  revalidatePath(`/campeonatos/${c.slug}`);
  revalidatePath(`/admin/campeonatos/${c.slug}`);
  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return {
    ok: true,
    message: value ? "Organizador actualizado" : "Organizador borrado",
  };
}

export async function toggleRegistration(championshipId: string): Promise<ActionResult> {
  await requireAdmin();
  const c = await prisma.championship.findUnique({ where: { id: championshipId } });
  if (!c) return { ok: false, error: "No encontrado" };

  await prisma.championship.update({
    where: { id: championshipId },
    data: { registrationOpen: !c.registrationOpen },
  });

  revalidatePath(`/campeonatos/${c.slug}`);
  revalidatePath("/admin/campeonatos");
  revalidatePath(`/admin/campeonatos/${c.slug}`);
  return { ok: true };
}

export async function deleteEntry(entryId: string): Promise<ActionResult> {
  await requireAdmin();
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { championship: true },
  });
  if (!entry) return { ok: false, error: "Inscrito no encontrado" };

  const hasMatches = await prisma.match.count({
    where: { championshipId: entry.championshipId },
  });

  if (hasMatches > 0) {
    await clearMatches(entry.championshipId);
    await prisma.championship.update({
      where: { id: entry.championshipId },
      data: { status: "open" },
    });
  }
  await prisma.entry.delete({ where: { id: entryId } });

  revalidatePath(`/campeonatos/${entry.championship.slug}`);
  revalidatePath(`/admin/campeonatos/${entry.championship.slug}`);
  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return {
    ok: true,
    message: hasMatches > 0 ? "Inscrito borrado y cuadro vaciado" : "Inscrito borrado",
  };
}

export async function clearBracket(championshipId: string): Promise<ActionResult> {
  await requireAdmin();
  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
  });
  if (!championship) return { ok: false, error: "No encontrado" };

  await clearMatches(championshipId);
  await prisma.championship.update({
    where: { id: championshipId },
    data: { status: "open" },
  });

  revalidatePath(`/campeonatos/${championship.slug}`);
  revalidatePath(`/admin/campeonatos/${championship.slug}`);
  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return { ok: true, message: "Cuadro borrado" };
}

async function clearMatches(championshipId: string) {
  // Neon pooled connections need nextMatchId cleared before deleteMany
  await prisma.match.updateMany({
    where: { championshipId },
    data: { nextMatchId: null },
  });
  await prisma.match.deleteMany({ where: { championshipId } });
}

async function persistBracket(
  championshipId: string,
  entryIds: string[],
  randomize: boolean
) {
  const seeds = buildBracketSeeds(entryIds, { randomize });

  await clearMatches(championshipId);

  const created = await prisma.match.createManyAndReturn({
    data: seeds.map((seed) => ({
      championshipId,
      round: seed.round,
      position: seed.position,
      entryAId: seed.entryAId,
      entryBId: seed.entryBId,
      winnerId: seed.winnerId,
    })),
  });

  const idByKey = new Map<string, string>();
  for (const seed of seeds) {
    const row = created.find(
      (m) => m.round === seed.round && m.position === seed.position
    );
    if (row) idByKey.set(seed.key, row.id);
  }

  await Promise.all(
    seeds
      .filter((seed) => seed.nextKey)
      .map((seed) => {
        const id = idByKey.get(seed.key);
        const nextId = idByKey.get(seed.nextKey!);
        if (!id || !nextId) return Promise.resolve();
        return prisma.match.update({
          where: { id },
          data: { nextMatchId: nextId },
        });
      })
  );

  // Bye winners already live in seed.entryA/B of later rounds via createManyAndReturn
  await prisma.championship.update({
    where: { id: championshipId },
    data: { status: "bracket", registrationOpen: false },
  });
}

export async function generateBracket(
  championshipId: string,
  options: { mode?: "random" | "manual"; entryOrder?: string[] } = {}
): Promise<ActionResult> {
  await requireAdmin();
  const mode = options.mode ?? "random";

  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
    include: { entries: true, matches: true },
  });
  if (!championship) return { ok: false, error: "No encontrado" };
  if (championship.entries.length < 2) {
    return { ok: false, error: "Se necesitan al menos 2 inscritos" };
  }

  // winnerId en byes no cuenta como resultado jugado
  const hasPlayedResults = championship.matches.some(
    (m) => m.winnerId && m.entryAId && m.entryBId
  );
  if (championship.matches.length > 0 && hasPlayedResults) {
    return {
      ok: false,
      error: "Ya hay resultados. Usa «Regenerar» para borrar y crear de nuevo",
    };
  }

  let entryIds: string[];
  if (mode === "manual") {
    const order = options.entryOrder ?? [];
    const validIds = new Set(championship.entries.map((e) => e.id));
    if (order.length !== championship.entries.length) {
      return { ok: false, error: "El orden manual debe incluir a todos los inscritos" };
    }
    if (!order.every((id) => validIds.has(id))) {
      return { ok: false, error: "Hay inscritos inválidos en el orden manual" };
    }
    entryIds = order;
  } else {
    entryIds = championship.entries.map((e) => e.id);
  }

  try {
    await persistBracket(championshipId, entryIds, mode === "random");
  } catch (e) {
    console.error("persistBracket failed", e);
    return { ok: false, error: "No se pudo generar el cuadro. Inténtalo de nuevo." };
  }

  revalidatePath(`/campeonatos/${championship.slug}`);
  revalidatePath(`/admin/campeonatos/${championship.slug}`);
  revalidatePath("/admin/campeonatos");
  revalidatePath("/campeonatos");
  return {
    ok: true,
    message: mode === "manual" ? "Cuadro manual generado" : "Cuadro aleatorio generado",
  };
}

export async function regenerateBracket(
  championshipId: string,
  options: { mode?: "random" | "manual"; entryOrder?: string[] } = {}
): Promise<ActionResult> {
  await requireAdmin();
  await clearMatches(championshipId);
  await prisma.championship.update({
    where: { id: championshipId },
    data: { status: "open" },
  });
  return generateBracket(championshipId, options);
}

export async function setMatchWinner(
  matchId: string,
  winnerId: string
): Promise<ActionResult> {
  await requireAdmin();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { championship: true },
  });
  if (!match) return { ok: false, error: "Partido no encontrado" };

  const valid =
    winnerId === match.entryAId || winnerId === match.entryBId;
  if (!valid) return { ok: false, error: "Ganador inválido" };

  await prisma.$transaction(async (tx) => {
    await tx.match.update({
      where: { id: matchId },
      data: { winnerId },
    });

    if (match.nextMatchId) {
      const next = await tx.match.findUnique({ where: { id: match.nextMatchId } });
      if (next) {
        const slotIsA = match.position % 2 === 0;
        await tx.match.update({
          where: { id: match.nextMatchId },
          data: slotIsA ? { entryAId: winnerId } : { entryBId: winnerId },
        });
      }
    } else {
      await tx.championship.update({
        where: { id: match.championshipId },
        data: { status: "finished" },
      });
    }
  });

  revalidatePath(`/campeonatos/${match.championship.slug}`);
  revalidatePath(`/admin/campeonatos/${match.championship.slug}`);
  revalidatePath("/campeonatos");
  return { ok: true };
}

export async function updateMatchSchedule(
  matchId: string,
  scheduledAtIso: string | null
): Promise<ActionResult> {
  await requireAdmin();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { championship: true },
  });
  if (!match) return { ok: false, error: "Partido no encontrado" };

  let scheduledAt: Date | null = null;
  if (scheduledAtIso && scheduledAtIso.trim()) {
    const parsed = new Date(scheduledAtIso);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "Fecha u hora inválida" };
    }
    scheduledAt = parsed;
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { scheduledAt },
  });

  revalidatePath(`/campeonatos/${match.championship.slug}`);
  revalidatePath(`/admin/campeonatos/${match.championship.slug}`);
  revalidatePath("/campeonatos");
  return { ok: true, message: "Horario actualizado" };
}

export async function deleteChampionship(championshipId: string): Promise<ActionResult> {
  await requireAdmin();
  const c = await prisma.championship.findUnique({ where: { id: championshipId } });
  if (!c) return { ok: false, error: "No encontrado" };
  await prisma.championship.delete({ where: { id: championshipId } });
  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return { ok: true };
}
