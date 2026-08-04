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
import { formRandomPairs } from "@/lib/pairing";
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
  let entryType = String(formData.get("entryType") ?? "");
  const pairingModeRaw = String(formData.get("pairingMode") ?? "as_registered");
  const pairingMode =
    pairingModeRaw === "random_pairs" ? "random_pairs" : "as_registered";
  const startDayRaw = String(formData.get("startDay") ?? "").trim();
  const endDayRaw = String(formData.get("endDay") ?? "").trim();
  const startTimeRaw = String(formData.get("startTime") ?? "").trim();
  const startDay = startDayRaw ? Number(startDayRaw) : null;
  const endDay = endDayRaw ? Number(endDayRaw) : null;
  const startTime = startTimeRaw || null;

  if (!name) return { ok: false, error: "Nombre obligatorio" };
  if (pairingMode === "random_pairs") {
    entryType = "individual";
  }
  if (!["individual", "pareja", "trio"].includes(entryType)) {
    return { ok: false, error: "Modalidad inválida" };
  }
  if (
    (startDay !== null && (Number.isNaN(startDay) || startDay < 1 || startDay > 31)) ||
    (endDay !== null && (Number.isNaN(endDay) || endDay < 1 || endDay > 31))
  ) {
    return { ok: false, error: "Días de agosto inválidos (1–31)" };
  }
  if (startTime && !/^\d{1,2}:\d{2}$/.test(startTime)) {
    return { ok: false, error: "Hora inválida (usa HH:mm)" };
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
      pairingMode,
      startDay,
      endDay,
      startTime,
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
    await clearTeamEntries(entry.championshipId);
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
  await clearTeamEntries(championshipId);
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

async function clearTeamEntries(championshipId: string) {
  await prisma.entry.deleteMany({
    where: { championshipId, kind: "team" },
  });
}

async function materializePairTeams(
  championshipId: string,
  registrationEntries: { id: string; player1: string }[],
  randomize: boolean
): Promise<string[]> {
  await clearTeamEntries(championshipId);

  const pairs = formRandomPairs(registrationEntries, { randomize });
  if (pairs.length < 2) {
    throw new Error("NEED_MORE_PAIRS");
  }

  const createdIds: string[] = [];
  for (const p of pairs) {
    const row = await prisma.entry.create({
      data: {
        championshipId,
        kind: "team",
        player1: p.player1,
        player2: p.player2,
      },
    });
    createdIds.push(row.id);
  }
  return createdIds;
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

  const registrations = championship.entries.filter((e) => e.kind === "registration");

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

  try {
    if (championship.pairingMode === "random_pairs") {
      if (registrations.length < 3) {
        return {
          ok: false,
          error: "Se necesitan al menos 3 inscritos para formar parejas y un cuadro",
        };
      }

      let orderedRegs = registrations;
      if (mode === "manual") {
        const order = options.entryOrder ?? [];
        const validIds = new Set(registrations.map((e) => e.id));
        if (order.length !== registrations.length) {
          return {
            ok: false,
            error: "El orden manual debe incluir a todos los inscritos",
          };
        }
        if (!order.every((id) => validIds.has(id))) {
          return { ok: false, error: "Hay inscritos inválidos en el orden manual" };
        }
        const byId = new Map(registrations.map((e) => [e.id, e]));
        orderedRegs = order.map((id) => byId.get(id)!);
      }

      await clearMatches(championshipId);
      const teamIds = await materializePairTeams(
        championshipId,
        orderedRegs.map((e) => ({ id: e.id, player1: e.player1 })),
        mode === "random"
      );
      // Parejas ya ordenadas/aleatorias: no re-barajar el cuadro
      await persistBracket(championshipId, teamIds, false);
    } else {
      if (registrations.length < 2) {
        return { ok: false, error: "Se necesitan al menos 2 inscritos" };
      }

      let entryIds: string[];
      if (mode === "manual") {
        const order = options.entryOrder ?? [];
        const validIds = new Set(registrations.map((e) => e.id));
        if (order.length !== registrations.length) {
          return {
            ok: false,
            error: "El orden manual debe incluir a todos los inscritos",
          };
        }
        if (!order.every((id) => validIds.has(id))) {
          return { ok: false, error: "Hay inscritos inválidos en el orden manual" };
        }
        entryIds = order;
      } else {
        entryIds = registrations.map((e) => e.id);
      }

      await persistBracket(championshipId, entryIds, mode === "random");
    }
  } catch (e) {
    console.error("persistBracket failed", e);
    if (e instanceof Error && e.message === "NEED_MORE_PAIRS") {
      return {
        ok: false,
        error: "No hay suficientes parejas para generar el cuadro",
      };
    }
    return { ok: false, error: "No se pudo generar el cuadro. Inténtalo de nuevo." };
  }

  revalidatePath(`/campeonatos/${championship.slug}`);
  revalidatePath(`/admin/campeonatos/${championship.slug}`);
  revalidatePath("/admin/campeonatos");
  revalidatePath("/campeonatos");
  return {
    ok: true,
    message:
      championship.pairingMode === "random_pairs"
        ? mode === "manual"
          ? "Parejas formadas y cuadro generado"
          : "Parejas aleatorias y cuadro generados"
        : mode === "manual"
          ? "Cuadro manual generado"
          : "Cuadro aleatorio generado",
  };
}

export async function regenerateBracket(
  championshipId: string,
  options: { mode?: "random" | "manual"; entryOrder?: string[] } = {}
): Promise<ActionResult> {
  await requireAdmin();
  await clearMatches(championshipId);
  await clearTeamEntries(championshipId);
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
