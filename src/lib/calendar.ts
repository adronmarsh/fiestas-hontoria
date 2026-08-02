import { entryLabel } from "@/lib/bracket";
import {
  dayKey,
  dayNumberMadrid,
  formatTimeOnly,
  weekdayLongMadrid,
} from "@/lib/datetime";
import { PROGRAMA } from "@/lib/programa";

export type CalendarItem = {
  id: string;
  sortKey: number;
  dayKey: string;
  weekday: string;
  dayNumber: string;
  timeLabel: string | null;
  title: string;
  note?: string;
  kind: "programa" | "campeonato";
  href?: string;
  /** Nombres de jugadores para filtrar (solo enfrentamientos) */
  playerNames?: string[];
};

type MatchForCalendar = {
  id: string;
  scheduledAt: Date;
  championship: { name: string; slug: string };
  entryA: { player1: string; player2: string | null; player3: string | null } | null;
  entryB: { player1: string; player2: string | null; player3: string | null } | null;
};

function parseProgramaTime(dayNumber: string, time?: string): { sortKey: number; timeLabel: string | null } {
  const day = Number(dayNumber);
  if (!time) {
    return {
      sortKey: Date.UTC(2026, 7, day, 12, 0),
      timeLabel: null,
    };
  }

  const start = time.split("–")[0]?.trim() ?? time;
  const [hStr, mStr] = start.split(":");
  let h = Number(hStr);
  const m = Number(mStr ?? "0");
  if (Number.isNaN(h)) h = 12;

  return {
    sortKey: Date.UTC(2026, 7, day, h, Number.isNaN(m) ? 0 : m),
    timeLabel: time,
  };
}

export function buildProgramaCalendarItems(): CalendarItem[] {
  const items: CalendarItem[] = [];
  for (const day of PROGRAMA) {
    for (const ev of day.events) {
      const { sortKey, timeLabel } = parseProgramaTime(day.dayNumber, ev.time);
      items.push({
        id: `programa-${day.id}-${ev.title}`,
        sortKey,
        dayKey: `2026-08-${day.dayNumber.padStart(2, "0")}`,
        weekday: day.weekday,
        dayNumber: day.dayNumber,
        timeLabel,
        title: ev.title,
        note: ev.note,
        kind: "programa",
      });
    }
  }
  return items;
}

export function buildMatchCalendarItems(matches: MatchForCalendar[]): CalendarItem[] {
  return matches.map((match) => {
    const d = new Date(match.scheduledAt);
    const a = match.entryA ? entryLabel(match.entryA) : "Por determinar";
    const b = match.entryB ? entryLabel(match.entryB) : "Por determinar";
    const playerNames = [
      match.entryA?.player1,
      match.entryA?.player2,
      match.entryA?.player3,
      match.entryB?.player1,
      match.entryB?.player2,
      match.entryB?.player3,
    ].filter((n): n is string => Boolean(n));

    return {
      id: `match-${match.id}`,
      sortKey: d.getTime(),
      dayKey: dayKey(d),
      weekday: weekdayLongMadrid(d),
      dayNumber: dayNumberMadrid(d),
      timeLabel: formatTimeOnly(d),
      title: `${match.championship.name}: ${a} vs ${b}`,
      note: "Campeonato · eliminatoria",
      kind: "campeonato" as const,
      href: `/campeonatos/${match.championship.slug}`,
      playerNames,
    };
  });
}

export function groupCalendarByDay(items: CalendarItem[]): {
  dayKey: string;
  weekday: string;
  dayNumber: string;
  items: CalendarItem[];
}[] {
  const sorted = [...items].sort((a, b) => a.sortKey - b.sortKey);
  const map = new Map<string, CalendarItem[]>();
  for (const item of sorted) {
    const list = map.get(item.dayKey) ?? [];
    list.push(item);
    map.set(item.dayKey, list);
  }

  return [...map.entries()].map(([key, dayItems]) => ({
    dayKey: key,
    weekday: dayItems[0].weekday,
    dayNumber: dayItems[0].dayNumber,
    items: dayItems,
  }));
}
