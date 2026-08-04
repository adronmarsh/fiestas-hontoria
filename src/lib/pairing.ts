import { shuffle } from "@/lib/bracket";

export type PairablePlayer = {
  id: string;
  player1: string;
};

export type FormedPair = {
  player1: string;
  player2: string | null;
  /** Inscripción(es) de origen */
  sourceIds: string[];
};

/**
 * Forma parejas a partir de inscritos individuales.
 * Si el número es impar, el último se queda sin pareja (player2 = null).
 */
export function formRandomPairs(
  players: PairablePlayer[],
  options: { randomize?: boolean } = {}
): FormedPair[] {
  if (players.length === 0) return [];

  const ordered =
    options.randomize === false ? [...players] : shuffle(players);
  const pairs: FormedPair[] = [];

  for (let i = 0; i < ordered.length; i += 2) {
    const a = ordered[i]!;
    const b = ordered[i + 1];
    if (b) {
      pairs.push({
        player1: a.player1,
        player2: b.player1,
        sourceIds: [a.id, b.id],
      });
    } else {
      pairs.push({
        player1: a.player1,
        player2: null,
        sourceIds: [a.id],
      });
    }
  }

  return pairs;
}
