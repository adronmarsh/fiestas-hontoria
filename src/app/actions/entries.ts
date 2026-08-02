"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requiredPlayers } from "@/lib/championships";

const entrySchema = z.object({
  championshipId: z.string().min(1),
  player1: z.string().trim().min(1, "Nombre obligatorio").max(80),
  player2: z.string().trim().max(80).optional(),
  player3: z.string().trim().max(80).optional(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerEntry(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = entrySchema.safeParse({
    championshipId: formData.get("championshipId"),
    player1: formData.get("player1"),
    player2: formData.get("player2") || undefined,
    player3: formData.get("player3") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  const championship = await prisma.championship.findUnique({
    where: { id: parsed.data.championshipId },
  });

  if (!championship) return { ok: false, error: "Campeonato no encontrado" };
  if (!championship.registrationOpen) {
    return { ok: false, error: "Las inscripciones están cerradas" };
  }

  const need = requiredPlayers(championship.entryType);
  if (need >= 2 && !parsed.data.player2?.trim()) {
    return { ok: false, error: "Falta el segundo nombre" };
  }
  if (need >= 3 && !parsed.data.player3?.trim()) {
    return { ok: false, error: "Falta el tercer nombre" };
  }

  await prisma.entry.create({
    data: {
      championshipId: championship.id,
      player1: parsed.data.player1.trim(),
      player2: need >= 2 ? parsed.data.player2!.trim() : null,
      player3: need >= 3 ? parsed.data.player3!.trim() : null,
    },
  });

  revalidatePath(`/campeonatos/${championship.slug}`);
  revalidatePath("/campeonatos");
  revalidatePath("/admin/campeonatos");
  return { ok: true };
}
