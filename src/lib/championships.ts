import type { EntryType, PairingMode } from "@prisma/client";

export function entryTypeLabel(type: EntryType): string {
  switch (type) {
    case "individual":
      return "Individual";
    case "pareja":
      return "Por parejas";
    case "trio":
      return "Por tríos";
  }
}

export function pairingModeLabel(mode: PairingMode): string {
  switch (mode) {
    case "as_registered":
      return "Según inscripción";
    case "random_pairs":
      return "Parejas aleatorias al generar cuadro";
  }
}

/** Texto corto para ficha pública, p. ej. "10 agosto · 18:30" o "10–13 agosto". */
export function championshipDatesLabel(
  startDay: number | null | undefined,
  endDay: number | null | undefined,
  startTime?: string | null
): string | null {
  if (!startDay && !endDay && !startTime) return null;
  let datePart: string | null = null;
  if (startDay && endDay && startDay !== endDay) {
    datePart = `${startDay}–${endDay} agosto`;
  } else if (startDay || endDay) {
    datePart = `${startDay ?? endDay} agosto`;
  }
  const timePart = startTime?.trim() || null;
  if (datePart && timePart) return `${datePart} · ${timePart}`;
  return datePart ?? (timePart ? `A las ${timePart}` : null);
}

export function requiredPlayers(type: EntryType): number {
  switch (type) {
    case "individual":
      return 1;
    case "pareja":
      return 2;
    case "trio":
      return 3;
  }
}

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function statusLabel(status: string): string {
  switch (status) {
    case "open":
      return "Inscripciones abiertas";
    case "bracket":
      return "Cuadro en juego";
    case "finished":
      return "Finalizado";
    default:
      return status;
  }
}
