const TZ = "Europe/Madrid";

/** Format for datetime-local input (Europe/Madrid wall clock). */
export function toDatetimeLocalValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

/** Parse datetime-local value as Europe/Madrid (CEST in agosto: +02:00). */
export function fromDatetimeLocalValue(value: string): Date | null {
  if (!value.trim()) return null;
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  // Fiestas en agosto → horario de verano (CEST)
  const result = new Date(`${datePart}T${timePart}:00+02:00`);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** Short label: "vie 8 · 18:30" */
export function formatMatchSchedule(date: Date | string | null | undefined): string | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const weekday = d
    .toLocaleDateString("es-ES", { weekday: "short", timeZone: TZ })
    .replace(".", "");
  const day = d.toLocaleDateString("es-ES", { day: "numeric", timeZone: TZ });
  const time = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
  return `${weekday} ${day} · ${time}`;
}

export function formatTimeOnly(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
}

export function dayKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

export function weekdayLongMadrid(date: Date): string {
  const weekday = date.toLocaleDateString("es-ES", {
    weekday: "long",
    timeZone: TZ,
  });
  return weekday.charAt(0).toUpperCase() + weekday.slice(1);
}

export function dayNumberMadrid(date: Date): string {
  return date.toLocaleDateString("es-ES", { day: "numeric", timeZone: TZ });
}
