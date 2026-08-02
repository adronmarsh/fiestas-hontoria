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
      entryType: entryType as "individual" | "pareja" | "trio",
    },
  });

  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return { ok: true, message: "Campeonato creado" };
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
    return { ok: false, error: "No se puede borrar: ya hay cuadro generado" };
  }

  await prisma.entry.delete({ where: { id: entryId } });
  revalidatePath(`/campeonatos/${entry.championship.slug}`);
  revalidatePath(`/admin/campeonatos/${entry.championship.slug}`);
  return { ok: true };
}

export async function generateBracket(championshipId: string): Promise<ActionResult> {
  await requireAdmin();
  const championship = await prisma.championship.findUnique({
    where: { id: championshipId },
    include: { entries: true, matches: true },
  });
  if (!championship) return { ok: false, error: "No encontrado" };
  if (championship.entries.length < 2) {
    return { ok: false, error: "Se necesitan al menos 2 inscritos" };
  }

  const hasResults = championship.matches.some((m) => m.winnerId);
  if (championship.matches.length > 0 && hasResults) {
    // Allow regenerate only via explicit wipe — handled by regenerateBracket
    return {
      ok: false,
      error: "Ya hay resultados. Usa «Regenerar cuadro» para borrar y crear de nuevo",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { championshipId } });
    const seeds = buildBracketSeeds(championship.entries.map((e) => e.id));
    const idByKey = new Map<string, string>();

    // Create matches without nextMatchId first
    for (const seed of seeds) {
      const created = await tx.match.create({
        data: {
          championshipId,
          round: seed.round,
          position: seed.position,
          entryAId: seed.entryAId,
          entryBId: seed.entryBId,
          winnerId: seed.winnerId,
        },
      });
      idByKey.set(seed.key, created.id);
    }

    for (const seed of seeds) {
      if (!seed.nextKey) continue;
      const id = idByKey.get(seed.key);
      const nextId = idByKey.get(seed.nextKey);
      if (id && nextId) {
        await tx.match.update({
          where: { id },
          data: { nextMatchId: nextId },
        });
      }
    }

    // Place bye winners into next match slots again (IDs already set on seeds)
    for (const seed of seeds) {
      if (!seed.winnerId || !seed.nextKey) continue;
      const nextId = idByKey.get(seed.nextKey)!;
      const next = await tx.match.findUnique({ where: { id: nextId } });
      if (!next) continue;
      const slotIsA = seed.position % 2 === 0;
      await tx.match.update({
        where: { id: nextId },
        data: slotIsA
          ? { entryAId: next.entryAId ?? seed.winnerId }
          : { entryBId: next.entryBId ?? seed.winnerId },
      });
    }

    await tx.championship.update({
      where: { id: championshipId },
      data: { status: "bracket", registrationOpen: false },
    });
  });

  revalidatePath(`/campeonatos/${championship.slug}`);
  revalidatePath(`/admin/campeonatos/${championship.slug}`);
  revalidatePath("/admin/campeonatos");
  revalidatePath("/campeonatos");
  return { ok: true, message: "Cuadro generado" };
}

export async function regenerateBracket(championshipId: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.match.deleteMany({ where: { championshipId } });
  await prisma.championship.update({
    where: { id: championshipId },
    data: { status: "open" },
  });
  return generateBracket(championshipId);
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
        // Determine slot from position in current round
        const slotIsA = match.position % 2 === 0;
        await tx.match.update({
          where: { id: match.nextMatchId },
          data: slotIsA ? { entryAId: winnerId } : { entryBId: winnerId },
        });
      }
    } else {
      // Final match — championship finished
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
