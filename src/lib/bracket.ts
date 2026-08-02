import type { Entry } from "@prisma/client";

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function nextPowerOfTwo(n: number): number {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export function entryLabel(entry: Pick<Entry, "player1" | "player2" | "player3">): string {
  return [entry.player1, entry.player2, entry.player3].filter(Boolean).join(" / ");
}

export type BracketMatchSeed = {
  round: number;
  position: number;
  entryAId: string | null;
  entryBId: string | null;
  winnerId: string | null;
  /** Temporary key to wire nextMatch after insert */
  key: string;
  nextKey: string | null;
};

/**
 * Builds a single-elimination bracket.
 * Odd count gets a bye (auto-advance as winner with no opponent).
 */
export function buildBracketSeeds(entryIds: string[]): BracketMatchSeed[] {
  if (entryIds.length < 2) {
    throw new Error("Se necesitan al menos 2 inscritos para generar el cuadro");
  }

  const shuffled = shuffle(entryIds);
  const size = nextPowerOfTwo(shuffled.length);
  const byes = size - shuffled.length;
  const rounds = Math.log2(size);
  const seeds: BracketMatchSeed[] = [];

  // Round 1 slots: fill with entries + byes
  const r1Slots: (string | null)[] = [...shuffled];
  for (let i = 0; i < byes; i++) r1Slots.push(null);

  const r1Count = size / 2;
  for (let pos = 0; pos < r1Count; pos++) {
    const a = r1Slots[pos * 2] ?? null;
    const b = r1Slots[pos * 2 + 1] ?? null;
    const isBye = (a === null) !== (b === null);
    const winnerId = isBye ? (a ?? b) : null;
    const nextRound = rounds > 1 ? 2 : null;
    const nextPos = Math.floor(pos / 2);
    seeds.push({
      round: 1,
      position: pos,
      entryAId: a,
      entryBId: b,
      winnerId,
      key: `1-${pos}`,
      nextKey: nextRound ? `${nextRound}-${nextPos}` : null,
    });
  }

  for (let round = 2; round <= rounds; round++) {
    const count = size / Math.pow(2, round);
    for (let pos = 0; pos < count; pos++) {
      const nextRound = round < rounds ? round + 1 : null;
      const nextPos = Math.floor(pos / 2);
      seeds.push({
        round,
        position: pos,
        entryAId: null,
        entryBId: null,
        winnerId: null,
        key: `${round}-${pos}`,
        nextKey: nextRound ? `${nextRound}-${nextPos}` : null,
      });
    }
  }

  // Advance bye winners into next round slots
  for (const seed of seeds) {
    if (seed.round !== 1 || !seed.winnerId || !seed.nextKey) continue;
    const next = seeds.find((s) => s.key === seed.nextKey);
    if (!next) continue;
    const slotIsA = seed.position % 2 === 0;
    if (slotIsA) next.entryAId = seed.winnerId;
    else next.entryBId = seed.winnerId;
  }

  return seeds;
}

export function roundLabel(round: number, totalRounds: number): string {
  const fromEnd = totalRounds - round;
  if (fromEnd === 0) return "Final";
  if (fromEnd === 1) return "Semifinales";
  if (fromEnd === 2) return "Cuartos";
  if (round === 1) return "Octavos / 1ª ronda";
  return `Ronda ${round}`;
}
